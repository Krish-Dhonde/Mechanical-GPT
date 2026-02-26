import Material from "../models/Material.js";
import { forgingSimulation } from "./forgingEngine.js";
import { latheSimulation } from "./latheEngine.js";

/**
 * Compare all materials for a FORGING operation.
 * Returns sorted by cost efficiency.
 */
export const compareMaterials = async ({
  diameter_m,
  length_m,
  temperature,
  selectedMaterial,
}) => {
  const materials = await Material.find();
  const comparisonResults = [];

  for (const mat of materials) {
    const flowStress =
      mat.baseFlowStress * (1 - mat.thermalSofteningCoeff * (temperature - 25));

    const simulation = forgingSimulation({
      diameter_m,
      length_m,
      materialProps: {
        density: mat.density,
        flowStress,
      },
    });

    const cost = simulation.weight * (mat.costPerKg || 0);

    comparisonResults.push({
      material: mat.name,
      force: simulation.force,
      weight: simulation.weight,
      energy: simulation.energy,
      forgingCycleTime: simulation.forgingCycleTime,
      cost,
      yieldStrength: mat.yieldStrength,
      density: mat.density,
      thermalConductivity: mat.thermalConductivity,
    });
  }

  comparisonResults.sort((a, b) => a.cost - b.cost);
  return comparisonResults;
};

/**
 * Compare all materials for a LATHE operation.
 * Simulates cutting force, power, machining time, and estimates machine cost per material.
 * Returns sorted by total estimated cost (machine time cost).
 */
export const compareMaterialsLathe = async ({
  cuttingSpeed,
  feed,
  depthOfCut,
  workpieceDiameter,
  length,
  passCount,
  taperAngle,
  threadPitch,
  drillDiameter,
  holeDepth,
  subOperation,
}) => {
  const materials = await Material.find();
  const comparisonResults = [];

  for (const mat of materials) {
    const flowStress = mat.baseFlowStress * (1 - mat.thermalSofteningCoeff * 0);

    const matProps = { ...mat._doc, flowStress };

    let sim;
    try {
      sim = latheSimulation({
        cuttingSpeed: cuttingSpeed || 80,
        feed: feed || 0.2,
        depthOfCut: depthOfCut || 1,
        materialProps: matProps,
        workpieceDiameter: workpieceDiameter || 50,
        length: length || 100,
        passCount: passCount || 1,
        taperAngle: taperAngle || 0,
        threadPitch: threadPitch || 1,
        drillDiameter: drillDiameter || 20,
        holeDepth: holeDepth || 50,
        subOperation,
      });
    } catch {
      continue; // skip materials that cause simulation errors
    }

    // Machine cost estimate: ₹50/min × machining time
    const machineCost = (sim.machiningTime || 0) * 50;

    comparisonResults.push({
      material: mat.name,
      cuttingForce: sim.cuttingForce,
      power: sim.power,
      machiningTime: sim.machiningTime,
      feedRate: sim.feedRate,
      rpm: sim.rpm,
      thrustForce: sim.thrustForce || null,
      torque: sim.torque || null,
      machineCost,
      yieldStrength: mat.yieldStrength,
      density: mat.density,
      thermalConductivity: mat.thermalConductivity,
      machinability:
        mat.yieldStrength > 600
          ? "Hard"
          : mat.yieldStrength > 300
            ? "Medium"
            : "Easy",
    });
  }

  // Sort by machining time (fastest = most cost-efficient for lathe)
  comparisonResults.sort(
    (a, b) => (a.machiningTime || 0) - (b.machiningTime || 0),
  );
  return comparisonResults;
};
