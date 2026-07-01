const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Administrator/.gemini/antigravity-ide/brain/a5e7b3e0-49dd-448c-a765-f1b939b059b6/.system_generated/logs/transcript.jsonl', 'utf-8').split('\n');
let latestCode = null;
for(let line of lines) {
  if(line.includes('write_to_file') && line.includes('Cambios.jsx') && line.includes('const Cambios')) {
    const data = JSON.parse(line);
    const content = data.tool_calls[0].args.CodeContent;
    latestCode = content.startsWith('"') ? JSON.parse(content) : content;
  }
}
if(latestCode) {
  fs.writeFileSync('C:/Users/Administrator/Desktop/Sistema de Gestion/frontend/src/pages/recursos_humanos/Cambios.jsx', latestCode);
  console.log("Restored");
}
