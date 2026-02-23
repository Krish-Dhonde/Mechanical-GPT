import Material from "../models/Material.js";

export const getMaterialProperties = async (name, temperature) => {
  const material = await Material.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });

  if (!material) {
    throw new Error("Material not found in database");
  }

  const flowStress =
    material.baseFlowStress *
    (1 - material.thermalSofteningCoeff * (temperature - 25));

  return {
    ...material._doc,
    flowStress,
  };
};

export const materialDB = {
  Steel: {
    density: 7850, // kg/m³
    baseFlowStress: 250e6, // Pa
    costPerKg: 60,
    thermalSofteningCoeff: 0.0005,
  },
  Aluminum: {
    density: 2700,
    baseFlowStress: 90e6,
    costPerKg: 150,
    thermalSofteningCoeff: 0.0008,
  },
};
