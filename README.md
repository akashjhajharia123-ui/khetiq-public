# KhetiQ

**Smarter Farming. Better Decisions.** A mobile-first farm decision companion that brings weather, mandi records, crop photo triage, and official scheme starting points into one place.

## What works in the app

- A unified farmer chat with relevant tool routing. It works in local-assistant mode without a Gemini key and switches to Gemini function calling when configured.
- WeatherAPI.com forecast and location search for public deployment (free tier permits commercial use, with attribution). The app uses Open-Meteo only as a no-key fallback for local, non-commercial previews. Public deployment needs a WeatherAPI.com key. Forecasts are decision support, not a guarantee.
- AGMARKNET mandi lookup through the data.gov.in daily price resource. Results include the reported arrival date and source. No sample or fabricated prices are shown.
- Optional image triage through Gemini. It describes visible signs and possible causes, not a guaranteed disease diagnosis.
- A concise scheme directory linking to official scheme portals, with reminders to confirm live eligibility and deadlines with the official source.
- Local farm profile (location, main crop, language) stored in this browser only. No user account or profile database.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The API runs on `http://localhost:8787`.

Without credentials, the UI, local geocoding/weather preview, and local assistant work in development. In production, weather requires a WeatherAPI.com key. Mandi lookup and image diagnosis report that their keys are missing instead of showing placeholder results.

## When and where to add the API keys

1. **Mandi, before using the Mandi prices page:** register at [data.gov.in](https://data.gov.in/user/register), generate an API key, then set `DATA_GOV_API_KEY=...` in the server `.env` file. Restart the server. The app calls the official “Current Daily Price of Various Commodities from Various Markets (Mandi)” resource and displays the API’s `arrival_date`. The key stays server-side.
2. **Gemini, before enabling AI chat and crop photo analysis:** create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey), then set `GEMINI_API_KEY=...` in the server `.env` file. Restart the server. The default is `gemini-3.5-flash-lite`; change `GEMINI_MODEL` if your account has a different free-tier model. Google’s free tier has model-specific quotas and may use submitted content to improve Google products. Do not send personal or sensitive information. Confirm current pricing and data-use terms before public or commercial use.
3. **Weather, before public deployment:** create a free WeatherAPI.com account and set `WEATHERAPI_KEY` on the server. Its current free plan allows commercial use and requires attribution; the app displays a source link. WeatherAPI’s free forecast covers three days. The local Open-Meteo fallback needs no key, but is limited to non-commercial use, so it is disabled in production.

Keep `.env` out of source control. Do not put these values in the frontend or a `VITE_*` variable. For a hosted deployment, enter them as **server environment variables** in the host dashboard.

## Deploy

This is a single Node web service: in production, Express serves the built React app and provides `/api/*` endpoints. A Render Blueprint is included in `render.yaml`.

1. Push this folder to a GitHub repository.
2. In Render, create a new Blueprint from that repository and apply `render.yaml`.
3. Add `WEATHERAPI_KEY`, `GEMINI_API_KEY`, and `DATA_GOV_API_KEY` in the Render service’s environment settings when ready. Add `GEMINI_MODEL=gemini-3.5-flash-lite` if you want to pin the default.
4. Wait for deployment. Verify the deployed `/api/health`, weather search, and—after setting keys—real mandi and Gemini requests. Check that returned mandi arrival dates are current enough for the demo. Never use static values to simulate live results.

The hosting account, API keys, and public repository are not included in this workspace. Those are needed to publish a real public deployment. Render’s free service may sleep when idle; allow for a wake-up delay during demos.

## Integrations and data handling

| Integration | Key | Source behavior |
|---|---|---|
| WeatherAPI.com forecast + geocoding (public deployment) | `WEATHERAPI_KEY` | Free plan supports commercial use with attribution; forecast covers 3 days. The app displays the source. A key being present does not mean a successful API request is verified. |
| Open-Meteo local forecast fallback | None | Used only in local development/non-commercial preview. Free API terms exclude commercial/promotional use and require attribution. Disabled in production. |
| AGMARKNET / data.gov.in | `DATA_GOV_API_KEY` | Daily market records. The record’s arrival date is shown separately from retrieval time. A key being present does not mean an API request is verified; check for actual records. |
| Gemini chat + vision | `GEMINI_API_KEY` | Optional. Submitted questions and farm profile context, plus crop photos submitted for triage, are sent to Google’s Gemini API. Free-tier terms may allow data to improve Google products. |
| Schemes | None | Directory cards link to official government portals. Eligibility, benefits, deadlines, and application URLs must be checked on those portals. |

The farm profile is stored in browser localStorage and sent to KhetiQ’s server with a chat request. If Gemini is enabled, that question and profile context are also sent to Google. Weather coordinates are sent to WeatherAPI.com in the public deployment, or Open-Meteo during a local non-commercial preview, to retrieve forecasts. A photo is only sent to Gemini after the farmer submits it. Crop photos are limited to 3.5 MB. No server-side profile or uploaded image storage is implemented. Voice transcription, when used, relies on the browser’s speech recognition service.

## Project structure

```text
src/main.jsx        React farmer dashboard and module views
src/styles.css      Responsive visual system
server/index.js     Express API, WeatherAPI/Open-Meteo, mandi, Gemini
render.yaml         Render deployment blueprint
.env.example        Server-side integration configuration template
```

## Important limits

- Weather and mandi information may be delayed, incomplete, or wrong. Confirm major actions with an agricultural extension service.
- Irrigation recommendations require crop stage, soil, recent rainfall, and local agronomy guidance. KhetiQ does not calculate exact water quantities.
- Image interpretation is possible-symptom triage, not a validated diagnostic model. Do not use it alone to choose pesticide treatment.
- Scheme cards are entry points, not eligibility determinations or a guarantee of approval.
- Free API/model limits, availability, data-use terms, and model names can change. Check official terms before each public/demo release.

## Official references

- [WeatherAPI.com docs](https://www.weatherapi.com/docs/) · [pricing and free tier](https://www.weatherapi.com/pricing) · [terms](https://www.weatherapi.com/terms)
- [Open-Meteo forecast API](https://open-meteo.com/en/docs) · [non-commercial free-tier terms](https://open-meteo.com/en/terms)
- [AGMARKNET daily price dataset](https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi) · [data.gov.in API key help](https://www.data.gov.in/help)
- [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) · [API keys](https://ai.google.dev/gemini-api/docs/api-key) · [Image understanding](https://ai.google.dev/gemini-api/docs/image-understanding)
- [myScheme](https://www.myscheme.gov.in/) · [PM-KISAN](https://pmkisan.gov.in/) · [PMKSY](https://pmksy.gov.in/) · [PMFBY](https://pmfby.gov.in/)
