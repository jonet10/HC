function validateBulletinGenerationPayload(payload) {
  const errors = [];

  if (!payload.studentId) errors.push("studentId is required.");
  if (!payload.period || typeof payload.period !== "string") errors.push("period is required.");

  return errors;
}

function validateBulletinGenerationRequest(req, res, next) {
  const errors = validateBulletinGenerationPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }
  return next();
}

module.exports = {
  validateBulletinGenerationPayload,
  validateBulletinGenerationRequest,
};
