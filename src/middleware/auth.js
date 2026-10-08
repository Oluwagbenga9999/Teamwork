import jwt from 'jsonwebtoken';
 const auth = (req, res, next) => {
    const token = req.headers.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 'error', error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ status: 'error', error: 'invalid or expired token' });
    }
 };

 export default auth;