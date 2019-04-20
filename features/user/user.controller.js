const User = require('../user/user.model');
const azureService = require('../../services/azure.service');

exports.getContainer = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId });

        let container = await azureService.listContainers();

        container = container.filter(x => x.name === user.repository.toString());

        if (!container || container.length === 0) {
            res.status(404).send({ error: `No containers found for this user` })
        }

        res.send({
            user,
            container
        })
    } catch (error) {
        res.status(400).send({ error })
    }
};

exports.getBlobs = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId });

        const blobs = await azureService.listBlobs(user.repository);

        if (!blobs || blobs.length === 0) {
            res.status(404).send({ error: `No blobs found` })
        }

        res.send({
            user,
            blobs
        })
    } catch (error) {
        res.status(400).send({ error })
    }
};

exports.userSession = async (req, res) => {
    return res.json({
        id: req.userId,
        name: req.name,
        container: req.repository,
        email: req.email
    });
};