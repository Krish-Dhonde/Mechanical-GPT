import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },

  density: { type: Number, required: true }, // kg/m3
  baseFlowStress: { type: Number, required: true }, // Pa
  thermalSofteningCoeff: { type: Number, required: true },

  yieldStrength: Number,
  ultimateStrength: Number,

  thermalConductivity: Number,
  specificHeat: Number,

  recommendedForgingTemp: {
    min: Number,
    max: Number
  },

  maxSafeTemperature: Number,

  costPerKg: Number,

  machineCompatibility: {
    minPressCapacity: Number // Newton
  }

}, { timestamps: true });

export default mongoose.model("Material", materialSchema);