import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const PORT = process.env.PORT || 8787
const ROOT = path.dirname(fileURLToPath(import.meta.url))
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
const MANDI_RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070'
const weatherCache = new Map()

app.set('trust proxy', 1)
app.use(express.json({ limit: '8mb' }))

const rateBuckets = new Map()
function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  return (req, res, next) => {
    const key = `${req.path}:${req.ip}`
    const now = Date.now()
    let bucket = rateBuckets.get(key)
    if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + windowMs }
    bucket.count += 1
    rateBuckets.set(key, bucket)
    res.setHeader('RateLimit-Limit', max)
    res.setHeader('RateLimit-Remaining', Math.max(0, max - bucket.count))
    if (bucket.count > max) return res.status(429).json({ error: 'You’ve made several requests. Please wait a minute and try again.' })
    next()
  }
}

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(18000) })
  const text = await response.text()
  let body
  try { body = JSON.parse(text) } catch { body = { message: text.slice(0, 400) } }
  if (!response.ok) {
    const error = new Error(body?.error?.message || body?.message || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return body
}

async function geocode(query) {
  if (process.env.WEATHERAPI_KEY) {
    const url = new URL('https://api.weatherapi.com/v1/search.json')
    url.search = new URLSearchParams({ key: process.env.WEATHERAPI_KEY, q: query })
    const places = await fetchJson(url)
    return places.map((place) => ({ name: place.name, admin1: place.region || '', country: place.country || '', latitude: place.lat, longitude: place.lon, timezone: place.tz_id }))
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Add WEATHERAPI_KEY to the server environment to enable public weather and location search.')
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.search = new URLSearchParams({ name: query, count: '8', language: 'en', format: 'json' })
  const data = await fetchJson(url)
  return (data.results || []).map((place) => ({
    name: place.name,
    admin1: place.admin1 || '',
    country: place.country || '',
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  }))
}

async function weather(lat, lon) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) throw new Error('A valid farm location is needed for weather.')
  const provider = process.env.WEATHERAPI_KEY ? 'weatherapi' : 'openmeteo'
  if (provider === 'openmeteo' && process.env.NODE_ENV === 'production') throw new Error('Public weather needs a free WeatherAPI.com key. Add WEATHERAPI_KEY to the server environment.')
  const cacheKey = `${provider}:${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`
  const cached = weatherCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.value
  if (provider === 'weatherapi') {
    const url = new URL('https://api.weatherapi.com/v1/forecast.json')
    url.search = new URLSearchParams({ key: process.env.WEATHERAPI_KEY, q: `${lat},${lon}`, days: '3', aqi: 'no', alerts: 'no' })
    const data = await fetchJson(url)
    const result = {
      source: 'WeatherAPI.com', sourceUrl: 'https://www.weatherapi.com/', retrievedAt: new Date().toISOString(), timezone: data.location?.tz_id,
      current: { time: data.location?.localtime, temperature_2m: data.current?.temp_c, relative_humidity_2m: data.current?.humidity, apparent_temperature: data.current?.feelslike_c, is_day: data.current?.is_day, precipitation: data.current?.precip_mm, weather_code: mapWeatherCode(data.current?.condition?.code), weather_label: data.current?.condition?.text, wind_speed_10m: data.current?.wind_kph },
      daily: { time: data.forecast?.forecastday?.map((day) => day.date) || [], weather_code: data.forecast?.forecastday?.map((day) => mapWeatherCode(day.day?.condition?.code)) || [], weather_label: data.forecast?.forecastday?.map((day) => day.day?.condition?.text) || [], temperature_2m_max: data.forecast?.forecastday?.map((day) => day.day?.maxtemp_c) || [], temperature_2m_min: data.forecast?.forecastday?.map((day) => day.day?.mintemp_c) || [], precipitation_probability_max: data.forecast?.forecastday?.map((day) => Number(day.day?.daily_chance_of_rain) || 0) || [], precipitation_sum: data.forecast?.forecastday?.map((day) => day.day?.totalprecip_mm) || [], sunrise: data.forecast?.forecastday?.map((day) => day.astro?.sunrise) || [], sunset: data.forecast?.forecastday?.map((day) => day.astro?.sunset) || [] },
      note: 'Forecast model output; location uses the coordinates supplied by the farmer.',
    }
    weatherCache.set(cacheKey, { value: result, expiresAt: Date.now() + 15 * 60_000 })
    return result
  }
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.search = new URLSearchParams({
    latitude: String(lat), longitude: String(lon), timezone: 'auto', forecast_days: '7',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset',
  })
  const data = await fetchJson(url)
  const result = {
    source: 'Open-Meteo', sourceUrl: 'https://open-meteo.com/', retrievedAt: new Date().toISOString(),
    timezone: data.timezone, current: data.current, daily: data.daily,
    note: 'Forecast model output; location uses the coordinates supplied by the farmer.',
  }
  weatherCache.set(cacheKey, { value: result, expiresAt: Date.now() + 5 * 60_000 })
  return result
}

