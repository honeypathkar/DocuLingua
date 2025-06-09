const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const RAPID_API_KEY = process.env.RAPID_API;
const RAPID_API_HOST = process.env.RAPID_API_HOST;

async function translateTextRapidAPI(text, source = "auto", target = "hi") {
  try {
    const response = await axios.request({
      method: "POST",
      url: "https://deep-translate1.p.rapidapi.com/language/translate/v2",
      headers: {
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_API_HOST,
        "Content-Type": "application/json",
      },
      data: {
        q: text,
        source,
        target,
      },
    });

    return response.data.data.translations.translatedText;
  } catch (err) {
    console.error("RapidAPI Translation Error:", err.message);
    return "Translation failed";
  }
}

exports.translateTextRapidAPI = translateTextRapidAPI;
