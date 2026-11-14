const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));

async function syncCounts() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/tedbus');
    console.log('Connected to MongoDB');

    const Post = mongoose.model('CommunityPost', new mongoose.Schema({
      title: String,
      commentsCount: Number,
      likesCount: Number,
      viewsCount: Number,
      likes: [mongoose.Schema.Types.Mixed]
    }, { collection: 'communityposts', strict: false }));

    const Comment = mongoose.model('PostComment', new mongoose.Schema({
      postId: mongoose.Schema.Types.ObjectId,
      status: String
    }, { collection: 'postcomments', strict: false }));

    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts in MongoDB`);

    let updatedCount = 0;
    for (const post of posts) {
      const actualCommentCount = await Comment.countDocuments({
        postId: post._id,
        status: { $ne: 'deleted' }
      });

      const actualLikesCount = Array.isArray(post.likes) ? post.likes.length : 0;
      
      let needsUpdate = false;
      const updateFields = {};

      if (post.commentsCount !== actualCommentCount) {
        updateFields.commentsCount = actualCommentCount;
        needsUpdate = true;
      }

      if (post.likesCount !== actualLikesCount) {
        updateFields.likesCount = actualLikesCount;
        needsUpdate = true;
      }

      // If viewsCount is undefined or negative, clean it up
      if (typeof post.viewsCount !== 'number' || isNaN(post.viewsCount) || post.viewsCount < 0) {
        updateFields.viewsCount = 0;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Post.updateOne({ _id: post._id }, { $set: updateFields });
        console.log(`Updated post "${post.title?.slice(0, 30)}..." [${post._id}]: commentsCount ${post.commentsCount} -> ${actualCommentCount}, likesCount ${post.likesCount} -> ${actualLikesCount}`);
        updatedCount++;
      }
    }

    console.log(`Successfully synchronized ${updatedCount} posts.`);
    process.exit(0);
  } catch (err) {
    console.error('Error syncing counts:', err);
    process.exit(1);
  }
}

syncCounts();
