// controllers/advisorController.js
import Vehicle from "../models/Vehicle.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ask ChatGPT to convert natural language → filters
const askChatGPT = async (query) => {
  const prompt = `
You are a vehicle query interpreter for an app named DriveMatch.

User query: "${query}"

Extract meaning and return ONLY valid JSON with these keys:
{
  "type": "car/bike/null",
  "maxPrice": number or null,
  "minPrice": number or null,
  "brand": string or null,
  "fuelType": string or null,
  "transmission": string or null,
  "bodyType": string or null
}

Rules:
- Detect prices written as "30 lakh", "3 million", "under 5 lakh", etc.
- Detect brands like BMW, Audi, Tata, Hyundai, etc.
- If not mentioned, return null for the field.
- Output ONLY JSON. No extra text.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return {};
  }
};

export const askAdvisor = async (req, res) => {
  try {
    const query = req.body.query || "";

    // 1️⃣ ChatGPT interprets user query → structured filters
    const filters = await askChatGPT(query);

    let mongoQuery = {};

    if (filters.type) mongoQuery.type = filters.type;
    if (filters.brand) mongoQuery.brand = new RegExp(filters.brand, "i");
    if (filters.fuelType) mongoQuery.fuelType = new RegExp(filters.fuelType, "i");
    if (filters.transmission) mongoQuery.transmission = new RegExp(filters.transmission, "i");
    if (filters.bodyType) mongoQuery.bodyType = new RegExp(filters.bodyType, "i");

    if (filters.maxPrice) {
      mongoQuery.price = { ...mongoQuery.price, $lte: filters.maxPrice };
    }
    if (filters.minPrice) {
      mongoQuery.price = { ...mongoQuery.price, $gte: filters.minPrice };
    }

    // 2️⃣ Query your database
    const vehicles = await Vehicle.find(mongoQuery)
      .sort({ price: 1 })
      .limit(20);

    // 3️⃣ Prepare reasoning
    const reasoning = [];
    Object.entries(filters).forEach(([k, v]) => {
      if (v) reasoning.push(`${k}: ${v}`);
    });

    return res.json({
      message:
        vehicles.length > 0
          ? `Found ${vehicles.length} matching vehicles.`
          : "No vehicles match your filters.",
      results: vehicles,
      reasoning,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Advisor error" });
  }
};
