const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/rbac.middleware");
const { ROLES } = require("../constants/roles");
const {
  generateBulletin,
  listBulletins,
  getBulletinById,
  exportBulletinPdf,
  sendBulletinWhatsApp,
} = require("../controllers/bulletins.controller");
const { validateBulletinGenerationRequest } = require("../validators/bulletin.validator");

const bulletinsRouter = express.Router();

bulletinsRouter.use(authenticate);

bulletinsRouter.get(
  "/",
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.DIRECTOR,
    ROLES.CASHIER,
    ROLES.TEACHER,
    ROLES.PARENT,
    ROLES.STUDENT
  ),
  listBulletins
);

bulletinsRouter.get(
  "/:id",
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.DIRECTOR,
    ROLES.CASHIER,
    ROLES.TEACHER,
    ROLES.PARENT,
    ROLES.STUDENT
  ),
  getBulletinById
);

bulletinsRouter.post(
  "/generate",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR),
  validateBulletinGenerationRequest,
  generateBulletin
);

bulletinsRouter.get(
  "/:id/export",
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.DIRECTOR,
    ROLES.CASHIER,
    ROLES.TEACHER,
    ROLES.PARENT,
    ROLES.STUDENT
  ),
  exportBulletinPdf
);

bulletinsRouter.post(
  "/:id/send-whatsapp",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.DIRECTOR),
  sendBulletinWhatsApp
);

module.exports = { bulletinsRouter };
