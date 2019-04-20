const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let dirPath = path.join(dir, file);

        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ?
            walkDir(dirPath) : dirPath;
    });
};

module.exports = walkDir;