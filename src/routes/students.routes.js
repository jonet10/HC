const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/rbac.middleware");
const { ROLES } = require("../constants/roles");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentBalance,
} = require("../controllers/students.controller");

const studentsRouter = express.Router();

studentsRouter.use(authenticate);

studentsRouter
  .route("/")
  .post(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER), createStudent)
  .get(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER), getStudents);

studentsRouter.get(
  "/:id/balance",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER, ROLES.PARENT, ROLES.STUDENT),
  getStudentBalance
);

studentsRouter
  .route("/:id")
  .get(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER, ROLES.PARENT, ROLES.STUDENT), getStudentById)
  .put(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER), updateStudent)
  .delete(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR), deleteStudent);

module.exports = { studentsRouter };
