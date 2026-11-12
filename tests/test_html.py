"""Automated checks for the Weather Dashboard. Run: python3 tests/test_html.py"""
import pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "src" / "index.html").read_text()
js = (root / "src" / "app.js").read_text()
checks = [
    ("references styles.css", "styles.css" in html),
    ("references app.js", "app.js" in html),
    ("has city search input", 'id="cityInput"' in html),
    ("has hourly chart canvas", 'id="hourlyChart"' in html),
    ("has daily chart canvas", 'id="dailyChart"' in html),
    ("has recent searches area", 'id="recent"' in html),
    ("JS calls Open-Meteo", "api.open-meteo.com" in js),
    ("JS has sample-data fallback", "sampleData" in js and "sample:true" in js),
    ("JS caches last fetch", "wd-cache" in js),
    ("JS handles feels-like", "apparent_temperature" in js),
    ("README exists", (root / "README.md").exists()),
]
failed = [name for name, ok in checks if not ok]
for name, ok in checks: print(("PASS " if ok else "FAIL ") + name)
if failed: print(f"{len(failed)} check(s) failed"); sys.exit(1)
print("All checks passed.")
