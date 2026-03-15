/**
 * ============================================================
 *  LearnFlow — YouTube Playlist → Course Importer
 * ============================================================
 *  Fetches every video in a YouTube playlist via the Data
 *  API v3, creates one Course document in MongoDB, and creates
 *  one Lesson document per video — all linked together.
 *
 *  Usage:
 *    node scripts/importPlaylistCourses.js
 *
 *  Or via npm shortcut (added to package.json):
 *    npm run import:playlist
 *
 *  Requirements (set in /server/.env):
 *    YOUTUBE_KEY  — YouTube Data API v3 key
 *    MONGO_URI    — MongoDB connection string
 *
 *  Customise:
 *    Edit the PLAYLISTS array below.  Each entry becomes one
 *    Course with N Lessons (one per playlist video).
 * ============================================================
 */

require('dotenv').config();
const axios    = require('axios');
const mongoose = require('mongoose');
const Course   = require('../models/Course');
const Lesson   = require('../models/Lesson');
const User     = require('../models/User');

// ─────────────────────────────────────────────────────────────
// 1.  Playlists to import
//     Replace the playlistId values with any public YouTube
//     playlist IDs you want to import.
// ─────────────────────────────────────────────────────────────
const PLAYLISTS = [
  {
    playlistId:  'PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX', // JS Projects — Brad Traversy
    category:    'Programming',
    level:       'Beginner',
    tags:        ['javascript', 'youtube', 'playlist', 'projects'],
  },
  // Add more playlists here — each becomes its own Course:
  // {
  //   playlistId: 'PL4cUxeGkcC9g0MQZfHwKcndEl9gZys1ZE', // Node.js Crash Course — The Net Ninja
  //   category:   'Backend',
  //   level:      'Intermediate',
  //   tags:       ['nodejs', 'youtube', 'playlist'],
  // },
];

// ─────────────────────────────────────────────────────────────
// 2.  Guard: check required environment variables
// ─────────────────────────────────────────────────────────────
function validateEnv() {
  const key = process.env.YOUTUBE_KEY;
  if (!key || key === 'YOUR_YOUTUBE_API_KEY') {
    throw new Error(
      'YOUTUBE_KEY is not set or is still the placeholder value.\n' +
      '  Update /server/.env:\n' +
      '  YOUTUBE_KEY=AIzaSy_your_real_key_here\n' +
      '  Get a free key at: https://console.cloud.google.com'
    );
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in /server/.env');
  }
}

// ─────────────────────────────────────────────────────────────
// 3.  YouTube helpers
// ─────────────────────────────────────────────────────────────

/**
 * Fetch playlist metadata (title, description, thumbnail) from
 * the "playlists" endpoint.
 */
async function fetchPlaylistMeta(playlistId) {
  const { data } = await axios.get(
    'https://www.googleapis.com/youtube/v3/playlists',
    {
      params: {
        part: 'snippet',
        id:   playlistId,
        key:  process.env.YOUTUBE_KEY,
      },
    }
  );

  if (!data.items || data.items.length === 0) {
    throw new Error(
      `Playlist not found or is private: ${playlistId}\n` +
      '  Make sure the playlist is public and the ID is correct.'
    );
  }

  const snippet    = data.items[0].snippet;
  const thumbnails = snippet.thumbnails || {};
  const thumb      = thumbnails.maxres || thumbnails.high || thumbnails.medium || thumbnails.default;

  return {
    title:       snippet.title       || 'Untitled Playlist',
    description: snippet.description || 'Imported from YouTube playlist.',
    thumbnail:   thumb?.url || `https://img.youtube.com/vi/default/maxresdefault.jpg`,
  };
}

/**
 * Fetch ALL videos from a playlist, handling pagination (nextPageToken).
 * Returns an ordered array of simplified video objects.
 */
async function fetchAllPlaylistItems(playlistId) {
  const items    = [];
  let pageToken  = undefined;

  do {
    const params = {
      part:       'snippet',
      playlistId,
      maxResults: 50,
      key:        process.env.YOUTUBE_KEY,
    };
    if (pageToken) params.pageToken = pageToken;

    const { data } = await axios.get(
      'https://www.googleapis.com/youtube/v3/playlistItems',
      { params }
    );

    for (const item of data.items || []) {
      const s         = item.snippet || {};
      const videoId   = s.resourceId?.videoId;
      const thumbnails = s.thumbnails || {};
      const thumb      = thumbnails.maxres || thumbnails.high || thumbnails.medium || thumbnails.default;

      // Skip deleted / private videos (no videoId)
      if (!videoId) continue;

      items.push({
        videoId,
        title:       s.title       || `Lesson (${videoId})`,
        description: s.description || '',
        thumbnail:   thumb?.url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        position:    s.position ?? items.length,   // 0-based
      });
    }

    pageToken = data.nextPageToken;
    if (pageToken) {
      console.log(`     ↳ fetching next page (${items.length} videos so far)…`);
    }
  } while (pageToken);

  // Sort by playlist position (safest approach after pagination)
  items.sort((a, b) => a.position - b.position);
  return items;
}

