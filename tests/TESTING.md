# Testing

## Automated
Run: `python3 tests/test_html.py` — checks the main HTML file exists, references `styles.css` and `app.js`, and contains the required element IDs and the Open-Meteo / fallback logic.

## Manual checklist
- [ ] Open `src/index.html` — Noida loads with a temperature, humidity, wind and a 5-day grid.
- [ ] Type "lon" in search — London appears in autocomplete; selecting it loads London.
- [ ] Click "My location" and deny permission — the page falls back to Noida with a message.
- [ ] Turn off the network and reload — the cached forecast (or sample data on first run) still shows, with an offline notice.
- [ ] Resize to phone width — stats stack 2-across, search wraps, nothing overflows horizontally.
- [ ] Feels-like line differs from the actual line on the hourly chart; the 5-day bars show max/min.
