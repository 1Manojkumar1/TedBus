const fs = require('fs');

const content = fs.readFileSync('frontend/src/app/Component/community/community.component.ts', 'utf8');
const startMarker = 'const FALLBACK_DISCUSSIONS: any[] = ';
const startIdx = content.indexOf(startMarker);
const importMarker = 'import { Component, OnInit';
const importIdx = content.indexOf(importMarker);
const endIdx = content.lastIndexOf('];', importIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const jsonStr = content.slice(startIdx + 'const FALLBACK_DISCUSSIONS: any[] = '.length, endIdx + 1);
  const arr = JSON.parse(jsonStr);
  console.log('Total fallback discussions:', arr.length);
  let cMismatch = 0;
  let lMismatch = 0;
  arr.forEach((p, i) => {
    const actualComments = (p.comments || []).length;
    const actualLikes = (p.likes || []).length;
    if (p.commentsCount !== actualComments) {
      cMismatch++;
      console.log(`[${i}] "${p.title.slice(0, 30)}": commentsCount=${p.commentsCount} vs actual=${actualComments}`);
    }
    if (p.likesCount !== actualLikes) {
      lMismatch++;
    }
    // Also check comments within post
    if (p.comments) {
      p.comments.forEach((c) => {
        const cLikes = (c.likes || []).length;
        if (c.likesCount !== cLikes) {
          c.likesCount = cLikes;
        }
      });
    }
    p.commentsCount = actualComments;
    p.likesCount = actualLikes;
  });
  console.log('Comments count mismatches in fallback:', cMismatch);
  console.log('Likes count mismatches in fallback:', lMismatch);

  // Write back perfectly synchronized fallback array
  const updatedCode = content.slice(0, startIdx + 'const FALLBACK_DISCUSSIONS: any[] = '.length) +
    JSON.stringify(arr, null, 2) +
    content.slice(endIdx + 1);
  fs.writeFileSync('frontend/src/app/Component/community/community.component.ts', updatedCode, 'utf8');
  console.log('Successfully updated community.component.ts with exact counts!');
} else {
  console.log('Could not find markers');
}
