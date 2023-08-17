const axios = require("axios");

const HttpError = require("../models/http-error");

const API_BASE_URL = process.env.GOOGLE_MAP_API_KEY;

async function getCoordsForAddress(address) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}`,
    );

    const data = response.data;

    if (!data || data.length === 0) {
      throw new HttpError(
        "Could not find location for the specified address.",
        422,
      );
    }

    const coordinates = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    return coordinates;
  } catch (error) {
    throw new HttpError(
      "Error fetching data from the OpenStreetMap Nominatim API.",
      500,
    );
  }
}

module.exports = getCoordsForAddress;
