import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import BENGALI_UI from './bengali.js'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, CalendarDays, Check, ChevronDown,
  ChevronRight, Cloud, CloudDrizzle, CloudRain, CloudSun, Compass, ExternalLink, FileImage,
  Filter, HelpCircle, ImagePlus, Leaf, LoaderCircle, MapPin, Menu, MessageCircle, Mic,
  MoreHorizontal, PanelLeftClose, Plus, Search, Send, Settings2, ShieldCheck, Sprout, Sparkles,
  Square, Sun, Thermometer, Trash2, Upload, Volume2, Wheat, Wind, X,
} from 'lucide-react'
import './styles.css'

const DEFAULT_PROFILE = { location: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', latitude: 26.9124, longitude: 75.7873, language: 'English', crop: 'Wheat', cropStage: 'Growing', daysAfterSowing: '', soilType: 'Not sure', irrigationMethod: 'Not sure' }
const VOICE_LANGUAGES = [
  { label: 'English', native: 'English', code: 'en-IN' }, { label: 'हिंदी', native: 'हिंदी', code: 'hi-IN' },
  { label: 'বাংলা', native: 'বাংলা', code: 'bn-IN' }, { label: 'ગુજરાતી', native: 'ગુજરાતી', code: 'gu-IN' },
  { label: 'ಕನ್ನಡ', native: 'ಕನ್ನಡ', code: 'kn-IN' }, { label: 'മലയാളം', native: 'മലയാളം', code: 'ml-IN' },
  { label: 'मराठी', native: 'मराठी', code: 'mr-IN' }, { label: 'ଓଡ଼ିଆ', native: 'ଓଡ଼ିଆ', code: 'od-IN' },
  { label: 'ਪੰਜਾਬੀ', native: 'ਪੰਜਾਬੀ', code: 'pa-IN' }, { label: 'தமிழ்', native: 'தமிழ்', code: 'ta-IN' },
  { label: 'తెలుగు', native: 'తెలుగు', code: 'te-IN' }, { label: 'অসমীয়া', native: 'অসমীয়া', code: 'as-IN' },
  { label: 'اردو', native: 'اردو', code: 'ur-IN' }, { label: 'नेपाली', native: 'नेपाली', code: 'ne-IN' },
  { label: 'कोंकणी', native: 'कोंकणी', code: 'kok-IN' }, { label: 'کٲشُر', native: 'کٲشُر', code: 'ks-IN' },
  { label: 'سنڌي', native: 'سنڌي', code: 'sd-IN' }, { label: 'संस्कृतम्', native: 'संस्कृतम्', code: 'sa-IN' },
  { label: 'ᱥᱟᱱᱛᱟᱲᱤ', native: 'ᱥᱟᱱᱛᱟᱲᱤ', code: 'sat-IN' }, { label: 'মৈতৈলোন্', native: 'মৈতৈলোন্', code: 'mni-IN' },
  { label: 'बड़ो', native: 'बड़ो', code: 'brx-IN' }, { label: 'मैथिली', native: 'मैथिली', code: 'mai-IN' },
  { label: 'डोगरी', native: 'डोगरी', code: 'doi-IN' },
]
const VOICE_OUTPUT_LANGUAGES = new Set(['English', 'हिंदी', 'বাংলা', 'ગુજરાતી', 'ಕನ್ನಡ', 'മലയാളം', 'मराठी', 'ଓଡ଼ିଆ', 'ਪੰਜਾਬੀ', 'தமிழ்', 'తెలుగు'])
const HINDI_UI = {
  "Overview": "अवलोकन",
  "Farm assistant": "खेती सहायक",
  "Weather": "मौसम",
  "Mandi prices": "मंडी भाव",
  "Crop health": "फसल स्वास्थ्य",
  "Schemes": "योजनाएँ",
  "My farm": "मेरा खेत",
  "YOUR FARM, IN FOCUS": "आपका खेत, हमारी नज़र",
  "MY FARM": "मेरा खेत",
  "FARM TOOLS": "खेती के साधन",
  "Growing something?": "कुछ उगा रहे हैं?",
  "Ask KhetiQ, your field-side companion.": "KhetiQ से पूछें—आपका खेत साथी।",
  "Farmer profile": "किसान प्रोफ़ाइल",
  "MADE FOR THE PEOPLE WHO FEED US": "अन्नदाताओं के लिए बनाया गया",
  "Open menu": "मेन्यू खोलें",
  "Close menu": "मेन्यू बंद करें",
  "Notifications": "सूचनाएँ",
  "You’re all caught up.": "आपकी सभी सूचनाएँ देख ली गई हैं।",
  "YOUR FARM COMPANION": "आपका खेती साथी",
  "Let’s figure it out,": "आइए मिलकर समझें,",
  "together.": "साथ मिलकर।",
  "Ask a question. KhetiQ brings the right farm information into one answer.": "सवाल पूछें। KhetiQ खेती की सही जानकारी एक जगह लाता है।",
  "KhetiQ Assistant": "KhetiQ सहायक",
  "Sarvam voice ready · multilingual answers": "Sarvam की आवाज़ तैयार · कई भाषाओं में जवाब",
  "Gemini farm answers": "Gemini के खेती संबंधी जवाब",
  "multilingual answers": "कई भाषाओं में जवाब",
  "Add SARVAM_API_KEY on the server for voice": "आवाज़ के लिए सर्वर में SARVAM_API_KEY जोड़ें",
  "Voice mode on": "वॉइस मोड चालू",
  "Talk & listen": "बोलें और सुनें",
  "New conversation": "नई बातचीत",
  "Checking relevant farm information…": "खेती की ज़रूरी जानकारी देख रहे हैं…",
  "Listening… tap the microphone to finish": "सुन रहे हैं… रोकने के लिए माइक्रोफ़ोन दबाएँ",
  "Transcribing your question…": "आपके सवाल को लिखित रूप में बदल रहे हैं…",
  "Try asking": "यह पूछकर देखें",
  "Will it rain tomorrow?": "क्या कल बारिश होगी?",
  "Should I irrigate my wheat?": "क्या मुझे गेहूँ में सिंचाई करनी चाहिए?",
  "Mandi price for wheat": "गेहूँ का मंडी भाव",
  "Ask about your farm…": "अपने खेत के बारे में पूछें…",
  "Ask KhetiQ a question": "KhetiQ से सवाल पूछें",
  "Upload crop photo": "फसल की तस्वीर जोड़ें",
  "Stop recording": "रिकॉर्डिंग रोकें",
  "Record a voice question": "आवाज़ में सवाल रिकॉर्ड करें",
  "Stop recording and transcribe": "रिकॉर्डिंग रोकें और लिखित में बदलें",
  "Record up to 30 seconds": "30 सेकंड तक रिकॉर्ड करें",
  "Send question": "सवाल भेजें",
  "YOUR FARM CONTEXT": "आपके खेत की जानकारी",
  "Farm location": "खेत का स्थान",
  "Current crop": "मौजूदा फसल",
  "Rain chance tomorrow": "कल बारिश की संभावना",
  "View full forecast": "पूरा पूर्वानुमान देखें",
  "Grounded in real sources": "विश्वसनीय स्रोतों पर आधारित",
  "Data integrations": "डेटा कनेक्शन",
  "SUNDAY,": "रविवार,",
  "Good day,": "नमस्कार,",
  "farmer.": "किसान।",
  "Here’s what’s happening around your farm.": "आपके खेत के आसपास की ताज़ा जानकारी।",
  "Refresh data": "जानकारी ताज़ा करें",
  "FARM WEATHER": "खेत का मौसम",
  "LIVE": "लाइव",
  "local time": "स्थानीय समय",
  "Fetching local forecast…": "स्थानीय पूर्वानुमान ला रहे हैं…",
  "Forecast unavailable": "पूर्वानुमान उपलब्ध नहीं",
  "Feels like": "महसूस हो रहा है",
  "Wind": "हवा",
  "Rain chance": "बारिश की संभावना",
  "tomorrow": "कल",
  "Humidity": "नमी",
  "MARKET SNAPSHOT": "मंडी की झलक",
  "Nearby mandi rates": "पास की मंडियों के भाव",
  "Find today’s local rates": "आज के स्थानीय भाव देखें",
  "Mandi prices not connected": "मंडी भाव का कनेक्शन नहीं है",
  "Search current market records for your crop.": "अपनी फसल के मौजूदा मंडी रिकॉर्ड खोजें।",
  "Add your free data.gov.in key to load verified AGMARKNET records.": "सत्यापित AGMARKNET रिकॉर्ड देखने के लिए data.gov.in की मुफ़्त कुंजी जोड़ें।",
  "Compare markets": "मंडियों की तुलना करें",
  "Connect mandi data": "मंडी डेटा जोड़ें",
  "UPCOMING FORECAST": "आने वाले दिनों का पूर्वानुमान",
  "Plan the next few days": "अगले कुछ दिनों की योजना बनाएँ",
  "Full forecast": "पूरा पूर्वानुमान",
  "Today": "आज",
  "A SMALL FIELD NOTE": "खेत की छोटी सलाह",
  "Rain may be on the way.": "बारिश हो सकती है।",
  "Check before you irrigate.": "सिंचाई से पहले जाँचें।",
  "Rain is in the forecast tomorrow. Check soil moisture and drainage before deciding whether to irrigate.": "कल बारिश का अनुमान है। सिंचाई तय करने से पहले मिट्टी की नमी और जल निकासी जाँचें।",
  "No significant rain is forecast tomorrow. Check soil moisture and crop stage before planning the next watering.": "कल अच्छी बारिश का अनुमान नहीं है। अगली सिंचाई से पहले मिट्टी की नमी और फसल की अवस्था जाँचें।",
  "Check your crop stage, soil moisture, and local forecast before planning irrigation.": "सिंचाई से पहले फसल की अवस्था, मिट्टी की नमी और स्थानीय पूर्वानुमान जाँचें।",
  "Ask about irrigation": "सिंचाई के बारे में पूछें",
  "WHAT DO YOU NEED?": "आपको क्या चाहिए?",
  "Start with a question": "सवाल से शुरुआत करें",
  "Ask KhetiQ": "KhetiQ से पूछें",
  "Get a farm recommendation": "खेती के लिए सलाह पाएँ",
  "Check a crop photo": "फसल की तस्वीर जाँचें",
  "Explore visible plant symptoms": "पौधे के दिख रहे लक्षण समझें",
  "Find a scheme": "योजना खोजें",
  "See official support links": "सरकारी सहायता के लिंक देखें",
  "How KhetiQ works": "KhetiQ कैसे काम करता है",
  "WEATHER INTELLIGENCE": "मौसम की जानकारी",
  "Read the": "जानें",
  "sky ahead.": "आने वाले मौसम को।",
  "Local forecasts to help plan the next field decision.": "अगले खेत के फैसले के लिए स्थानीय पूर्वानुमान।",
  "Refresh forecast": "पूर्वानुमान ताज़ा करें",
  "Live local conditions": "स्थानीय मौजूदा मौसम",
  "Weather unavailable": "मौसम उपलब्ध नहीं",
  "Rainfall now": "अभी की बारिश",
  "Wind speed": "हवा की रफ़्तार",
  "TEMPERATURE OUTLOOK": "तापमान का पूर्वानुमान",
  "Temperature & rain": "तापमान और बारिश",
  "DAILY DETAILS": "दिन का विवरण",
  "Variable": "बदलता मौसम",
  "Forecast source:": "पूर्वानुमान स्रोत:",
  "About this data": "इस डेटा के बारे में",
  "Farm decisions need local context": "खेती के फैसलों में स्थानीय जानकारी ज़रूरी है",
  "Forecasts can change. Combine weather with soil moisture and crop stage before making irrigation decisions.": "पूर्वानुमान बदल सकता है। सिंचाई से पहले मिट्टी की नमी और फसल की अवस्था भी देखें।",
  "DECISION SUPPORT": "निर्णय में सहायता",
  "MANDI PRICE INTELLIGENCE": "मंडी भाव की जानकारी",
  "Know your": "जानें अपने",
  "market options.": "मंडी भाव",
  "Compare reported wholesale prices. The arrival date is the market record date.": "दर्ज थोक भावों की तुलना करें। आवक की तारीख मंडी रिकॉर्ड की तारीख है।",
  "API key added": "API कुंजी जुड़ी है",
  "API key needed": "API कुंजी चाहिए",
  "Find mandi prices": "मंडी भाव खोजें",
  "Search official market records for a crop and location.": "फसल और जगह के आधिकारिक मंडी रिकॉर्ड खोजें।",
  "Commodity": "फसल",
  "State": "राज्य",
  "District": "ज़िला",
  "OPTIONAL": "वैकल्पिक",
  "One free API key unlocks real mandi records": "एक मुफ़्त API कुंजी से असली मंडी रिकॉर्ड देखें",
  "SETUP NEEDED": "सेटअप ज़रूरी",
  "MARKET RECORDS": "मंडी रिकॉर्ड",
  "No matching records came back": "कोई मेल खाता रिकॉर्ड नहीं मिला",
  "Try removing the district or searching another commodity.": "ज़िला हटाकर या दूसरी फसल खोजकर देखें।",
  "Source:": "स्रोत:",
  "Prices in ₹ per quintal.": "भाव ₹ प्रति क्विंटल में।",
  "Dataset details": "डेटासेट का विवरण",
  "Your next market decision starts here.": "मंडी का अगला फैसला यहीं से शुरू करें。",
  "Connect the official data source, then compare the latest available records by commodity and district.": "आधिकारिक डेटा स्रोत जोड़ें, फिर फसल और ज़िले के नवीनतम रिकॉर्ड की तुलना करें।",
  "Search markets": "मंडी खोजें",
  "CROP HEALTH": "फसल का स्वास्थ्य",
  "Take a closer": "ध्यान से",
  "look.": "देखें।",
  "Share a photo for cautious AI-assisted symptom triage.": "लक्षणों की शुरुआती AI जाँच के लिए तस्वीर भेजें।",
  "Gemini key added": "Gemini कुंजी जुड़ी है",
  "Gemini key needed": "Gemini कुंजी चाहिए",
  "PHOTO CHECK": "तस्वीर से जाँच",
  "What’s happening on your crop?": "फसल में क्या हो रहा है?",
  "Drop a crop photo here": "फसल की तस्वीर यहाँ छोड़ें",
  "or": "या",
  "browse files": "फ़ाइल चुनें",
  "Change photo": "तस्वीर बदलें",
  "Remove photo": "तस्वीर हटाएँ",
  "Crop type": "फसल का प्रकार",
  "IF KNOWN": "अगर पता हो",
  "Not sure yet": "अभी पता नहीं",
  "What are you noticing?": "आपको क्या दिख रहा है?",
  "Check for symptoms": "लक्षण जाँचें",
  "Looking closely…": "ध्यान से जाँच रहे हैं…",
  "POSSIBLE SIGNS": "संभावित लक्षण",
  "Careful, clear guidance": "सावधानी से, साफ़ सलाह",
  "Safety comes first": "सुरक्षा पहले",
  "SCHEMES & SUPPORT": "योजनाएँ और सहायता",
  "Support that": "सहायता जो",
  "reaches your farm.": "आपके खेत तक पहुँचे।",
  "Explore official starting points. Always confirm current eligibility with the scheme authority.": "सरकारी योजनाओं की जानकारी देखें। पात्रता की पुष्टि संबंधित विभाग से करें।",
  "Open myScheme": "myScheme खोलें",
  "What kind of support are you looking for?": "आप किस तरह की सहायता चाहते हैं?",
  "Browse by need, then follow the official link to check details.": "ज़रूरत के अनुसार खोजें और विवरण के लिए आधिकारिक लिंक खोलें।",
  "Search schemes or support": "योजना या सहायता खोजें",
  "All schemes": "सभी योजनाएँ",
  "OFFICIAL SOURCE": "आधिकारिक स्रोत",
  "Check official details": "आधिकारिक जानकारी देखें",
  "Looking for a state-specific benefit?": "राज्य-विशेष लाभ खोज रहे हैं?",
  "Find schemes": "योजनाएँ खोजें",
  "YOUR KhetiQ": "आपका KhetiQ",
  "Farm profile": "खेत की प्रोफ़ाइल",
  "Change": "बदलें",
  "Main crop": "मुख्य फसल",
  "Crop stage": "फसल की अवस्था",
  "Days after sowing": "बुवाई के बाद के दिन",
  "Soil type": "मिट्टी का प्रकार",
  "Irrigation method": "सिंचाई का तरीका",
  "Not sure": "पता नहीं",
  "Clay": "चिकनी मिट्टी",
  "Loam": "दोमट मिट्टी",
  "Sandy": "रेतीली मिट्टी",
  "Black soil": "काली मिट्टी",
  "Just sown": "अभी बोई है",
  "Growing": "बढ़ रही है",
  "Flowering": "फूल आ रहे हैं",
  "Harvesting": "कटाई",
  "Flood": "बाढ़ सिंचाई",
  "Drip": "ड्रिप",
  "Sprinkler": "फव्वारा",
  "Rainfed": "वर्षा आधारित",
  "Cancel": "रद्द करें",
  "Save profile": "प्रोफ़ाइल सहेजें",
  "Farm profile saved": "खेत की प्रोफ़ाइल सहेजी गई",
  "SOURCE STATUS": "स्रोत की स्थिति",
  "Data & integrations": "डेटा और कनेक्शन",
  "KEY ADDED": "कुंजी जुड़ी है",
  "KEY NEEDED": "कुंजी चाहिए",
  "LOCAL PREVIEW": "स्थानीय पूर्वावलोकन",
  "Done": "हो गया",
  "Search village or town": "गाँव या शहर खोजें",
  "Finding places…": "जगहें खोज रहे हैं…",
  "Rajasthan": "राजस्थान",
  "Jaipur": "जयपुर",
  "Wheat": "गेहूँ",
  "Rice": "चावल",
  "Mustard": "सरसों",
  "Cotton": "कपास",
  "Maize": "मक्का",
  "Onion": "प्याज़",
  "Soyabean": "सोयाबीन",
  "Potato": "आलू",
  "Vegetables": "सब्ज़ियाँ",
  "Tomato": "टमाटर",
  "Other": "अन्य",
  "farm": "खेत",
  "Gemini assistant": "Gemini सहायक",
  "Sarvam assistant": "Sarvam सहायक",
  "Local assistant": "स्थानीय सहायक",
  "You": "आप",
  "AI farm companion": "AI खेती साथी",
  "Playing…": "चल रहा है…",
  "Listen": "सुनें",
  "Voice unavailable": "आवाज़ उपलब्ध नहीं",
  "Mandi data": "मंडी डेटा",
  "Conditions available": "मौसम की जानकारी उपलब्ध",
  "Clear sky": "साफ़ आसमान",
  "Mostly clear": "ज़्यादातर साफ़",
  "Partly cloudy": "आंशिक बादल",
  "Overcast": "बादल छाए हैं",
  "Foggy": "कोहरा",
  "Rime fog": "पाला और कोहरा",
  "Light drizzle": "हल्की बूंदाबांदी",
  "Drizzle": "बूंदाबांदी",
  "Heavy drizzle": "तेज़ बूंदाबांदी",
  "Light rain": "हल्की बारिश",
  "Rain": "बारिश",
  "Heavy rain": "तेज़ बारिश",
  "Light snow": "हल्की बर्फ़बारी",
  "Rain showers": "बारिश की बौछारें",
  "Showers": "बौछारें",
  "Heavy showers": "तेज़ बौछारें",
  "Thunderstorm": "आंधी-तूफ़ान",
  "Thunderstorm & hail": "आंधी और ओले",
  "Heavy thunderstorm": "तेज़ आंधी-तूफ़ान",
  "Searching…": "खोज रहे हैं…",
  "Loading…": "लोड हो रहा है…",
  "Market": "मंडी",
  "Variety": "किस्म",
  "Min / quintal": "न्यूनतम / क्विंटल",
  "Max / quintal": "अधिकतम / क्विंटल",
  "Modal / quintal": "मॉडल / क्विंटल",
  "Arrival date": "आवक की तारीख",
  "For best results, photograph one affected leaf in natural light, close enough to see the details.": "बेहतर जाँच के लिए प्रभावित पत्ती की पास से, प्राकृतिक रोशनी में तस्वीर लें।",
  "e.g. yellow edges, small brown spots": "जैसे: पीले किनारे, छोटे भूरे धब्बे",
  "Your photo is sent to Gemini for analysis when you submit. Free-tier API data may be used by Google to improve its products. Avoid photos with people or personal details.": "भेजने पर आपकी तस्वीर जाँच के लिए Gemini को भेजी जाएगी। मुफ़्त सेवा में Google डेटा का उपयोग उत्पाद सुधार के लिए कर सकता है। लोगों या निजी जानकारी वाली तस्वीर न भेजें।",
  "AI-assisted triage only. Check with an agricultural expert before acting.": "यह AI की शुरुआती जाँच है। कदम उठाने से पहले कृषि विशेषज्ञ से सलाह लें।",
  "Upload a clear photo and KhetiQ will describe visible signs, possible causes, and safe next steps.": "साफ़ तस्वीर जोड़ें; KhetiQ दिख रहे लक्षण, संभावित कारण और सुरक्षित अगले कदम बताएगा।",
  "No image diagnosis has been made yet.": "अभी तस्वीर की जाँच नहीं हुई है।",
  "A photo cannot confirm a disease. Avoid chemical treatment until symptoms are checked by a trusted local expert.": "तस्वीर से बीमारी पक्की नहीं होती। भरोसेमंद स्थानीय विशेषज्ञ से जाँच तक रसायन का उपयोग न करें।",
  "Find a Krishi Vigyan Kendra": "कृषि विज्ञान केंद्र खोजें",
  "Information changes.": "जानकारी बदल सकती है।",
  "KhetiQ links you to official portals. Verify eligibility, benefits, deadlines, and application status directly before applying.": "KhetiQ आपको सरकारी पोर्टल तक पहुँचाता है। आवेदन से पहले पात्रता, लाभ, अंतिम तारीख और स्थिति की पुष्टि करें।",
  "myScheme lets you explore central and state/UT schemes using your basic profile.": "myScheme पर अपनी सामान्य जानकारी से केंद्र और राज्य/केंद्रशासित योजनाएँ खोजें।",
  "A little context helps KhetiQ make recommendations more useful. Your profile stays on this device.": "खेत की थोड़ी जानकारी KhetiQ की सलाह को उपयोगी बनाती है। आपकी प्रोफ़ाइल इसी डिवाइस पर रहती है।",
  "Your profile is saved in this browser. Weather requests use your coordinates; Gemini receives your question and farm context when enabled. Crop photos are sent only after you submit them.": "आपकी प्रोफ़ाइल इसी ब्राउज़र में सहेजी जाती है। मौसम के लिए आपके निर्देशांक इस्तेमाल होते हैं; चालू होने पर Gemini को सवाल और खेत की जानकारी भेजी जाती है। फसल की तस्वीरें भेजने पर ही साझा होती हैं।",
  "Weather forecast": "मौसम का पूर्वानुमान",
  "AI assistant & crop photo triage": "AI सहायक और फसल तस्वीर जाँच",
  "Voice & Indian-language assistant": "आवाज़ और भारतीय-भाषा सहायक",
  "Keys stay on the server. Add them to your local": "कुंजियाँ सर्वर पर रहती हैं। इन्हें अपनी स्थानीय",
  "file, or to your deployment host’s environment settings.": "फ़ाइल या डिप्लॉयमेंट होस्ट की पर्यावरण सेटिंग में जोड़ें।",
  "“Key added” only means a key is present. The first real request still needs to succeed before that integration is verified.": "“कुंजी जुड़ी है” का अर्थ है कि कुंजी मौजूद है। कनेक्शन की पुष्टि के लिए पहला असली अनुरोध सफल होना चाहिए।",
  "Income support": "आय सहायता",
  "Water & irrigation": "पानी और सिंचाई",
  "Crop protection": "फसल सुरक्षा",
  "Credit": "ऋण",
  "Central": "केंद्र सरकार",
  "Irrigation": "सिंचाई",
  "Insurance": "बीमा",
  "PM-KISAN": "पीएम-किसान",
  "PM Krishi Sinchayee Yojana": "प्रधानमंत्री कृषि सिंचाई योजना",
  "Pradhan Mantri Fasal Bima Yojana": "प्रधानमंत्री फसल बीमा योजना",
  "Kisan Credit Card": "किसान क्रेडिट कार्ड",
  "Explore the central income-support scheme for eligible landholding farmer families.": "पात्र भूमिधारक किसान परिवारों के लिए केंद्र की आय सहायता योजना देखें।",
  "Find official information on irrigation coverage and water-use efficiency components.": "सिंचाई कवरेज और जल उपयोग दक्षता की आधिकारिक जानकारी पाएँ।",
  "Check the current crop insurance information and application route for your area.": "अपने क्षेत्र की मौजूदा फसल बीमा जानकारी और आवेदन प्रक्रिया देखें।",
  "Learn about institutional credit for cultivation and allied activities from official sources.": "खेती और संबंधित गतिविधियों के संस्थागत ऋण की जानकारी आधिकारिक स्रोतों से पाएँ।",
  "DATA": "डेटा",
  "Change farm location": "खेत का स्थान बदलें",
  "Open farm assistant": "खेती सहायक खोलें",
  "Search location": "जगह खोजें",
  "e.g. Rajasthan": "जैसे: राजस्थान",
  "e.g. Jaipur": "जैसे: जयपुर",
  "View weather": "मौसम देखें",
  "across": "में",
  "in": "में",
  "in India": "भारत में",
  "Search all": "सभी खोजें",
  "No records matched": "कोई रिकॉर्ड नहीं मिला",
  "Retrieved": "प्राप्त हुआ",
  "Next": "अगले",
  "days": "दिन",
  "For public deployment, register for a WeatherAPI.com free key and set WEATHERAPI_KEY on the server. The no-key Open-Meteo fallback is only for local non-commercial previews. WeatherAPI attribution is shown in the app.": "सार्वजनिक डिप्लॉयमेंट के लिए WeatherAPI.com की मुफ़्त कुंजी लेकर सर्वर पर WEATHERAPI_KEY सेट करें। बिना कुंजी वाला Open-Meteo विकल्प केवल स्थानीय गैर-व्यावसायिक पूर्वावलोकन के लिए है। ऐप में WeatherAPI का स्रोत दिखाया जाता है।",
  "Register on data.gov.in and set DATA_GOV_API_KEY in the server .env (local) or host environment (deployed). Restart or redeploy the server, then search once to confirm actual records.": "data.gov.in पर पंजीकरण करें और स्थानीय सर्वर की .env फ़ाइल या डिप्लॉय होस्ट पर DATA_GOV_API_KEY सेट करें। सर्वर फिर शुरू/डिप्लॉय करें और असली रिकॉर्ड खोजकर पुष्टि करें।",
  "Create a key in AI Studio and set GEMINI_API_KEY on the server. Never add it to VITE_* variables. Free-tier prompts and images may be used to improve Google products.": "AI Studio में कुंजी बनाएँ और सर्वर पर GEMINI_API_KEY सेट करें। इसे VITE_* में न रखें। मुफ़्त सेवा के सवाल और तस्वीरें Google उत्पाद सुधारने में इस्तेमाल हो सकती हैं।",
  "Saaras v4 transcribes recordings up to 30 seconds. Bulbul v4 Flash reads most languages; Malayalam and Odia use Bulbul v3. When Gemini is not configured, Sarvam 105B answers selected non-English chats. After ₹100 signup credits: STT is ₹0.49/min; TTS is ₹1/1,000 chars (v4) or ₹3/1,000 (v3); chat is token-priced, excluding GST. Set SARVAM_API_KEY only on the server.": "Saaras v4 30 सेकंड तक की रिकॉर्डिंग लिखित रूप में बदलता है। Bulbul v4 Flash आवाज़ सेवा देता है। Gemini न होने पर Sarvam 105B चुनी हुई भारतीय-भाषा बातचीत का जवाब देता है। साइन-अप के ₹100 क्रेडिट के बाद उपयोग के अनुसार शुल्क लगेगा। SARVAM_API_KEY केवल सर्वर पर रखें।",
  "Free WeatherAPI key needed for deployment": "डिप्लॉयमेंट के लिए WeatherAPI की मुफ़्त कुंजी चाहिए",
  "Local fallback only · non-commercial": "केवल स्थानीय पूर्वावलोकन · गैर-व्यावसायिक",
  "Free key · add before using mandi search": "मुफ़्त कुंजी · मंडी खोज से पहले जोड़ें",
  "Free tier for eligible models · limits apply": "पात्र मॉडलों के लिए मुफ़्त स्तर · सीमाएँ लागू",
  "₹100 free signup credits · usage billed afterward": "साइन-अप पर ₹100 मुफ़्त क्रेडिट · बाद में उपयोग शुल्क",
  "Smarter farming. Better decisions.": "बेहतर खेती। बेहतर फैसले।",
  "KhetiQ recommendations are decision support. Weather forecasts may change. Verify critical actions with your local KVK or agricultural extension officer.": "KhetiQ की सलाह फैसले लेने में मदद के लिए है। मौसम बदल सकता है। ज़रूरी कदमों की पुष्टि स्थानीय KVK या कृषि अधिकारी से करें।",
  "The arrival date is the market record date.": "आवक की तारीख मंडी रिकॉर्ड की तारीख है।",
  "Open": "खोलें",
  ", then add it to": ", फिर इसे यहाँ जोड़ें:",
  "Choose assistant and voice language": "सहायक और आवाज़ की भाषा चुनें",
  "Assistant and voice language": "सहायक और आवाज़ की भाषा",
  "Close": "बंद करें",
  "e.g. 25": "जैसे: 25",
  "Weather by": "मौसम स्रोत",
  "Search prices": "भाव खोजें",
  "Create a key at": "यहाँ कुंजी बनाएँ:",
  "in your server environment. No prices are shown until the request succeeds.": "अपने सर्वर की सेटिंग में। अनुरोध सफल होने तक भाव नहीं दिखेंगे।",
  "KhetiQ shows where information comes from and when it was updated. When a source is unavailable, we’ll say so.": "KhetiQ बताता है कि जानकारी कहाँ से आई और कब अपडेट हुई। कोई स्रोत उपलब्ध न हो, तो हम यह भी बताएँगे।",
  "Dashboard language": "डैशबोर्ड की भाषा",
  "Upcoming tools": "आने वाले टूल",
  "Coming soon": "जल्द आ रहा है",
  "We’re preparing more helpful tools for your farm. Check back soon.": "हम आपके खेत के लिए और उपयोगी सुविधाएँ तैयार कर रहे हैं। जल्द फिर देखें।",
  "Planned features": "योजना में शामिल सुविधाएँ",
  "These are planned features and aren’t available yet.": "ये सुविधाएँ अभी योजना में हैं, उपलब्ध नहीं हैं।",
  "Mandi price alerts": "मंडी भाव की सूचना",
  "Track rates for your crops and preferred markets.": "अपनी फसलों और पसंदीदा मंडियों के भाव पर नज़र रखें।",
  "Weather & rain alerts": "मौसम और बारिश की सूचना",
  "Get timely updates for your farm location.": "अपने खेत के स्थान के लिए समय पर मौसम की जानकारी पाएँ।",
  "Offline farm notes": "ऑफ़लाइन खेत नोट्स",
  "Keep saved farm information available on weak networks.": "कमज़ोर नेटवर्क पर भी सहेजी गई खेत की जानकारी देखें।",
  "YOUR FARM PLAN": "आपके खेत की योजना",
  "Farm context": "खेत की जानकारी",
  "Active": "बाकी",
  "Completed reminders": "पूरे हुए",
  "Use this planner for your own dates and tasks. Check local conditions and trusted agricultural guidance before acting.": "इस योजना में अपनी तारीखें और काम रखें। कोई कदम उठाने से पहले स्थानीय हालात और भरोसेमंद कृषि सलाह देखें।",
  "Add a note": "नोट लिखें",
  "Crop planner": "फसल योजना",
  "Plan farm tasks": "खेत के काम तय करें",
  "Keep important dates and farm tasks in one place.": "खेत के ज़रूरी काम और तारीखें एक जगह रखें।",
  "Saved on this device": "इस डिवाइस पर सहेजा गया",
  "Add a reminder": "रिमाइंडर जोड़ें",
  "Task name": "काम का नाम",
  "e.g. Check field irrigation": "जैसे: खेत की सिंचाई जाँचें",
  "Due date": "तारीख",
  "Notes (optional)": "नोट (वैकल्पिक)",
  "Add to my plan": "मेरी योजना में जोड़ें",
  "Your reminders": "आपके रिमाइंडर",
  "No reminders yet": "अभी कोई रिमाइंडर नहीं",
  "Add a farm task and choose when you want to do it.": "खेत का काम जोड़ें और उसकी तारीख चुनें।",
  "Due today": "आज करना है",
  "Overdue": "तारीख निकल गई",
  "Upcoming": "आने वाला",
  "Completed": "पूरा हुआ",
  "Mark complete": "पूरा हुआ चिह्नित करें",
  "Mark as not complete": "अधूरा चिह्नित करें",
  "Delete reminder": "रिमाइंडर हटाएँ",
  "Reminder saved on this device": "रिमाइंडर इस डिवाइस पर सहेजा गया",
  "Reminder removed": "रिमाइंडर हटा दिया गया",
  "This planner stores your own reminders in this browser. It does not send push notifications or prescribe farm treatments.": "यह योजना आपके रिमाइंडर इसी ब्राउज़र में सहेजती है। यह पुश सूचना नहीं भेजती और खेती के उपचार नहीं बताती।",
  "Close announcement": "सूचना बंद करें",
  "Got it": "ठीक है"
}
const RUNTIME_UI_TRANSLATIONS = Object.create(null)
const PENDING_UI_TRANSLATIONS = new Map()
const REQUESTED_UI_TRANSLATIONS = new Map()
function cachedUiTranslations(language) {
  try { return JSON.parse(localStorage.getItem(`khetiq-ui-${language}`) || '{}') } catch { return {} }
}
function setRuntimeUiTranslations(language, translations) {
  RUNTIME_UI_TRANSLATIONS[language] = { ...(RUNTIME_UI_TRANSLATIONS[language] || {}), ...translations }
}
function takePendingUiTranslations(language) {
  const texts = [...(PENDING_UI_TRANSLATIONS.get(language) || [])]
  PENDING_UI_TRANSLATIONS.delete(language)
  const requested = REQUESTED_UI_TRANSLATIONS.get(language) || new Set()
  return texts.filter((text) => !Object.hasOwn(RUNTIME_UI_TRANSLATIONS[language] || {}, text) && !requested.has(text))
}
function translate(text, language = "English") {
  if (language === 'English') return text
  const local = language === 'हिंदी' ? HINDI_UI : language === 'বাংলা' ? BENGALI_UI : null
  if (local && Object.hasOwn(local, text)) return local[text]
  const cached = RUNTIME_UI_TRANSLATIONS[language] || {}
  if (Object.hasOwn(cached, text)) return cached[text]
  if (!PENDING_UI_TRANSLATIONS.has(language)) PENDING_UI_TRANSLATIONS.set(language, new Set())
  if ((REQUESTED_UI_TRANSLATIONS.get(language) || new Set()).has(text)) return text
  PENDING_UI_TRANSLATIONS.get(language).add(text)
  return text
}
function localeForLanguage(language = 'English') {
  return VOICE_LANGUAGES.find((item) => item.label === language)?.code || 'en-IN'
}
const ENGLISH_GREETING = 'Namaste! I’m your KhetiQ farm companion. Ask me about the weather, irrigation, mandi prices, crop health, or a government scheme.'
function greetingFor(language) { return translate(ENGLISH_GREETING, language) }

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'assistant', label: 'Farm assistant', icon: MessageCircle },
  { id: 'weather', label: 'Weather', icon: CloudSun },
  { id: 'markets', label: 'Mandi prices', icon: BarChart3, chip: 'DATA' },
  { id: 'crop', label: 'Crop health', icon: Leaf },
  { id: 'schemes', label: 'Schemes', icon: ShieldCheck },
  { id: 'planner', label: 'Crop planner', icon: CalendarDays },
]
const UPCOMING_FEATURES = [
  { icon: BarChart3, title: 'Mandi price alerts', description: 'Track rates for your crops and preferred markets.' },
  { icon: CloudRain, title: 'Weather & rain alerts', description: 'Get timely updates for your farm location.' },
  { icon: Sprout, title: 'Offline farm notes', description: 'Keep saved farm information available on weak networks.' },
]
const WEATHER_LABELS = { 0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 80: 'Rain showers', 81: 'Showers', 82: 'Heavy showers', 95: 'Thunderstorm', 96: 'Thunderstorm & hail', 99: 'Heavy thunderstorm' }
const schemeCards = [
  { category: 'Income support', title: 'PM-KISAN', body: 'Explore the central income-support scheme for eligible landholding farmer families.', tags: ['Central', 'Income support'], url: 'https://pmkisan.gov.in/' },
  { category: 'Water & irrigation', title: 'PM Krishi Sinchayee Yojana', body: 'Find official information on irrigation coverage and water-use efficiency components.', tags: ['Central', 'Irrigation'], url: 'https://pmksy.gov.in/' },
  { category: 'Crop protection', title: 'Pradhan Mantri Fasal Bima Yojana', body: 'Check the current crop insurance information and application route for your area.', tags: ['Central', 'Insurance'], url: 'https://pmfby.gov.in/' },
  { category: 'Credit', title: 'Kisan Credit Card', body: 'Learn about institutional credit for cultivation and allied activities from official sources.', tags: ['Central', 'Credit'], url: 'https://www.myscheme.gov.in/' },
]

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}
function formatDate(date, options = { weekday: 'short', day: 'numeric', month: 'short' }, language = 'English') { return new Date(date).toLocaleDateString(localeForLanguage(language), options) }
const rupees = (value, language = 'English') => Number.isFinite(Number(value)) ? `₹${Number(value).toLocaleString(localeForLanguage(language))}` : '—'

