<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🏛️ CivicClarity

**AI-powered plain-language translator for government and legal documents**

CivicClarity turns dense circulars, tax notices, legal summons, and government memos into clear, actionable, plain-English breakdowns — accessible to any citizen, in any language, from any document format.

🔗 **Live App:** [https://civic-clarity.onrender.com](https://civic-clarity.onrender.com)
*(Free tier — first request after inactivity may take ~50 seconds to wake up)*

---

## The Problem

Government and legal notices are often written in dense bureaucratic language that ordinary citizens struggle to understand. Missed deadlines, misunderstood penalties, and ignored notices are common consequences — not because people don't care, but because the documents aren't written for them.

## The Solution

Upload a document — as pasted text, a typed PDF, a scanned PDF, or even a photo taken on a phone — and CivicClarity instantly returns:

- 🚦 **Urgency rating** — Action Required Now / Action Needed Soon / Informational Only
- 📝 **Plain-language summary** — 9th-grade reading level, no jargon
- 💡 **"What this means for you"** — the real-world impact, explained simply
- ✅ **Action checklist** — specific, concrete steps to take
- 📅 **Deadlines** — extracted and sorted, soonest first
- 📖 **Glossary** — jargon terms explained in plain language
- 🌐 **Hindi & Kannada translation** — one click to translate the full breakdown
- 🔊 **Read-aloud** — accessibility for low-literacy users

## Why It Matters

Built for the **AI for Digital Public Infrastructure & Governance** track — this isn't just a summarizer, it's a **triage and comprehension tool** designed to help ordinary citizens actually act on the government communications that affect them. It's designed to scale across any Indian state or municipality, not tied to one city's document format or language.

---

## Screenshots

*(Add 2-3 screenshots here: the upload screen, a result with a red urgency badge, and the Hindi/Kannada translation view)*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| AI | **Google Gemini** (`gemini-3.5-flash`) — text understanding + computer vision for photos/scanned documents |
| Document Processing | `pdf-parse` (typed PDFs), `unpdf` + `@napi-rs/canvas` (scanned PDFs → image for vision analysis) |
| Deployment | Render |

## How It Works

1. **Text or typed PDF** → text extracted directly, analyzed by Gemini
2. **Photo or scanned PDF** → rendered/read as an image, analyzed by Gemini's vision capability
3. Every input path returns the same structured breakdown: urgency, summary, impact, action items, deadlines, glossary
4. Documents flagged as blurry or unreadable get clear, honest feedback instead of a hallucinated guess

## Run Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env
# Get a free key at https://aistudio.google.com/apikey

# 3. Run the app
npm run dev
```

The app runs at `http://localhost:3000`.

## Responsible AI Notes

- Never invents deadlines, penalties, or action items not present in the source document
- Explicitly flags unreadable/unclear uploads instead of guessing at their content
- Keeps a neutral, factual tone even for urgent or penalty-related notices

---

*Built for Hack 2 Skill — Track: AI for Digital Public Infrastructure & Governance*
