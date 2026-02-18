#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/components/NavbarApp.js',
  'src/components/NavbarHome.js',
  'src/components/FAQ.js',
  'src/components/FooterLinks.js',
  'src/components/Video.js',
  'src/components/AppBody.js',
  'src/components/BodyCatMapper.js',
  'src/components/Map1.js',
  'src/components/Map2.js',
  'src/components/Map3.js',
  'src/components/Map4.js',
  'src/routes/FAQ.js',
  'src/components/VisNet.js'
];

const maxAllowedInlineStyles = {
  'src/components/VisNet.js': 3,
};

const stylePattern = /style\s*=\s*\{\{/g;
const failures = [];

for (const relPath of filesToCheck) {
  const filePath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(filePath)) {
    failures.push(`${relPath}: file not found`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const matchCount = (content.match(stylePattern) || []).length;
  const allowed = maxAllowedInlineStyles[relPath] || 0;

  if (matchCount > allowed) {
    failures.push(`${relPath}: found ${matchCount} inline style blocks (allowed ${allowed})`);
  }
}

if (failures.length > 0) {
  console.error('Inline style guard failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Inline style guard passed.');
