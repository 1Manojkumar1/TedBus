const path = require('path');
const mongoose = require(path.join(process.cwd(), 'backend/node_modules/mongoose'));

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tedbus');
  const Post = mongoose.model('CommunityPost', new mongoose.Schema({}, { collection: 'communityposts', strict: false }));
  const Comment = mongoose.model('PostComment', new mongoose.Schema({}, { collection: 'postcomments', strict: false }));
  
  const posts = await Post.find({}, 'likesCount likes viewsCount commentsCount').lean();
  const comments = await Comment.find({}, 'likesCount likes').lean();
  
  const postsWithLikes = posts.filter(p => p.likesCount > 0 || (p.likes && p.likes.length > 0));
  const commentsWithLikes = comments.filter(c => c.likesCount > 0 || (c.likes && c.likes.length > 0));
  
  console.log('Posts with fake likes:', postsWithLikes.length);
  console.log('Comments with fake likes:', commentsWithLikes.length);
  console.log('Total posts verified in DB:', posts.length);
  console.log('Total comments verified in DB:', comments.length);
  process.exit(0);
}

check();
