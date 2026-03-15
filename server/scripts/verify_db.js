require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const axios = require('axios');

const VIDS = ['GQS7wPujL2k', 'e_dv7GBHka8'];

async function verify() {
  try {
    console.log('--- 2. Database Verification ---');
    await mongoose.connect(process.env.MONGO_URI);
    
    let dbMissing = 0;
    for (const vid of VIDS) {
      const c = await Course.findOne({ youtubeVideoId: vid });
      if (c) {
        console.log(`Course exists in database: ${vid}`);
      } else {
        console.log(`Course missing in database: ${vid}`);
        dbMissing++;
      }
    }
    await mongoose.disconnect();
    
    console.log('\n--- 3. API Verification ---');
    const { data } = await axios.get('http://localhost:3000/api/courses');
    const courses = data.courses || [];
    
    let apiMissing = 0;
    for (const vid of VIDS) {
      const found = courses.find(c => c.youtubeVideoId === vid);
      if (found) {
        console.log(`Course returned by API: ${vid}`);
      } else {
        console.log(`Course missing from API: ${vid}`);
        apiMissing++;
      }
    }
    
    console.log('\n--- Status ---');
    if (dbMissing === 0 && apiMissing === 0) {
      console.log('✔ Course successfully added and visible on Courses page');
    } else if (dbMissing === 0 && apiMissing > 0) {
      console.log('⚠ Course exists in database but not shown on frontend');
    } else {
      console.log('❌ Course not found in database');
    }
    
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
}

verify();
