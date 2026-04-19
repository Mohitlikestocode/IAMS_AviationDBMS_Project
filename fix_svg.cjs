const fs = require('fs');
const path = require('path');

const dirs = [path.join(__dirname, 'src', 'pages'), path.join(__dirname, 'src', 'components')];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.tsx')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf-8');
      
      let newContent = content
        .replace(/stroke-width=/g, "strokeWidth=")
        .replace(/stroke-linecap=/g, "strokeLinecap=")
        .replace(/stroke-linejoin=/g, "strokeLinejoin=")
        .replace(/fill-opacity=/g, "fillOpacity=");
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log("Fixed SVG attributes in " + file);
      }
    }
  }
});
