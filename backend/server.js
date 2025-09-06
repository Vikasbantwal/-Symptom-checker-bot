import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware to handle JSON bodies and CORS
app.use(express.json());
app.use(cors());

// Chat API route
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not set. Please check your .env file." });
    }

    // Construct the payload for the Gemini API
    const payload = {
      contents: [{
        parts: [{ text: message }]
      }]
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Make the API call to Gemini
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error("❌ Gemini API Error:", data.error.message);
      return res.status(500).json({ error: data.error.message });
    }

    // Extract the AI's response text
    const geminiReply = data.candidates[0].content.parts[0].text;

    // Send the AI response back to the frontend
    res.json({ reply: geminiReply });
  } catch (error) {
    console.error("❌ Backend error:", error);
    res.status(500).json({ error: "Error contacting the AI API" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
