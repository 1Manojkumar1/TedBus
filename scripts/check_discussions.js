const fs = require('fs');
const content = fs.readFileSync('frontend/src/app/Component/community/community.component.ts', 'utf8');
const lines = content.split('\n');
let posts = [];
let curr = null;
for (let i = 0; i < 2530; i++) {
  const l = lines[i];
  if (l.includes('"_id": "seed-post-')) {
    if (curr) posts.push(curr);
    curr = { id: l.trim(), line: i + 1 };
  }
  if (curr && l.includes('"commentsCount":')) curr.commentsCount = l.trim();
  if (curr && l.includes('"comments": [')) curr.hasComments = true;
  if (curr && l.includes('"likesCount":')) curr.likesCount = l.trim();
  if (curr && l.includes('"viewsCount":')) curr.viewsCount = l.trim();
}
if (curr) posts.push(curr);
console.log('Total fallback posts found:', posts.length);
posts.slice(0, 10).forEach(p => console.log(p));
