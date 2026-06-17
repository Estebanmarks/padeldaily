const cardsRoot = document.getElementById("cards");
const topTags = document.getElementById("topTags");
const subtitle = document.getElementById("subtitle");
const bottomCopy = document.getElementById("bottomCopy");
const connectorOne = document.getElementById("connectorOne");
const connectorTwo = document.getElementById("connectorTwo");
const dayWeek = document.getElementById("dayWeek");
const dayNumber = document.getElementById("dayNumber");
const dayMonth = document.getElementById("dayMonth");
const dayYear = document.getElementById("dayYear");
const cycleLabel = document.getElementById("cycleLabel");
const cardTemplate = document.getElementById("cardTemplate");
const langEsBtn = document.getElementById("langEs");
const langEnBtn = document.getElementById("langEn");
const whatsappShare = document.getElementById("whatsappShare");
const shareLabel = document.getElementById("shareLabel");

const siteUrl = "https://dailypadel.net";

const langStorageKey = "padelDailyLang";
let currentLang = "es";

const uiCopy = {
  es: {
    locale: "es-ES",
    connector: "de",
    topTags: "FOCO • PLAN • MEJORA",
    subtitle: "Tu microlección diaria de Cuerpo, Mente y Táctica",
    category: { cuerpo: "Cuerpo", mente: "Mente", tactica: "Táctica" },
    exerciseLabel: "Ejercicio",
    shareLabel: "Compartir",
    shareAria: "Compartir en WhatsApp",
    shareIntro: "Daily Padel - microlección de hoy",
    cycle: (day, total) => `Día ${day} de ${total}`,
    bottom: "Cada día mejor, en la pista y en la vida."
  },
  en: {
    locale: "en-GB",
    connector: "of",
    topTags: "FOCUS • PLAN • IMPROVE",
    subtitle: "Your daily micro-lesson for Body, Mind and Tactics",
    category: { cuerpo: "Body", mente: "Mind", tactica: "Tactics" },
    exerciseLabel: "Exercise",
    shareLabel: "Share",
    shareAria: "Share on WhatsApp",
    shareIntro: "Daily Padel - today's micro-lesson",
    cycle: (day, total) => `Day ${day} of ${total}`,
    bottom: "Better every day, on court and in life."
  }
};

function getCurrentData() {
  if (currentLang === "en") return window.DAILY_MESSAGES_BY_DAY_EN;
  return window.DAILY_MESSAGES_BY_DAY;
}

function getDateParts(date, locale) {
  const raw = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
  const parts = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  return {
    weekday: (map.weekday || "").toUpperCase(),
    day: map.day || String(date.getDate()),
    month: (map.month || "").toUpperCase(),
    year: map.year || String(date.getFullYear()),
    raw
  };
}

function getDayIndex(totalDays, date) {
  const dayMs = 24 * 60 * 60 * 1000;
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceEpoch = Math.floor(localMidnight.getTime() / dayMs);
  return ((daysSinceEpoch % totalDays) + totalDays) % totalDays;
}

function formatShareTip(copy, categoryLabel, item) {
  return [
    `* ${categoryLabel}: ${item.title}`,
    item.lesson,
    `${copy.exerciseLabel}: ${item.exercise}`
  ].join("\n");
}

function buildShareText(copy, payload) {
  return [
    copy.shareIntro,
    "",
    formatShareTip(copy, copy.category.cuerpo, payload.cuerpo),
    "",
    formatShareTip(copy, copy.category.mente, payload.mente),
    "",
    formatShareTip(copy, copy.category.tactica, payload.tactica),
    "",
    siteUrl
  ].join("\n");
}

function buildWhatsAppUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function renderCard(key, item) {
  const copy = uiCopy[currentLang];
  const node = cardTemplate.content.firstElementChild.cloneNode(true);
  node.classList.add(key);
  const badge = node.querySelector(".badge");
  const cardIcon = node.querySelector(".card-icon");
  const levelEl = node.querySelector(".lesson-level");
  const idEl = node.querySelector(".lesson-id");
  const titleEl = node.querySelector(".lesson-title");
  const textEl = node.querySelector(".lesson-text");
  const exEl = node.querySelector(".lesson-exercise");

  badge.textContent = copy.category[key];
  badge.classList.add(key);
  cardIcon.classList.add(key);
  cardIcon.textContent = key === "cuerpo" ? "🏃" : key === "mente" ? "🧠" : "✖";
  if (item.level) {
    levelEl.textContent = item.level;
    levelEl.classList.add("visible");
  } else {
    levelEl.textContent = "";
    levelEl.classList.remove("visible");
  }
  idEl.textContent = item.id;
  titleEl.textContent = item.title;
  textEl.textContent = item.lesson;
  exEl.textContent = `${copy.exerciseLabel}: ${item.exercise}`;
  return node;
}

function render() {
  const data = getCurrentData();
  if (!data || !Array.isArray(data.byDay) || !data.byDay.length) return;
  const copy = uiCopy[currentLang];
  const days = data.byDay.length;
  const today = new Date();
  const idx = getDayIndex(days, today);
  const payload = data.byDay[idx];
  const dateParts = getDateParts(today, copy.locale);

  topTags.textContent = copy.topTags;
  subtitle.textContent = copy.subtitle;
  bottomCopy.textContent = copy.bottom;
  connectorOne.textContent = copy.connector;
  connectorTwo.textContent = copy.connector;
  document.documentElement.lang = currentLang;

  dayWeek.textContent = dateParts.weekday;
  dayNumber.textContent = dateParts.day;
  dayMonth.textContent = dateParts.month;
  dayYear.textContent = dateParts.year;
  cycleLabel.textContent = copy.cycle(payload.day, days);

  cardsRoot.innerHTML = "";
  cardsRoot.appendChild(renderCard("cuerpo", payload.cuerpo));
  cardsRoot.appendChild(renderCard("mente", payload.mente));
  cardsRoot.appendChild(renderCard("tactica", payload.tactica));
  shareLabel.textContent = copy.shareLabel;
  whatsappShare.setAttribute("aria-label", copy.shareAria);
  whatsappShare.href = buildWhatsAppUrl(buildShareText(copy, payload));
  langEsBtn.classList.toggle("active", currentLang === "es");
  langEnBtn.classList.toggle("active", currentLang === "en");
}

function setLanguage(lang) {
  currentLang = lang === "en" ? "en" : "es";
  localStorage.setItem(langStorageKey, currentLang);
  render();
}

function init() {
  const storedLang = localStorage.getItem(langStorageKey);
  if (storedLang === "en" || storedLang === "es") currentLang = storedLang;
  else if ((navigator.language || "").toLowerCase().startsWith("en")) currentLang = "en";
  if (!window.DAILY_MESSAGES_BY_DAY || !window.DAILY_MESSAGES_BY_DAY_EN) {
    cardsRoot.innerHTML = "<p>Error loading lesson data files.</p>";
    return;
  }
  langEsBtn.addEventListener("click", () => setLanguage("es"));
  langEnBtn.addEventListener("click", () => setLanguage("en"));
  render();
}

init();
