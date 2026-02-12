const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/rbac.middleware");
const { ROLES } = require("../constants/roles");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

const usersRouter = express.Router();

usersRouter.use(authenticate);

usersRouter
  .route("/")
  .post(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR), createUser)
  .get(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR), getUsers);

usersRouter
  .route("/:id")
  .get(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR), getUserById)
  .put(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR), updateUser)
  .delete(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR), deleteUser);

module.exports = { usersRouter };
