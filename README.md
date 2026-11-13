# MarketPulse AI

A GitHub Pages-ready static PWA combining:
- Product Marketing Studio: upload a product image and preview campaign placements (mug, T-shirt, billboard, packaging, social post, retail display).
- Customer Sentiment Dashboard: paste/import reviews, estimate sentiment locally, chart review trends, build a keyword cloud, generate a rule-based executive summary, and export CSV.
- Responsive layout, dark mode, English/Hindi/Odia heading localization, installable PWA, and static admin demo.

## Run locally

No build step or package installation is required. Serve this folder over HTTP (service workers do not run from `file://`).

```bash
python -m http.server 8000
```

Open http://localhost:8000.

## Deploy to GitHub Pages

1. Create a GitHub repository, for example `marketpulse-ai`.
2. Upload all files and folders in this ZIP to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then Save.
6. Wait for the Pages deployment and open the URL shown in Settings → Pages.

The app uses relative asset paths and works when hosted from a project subpath. You can also use the included workflow at `.github/workflows/pages.yml` to deploy via GitHub Actions.

## What works without a backend

- Image upload and local product-image previews.
- Scene selection and campaign concept cards.
- Paste or import newline-separated reviews / CSV text.
- Lightweight keyword sentiment classification, trend chart, word cloud and three suggested actions.
- CSV export, dark mode, browser-local endpoint setting, PWA shell/offline cache.
- Demo admin screen.

**Important:** The marketing previews are layout mockups, not generated photorealistic AI images. Sentiment is a transparent keyword heuristic, not a trained model. The summary is generated from recurring terms using templates. Validate results before making business decisions.

## Nano Banana / generative AI integration

Do not put a Gemini / Nano Banana API key in `app.js`, HTML, GitHub Actions public variables, or any browser-delivered file. Anyone can inspect static site code.

Create a small HTTPS backend (for example Cloud Run, Firebase Functions, or a server you control) that:
1. Accepts an uploaded image, selected scene, product name, style and brand-consistency notes.
2. Authenticates the user, validates MIME type/size, applies rate limits and checks usage.
3. Calls the currently supported Gemini image-generation model/API server-side using the original product image as the reference on every scene request.
4. Returns generated image URLs or image bytes, plus a job ID.
5. Stores the same product reference and a campaign/session ID for every scene to reduce drift.
6. Applies a consistency instruction such as: “Use the supplied reference image as the authoritative product. Preserve exact silhouette, dimensions, label, logo, text, colors, materials and all identifying details. Do not redesign, reinterpret or add/remove product components. Change only the surrounding scene and placement.”

Suggested request contract:

```http
POST /api/marketing/render
Content-Type: multipart/form-data
Authorization: Bearer <your-session-token>

image=<reference image>
scene="Coffee mug"
productName="Aurora bottle"
style="Premium studio photography"
brandNotes="Preserve exact logo, shape and colors"
campaignId="..."
```

Example JSON response:

```json
{
  "jobId": "job_123",
  "status": "completed",
  "imageUrl": "https://your-storage.example/generated/scene.webp"
}
```

Use a backend-owned storage URL or return image bytes. The browser endpoint field in Admin is a configuration placeholder; wire the request in `app.js` only after your backend contract and authentication are ready. Image consistency cannot be guaranteed perfectly by any generative model; inspect each render and use the same reference image and campaign context for all scenes.

## AI sentiment summary integration

Add a protected backend endpoint such as `POST /api/sentiment/analyze` accepting review text and returning structured labels, trend buckets, themes, and an executive summary. Keep provider credentials server-side. The included local analyzer remains available as a fallback.

## CSV format

Recommended columns: `date,review`. The import currently accepts plain text with one review per line; lines may optionally start with `YYYY-MM-DD,` followed by review text. Avoid commas in the date prefix. Large files are processed in the browser, so very large batches may be limited by the device's available memory.

## Automated tests

Run the dependency-free Node tests:

```bash
node --test tests/core.test.cjs
```

The tests validate sentiment classification, dated parsing, trend grouping, and empty input. No npm dependencies are needed.

## Production checklist

- Add authentication, authorization, a database, and tenant isolation for real admin accounts.
- Add server-side AI endpoints and secrets management.
- Add privacy notice, consent, retention/deletion controls, and review-text redaction.
- Add accessibility review, browser/device QA, and load testing with representative review batches.
- Configure analytics only with appropriate consent.
