const fs = require('fs');
const path = require('path');

const patterns = [
  /million/i,
  /billion/i,
  /crore/i,
  /lakh/i,
  /\b\d+\s*M\+?\b/i,
  /\b\d+\s*K\+?\s*(users|customers|travelers|passengers|downloads|reviews)/i,
  /#1|no\.?\s*1\b|world's\s+largest|india's\s+largest|india's\s+leading/i,
  /rdbuz\.com|redbus/i
];

function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) {
      if (!['node_modules', '.git', 'dist', '.angular'].includes(f)) scan(full);
    } else if (/\.(html|ts|js|json)$/.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        for (const p of patterns) {
          if (p.test(l)) {
            console.log(`[${path.relative(process.cwd(), full)}:${idx+1}] ${l.trim()}`);
            break;
          }
        }
      });
    }
  }
}

scan('frontend/src');
scan('backend/src');
