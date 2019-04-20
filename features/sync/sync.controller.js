const { difference } = require('lodash');
const fs = require('fs');
const azureService = require('../../services/azure.service');
const service = require('./sync.service');
const { promisify } = require('util');
const { resolve } = require('path');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

let blobArray = [], localFiles = [];

exports.syncFolder = async (req, res) => {
    try {
        let folder = req.body.folder

        let event = req.body.event;
        let filesToUpload, filesToDownload, filesToDelete;
        let changeFile = req.body.file;

        const containerName = req.repository;

        // Get the files recursively from a specific folder
        async function getFiles(directory) {
            const subdirs = await readdir(directory);
            const files = await Promise.all(subdirs.map(async (subdir) => {
                let res = resolve(directory, subdir);

                if ((await stat(res)).isDirectory()) {
                    return getFiles(res)
                } else {
                    res = res.split(`${folder}/`)[1];
                    return res
                }
            }));
            return files.reduce((a, f) => a.concat(f), []);
        }

        try {
            localFiles = [];
            const result = await getFiles(folder);
            localFiles.push(...result);
        } catch (error) {
            console.log('error:', error);
        }

        console.log('event :', event);

        azureService.listBlobs(containerName)
            .then(blobs => {
                blobs.forEach(blob => {
                    blobArray.push(blob.name)
                });

                switch (event) {
                    case 'change':
                        service.add(containerName, `${changeFile}`, `${folder}/${changeFile}`);
                        blobArray = [];
                        break;

                    case 'sync':
                        // Compara os arquivos locais e arquivos do cloud e retorna os que tem no cloud e não tem localmente
                        filesToDownload = difference(blobArray, localFiles);

                        // Se tiver arquivos pra fazer download, entra no if
                        if (filesToDownload.length > 0) {
                            filesToDownload.forEach(blob => {
                                let newBlob = blob.split('/');
                                newBlob.pop();
                                newBlob = newBlob.join('/');
                                if (!fs.existsSync(`${folder}/${newBlob}`)) {
                                    fs.mkdirSync(`${folder}/${newBlob}/`);
                                }
                                service.download(containerName, blob, `${folder}/${blob}`)
                            });
                        }

                        // Compara os arquivos locais e arquivos do cloud e retorna os que tem localmente e não tem no cloud
                        filesToUpload = difference(localFiles, blobArray);

                        // Se tiver arquivos pra fazer upload, entra no if
                        if (filesToUpload.length > 0) {
                            filesToUpload.forEach(blob => {
                                service.add(containerName, blob, `${folder}/${blob}`)
                            })
                        }

                        filesToDownload = [];
                        filesToUpload = [];
                        blobArray = [];
                        break;

                    case 'add':
                        // Compara os arquivos locais e arquivos do cloud e retorna os que tem localmente e não tem no cloud
                        filesToUpload = difference(localFiles, blobArray);

                        if (filesToUpload.length > 0) {
                            filesToUpload.forEach(blob => {
                                service.add(containerName, blob, `${folder}/${blob}`)
                            })
                        }

                        blobArray = [];
                        break;

                    case 'unklinkDir':
                        blobArray = [];
                        break;

                    case 'unlink':
                        // Compara os arquivos locais e arquivos do cloud e retorna os que tem no cloud e não tem local 
                        filesToDelete = difference(blobArray, localFiles);
                        filesToDelete.forEach(blob => {
                            service.delete(containerName, blob)
                        });

                        blobArray = [];
                        break;

                    default:
                        console.log('entrou no break');
                        blobArray = [];
                }
            })

    } catch (error) {
        console.log('error :', error);
    }
};
