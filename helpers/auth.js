const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { badRequest } = require('./error');
const prisma = new PrismaClient();

const isAuthenticated = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: "You need to log in first." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach decoded payload to request object
  
      const user = await prisma.user.findUnique({ where: { UserID: req.user.id} });
      if (!user) {
        return res.status(401).json({ error: "User not found." });
      }
  
      next();
    } catch (error) {
      res.status(500).json({ error: "Token verification failed" });
    }
  };


const isAdmin = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "You need to log in first." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload to request object

    const user = await prisma.user.findUnique({ where: { UserID: req.user.id } });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "You do not have access to this resource." });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Token verification failed" });
  }
};

module.exports = { isAdmin };


module.exports = { isAuthenticated, isAdmin };
