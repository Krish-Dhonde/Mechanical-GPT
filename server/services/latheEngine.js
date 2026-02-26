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
  // Drilling-specific inputs
  drillDiameter = 10,
  holeDepth = 30,
  drillFeed = 0.2,
}) => {
  // ── Drilling Operation ──────────────────────────────────────────
  if (subOperation === "Drilling") {
    const D = drillDiameter; // mm
    const L = holeDepth; // mm

    // Effective cutting speed defaulting
    const Vc = cuttingSpeed || 25; // m/min default for drilling
    const f = drillFeed || feed || 0.2; // mm/rev

    // RPM = (Vc * 1000) / (π * D)
    const rpm = (Vc * 1000) / (Math.PI * D);

    // Drilling time (min) = L / (f * rpm)
    const drillingTime = L / (f * rpm);

    // Feed rate (mm/min) = f * rpm
    const feedRate = f * rpm;

    // Cutting force (tangential) using flow stress — simplified drilling model
    // Thrust force = 0.5 * flowStress * f * D (empirical approximation)
    const thrustForce = 0.5 * materialProps.flowStress * f * (D / 1000); // N (D in meters)

    // Torque (Nm) = Thrust * D/4 (simplified)
    const torque = thrustForce * (D / 4000); // Nm

    // Power (W) = Torque * angular_velocity = Torque * (2π * rpm / 60)
    const power = torque * ((2 * Math.PI * rpm) / 60);

    // Actual depth of cut for drilling = drill radius
    const effectiveDepthOfCut = D / 2;

    // Energy = Thrust force × hole depth (J)
    const energy = thrustForce * (L / 1000); // L in meters

    // Material removal rate (mm³/min)
    const mrr = (Math.PI * D * D * f * rpm) / 4;

    return {
      cuttingForce: thrustForce,
      force: thrustForce,
      thrustForce,
      torque,
      rpm,
      feedRate,
      feed: f,
      depthOfCut: effectiveDepthOfCut,
      drillingTime,
      machiningTime: drillingTime,
      power,
      energy,
      mrr,
      weight: 0,
      subOperation: "Drilling",
    };
  }

  // ── Standard Lathe Operations ────────────────────────────────────
  const cuttingForce = materialProps.flowStress * depthOfCut * feed;
  const power = (cuttingForce * cuttingSpeed) / 60;

  // RPM = (Cutting Speed in m/min * 1000) / (π * Diameter in mm)
  const rpm = (cuttingSpeed * 1000) / (Math.PI * workpieceDiameter);

  // Feed rate in mm/min
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

  // Material Removal Rate (mm³/min)
  const mrr = cuttingSpeed * 1000 * feed * depthOfCut; // mm³/min

  return {
    cuttingForce,
    force: cuttingForce,
    power,
    weight: 0,
    machiningTime,
    rpm,
    feedRate,
    feed,
    depthOfCut,
    energy,
    mrr,
  };
};
