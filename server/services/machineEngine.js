export const machineRecommendation = (requiredForce) => {
  // Guard against undefined / zero to avoid division-by-zero (Infinity safetyFactor)
  const force = requiredForce && isFinite(requiredForce) ? requiredForce : 1;

  let category = "";
  let recommendedCapacity = 0;

  if (force <= 1e6) {
    category = "Light Industrial Press";
    recommendedCapacity = 1e6;
  } else if (force <= 3e6) {
    category = "Medium Industrial Press";
    recommendedCapacity = 3e6;
  } else if (force <= 8e6) {
    category = "Heavy Industrial Press";
    recommendedCapacity = 8e6;
  } else {
    category = "Extreme Capacity Forging Press";
    recommendedCapacity = 12e6;
  }

  return {
    requiredForce: force,
    recommendedCapacity,
    category,
    safetyFactor: parseFloat((recommendedCapacity / force).toFixed(4)),
  };
};
