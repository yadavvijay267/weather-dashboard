# Architecture

## Flow
`index.html` (layout) -> `styles.css` (theme, incl. weather-based accent) -> `app.js` (all logic).

## Data
- Live: Open-Meteo forecast API, free with no key. Geocoding is done locally against a built-in list of 18 cities, so no second API call is needed for search/autocomplete.
- Geolocation: the browser Geolocation API, reverse-geocoded with BigDataCloud's free client endpoint. Denied/unavailable -> Noida fallback.
- Offline: the last successful response is saved to `localStorage` (`wd-cache`). On a failed fetch the cached response renders with a "cached" banner. If there is no cache at all, built-in sample data for the requested city renders instead.

## Charts
No chart library is bundled, so the page works fully offline. Both charts are drawn on `<canvas>` in `app.js`:
- Hourly line chart: actual vs feels-like temperature for the next 24 hours.
- Daily bar chart: max (amber) vs min (blue) temperature for 5 days.

## Theme
`document.body.dataset.weather` is set from the WMO weather code (sunny / cloudy / rainy / snowy / storm) and CSS variables change the accent colour.

## State
- `wd-recent`: last 6 searched cities. `wd-cache`: last successful API response.
