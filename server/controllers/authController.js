const admin = require('../config/firebaseAdmin');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to the request
    next(); // Allow the request to proceed to the route
  } catch (error) {
    return res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { verifyToken };