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
      
      // Replace <!-- comment --> with {/* comment */}
      // Use regex to match <!-- anything -->
      let newContent = content.replace(/<!--([\s\S]*?)-->/g, "{/*$1*/}");
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log("Fixed comments in " + file);
      }
    }
  }
});
