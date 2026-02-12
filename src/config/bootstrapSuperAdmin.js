const { User } = require("../models/User");
const { ROLES } = require("../constants/roles");

async function bootstrapSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME || "Super";
  const lastName = process.env.SUPER_ADMIN_LAST_NAME || "Admin";

  if (!email || !password) {
    console.warn("SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD missing. Super admin bootstrap skipped.");
    return;
  }

  const existingSuperAdmin = await User.findOne({ role: ROLES.SUPER_ADMIN });
  if (existingSuperAdmin) {
    return;
  }

  await User.create({
    firstName,
    lastName,
    email,
    password,
    role: ROLES.SUPER_ADMIN,
    isActive: true,
  });

  console.log(`Super admin pre-registered: ${email}`);
}

module.exports = { bootstrapSuperAdmin };
