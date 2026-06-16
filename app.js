const dataUrl = "./daily_messages_by_day.json";

const cardsRoot = document.getElementById("cards");
const dayWeek = document.getElementById("dayWeek");
const dayNumber = document.getElementById("dayNumber");
const dayMonth = document.getElementById("dayMonth");
const dayYear = document.getElementById("dayYear");
const cycleLabel = document.getElementById("cycleLabel");
const cardTemplate = document.getElementById("cardTemplate");

let data = null;

function getDateParts(date) {
  const raw = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
  const parts = raw.match(/^([^,]+),\s+(\d{1,2})\s+de\s+([^\s]+)\s+de\s+(\d{4})$/i);
  if (!parts) {
    return {
      weekday: "Hoy",
      day: String(date.getDate()),
      month: String(date.getMonth() + 1),
      year: String(date.getFullYear())
    };
  }
  return {
    weekday: parts[1].toUpperCase(),
    day: parts[2],
    month: parts[3].toUpperCase(),
    year: parts[4]
  };
}

function getDayIndex(totalDays, date) {
  const dayMs = 24 * 60 * 60 * 1000;
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceEpoch = Math.floor(localMidnight.getTime() / dayMs);
  return ((daysSinceEpoch % totalDays) + totalDays) % totalDays;
}

function categoryLabel(key) {
  if (key === "cuerpo") return "Cuerpo";
  if (key === "mente") return "Mente";
  return "Táctica";
}

function renderCard(key, item) {
  const node = cardTemplate.content.firstElementChild.cloneNode(true);
  node.classList.add(key);
  const badge = node.querySelector(".badge");
  const cardIcon = node.querySelector(".card-icon");
  const idEl = node.querySelector(".lesson-id");
  const titleEl = node.querySelector(".lesson-title");
  const textEl = node.querySelector(".lesson-text");
  const exEl = node.querySelector(".lesson-exercise");

  badge.textContent = categoryLabel(key);
  badge.classList.add(key);
  cardIcon.classList.add(key);
  cardIcon.textContent = key === "cuerpo" ? "🏃" : key === "mente" ? "🧠" : "✖";
  idEl.textContent = item.id;
  titleEl.textContent = item.title;
  textEl.textContent = item.lesson;
  exEl.textContent = `Ejercicio: ${item.exercise}`;
  return node;
}

function render() {
  if (!data) return;
  const days = data.byDay.length;
  const today = new Date();
  const idx = getDayIndex(days, today);
  const payload = data.byDay[idx];
  const dateParts = getDateParts(today);

  dayWeek.textContent = dateParts.weekday;
  dayNumber.textContent = dateParts.day;
  dayMonth.textContent = dateParts.month;
  dayYear.textContent = dateParts.year;
  cycleLabel.textContent = `Día ${payload.day} de ${days}`;

  cardsRoot.innerHTML = "";
  cardsRoot.appendChild(renderCard("cuerpo", payload.cuerpo));
  cardsRoot.appendChild(renderCard("mente", payload.mente));
  cardsRoot.appendChild(renderCard("tactica", payload.tactica));
}

async function loadData() {
  if (window.DAILY_MESSAGES_BY_DAY && Array.isArray(window.DAILY_MESSAGES_BY_DAY.byDay)) {
    return window.DAILY_MESSAGES_BY_DAY;
  }
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error(`No se pudo cargar ${dataUrl}`);
  return response.json();
}

async function init() {
  data = await loadData();
  render();
}

init().catch((err) => {
  cardsRoot.innerHTML = `<p>Error cargando contenido: ${err.message}</p>`;
});
