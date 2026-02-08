import fs from "fs";
import { z } from "zod";

const API_URL = "https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json";
const FILE = "frontend/data.json";

// Define expected schema for a round
const RoundSchema = z.object({
  drawNumber: z.string(),
  drawNumberURL: z.string(),
  drawDate: z.string(),
  drawDateFull: z.string(),
  drawName: z.string(),
  drawSize: z.string(),
  drawCRS: z.string(),
  mitext: z.string(),
  DrawText1: z.string(),
  drawText2: z.string(),
  drawDateTime: z.string(),
  drawCutOff: z.string(),
  drawDistributionAsOn: z.string(),
  dd1: z.string(),
  dd2: z.string(),
  dd3: z.string(),
  dd4: z.string(),
  dd5: z.string(),
  dd6: z.string(),
  dd7: z.string(),
  dd8: z.string(),
  dd9: z.string(),
  dd10: z.string(),
  dd11: z.string(),
  dd12: z.string(),
  dd13: z.string(),
  dd14: z.string(),
  dd15: z.string(),
  dd16: z.string(),
  dd17: z.string(),
  dd18: z.string(),
});

const ApiResponseSchema = z.object({
  classes: z.string(),
  rounds: z.array(RoundSchema),
});

// 1. Fetch data from API
console.log("Fetching data from API...");
const response = await fetch(API_URL);
if (!response.ok) {
  console.error(`Failed to fetch API: ${response.status} ${response.statusText}`);
  process.exit(1);
}
const newData = await response.json();

// 2. Validate schema
console.log("Validating schema...");
const parseResult = ApiResponseSchema.safeParse(newData);

if (!parseResult.success) {
  console.error("Schema validation failed:");
  console.error(parseResult.error.format());
  process.exit(1);
}
console.log("Schema validation passed.");

// 3. Read existing data
const oldData = JSON.parse(fs.readFileSync(FILE, "utf8"));
const oldDrawNumber = parseInt(oldData.payload.rounds[0].drawNumber, 10);
const newDrawNumber = parseInt(newData.rounds[0].drawNumber, 10);

console.log(`Current draw number: ${oldDrawNumber}`);
console.log(`API draw number: ${newDrawNumber}`);

// 4. Check if new draw exists
if (newDrawNumber > oldDrawNumber) {
  fs.writeFileSync(
    FILE,
    JSON.stringify(
      { updatedAt: new Date().toISOString(), payload: newData },
      null,
      2
    )
  );
  console.log(`New draw detected: ${newDrawNumber}. Data updated.`);
} else {
  console.log("No new draw. Skipping update.");
}
