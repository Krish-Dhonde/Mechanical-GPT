import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Material from "./models/Material.js";

const materials = [
  {
    name: "Steel",
    density: 7850,
    baseFlowStress: 250e6,
    thermalSofteningCoeff: 0.0005,
    yieldStrength: 250,
    ultimateStrength: 400,
    thermalConductivity: 50,
    specificHeat: 500,
    recommendedForgingTemp: { min: 900, max: 1250 },
    maxSafeTemperature: 1300,
    costPerKg: 60,
    machineCompatibility: { minPressCapacity: 500000 },
  },
  {
    name: "Aluminum",
    density: 2700,
    baseFlowStress: 90e6,
    thermalSofteningCoeff: 0.0008,
    yieldStrength: 70,
    ultimateStrength: 110,
    thermalConductivity: 205,
    specificHeat: 897,
    recommendedForgingTemp: { min: 350, max: 500 },
    maxSafeTemperature: 520,
    costPerKg: 150,
    machineCompatibility: { minPressCapacity: 100000 },
  },
  {
    name: "Titanium",
    density: 4510,
    baseFlowStress: 900e6,
    thermalSofteningCoeff: 0.0006,
    yieldStrength: 880,
    ultimateStrength: 950,
    thermalConductivity: 22,
    specificHeat: 520,
    recommendedForgingTemp: { min: 870, max: 1040 },
    maxSafeTemperature: 1100,
    costPerKg: 3500,
    machineCompatibility: { minPressCapacity: 2000000 },
  },
  {
    name: "Copper",
    density: 8960,
    baseFlowStress: 210e6,
    thermalSofteningCoeff: 0.0007,
    yieldStrength: 70,
    ultimateStrength: 220,
    thermalConductivity: 385,
    specificHeat: 385,
    recommendedForgingTemp: { min: 700, max: 900 },
    maxSafeTemperature: 950,
    costPerKg: 600,
    machineCompatibility: { minPressCapacity: 300000 },
  },
  {
    name: "Brass",
    density: 8500,
    baseFlowStress: 160e6,
    thermalSofteningCoeff: 0.0007,
    yieldStrength: 100,
    ultimateStrength: 340,
    thermalConductivity: 109,
    specificHeat: 380,
    recommendedForgingTemp: { min: 650, max: 800 },
    maxSafeTemperature: 850,
    costPerKg: 500,
    machineCompatibility: { minPressCapacity: 250000 },
  },
  {
    name: "Cast Iron",
    density: 7200,
    baseFlowStress: 200e6,
    thermalSofteningCoeff: 0.0004,
    yieldStrength: 140,
    ultimateStrength: 250,
    thermalConductivity: 54,
    specificHeat: 460,
    recommendedForgingTemp: { min: 950, max: 1100 },
    maxSafeTemperature: 1150,
    costPerKg: 40,
    machineCompatibility: { minPressCapacity: 400000 },
  },
  {
    name: "Stainless Steel",
    density: 8000,
    baseFlowStress: 310e6,
    thermalSofteningCoeff: 0.00045,
    yieldStrength: 310,
    ultimateStrength: 620,
    thermalConductivity: 16,
    specificHeat: 502,
    recommendedForgingTemp: { min: 1100, max: 1250 },
    maxSafeTemperature: 1300,
    costPerKg: 200,
    machineCompatibility: { minPressCapacity: 700000 },
  },
  {
    name: "Magnesium",
    density: 1740,
    baseFlowStress: 120e6,
    thermalSofteningCoeff: 0.0009,
    yieldStrength: 90,
    ultimateStrength: 200,
    thermalConductivity: 160,
    specificHeat: 1020,
    recommendedForgingTemp: { min: 350, max: 450 },
    maxSafeTemperature: 490,
    costPerKg: 280,
    machineCompatibility: { minPressCapacity: 150000 },
  },
  {
    name: "Nickel Alloy",
    density: 8440,
    baseFlowStress: 500e6,
    thermalSofteningCoeff: 0.0004,
    yieldStrength: 450,
    ultimateStrength: 760,
    thermalConductivity: 11,
    specificHeat: 440,
    recommendedForgingTemp: { min: 1050, max: 1180 },
    maxSafeTemperature: 1200,
    costPerKg: 2000,
    machineCompatibility: { minPressCapacity: 1200000 },
  },
  {
    name: "Tool Steel",
    density: 7900,
    baseFlowStress: 400e6,
    thermalSofteningCoeff: 0.00035,
    yieldStrength: 400,
    ultimateStrength: 700,
    thermalConductivity: 30,
    specificHeat: 480,
    recommendedForgingTemp: { min: 1000, max: 1200 },
    maxSafeTemperature: 1250,
    costPerKg: 500,
    machineCompatibility: { minPressCapacity: 900000 },
  },
  {
    name: "Carbon Fiber Composite",
    density: 1600,
    baseFlowStress: 600e6,
    thermalSofteningCoeff: 0.0002,
    yieldStrength: 600,
    ultimateStrength: 900,
    thermalConductivity: 7,
    specificHeat: 750,
    recommendedForgingTemp: { min: 0, max: 0 },
    maxSafeTemperature: 350,
    costPerKg: 8000,
    machineCompatibility: { minPressCapacity: 500000 },
  },
  {
    name: "Bronze",
    density: 8800,
    baseFlowStress: 180e6,
    thermalSofteningCoeff: 0.00065,
    yieldStrength: 120,
    ultimateStrength: 380,
    thermalConductivity: 58,
    specificHeat: 376,
    recommendedForgingTemp: { min: 600, max: 800 },
    maxSafeTemperature: 850,
    costPerKg: 550,
    machineCompatibility: { minPressCapacity: 280000 },
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await Material.deleteMany({});
    console.log("Cleared existing materials.");

    await Material.insertMany(materials);
    console.log(`Successfully seeded ${materials.length} materials!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();