// ─────────────────────────────────────────────────────────────
// 4.  Resolve instructor from DB (admin → any user)
// ─────────────────────────────────────────────────────────────
async function resolveInstructor() {
  let user = await User.findOne({ role: 'admin' });
  if (!user) user = await User.findOne();
  if (!user) {
    throw new Error(
      'No users found in the database.\n' +
      '  Run the seed script first:  npm run seed'
    );
  }
  return user;
}

// ─────────────────────────────────────────────────────────────
// 5.  Import a single playlist → Course + Lessons
// ─────────────────────────────────────────────────────────────
async function importPlaylist(config, instructor) {
  const { playlistId, category, level, tags } = config;

  console.log(`\n🎬  Playlist ID : ${playlistId}`);
  console.log(`     Category   : ${category}  |  Level: ${level}`);

  // ── Fetch playlist metadata ─────────────────────────────────
  console.log('     Fetching playlist metadata…');
  const meta = await fetchPlaylistMeta(playlistId);
  console.log(`     Title      : "${meta.title}"`);

  // ── Fetch all videos ────────────────────────────────────────
  console.log('     Fetching playlist videos…');
  const videos        = await fetchAllPlaylistItems(playlistId);
  const totalVideos   = videos.length;
  console.log(`     Found ${totalVideos} video(s)`);

  if (totalVideos === 0) {
    console.warn('⚠️   No public videos found — skipping this playlist.\n');
    return { skipped: true };
  }

  // ── Skip if course with same title already exists ───────────
  const existing = await Course.findOne({ title: meta.title });
  if (existing) {
    console.log(`⏭️   Course already exists (id: ${existing._id}) — skipping.\n`);
    return { skipped: true };
  }

  // ── Create Course document ──────────────────────────────────
  const course = await Course.create({
    title:          meta.title,
    description:    meta.description,
    thumbnail:      meta.thumbnail,
    instructor:     instructor._id,
    instructorName: instructor.name,
    category,
    level,
    tags:           [...new Set(['youtube', 'playlist', ...(tags || [])])],
    isPublished:    true,
    totalLessons:   totalVideos,
    enrolledCount:  0,
    rating:         4.5,
  });

  console.log(`\n✅  Course created: ${meta.title}`);
  console.log(`    _id: ${course._id}`);
  console.log(`\n    Adding ${totalVideos} lesson(s)…`);

  // ── Create Lesson documents ─────────────────────────────────
  let lessonCount = 0;
  for (const video of videos) {
    try {
      await Lesson.create({
        courseId:     course._id,
        title:        video.title,
        description:  video.description,
        order:        video.position + 1,   // 1-based for display
        youtubeId:    video.videoId,
        thumbnailUrl: video.thumbnail,
        duration:     '0:00',               // requires Data API contentDetails; kept light here
        isFree:       video.position === 0, // first lesson is free preview
      });

      lessonCount++;
      console.log(`    [${String(lessonCount).padStart(2, '0')}/${totalVideos}] Lesson added: ${video.title}`);
    } catch (err) {
      console.error(`    ❌ Failed to save lesson "${video.title}": ${err.message}`);
    }
  }

  console.log(`\n    ✅ ${lessonCount}/${totalVideos} lessons saved for "${meta.title}"\n`);
  return { created: true, course, lessonCount };
}

// ─────────────────────────────────────────────────────────────
// 6.  Main entry point
// ─────────────────────────────────────────────────────────────
async function main() {
  // Validate env vars before anything else
  validateEnv();

  // Connect to MongoDB
  console.log('\n📦  Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  MongoDB connected');

  // Resolve instructor
  const instructor = await resolveInstructor();
  console.log(`👤  Instructor: ${instructor.name} (${instructor.email})`);

  // Summary counters
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalFailed  = 0;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  Importing ${PLAYLISTS.length} playlist(s)…`);
  console.log('═══════════════════════════════════════════════════════');

  for (const config of PLAYLISTS) {
    try {
      const result = await importPlaylist(config, instructor);
      if (result.skipped) totalSkipped++;
      else                totalCreated++;
    } catch (err) {
      totalFailed++;
      console.error(`\n❌  Failed to import playlist ${config.playlistId}`);
      console.error(`    ${err.message}\n`);
    }
  }

  // Final summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Import finished');
  console.log(`  ✅ Courses created : ${totalCreated}`);
  console.log(`  ⏭️  Skipped         : ${totalSkipped}`);
  console.log(`  ❌ Failed          : ${totalFailed}`);
  console.log('═══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('\n❌  Fatal error:', err.message);
  mongoose.disconnect().then(() => process.exit(1));
});