function mapWeatherCode(code) {
  const mapping = { 1000: 0, 1003: 2, 1006: 3, 1009: 3, 1030: 45, 1063: 61, 1066: 71, 1069: 71, 1072: 51, 1087: 95, 1114: 71, 1117: 71, 1135: 45, 1147: 48, 1150: 51, 1153: 51, 1168: 51, 1171: 55, 1180: 61, 1183: 61, 1186: 63, 1189: 63, 1192: 65, 1195: 65, 1198: 61, 1201: 65, 1204: 71, 1207: 71, 1210: 71, 1213: 71, 1216: 71, 1219: 71, 1222: 71, 1225: 71, 1237: 71, 1240: 80, 1243: 81, 1246: 82, 1249: 80, 1252: 81, 1255: 80, 1258: 81, 1261: 80, 1264: 81, 1273: 95, 1276: 95, 1279: 96, 1282: 99 }
  return mapping[Number(code)] ?? 3
}

async function mandi({ commodity = 'Wheat', state = '', district = '' }) {
  if (!process.env.DATA_GOV_API_KEY) {
    return { available: false, reason: 'Mandi prices are not connected yet. Add DATA_GOV_API_KEY to the server .env file.', source: 'AGMARKNET via data.gov.in' }
  }
  const url = new URL(`https://api.data.gov.in/resource/${MANDI_RESOURCE}`)
  const params = new URLSearchParams({ 'api-key': process.env.DATA_GOV_API_KEY, format: 'json', limit: '100' })
  if (commodity) params.set('filters[commodity]', commodity)
  if (state) params.set('filters[state]', state)
  if (district) params.set('filters[district]', district)
  url.search = params
  const data = await fetchJson(url)
  const records = (data.records || []).map((record) => ({
    state: record.state, district: record.district, market: record.market,
    commodity: record.commodity, variety: record.variety, grade: record.grade,
    arrivalDate: record.arrival_date,
    minPrice: Number(record.min_price), maxPrice: Number(record.max_price), modalPrice: Number(record.modal_price),
  })).sort((a, b) => (parseDate(b.arrivalDate) || 0) - (parseDate(a.arrivalDate) || 0))
  return { available: true, source: 'AGMARKNET via data.gov.in', sourceUrl: 'https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi', retrievedAt: new Date().toISOString(), records }
}

function parseDate(value = '') {
  const parts = value.split('/')
  return parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() : new Date(value).getTime()
}

function weatherToolDescription() {
  return 'Fetch current conditions and a seven-day forecast for a farmer. Use the farmer coordinates from the provided context when available. Do not guess coordinates.'
}

