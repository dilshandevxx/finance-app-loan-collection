const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  
  content = content.replace(/>Village</g, '>Area<');
  content = content.replace(/>Villages</g, '>Areas<');
  content = content.replace(/>Village/g, '>Area');
  content = content.replace(/Villages</g, 'Areas<');
  content = content.replace(/"Village"/g, '"Area"');
  content = content.replace(/"Villages"/g, '"Areas"');
  content = content.replace(/By Village/g, 'By Area');
  content = content.replace(/Village Breakdown/g, 'Area Breakdown');
  content = content.replace(/All Villages/g, 'All Areas');
  content = content.replace(/Address \/ Village/g, 'Address / Area');
  content = content.replace(/Select Village/g, 'Select Area');
  content = content.replace(/Manage Villages/g, 'Manage Areas');
  content = content.replace(/Village name/g, 'Area name');
  content = content.replace(/Select a Village/g, 'Select an Area');
  content = content.replace(/Village \/ City/g, 'Area / City');
  content = content.replace(/"VILLAGE BREAKDOWN"/g, '"AREA BREAKDOWN"');
  content = content.replace(/"VILLAGE BREAKDOWN SUMMARY"/g, '"AREA BREAKDOWN SUMMARY"');
  content = content.replace(/Select village\.\.\./g, 'Select area...');
  content = content.replace(/by village and focus/g, 'by area and focus');
  content = content.replace(/manage villages independently/g, 'manage areas independently');
  content = content.replace(/Registered villages/g, 'Registered areas');
  content = content.replace(/Add Village/g, 'Add Area');

  if (orig !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
