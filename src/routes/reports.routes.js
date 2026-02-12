const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/rbac.middleware");
const { ROLES } = require("../constants/roles");
const { getDailyReport, getFinancialSummary } = require("../controllers/reports.controller");

const reportsRouter = express.Router();

reportsRouter.use(authenticate);
reportsRouter.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER));

reportsRouter.get("/daily", getDailyReport);
reportsRouter.get("/financial-summary", getFinancialSummary);

module.exports = { reportsRouter };
