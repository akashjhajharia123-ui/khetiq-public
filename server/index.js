import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const PORT = process.env.PORT || 8787
const ROOT = path.dirname(fileURLToPath(import.meta.url))
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
const SARVAM_URL = 'https://api.sarvam.ai'
const UI_TRANSLATION_CODES = new Set(['hi-IN', 'bn-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'od-IN', 'pa-IN', 'ta-IN', 'te-IN', 'as-IN', 'ur-IN', 'ne-IN', 'kok-IN', 'ks-IN', 'sd-IN', 'sa-IN', 'sat-IN', 'mni-IN', 'brx-IN', 'mai-IN', 'doi-IN'])
const MANDI_RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070'
const INDIA_STATE_ALIASES = [
  ['Andhra Pradesh', 'andhra pradesh', 'आंध्र प्रदेश'], ['Arunachal Pradesh', 'arunachal pradesh', 'अरुणाचल प्रदेश'],
  ['Assam', 'assam', 'असम'], ['Bihar', 'bihar', 'बिहार'], ['Chhattisgarh', 'chhattisgarh', 'छत्तीसगढ़'],
  ['Goa', 'goa', 'गोवा'], ['Gujarat', 'gujarat', 'गुजरात'], ['Haryana', 'haryana', 'हरियाणा'],
  ['Himachal Pradesh', 'himachal pradesh', 'हिमाचल प्रदेश'], ['Jharkhand', 'jharkhand', 'झारखंड'],
  ['Karnataka', 'karnataka', 'कर्नाटक'], ['Kerala', 'kerala', 'केरल'], ['Madhya Pradesh', 'madhya pradesh', 'मध्य प्रदेश'],
  ['Maharashtra', 'maharashtra', 'महाराष्ट्र'], ['Manipur', 'manipur', 'मणिपुर'], ['Meghalaya', 'meghalaya', 'मेघालय'],
  ['Mizoram', 'mizoram', 'मिजोरम'], ['Nagaland', 'nagaland', 'नागालैंड'], ['Odisha', 'odisha', 'ଓଡ଼ିଶା', 'ओडिशा'],
  ['Punjab', 'punjab', 'पंजाब'], ['Rajasthan', 'rajasthan', 'राजस्थान'], ['Sikkim', 'sikkim', 'सिक्किम'],
  ['Tamil Nadu', 'tamil nadu', 'तमिलनाडु'], ['Telangana', 'telangana', 'तेलंगाना'], ['Tripura', 'tripura', 'त्रिपुरा'],
  ['Uttar Pradesh', 'uttar pradesh', 'उत्तर प्रदेश'], ['Uttarakhand', 'uttarakhand', 'उत्तराखंड'], ['West Bengal', 'west bengal', 'पश्चिम बंगाल'],
  ['Delhi', 'delhi', 'दिल्ली'], ['Jammu and Kashmir', 'jammu and kashmir', 'जम्मू और कश्मीर'], ['Ladakh', 'ladakh', 'लद्दाख'],
  ['Puducherry', 'puducherry', 'पुदुचेरी'], ['Chandigarh', 'chandigarh', 'चंडीगढ़'],
]
function stateMentionedIn(message) {
  const text = String(message || '').toLocaleLowerCase('en-IN')
  return INDIA_STATE_ALIASES.find(([, ...aliases]) => aliases.some((alias) => {
    if (/^[a-z ]+$/.test(alias)) return new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
    return text.includes(alias)
  }))?.[0] || ''
}

function districtMentionedIn(message, district = '') {
  if (!district) return false
  const text = String(message || '').toLocaleLowerCase('en-IN')
  const name = district.toLocaleLowerCase('en-IN')
  if (new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) return true
  const aliases = { jaipur: ['जयपुर'], tonk: ['टोंक'], jodhpur: ['जोधपुर'], kota: ['कोटा'], ajmer: ['अजमेर'], udaipur: ['उदयपुर'], bikaner: ['बीकानेर'], alwar: ['अलवर'] }
  return (aliases[name] || []).some((alias) => text.includes(alias))
}
const weatherCache = new Map()
const mandiCache = new Map()
const SARVAM_LANGUAGES = new Set(['en-IN', 'hi-IN', 'bn-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'od-IN', 'pa-IN', 'ta-IN', 'te-IN', 'gu-IN'])
const CROP_REPORT_LANGUAGES = new Set(['English', 'हिंदी', 'বাংলা', 'ગુજરાતી', 'ಕನ್ನಡ', 'മലയാളം', 'मराठी', 'ଓଡ଼ିଆ', 'ਪੰਜਾਬੀ', 'தமிழ்', 'తెలుగు', 'অসমীয়া', 'اردو', 'नेपाली', 'कोंकणी', 'کٲشُر', 'سنڌي', 'संस्कृतम्', 'ᱥᱟᱱᱛᱟᱲᱤ', 'মৈতৈলোন্', 'बड़ो', 'मैथिली', 'डोगरी'])
const SARVAM_VOICES = {
  'en-IN': { model: 'bulbul:v4-flash', speaker: 'simran_en_conversation' },
  'hi-IN': { model: 'bulbul:v4-flash', speaker: 'shubh_enhi_companion' },
  'bn-IN': { model: 'bulbul:v4-flash', speaker: 'arnab_bn_conversation' },
  'gu-IN': { model: 'bulbul:v4-flash', speaker: 'bhavik_gu_conversation' },
  'kn-IN': { model: 'bulbul:v4-flash', speaker: 'chaitra_kn_conversation' },
  'ml-IN': { model: 'bulbul:v3', speaker: 'ishita' },
  'mr-IN': { model: 'bulbul:v4-flash', speaker: 'ishita_mr_conversational' },
  'od-IN': { model: 'bulbul:v3', speaker: 'ishita' },
  'pa-IN': { model: 'bulbul:v4-flash', speaker: 'anand_pa_conversation' },
  'ta-IN': { model: 'bulbul:v4-flash', speaker: 'gokul_ta_narration' },
  'te-IN': { model: 'bulbul:v4-flash', speaker: 'kavitha_te_conversation' },
}

app.set('trust proxy', 1)
app.use(express.json({ limit: '8mb' }))

app.post('/api/ui/translate', rateLimit({ max: 8 }), async (req, res) => {
  const { languageCode, texts } = req.body || {}
  if (!UI_TRANSLATION_CODES.has(languageCode)) return res.status(400).json({ error: 'Choose one of the supported dashboard languages.' })
  if (!Array.isArray(texts) || texts.length > 400) return res.status(400).json({ error: 'The dashboard translation request is too large.' })
  const cleaned = [...new Set(texts.map((text) => String(text || '').trim()).filter((text) => text && text.length <= 500))]
  if (!cleaned.length) return res.json({ translations: {} })

  // Batch labels so the page needs only a handful of Sarvam calls. Keep each
  // request below the API's 2,000-character input limit.
  const batches = []
  let batch = []
  let size = 0
  for (const [index, text] of cleaned.entries()) {
    const row = `[[KQ${String(index).padStart(3, '0')}]] ${text.replace(/[\r\n]+/g, ' ')}`
    if (batch.length && size + row.length + 1 > 1750) { batches.push(batch); batch = []; size = 0 }
    batch.push({ text, row, index }); size += row.length + 1
  }
  if (batch.length) batches.push(batch)

  try {
    const translations = {}
    for (const group of batches) {
      const result = await sarvamFetchJson('/translate', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input: group.map((item) => item.row).join('\n'), source_language_code: 'en-IN', target_language_code: languageCode, model: 'sarvam-translate:v1', numerals_format: 'international' }),
      })
      const output = String(result.translated_text || '')
      const matches = [...output.matchAll(/\[\[KQ(\d{3})\]\]\s*([\s\S]*?)(?=\n?\s*\[\[KQ\d{3}\]\]|$)/g)]
      for (const match of matches) {
        const original = cleaned[Number(match[1])]
        const translated = match[2].trim()
        if (original && translated) translations[original] = translated
      }
      // If the translation service removes the batch markers, use its newline
      // structure only when it still returns one output line per input label.
      if (!matches.length) {
        const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
        if (lines.length === group.length) group.forEach((item, index) => { translations[item.text] = lines[index] })
      }
    }
    res.json({ translations })
  } catch (error) { res.status(error.status || 502).json({ error: safeSarvamMessage(error) }) }
})

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
  let response
  try {
    response = await fetch(url, { ...options, signal: AbortSignal.timeout(18000) })
  } catch (error) {
    const host = new URL(url).hostname
    const wrapped = new Error(error.name === 'TimeoutError'
      ? `The ${host} service took too long to respond. Please try again.`
      : `KhetiQ could not reach ${host}. Please retry in a moment.`)
    wrapped.status = 502
    wrapped.cause = error
    throw wrapped
  }
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
  // Open-Meteo geocoding is free and requires no API key. Keep location
  // selection available even when WeatherAPI is temporarily unconfigured.
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
  const cacheKey = [commodity, state, district].map((value) => String(value || '').trim().toLowerCase()).join('|')
  const cached = mandiCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.value
  const url = new URL(`https://api.data.gov.in/resource/${MANDI_RESOURCE}`)
  const params = new URLSearchParams({ 'api-key': process.env.DATA_GOV_API_KEY, format: 'json', limit: '100' })
  if (commodity) params.set('filters[commodity]', commodity)
  if (state) params.set('filters[state]', state)
  if (district) params.set('filters[district]', district)
  url.search = params
  let data
  try {
    data = await fetchJson(url)
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      const authError = new Error('data.gov.in rejected DATA_GOV_API_KEY. Check the key in Render Environment and redeploy the service.')
      authError.status = error.status
      throw authError
    }
    if (error.status === 429) {
      const limitError = new Error('data.gov.in rate limit reached. Please wait a minute and search again.')
      limitError.status = 429
      throw limitError
    }
    // A single retry handles brief data.gov.in connection resets without
    // creating a long request loop or exposing the API key to the client.
    if (error.status !== 502) throw error
    data = await fetchJson(url)
  }
  const records = (data.records || []).map((record) => ({
    state: record.state, district: record.district, market: record.market,
    commodity: record.commodity, variety: record.variety, grade: record.grade,
    arrivalDate: record.arrival_date,
    minPrice: Number(record.min_price), maxPrice: Number(record.max_price), modalPrice: Number(record.modal_price),
  })).sort((a, b) => (parseDate(b.arrivalDate) || 0) - (parseDate(a.arrivalDate) || 0))
  const result = { available: true, source: 'AGMARKNET via data.gov.in', sourceUrl: 'https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi', retrievedAt: new Date().toISOString(), records }
  mandiCache.set(cacheKey, { value: result, expiresAt: Date.now() + 5 * 60_000 })
  return result
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

