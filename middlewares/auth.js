const jwt = require('jsonwebtoken');
const User = require('../features/user/user.model');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).send({ error: 'No token provided' });

    const parts = authHeader.split(' ');

    if (!parts.length === 2)
        return res.status(401).send({ error: 'Token error' });

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme))
        return res.status(401).send({ error: 'Token malformatted' })

    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
        try {
            if (err) return res.status(401).send({ error: 'Token invalid' });

            const userData = await User.findOne({ _id: decoded.id }).select('-_id repository name email');

            req.userId = decoded.id;
            req.repository = userData.repository;
            req.name = userData.name;
            req.email = userData.email;

            return next();
        } catch (error) {
            console.log('error', error)
        }
    })
};