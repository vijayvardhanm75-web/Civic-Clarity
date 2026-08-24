import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
const { renderPageAsImage } = await import("unpdf");

dotenv.config();

const app = express();
const PORT = 3000;

// Set payload limit to 25mb for high-res photo/PDF uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
    }
    geminiClient = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return geminiClient;
}

// Current Gemini model — multimodal (handles text AND images)
const GEMINI_MODEL = "gemini-3.5-flash";

// Helper: extract the first valid JSON object from a raw model response
function extractJson(rawText: string): any {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not find valid JSON in the AI response.");
  }
  return JSON.parse(jsonMatch[0]);
}

// Helper: render the first page of a PDF to a PNG image (base64), for scanned/image-based PDFs
async function renderPdfFirstPageToPngBase64(pdfBuffer: Buffer): Promise<string> {
  const result = await renderPageAsImage(new Uint8Array(pdfBuffer), 1, {
    canvasImport: () => import("@napi-rs/canvas") as any,
    scale: 2,
  });
  return Buffer.from(result).toString("base64");
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Endpoint: Process and Simplify Document (Text or File / Photo / PDF)
app.post("/api/simplify", async (req, res) => {
  try {
    const { documentText, fileData, mimeType, fileName } = req.body;

    const hasText = Boolean(documentText && typeof documentText === "string" && documentText.trim().length >= 5);
    const hasFile = Boolean(fileData && typeof fileData === "string" && mimeType);

    if (!hasText && !hasFile) {
      res.status(400).json({
        error: "Please provide document text or upload a clear PDF, JPG, or PNG file.",
      });
      return;
    }

    const ai = getGeminiClient();

    // If a PDF was uploaded, first try extracting its real text layer
    let extractedPdfText: string | null = null;
    let pdfRenderedImageBase64: string | null = null;
    let pdfCompletelyFailed = false;

    if (hasFile && mimeType === "application/pdf") {
      const cleanBase64 = fileData.includes(";base64,") ? fileData.split(";base64,")[1] : fileData;
      const pdfBuffer = Buffer.from(cleanBase64, "base64");

      try {
        const parser = new PDFParse({ data: pdfBuffer });
        const pdfResult = await parser.getText();
        const text = (pdfResult.text || "").trim();
        console.log("PDF EXTRACTED TEXT LENGTH:", text.length);
        if (text.length >= 20) {
          extractedPdfText = text;
        }
      } catch (pdfErr) {
        console.error("PDF text extraction error:", pdfErr);
      }

      // No usable text found — likely a scanned/image-based PDF. Try rendering it as an image instead.
      if (!extractedPdfText) {
        try {
          pdfRenderedImageBase64 = await renderPdfFirstPageToPngBase64(pdfBuffer);
          console.log("PDF rendered to image successfully, length:", pdfRenderedImageBase64.length);
        } catch (renderErr) {
          console.error("PDF-to-image rendering error:", renderErr);
          pdfCompletelyFailed = true;
        }
      }

      if (pdfCompletelyFailed) {
        res.status(200).json({
          isLegible: false,
          unreadableReason:
            "This PDF could not be processed. Please upload it as a clear JPG or PNG photo instead.",
          qualityGuidance: [
            "Take a clear photo of the document and upload it as JPG or PNG",
            "Ensure good lighting and that all text is in focus",
          ],
          detectedIssues: ["pdf_processing_failed"],
        });
        return;
      }
    }

    // Effective text used for analysis: real pasted text, OR text extracted from a PDF
    const effectiveText = hasText ? documentText.trim() : extractedPdfText;
    const effectiveHasText = Boolean(effectiveText && effectiveText.length >= 5);

    // Determine what image data (if any) should go to the vision model:
    // either a real uploaded JPG/PNG, or a PDF page we rendered to an image ourselves
    const isRealImageFile = hasFile && mimeType !== "application/pdf";
    const useVision = !effectiveHasText && (isRealImageFile || Boolean(pdfRenderedImageBase64));

    const promptText = `You are CivicClarity, an expert civic assistant dedicated to translating dense government, municipal, and legal documents into clear, neutral, 9th-grade plain language for ordinary citizens.

Respond with ONLY valid JSON (no markdown fences, no preamble) matching exactly this shape:

{
  "isLegible": true,
  "unreadableReason": "",
  "qualityGuidance": [],
  "detectedIssues": [],
  "detectedSourceLanguage": "English",
  "title": "Descriptive plain-language title of this notice",
  "urgency": { "level": "RED|YELLOW|GREEN", "label": "Action Required Now|Action Needed Soon|Informational Only", "reason": "..." },
  "summary": "2-3 sentences, plain language, 9th-grade reading level",
  "whatThisMeansForYou": "1-2 sentences on practical real-world impact",
  "actionItems": [{"id": "act-1", "text": "..."}],
  "deadlines": [{"id": "dl-1", "title": "...", "date": "...", "daysRemainingNote": "", "urgency": "red|yellow|green|none"}],
  "glossary": [{"term": "...", "explanation": "..."}]
}

CRITICAL FIRST STEP — IMAGE/DOCUMENT LEGIBILITY CHECK:
- If this is an uploaded image, photo, or scanned document, first inspect whether the text is actually clear and readable.
- If the image is blurry, too dark, heavily glared, severely cropped/cut off, upside down, or otherwise not legible enough to read with high confidence:
  DO NOT guess, hallucinate, or invent contents!
  Set "isLegible": false
  Set "unreadableReason": "This image isn't clear enough to read properly. Please upload a clearer photo — try better lighting, holding the camera steady, and making sure the full document is in frame."
  Set "qualityGuidance" with helpful tips (lighting, steady camera, full page visible, focus).
  Set "detectedIssues": list specific visual defects (e.g. "blurry_text", "dark_shadows", "cut_off_margins", "low_contrast", "glare").
  Leave the other analysis fields empty or minimal.

IF THE DOCUMENT IS READABLE (or submitted as text):
- Set "isLegible": true
- Automatically detect the source language (English, Hindi, Kannada, Tamil, Telugu, Marathi, etc.) and specify in "detectedSourceLanguage".
- Even if the document is in Hindi, Kannada, or another language, produce the primary analysis in clean plain English (approx 9th-grade reading level).

CRITICAL ANALYSIS RULES:
1. GROUNDING: Strictly ground all output in the document. NEVER invent deadlines, action items, monetary penalties, or clauses not present or directly referenced in the text.
2. URGENCY RATING LOGIC:
   - RED ("Action Required Now"): Strict deadline within 7 days, immediate penalty/enforcement warning, court hearing summons, or disconnection/attachment risk.
   - YELLOW ("Action Needed Soon"): Upcoming deadline within 30 days, registration window, verification renewal, or mandatory compliance step.
   - GREEN ("Informational Only"): No strict urgent deadlines, public advisories, planned maintenance notifications, informational bulletin, or standard circulars.
   Provide a single short sentence explaining why, strictly based on the real deadlines/actions in the text. No deadlines/actions found = green, do NOT invent one.
3. SUMMARY: Exactly 2-3 sentences in plain language (9th-grade reading level), eliminating bureaucratic and legal jargon.
4. "WHAT THIS MEANS FOR YOU": 1-2 direct sentences explaining the practical real-world impact on the citizen.
5. ACTION ITEMS CHECKLIST: Short, specific, checkable items. If no action is required, set "actionItems": [].
6. DEADLINES: Array of specific dates/times sorted soonest first. If no calendar deadline exists, set "deadlines": [].
7. GLOSSARY: Identify 2 to 6 dense jargon terms actually present in the text and provide accessible 1-sentence plain-language definitions.
8. TONE: Keep tone completely neutral and factual, never alarmist, even for urgent/penalty notices.

${effectiveHasText ? `DOCUMENT TEXT:\n"""\n${effectiveText}\n"""` : `Analyze the uploaded document/image provided.`}`;

    // Build the request contents — text-only, or text + image
    let contents: any;
    if (useVision) {
      const imageBase64 = pdfRenderedImageBase64
        ? pdfRenderedImageBase64
        : fileData.includes(";base64,")
        ? fileData.split(";base64,")[1]
        : fileData;
      const imageMimeType = pdfRenderedImageBase64 ? "image/png" : mimeType;
      contents = [
        {
          role: "user",
          parts: [{ text: promptText }, { inlineData: { mimeType: imageMimeType, data: imageBase64 } }],
        },
      ];
    } else {
      contents = promptText;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
    });

    const rawText = response.text || "";
    console.log("RAW AI RESPONSE:", rawText);
    const parsedData = extractJson(rawText);

    // If the document was flagged as illegible, return that state directly
    if (parsedData.isLegible === false) {
      res.status(200).json({
        isLegible: false,
        unreadableReason: parsedData.unreadableReason || "This image isn't clear enough to read properly. Please upload a clearer photo.",
        qualityGuidance: parsedData.qualityGuidance || [],
        detectedIssues: parsedData.detectedIssues || [],
      });
      return;
    }

    // Process valid legible document
    let level: "RED" | "YELLOW" | "GREEN" = "GREEN";
    let label: "Action Required Now" | "Action Needed Soon" | "Informational Only" = "Informational Only";

    const urgencyLevelStr = (parsedData.urgency?.level || "").toUpperCase();
    const urgencyLabelStr = parsedData.urgency?.label || "";

    if (urgencyLevelStr === "RED" || urgencyLabelStr.includes("Now")) {
      level = "RED";
      label = "Action Required Now";
    } else if (urgencyLevelStr === "YELLOW" || urgencyLabelStr.includes("Soon")) {
      level = "YELLOW";
      label = "Action Needed Soon";
    } else {
      level = "GREEN";
      label = "Informational Only";
    }

    const cleanedResult = {
      id: `doc-${Date.now()}`,
      title: parsedData.title || (fileName ? `Analysis: ${fileName}` : "Government Notice Summary"),
      timestamp: Date.now(),
      originalText: documentText || (fileName ? `[Uploaded File: ${fileName}]` : ""),
      detectedSourceLanguage: parsedData.detectedSourceLanguage || "English",
      fileInfo: fileName
        ? {
            name: fileName,
            type: mimeType || "document",
            sizeFormatted: "Uploaded",
          }
        : undefined,
      urgency: {
        level,
        label,
        reason:
          parsedData.urgency?.reason ||
          (level === "GREEN"
            ? "No mandatory actions or strict penalty deadlines found in the document."
            : "Based on the statutory compliance timeline specified in the document."),
      },
      summary: parsedData.summary || "Summary could not be extracted.",
      whatThisMeansForYou:
        parsedData.whatThisMeansForYou || "Please review the document details for any civic obligations.",
      actionItems: (parsedData.actionItems || []).map((item: { id?: string; text: string }, idx: number) => ({
        id: item.id || `act-${idx + 1}`,
        text: item.text,
      })),
      deadlines: (parsedData.deadlines || []).map(
        (
          dl: { id?: string; title: string; date: string; daysRemainingNote?: string; urgency?: string },
          idx: number
        ) => ({
          id: dl.id || `dl-${idx + 1}`,
          title: dl.title,
          date: dl.date,
          daysRemainingNote: dl.daysRemainingNote || "",
          urgency: ["red", "yellow", "green", "none"].includes(dl.urgency || "") ? dl.urgency : "yellow",
        })
      ),
      glossary: (parsedData.glossary || []).map((g: { term: string; explanation: string }) => ({
        term: g.term,
        explanation: g.explanation,
      })),
      hasNoDeadlines: Boolean(
        parsedData.hasNoDeadlines || !parsedData.deadlines || parsedData.deadlines.length === 0
      ),
      hasNoActions: Boolean(
        parsedData.hasNoActions || !parsedData.actionItems || parsedData.actionItems.length === 0
      ),
      translations: {},
    };

    res.json(cleanedResult);
  } catch (error: any) {
    console.error("Error processing document:", error);
    res.status(500).json({
      error: error.message || "Failed to process document. Please verify the input and try again.",
    });
  }
});

