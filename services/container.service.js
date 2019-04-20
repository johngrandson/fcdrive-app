if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: './.env' });
}
const {
    Aborter,
    ContainerURL,
    ServiceURL,
    StorageURL,
    SharedKeyCredential,
    AnonymousCredential,
    TokenCredential
} = require("@azure/storage-blob");


const account = process.env.ACCOUNT;
const accountKey = process.env.ACCOUNT_KEY;

// Use SharedKeyCredential with storage account and account key
const sharedKeyCredential = new SharedKeyCredential(account, accountKey);

// Use TokenCredential with OAuth token
const tokenCredential = new TokenCredential("token");
tokenCredential.token = "renewedToken"; // Renew the token by updating token field of token credential

// Use AnonymousCredential when url already includes a SAS signature
const anonymousCredential = new AnonymousCredential();

// Use sharedKeyCredential, tokenCredential or anonymousCredential to create a pipeline
const pipeline = StorageURL.newPipeline(sharedKeyCredential);

// List containers
const serviceURL = new ServiceURL(
    // When using AnonymousCredential, following url should include a valid SAS or support public access
    `https://${account}.blob.core.windows.net`,
    pipeline
);

const ONE_MEGABYTE = 1024 * 1024;
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
const ONE_MINUTE = 60 * 1000;

class ContainerService {
    async listContainers() {
        try {
            let marker;
            do {
                const listContainersResponse = await serviceURL.listContainersSegment(
                    Aborter.none,
                    marker
                );

                marker = listContainersResponse.nextMarker;
                let containers = [];
                for (const container of listContainersResponse.containerItems) {
                    containers.push(container);
                }

                return containers;
            } while (marker);
        } catch (error) {
            console.log('error', error);
            return { error: error.body.message.split('\n')[0] }
        }
    }

    async createContainer(containerName) {
        try {
            // Create a container
            containerName = `${containerName}`;
            const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);

            const createContainerResponse = await containerURL.create(Aborter.none);
            console.log(
                `Create container ${containerName} successfully`,
                createContainerResponse.requestId
            );

            return { containerName, response: createContainerResponse }
        } catch (error) {
            console.log('error', error);
            return { error: error.body.message.split('\n')[0] }
        }
    };

    async deleteContainer(containerName) {
        try {
            const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
            // Delete container
            await containerURL.delete(Aborter.none);

            console.log("deleted container");

            return { message: `Container '${containerName}' deleted successfully` }
        } catch (error) {
            return { error: error.body.message.split('\n')[0] }
        }
    }
}

module.exports = new ContainerService();
