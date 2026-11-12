// Weather Dashboard — original code by Clamor.
// Open-Meteo (free, no API key). Falls back to built-in sample data + cached
// last-good fetch when offline. No Chart.js dependency: charts are drawn on canvas.
const CITIES = [
  {name:"Noida",country:"India",lat:28.5355,lon:77.3910},{name:"New Delhi",country:"India",lat:28.6139,lon:77.2090},
  {name:"Mumbai",country:"India",lat:19.0760,lon:72.8777},{name:"Bengaluru",country:"India",lat:12.9716,lon:77.5946},
  {name:"Kolkata",country:"India",lat:22.5726,lon:88.3639},{name:"Chennai",country:"India",lat:13.0827,lon:80.2707},
  {name:"Hyderabad",country:"India",lat:17.3850,lon:78.4867},{name:"Pune",country:"India",lat:18.5204,lon:73.8567},
  {name:"Jaipur",country:"India",lat:26.9124,lon:75.7873},{name:"Lucknow",country:"India",lat:26.8467,lon:80.9462},
  {name:"London",country:"United Kingdom",lat:51.5074,lon:-0.1278},{name:"New York",country:"USA",lat:40.7128,lon:-74.0060},
  {name:"Tokyo",country:"Japan",lat:35.6762,lon:139.6503},{name:"Sydney",country:"Australia",lat:-33.8688,lon:151.2093},
  {name:"Paris",country:"France",lat:48.8566,lon:2.3522},{name:"Dubai",country:"UAE",lat:25.2048,lon:55.2708},
  {name:"Singapore",country:"Singapore",lat:1.3521,lon:103.8198},{name:"Toronto",country:"Canada",lat:43.6532,lon:-79.3832}
];
const WMO = {0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Foggy",48:"Rime fog",51:"Light drizzle",53:"Drizzle",55:"Dense drizzle",61:"Slight rain",63:"Rain",65:"Heavy rain",66:"Freezing rain",67:"Freezing rain",71:"Light snow",73:"Snow",75:"Heavy snow",77:"Snow grains",80:"Light showers",81:"Showers",82:"Violent showers",85:"Snow showers",86:"Heavy snow showers",95:"Thunderstorm",96:"Thunderstorm with hail",99:"Thunderstorm with hail"};
function themeFor(code){ if([95,96,99].includes(code))return "storm"; if([71,73,75,77,85,86].includes(code))return "snowy"; if([51,53,55,61,63,65,66,67,80,81,82].includes(code))return "rainy"; if([1,2].includes(code))return "cloudy"; if(code===3||code===45||code===48)return "cloudy"; return "sunny"; }
// Built-in sample data (Noida, plausible values) used when offline and nothing is cached.
function sampleData(city){ const base=Date.now(); const hours=[],temps=[],feels=[],prec=[];
  for(let i=0;i<24;i++){ const d=new Date(base+i*3600e3); hours.push(d.toISOString().slice(0,13)+":00"); const t=Math.round(24+6*Math.sin((i-9)/24*2*Math.PI)); temps.push(t); feels.push(t+(t>28?2:-1)); prec.push(i===15?0.4:0); }
  return {city, current:{temperature_2m:29,relative_humidity_2m:58,apparent_temperature:31,precipitation:0,wind_speed_10m:11,wind_direction_10m:140,cloud_cover:20,weather_code:1,time:new Date().toISOString()},
    hourly:{time:hours,temperature_2m:temps,apparent_temperature:feels,precipitation_probability:Array(24).fill(10)},
    daily:{time:[0,1,2,3,4].map(d=>new Date(base+d*86400e3).toISOString().slice(0,10)),temperature_2m_max:[34,35,33,32,34],temperature_2m_min:[24,25,24,23,24],precipitation_probability_max:[10,20,30,10,5],weather_code:[1,2,61,1,0]}, sample:true}; }
const $=id=>document.getElementById(id);
const statusEl=$("status"), input=$("cityInput"), sugg=$("suggestions");
function saveRecent(city){ try{ let r=JSON.parse(localStorage.getItem("wd-recent")||"[]"); r=[city,...r.filter(x=>x!==city)].slice(0,6); localStorage.setItem("wd-recent",JSON.stringify(r)); renderRecent(); }catch(e){} }
function renderRecent(){ const r=JSON.parse(localStorage.getItem("wd-recent")||"[]"); $("recent").innerHTML=r.length?r.map(c=>`<button type="button" data-city="${c}">${c}</button>`).join(""):"<span class='muted'>No searches yet — try Noida.</span>";
  document.querySelectorAll("#recent button").forEach(b=>b.onclick=()=>loadCity(b.dataset.city)); }
function drawLineChart(canvas, series, labels){ const ctx=canvas.getContext("2d"); const W=canvas.width,H=canvas.height; ctx.clearRect(0,0,W,H);
  const all=series.flatMap(s=>s.data); const min=Math.min(...all)-2,max=Math.max(...all)+2; const padL=44,padB=26,padT=14;
  ctx.strokeStyle="#dbe7f0"; ctx.fillStyle="#5b7288"; ctx.font="12px system-ui";
  for(let g=0;g<=4;g++){ const y=padT+(H-padT-padB)*g/4; ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-10,y); ctx.stroke(); ctx.fillText(String(Math.round(max-(max-min)*g/4))+"°",6,y+4); }
  series.forEach(s=>{ ctx.strokeStyle=s.color; ctx.lineWidth=2.5; ctx.beginPath();
    s.data.forEach((v,i)=>{ const x=padL+(W-padL-16)*i/(s.data.length-1); const y=padT+(H-padT-padB)*(1-(v-min)/(max-min)); i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.stroke(); }); }
function drawBarChart(canvas, maxs, mins, labels){ const ctx=canvas.getContext("2d"); const W=canvas.width,H=canvas.height; ctx.clearRect(0,0,W,H);
  const lo=Math.min(...mins)-2,hi=Math.max(...maxs)+2; const bw=(W-80)/maxs.length;
  maxs.forEach((mx,i)=>{ const x=50+i*bw; const h1=(H-50)*(mx-lo)/(hi-lo), h0=(H-50)*(mins[i]-lo)/(hi-lo);
    ctx.fillStyle="#f59e0b"; ctx.fillRect(x+8,H-30-h1,bw/2-12,h1);
    ctx.fillStyle="#0284c7"; ctx.fillRect(x+bw/2,H-30-h0,bw/2-12,h0);
    ctx.fillStyle="#10233a"; ctx.font="12px system-ui"; ctx.fillText(labels[i],x+6,18); ctx.fillText(mx+"° / "+mins[i]+"°",x+4,H-12); }); }
function render(data){ const c=data.current, d=data.daily;
  $("cityName").textContent=data.city; $("condition").textContent=WMO[c.weather_code]||"—";
  $("temp").textContent=Math.round(c.temperature_2m); $("feelsLike").textContent=Math.round(c.apparent_temperature)+"°C";
  const diff=Math.round(c.apparent_temperature-c.temperature_2m);
  $("feelsNote").textContent=diff>0?`Feels ${diff}° warmer than it is`:(diff<0?`Feels ${-diff}° cooler than it is`:"Feels the same as it is");
  $("humidity").textContent=(c.relative_humidity_2m??"—")+"%"; $("wind").textContent=Math.round(c.wind_speed_10m)+" km/h";
  $("precip").textContent=(c.precipitation??0)+" mm"; $("cloud").textContent=(c.cloud_cover??"—")+"%";
  $("windDir").textContent=Math.round(c.wind_direction_10m)+"°"; $("updated").textContent=new Date(c.time).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  document.body.dataset.weather=themeFor(c.weather_code);
  const h=data.hourly, n=24;
  drawLineChart($("hourlyChart"),[{data:h.temperature_2m.slice(0,n),color:"#0284c7"},{data:h.apparent_temperature.slice(0,n),color:"#f59e0b"}],h.time);
  $("hourlyStrip").innerHTML=h.time.slice(0,n).map((t,i)=>`<div><strong>${new Date(t).getHours()}:00</strong><br>${Math.round(h.temperature_2m[i])}°<br>💧 ${h.precipitation_probability?h.precipitation_probability[i]+"%":"—"}</div>`).join("");
  const dayLabels=d.time.map(t=>new Date(t).toLocaleDateString([],{weekday:"short"}));
  drawBarChart($("dailyChart"),d.temperature_2m_max,d.temperature_2m_min,dayLabels);
  $("dailyGrid").innerHTML=d.time.map((t,i)=>`<article><strong>${new Date(t).toLocaleDateString([],{weekday:"long",day:"numeric",month:"short"})}</strong><p>${WMO[d.weather_code[i]]||""}</p><p class="t">${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°</p><p>🌧️ ${d.precipitation_probability_max[i]}% chance</p></article>`).join("");
  statusEl.textContent=data.sample?"Offline sample data — connect to the internet for live Open-Meteo data.":(data.cached?"Showing the last cached forecast (offline).":"Live data from Open-Meteo · "+data.city);
}
async function fetchWeather(cityObj){ const url=`https://api.open-meteo.com/v1/forecast?latitude=${cityObj.lat}&longitude=${cityObj.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`;
  const res=await fetch(url); if(!res.ok) throw new Error("HTTP "+res.status); const j=await res.json(); return {city:cityObj.name,...j}; }
async function loadCity(name){ const city=CITIES.find(c=>c.name.toLowerCase()===name.toLowerCase())||{name,lat:28.5355,lon:77.3910};
  statusEl.textContent="Loading weather for "+city.name+"…"; input.value=city.name; sugg.hidden=true;
  try{ const data=await fetchWeather(city); try{localStorage.setItem("wd-cache",JSON.stringify(data));}catch(e){} saveRecent(city.name); render(data); }
  catch(e){ let cached=null; try{cached=JSON.parse(localStorage.getItem("wd-cache")||"null");}catch(_){}
    if(cached){ cached.cached=true; render(cached); } else { render(sampleData(city.name)); saveRecent(city.name); } } }
function showSuggestions(q){ const m=CITIES.filter(c=>(c.name+", "+c.country).toLowerCase().includes(q.toLowerCase())).slice(0,6);
  if(!q||!m.length){sugg.hidden=true;return;} sugg.innerHTML=m.map(c=>`<li data-name="${c.name}">${c.name}, ${c.country}</li>`).join(""); sugg.hidden=false;
  sugg.querySelectorAll("li").forEach(li=>li.onclick=()=>loadCity(li.dataset.name)); }
input.addEventListener("input",()=>showSuggestions(input.value.trim()));
input.addEventListener("keydown",e=>{ if(e.key==="Enter") loadCity(input.value.trim()||"Noida"); });
$("searchBtn").onclick=()=>loadCity(input.value.trim()||"Noida");
$("locateBtn").onclick=()=>{ if(!navigator.geolocation){ statusEl.textContent="Geolocation is not available — showing Noida."; return loadCity("Noida"); }
  statusEl.textContent="Detecting your location…";
  navigator.geolocation.getCurrentPosition(async pos=>{ try{ const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`); const j=await r.json(); const name=j.city||j.locality||"Your location"; const data=await fetchWeather({name,lat:pos.coords.latitude,lon:pos.coords.longitude}); try{localStorage.setItem("wd-cache",JSON.stringify(data));}catch(e){} render(data); }catch(e){ loadCity("Noida"); } },
  ()=>{ statusEl.textContent="Location permission denied — showing Noida (fallback city)."; loadCity("Noida"); },{timeout:8000}); };
renderRecent(); loadCity("Noida");