const systemPrompt = `You are KhetiQ, a careful farming decision assistant for India. Answer simply and practically in the user's language. Use weather and mandi tools only when relevant. Weather comes from Open-Meteo, not IMD. Never invent live facts, prices, sources, dates, scheme eligibility, or disease diagnoses. Preserve mandi arrival dates exactly and call an old record the latest available record, not today's price. For mandi questions, if the tool returns records, report at least one exact modal price, market, district, unit, and arrival date; never claim data is unavailable when records exist. If the tool returns no records, say no matching records were returned. Explain that advice is decision support and depends on local conditions. No agronomy retrieval source is configured, so do not present a specific irrigation schedule, quantity, or crop prescription as verified; explain relevant weather, ask for missing crop stage/soil/recent rainfall, and suggest confirmation with a local KVK. If a tool says data is unavailable, state that plainly. Keep replies short, structured, and kind. Do not claim an API was used unless a tool result is present.`

async function geminiChat({ message, history = [], profile = {} }) {
  if (profile.language === 'हिंदी' && isMandiQuestion(message)) {
    const local = await localAnswer(message, profile)
    const result = local.tools?.find((tool) => tool.name === 'get_mandi_prices')?.result
    const grounded = hindiMandiReply(message, profile, result)
    if (grounded) return { ...grounded, tools: local.tools, model: 'KhetiQ + AGMARKNET' }
  }
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
      const args = functionCall.args || {}
      const requestedState = functionCall.name === 'get_mandi_prices' ? stateMentionedIn(message) : ''
      if (requestedState) { args.state = requestedState; if (!districtMentionedIn(message, profile.district)) args.district = '' }
      try { result = await runTool(functionCall.name, args) }
      catch (error) { result = { available: false, reason: error.message } }
      collected.push({ name: functionCall.name, result })
      responses.push({ functionResponse: { name: functionCall.name, response: result } })
    }
    contents.push({ role: 'user', parts: responses })
  }
  return { answer: 'I fetched the available information but could not finish the response. Please try again.', tools: collected, model: GEMINI_MODEL }
}

