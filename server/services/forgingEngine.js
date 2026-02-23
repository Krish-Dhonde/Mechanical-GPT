export const forgingSimulation = ({ diameter_m, length_m, materialProps }) => {
  const area = (Math.PI * diameter_m ** 2) / 4;
  const volume = area * length_m;

  const weight = volume * materialProps.density;

  const force = materialProps.flowStress * area;

  const flashLoss = volume * 0.12;

  const energy = force * length_m;

  // Estimated forging cycle time in seconds
  // Influenced by volume and material density (as proxy for heat retention/difficulty)
  const forgingCycleTime = volume * 1000000 * 0.05 + weight * 0.1;

  return {
    area,
    volume,
    weight,
    force,
    flashLoss,
    energy,
    forgingCycleTime: forgingCycleTime / 60, // Convert to minutes for consistency
  };
};
