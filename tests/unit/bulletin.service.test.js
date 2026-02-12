const { calculateBulletinMetrics, getMention } = require("../../src/services/bulletin.service");

describe("bulletin.service", () => {
  test("calculateBulletinMetrics should return weighted averages and mention", () => {
    const grades = [
      { subject: "Math", score: 80, coefficient: 2 },
      { subject: "Math", score: 90, coefficient: 2 },
      { subject: "Francais", score: 70, coefficient: 1 },
    ];

    const result = calculateBulletinMetrics(grades);

    expect(result.overallAverage).toBe(82);
    expect(result.mention).toBe("Tres Bien");
    expect(result.subjectResults.length).toBe(2);
  });

  test("getMention should map boundaries correctly", () => {
    expect(getMention(95)).toBe("Excellent");
    expect(getMention(82)).toBe("Tres Bien");
    expect(getMention(75)).toBe("Bien");
    expect(getMention(62)).toBe("Assez Bien");
    expect(getMention(40)).toBe("Insuffisant");
  });
});