function isMandiQuestion(message) {
  return /mandi|price|rate|भाव|मंडी|दाम|बाजार|कीमत|प्राइस|रेट|मूल्य|বাজার|দাম|মূল্য|બજાર|ભાવ|કિંમત|ಮಾರುಕಟ್ಟೆ|ಬೆಲೆ|ದರ|വിപണി|വില|വിലനിരക്ക്|ପ୍ରାଇସ|ମଣ୍ଡି|ଦର|ମୂଲ୍ୟ|ਮੰਡੀ|ਭਾਅ|ਕੀਮਤ|சந்தை|விலை|మార్కెట్|ధర/i.test(String(message || ''))
}

function hindiMandiReply(message, profile, market) {
  if (!market?.available) return null
  if (!market.records?.length) {
    const scope = stateMentionedIn(message) || profile.district || profile.state || 'आपके चुने हुए क्षेत्र'
    return { answer: `${scope} के लिए इस समय कोई मेल खाता मंडी रिकॉर्ड नहीं मिला।`, model: 'KhetiQ + AGMARKNET' }
  }
  const record = market.records[0]
  const cropHindi = { Wheat: 'गेहूँ', Rice: 'चावल', Mustard: 'सरसों', Cotton: 'कपास', Maize: 'मक्का', Onion: 'प्याज़', Soyabean: 'सोयाबीन', Potato: 'आलू' }[record.commodity] || record.commodity
  const stateHindi = INDIA_STATE_ALIASES.find(([english]) => english === record.state)?.find((alias) => /[\u0900-\u097f]/.test(alias)) || record.state
  const scope = stateMentionedIn(message) && !districtMentionedIn(message, profile.district) ? `${stateHindi} में` : `${record.district || stateHindi} में`
  return {
    answer: `${scope} ${cropHindi} का उपलब्ध नवीनतम मंडी रिकॉर्ड: ${record.market}, ${record.district} — ₹${record.modalPrice}/क्विंटल (आवक तारीख: ${record.arrivalDate})। स्रोत: AGMARKNET via data.gov.in। यह एक उपलब्ध मंडी रिकॉर्ड है, पूरे राज्य का औसत या गारंटीकृत बिक्री भाव नहीं।`,
    model: 'KhetiQ + AGMARKNET',
  }
}

