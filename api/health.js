import { API_VERSION, GEMINI_MODEL } from "../backend/config.js";

export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    model: GEMINI_MODEL,
    version: API_VERSION,
  });
}
