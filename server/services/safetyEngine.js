export const safetyCheck = ({ force, temperature, material }) => {
  const warnings = [];

  if (temperature > material.maxSafeTemperature) {
    warnings.push("Temperature exceeds maximum safe limit.");
  }

  if (force > material.machineCompatibility.minPressCapacity) {
    warnings.push(
      "Required force exceeds material's recommended press capacity limit.",
    );
  }

  return warnings;
};
