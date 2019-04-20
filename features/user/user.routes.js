const express = require('express');
const router = express.Router();

const controller = require('../user/user.controller');
const authMiddleware = require('../../middlewares/auth');

// middleware that is specific to this router
router.use(authMiddleware);

// define the containers POST route
router.get('/container', controller.getContainer);
router.get('/blobs', controller.getBlobs);
router.get('/me', controller.userSession);

module.exports = app => app.use('/user', router);