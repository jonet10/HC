const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      schoolId: user.schoolId || null,
      linkedStudentId: user.linkedStudentId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

async function register(req, res, next) {
  try {
    const { schoolId, firstName, lastName, email, password, role, phone, whatsappNumber } = req.body;

    if (role === "DIRECTOR" && req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Only SUPER_ADMIN can register a DIRECTOR." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const user = await User.create({
      schoolId,
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      whatsappNumber,
    });

    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        schoolId: user.schoolId,
        linkedStudentId: user.linkedStudentId || null,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login };
