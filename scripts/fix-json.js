
const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.json')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const dataDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(dataDir)) {
    console.log("No data directory found");
    process.exit(0);
}

const files = getAllFiles(dataDir);
let fixedCount = 0;
let deletedCount = 0;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    try {
        if (!content || content.trim() === '') {
            console.log(`Fixing empty file: ${file}`);
            // If it's a usecase.json, entity.json, etc., we might want a minimal valid object
            fs.writeFileSync(file, '{}');
            fixedCount++;
        } else {
            JSON.parse(content);
        }
    } catch (e) {
        console.log(`Error parsing ${file}: ${e.message}`);
        console.log(`Fixing invalid JSON in: ${file}`);
        fs.writeFileSync(file, '{}'); // Reset to empty object if invalid
        fixedCount++;
    }
});

console.log(`Finished. Fixed ${fixedCount} files.`);
