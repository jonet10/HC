const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: missing bearer token." });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized: invalid user." });
    }

    req.user = {
      id: user.id,
      role: user.role,
      schoolId: user.schoolId ? user.schoolId.toString() : null,
      linkedStudentId: user.linkedStudentId ? user.linkedStudentId.toString() : null,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token." });
  }
}

module.exports = { authenticate };
