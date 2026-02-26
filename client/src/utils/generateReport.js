import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReport = (result, inputs, operationType, subOperation) => {
  if (!result || !result.selectedMaterialAnalysis) return;

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
  doc.text(`Operation: ${operationType || "—"}`, 14, 30);
  doc.text(`Sub Operation: ${subOperation || "—"}`, 14, 36);

  // Inputs
  doc.text("Input Parameters:", 14, 46);
  let y = 52;

  Object.entries(inputs || {}).forEach(([key, value]) => {
    if (key !== "image" && y < 270) {
      doc.text(`  ${key}: ${value}`, 14, y);
      y += 6;
    }
  });

  // Numerical Results
  y += 4;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.text("Numerical Results:", 14, y);
  y += 6;

  Object.entries(numericalResults || {}).forEach(([key, value]) => {
    if (y < 270) {
      const formatted = typeof value === "number" ? value.toFixed(4) : value;
      doc.text(`  ${key}: ${formatted}`, 14, y);
      y += 6;
    }
  });

  // Cost Analysis
  y += 4;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.text("Cost Analysis:", 14, y);
  y += 6;

  Object.entries(costAnalysis || {}).forEach(([key, value]) => {
    if (y < 270) {
      const formatted =
        typeof value === "number" ? `\u20b9${value.toLocaleString()}` : value;
      doc.text(`  ${key}: ${formatted}`, 14, y);
      y += 6;
    }
  });

  // Machine Recommendation
  if (machineRecommendation) {
    y += 4;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text("Machine Recommendation:", 14, y);
    y += 6;

    Object.entries(machineRecommendation).forEach(([key, value]) => {
      if (y < 270) {
        doc.text(`  ${key}: ${value}`, 14, y);
        y += 6;
      }
    });
  }

  // Material Comparison Table (Forging only — null for Lathe)
  if (materialComparison && materialComparison.length > 0) {
    y += 6;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.text("Material Comparison:", 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [
        [
          "Material",
          "Force (N)",
          "Weight (kg)",
          "Cost (\u20b9)",
          "Yield Str. (MPa)",
        ],
      ],
      body: materialComparison.map((mat) => [
        mat.material || "—",
        mat.force != null ? Math.round(mat.force).toLocaleString() : "—",
        mat.weight != null ? mat.weight.toFixed(3) : "—",
        mat.cost != null ? mat.cost.toLocaleString() : "—",
        mat.yieldStrength != null ? `${mat.yieldStrength} MPa` : "—",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [255, 107, 0] },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // AI Explanation (new page)
  doc.addPage();
  doc.setFontSize(14);
  doc.text("AI Engineering Interpretation:", 14, 20);

  doc.setFontSize(10);
  const explanation = (aiExplanation || "No AI explanation available.")
    .replace(/\*\*/g, "") // strip markdown bold
    .replace(/#{1,3} /g, ""); // strip markdown headers
  doc.text(doc.splitTextToSize(explanation, 180), 14, 30);

  // Safety Warnings
  const warnings = safetyWarnings || [];
  if (warnings.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Safety Warnings:", 14, 20);

    doc.setFontSize(12);
    warnings.forEach((warn, index) => {
      doc.text(`${index + 1}. ${warn}`, 14, 30 + index * 8);
    });
  }

  doc.save("Mechanical_GPT_Report.pdf");
};
