export const machineRecommendation = (requiredForce) => {

  let category = "";
  let recommendedCapacity = 0;

  if (requiredForce <= 1e6) {
    category = "Light Industrial Press";
    recommendedCapacity = 1e6;
  } else if (requiredForce <= 3e6) {
    category = "Medium Industrial Press";
    recommendedCapacity = 3e6;
  } else if (requiredForce <= 8e6) {
    category = "Heavy Industrial Press";
    recommendedCapacity = 8e6;
  } else {
    category = "Extreme Capacity Forging Press";
    recommendedCapacity = 12e6;
  }

  return {
    requiredForce,
    recommendedCapacity,
    category,
    safetyFactor: recommendedCapacity / requiredForce
  };
};