function localAnswer(message, profile) {
  const normalized = message.toLowerCase()
  const asksWeather = /weather|forecast|rain|बारिश|मौसम|वर्षा|আবহাওয়া|বৃষ্টি|હવામાન|વરસાદ|ಹವಾಮಾನ|ಮಳೆ|കാലാവസ്ഥ|पाऊस|हवामान|ପାଣିପାଗ|ବର୍ଷା|ਮੌਸਮ|ਮੀਂਹ|வானிலை|வర్షம்|వాతావరణ/.test(normalized)
  const asksIrrigation = /irrigat|पानी|सिंच|জল|সেচ|પાણી|સિંચ|ನೀರು|ನೀರಾವರಿ|വെള്ളം|ജലസേചന|पाणी|सिंचन|ପାଣି|ଜଳସେଚନ|ਪਾਣੀ|ਸਿੰਚਾਈ|நீர்|பாசன|నీరు|నీటిపారుదల/.test(normalized)
  const asksMandi = isMandiQuestion(normalized)
  return (async () => {
    const toolResults = []
    if (asksWeather || asksIrrigation) {
      try { toolResults.push({ name: 'get_weather', result: await weather(profile.latitude, profile.longitude) }) }
      catch (error) { toolResults.push({ name: 'get_weather', result: { available: false, reason: error.message } }) }
    }
    if (asksMandi) {
      const commodity = /wheat|गेहूं|गेहूँ|গম|ઘઉં|ಗೋಧಿ|ഗോതമ്പ്|गहू|ଗହମ|ਕਣਕ|கோதுமை|గోధుమ/.test(normalized) ? 'Wheat' : /rice|paddy|धान|चावल|ধান|ચોખા|ಅಕ್ಕಿ|അരി|तांदूळ|ଚାଉଳ|ਝੋਨਾ|கோதுமை|அரிசி|వరి|బియ్యం/.test(normalized) ? 'Rice' : /mustard|सरसों|সরিষা|રાઈ|ಸಾಸಿವೆ|കടുക്|मोहरी|ସୋରିଷ|ਸਰੋਂ|கடுகு|ఆవాలు/.test(normalized) ? 'Mustard' : profile.crop || 'Wheat'
      const requestedState = stateMentionedIn(message)
      const marketState = requestedState || profile.state || ''
      const marketDistrict = requestedState && !districtMentionedIn(message, profile.district) ? '' : profile.district || ''
      toolResults.push({ name: 'get_mandi_prices', result: await mandi({ commodity, state: marketState, district: marketDistrict }) })
    }
    const paragraphs = []
    paragraphs.push('I’m answering with KhetiQ’s local assistant. Select a supported Indian language to use Sarvam multilingual chat, or configure Gemini for AI chat in English.')
    const wx = toolResults.find((x) => x.name === 'get_weather')?.result
    if (wx?.current) {
      const tomorrow = wx.daily?.time?.[1]
      const index = 1
      paragraphs.push(`Weather near ${profile.location || 'your selected location'}: ${wx.current.temperature_2m}°C now. Tomorrow (${tomorrow}), rain chance is ${wx.daily.precipitation_probability_max?.[index] ?? 'unavailable'}% with about ${wx.daily.precipitation_sum?.[index] ?? 'unavailable'} mm forecast. Source: Open-Meteo; retrieved ${new Date(wx.retrievedAt).toLocaleString('en-IN')}.`)
      if (asksIrrigation) paragraphs.push('I can’t safely decide irrigation from weather alone. Please share crop, days after sowing, soil type, and recent irrigation/rainfall. Avoid irrigating saturated soil; confirm crop-stage advice with your local extension service.')
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
      if (asksIrrigation) hindi.push('सिर्फ मौसम देखकर सिंचाई का निर्णय सुरक्षित नहीं है। कृपया फसल, बुवाई के बाद के दिन, मिट्टी और हाल की बारिश/सिंचाई बताएं। सही सलाह के लिए स्थानीय कृषि विस्तार केंद्र से पुष्टि करें।')
      if (!toolResults.length) hindi.push('आप मौसम, मंडी भाव, सिंचाई, फसल की फोटो या सरकारी योजनाओं के बारे में पूछ सकते हैं।')
      return { answer: hindi.join('\n\n'), tools: toolResults, model: 'KhetiQ स्थानीय सहायक' }
    }
    return { answer: paragraphs.join('\n\n'), tools: toolResults, model: 'KhetiQ local assistant' }
  })()
}

