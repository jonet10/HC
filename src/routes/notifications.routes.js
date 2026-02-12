const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/rbac.middleware");
const { ROLES } = require("../constants/roles");
const { sendDueReminders } = require("../controllers/notifications.controller");

const notificationsRouter = express.Router();

notificationsRouter.use(authenticate);
notificationsRouter.post(
  "/reminders/send-due",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER),
  sendDueReminders
);

module.exports = { notificationsRouter };
