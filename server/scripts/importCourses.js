/**
 * ============================================================
 *  LearnFlow — Import Specific YouTube Videos as Courses
 * ============================================================
 *  Works WITHOUT a YouTube Data API key by using the free
 *  oEmbed endpoint to fetch titles and thumbnails.
 *
 *  Usage (from /server directory):
 *    node scripts/importCourses.js
 *
 *  Or via npm:
 *    npm run import:courses
 *
 *  Requirements (in /server/.env):
 *    MONGO_URI  — MongoDB connection string
 *
 *  YOUTUBE_KEY is optional — oEmbed is used as fallback.
 * ============================================================
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────
// 1.  YouTube URLs to import
//     Paste any youtu.be or youtube.com links here.
// ─────────────────────────────────────────────────────────────
const YOUTUBE_URLS = [
  'https://youtu.be/D1eL1EnxXXQ',
  'https://youtu.be/xFpOkk2Tm4E?list=PLVHgQku8Z934XtlDzTqyrKM8GGE6KWhg_',
  'https://youtu.be/RGOj5yH7evk',
  'https://youtu.be/G3e-cpL7ofc',
  'https://youtu.be/ztHopE5Wnpc',
  'https://youtu.be/SSKVgrwhzus?list=PLNcg_FV9n7qZY_2eAtUzEUulNjTJREhQe',
  'https://youtu.be/mEsleV16qdo',
  'https://youtu.be/3m0TXas0Vjw',
  'https://youtu.be/bI6q16ffdgQ'
];

// ─────────────────────────────────────────────────────────────
// 2.  Per-video overrides  (optional — matched by videoId)
//     Leave empty to use defaults for all.
// ─────────────────────────────────────────────────────────────
const VIDEO_OVERRIDES = {
  'D1eL1EnxXXQ': { category: 'Backend', level: 'Intermediate', tags: ['nodejs', 'express', 'backend'] },
  'xFpOkk2Tm4E': { category: 'Frontend', level: 'Intermediate', tags: ['javascript', 'frontend'] },
  'RGOj5yH7evk': { category: 'Programming', level: 'Beginner', tags: ['git', 'github', 'version control'] },
  'G3e-cpL7ofc': { category: 'Programming', level: 'Beginner', tags: ['linux', 'command line', 'devops'] },
  'ztHopE5Wnpc': { category: 'Programming', level: 'Beginner', tags: ['javascript', 'programming'] },
  'SSKVgrwhzus': { category: 'Frontend', level: 'Intermediate', tags: ['react', 'javascript', 'frontend'] },
  'mEsleV16qdo': { category: 'Data Science', level: 'Beginner', tags: ['sql', 'database', 'programming'] },
};

// ─────────────────────────────────────────────────────────────
// 3.  Defaults for any video without an override
// ─────────────────────────────────────────────────────────────
const DEFAULTS = {
  category: 'Programming',
  level: 'Beginner',
  tags: ['youtube', 'programming'],
  isPublished: true,
};

// ─────────────────────────────────────────────────────────────
// 4.  Extract video ID from any YouTube URL format
// ─────────────────────────────────────────────────────────────
function extractVideoId(url) {
  try {
    const u = new URL(url);
    // youtu.be/VIDEO_ID
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('?')[0];
    }
    // youtube.com/watch?v=VIDEO_ID
    if (u.searchParams.get('v')) {
      return u.searchParams.get('v');
    }
    // youtube.com/embed/VIDEO_ID
    const embedMatch = u.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch) return embedMatch[1];
  } catch {
    // Regex fallback
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// 5.  Fetch video metadata
//     Tries YouTube Data API first (if key is real), then
//     falls back to oEmbed (no key required).
// ─────────────────────────────────────────────────────────────
async function fetchVideoMeta(videoId) {
  const apiKey = process.env.YOUTUBE_KEY;
  const hasRealKey = apiKey && apiKey !== 'YOUR_YOUTUBE_API_KEY';

  // ── Try Data API ─────────────────────────────────────────
  if (hasRealKey) {
    try {
      const { data } = await axios.get(
        'https://www.googleapis.com/youtube/v3/videos',
        { params: { part: 'snippet,contentDetails', id: videoId, key: apiKey }, timeout: 8000 }
      );
      const item = data.items?.[0];
      if (item) {
        const s = item.snippet;
        const t = s.thumbnails;
        const thumb = t?.maxres?.url || t?.high?.url || t?.medium?.url
          || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        return { title: s.title, description: s.description || '', thumbnail: thumb, source: 'DataAPI' };
      }
    } catch { /* fall through to oEmbed */ }
  }

  // ── Fallback: oEmbed (free, no key needed) ────────────────
  try {
    const { data } = await axios.get('https://www.youtube.com/oembed', {
      params: { url: `https://www.youtube.com/watch?v=${videoId}`, format: 'json' },
      timeout: 8000,
    });
    return {
      title: data.title || `YouTube Video (${videoId})`,
      description: `Watch "${data.title}" on YouTube. Taught by ${data.author_name}.`,
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      source: 'oEmbed',
    };
  } catch (err) {
    // Last resort: generate from video ID
    return {
      title: `YouTube Course (${videoId})`,
      description: 'A YouTube-powered course. Watch and learn at your own pace.',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      source: 'fallback',
    };
  }
}

