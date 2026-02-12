const { ROLES } = require("../constants/roles");

function getSchoolFilter(req) {
  if (req.user.role === ROLES.SUPER_ADMIN) {
    return {};
  }
  return { schoolId: req.user.schoolId };
}

function ensureSameSchool(targetSchoolId, req) {
  if (req.user.role === ROLES.SUPER_ADMIN) return true;
  return req.user.schoolId === String(targetSchoolId);
}

module.exports = { getSchoolFilter, ensureSameSchool };