// Endpoint: Translate simplified document into Hindi or Kannada
app.post("/api/translate", async (req, res) => {
  try {
    const { targetLanguage, summary, whatThisMeansForYou, urgencyReason, actionItems, glossary } = req.body;

    if (!targetLanguage || !["hi", "kn", "en"].includes(targetLanguage)) {
      res.status(400).json({ error: "Target language must be 'en', 'hi', or 'kn'." });
      return;
    }

    if (targetLanguage === "en") {
      res.json({
        summary,
        whatThisMeansForYou,
        urgencyReason,
        actionItems,
        glossary,
      });
      return;
    }

    const langName = targetLanguage === "hi" ? "Hindi (हिन्दी)" : "Kannada (ಕನ್ನಡ)";

    const ai = getGeminiClient();
    const prompt = `You are an expert civic translator specializing in Indian administrative communication.
Translate the following simplified government document breakdown into natural, highly readable, 9th-grade level ${langName}.

Respond with ONLY valid JSON (no markdown fences, no preamble) in exactly this shape:
{
  "summary": "...",
  "whatThisMeansForYou": "...",
  "urgencyReason": "...",
  "actionItems": ["...", "..."],
  "glossary": [{"term": "...", "explanation": "..."}]
}

Content to translate:
1. Summary: "${summary}"
2. What This Means For You: "${whatThisMeansForYou}"
3. Urgency Reason: "${urgencyReason}"
4. Action Items: ${JSON.stringify(actionItems || [])}
5. Glossary Terms & Explanations: ${JSON.stringify(glossary || [])}

TRANSLATION GUIDELINES:
- Provide authentic, highly accessible ${langName} translations that an ordinary citizen, senior citizen, or rural resident can comfortably understand.
- Avoid overly archaic or excessively complex Sanskritized terms where simple everyday spoken words convey the exact civic meaning clearly.
- Maintain accurate legal and deadline specifics.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const rawText = response.text || "";
    const parsed = extractJson(rawText);

    res.json({
      summary: parsed.summary || summary,
      whatThisMeansForYou: parsed.whatThisMeansForYou || whatThisMeansForYou,
      urgencyReason: parsed.urgencyReason || urgencyReason,
      actionItems: parsed.actionItems || actionItems,
      glossary: parsed.glossary || glossary,
    });
  } catch (error: any) {
    console.error("Error translating simplified content:", error);
    res.status(500).json({
      error: error.message || "Failed to translate content.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicClarity server running on port ${PORT}`);
  });
}

startServer();