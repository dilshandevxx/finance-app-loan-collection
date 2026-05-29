const fs = require('fs');
const path = require('path');

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace import
  content = content.replace(
    'import { supabase } from "@/lib/supabase";',
    'import { createClient } from "@/utils/supabase/server";'
  );

  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);
    if ((lines[i].includes('export async function') || lines[i].includes('async function')) && lines[i].includes('{')) {
      if (i + 1 < lines.length && !lines[i + 1].includes('createClient()')) {
        newLines.push('  const supabase = await createClient();');
      }
    }
  }

  fs.writeFileSync(filePath, newLines.join('\n'));
}

refactorFile(path.join(__dirname, 'src', 'data', 'db.ts'));
refactorFile(path.join(__dirname, 'src', 'app', 'actions.ts'));
console.log('Refactor complete');