async function sarvamFetchJson(endpoint, options = {}) {
  if (!process.env.SARVAM_API_KEY) {
    const error = new Error('Voice and Indian-language support needs SARVAM_API_KEY in the server environment.')
    error.status = 503
    throw error
  }
  const response = await fetch(`${SARVAM_URL}${endpoint}`, {
    ...options,
    headers: { 'api-subscription-key': process.env.SARVAM_API_KEY, ...(options.headers || {}) },
    signal: AbortSignal.timeout(45_000),
  })
  const text = await response.text()
  let body
  try { body = JSON.parse(text) } catch { body = { message: text.slice(0, 300) } }
  if (!response.ok) {
    const error = new Error(body?.error?.message || body?.message || `Sarvam request failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return body
}

async function sarvamChat({ message, history = [], profile = {} }) {
  const local = await localAnswer(message, profile)
  const market = local.tools?.find((tool) => tool.name === 'get_mandi_prices')?.result
  const asksForMarket = local.tools?.some((tool) => tool.name === 'get_mandi_prices')
  if (asksForMarket && profile.language === 'हिंदी') {
    const grounded = hindiMandiReply(message, profile, market)
    if (grounded) return { ...grounded, tools: local.tools }
  }
  const language = profile.language || 'English'
  const data = await sarvamFetchJson('/v2/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'sarvam-105b-conversations',
      max_tokens: 450,
      messages: [
        { role: 'system', content: `${systemPrompt} Reply in ${language}. Use the supplied farm data when relevant; never imply data is live if it is unavailable. Keep the answer concise.` },
        ...history.slice(-8).map((item) => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: String(item.text || '').slice(0, 1500) })),
        { role: 'user', content: `Farm profile: ${JSON.stringify(profile)}\nRelevant live farm data: ${JSON.stringify(local.tools || [])}\n\nQuestion: ${message}` },
      ],
    }),
  })
  return { answer: data.choices?.[0]?.message?.content || 'I could not form an answer. Please try again.', tools: local.tools || [], model: 'sarvam-105b-conversations' }
}

function safeSarvamMessage(error) {
  if (error.status === 402) return 'Sarvam credits are exhausted. Check your Sarvam billing dashboard.'
  if (error.status === 403) return 'Sarvam rejected the API key. Check the server environment key.'
  return error.message || 'Sarvam could not complete this request. Please try again.'
}

app.get('/api/health', (_req, res) => res.json({
  ok: true,
  integrations: {
    weather: { configured: Boolean(process.env.WEATHERAPI_KEY), provider: process.env.WEATHERAPI_KEY ? 'WeatherAPI.com' : 'Open-Meteo (local preview only)', needsKey: process.env.NODE_ENV === 'production' && !process.env.WEATHERAPI_KEY },
    mandi: { configured: Boolean(process.env.DATA_GOV_API_KEY), provider: 'AGMARKNET / data.gov.in', needsKey: true },
    gemini: { configured: Boolean(process.env.GEMINI_API_KEY), model: GEMINI_MODEL, needsKey: true },
    sarvam: { configured: Boolean(process.env.SARVAM_API_KEY), provider: 'Saaras v4 + Bulbul v4 Flash + Sarvam 105B' },
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
  catch (error) {
    // Log only upstream diagnostics; never include request URLs or API keys.
    console.error('[mandi] upstream request failed', {
      status: error.status || 502,
      message: error.message,
      cause: error.cause?.code || error.cause?.message || error.cause?.name || undefined,
    })
    res.status(error.status || 502).json({ error: error.message })
  }
})

app.get('/api/mandi/diagnostics', rateLimit({ max: 3 }), async (_req, res) => {
  if (!process.env.DATA_GOV_API_KEY) return res.status(503).json({ configured: false, reachable: false, error: 'DATA_GOV_API_KEY is missing on the server.' })
  try {
    const result = await mandi({ commodity: 'Wheat', state: 'Maharashtra' })
    res.json({ configured: true, reachable: true, recordCount: result.records.length, sampleArrivalDate: result.records[0]?.arrivalDate || null, source: result.source })
  } catch (error) {
    const causeCode = error.cause?.code || null
    const cause = error.cause?.message || error.cause?.name || null
    console.error('[mandi] diagnostic probe failed', { status: error.status || 502, message: error.message, causeCode, cause })
    res.status(502).json({ configured: true, reachable: false, status: error.status || 502, causeCode, cause, error: error.message })
  }
})

app.post('/api/chat', rateLimit({ max: 20 }), async (req, res) => {
  const { message, history = [], profile = {} } = req.body || {}
  if (!String(message || '').trim()) return res.status(400).json({ error: 'Write a question first.' })
  try {
    const request = { message: String(message).slice(0, 2000), history, profile }
    const response = process.env.GEMINI_API_KEY
      ? await geminiChat(request)
      : process.env.SARVAM_API_KEY && profile.language && profile.language !== 'English'
        ? await sarvamChat(request)
        : await localAnswer(request.message, profile)
    res.json(response)
  } catch (error) {
    res.status(error.status || 502).json({ error: `Assistant request failed: ${safeSarvamMessage(error)}` })
  }
})

app.post('/api/voice/transcribe', rateLimit({ max: 8 }), async (req, res) => {
  const { audio, mimeType = 'audio/webm' } = req.body || {}
  if (!audio || !/^[A-Za-z0-9+/=]+$/.test(audio) || audio.length > 5_500_000) return res.status(400).json({ error: 'Record a short voice question (up to 30 seconds) and try again.' })
  const mime = String(mimeType).split(';')[0].toLowerCase()
  const extensions = { 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/aac': 'aac' }
  if (!extensions[mime]) return res.status(415).json({ error: 'This browser audio format is not supported. Try Chrome, Edge, or Safari.' })
  const bytes = Buffer.from(audio, 'base64')
  if (!bytes.length || bytes.length > 4_000_000) return res.status(400).json({ error: 'The recording is too large. Please record a shorter voice question.' })
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: mime }), `farmer-question.${extensions[mime]}`)
  form.append('model', 'saaras:v4')
  form.append('mode', 'transcribe')
  try {
    const result = await sarvamFetchJson('/speech-to-text', { method: 'POST', body: form })
    res.json({ transcript: result.transcript || '', languageCode: result.language_code || null })
  } catch (error) { res.status(error.status || 502).json({ error: safeSarvamMessage(error) }) }
})

app.post('/api/voice/speak', rateLimit({ max: 12 }), async (req, res) => {
  const { text, languageCode = 'en-IN' } = req.body || {}
  if (!String(text || '').trim()) return res.status(400).json({ error: 'There is no answer to read aloud.' })
  if (String(text).length > 2500) return res.status(413).json({ error: 'This answer is too long for one speech request. Shorten it and try again.' })
  if (!SARVAM_LANGUAGES.has(languageCode)) return res.status(400).json({ error: 'Choose a supported voice language.' })
  try {
    const voice = SARVAM_VOICES[languageCode]
    const result = await sarvamFetchJson('/text-to-speech', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: String(text).trim(), language_code: languageCode, ...voice, output_audio_codec: 'wav' }),
    })
    if (!result.audios?.[0]) return res.status(502).json({ error: 'Sarvam returned no audio. Please try again.' })
    res.json({ audioBase64: result.audios[0], mimeType: 'audio/wav' })
  } catch (error) { res.status(error.status || 502).json({ error: safeSarvamMessage(error) }) }
})

app.post('/api/diagnose', rateLimit({ max: 5 }), async (req, res) => {
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Crop image analysis needs a Gemini API key. Add GEMINI_API_KEY to the server .env file.' })
  const { image, mimeType = 'image/jpeg', crop = '', details = '', language = 'English' } = req.body || {}
  if (!image || !String(image).match(/^[A-Za-z0-9+/=]+$/) || image.length > 5_000_000) return res.status(400).json({ error: 'Choose an image under 3.5 MB.' })
  const responseLanguage = CROP_REPORT_LANGUAGES.has(language) ? language : 'English'
  const prompt = `Look at this farmer-submitted crop photo. Crop (if known): ${crop || 'unknown'}. Farmer notes: ${details || 'none'}. Describe visible signs only, list up to 3 possible causes (not a definitive diagnosis), explain uncertainty, suggest safe non-chemical next steps, and say when to contact a local KVK/agronomist. Do not provide pesticide products or dosages. Respond entirely in ${responseLanguage}, using its native script for all prose, headings, and next steps. Do not switch to English. Preserve only scientific names in Latin script when necessary. This is not a substitute for expert diagnosis.`
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
