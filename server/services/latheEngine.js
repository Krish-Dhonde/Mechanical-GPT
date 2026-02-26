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
  drillDiameter = 20, // For Drilling (mm)
  holeDepth = 50, // For Drilling (mm)
  subOperation = "Turning",
}) => {
  // ── DRILLING ─────────────────────────────────────────────────────────────
  if (subOperation === "Drilling") {
    const cs = cuttingSpeed || 30; // m/min default
    const f = feed || 0.15; // mm/rev default
    const dd = drillDiameter;
    const hd = holeDepth || length;

    // RPM = (Cutting Speed × 1000) / (π × Drill Diameter)
    const rpm = (cs * 1000) / (Math.PI * dd);

    // Feed Rate in mm/min
    const feedRate = f * rpm;

    // Machining Time = Hole Depth / Feed Rate  (in minutes)
    const machiningTime = hd / feedRate;

    // Thrust Force (axial): approx 2 × flowStress × feed × drillDiameter (N)
    // Using simplified thrust force model
    const thrustForce = 2 * materialProps.flowStress * f * (dd / 1000);

    // Torque (N·m) = Thrust Force × (Drill Diameter / 4000)
    const torque = thrustForce * (dd / 4000);

    // Power (W) = (Torque × RPM × 2π) / 60
    const power = (torque * rpm * 2 * Math.PI) / 60;

    // Cutting Force (tangential) ≈ 2 × Torque / (Drill Diameter in m)
    const cuttingForce = (2 * torque) / (dd / 1000);

    // Depth of cut for drilling = drill radius (simplification)
    const effectiveDepthOfCut = dd / 2;

    // Energy (Joules) = Power × Time (seconds)
    const energy = power * (machiningTime * 60);

    return {
      cuttingForce,
      force: cuttingForce,
      thrustForce,
      torque,
      power,
      rpm,
      feedRate, // mm/min
      feed: f, // mm/rev (alias)
      machiningTime,
      effectiveDepthOfCut,
      energy,
      weight: 0,
    };
  }

  // ── STANDARD LATHE OPERATIONS ─────────────────────────────────────────────
  const cuttingForce = materialProps.flowStress * depthOfCut * feed;

  const power = (cuttingForce * cuttingSpeed) / 60;

  // RPM = (Cutting Speed in m/min * 1000) / (π * Diameter in mm)
  const rpm = (cuttingSpeed * 1000) / (Math.PI * workpieceDiameter);

  // Feed Rate in mm/min = feed (mm/rev) × RPM
  const feedRate = feed * rpm;

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
    feedRate, // mm/min
    weight: 0, // Lathe operations don't use forging weight
    machiningTime, // in minutes
    rpm,
    energy, // in Joules
  };
};