// ─────────────────────────────────────────────────────────────
// 6.  Main
// ─────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI not set in /server/.env');
  }

  console.log('\n📦  Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  MongoDB connected\n');

  // Resolve instructor (admin user → any user → error)
  let instructor = await User.findOne({ role: 'admin' });
  if (!instructor) instructor = await User.findOne();
  if (!instructor) {
    throw new Error('No users found. Run `npm run seed` first.');
  }
  console.log(`👤  Instructor: ${instructor.name} (${instructor.email})\n`);

  let created = 0, skipped = 0, failed = 0;

  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Importing ${YOUTUBE_URLS.length} video(s)…`);
  console.log('═══════════════════════════════════════════════════════\n');

  for (const url of YOUTUBE_URLS) {
    const videoId = extractVideoId(url);

    if (!videoId) {
      console.warn(`⚠️  Could not extract video ID from: ${url}\n`);
      failed++;
      continue;
    }

    try {
      // Fetch metadata
      const meta = await fetchVideoMeta(videoId);

      // Skip if already exists (by youtubeVideoId field)
      const existingByVid = await Course.findOne({ youtubeVideoId: videoId });
      if (existingByVid) {
        console.log(`⏭️  SKIPPED  (already in DB) → ${meta.title}\n`);
        skipped++;
        continue;
      }

      // Merge overrides with defaults
      const override = VIDEO_OVERRIDES[videoId] || {};
      const tags = [...new Set(['youtube', 'programming', ...(override.tags || [])])];

      // ── Create Course ────────────────────────────────────
      const course = await Course.create({
        title: meta.title,
        description: meta.description,
        thumbnail: meta.thumbnail,
        instructor: instructor._id,
        instructorName: instructor.name,
        category: override.category || DEFAULTS.category,
        level: override.level || DEFAULTS.level,
        tags,
        isPublished: true,
        youtubeVideoId: videoId,
        totalLessons: 1,
        enrolledCount: 0,
        rating: 4.5,
        duration: '0h 0m',
      });

      // ── Create matching Lesson ───────────────────────────
      await Lesson.create({
        courseId: course._id,
        title: meta.title,
        description: meta.description,
        order: 1,
        youtubeId: videoId,
        thumbnailUrl: meta.thumbnail,
        isFree: true,
      });

      created++;
      console.log(`✅  Course added: ${meta.title}`);
      console.log(`     Video ID   : ${videoId}`);
      console.log(`     Category   : ${override.category || DEFAULTS.category}  |  Level: ${override.level || DEFAULTS.level}`);
      console.log(`     Thumbnail  : ${meta.source}`);
      console.log(`     Course _id : ${course._id}\n`);

    } catch (err) {
      failed++;
      console.error(`❌  FAILED  videoId=${videoId}`);
      console.error(`    Error: ${err.message}\n`);
    }
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('  Import complete');
  console.log(`  ✅ Created : ${created}`);
  console.log(`  ⏭️  Skipped : ${skipped}`);
  console.log(`  ❌ Failed  : ${failed}`);
  console.log('═══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('\n❌  Fatal error:', err.message);
  mongoose.disconnect().then(() => process.exit(1));
});
