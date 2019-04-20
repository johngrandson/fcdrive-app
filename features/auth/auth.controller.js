const bcrypt = require('bcryptjs');
const User = require('../user/user.model');
const jwt = require('jsonwebtoken');
const azureService = require('../../services/container.service');
const blobService = require('../../services/azure.service');

function generateToken(params = {}) {
    return jwt.sign(params, process.env.SECRET, {
        expiresIn: 86400,
    })
}

exports.register = async (req, res) => {
    const { email, name, password, isAdmin } = req.body;

    let errorMessage = [];

    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'User already exists' });

        if (!name)
            errorMessage.push("User name is required");
        if (!password)
            errorMessage.push("User password is required");
        if (!email)
            errorMessage.push("User email is required");
        if (!isAdmin)
            errorMessage.push("User role is required");

        const user = await User.create(req.body);

        user.password = undefined;

        // Create a new container in azure for this user
        const newContainer = await azureService.createContainer(user.repository);

        function sleep(time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }

        // Sleep half of a second and create a file 'log.txt' in container
        sleep(500)
            .then(() => {
                if (newContainer)
                    blobService.uploadString(newContainer.containerName, 'log.txt', 'created log.txt');
            });

        return res.send({
            user,
            token: generateToken({ id: user.id })
        })

    } catch (error) {
        res.status(400).send({ errorMessage })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        if (!await bcrypt.compare(password, user.password))
            return res.status(400).send({ error: 'Invalid password' });

        user.password = undefined;

        res.send({
            user,
            token: generateToken({ id: user.id })
        });

    } catch (error) {
        res.status(400).send({ error })

    }
}