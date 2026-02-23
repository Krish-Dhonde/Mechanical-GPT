import Material from "../models/Material.js";
import { forgingSimulation } from "./forgingEngine.js";

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

    const cost = simulation.weight * mat.costPerKg;

    comparisonResults.push({
      material: mat.name,
      force: simulation.force,
      weight: simulation.weight,
      energy: simulation.energy,
      cost,
      yieldStrength: mat.yieldStrength,
      density: mat.density,
    });
  }

  // Rank by cost efficiency
  comparisonResults.sort((a, b) => a.cost - b.cost);

  return comparisonResults;
};
