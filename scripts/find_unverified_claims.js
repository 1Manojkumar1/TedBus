const fs = require('fs');
const path = require('path');

const claims = [];
const patterns = [
  /\b\d+\s*M\+?\b/i,
  /\b\d+\s*Million\+?\b/i,
  /\b\d{2,3},000\+?\b/i,
  /\b\d+\s*Crore\+?\b/i,
  /\b\d+\s*Lakh\+?\b/i,
  /happy travelers/i,
  /daily buses/i,
  /reviews/i,
  /downloads/i,
  /operators/i,
  /ratings/i
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f !== 'node_modules' && f !== '.git') {
        walk(full);
      }
    } else if (/\.(html|ts)$/.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const pat of patterns) {
          if (pat.test(line)) {
            claims.push({
              file: path.relative('c:/TedBus', full),
              lineNum: idx + 1,
              line: line.trim()
            });
            break;
          }
        }
      });
    }
  }
}

walk('frontend/src/app');
console.log(`Found ${claims.length} candidate lines. Showing relevant marketing/metric claims:`);
claims.forEach(c => {
  if (
    c.line.includes('10M') ||
    c.line.includes('Million') ||
    c.line.includes('50,000') ||
    c.line.includes('10,000') ||
    c.line.includes('100,000') ||
    c.line.includes('5,000') ||
    c.line.includes('Lakh') ||
    c.line.includes('Crore') ||
    c.line.includes('happy') ||
    c.line.includes('Travelers') ||
    c.line.includes('Routes') ||
    c.line.includes('Rating')
  ) {
    console.log(`[${c.file}:${c.lineNum}] ${c.line}`);
  }
});