const toolDeclarations = [{ functionDeclarations: [
  { name: 'get_weather', description: weatherToolDescription(), parameters: { type: 'OBJECT', properties: { latitude: { type: 'NUMBER' }, longitude: { type: 'NUMBER' }, location: { type: 'STRING', description: 'Farmer location label for display only' } }, required: ['latitude', 'longitude'] } },
  { name: 'get_mandi_prices', description: 'Fetch actual AGMARKNET mandi records. Use this only when the farmer asks about commodity prices or markets. Records may not be from today; preserve arrivalDate.', parameters: { type: 'OBJECT', properties: { commodity: { type: 'STRING' }, state: { type: 'STRING' }, district: { type: 'STRING' } }, required: ['commodity'] } },
] }]

async function runTool(name, args) {
  if (name === 'get_weather') return weather(args.latitude, args.longitude)
  if (name === 'get_mandi_prices') return mandi(args)
  return { available: false, reason: 'Unknown tool.' }
}

const systemPrompt = `You are KhetiQ, a careful farming decision assistant for India. Answer simply and practically in the user's language. Use weather and mandi tools only when relevant. Weather comes from Open-Meteo, not IMD. Never invent live facts, prices, sources, dates, scheme eligibility, or disease diagnoses. Preserve mandi arrival dates exactly and call an old record the latest available record, not today's price. Explain that advice is decision support and depends on local conditions. No agronomy retrieval source is configured, so do not present a specific irrigation schedule, quantity, or crop prescription as verified; explain relevant weather, ask for missing crop stage/soil/recent rainfall, and suggest confirmation with a local KVK. If a tool says data is unavailable, state that plainly. Keep replies short, structured, and kind. Do not claim an API was used unless a tool result is present.`

async function geminiChat({ message, history = [], profile = {} }) {
  const contents = [
    ...history.slice(-10).map((item) => ({ role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user', parts: [{ text: String(item.text || '').slice(0, 3000) }] })),
    { role: 'user', parts: [{ text: `Farmer profile context: ${JSON.stringify(profile)}\n\nQuestion: ${message}` }] },
  ]
  const collected = []
  for (let turn = 0; turn < 3; turn++) {
    const data = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents, tools: toolDeclarations, toolConfig: { functionCallingConfig: { mode: 'AUTO' } } }),
    })
    const candidate = data.candidates?.[0]
    const calls = candidate?.content?.parts?.filter((part) => part.functionCall) || []
    if (!calls.length) return { answer: candidate?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') || 'I could not form an answer. Please try again.', tools: collected, model: GEMINI_MODEL }
    contents.push(candidate.content)
    const responses = []
    for (const { functionCall } of calls) {
      let result
      try { result = await runTool(functionCall.name, functionCall.args || {}) }
      catch (error) { result = { available: false, reason: error.message } }
      collected.push({ name: functionCall.name, result })
      responses.push({ functionResponse: { name: functionCall.name, response: result } })
    }
    contents.push({ role: 'user', parts: responses })
  }
  return { answer: 'I fetched the available information but could not finish the response. Please try again.', tools: collected, model: GEMINI_MODEL }
}

