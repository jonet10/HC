const { validateBulletinGenerationPayload } = require("../../src/validators/bulletin.validator");

describe("bulletin.validator", () => {
  test("should fail when required fields are missing", () => {
    const errors = validateBulletinGenerationPayload({});
    expect(errors).toContain("studentId is required.");
    expect(errors).toContain("period is required.");
  });

  test("should pass for valid request payload", () => {
    const errors = validateBulletinGenerationPayload({
      studentId: "67a000000000000000000001",
      period: "Semestre 1",
    });
    expect(errors).toEqual([]);
  });
});
