function validateGradePayload(payload) {
  const errors = [];

  if (!payload.studentId) errors.push("studentId is required.");
  if (!payload.subject || typeof payload.subject !== "string") errors.push("subject is required.");
  if (typeof payload.score !== "number" || payload.score < 0 || payload.score > 100) {
    errors.push("score must be a number between 0 and 100.");
  }
  if (
    typeof payload.coefficient !== "number" ||
    payload.coefficient < 1 ||
    payload.coefficient > 20
  ) {
    errors.push("coefficient must be a number between 1 and 20.");
  }
  if (!payload.period || typeof payload.period !== "string") errors.push("period is required.");

  return errors;
}

function validateGradeRequest(req, res, next) {
  const errors = validateGradePayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }
  return next();
}

module.exports = { validateGradePayload, validateGradeRequest };
