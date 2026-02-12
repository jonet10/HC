const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/rbac.middleware");
const { ROLES } = require("../constants/roles");

const authRouter = express.Router();

authRouter.post("/register", authenticate, authorizeRoles(ROLES.SUPER_ADMIN), register);
authRouter.post("/login", login);

module.exports = { authRouter };
