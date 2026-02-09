import fs from "fs"
import { z } from "zod"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.resolve(__dirname, "../frontend/data.json")

const API_URL = "https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json"
const TIMEOUT_MS = 20000
const RETRY_DELAY_MS = 2000
const MAX_RETRIES = 3

// Strict integer parser
const commaInt = z.string()
  .regex(/^[\d,]+$/, "Must contain only digits and commas") 
  .transform((val, ctx) => {
    const cleaned = val.replace(/,/g, "")
    const parsed = Number(cleaned)

    if (!Number.isSafeInteger(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: `"${val}" is not a safe integer`,
      })
      return z.NEVER
    }
    return parsed
  })

// Strict date parser
const strictISODate = z.iso.date().transform((val) => {
  return new Date(val).toISOString();
});

// Define expected schema for a round
const RoundSchema = z.object({
  drawNumber: z.string(),
  drawNumberURL: z.string(),
  drawDate: strictISODate,
  drawDateFull: z.string(),
  drawName: z.string(),
  drawSize: commaInt,
  drawCRS: commaInt,
  mitext: z.string(),
  DrawText1: z.string(),
  drawText2: z.string(),
  drawDateTime: z.string(),
  drawCutOff: z.string(),
  drawDistributionAsOn: z.string(),
  dd1: commaInt,
  dd2: commaInt,
  dd3: commaInt,
  dd4: commaInt,
  dd5: commaInt,
  dd6: commaInt,
  dd7: commaInt,
  dd8: commaInt,
  dd9: commaInt,
  dd10: commaInt,
  dd11: commaInt,
  dd12: commaInt,
  dd13: commaInt,
  dd14: commaInt,
  dd15: commaInt,
  dd16: commaInt,
  dd17: commaInt,
  dd18: commaInt,
})

const ApiResponseSchema = z.object({
  classes: z.string(),
  rounds: z.array(RoundSchema).min(1, "API must contain at least one round"),
})

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
    
    try {
      console.log(`Attempt ${attempt}/${retries}: Fetching data from API...`)
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`API fetch failed: ${response.status} ${response.statusText}`)
      }
      
      return response
      
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (attempt === retries) {
        throw error
      }
      
      console.warn(`Attempt ${attempt} failed: ${error.message}`)
      console.log(`Retrying in ${RETRY_DELAY_MS}ms...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt))
    }
  }
}

async function main() {
  try {
    const response = await fetchWithRetry(API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    })
    
    const newData = await response.json()

    // 2. Validate and transform schema (strict - no fallbacks)
    console.log("Validating and transforming data...")
    const parseResult = ApiResponseSchema.safeParse(newData)

    if (!parseResult.success) {
      console.error("Schema validation/transformation failed:")
      console.error(JSON.stringify(z.treeifyError(parseResult.error), null, 2))
      
      parseResult.error.issues.forEach((issue) => {
        console.error(`  - Path: ${issue.path.join(".")} | ${issue.message}`)
      })
      
      throw new Error("Schema validation failed")
    }
    
    console.log("Schema validation and transformation passed.")

    // 3. Read existing data
    const oldData = JSON.parse(fs.readFileSync(FILE, "utf8"))
    const oldDrawNumber = oldData.payload.rounds[0].drawNumber
    const newDrawNumber = parseResult.data.rounds[0].drawNumber

    console.log(`Current draw number: ${oldDrawNumber}`)
    console.log(`API draw number: ${newDrawNumber}`)

    // 4. Update if new draw exists
    if (newDrawNumber > oldDrawNumber) {
      const updatedData = {
        updatedAt: new Date().toISOString(),
        payload: parseResult.data,
      }

      fs.writeFileSync(FILE, JSON.stringify(updatedData, null, 2))
      console.log(`New draw detected: ${newDrawNumber}. Data updated.`)
    } else {
      console.log("No new draw. Skipping update.")
    }
    
    process.exit(0)
    
  } catch (error) {
    console.error("Error occurred:")
    console.error(error.message || error)
    process.exit(1)
  }
}

main()