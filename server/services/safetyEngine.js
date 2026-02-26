export const safetyCheck = ({ force, temperature, material }) => {
  const warnings = [];

  // Guard: maxSafeTemperature may not be set for all materials
  if (
    material.maxSafeTemperature != null &&
    temperature > material.maxSafeTemperature
  ) {
    warnings.push("Temperature exceeds maximum safe limit.");
  }

  // Guard: machineCompatibility may not be defined for all materials
  const minPress = material.machineCompatibility?.minPressCapacity;
  if (minPress != null && force != null && force > minPress) {
    warnings.push(
      "Required force exceeds material's recommended press capacity limit.",
    );
  }

  return warnings;
};
