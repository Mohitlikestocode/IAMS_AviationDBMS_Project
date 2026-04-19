const fs = require('fs');
const path = require('path');

function convertHtmlToJsx(html) {
  let jsx = html;
  // Replace class= with className=
  jsx = jsx.replace(/class=/g, 'className=');
  // Replace for= with htmlFor=
  jsx = jsx.replace(/for=/g, 'htmlFor=');
  
  // Self-closing tags fix for React: <input ... > -> <input ... />
  // We need to match <input ...> that don't end with />
  jsx = jsx.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
  jsx = jsx.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
  jsx = jsx.replace(/<br([^>]*[^\/])>/g, '<br />');
  
  // Style string to object (simple inline styles fix if present)
  // Stitch tailwind html rare uses inline styles, but we saw one: style="font-variation-settings: 'FILL' 1;"
  jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
    // Quick and dirty parser for font-variation-settings
    if (p1.includes('font-variation-settings')) {
       return `style={{ fontVariationSettings: "'FILL' 1" }}`;
    }
    // Return empty or generic style object for others to prevent crashes, since this is a tailored script
    return `style={{}}`;
  });

  return jsx;
}

const extractBody = (html) => {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    let content = bodyMatch[1];
    // Remove scripts if any inside body
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    return content;
  }
  return html;
};

const screensDir = path.join(__dirname, 'stitch_screens');
const compDir = path.join(__dirname, 'src', 'pages');

// Map HTML files to TSX component names
const mapping = {
  'auth_sign_in.html': { comp: 'Auth', route: null },
  'main_dashboard_ui.html': { comp: 'Dashboard', hasSidebar: true },
  'tables_explorer_ui.html': { comp: 'Tables', hasSidebar: true },
  'sql_console_ui.html': { comp: 'SqlConsole', hasSidebar: true },
  'ai_query_assistant.html': { comp: 'AiQuery', hasSidebar: true },
  'database_passengers.html': { comp: 'Passengers', hasSidebar: true },
  'reservations_management.html': { comp: 'Reservations', hasSidebar: true },
  'operations_analytics.html': { comp: 'Analytics', hasSidebar: true },
};

// We will also extract Topbar and Sidebar from main_dashboard_ui and put them in components
const extractSidebarAndTopbar = (html) => {
   const asideMatch = html.match(/<aside[^>]*>([\s\S]*?)<\/aside>/i);
   const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
   
   let asideStr = asideMatch ? `<aside ${asideMatch[0].split('>')[0].substring(6)}>${asideMatch[1]}</aside>` : '';
   let headerStr = headerMatch ? `<header ${headerMatch[0].split('>')[0].substring(7)}>${headerMatch[1]}</header>` : '';
   
   return { aside: convertHtmlToJsx(asideStr), header: convertHtmlToJsx(headerStr) };
};

const extractMain = (html) => {
   const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
   return mainMatch ? `<main ${mainMatch[0].split('>')[0].substring(5)}>${mainMatch[1]}</main>` : '';
};

let layoutExtracted = false;

for (const [filename, info] of Object.entries(mapping)) {
  const filePath = path.join(screensDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log("Missing " + filename);
    continue;
  }
  
  const rawHtml = fs.readFileSync(filePath, 'utf-8');
  
  if (info.comp === 'Auth') {
     let content = convertHtmlToJsx(extractBody(rawHtml));
     // To make it valid JSX, it must have one root node
     let tsx = `import React from 'react';\nimport { useNavigate } from 'react-router-dom';\n\nconst ${info.comp} = () => {\n  const navigate = useNavigate();\n  return (\n    <div className="auth-root w-full h-full">\n      ${content}\n    </div>\n  );\n};\n\nexport default ${info.comp};\n`;
     fs.writeFileSync(path.join(compDir, `${info.comp}.tsx`), tsx);
     console.log(`Generated ${info.comp}.tsx`);
  } else {
     let mainContent = extractMain(rawHtml);
     if (!mainContent) {
        // Fallback to body
        mainContent = extractBody(rawHtml);
     }
     
     if (!layoutExtracted && info.hasSidebar) {
        const layout = extractSidebarAndTopbar(rawHtml);
        if (layout.aside) {
           let sidebarTsx = `import React from 'react';\nconst Sidebar = () => {\n  return (\n    <React.Fragment>\n      ${layout.aside}\n    </React.Fragment>\n  );\n};\nexport default Sidebar;\n`;
           fs.writeFileSync(path.join(__dirname, 'src', 'components', 'Sidebar.tsx'), sidebarTsx);
        }
        if (layout.header) {
           let topbarTsx = `import React from 'react';\nconst Topbar = () => {\n  return (\n    <React.Fragment>\n      ${layout.header}\n    </React.Fragment>\n  );\n};\nexport default Topbar;\n`;
           fs.writeFileSync(path.join(__dirname, 'src', 'components', 'Topbar.tsx'), topbarTsx);
        }
        layoutExtracted = true;
     }

     // Now write the page component (only the <main> part)
     let content = convertHtmlToJsx(mainContent);
     
     // Remove any nested html/body or unclosed tags if we fell back to full body
     
     let tsx = `import React from 'react';\n\nconst ${info.comp} = () => {\n  return (\n    <React.Fragment>\n      ${content}\n    </React.Fragment>\n  );\n};\n\nexport default ${info.comp};\n`;
     fs.writeFileSync(path.join(compDir, `${info.comp}.tsx`), tsx);
     console.log(`Generated ${info.comp}.tsx`);
  }
}

// AppLayout wrapper in App.tsx needs to change from custom vanilla css wrappers to nothing, 
// because Sidebar and Topbar have fixed positioning in Tailwind!
const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
let appTsx = fs.readFileSync(appTsxPath, 'utf8');

appTsx = appTsx.replace(
  /function AppLayout[^\\}]+\\}/s,
  `function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen text-on-background">
      <Sidebar />
      <Topbar />
      {children}
    </div>
  );
} `
);

fs.writeFileSync(appTsxPath, appTsx);
console.log('Updated App.tsx layout wrapper');

