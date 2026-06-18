const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'pages', 'administracion');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace import
    if (content.includes("import Swal from 'sweetalert2';")) {
        content = content.replace("import Swal from 'sweetalert2';", "import { showToast, showConfirm } from '../../utils/alerts';");
        modified = true;
    }

    // Replace simple Swal.fire(X) with showToast(X)
    // Be careful with newlines and exact matches
    const simpleSwalRegex = /return Swal\.fire\((.*?)\);/g;
    if (simpleSwalRegex.test(content)) {
        content = content.replace(simpleSwalRegex, "return showToast($1);");
        modified = true;
    }
    
    const simpleSwalRegex2 = /Swal\.fire\((.*?)\);/g;
    if (simpleSwalRegex2.test(content)) {
        content = content.replace(simpleSwalRegex2, "showToast($1);");
        modified = true;
    }

    // Replace the large Swal.fire block generated previously
    const largeSwalRegex = /const confirmResult = await Swal\.fire\(\{[\s\S]*?text:\s*(.*?),[\s\S]*?cancelButtonText: 'Cancelar'\s*\}\);\s*if \(!confirmResult\.isConfirmed\) return;/g;
    if (largeSwalRegex.test(content)) {
        content = content.replace(largeSwalRegex, "if (!(await showConfirm($1))) return;");
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Improved ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(dirPath);
console.log('All files improved.');
