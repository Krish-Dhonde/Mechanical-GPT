export const calculateForging = (inputs) => {
  const { diameter, length, density, flowStress } = inputs;

  const area = (Math.PI * diameter * diameter) / 4;
  const volume = area * length;
  const weight = volume * density;
  const force = flowStress * area;

  const flashLoss = 0.12 * volume; // 12% default

  return {
    area,
    volume,
    weight,
    force,
    flashLoss
  };
};