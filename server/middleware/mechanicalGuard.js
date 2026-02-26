export const mechanicalGuard = (req, res, next) => {
  const { operationType } = req.body;

  // Allow requests with no operationType — these are pure AI chat queries
  if (!operationType) return next();

  const supportedOperations = ["Forging", "Lathe"];

  if (!supportedOperations.includes(operationType)) {
    return res.status(400).json({
      message: `Unsupported operation type. Supported: ${supportedOperations.join(", ")}`,
    });
  }

  next();
};
