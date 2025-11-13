import express from "express";
import Vehicle from "../models/Vehicle.js";

const router = express.Router();

/* ==========================================================
   🚗 DriveMatch AI Advisor v4 — Hyper Semantic Vehicle Engine
   ========================================================== */

router.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Please provide a query text." });
    }

    const q = query.toLowerCase();
    const filter = {};
    let sortOption = {};
    let reasoning = [];
    let confidence = 100;
    let contextTags = [];
    let intent = "filter";

    /* ----------------------------------------------------------
       1️⃣ TYPE DETECTION (cars, bikes, scooters)
    ---------------------------------------------------------- */
    if (/(car|sedan|suv|hatchback|jeep)/.test(q)) {
      filter.type = "car";
      reasoning.push("Detected vehicle type: Car.");
      contextTags.push("type:car");
    } else if (/(bike|motorcycle|scooter|moped)/.test(q)) {
      filter.type = "bike";
      reasoning.push("Detected vehicle type: Bike.");
      contextTags.push("type:bike");
    }

    /* ----------------------------------------------------------
       2️⃣ BRAND RECOGNITION (fuzzy + synonyms)
    ---------------------------------------------------------- */
    const brandMap = [
      ["tata", ["tata"]],
      ["mahindra", ["mahindra"]],
      ["maruti suzuki", ["maruti", "suzuki"]],
      ["hyundai", ["hundai", "hyund"]],
      ["toyota", ["toyta", "toyotta"]],
      ["kia", ["kia"]],
      ["honda", ["honda"]],
      ["renault", ["renault"]],
      ["nissan", ["nissan"]],
      ["skoda", ["skoda"]],
      ["volkswagen", ["vw", "volks", "volkwagen"]],
      ["audi", ["audi"]],
      ["bmw", ["bmw"]],
      ["mercedes", ["mercedez", "benz"]],
      ["bajaj", ["bajaj"]],
      ["hero", ["hero"]],
      ["yamaha", ["yamaha"]],
      ["royal enfield", ["enfield", "bullet"]],
      ["tvs", ["tvs"]],
    ];
    for (const [brand, variations] of brandMap) {
      if (variations.some(v => q.includes(v))) {
        filter.brand = new RegExp(brand, "i");
        reasoning.push(`Brand detected: ${brand}`);
        contextTags.push(`brand:${brand}`);
        break;
      }
    }

    /* ----------------------------------------------------------
       3️⃣ FUEL TYPE DETECTION
    ---------------------------------------------------------- */
    if (q.match(/electric|ev|battery/)) {
      filter.fuelType = "Electric";
      reasoning.push("Detected Electric vehicles.");
      contextTags.push("fuel:electric");
    } else if (q.match(/diesel/)) {
      filter.fuelType = "Diesel";
      contextTags.push("fuel:diesel");
    } else if (q.match(/petrol|gasoline/)) {
      filter.fuelType = "Petrol";
      contextTags.push("fuel:petrol");
    } else if (q.match(/hybrid|plug-in/)) {
      filter.fuelType = "Hybrid";
      contextTags.push("fuel:hybrid");
    } else if (q.match(/cng|gas/)) {
      filter.fuelType = "CNG";
      contextTags.push("fuel:cng");
    }

    /* ----------------------------------------------------------
       4️⃣ PRICE DETECTION (under / above / between)
    ---------------------------------------------------------- */
    const parsePrice = (val, unit) => {
      let n = parseInt(val);
      if (unit === "lakh") n *= 100000;
      if (unit === "k") n *= 1000;
      return n;
    };

    const between = q.match(/between\s?(\d+)\s?(lakh|k)?\s?(and|to)\s?(\d+)\s?(lakh|k)?/);
    const under = q.match(/under\s?(\d+)\s?(lakh|k)?/);
    const above = q.match(/above\s?(\d+)\s?(lakh|k)?/);

    if (between) {
      const min = parsePrice(between[1], between[2]);
      const max = parsePrice(between[4], between[5]);
      filter.price = { $gte: min, $lte: max };
      reasoning.push(`Price range detected between ${min} and ${max}.`);
    } else if (under) {
      const price = parsePrice(under[1], under[2]);
      filter.price = { $lte: price };
      reasoning.push(`Price detected: under ${price}.`);
    } else if (above) {
      const price = parsePrice(above[1], above[2]);
      filter.price = { $gte: price };
      reasoning.push(`Price detected: above ${price}.`);
    }

    /* ----------------------------------------------------------
       5️⃣ TRANSMISSION DETECTION
    ---------------------------------------------------------- */
    if (q.includes("automatic")) filter.transmission = "Automatic";
    else if (q.includes("manual")) filter.transmission = "Manual";

    /* ----------------------------------------------------------
       6️⃣ PERFORMANCE / ENGINE / MILEAGE
    ---------------------------------------------------------- */
    const engineMatch = q.match(/(\d+)\s?(cc|bhp)/);
    if (engineMatch) {
      const engine = parseInt(engineMatch[1]);
      filter.enginePower = { $gte: engine };
      reasoning.push(`Engine size ≥ ${engine} ${engineMatch[2]}.`);
    }

    const mileageMatch = q.match(/mileage\s?(above|over|more than)?\s?(\d+)/);
    if (mileageMatch) {
      const mileage = parseInt(mileageMatch[2]);
      filter.mileage = { $gte: mileage };
      reasoning.push(`Mileage requirement ≥ ${mileage} km/l.`);
    }

    /* ----------------------------------------------------------
       7️⃣ CONTEXT DETECTION (use-case logic)
    ---------------------------------------------------------- */
    if (q.includes("family")) {
      filter.bodyType = /suv|sedan/i;
      filter.mileage = { $gte: 15 };
      reasoning.push("User wants a family vehicle — prioritizing SUVs or sedans.");
      contextTags.push("usecase:family");
    }

    if (q.includes("sport") || q.includes("fast") || q.includes("performance")) {
      filter.performanceScore = { $gte: 80 };
      reasoning.push("Sporty preference — prioritizing high performance vehicles.");
      contextTags.push("usecase:sport");
    }

    if (q.includes("eco") || q.includes("low emission")) {
      filter.fuelType = /electric|hybrid/i;
      reasoning.push("Eco-friendly preference detected.");
      contextTags.push("usecase:eco");
    }

    if (q.includes("budget") || q.includes("affordable") || q.includes("cheap")) {
      filter.price = { $lte: 800000 };
      reasoning.push("Budget-focused search detected.");
      contextTags.push("usecase:budget");
    }

    if (q.includes("luxury") || q.includes("premium")) {
      filter.price = { $gte: 2000000 };
      reasoning.push("Luxury segment detected.");
      contextTags.push("usecase:luxury");
    }

    /* ----------------------------------------------------------
       8️⃣ INTENT DETECTION
    ---------------------------------------------------------- */
    if (q.includes("recommend") || q.includes("suggest")) intent = "recommend";
    if (q.includes("compare")) intent = "compare";
    if (q.includes("best") || q.includes("top")) sortOption = { performanceScore: -1 };
    if (q.includes("latest") || q.includes("new")) sortOption = { createdAt: -1 };
    if (q.includes("cheapest") || q.includes("lowest")) sortOption = { price: 1 };

    /* ----------------------------------------------------------
       9️⃣ FETCH VEHICLES
    ---------------------------------------------------------- */
    const vehicles = await Vehicle.find(filter)
      .sort(sortOption)
      .limit(15)
      .select("name brand price fuelType mileage transmission enginePower bodyType performanceScore image");

    /* ----------------------------------------------------------
       🔟 CONFIDENCE & FALLBACK
    ---------------------------------------------------------- */
    if (vehicles.length === 0) {
      const trending = await Vehicle.find({ isTrending: true }).limit(8);
      confidence -= 30;
      reasoning.push("No direct match found. Showing trending vehicles instead.");
      return res.json({
        query,
        intent,
        confidence,
        fallback: true,
        reasoning,
        message: "No exact matches found — showing trending suggestions.",
        contextTags,
        results: trending,
      });
    }

    confidence -= Math.floor(Math.random() * 5); // small randomness to simulate "thinking"

    /* ----------------------------------------------------------
       ✅ RESPONSE — HUMANIZED
    ---------------------------------------------------------- */
    const reply = {
      query,
      intent,
      confidence,
      reasoning,
      contextTags,
      appliedFilters: filter,
      totalResults: vehicles.length,
      message: `I found ${vehicles.length} matching ${filter.type || "vehicles"} ${
        filter.brand ? "from " + filter.brand + " " : ""
      }that suit your preferences.`,
      results: vehicles.slice(0, 10),
    };

    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
