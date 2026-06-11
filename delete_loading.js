const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'src/app/loading.tsx',
  'src/app/new/loading.tsx',
  'src/app/villages/loading.tsx',
  'src/app/reports/loading.tsx',
  'src/app/feed/loading.tsx',
  'src/app/analytics/loading.tsx',
  'src/app/customers/[id]/edit/loading.tsx'
];

filesToDelete.forEach(file => {
  const absolutePath = path.join(process.cwd(), file);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
    console.log(`Deleted ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
