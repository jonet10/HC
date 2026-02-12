const { User } = require("../models/User");
const { getSchoolFilter, ensureSameSchool } = require("../middlewares/schoolScope.middleware");

async function createUser(req, res, next) {
  try {
    if (req.body.role === "DIRECTOR" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Only SUPER_ADMIN can create a DIRECTOR account." });
    }

    if (req.body.schoolId && !ensureSameSchool(req.body.schoolId, req)) {
      return res.status(403).json({ message: "Cannot create user outside your school." });
    }
    const schoolId = req.body.schoolId || req.user.schoolId;
    const user = await User.create({ ...req.body, schoolId });
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await User.find(getSchoolFilter(req)).select("-password");
    return res.json(users);
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, ...getSchoolFilter(req) }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, ...getSchoolFilter(req) },
      req.body,
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, ...getSchoolFilter(req) });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({ message: "User deleted successfully." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
