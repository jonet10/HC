const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/rbac.middleware");
const { ROLES } = require("../constants/roles");
const {
  createGrade,
  getGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
} = require("../controllers/grades.controller");
const { validateGradeRequest } = require("../validators/grade.validator");

const gradesRouter = express.Router();

gradesRouter.use(authenticate);
gradesRouter.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.TEACHER));

gradesRouter.route("/").post(validateGradeRequest, createGrade).get(getGrades);

gradesRouter
  .route("/:id")
  .get(getGradeById)
  .put(validateGradeRequest, updateGrade)
  .delete(deleteGrade);

module.exports = { gradesRouter };
