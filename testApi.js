import { generateQuestions, generateTripPlan } from './src/data/tripPlanner.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

// Polyfill import.meta.env for Node
globalThis.import = { meta: { env: process.env } };
// If using older node, we might need to mock fetch. Assuming node 18+.

async function test() {
  console.log("Testing generateQuestions...");
  try {
    const q = await generateQuestions("Cerdeña");
    console.log("Questions:", q);
  } catch (e) {
    console.error("Questions Error:", e);
  }

  console.log("\nTesting generateTripPlan...");
  try {
    const plan = await generateTripPlan(
      "Cerdeña", 
      { start: '2026-08-10', end: '2026-08-15' }, 
      ["Pareja", "Relax", "Presupuesto alto"]
    );
    console.log("Plan generated successfully:", plan.destination);
    console.log("Days:", plan.days);
    console.log("Flights:", plan.flights);
  } catch (e) {
    console.error("Plan Error:", e);
  }
}

test();