function localAnswer(message, profile) {
  const normalized = message.toLowerCase()
  return (async () => {
    const toolResults = []
    if (/weather|forecast|rain|बारिश|मौसम|वर्षा|irrigat|पानी|सिंच/.test(normalized)) {
      try { toolResults.push({ name: 'get_weather', result: await weather(profile.latitude, profile.longitude) }) }
      catch (error) { toolResults.push({ name: 'get_weather', result: { available: false, reason: error.message } }) }
    }
    if (/mandi|price|rate|भाव|मंडी|दाम/.test(normalized)) {
      const commodity = /wheat|गेहूं/.test(normalized) ? 'Wheat' : /rice|paddy|धान|चावल/.test(normalized) ? 'Rice' : /mustard|सरसों/.test(normalized) ? 'Mustard' : 'Wheat'
      toolResults.push({ name: 'get_mandi_prices', result: await mandi({ commodity, state: profile.state || '', district: profile.district || '' }) })
    }
    const paragraphs = []
    paragraphs.push('I’m answering with KhetiQ’s local assistant. Add your Gemini key in the server `.env` to enable the conversational AI.')
    const wx = toolResults.find((x) => x.name === 'get_weather')?.result
    if (wx?.current) {
      const tomorrow = wx.daily?.time?.[1]
      const index = 1
      paragraphs.push(`Weather near ${profile.location || 'your selected location'}: ${wx.current.temperature_2m}°C now. Tomorrow (${tomorrow}), rain chance is ${wx.daily.precipitation_probability_max?.[index] ?? 'unavailable'}% with about ${wx.daily.precipitation_sum?.[index] ?? 'unavailable'} mm forecast. Source: Open-Meteo; retrieved ${new Date(wx.retrievedAt).toLocaleString('en-IN')}.`)
      if (/irrigat|पानी/.test(normalized)) paragraphs.push('I can’t safely decide irrigation from weather alone. Please share crop, days after sowing, soil type, and recent irrigation/rainfall. Avoid irrigating saturated soil; confirm crop-stage advice with your local extension service.')
    }
    const market = toolResults.find((x) => x.name === 'get_mandi_prices')?.result
    if (market) {
      if (!market.available) paragraphs.push(`Mandi data is not connected yet. ${market.reason}`)
      else if (!market.records.length) paragraphs.push('No matching mandi records were returned. Try a different commodity or district.')
      else paragraphs.push(`${market.records.length} ${market.records[0].commodity} records found. Latest listed record: ${market.records[0].market}, modal ₹${market.records[0].modalPrice}/quintal, arrival date ${market.records[0].arrivalDate}. Source: ${market.source}.`)
    }
    if (!toolResults.length) paragraphs.push('I can help with weather, mandi rates, irrigation planning, crop photos, and scheme discovery. Try asking about rain tomorrow or wheat prices near you.')
    if (profile.language === 'हिंदी' || /[ऀ-ॿ]/.test(message)) {
      const hindi = ['नमस्ते! मैं खेत के फैसलों में मदद करने वाला KhetiQ सहायक हूँ।', ...toolResults.map(({ name, result }) => {
        if (name === 'get_weather' && result?.current) return `आपके चुने हुए स्थान के पास अभी तापमान ${result.current.temperature_2m}°C है। कल (${result.daily?.time?.[1]}) बारिश की संभावना ${result.daily?.precipitation_probability_max?.[1] ?? 'उपलब्ध नहीं'}% है; अनुमानित वर्षा ${result.daily?.precipitation_sum?.[1] ?? 'उपलब्ध नहीं'} मिमी है। स्रोत: Open-Meteo।`
        if (name === 'get_weather') return `मौसम की जानकारी अभी नहीं मिल सकी: ${result?.reason || 'सेवा उपलब्ध नहीं है।'}`
        if (name === 'get_mandi_prices' && !result?.available) return `मंडी के भाव अभी जुड़े नहीं हैं। ${result?.reason || ''}`
        if (name === 'get_mandi_prices' && result?.records?.length) { const record = result.records[0]; return `${record.commodity} का नवीनतम उपलब्ध रिकॉर्ड: ${record.market}, मंडी भाव ₹${record.modalPrice}/क्विंटल, आवक की तारीख ${record.arrivalDate}। स्रोत: AGMARKNET / data.gov.in।` }
        return 'इस फसल के लिए कोई मेल खाता मंडी रिकॉर्ड नहीं मिला।'
      })]
      if (/irrigat|पानी|सिंच/.test(normalized)) hindi.push('सिर्फ मौसम देखकर सिंचाई का निर्णय सुरक्षित नहीं है। कृपया फसल, बुवाई के बाद के दिन, मिट्टी और हाल की बारिश/सिंचाई बताएं। सही सलाह के लिए स्थानीय कृषि विस्तार केंद्र से पुष्टि करें।')
      if (!toolResults.length) hindi.push('आप मौसम, मंडी भाव, सिंचाई, फसल की फोटो या सरकारी योजनाओं के बारे में पूछ सकते हैं।')
      return { answer: hindi.join('\n\n'), tools: toolResults, model: 'KhetiQ स्थानीय सहायक' }
    }
    return { answer: paragraphs.join('\n\n'), tools: toolResults, model: 'KhetiQ local assistant' }
  })()
}

