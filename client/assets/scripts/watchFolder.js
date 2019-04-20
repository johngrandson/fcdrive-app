const chokidar = require('chokidar');
const http = require('http');
const os = require('os');
const fs = require('fs');
let globalFolder = os.homedir();

let rootFolder;

globalFolder = `${globalFolder}/fcdrive`;

let watcher = null;
const sessionToken = window.localStorage.getItem('token');


if (!fs.existsSync(`${globalFolder}`)) {
    fs.mkdirSync(`${globalFolder}`);
}

function StartWatcher(path) {
    document.getElementById("start").disabled = true;
    watcher = chokidar.watch(path, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true,
        usePolling: false,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    function onWatcherReady() {
        console.log('sincronizando pasta com o cloud', 'Sync em andamento');
        showInLogFlag = true;
        document.getElementById("stop").style.display = "block";
    }

    watcher
        .on('add', (path) => {
            folderSync('add');
            console.log('File', path, 'has been added');
        })
        .on('addDir', (path) => {
            folderSync('addDir');
            console.log('Directory', path, 'has been added');
        })
        .on('change', (path) => {
            // console.log('File', path, 'has been changed');
            let file = path.split(`${globalFolder}/`);
            file = file[file.length - 1];
            console.log('file :', file);
            folderSync('change', file);
        })
        .on('unlink', (path) => {
            folderSync('unlink');
            console.log('File', path, 'has been removed');
        })
        .once('unlinkDir', (path) => {
            folderSync('unlinkDir');
            console.log('Directory', path, 'has been removed');
        })
        .on('error', (error) => {
            console.log('Error happened', error);
        })
        .on('ready', () => {
            console.log('ready')
            folderSync('sync');
            onWatcherReady();
        })
        .once('raw', (event, path, details) => {
            // This event should be triggered everytime something happens.
            console.log('Raw event info:', event, path, details);
        });
}

// Sync button
function sync() {
    document.getElementById("sync").style.display = "none";
    document.getElementById("stop").style.display = "block";

    StartWatcher(globalFolder);
}

// Electron open select folder window
document.getElementById("start").addEventListener("click", function (e) {
    const { dialog } = require('electron').remote;

    const options = {
        defaultPath: globalFolder,
        properties: ['openDirectory']
    }

    dialog.showOpenDialog(options, function (path) {
        if (path) {
            rootFolder = path[0];
            console.log('globalFolder :', rootFolder);
            document.getElementById("sync").disabled = false;
        } else {
            document.getElementById("sync").disabled = true;
            console.log("Nenhuma pasta selecionada");
        }
    });
}, false);

// Stop sync button
document.getElementById("stop").addEventListener("click", function (e) {
    if (!watcher) {
        console.log("Você precisa dar Sync na pasta");
    } else {
        watcher.close();
        document.getElementById("start").disabled = false;
        showInLogFlag = false;
        document.getElementById("sync").style.display = "block";
        document.getElementById("stop").style.display = "none";
    }
}, false);

function folderSync(event, file = '') {
    const folder = rootFolder;
    data = JSON.stringify({ event, folder, file })

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/upload/sync',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
        }
    }

    const req = http.request(options, res => {
        res.on('data', (d) => process.stdout.write(d))
    })

    req.on('error', error => console.error(error))

    req.write(data)
    req.end();
}