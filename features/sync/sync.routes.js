const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth');
const controller = require('./sync.controller');

// middleware that is specific to this router
router.use(authMiddleware);

router.post('/sync', controller.syncFolder);

module.exports = app => app.use('/upload', router);