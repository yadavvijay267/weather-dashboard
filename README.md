# Weather Dashboard

A dashboard that shows current weather, an hourly forecast, and a 5-day outlook for any city — with charts, a weather-based theme, and graceful offline behaviour.

## Features
- City search with autocomplete (18 built-in cities) and recent-search history.
- Current temperature, humidity, wind, precipitation, cloud cover and wind direction.
- Hourly chart: actual vs feels-like temperature for the next 24 hours.
- 5-day forecast chart (max/min bars) plus a day-by-day grid.
- Automatic location detection via the Geolocation API, with Noida as the sensible fallback.
- Weather-based theme: sunny, cloudy, rainy, snowy and storm accents.
- Offline caching: the last successful fetch is saved and shown when the network fails; built-in sample data covers a first run with no connection.

## Tech stack
HTML, CSS, vanilla JavaScript, Open-Meteo API (free, no key), Geolocation API. Charts are drawn on canvas — no chart library is bundled, so the page works fully offline.

## How to run
Open `src/index.html` in any modern browser. No build step, no server, no API key.
Or serve it locally: `python3 -m http.server --directory src 8000` then visit `http://localhost:8000`.

## Screenshots
See `screenshots/SCREENSHOTS.md` — add `dashboard.png`, `forecast.png` and `mobile.png` there after running the app.

## Tests
`python3 tests/test_html.py` — automated HTML/JS checks. Manual checklist in `tests/TESTING.md`.

## License
MIT — see `LICENSE`. Built by Clamor.
