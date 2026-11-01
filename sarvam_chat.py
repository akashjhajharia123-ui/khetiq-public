from pathlib import Path
import os

from sarvamai import SarvamAI

# Load SARVAM_API_KEY from this project's .env without an extra dependency.
for line in Path(__file__).with_name(".env").read_text().splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        name, value = line.split("=", 1)
        if name.strip() == "SARVAM_API_KEY" and value.strip():
            os.environ.setdefault(name.strip(), value.strip().strip("\"'"))

api_key = os.environ.get("SARVAM_API_KEY")
if not api_key:
    raise SystemExit("Add your Sarvam key to SARVAM_API_KEY in .env, then run again.")

client = SarvamAI(api_subscription_key=api_key)
response = client.chat.completions(
    model="sarvam-105b-conversations",
    messages=[{"role": "user", "content": "नमस्ते! किसान को खेती के लिए एक उपयोगी सलाह हिंदी में दें।"}],
)
print(response.choices[0].message.content)
