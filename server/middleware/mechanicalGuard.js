export const mechanicalGuard = (req, res, next) => {
  const { operationType } = req.body;

  const supportedOperations = ["Forging"]; // Add "Lathe" when ready

  if (!operationType || !supportedOperations.includes(operationType)) {
    return res.status(400).json({
      message: `Operation type required. Supported: ${supportedOperations.join(", ")}`,
    });
  }

  next();
};
