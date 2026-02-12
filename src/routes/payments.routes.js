const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/rbac.middleware");
const { ROLES } = require("../constants/roles");
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentHistoryByStudent,
} = require("../controllers/payments.controller");

const paymentsRouter = express.Router();

paymentsRouter.use(authenticate);

paymentsRouter
  .route("/")
  .post(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER), createPayment)
  .get(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER), getPayments);

paymentsRouter.get(
  "/student/:studentId/history",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER, ROLES.PARENT, ROLES.STUDENT),
  getPaymentHistoryByStudent
);

paymentsRouter
  .route("/:id")
  .get(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.CASHIER), getPaymentById)
  .put(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR), updatePayment)
  .delete(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR), deletePayment);

module.exports = { paymentsRouter };
