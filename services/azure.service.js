if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: './.env' });
}

const path = require('path');
const storage = require('azure-storage');

const blobService = storage.createBlobService();

class AzureService {
    async listContainers() {
        return new Promise((resolve, reject) => {
            blobService.listContainersSegmented(null, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.entries);
                }
            });
        });
    };

    async createContainer(containerName) {
        return new Promise((resolve, reject) => {
            blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: `Container '${containerName}' created` });
                }
            });
        });
    };

    async uploadString(containerName, blobName, text) {
        return new Promise((resolve, reject) => {
            blobService.createBlockBlobFromText(containerName, blobName, text, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: `Text "${text}" is written to blob storage` });
                }
            });
        });
    };

    async uploadLocalFile(containerName, filePath) {
        return new Promise((resolve, reject) => {
            const fullPath = path.resolve(filePath);
            const blobName = path.basename(filePath);
            blobService.createBlockBlobFromLocalFile(containerName, blobName, fullPath, err => {
                if (err) {
                    reject(err);
                } else {
                    console.log('filePath uploaded!:', filePath);
                    resolve({ message: `Local file "${filePath}" is uploaded` });
                }
            });
        });
    };

    async listDirectories(containerName) {
        return new Promise((resolve, reject) => {
            blobService.listBlobDirectoriesSegmented(containerName, null, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.entries);
                }
            });
        });
    }

    async listBlobs(containerName) {
        return new Promise((resolve, reject) => {
            blobService.listBlobsSegmented(containerName, null, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.entries);
                }
            });
        });
    };

    async download(containerName, blobName, pathDownload) {
        return new Promise((resolve, reject) => {
            blobService.getBlobToLocalFile(containerName, blobName, pathDownload, (err, result, response) => {
                try {
                    console.log('result', result);
                    console.log('response', response)
                    resolve(response);
                } catch (error) {
                    reject(err);
                }
            });
        });
    };

    async downloadBlob(containerName, blobName) {
        return new Promise((resolve, reject) => {
            blobService.getBlobToText(containerName, blobName, (err, data) => {
                try {
                    resolve({ message: `Blob downloaded "${data}"`, text: data });
                } catch (error) {
                    reject(err);
                }
            });
        });
    };

    async deleteBlob(containerName, blobName) {
        return new Promise((resolve, reject) => {
            blobService.deleteBlobIfExists(containerName, blobName, err => {
                try {
                    resolve({ message: `Block blob '${blobName}' deleted` });
                } catch (error) {
                    reject(err);
                }
            });
        });
    };

    async deleteContainer(containerName) {
        return new Promise((resolve, reject) => {
            blobService.deleteContainer(containerName, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: `Container '${containerName}' deleted` });
                }
            });
        });
    };
}

module.exports = new AzureService();