function WeatherIcon({ code, size = 22 }) {
  if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return <CloudRain size={size} />
  if ([51, 53, 55].includes(code)) return <CloudDrizzle size={size} />
  if ([1, 2, 3, 45, 48].includes(code)) return <CloudSun size={size} />
  return <Sun size={size} />
}

function readFarmReminders() {
  try {
    const saved = JSON.parse(localStorage.getItem('khetiq-reminders') || '[]')
    return Array.isArray(saved) ? saved.filter((item) => item && typeof item.title === 'string' && item.date) : []
  } catch { return [] }
}

function App() {
  const [page, setPage] = useState('overview')
  const [profile, setProfile] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('khetiq-profile') || '{}')
    return { ...DEFAULT_PROFILE, ...saved, language: VOICE_LANGUAGES.some((item) => item.label === saved.language) ? saved.language : 'English' }
  })
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState('')
  const [integrations, setIntegrations] = useState({})
  const [placeSearch, setPlaceSearch] = useState('')
  const [placeResults, setPlaceResults] = useState([])
  const [placeLoading, setPlaceLoading] = useState(false)
  const [placeError, setPlaceError] = useState('')
  const [placeOpen, setPlaceOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [integrationsOpen, setIntegrationsOpen] = useState(false)
  const [upcomingOpen, setUpcomingOpen] = useState(false)
  const [reminders, setReminders] = useState(readFarmReminders)
  const [language, setLanguage] = useState(profile.language || 'English')
  if (!RUNTIME_UI_TRANSLATIONS[language]) setRuntimeUiTranslations(language, cachedUiTranslations(language))
  const t = (text) => translate(text, language)
  const [translationRevision, setTranslationRevision] = useState(0)
  const [translationLoading, setTranslationLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [marketCommodity, setMarketCommodity] = useState('Wheat')
  const [marketState, setMarketState] = useState(profile.state || '')
  const [marketDistrict, setMarketDistrict] = useState(profile.district || '')
  const [marketFallbackFrom, setMarketFallbackFrom] = useState('')
  const [marketData, setMarketData] = useState(null)
  const [marketLoading, setMarketLoading] = useState(false)
  const [marketError, setMarketError] = useState('')
  const [schemeFilter, setSchemeFilter] = useState('All schemes')
  const [schemeSearch, setSchemeSearch] = useState('')
  const [messages, setMessages] = useState(() => [{ role: 'assistant', text: greetingFor(language) }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [handsFree, setHandsFree] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [activeTools, setActiveTools] = useState([])
  const [cropFile, setCropFile] = useState(null)
  const [cropPreview, setCropPreview] = useState('')
  const [cropName, setCropName] = useState('')
  const [cropNotes, setCropNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [diagnosisLoading, setDiagnosisLoading] = useState(false)
  const [diagnosisError, setDiagnosisError] = useState('')
  const chatEnd = useRef(null)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  const recordingTimer = useRef(null)
  const activeAudio = useRef(null)
  const uploadInput = useRef(null)

  useEffect(() => { localStorage.setItem('khetiq-profile', JSON.stringify({ ...profile, language })) }, [profile, language])
  useEffect(() => { document.documentElement.lang = localeForLanguage(language); document.documentElement.dir = language === 'اردو' ? 'rtl' : 'ltr' }, [language])
  useEffect(() => {
    if (language === 'English') { setTranslationLoading(false); return }
    const timer = setTimeout(async () => {
      const texts = takePendingUiTranslations(language)
      if (!texts.length) return
      const targetLanguage = language
      if (!REQUESTED_UI_TRANSLATIONS.has(targetLanguage)) REQUESTED_UI_TRANSLATIONS.set(targetLanguage, new Set())
      texts.forEach((text) => REQUESTED_UI_TRANSLATIONS.get(targetLanguage).add(text))
      setTranslationLoading(true)
      try {
        const result = await api('/api/ui/translate', { method: 'POST', body: JSON.stringify({ languageCode: localeForLanguage(targetLanguage), texts }) })
        setRuntimeUiTranslations(targetLanguage, result.translations || {})
        try { localStorage.setItem(`khetiq-ui-${targetLanguage}`, JSON.stringify(RUNTIME_UI_TRANSLATIONS[targetLanguage])) } catch { /* Keep this session usable when browser storage is full. */ }
        setMessages((current) => current.length === 1 && current[0].role === 'assistant' && [ENGLISH_GREETING, ...Object.values(HINDI_UI), ...Object.values(BENGALI_UI)].includes(current[0].text)
          ? [{ ...current[0], text: greetingFor(targetLanguage) }]
          : current)
        setTranslationRevision((revision) => revision + 1)
      } catch (error) {
        if (targetLanguage === language) setToast(error.message.includes('credits') || error.message.includes('402') ? 'Sarvam translation credits are unavailable. Showing saved translations and English for the rest.' : 'Some translations are unavailable right now. Showing saved translations and English for the rest.')
      } finally { setTranslationLoading(false) }
    }, 60)
    return () => clearTimeout(timer)
  }, [language, page, translationRevision, settingsOpen, upcomingOpen, integrationsOpen, placeOpen, marketData, marketFallbackFrom, marketError, diagnosis, weather, integrations])
  useEffect(() => { localStorage.setItem('khetiq-reminders', JSON.stringify(reminders)) }, [reminders])
  useEffect(() => {
    api('/api/health').then((data) => setIntegrations(data.integrations)).catch(() => {})
    loadWeather(profile.latitude, profile.longitude)
  }, [profile.latitude, profile.longitude])
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, chatLoading])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 2800); return () => clearTimeout(id) }, [toast])
  useEffect(() => () => {
    clearTimeout(recordingTimer.current)
    mediaRecorder.current?.stream?.getTracks().forEach((track) => track.stop())
    activeAudio.current?.pause()
  }, [])

  async function loadWeather(lat = profile.latitude, lon = profile.longitude) {
    setWeatherLoading(true)
    setWeatherError('')
    try { setWeather(await api(`/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`)) }
    catch (error) { setWeatherError(error.message); setWeather(null) }
    finally { setWeatherLoading(false) }
  }
  async function searchPlace(event) {
    event?.preventDefault()
    if (!placeSearch.trim()) return
    setPlaceLoading(true); setPlaceResults([]); setPlaceError('')
    try {
      const results = (await api(`/api/geocode?q=${encodeURIComponent(placeSearch)}`)).results || []
      setPlaceResults(results)
      if (!results.length) setPlaceError(t('No matching places. Try a nearby town or district.'))
    }
    catch (error) { setPlaceError(error.message) }
    finally { setPlaceLoading(false) }
  }
  function selectPlace(place) {
    const next = { ...profile, location: place.name, district: place.name, state: place.admin1 || profile.state, latitude: place.latitude, longitude: place.longitude }
    setProfile(next); setMarketState(next.state); setMarketDistrict(next.district); setPlaceResults([]); setPlaceError(''); setPlaceOpen(false); setMobileNav(false); setSettingsOpen(false); setToast(`Farm location set to ${place.name}`)
  }
  function addReminder(reminder) {
    setReminders((current) => [{ ...reminder, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, done: false, createdAt: new Date().toISOString() }, ...current])
    setToast(t('Reminder saved on this device'))
  }
  function toggleReminder(id) { setReminders((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item)) }
  function deleteReminder(id) { setReminders((current) => current.filter((item) => item.id !== id)); setToast(t('Reminder removed')) }
  async function loadMarkets(event, overrides = {}) {
    event?.preventDefault()
    const queryState = overrides.state ?? marketState
    const queryDistrict = overrides.district ?? marketDistrict
    const fallbackFromDistrict = overrides.fallbackFromDistrict || ''
    setMarketFallbackFrom(fallbackFromDistrict)
    if ('district' in overrides) setMarketDistrict(queryDistrict)
    setMarketLoading(true); setMarketError(''); setMarketData(null)
    try { setMarketData(await api(`/api/mandi?${new URLSearchParams({ commodity: marketCommodity, state: queryState, district: queryDistrict })}`)) }
    catch (error) { setMarketError(error.message) }
    finally { setMarketLoading(false) }
  }
  async function speakAnswer(text, selectedLanguage = language) {
    const voiceLanguage = VOICE_LANGUAGES.find((item) => item.label === selectedLanguage) || VOICE_LANGUAGES[0]
    setSpeaking(true)
    try {
      activeAudio.current?.pause()
      const response = await api('/api/voice/speak', { method: 'POST', body: JSON.stringify({ text, languageCode: voiceLanguage.code }) })
      const bytes = Uint8Array.from(atob(response.audioBase64), (character) => character.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes], { type: response.mimeType || 'audio/wav' }))
      const player = new Audio(url)
      activeAudio.current = player
      player.onended = () => { URL.revokeObjectURL(url); setSpeaking(false) }
      player.onerror = () => { URL.revokeObjectURL(url); setSpeaking(false); setToast('Audio could not be played on this device.') }
      await player.play()
    } catch (error) { setSpeaking(false); setToast(error.message) }
  }
  async function sendChat(event, suggested = '', options = {}) {
    event?.preventDefault()
    const text = (suggested || chatInput).trim()
    if (!text || chatLoading) return
    const replyLanguage = options.replyLanguage || language
    const userMessage = replyLanguage === 'English' ? text : `${text}\nPlease reply in ${replyLanguage}, using its native script.`
    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages); setChatInput(''); setChatLoading(true); setActiveTools([])
    try {
      const response = await api('/api/chat', { method: 'POST', body: JSON.stringify({ message: userMessage, history: messages.slice(-8), profile: { ...profile, language: replyLanguage } }) })
      setActiveTools(response.tools || [])
      setMessages([...nextMessages, { role: 'assistant', text: response.answer, tools: response.tools || [], model: response.model }])
      if ((handsFree || options.speak) && VOICE_OUTPUT_LANGUAGES.has(replyLanguage)) void speakAnswer(response.answer, replyLanguage)
    } catch (error) { setMessages([...nextMessages, { role: 'assistant', text: error.message, error: true }]) }
    finally { setChatLoading(false) }
  }
  async function transcribeVoice(blob) {
    if (!blob.size) { setToast('No audio was captured. Please try again.'); return }
    setTranscribing(true)
    try {
      const bytes = new Uint8Array(await blob.arrayBuffer())
      let binary = ''
      for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
      const response = await api('/api/voice/transcribe', { method: 'POST', body: JSON.stringify({ audio: btoa(binary), mimeType: blob.type || 'audio/webm' }) })
      const transcript = response.transcript?.trim()
      if (!transcript) { setToast('I couldn’t make out the recording. Please try speaking a little closer to the microphone.'); return }
      const detectedLanguage = VOICE_LANGUAGES.find((item) => item.code.toLowerCase() === response.languageCode?.toLowerCase())
      const replyLanguage = detectedLanguage?.label || language
      if (detectedLanguage) { setLanguage(detectedLanguage.label); setProfile((current) => ({ ...current, language: detectedLanguage.label })) }
      if (handsFree) await sendChat(null, transcript, { replyLanguage, speak: true })
      else setChatInput((current) => current.trim() ? `${current.trim()} ${transcript}` : transcript)
    } catch (error) { setToast(error.message) }
    finally { setTranscribing(false) }
  }
  async function toggleVoice() {
    if (recording) { clearTimeout(recordingTimer.current); mediaRecorder.current?.stop(); setRecording(false); return }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setToast('Voice recording is not supported in this browser. Try the latest Chrome, Edge, or Safari.'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const preferredType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = preferredType ? new MediaRecorder(stream, { mimeType: preferredType }) : new MediaRecorder(stream)
      audioChunks.current = []
      recorder.ondataavailable = (event) => { if (event.data.size) audioChunks.current.push(event.data) }
      recorder.onstop = async () => {
        clearTimeout(recordingTimer.current)
        stream.getTracks().forEach((track) => track.stop())
        await transcribeVoice(new Blob(audioChunks.current, { type: recorder.mimeType || 'audio/webm' }))
      }
      recorder.onerror = () => { stream.getTracks().forEach((track) => track.stop()); setRecording(false); setToast('The microphone recording stopped unexpectedly.') }
      mediaRecorder.current = recorder
      recorder.start()
      setRecording(true)
      recordingTimer.current = setTimeout(() => { setToast('30 second limit reached. Transcribing your question…'); recorder.stop(); setRecording(false) }, 30_000)
    } catch (error) { setToast(error.name === 'NotAllowedError' ? 'Allow microphone access in your browser to record a question.' : 'Could not start the microphone. Please try again.') }
  }
  function selectImage(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { setDiagnosisError('Choose a photo in JPG, PNG, or WebP format.'); return }
    if (file.size > 3.5 * 1024 * 1024) { setDiagnosisError('That image is larger than 3.5 MB. Choose a smaller photo.'); return }
    setCropFile(file); setCropPreview(URL.createObjectURL(file)); setDiagnosis(''); setDiagnosisError('')
  }
  async function analyzeCrop(event) {
    event.preventDefault(); if (!cropFile) return
    setDiagnosisLoading(true); setDiagnosisError(''); setDiagnosis('')
    try {
      const image = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(cropFile) })
      const response = await api('/api/diagnose', { method: 'POST', body: JSON.stringify({ image, mimeType: cropFile.type, crop: cropName, details: cropNotes, language }) })
      setDiagnosis(response.answer)
    } catch (error) { setDiagnosisError(error.message) }
    finally { setDiagnosisLoading(false) }
  }

  const weatherCode = weather?.current?.weather_code
  const weatherTitle = weather?.current?.weather_label || WEATHER_LABELS[weatherCode] || 'Conditions available'
  const nextRain = weather?.daily?.precipitation_probability_max?.[1]
  const filteredSchemes = useMemo(() => schemeCards.filter((item) => (schemeFilter === 'All schemes' || item.category === schemeFilter) && `${item.title} ${item.body} ${item.tags.join(' ')}`.toLowerCase().includes(schemeSearch.toLowerCase())), [schemeFilter, schemeSearch])

    return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand-lockup"><div className="brand-mark"><Sprout size={21} strokeWidth={2.3} /></div><div><div className="brand-name">kheti<span>q</span></div><div className="brand-caption">{t("YOUR FARM, IN FOCUS")}</div></div><button className="icon-button sidebar-close" aria-label={t("Close menu")} onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="farm-switcher"><div className="farm-avatar"><Wheat size={18}/></div><div className="farm-switch-copy"><span>{t("MY FARM")}</span><strong>{t(profile.location)} {t('farm')}</strong></div><button className="switch-caret" aria-label={t("Change farm location")} onClick={() => { setPlaceOpen(!placeOpen); setPlaceSearch('') }}><ChevronDown size={16}/></button></div>
      {placeOpen && <div className="location-popover"><form className="location-search" onSubmit={searchPlace}><Search size={16}/><input placeholder={t("Search village or town")} value={placeSearch} onChange={(e) => { setPlaceSearch(e.target.value); setPlaceError(''); setPlaceResults([]) }}/><button aria-label={t("Search location")}><ArrowRight size={15}/></button></form>{placeLoading && <small className="muted">{t("Finding places…")}</small>}{placeError && <small className="muted">{t(placeError)}</small>}{placeResults.map((place, index) => <button className="place-option" key={`${place.name}-${index}`} onClick={() => selectPlace(place)}><MapPin size={15}/><span>{place.name}, {place.admin1}</span></button>)}</div>}
      <div className="nav-label">{t("FARM TOOLS")}</div>
      <nav className="side-nav">{NAV_ITEMS.map(({ id, label, icon: Icon, chip }) => <button key={id} className={`nav-item ${page === id ? 'nav-active' : ''}`} onClick={() => { setPage(id); setMobileNav(false) }}><Icon size={18} strokeWidth={1.8}/><span>{t(label)}</span>{chip && <span className="live-chip">{t(chip)}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><button type="button" className="upcoming-card" onClick={() => setUpcomingOpen(true)}><span className="upcoming-card-icon"><Sparkles size={16}/></span><span className="upcoming-card-copy"><strong>{t("Upcoming tools")}</strong><small>{t("Coming soon")}</small></span><ArrowRight className="upcoming-card-arrow" size={15}/></button><div className="help-card"><div className="help-icon"><Leaf size={16}/></div><div><strong>{t("Growing something?")}</strong><p>{t("Ask KhetiQ, your field-side companion.")}</p></div><button onClick={() => setPage('assistant')} aria-label={t("Open farm assistant")}><ArrowRight size={15}/></button></div><button className="profile-row" onClick={() => setSettingsOpen(true)}><div className="profile-avatar">{profile.location.slice(0,1).toUpperCase()}</div><div className="profile-copy"><strong>{t("Farmer profile")}</strong><span>{t(profile.crop)} · {t(profile.state)}</span></div><MoreHorizontal size={19}/></button><div className="sidebar-foot">{t("MADE FOR THE PEOPLE WHO FEED US")} <span>✳</span></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label={t("Open menu")}><Menu size={20}/></button><div className="breadcrumbs"><span>{t("My farm")}</span><ChevronRight size={14}/><strong>{NAV_ITEMS.find((item) => item.id === page)?.label ? t(NAV_ITEMS.find((item) => item.id === page).label) : t('Overview')}</strong></div><div className="top-actions"><button type="button" className="location-pill" onClick={() => { setSettingsOpen(false); setPlaceSearch(''); setPlaceResults([]); setPlaceError(''); setPlaceOpen(true); if (window.innerWidth <= 850) setMobileNav(true) }}><MapPin size={15}/><span>{t(profile.location)}, {t(profile.state)}</span><ChevronDown size={14}/></button><label className="language-picker" title={t("Choose assistant and voice language")}><select className="language-button" value={language} onChange={(event) => { const nextLanguage = event.target.value; setLanguage(nextLanguage); setProfile((current) => ({ ...current, language: nextLanguage })); setMessages((current) => current.length === 1 && current[0].role === 'assistant' ? [{ ...current[0], text: greetingFor(nextLanguage) }] : current) }} aria-label={t("Assistant and voice language")}>{VOICE_LANGUAGES.map((item) => <option key={item.code} value={item.label}>{item.native}</option>)}</select><ChevronDown size={13}/></label><button className="icon-button notification-button" aria-label={t("Notifications")} onClick={() => setToast(t('You’re all caught up.')) }><Bell size={18}/><i/></button><button className="top-profile" onClick={() => setSettingsOpen(true)}>{profile.location.slice(0,1).toUpperCase()}</button></div></header>
      {translationLoading && <div className="translation-loading" role="status" aria-label={t('Translating dashboard…')}><LoaderCircle className="spin" size={15}/></div>}

      {page === 'overview' && <Overview language={language} profile={profile} weather={weather} weatherTitle={weatherTitle} weatherError={weatherError} weatherLoading={weatherLoading} nextRain={nextRain} setPage={setPage} onRefresh={() => loadWeather()} integrations={integrations} />}
      {page === 'assistant' && <section className="page-content assistant-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> {t("YOUR FARM COMPANION")}</div><h1>{t("Let’s figure it out,")} <em>{t("together.")}</em></h1><p>{t("Ask a question. KhetiQ brings the right farm information into one answer.")}</p></div><div className="agent-status"><span className={integrations.gemini?.configured || integrations.sarvam?.configured ? 'status-pulse' : 'status-local'}/>{integrations.gemini?.configured ? t('Gemini assistant') : integrations.sarvam?.configured ? t('Sarvam assistant') : t('Local assistant')}<ChevronDown size={14}/></div></div><div className="chat-layout"><div className="chat-panel"><div className="chat-header"><div className="assistant-avatar"><Sprout size={20}/></div><div><strong>{t("KhetiQ Assistant")}</strong><span><i/> {integrations.sarvam?.configured ? t('Sarvam voice ready') + ' · ' + t(integrations.gemini?.configured ? 'Gemini farm answers' : 'multilingual answers') : t('Add SARVAM_API_KEY on the server for voice')}</span></div><button type="button" className={`voice-mode-toggle ${handsFree ? 'voice-mode-active' : ''}`} aria-pressed={handsFree} onClick={() => setHandsFree((enabled) => !enabled)} disabled={!integrations.sarvam?.configured || !VOICE_OUTPUT_LANGUAGES.has(language)} title={integrations.sarvam?.configured ? t('Automatically send recorded questions and speak replies') : t('Add SARVAM_API_KEY on the server to enable voice')}><Volume2 size={15}/><span>{handsFree ? t('Voice mode on') : t('Talk & listen')}</span></button><button className="icon-button" onClick={() => { setMessages([{ role: 'assistant', text: greetingFor(language) }]); setActiveTools([]) }} aria-label={t('New conversation')}><Plus size={19}/></button></div><div className="chat-messages">{messages.map((message, index) => <ChatBubble key={`${index}-${message.role}`} message={message} profile={profile} onSpeak={speakAnswer} speaking={speaking} voiceEnabled={integrations.sarvam?.configured && VOICE_OUTPUT_LANGUAGES.has(language)} language={language}/>)}{chatLoading && <div className="chat-row"><div className="assistant-avatar small"><Sprout size={15}/></div><div className="typing-bubble"><i/><i/><i/></div><span className="thinking-label">{t("Checking relevant farm information…")}</span></div>}<div ref={chatEnd}/></div>{(recording || transcribing) && <div className={`voice-status ${recording ? 'voice-status-recording' : ''}`}><span/>{recording ? t('Listening… tap the microphone to finish') : t('Transcribing your question…')}</div>}<div className="prompt-shortcuts"><span>{t("Try asking")}</span>{['Will it rain tomorrow?', 'Should I irrigate my wheat?', 'Mandi price for wheat'].map((text) => <button key={text} onClick={(e) => sendChat(e, text)}>{t(text)}<ArrowUpRight size={12}/></button>)}</div><form className="chat-composer" onSubmit={sendChat}><button type="button" className="composer-attach" onClick={() => setPage('crop')} aria-label={t('Upload crop photo')}><ImagePlus size={19}/></button><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={t('Ask about your farm…')} aria-label={t('Ask KhetiQ a question')}/><button type="button" className={`composer-mic ${recording ? 'listening' : ''}`} onClick={toggleVoice} disabled={!integrations.sarvam?.configured || transcribing || chatLoading} aria-label={recording ? t('Stop recording') : t('Record a voice question')} title={recording ? t('Stop recording and transcribe') : t('Record up to 30 seconds')}>{recording ? <Square size={15} fill="currentColor"/> : <Mic size={18}/>}</button><button className="send-button" disabled={!chatInput.trim() || chatLoading || transcribing} aria-label={t('Send question')}><Send size={17}/></button></form><div className="composer-note"><ShieldCheck size={12}/> {t('Sarvam voice uses account credits. Recordings go to Sarvam; replies use your selected language.')}</div></div><aside className="assistant-aside"><div className="context-card"><div className="card-kicker">{t("YOUR FARM CONTEXT")} <button onClick={() => setSettingsOpen(true)}><Settings2 size={15}/></button></div><div className="context-location"><MapPin size={15}/><div><strong>{t(profile.location)}, {t(profile.state)}</strong><small>{t("Farm location")}</small></div></div><div className="context-line"><Wheat size={16}/><span>{t("Current crop")}</span><strong>{t(profile.crop)}</strong></div><div className="context-line"><Thermometer size={16}/><span>{t("Weather")}</span><strong>{weather?.current?.temperature_2m ?? '—'}°C</strong></div><div className="context-line"><CloudRain size={16}/><span>{t("Rain chance tomorrow")}</span><strong>{nextRain ?? '—'}%</strong></div><button className="text-action" onClick={() => setPage('weather')}>{t("View full forecast")} <ArrowRight size={15}/></button></div><div className="agent-note"><div className="agent-note-icon"><ShieldCheck size={17}/></div><strong>{t("Grounded in real sources")}</strong><p>{t('KhetiQ shows where information comes from and when it was updated. When a source is unavailable, we’ll say so.')}</p><button onClick={() => setPage('markets')}>{t("Data integrations")} <ArrowRight size={14}/></button></div></aside></div></section>}
      {page === 'weather' && <WeatherPage language={language} weather={weather} error={weatherError} profile={profile} onRefresh={() => loadWeather()} />}
      {page === 'markets' && <MarketsPage language={language} commodity={marketCommodity} setCommodity={setMarketCommodity} state={marketState} setState={setMarketState} district={marketDistrict} setDistrict={setMarketDistrict} fallbackFromDistrict={marketFallbackFrom} data={marketData} loading={marketLoading} error={marketError} onSearch={loadMarkets} integration={integrations.mandi} />}
      {page === 'crop' && <CropPage language={language} geminiConnected={integrations.gemini?.configured} file={cropFile} preview={cropPreview} crop={cropName} setCrop={setCropName} notes={cropNotes} setNotes={setCropNotes} diagnosis={diagnosis} error={diagnosisError} loading={diagnosisLoading} inputRef={uploadInput} onFile={selectImage} onAnalyze={analyzeCrop} onClear={() => { setCropFile(null); setCropPreview(''); setDiagnosis(''); setDiagnosisError('') }} />}
      {page === 'schemes' && <SchemesPage language={language} search={schemeSearch} setSearch={setSchemeSearch} filter={schemeFilter} setFilter={setSchemeFilter} schemes={filteredSchemes} />}
      {page === 'planner' && <CropPlannerPage language={language} profile={profile} reminders={reminders} onAdd={addReminder} onToggle={toggleReminder} onDelete={deleteReminder} />}
      <footer className="page-footer"><div>© 2026 KhetiQ <span>·</span> {t("Smarter farming. Better decisions.")}</div><div><span>{t("Weather by")} <a href={weather?.sourceUrl || 'https://open-meteo.com/'} target="_blank" rel="noreferrer">{weather?.source || 'Open-Meteo'}</a></span><span>·</span><button onClick={() => setIntegrationsOpen(true)}>{t("Data & integrations")}</button></div></footer>
    </main>

    {settingsOpen && <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}><section className="settings-modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><div className="eyebrow">{t("YOUR KhetiQ")}</div><h2>{t("Farm profile")}</h2></div><button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label={t('Close menu')}><X size={19}/></button></div><p className="modal-description">{t("A little context helps KhetiQ make recommendations more useful. Your profile stays on this device.")}</p><div className="profile-grid"><label>{t("Farm location")}<div className="input-with-icon"><MapPin size={15}/><input value={`${profile.location}, ${profile.state}`} readOnly/><button onClick={() => { setSettingsOpen(false); setPlaceOpen(true) }}>{t("Change")}</button></div></label><label>{t("Main crop")}<select value={profile.crop} onChange={(e) => setProfile({ ...profile, crop: e.target.value })}><option value="Wheat">{t("Wheat")}</option><option value="Rice">{t("Rice")}</option><option value="Mustard">{t("Mustard")}</option><option value="Cotton">{t("Cotton")}</option><option value="Maize">{t("Maize")}</option><option value="Vegetables">{t("Vegetables")}</option><option value="Other">{t("Other")}</option></select></label><label>{t("Crop stage")}<select value={profile.cropStage || 'Growing'} onChange={(e) => setProfile({ ...profile, cropStage: e.target.value })}><option value="Just sown">{t("Just sown")}</option><option value="Growing">{t("Growing")}</option><option value="Flowering">{t("Flowering")}</option><option value="Harvesting">{t("Harvesting")}</option></select></label><label>{t("Days after sowing")} <span className="optional">{t("OPTIONAL")}</span><input type="number" min="0" max="365" value={profile.daysAfterSowing || ''} onChange={(e) => setProfile({ ...profile, daysAfterSowing: e.target.value })} placeholder={t("e.g. 25")}/></label><label>{t("Soil type")} <span className="optional">{t("OPTIONAL")}</span><select value={profile.soilType || 'Not sure'} onChange={(e) => setProfile({ ...profile, soilType: e.target.value })}><option value="Not sure">{t("Not sure")}</option><option value="Clay">{t("Clay")}</option><option value="Loam">{t("Loam")}</option><option value="Sandy">{t("Sandy")}</option><option value="Black soil">{t("Black soil")}</option></select></label><label>{t("Irrigation method")} <span className="optional">{t("OPTIONAL")}</span><select value={profile.irrigationMethod || 'Not sure'} onChange={(e) => setProfile({ ...profile, irrigationMethod: e.target.value })}><option value="Not sure">{t("Not sure")}</option><option value="Flood">{t("Flood")}</option><option value="Drip">{t("Drip")}</option><option value="Sprinkler">{t("Sprinkler")}</option><option value="Rainfed">{t("Rainfed")}</option></select></label></div><div className="privacy-note"><ShieldCheck size={16}/><span>{t("Your profile is saved in this browser. Weather requests use your coordinates; Gemini receives your question and farm context when enabled. Crop photos are sent only after you submit them.")}</span></div><div className="modal-actions"><button className="button-secondary" onClick={() => setSettingsOpen(false)}>{t("Cancel")}</button><button className="button-primary" onClick={() => { setSettingsOpen(false); setToast('Farm profile saved') }}>{t("Save profile")} <Check size={15}/></button></div></section></div>}
    {integrationsOpen && <IntegrationsModal language={language} integrations={integrations} onClose={() => setIntegrationsOpen(false)} />}
    {upcomingOpen && <div className="modal-backdrop upcoming-backdrop" onClick={() => setUpcomingOpen(false)}><section className="upcoming-modal" role="dialog" aria-modal="true" aria-labelledby="upcoming-title" onClick={(event) => event.stopPropagation()}><button className="icon-button upcoming-close" onClick={() => setUpcomingOpen(false)} aria-label={t("Close announcement")}><X size={18}/></button><div className="upcoming-modal-art"><span><Sparkles size={23}/></span><i/><i/><i/></div><div className="eyebrow"><span className="eyebrow-dot"/> {t("Planned features")}</div><h2 id="upcoming-title">{t("Coming soon")}</h2><p>{t("We’re preparing more helpful tools for your farm. Check back soon.")}</p><div className="upcoming-feature-list">{UPCOMING_FEATURES.map(({ icon: Icon, title, description }) => <div className="upcoming-feature" key={title}><span className="upcoming-feature-icon"><Icon size={16}/></span><span><strong>{t(title)}</strong><small>{t(description)}</small></span></div>)}</div><div className="upcoming-note">{t("These are planned features and aren’t available yet.")}</div><button className="button-primary" onClick={() => setUpcomingOpen(false)}>{t("Got it")} <Check size={15}/></button></section></div>}
    {toast && <div className="toast"><Check size={15}/>{toast}</div>}
  </div>
}

function IntegrationsModal({ language, integrations, onClose }) {
  const t = (text) => translate(text, language)
  const rows = [
    { name: 'Weather forecast', provider: integrations.weather?.provider || 'WeatherAPI.com', status: integrations.weather?.configured ? 'KEY ADDED' : integrations.weather?.needsKey ? 'KEY NEEDED' : 'LOCAL PREVIEW', free: integrations.weather?.configured ? 'WeatherAPI.com free tier' : integrations.weather?.needsKey ? 'Free WeatherAPI key needed for deployment' : 'Local fallback only · non-commercial', detail: 'For public deployment, register for a WeatherAPI.com free key and set WEATHERAPI_KEY on the server. The no-key Open-Meteo fallback is only for local non-commercial previews. WeatherAPI attribution is shown in the app.', href: integrations.weather?.configured ? 'https://www.weatherapi.com/docs/' : 'https://www.weatherapi.com/signup.aspx', env: 'WEATHERAPI_KEY' },
    { name: 'Mandi prices', provider: 'AGMARKNET via data.gov.in', status: integrations.mandi?.configured ? 'KEY ADDED' : 'KEY NEEDED', free: 'Free key · add before using mandi search', detail: 'Register on data.gov.in and set DATA_GOV_API_KEY in the server .env (local) or host environment (deployed). Restart or redeploy the server, then search once to confirm actual records.', href: 'https://data.gov.in/user/register', env: 'DATA_GOV_API_KEY' },
    { name: 'AI assistant & crop photo triage', provider: 'Gemini API', status: integrations.gemini?.configured ? 'KEY ADDED' : 'KEY NEEDED', free: 'Free tier for eligible models · limits apply', detail: 'Create a key in AI Studio and set GEMINI_API_KEY on the server. Never add it to VITE_* variables. Free-tier prompts and images may be used to improve Google products.', href: 'https://aistudio.google.com/apikey', env: 'GEMINI_API_KEY' },
    { name: 'Voice & Indian-language assistant', provider: 'Sarvam AI', status: integrations.sarvam?.configured ? 'KEY ADDED' : 'KEY NEEDED', free: '₹100 free signup credits · usage billed afterward', detail: 'Saaras v4 transcribes recordings up to 30 seconds. Bulbul v4 Flash reads most languages; Malayalam and Odia use Bulbul v3. When Gemini is not configured, Sarvam 105B answers selected non-English chats. After ₹100 signup credits: STT is ₹0.49/min; TTS is ₹1/1,000 chars (v4) or ₹3/1,000 (v3); chat is token-priced, excluding GST. Set SARVAM_API_KEY only on the server.', href: 'https://docs.sarvam.ai/api/getting-started/pricing', env: 'SARVAM_API_KEY' },
  ]
  return <div className="modal-backdrop" onClick={onClose}><section className="integrations-modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><div className="eyebrow">{t("SOURCE STATUS")}</div><h2>{t("Data & integrations")}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19}/></button></div><p className="modal-description">{t("Keys stay on the server. Add them to your local")} <code>.env</code> {t("file, or to your deployment host’s environment settings.")}</p><div className="integration-list">{rows.map((row) => <article className="integration-row" key={row.name}><div className={`integration-status ${row.status === 'KEY ADDED' || row.status === 'LOCAL PREVIEW' ? 'integration-ready' : 'integration-needed'}`}><span/></div><div className="integration-info"><div className="integration-title"><strong>{t(row.name)}</strong><span>{t(row.status)}</span></div><div className="integration-provider">{row.provider} · {t(row.free)}</div><p>{t(row.detail)}</p>{row.env && <code className="env-chip">{row.env}</code>}</div><a href={row.href} target="_blank" rel="noreferrer" aria-label={`Open ${row.provider}`}><ExternalLink size={15}/></a></article>)}</div><div className="integrations-note"><ShieldCheck size={15}/><span>{t("“Key added” only means a key is present. The first real request still needs to succeed before that integration is verified.")}</span></div><div className="modal-actions"><button className="button-primary" onClick={onClose}>{t("Done")} <Check size={15}/></button></div></section></div>
}

function Overview({ language, profile, weather, weatherTitle, weatherError, weatherLoading, nextRain, setPage, onRefresh, integrations }) {
  const t = (text) => translate(text, language)
  const daily = weather?.daily
  const dayIndices = [0, 1, 2, 3, 4].slice(0, Math.min(5, daily?.time?.length || 5))
  const low = Math.min(...(daily?.temperature_2m_min || [20]))
  const high = Math.max(...(daily?.temperature_2m_max || [36]))
  return <section className="page-content overview-page">
    <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot"/> {new Date().toLocaleDateString(localeForLanguage(language), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div><h1>{t("Good day,")} <em>{t("farmer.")}</em></h1><p>{t("Here’s what’s happening around your farm.")}</p></div><button className="button-secondary today-button" onClick={onRefresh}><span className="refresh-icon">↻</span> {t("Refresh data")}</button></div>
    <div className="overview-grid">
      <section className="hero-weather-card"><div className="hero-weather-top"><div><div className="hero-kicker"><MapPin size={13}/> {t('FARM WEATHER')} {weather && <span className="live-indicator">{t("LIVE")}</span>}</div><div className="hero-place">{t(profile.location)}, {t(profile.state)}</div><div className="hero-time">{weather?.current?.time ? `${new Date(weather.current.time).toLocaleTimeString(localeForLanguage(language), { hour: '2-digit', minute: '2-digit' })} ${t("local time")}` : weatherLoading ? t('Fetching local forecast…') : t('Forecast unavailable')}</div></div><div className="hero-weather-icon"><WeatherIcon code={weather?.current?.weather_code} size={43}/></div></div><div className="weather-main"><strong>{weather?.current?.temperature_2m ?? '—'}<sup>°</sup></strong><div><b>{t(weatherTitle)}</b><span>{t('Feels like')} {weather?.current?.apparent_temperature ?? '—'}°C</span></div></div><div className="hero-weather-bottom"><div><span><Wind size={14}/> {t("Wind")}</span><strong>{weather?.current?.wind_speed_10m ?? '—'} <small>km/h</small></strong></div><div><span><CloudRain size={14}/> {t("Rain chance")}</span><strong>{nextRain ?? '—'}<small>{t("% tomorrow")}</small></strong></div><div><span><Thermometer size={14}/> {t("Humidity")}</span><strong>{weather?.current?.relative_humidity_2m ?? '—'}<small>%</small></strong></div><button onClick={() => setPage('weather')} aria-label={t('View weather')}><ArrowRight size={17}/></button></div>{weatherError && <div className="weather-error"><Cloud size={14}/>{weatherError}</div>}</section>
      <section className="market-preview-card"><div className="card-heading"><div><div className="eyebrow">{t("MARKET SNAPSHOT")}</div><h2>{t("Nearby mandi rates")}</h2></div><div className="market-icon"><BarChart3 size={19}/></div></div><div className="market-preview-body"><div className="market-empty-icon"><Wheat size={22}/></div><div><strong>{integrations.mandi?.configured ? t('Find today’s local rates') : t('Mandi prices not connected')}</strong><p>{integrations.mandi?.configured ? t('Search current market records for your crop.') : t('Add your free data.gov.in key to load verified AGMARKNET records.')}</p></div></div><button className="card-link" onClick={() => setPage('markets')}>{integrations.mandi?.configured ? t('Compare markets') : t('Connect mandi data')} <ArrowRight size={15}/></button></section>
      <section className="forecast-card"><div className="card-heading"><div><div className="eyebrow">{t("UPCOMING FORECAST")}</div><h2>{t("Plan the next few days")}</h2></div><button className="text-action" onClick={() => setPage('weather')}>{t("Full forecast")} <ArrowRight size={14}/></button></div><div className="forecast-strip">{dayIndices.map((index) => <div className={`forecast-day ${index === 0 ? 'forecast-today' : ''}`} key={index}><span>{daily?.time?.[index] ? index === 0 ? t('Today') : formatDate(daily.time[index], { weekday: 'short' }, language) : '—'}</span><WeatherIcon code={daily?.weather_code?.[index]} size={19}/><strong>{daily?.temperature_2m_max?.[index] ?? '—'}°</strong><small>{daily?.temperature_2m_min?.[index] ?? '—'}°</small><i style={{ height: `${Math.max(8, Math.round(((daily?.precipitation_probability_max?.[index] || 0) / 100) * 34))}px` }} title={`Rain chance ${daily?.precipitation_probability_max?.[index] || 0}%`}/></div>)}</div></section>
      <section className="insight-card"><div className="insight-mark"><Sprout size={18}/></div><div className="insight-copy"><div className="eyebrow">{t("A SMALL FIELD NOTE")}</div><h3>{t(nextRain >= 50 ? 'Rain may be on the way.' : 'Check before you irrigate.')}</h3><p>{t(weather ? nextRain >= 50 ? 'Rain is in the forecast tomorrow. Check soil moisture and drainage before deciding whether to irrigate.' : 'No significant rain is forecast tomorrow. Check soil moisture and crop stage before planning the next watering.' : 'Check your crop stage, soil moisture, and local forecast before planning irrigation.')}</p><button onClick={() => setPage('assistant')}>{t("Ask about irrigation")} <ArrowRight size={14}/></button></div><div className="insight-sun"><Sun size={52}/><span/></div></section>
      <section className="quick-actions-card"><div className="card-heading"><div><div className="eyebrow">{t("WHAT DO YOU NEED?")}</div><h2>{t("Start with a question")}</h2></div><div className="quick-spark">✳</div></div><div className="quick-grid"><button onClick={() => setPage('assistant')}><span className="quick-icon green"><MessageCircle size={17}/></span><span><strong>{t("Ask KhetiQ")}</strong><small>{t("Get a farm recommendation")}</small></span><ArrowRight size={15}/></button><button onClick={() => setPage('crop')}><span className="quick-icon yellow"><ImagePlus size={17}/></span><span><strong>{t("Check a crop photo")}</strong><small>{t("Explore visible plant symptoms")}</small></span><ArrowRight size={15}/></button><button onClick={() => setPage('schemes')}><span className="quick-icon lavender"><ShieldCheck size={17}/></span><span><strong>{t("Find a scheme")}</strong><small>{t("See official support links")}</small></span><ArrowRight size={15}/></button></div></section>
    </div><div className="source-footnote"><ShieldCheck size={15}/><span>{t("KhetiQ recommendations are decision support. Weather forecasts may change. Verify critical actions with your local KVK or agricultural extension officer.")}</span><button onClick={() => setPage('assistant')}>{t("How KhetiQ works")} <ArrowRight size={13}/></button></div>
  </section>
}

function ChatBubble({ message, profile, onSpeak, speaking, voiceEnabled, language }) {
  const t = (text) => translate(text, language)
  const isUser = message.role === 'user'
  return <div className={`chat-row ${isUser ? 'chat-row-user' : ''}`}>{!isUser && <div className="assistant-avatar small"><Sprout size={15}/></div>}<div className={`chat-bubble ${isUser ? 'chat-bubble-user' : ''} ${message.error ? 'chat-bubble-error' : ''}`}><div className="bubble-author">{isUser ? t('You') : 'KhetiQ'} <span>{isUser ? '' : <>· {t('AI farm companion')}</>}</span></div><p>{message.text}</p>{!isUser && !message.error && <button className="speak-answer" onClick={() => onSpeak(message.text)} disabled={speaking || !voiceEnabled}><Volume2 size={13}/>{speaking ? t('Playing…') : voiceEnabled ? t('Listen') : t('Voice unavailable')}</button>}{!isUser && message.tools?.length > 0 && <div className="used-tools">{message.tools.map((tool, index) => <span key={`${tool.name}-${index}`}><i className={tool.result?.available === false ? 'tool-offline' : ''}/>{t(tool.name === 'get_weather' ? 'Weather' : tool.name === 'get_mandi_prices' ? 'Mandi data' : tool.name)}</span>)}</div>}</div>{isUser && <div className="user-avatar">{profile.location.slice(0,1).toUpperCase()}</div>}</div>
}

function WeatherPage({ language, weather, error, profile, onRefresh }) {
  const t = (text) => translate(text, language)
  const daily = weather?.daily
  const maxTemp = Math.max(30, ...(daily?.temperature_2m_max || [30]))
  const chartPoints = daily?.temperature_2m_max?.slice(0, 7) || []
  const chartPath = chartPoints.map((value, index) => `${index * 600 / Math.max(1, chartPoints.length - 1)},${100 - (value / maxTemp) * 72}`).join(' ')
  return <section className="page-content module-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> {t("WEATHER INTELLIGENCE")}</div><h1>{t("Read the")} <em>{t("sky ahead.")}</em></h1><p>{t("Local forecasts to help plan the next field decision.")}</p></div><button className="button-secondary" onClick={onRefresh}><span className="refresh-icon">↻</span> {t("Refresh forecast")}</button></div><div className="weather-layout"><section className="weather-current panel"><div className="weather-current-top"><div><div className="card-kicker"><MapPin size={14}/> {t(profile.location)}, {t(profile.state)}</div><p>{weather?.current?.time ? new Date(weather.current.time).toLocaleString(localeForLanguage(language), { weekday: 'long', hour: 'numeric', minute: '2-digit' }) : t('Live local conditions')}</p></div><div className="big-weather-icon"><WeatherIcon code={weather?.current?.weather_code} size={46}/></div></div><div className="big-temp">{weather?.current?.temperature_2m ?? '—'}<span>°C</span></div><div className="conditions-name">{t(weather?.current?.weather_label || WEATHER_LABELS[weather?.current?.weather_code] || 'Weather unavailable')}</div><div className="current-stats"><div><Thermometer/><span>{t("Feels like")}</span><strong>{weather?.current?.apparent_temperature ?? '—'}°</strong></div><div><CloudRain/><span>{t("Rainfall now")}</span><strong>{weather?.current?.precipitation ?? '—'} mm</strong></div><div><Wind/><span>{t("Wind speed")}</span><strong>{weather?.current?.wind_speed_10m ?? '—'} km/h</strong></div><div><Activity/><span>{t("Humidity")}</span><strong>{weather?.current?.relative_humidity_2m ?? '—'}%</strong></div></div></section><section className="temperature-panel panel"><div className="panel-head"><div><div className="eyebrow">{t("TEMPERATURE OUTLOOK")}</div><h2>{t("Temperature & rain")}</h2></div><span className="source-pill"><i/> {t(weather?.source || 'Live forecast')}</span></div><div className="temperature-chart"><div className="chart-grid"><span>40°</span><span>30°</span><span>20°</span><span>10°</span></div><svg viewBox="0 0 600 100" preserveAspectRatio="none" aria-label={t("Seven day temperature chart")}><polyline points={chartPath} fill="none" stroke="#48865b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{chartPoints.map((value, index) => <circle key={index} cx={index * 600 / Math.max(1, chartPoints.length - 1)} cy={100 - (value / maxTemp) * 72} r="4" fill="#fff" stroke="#48865b" strokeWidth="3"/> )}</svg></div><div className="chart-days" style={{ gridTemplateColumns: `repeat(${daily?.time?.length || 7}, 1fr)` }}>{daily?.time?.slice(0, 7).map((date, index) => <div key={date}><span>{index === 0 ? t('Today') : formatDate(date, { weekday: 'short' }, language)}</span><strong>{daily.temperature_2m_max[index]}°</strong><small>{daily.temperature_2m_min[index]}°</small></div>)}</div></section><section className="forecast-table panel"><div className="panel-head"><div><div className="eyebrow">{t("DAILY DETAILS")}</div><h2>{t(`Next ${daily?.time?.length || 7} days`)}</h2></div><span className="card-kicker"><MapPin size={13}/> {t(profile.location)}</span></div><div className="forecast-list">{daily?.time?.map((date, index) => <div className="forecast-row" key={date}><strong>{index === 0 ? t('Today') : formatDate(date, { weekday: 'long' }, language)}</strong><span>{formatDate(date, undefined, language)}</span><WeatherIcon code={daily.weather_code[index]} size={19}/><span>{t(daily.weather_label?.[index] || WEATHER_LABELS[daily.weather_code[index]] || 'Variable')}</span><div className="temp-range"><i style={{ left: `${Math.max(0, ((daily.temperature_2m_min[index] + 5) / 50) * 100)}%`, width: `${Math.max(8, ((daily.temperature_2m_max[index] - daily.temperature_2m_min[index]) / 50) * 100)}%` }}/></div><b>{daily.temperature_2m_max[index]}° <small>{daily.temperature_2m_min[index]}°</small></b><span className="rain-chance"><CloudRain size={13}/> {daily.precipitation_probability_max[index] ?? 0}%</span></div>) || <div className="empty-state">{error || t('Loading forecast…')}</div>}</div><div className="weather-source"><span>{t("Forecast source:")} <strong>{weather?.source || 'Open-Meteo'}</strong>{weather?.retrievedAt ? ` · ${t('Retrieved')} ${new Date(weather.retrievedAt).toLocaleString(localeForLanguage(language), { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}` : ''}</span><a href={weather?.sourceUrl || 'https://open-meteo.com/'} target="_blank" rel="noreferrer">{t("About this data")} <ExternalLink size={12}/></a></div></section><div className="weather-advisory"><div><div className="advisory-icon"><CloudSun size={18}/></div><span><strong>{t("Farm decisions need local context")}</strong><small>{t("Forecasts can change. Combine weather with soil moisture and crop stage before making irrigation decisions.")}</small></span></div><span className="advisory-tag">{t("DECISION SUPPORT")}</span></div></div></section>
}

function MarketsPage({ language, commodity, setCommodity, state, setState, district, setDistrict, fallbackFromDistrict, data, loading, error, onSearch, integration }) {
  const t = (text) => translate(text, language)
  return <section className="page-content module-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> {t("MANDI PRICE INTELLIGENCE")}</div><h1>{t("Know your")} <em>{t("market options.")}</em></h1><p>{t("Compare reported wholesale prices. The arrival date is the market record date.")}</p></div><span className="source-pill"><i className={integration?.configured ? '' : 'offline-dot'}/>{integration?.configured ? t('API key added') : t('API key needed')}</span></div><div className="market-search-panel panel"><div className="market-search-title"><div className="market-search-icon"><BarChart3 size={19}/></div><div><h2>{t("Find mandi prices")}</h2><p>{t("Search official market records for a crop and location.")}</p></div></div><form className="market-filters" onSubmit={onSearch}><label>{t("Commodity")}<select value={commodity} onChange={(e) => setCommodity(e.target.value)}><option value="Wheat">{t("Wheat")}</option><option value="Rice">{t("Rice")}</option><option value="Mustard">{t("Mustard")}</option><option value="Cotton">{t("Cotton")}</option><option value="Maize">{t("Maize")}</option><option value="Onion">{t("Onion")}</option><option value="Soyabean">{t("Soyabean")}</option><option value="Potato">{t("Potato")}</option></select></label><label>{t("State")}<input value={state} onChange={(e) => setState(e.target.value)} placeholder={t('e.g. Rajasthan')}/></label><label>{t("District")} <span className="optional">{t("OPTIONAL")}</span><input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder={t('e.g. Jaipur')}/></label><button className="button-primary search-market" disabled={loading}>{loading ? <LoaderCircle className="spin" size={16}/> : <Search size={16}/>} {t('Search prices')}</button></form>{!integration?.configured && <div className="connect-banner"><div className="connect-banner-icon"><Settings2 size={17}/></div><div><strong>{t("One free API key unlocks real mandi records")}</strong><p>{t('Create a key at')} <a href="https://data.gov.in/user/register" target="_blank" rel="noreferrer">data.gov.in</a>{t(', then add it to')} <code>DATA_GOV_API_KEY</code> {t('in your server environment. No prices are shown until the request succeeds.')}</p></div><span className="tag tag-yellow">{t("SETUP NEEDED")}</span></div>}</div>{error && <div className="error-banner"><HelpCircle size={17}/>{error}</div>}{data?.available && <section className="market-results panel"><div className="results-heading"><div><div className="eyebrow">{data.records.length} {t('MARKET RECORDS')}</div><h2>{t(`${commodity} prices ${district ? 'in ' + district : state ? 'across ' + state : 'in India'}`)}</h2></div><span className="source-pill"><i/> {t('Retrieved')} {new Date(data.retrievedAt).toLocaleTimeString(localeForLanguage(language), { hour: '2-digit', minute: '2-digit' })}</span></div>{fallbackFromDistrict && <div className="market-scope-note"><MapPin size={14}/><span>{t(`No ${fallbackFromDistrict} records matched. The broader ${state} search returned ${data.records.length} matching ${commodity.toLowerCase()} records.`)}</span></div>}{data.records.length ? <div className="table-scroll"><table className="market-table"><thead><tr><th>{t("Market")}</th><th>{t("District")}</th><th>{t("Variety")}</th><th>{t("Min / quintal")}</th><th>{t("Max / quintal")}</th><th>{t("Modal / quintal")}</th><th>{t("Arrival date")}</th></tr></thead><tbody>{data.records.map((record, index) => <tr key={`${record.market}-${record.arrivalDate}-${index}`}><td><strong>{record.market || '—'}</strong><small>{record.state}</small></td><td>{record.district || '—'}</td><td>{record.variety || '—'}</td><td>{rupees(record.minPrice, language)}</td><td>{rupees(record.maxPrice, language)}</td><td><strong className="modal-price">{rupees(record.modalPrice, language)}</strong></td><td>{record.arrivalDate || '—'}</td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-mark"><Search size={20}/></div><strong>{t("No matching records came back")}</strong><span>{t("Try removing the district or searching another commodity.")}</span>{district && <button type="button" className="button-secondary market-broader-search" onClick={() => onSearch(undefined, { district: '', fallbackFromDistrict: district })} disabled={loading}>{loading ? t('Searching…') : <>{t(`Search across ${state || 'the state'}`)} <ArrowRight size={14}/></>}</button>}</div>}<div className="weather-source"><span>{t("Source:")} <strong>AGMARKNET via data.gov.in</strong>. {t('Prices in ₹ per quintal.')}</span><a href="https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi" target="_blank" rel="noreferrer">{t("Dataset details")} <ExternalLink size={12}/></a></div></section>}{!data && !error && <div className="market-empty panel"><div className="market-empty-illustration"><div><Wheat size={35}/></div><span/><i/></div><h2>{t("Your next market decision starts here.")}</h2><p>{t("Connect the official data source, then compare the latest available records by commodity and district.")}</p><button className="button-secondary" onClick={onSearch} disabled={loading}>{loading ? t('Loading…') : t('Search markets')} <ArrowRight size={15}/></button></div>}<div className="market-footnote"><ShieldCheck size={15}/><span>{t('Mandi prices are reported wholesale prices, not guaranteed sale prices. Confirm quality, transport, deductions, and current arrivals before selling.')}</span></div></section>
}

function formatInlineMarkdown(value) {
  return value.split(/(\*\*[\s\S]+?\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{formatInlineMarkdown(part.slice(2, -2))}</strong>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>
    return part
  })
}

function DiagnosisReport({ text }) {
  const blocks = []
  let listItems = []
  const flushList = () => {
    if (!listItems.length) return
    blocks.push(<ul className="diagnosis-list" key={`list-${blocks.length}`}>{listItems.map((item, index) => <li key={index}>{formatInlineMarkdown(item)}</li>)}</ul>)
    listItems = []
  }
  String(text).split('\n').forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line) { flushList(); return }
    const heading = line.match(/^#{1,4}\s+(.+)$/)
    const item = line.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/)
    if (item) { listItems.push(item[1]); return }
    flushList()
    if (heading) blocks.push(<h4 key={`heading-${blocks.length}`}>{formatInlineMarkdown(heading[1])}</h4>)
    else blocks.push(<p key={`paragraph-${blocks.length}`}>{formatInlineMarkdown(line)}</p>)
  })
  flushList()
  return <div className="diagnosis-result">{blocks}</div>
}

