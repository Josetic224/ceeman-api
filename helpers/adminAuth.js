const jwt = require("jsonwebtoken");
const { unAuthenticated } = require("../helpers/error");
const { prisma } = require("../db/user.db");

const isAdmin = async (req, res, next) => {
  let token;
  if (
    req.headers["authorization"] &&
    req.headers["authorization"].split(" ")[0] === "Bearer"
  ) {
    token = req.headers["authorization"].split(" ")[1];
  }

  try {
    if (!token) {
      return unAuthenticated(res, "You need to login first.");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload to request object

    // Check if the user exists and if they are an admin
    const user = await prisma.user.findUnique({
      where: { UserID: req.user.id }
    });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "You do not have access to this resource." });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Token verification failed" });
  }
};

module.exports = {
  isAdmin,
};
