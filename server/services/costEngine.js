export const costEstimation = ({
  weight,
  materialCostPerKg,
  operationType,
  time = 0, // time in minutes
}) => {
  const materialCost = weight * materialCostPerKg;

  // Machine cost based on time (Rate: ~₹50/min for industrial machines)
  // If time is not provided, fall back to weight-based estimation
  const machineCost = time > 0 ? time * 50 : weight * 20;

  const totalCost = materialCost + machineCost;

  return {
    materialCost,
    machineCost,
    totalCost,
  };
};
