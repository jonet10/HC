const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

function getMention(overallAverage) {
  if (overallAverage >= 90) return "Excellent";
  if (overallAverage >= 80) return "Tres Bien";
  if (overallAverage >= 70) return "Bien";
  if (overallAverage >= 60) return "Assez Bien";
  return "Insuffisant";
}

function calculateBulletinMetrics(grades) {
  const bySubject = new Map();
  let weightedSum = 0;
  let totalCoeff = 0;

  for (const grade of grades) {
    const key = grade.subject.trim().toUpperCase();
    const prev = bySubject.get(key) || {
      subject: grade.subject,
      weightedSum: 0,
      coeffTotal: 0,
    };
    prev.weightedSum += grade.score * grade.coefficient;
    prev.coeffTotal += grade.coefficient;
    bySubject.set(key, prev);

    weightedSum += grade.score * grade.coefficient;
    totalCoeff += grade.coefficient;
  }

  const subjectResults = Array.from(bySubject.values()).map((entry) => ({
    subject: entry.subject,
    coefficientTotal: entry.coeffTotal,
    average: Number((entry.weightedSum / entry.coeffTotal).toFixed(2)),
  }));

  const overallAverage = totalCoeff > 0 ? Number((weightedSum / totalCoeff).toFixed(2)) : 0;
  return {
    overallAverage,
    mention: getMention(overallAverage),
    subjectResults,
  };
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateBulletinPdf({ schoolName, student, period, generatedAt, metrics, outputPath }) {
  ensureDirectory(path.dirname(outputPath));

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);
    doc.fontSize(20).text("HaitiConnect - Bulletin Scolaire", { align: "center" });
    doc.moveDown(1);
    doc.fontSize(12).text(`Ecole: ${schoolName || "Non renseignee"}`);
    doc.text(`Eleve: ${student.firstName} ${student.lastName}`);
    doc.text(`Code eleve: ${student.studentCode}`);
    doc.text(`Classe: ${student.classLevel}`);
    doc.text(`Periode: ${period}`);
    doc.text(`Date generation: ${generatedAt.toISOString().slice(0, 10)}`);
    doc.moveDown(1);

    doc.fontSize(12).text("Matiere", 40, doc.y, { continued: true });
    doc.text("Coefficient", 260, doc.y, { continued: true });
    doc.text("Moyenne", 420, doc.y);
    doc.moveTo(40, doc.y + 2).lineTo(550, doc.y + 2).stroke();
    doc.moveDown(0.5);

    metrics.subjectResults.forEach((result) => {
      doc.text(result.subject, 40, doc.y, { continued: true });
      doc.text(String(result.coefficientTotal), 285, doc.y, { continued: true });
      doc.text(String(result.average), 440, doc.y);
      doc.moveDown(0.2);
    });

    doc.moveDown(1);
    doc.font("Helvetica-Bold").text(`Moyenne generale: ${metrics.overallAverage}/100`);
    doc.text(`Mention: ${metrics.mention}`);
    doc.font("Helvetica");
    doc.moveDown(1);
    doc.fontSize(10).text("Document genere par HaitiConnect", { align: "center" });

    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
}

module.exports = { calculateBulletinMetrics, generateBulletinPdf, getMention };
