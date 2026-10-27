const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to access your data.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || decoded.id;
    
    if (!req.userId) {
      return res.status(401).json({
        message: "Invalid login token. Please log in again.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your session has expired. Please log in again.",
    });
  }
}

module.exports = authMiddleware;