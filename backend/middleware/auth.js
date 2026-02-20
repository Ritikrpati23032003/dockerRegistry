const jwt = require('jsonwebtoken');

const authenticateToken = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        const secret = process.env.JWT_SECRET || 'your_jwt_secret';

        jwt.verify(token, secret, (err, user) => {
            if (err) return res.status(403).json({ message: 'Forbidden' });

            if (roles.length > 0 && !roles.includes(user.role)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            req.user = user;
            next();
        });
    };
};

module.exports = authenticateToken;
