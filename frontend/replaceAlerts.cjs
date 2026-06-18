const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'pages', 'administracion');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if we need to add import Swal
    if ((content.includes('alert(') || content.includes('window.confirm(')) && !content.includes('import Swal')) {
        content = content.replace(/(import React.*?;\n)/, '$1import Swal from \'sweetalert2\';\n');
        modified = true;
    }

    // Replace window.confirm patterns. 
    // Most common: if (!window.confirm(...)) return;
    const confirmRegex = /if\s*\(!window\.confirm\((.*?)\)\)\s*return;/g;
    if (confirmRegex.test(content)) {
        content = content.replace(confirmRegex, 
            "const confirmResult = await Swal.fire({\n      title: '¿Confirmar Acción?',\n      text: $1,\n      icon: 'warning',\n      showCancelButton: true,\n      confirmButtonColor: '#3085d6',\n      cancelButtonColor: '#d33',\n      confirmButtonText: 'Sí',\n      cancelButtonText: 'Cancelar'\n    });\n    if (!confirmResult.isConfirmed) return;"
        );
        modified = true;
    }

    // Secondary common pattern: if(window.confirm(...)) { ... } - we might not have this, but just in case
    // For now we assume only the return pattern exists as per our recent code.

    // Replace alert(...)
    // Needs to handle alert("...") and alert(variable)
    const alertRegex = /alert\((.*?)\);/g;
    if (alertRegex.test(content)) {
        content = content.replace(alertRegex, "Swal.fire($1);");
        modified = true;
    }
    
    // There might be return alert(...)
    const returnAlertRegex = /return alert\((.*?)\);/g;
    if (returnAlertRegex.test(content)) {
        content = content.replace(returnAlertRegex, "return Swal.fire($1);");
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
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
console.log('All files processed.');