function CropPage({ language, geminiConnected, file, preview, crop, setCrop, notes, setNotes, diagnosis, error, loading, inputRef, onFile, onAnalyze, onClear }) {
  const t = (text) => translate(text, language)
  return <section className="page-content module-page crop-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> {t("CROP HEALTH")}</div><h1>{t("Take a closer")} <em>{t("look.")}</em></h1><p>{t("Share a photo for cautious AI-assisted symptom triage.")}</p></div><span className={`source-pill ${geminiConnected ? '' : 'source-offline'}`}><i/>{geminiConnected ? 'Gemini key added' : 'Gemini key needed'}</span></div><div className="crop-layout"><section className="crop-upload panel"><div className="crop-upload-head"><div><div className="eyebrow">{t("PHOTO CHECK")}</div><h2>{t("What’s happening on your crop?")}</h2><p>{t("For best results, photograph one affected leaf in natural light, close enough to see the details.")}</p></div><div className="crop-illustration"><Leaf size={48}/><span/></div></div><input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])}/>{!preview ? <button type="button" className="dropzone" onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]) }}><div className="dropzone-icon"><Upload size={21}/></div><strong>{t("Drop a crop photo here")}</strong><span>{t("or")} <b>{t("browse files")}</b> · JPG, PNG, WebP · up to 3.5 MB</span></button> : <div className="image-preview"><img src={preview} alt="Selected crop for symptom check"/><div className="preview-info"><div><Check size={15}/><span>{file?.name}</span></div><button onClick={() => inputRef.current?.click()}>{t("Change photo")}</button><button className="remove-preview" onClick={onClear} aria-label="Remove photo"><X size={15}/></button></div></div>}<form className="crop-details" onSubmit={onAnalyze}><div className="form-row"><label>{t("Crop type")} <span className="optional">{t("IF KNOWN")}</span><select value={crop} onChange={(e) => setCrop(e.target.value)}><option value="">{t("Not sure yet")}</option><option value="Wheat">{t("Wheat")}</option><option value="Rice">{t("Rice")}</option><option value="Mustard">{t("Mustard")}</option><option value="Cotton">{t("Cotton")}</option><option value="Maize">{t("Maize")}</option><option value="Tomato">{t("Tomato")}</option><option value="Other">{t("Other")}</option></select></label><label>{t("What are you noticing?")} <span className="optional">{t("OPTIONAL")}</span><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('e.g. yellow edges, small brown spots')}/></label></div>{error && <div className="error-banner"><HelpCircle size={16}/>{error}</div>}<button className="button-primary diagnose-button" disabled={!file || loading}>{loading ? <><LoaderCircle className="spin" size={16}/> {t("Looking closely…")}</> : <><Activity size={16}/> {t("Check for symptoms")}</>}</button></form><div className="crop-consent"><ShieldCheck size={14}/><span>{t("Your photo is sent to Gemini for analysis when you submit. Free-tier API data may be used by Google to improve its products. Avoid photos with people or personal details.")}</span></div></section><aside className="crop-aside"><div className="diagnosis-card panel"><div className="diagnosis-head"><div className="diagnosis-symbol"><Leaf size={20}/></div><div><div className="eyebrow">{t("POSSIBLE SIGNS")}</div><h3>{t("Careful, clear guidance")}</h3></div></div>{diagnosis ? <><DiagnosisReport text={diagnosis}/><div className="diagnosis-disclaimer"><ShieldCheck size={14}/> {t("AI-assisted triage only. Check with an agricultural expert before acting.")}</div></> : <div className="diagnosis-empty"><div className="empty-leaf"><Sprout size={27}/></div><p>{t("Upload a clear photo and KhetiQ will describe visible signs, possible causes, and safe next steps.")}</p><span>{t("No image diagnosis has been made yet.")}</span></div>}</div><div className="safe-note"><div className="safe-note-icon"><ShieldCheck size={17}/></div><div><strong>{t("Safety comes first")}</strong><p>{t("A photo cannot confirm a disease. Avoid chemical treatment until symptoms are checked by a trusted local expert.")}</p><a href="https://kvk.icar.gov.in/" target="_blank" rel="noreferrer">{t("Find a Krishi Vigyan Kendra")} <ExternalLink size={12}/></a></div></div></aside></div></section>
}

