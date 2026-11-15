const path = require('path');
const fs = require('fs');
const mongoose = require(path.join(process.cwd(), 'backend/node_modules/mongoose'));

async function removeFakeLikes() {
  try {
    // 1. Clean MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/tedbus');
    console.log('Connected to MongoDB');

    const Post = mongoose.model('CommunityPost', new mongoose.Schema({}, { collection: 'communityposts', strict: false }));
    const Comment = mongoose.model('PostComment', new mongoose.Schema({}, { collection: 'postcomments', strict: false }));

    const postUpdateRes = await Post.updateMany({}, {
      $set: { likes: [], likesCount: 0 }
    });
    console.log(`Updated ${postUpdateRes.modifiedCount} posts in MongoDB: reset likes to [] and likesCount to 0.`);

    const commentUpdateRes = await Comment.updateMany({}, {
      $set: { likes: [], likesCount: 0 }
    });
    console.log(`Updated ${commentUpdateRes.modifiedCount} comments in MongoDB: reset likes to [] and likesCount to 0.`);

    // 2. Clean FALLBACK_DISCUSSIONS in community.component.ts
    const compPath = path.join(process.cwd(), 'frontend/src/app/Component/community/community.component.ts');
    let compContent = fs.readFileSync(compPath, 'utf8');

    const startMarker = 'const FALLBACK_DISCUSSIONS: any[] = ';
    const startIdx = compContent.indexOf(startMarker);
    const importMarker = 'import { Component, OnInit';
    const importIdx = compContent.indexOf(importMarker);
    const endIdx = compContent.lastIndexOf('];', importIdx);

    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = compContent.slice(startIdx + startMarker.length, endIdx + 1);
      const arr = JSON.parse(jsonStr);
      arr.forEach(post => {
        post.likes = [];
        post.likesCount = 0;
        post.viewsCount = 0;
        if (post.comments) {
          post.comments.forEach(c => {
            c.likes = [];
            c.likesCount = 0;
          });
        }
      });

      const updatedComp = compContent.slice(0, startIdx + startMarker.length) +
        JSON.stringify(arr, null, 2) +
        compContent.slice(endIdx + 1);
      fs.writeFileSync(compPath, updatedComp, 'utf8');
      console.log('Successfully cleaned fake likes and counts in community.component.ts FALLBACK_DISCUSSIONS!');
    } else {
      console.error('Could not locate FALLBACK_DISCUSSIONS block in community.component.ts');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error removing fake likes:', err);
    process.exit(1);
  }
}

removeFakeLikes();
