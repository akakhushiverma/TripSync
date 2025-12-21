// routes/flights.js
import express from "express";
import Amadeus from "amadeus";

const router = express.Router();

// ⚠️ Hardcoded Amadeus credentials
const amadeus = new Amadeus({
  clientId: "CbAD5JrKWPYjIX5dAngmgOMT1zZZ52GS",
  clientSecret: "WPYzj6h44PnDm96O",
});

// POST /api/flights/search
router.post("/search", async (req, res) => {
  const { origin, destination, date } = req.body;

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: date,
      adults: 1,
      max: 5,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Amadeus API error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      message: "Error fetching flight data",
      error: err.response?.data || err.message,
    });
  }
});

export default router;
