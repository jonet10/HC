const { validateGradePayload } = require("../../src/validators/grade.validator");

describe("grade.validator", () => {
  test("should return errors when payload is invalid", () => {
    const errors = validateGradePayload({
      studentId: "",
      subject: "",
      score: 150,
      coefficient: 0,
      period: "",
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  test("should pass with valid payload", () => {
    const errors = validateGradePayload({
      studentId: "67a000000000000000000001",
      subject: "Mathematiques",
      score: 85,
      coefficient: 2,
      period: "Trimestre 1",
    });
    expect(errors).toEqual([]);
  });
});
