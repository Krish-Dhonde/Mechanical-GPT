export const formatResponse = ({
  operationType,
  subOperation,
  numericalResults,
  costResults,
  safetyWarnings,
  aiExplanation
}) => {

  return {
    status: "success",
    operationType,
    subOperation,
    numericalResults,
    costAnalysis: costResults,
    safetyWarnings,
    aiExplanation
  };
};