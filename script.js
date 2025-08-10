// Offline weather data (sample). Add more cities as you like.
const CITY_DATA = {
  "karachi": { country: "PK", temp: 33, cond: "Clear", desc: "sunny", humidity: 55, wind: 10, clouds: 5 },
  "lahore":  { country: "PK", temp: 35, cond: "Clear", desc: "hot", humidity: 40, wind: 12, clouds: 8 },
  "islamabad": { country: "PK", temp: 28, cond: "Clouds", desc: "partly cloudy", humidity: 60, wind: 8, clouds: 45 },
  "peshawar": { country: "PK", temp: 34, cond: "Clear", desc: "sunny", humidity: 30, wind: 14, clouds: 2 },
  "quetta": { country: "PK", temp: 22, cond: "Clouds", desc: "cloudy", humidity: 50, wind: 9, clouds: 60 },
  "multan": { country: "PK", temp: 36, cond: "Clear", desc: "hot", humidity: 28, wind: 11, clouds: 3 },
  "hyderabad": { country: "PK", temp: 30, cond: "Clouds", desc: "hazy", humidity: 65, wind: 13, clouds: 30 },
  "sukkhar": { country: "IN", temp: 31, cond: "Rain", desc: "light rain", humidity: 78, wind: 9, clouds: 85 },
  "kashmir": { country: "IN", temp: 34, cond: "Clear", desc: "hot", humidity: 35, wind: 10, clouds: 5 },
  "tando adam": { country: "ID", temp: 29, cond: "Clouds", desc: "overcast", humidity: 70, wind: 12, clouds: 75 },
  "rawalpindi": { country: "GB", temp: 18, cond: "Clouds", desc: "cloudy", humidity: 80, wind: 15, clouds: 60 },
  "sanghar": { country: "US", temp: 23, cond: "Rain", desc: "shower", humidity: 70, wind: 20, clouds: 90 },
  "miyanwali": { country: "AU", temp: 16, cond: "Clear", desc: "sunny", humidity: 55, wind: 18, clouds: 10 }
};

// Elements
const elems = {
  cityInput: document.getElementById('cityInput'),
  searchBtn: document.getElementById('searchBtn'),
  cityName: document.getElementById('cityName'),
  countryName: document.getElementById('countryName'),
  dayName: document.getElementById('dayName'),
  fullDate: document.getElementById('fullDate'),
  temp: document.getElementById('temp'),
  condition: document.getElementById('condition'),
  iconWrap: document.getElementById('iconWrap'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  clouds: document.getElementById('clouds'),
  weatherCard: document.getElementById('weatherCard'),
  cloudsArea: document.querySelector('.clouds')
};

// date helper
function updateDateTime() {
  const now = new Date();
  const day = now.toLocaleDateString(undefined, { weekday: 'short' }); // e.g. "Sun"
  const full = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  elems.dayName.textContent = day;
  elems.fullDate.textContent = full;
}

// choose icon (emoji) based on condition & clouds%
function pickIcon(cond, cloudsPercent) {
  cond = (cond || "").toLowerCase();
  if (cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle')) return '🌧️';
  if (cond.includes('snow')) return '❄️';
  if (cond.includes('storm') || cond.includes('thunder')) return '⛈️';
  if (cond.includes('clear') || cond.includes('sun')) {
    if (cloudsPercent > 30) return '🌤️';
    return '☀️';
  }
  if (cond.includes('cloud')) {
    if (cloudsPercent > 70) return '☁️';
    return '🌥️';
  }
  // fallback
  return cloudsPercent > 60 ? '☁️' : '🌤️';
}

// simulate a tiny randomness so it feels "live"
function randomizeBase(value, variance = 2) {
  const sign = Math.random() < 0.5 ? -1 : 1;
  const delta = Math.round(Math.random() * variance);
  return value + sign * delta;
}

// render city data (from offline dataset)
function renderOffline(cityKey, raw) {
  const name = cityKey.split(' ').map(w => w[0].toUpperCase()+w.slice(1)).join(' ');
  const country = raw.country || '';
  const temp = randomizeBase(raw.temp, 2);
  const humidity = randomizeBase(raw.humidity, 4);
  const wind = randomizeBase(raw.wind, 3);
  const cloudsPct = raw.clouds;
  const cond = raw.cond;
  const desc = raw.desc;

  elems.cityName.textContent = name;
  elems.countryName.textContent = country;
  elems.temp.textContent = `${temp}°C`;
  elems.condition.textContent = `${cond} • ${desc}`;
  elems.humidity.textContent = `${humidity}%`;
  elems.wind.textContent = `${wind} km/h`;
  elems.clouds.textContent = `${cloudsPct}%`;

  elems.iconWrap.textContent = pickIcon(cond, cloudsPct);

  // cloud animation intensity visual
  const opacity = cloudsPct > 70 ? 0.95 : (cloudsPct > 40 ? 0.7 : 0.35);
  if (elems.cloudsArea) elems.cloudsArea.style.opacity = opacity;

  elems.weatherCard.setAttribute('aria-label', `Weather in ${name}: ${temp} degrees, ${desc}`);
}

// try to find city in dataset (exact first, then substring)
function findCity(query) {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  if (CITY_DATA[q]) return { key: q, data: CITY_DATA[q] };

  // try exact by removing non letters
  const cleaned = q.replace(/[^a-z0-9 ]/g, '');
  if (CITY_DATA[cleaned]) return { key: cleaned, data: CITY_DATA[cleaned] };

  // substring search
  for (const k of Object.keys(CITY_DATA)) {
    if (k.includes(q) || q.includes(k)) return { key: k, data: CITY_DATA[k] };
  }

  // fuzzy: match first word
  const qFirst = q.split(' ')[0];
  for (const k of Object.keys(CITY_DATA)) {
    if (k.split(' ')[0] === qFirst) return { key: k, data: CITY_DATA[k] };
  }

  return null;
}

// fallback: if no city found, pick nearest default or random sample
function fallbackCity() {
  // prefer Karachi if available
  if (CITY_DATA['karachi']) return { key: 'karachi', data: CITY_DATA['karachi'] };
  const keys = Object.keys(CITY_DATA);
  const pick = keys[Math.floor(Math.random() * keys.length)];
  return { key: pick, data: CITY_DATA[pick] };
}

// UI handlers
function doSearch(query) {
  const found = findCity(query);
  if (found) {
    renderOffline(found.key, found.data);
  } else {
    // inform user gracefully and show fallback
    alert('City not in offline list. Showing a nearby example. (You can add more cities in script.js)');
    const fb = fallbackCity();
    renderOffline(fb.key, fb.data);
  }
}

// init
function init() {
  updateDateTime();
  setInterval(updateDateTime, 60_000);

  // default city load
  renderOffline('karachi', CITY_DATA['karachi']);

  document.getElementById('searchBtn').addEventListener('click', () => {
    doSearch(elems.cityInput.value);
  });

  elems.cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch(elems.cityInput.value);
  });
}

document.addEventListener('DOMContentLoaded', init);
