const { detectTrainingGaps } = require("./training.ai");

exports.analyzeTrainingGaps = async (incidents, nearMisses, trainingData) => {
  return await detectTrainingGaps({
    incidents,
    nearMisses,
    trainingData,
  });
};

// Then call it from your controller when needed
