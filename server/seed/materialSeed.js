import mongoose from "mongoose";
import dotenv from "dotenv";
import Material from "../models/Material.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await Material.deleteMany();

await Material.insertMany([
  {
    name: "Steel",

    density: 7850,
    baseFlowStress: 250e6,
    thermalSofteningCoeff: 0.0005,

    yieldStrength: 250e6,
    ultimateStrength: 460e6,

    thermalConductivity: 50,
    specificHeat: 490,

    recommendedForgingTemp: {
      min: 900,
      max: 1250
    },

    maxSafeTemperature: 1300,

    costPerKg: 60,

    machineCompatibility: {
      minPressCapacity: 2e6
    }
  },

  {
    name: "Aluminum",

    density: 2700,
    baseFlowStress: 90e6,
    thermalSofteningCoeff: 0.0008,

    yieldStrength: 95e6,
    ultimateStrength: 150e6,

    thermalConductivity: 237,
    specificHeat: 900,

    recommendedForgingTemp: {
      min: 350,
      max: 500
    },

    maxSafeTemperature: 550,

    costPerKg: 150,

    machineCompatibility: {
      minPressCapacity: 0.8e6
    }
  }
]);

console.log("Materials Seeded");
process.exit();