const azure = require('azure-storage');
const blobService = azure.createBlobService();


exports.add = (containerName, blobName, filePath) => {
    blobService.createBlockBlobFromLocalFile(containerName, blobName, filePath, (err, response) => {
        if (err) console.log(err);

        console.log('Uploaded file: ', response.name);
    })
}

exports.addDir = (containerName, dirName) => {
    blobService.createBlockBlobFromText(containerName, `${dirName}.`, '', (err, response) => {
        if (err) console.log(err);

        console.log('Uploaded directory: ', response);
    })
}

exports.download = (containerName, blobName, filePath) => {
    blobService.getBlobToLocalFile(containerName, blobName, filePath, (err, response) => {
        if (err) console.log('error :', err);


        console.log(`Downloaded file '${blobName}'`);
    })
}

exports.delete = (containerName, blobName) => {
    blobService.deleteBlobIfExists(containerName, blobName, (err, response) => {
        if (err) console.log('err: ', err);

        console.log(`Deleted file ${blobName}`);
    })
}

exports.listDirectory = (containerName) => {
    blobService.listBlobDirectoriesSegmented(containerName, null, (err, response) => {
        if (err) console.log('err: ', err);

        console.log(`List of directories: ${JSON.stringify(response, null, 4)}`);
    });
}