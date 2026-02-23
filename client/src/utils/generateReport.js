import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReport = (result, inputs, operationType, subOperation) => {
  const doc = new jsPDF();

  const {
    selectedMaterialAnalysis,
    machineRecommendation,
    materialComparison,
    aiExplanation,
  } = result;

  const { numericalResults, costAnalysis, safetyWarnings } =
    selectedMaterialAnalysis;

  // Title
  doc.setFontSize(18);
  doc.text("Mechanical GPT Engineering Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Operation: ${operationType}`, 14, 30);
  doc.text(`Sub Operation: ${subOperation}`, 14, 36);

  // Inputs
  doc.text("Input Parameters:", 14, 46);
  let y = 52;

  Object.entries(inputs).forEach(([key, value]) => {
    if (key !== "image") {
      doc.text(`${key}: ${value}`, 16, y);
      y += 6;
    }
  });

  // Numerical Results
  y += 4;
  doc.text("Numerical Results:", 14, y);
  y += 6;

  Object.entries(numericalResults).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 16, y);
    y += 6;
  });

  // Cost Analysis
  y += 4;
  doc.text("Cost Analysis:", 14, y);
  y += 6;

  Object.entries(costAnalysis).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 16, y);
    y += 6;
  });

  // Machine Recommendation
  y += 4;
  doc.text("Machine Recommendation:", 14, y);
  y += 6;

  Object.entries(machineRecommendation).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 16, y);
    y += 6;
  });

  // Material Comparison Table
  y += 6;
  doc.text("Material Comparison:", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Material", "Force (N)", "Cost"]],
    body: materialComparison.map((mat) => [
      mat.material,
      mat.force,
      mat.cost,
    ]),
  });

  // AI Explanation (new page)
  doc.addPage();
  doc.setFontSize(14);
  doc.text("AI Engineering Interpretation:", 14, 20);

  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(aiExplanation, 180), 14, 30);

  // Safety Warnings
  if (safetyWarnings.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Safety Warnings:", 14, 20);

    doc.setFontSize(12);
    safetyWarnings.forEach((warn, index) => {
      doc.text(`${index + 1}. ${warn}`, 14, 30 + index * 8);
    });
  }

  doc.save("Mechanical_GPT_Report.pdf");
};