app.get('/api/health', (_req, res) => res.json({
  ok: true,
  integrations: {
    weather: { configured: Boolean(process.env.WEATHERAPI_KEY), provider: process.env.WEATHERAPI_KEY ? 'WeatherAPI.com' : 'Open-Meteo (local preview only)', needsKey: process.env.NODE_ENV === 'production' && !process.env.WEATHERAPI_KEY },
    mandi: { configured: Boolean(process.env.DATA_GOV_API_KEY), provider: 'AGMARKNET / data.gov.in', needsKey: true },
    gemini: { configured: Boolean(process.env.GEMINI_API_KEY), model: GEMINI_MODEL, needsKey: true },
  },
}))

app.get('/api/geocode', async (req, res) => {
  try {
    if (!req.query.q?.trim()) return res.status(400).json({ error: 'Enter a village, town, or district.' })
    res.json({ results: await geocode(req.query.q.trim()) })
  } catch (error) { res.status(error.status || 502).json({ error: error.message }) }
})

app.get('/api/weather', async (req, res) => {
  try { res.json(await weather(req.query.lat, req.query.lon)) }
  catch (error) { res.status(error.status || 502).json({ error: error.message }) }
})

app.get('/api/mandi', rateLimit({ max: 20 }), async (req, res) => {
  try { res.json(await mandi(req.query)) }
  catch (error) { res.status(error.status || 502).json({ error: error.message }) }
})

app.post('/api/chat', rateLimit({ max: 20 }), async (req, res) => {
  const { message, history = [], profile = {} } = req.body || {}
  if (!String(message || '').trim()) return res.status(400).json({ error: 'Write a question first.' })
  try {
    const response = process.env.GEMINI_API_KEY
      ? await geminiChat({ message: String(message).slice(0, 2000), history, profile })
      : await localAnswer(String(message).slice(0, 2000), profile)
    res.json(response)
  } catch (error) {
    res.status(error.status || 502).json({ error: `Assistant request failed: ${error.message}` })
  }
})

app.post('/api/diagnose', rateLimit({ max: 5 }), async (req, res) => {
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Crop image analysis needs a Gemini API key. Add GEMINI_API_KEY to the server .env file.' })
  const { image, mimeType = 'image/jpeg', crop = '', details = '' } = req.body || {}
  if (!image || !String(image).match(/^[A-Za-z0-9+/=]+$/) || image.length > 5_000_000) return res.status(400).json({ error: 'Choose an image under 3.5 MB.' })
  const prompt = `Look at this farmer-submitted crop photo. Crop (if known): ${crop || 'unknown'}. Farmer notes: ${details || 'none'}. Describe visible signs only, list up to 3 possible causes (not a definitive diagnosis), explain uncertainty, suggest safe non-chemical next steps, and say when to contact a local KVK/agronomist. Do not provide pesticide products or dosages. Reply in clear, short language. This is not a substitute for expert diagnosis.`
  try {
    const data = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: image } }] }] }),
    })
    const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join('\n')
    res.json({ answer: answer || 'The image did not return an assessment. Try a clearer photo.', source: 'Gemini vision model', model: GEMINI_MODEL, disclaimer: 'AI-assisted triage only. Confirm with an agricultural expert before acting.' })
  } catch (error) { res.status(error.status || 502).json({ error: error.message }) }
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(ROOT, '../dist')))
  app.get('*', (_req, res) => res.sendFile(path.resolve(ROOT, '../dist/index.html')))
}

app.listen(PORT, () => console.log(`KhetiQ server listening on http://localhost:${PORT}`))