function SchemesPage({ language, search, setSearch, filter, setFilter, schemes }) {
  const t = (text) => translate(text, language)
  const categories = ['All schemes', ...new Set(schemeCards.map((scheme) => scheme.category))]
  return <section className="page-content module-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> {t("SCHEMES & SUPPORT")}</div><h1>{t("Support that")} <em>{t("reaches your farm.")}</em></h1><p>{t("Explore official starting points. Always confirm current eligibility with the scheme authority.")}</p></div><a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer" className="button-secondary">{t("Open myScheme")} <ExternalLink size={14}/></a></div><div className="scheme-search panel"><div className="scheme-search-title"><div className="scheme-search-icon"><ShieldCheck size={20}/></div><div><h2>{t("What kind of support are you looking for?")}</h2><p>{t("Browse by need, then follow the official link to check details.")}</p></div></div><div className="scheme-controls"><label className="scheme-search-input"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search schemes or support')}/></label><label className="filter-select"><Filter size={15}/><select value={filter} onChange={(e) => setFilter(e.target.value)}>{categories.map((category) => <option key={category} value={category}>{t(category)}</option>)}</select><ChevronDown size={14}/></label></div></div><div className="scheme-notice"><ShieldCheck size={16}/><span><strong>{t("Information changes.")}</strong> {t("KhetiQ links you to official portals. Verify eligibility, benefits, deadlines, and application status directly before applying.")}</span></div><div className="scheme-grid">{schemes.map((scheme) => <article className="scheme-card panel" key={scheme.title}><div className="scheme-card-top"><div className={`scheme-card-icon scheme-tone-${scheme.category.split(' ')[0].toLowerCase()}`}><ShieldCheck size={20}/></div><span className="official-tag"><i/> {t("OFFICIAL SOURCE")}</span></div><div className="scheme-category">{t(scheme.category).toUpperCase()}</div><h3>{t(scheme.title)}</h3><p>{t(scheme.body)}</p><div className="scheme-tags">{scheme.tags.map((tag) => <span key={tag}>{t(tag)}</span>)}</div><a href={scheme.url} target="_blank" rel="noreferrer">{t("Check official details")} <ExternalLink size={14}/></a></article>)}</div><div className="scheme-footer-card"><div className="scheme-footer-mark"><Compass size={22}/></div><div><strong>{t("Looking for a state-specific benefit?")}</strong><p>{t("myScheme lets you explore central and state/UT schemes using your basic profile.")}</p></div><a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer" className="button-primary">{t("Find schemes")} <ArrowRight size={15}/></a></div></section>
}


