export const latheSimulation = ({
  cuttingSpeed,
  feed,
  depthOfCut,
  materialProps,
  workpieceDiameter = 50, // Default if not provided
  length = 100, // Default if not provided
  passCount = 1,
  taperAngle = 0, // For Taper Turning (degrees)
  threadPitch = 1, // For Thread Cutting (mm/rev)
  subOperation = "Turning",
}) => {
  const cuttingForce = materialProps.flowStress * depthOfCut * feed;

  const power = (cuttingForce * cuttingSpeed) / 60;

  // RPM = (Cutting Speed in m/min * 1000) / (π * Diameter in mm)
  const rpm = (cuttingSpeed * 1000) / (Math.PI * workpieceDiameter);

  let machiningTime;
  let effectiveFeed = feed;

  if (subOperation === "Thread Cutting") {
    // Thread cutting uses thread pitch as feed rate
    effectiveFeed = threadPitch;
    machiningTime = (length * passCount) / (effectiveFeed * rpm);
  } else if (subOperation === "Taper Turning") {
    // Taper adds a correction factor based on angle
    const taperFactor = 1 + Math.tan((taperAngle * Math.PI) / 180) * 0.15;
    machiningTime = ((length * passCount) / (feed * rpm)) * taperFactor;
  } else if (subOperation === "Drilling") {
    // Drilling time = Hole Depth / (Feed * RPM)
    machiningTime = length / (feed * rpm);
  } else {
    // Turning and Facing
    machiningTime = (length * passCount) / (feed * rpm);
  }

  // Energy (Joules) = Force × Distance (length in meters)
  const energy = cuttingForce * (length / 1000);

  return {
    cuttingForce,
    force: cuttingForce, // Alias for compatibility
    power,
    weight: 0, // Lathe operations don't use forging weight
    machiningTime, // in minutes
    rpm,
    energy, // in Joules
  };
};