function CropPlannerPage({ language, profile, reminders, onAdd, onToggle, onDelete }) {
  const t = (text) => translate(text, language)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const activeCount = reminders.filter((item) => !item.done).length
  const ordered = [...reminders].sort((a, b) => Number(a.done) - Number(b.done) || a.date.localeCompare(b.date))

  function submitReminder(event) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle || !date) return
    onAdd({ title: cleanTitle, date, note: note.trim() })
    setTitle(''); setDate(''); setNote('')
  }

  return <section className="page-content module-page planner-page">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> {t('YOUR FARM PLAN')}</div><h1>{t('Plan farm tasks')}</h1><p>{t('Keep important dates and farm tasks in one place.')}</p></div><span className="source-pill"><i/>{t('Saved on this device')}</span></div>
    <div className="planner-layout">
      <div className="planner-main">
        <form className="planner-form panel" onSubmit={submitReminder}>
          <div className="planner-form-heading"><span className="planner-form-icon"><CalendarDays size={19}/></span><div><h2>{t('Add a reminder')}</h2><p>{t('This planner stores your own reminders in this browser. It does not send push notifications or prescribe farm treatments.')}</p></div></div>
          <div className="planner-fields"><label>{t('Task name')}<input required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('e.g. Check field irrigation')}/></label><label>{t('Due date')}<input required type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)}/></label><label className="planner-note-field">{t('Notes (optional)')}<input maxLength={240} value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('Add a note')}/></label></div>
          <button className="button-primary planner-submit" type="submit"><Plus size={15}/>{t('Add to my plan')}</button>
        </form>
        <section className="planner-reminders panel"><div className="planner-list-heading"><div><div className="eyebrow">{t('YOUR FARM PLAN')}</div><h2>{t('Your reminders')}</h2></div><span className="planner-count">{activeCount} {t('Active')}</span></div>
          {ordered.length ? <div className="reminder-list">{ordered.map((item) => {
            const status = item.done ? 'Completed' : item.date < today ? 'Overdue' : item.date === today ? 'Due today' : 'Upcoming'
            return <article className={`reminder-item ${item.done ? 'reminder-done' : ''}`} key={item.id}>
              <button type="button" className="reminder-check" aria-label={t(item.done ? 'Mark as not complete' : 'Mark complete')} aria-pressed={Boolean(item.done)} onClick={() => onToggle(item.id)}>{item.done && <Check size={14}/>}</button>
              <div className="reminder-copy"><div className="reminder-title-row"><strong>{item.title}</strong><span className={`reminder-status reminder-${status.toLowerCase().replaceAll(' ', '-')}`}>{t(status)}</span></div>{item.note && <p>{item.note}</p>}<small><CalendarDays size={12}/>{formatDate(`${item.date}T00:00:00`, { weekday: 'short', day: 'numeric', month: 'short' }, language)}</small></div>
              <button type="button" className="reminder-delete" aria-label={t('Delete reminder')} onClick={() => onDelete(item.id)}><Trash2 size={15}/></button>
            </article>
          })}</div> : <div className="planner-empty"><span><CalendarDays size={22}/></span><strong>{t('No reminders yet')}</strong><p>{t('Add a farm task and choose when you want to do it.')}</p></div>}
        </section>
      </div>
      <aside className="planner-aside"><div className="planner-context panel"><div className="eyebrow">{t('Farm context')}</div><div className="planner-farm-location"><MapPin size={16}/><div><strong>{t(profile.location)}, {t(profile.state)}</strong><small>{t('Farm location')}</small></div></div><div className="planner-context-line"><span>{t('Current crop')}</span><strong>{t(profile.crop)}</strong></div><div className="planner-context-line"><span>{t('Crop stage')}</span><strong>{t(profile.cropStage || 'Growing')}</strong></div><div className="planner-context-line"><span>{t('Completed reminders')}</span><strong>{reminders.filter((item) => item.done).length}</strong></div></div><div className="planner-tip"><ShieldCheck size={16}/><p>{t('Use this planner for your own dates and tasks. Check local conditions and trusted agricultural guidance before acting.')}</p></div></aside>
    </div>
  </section>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
