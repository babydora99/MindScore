const API_BASE_URL = "http://127.0.0.1:8000"; // change this when you deploy the backend
const SCORE_MAX = 10;

// Country values the backend groups explicitly (must match `top_countries` in main.py)
const TOP_COUNTRIES = ["India", "USA", "Canada", "Australia", "UK", "Germany", "Mexico", "Turkey", "France"];
const OTHER_COUNTRIES = ["Brazil", "China", "Japan", "South Korea", "Russia", "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Pakistan", "Bangladesh", "Nepal", "Sri Lanka", "Indonesia", "Nigeria", "South Africa", "Egypt", "Argentina", "Other"];

const RULES = {
  age:                     { label: "Age", kind: "int", gt: 0, lt: 100, step: 0 },
  gender:                  { label: "Gender", kind: "select" },
  country:                 { label: "Country", kind: "select" },
  academic_level:          { label: "Academic level", kind: "select" },
  most_used_platform:      { label: "Most used platform", kind: "select" },
  purpose_of_use:          { label: "Purpose of use", kind: "select" },
  avg_daily_usage_hours:   { label: "Average daily usage", kind: "float", gt: 0, lt: 24 },
  daily_unlocks:           { label: "Daily unlocks", kind: "int", gt: 0 },
  study_hours:             { label: "Study hours", kind: "float", gt: 0, lt: 24 },
  physical_activity_hours: { label: "Physical activity", kind: "float", gt: 0, lt: 3 },
  sleep_hours_per_night:   { label: "Sleep hours", kind: "float", gt: 0, lt: 24 },
  stress_level:            { label: "Stress level", kind: "select" },
};
// Which fields belong to which step (country-other text is handled with country)
const STEP_FIELDS = [
  ["age", "gender", "country", "academic_level"],
  ["most_used_platform", "purpose_of_use", "avg_daily_usage_hours", "daily_unlocks"],
  ["study_hours", "physical_activity_hours", "sleep_hours_per_night", "stress_level"],
];

const $ = (id) => document.getElementById(id);
const form = $("predictForm");
const steps = [...document.querySelectorAll(".step")];
const crumbs = [...document.querySelectorAll("#progress li")];
let current = 0;
let lastPayload = null;

// ---------- Setup ----------
(function init() {
  // Fill the country dropdown
  const sel = $("country");
  [...TOP_COUNTRIES, ...OTHER_COUNTRIES].forEach((c) => sel.add(new Option(c, c)));

  $("menuBtn").addEventListener("click", () => {
    const open = $("navLinks").classList.toggle("open");
    $("menuBtn").setAttribute("aria-expanded", open);
  });
  $("navLinks").addEventListener("click", () => $("navLinks").classList.remove("open"));

  // Real-time validation as the user types or picks
  form.addEventListener("input", (e) => {
    const name = e.target.name || (e.target.id === "countryOther" ? "countryOther" : null);
    if (!name) return;
    if (name === "country") $("otherWrap").classList.toggle("hidden", e.target.value !== "Other");
    validateField(name === "countryOther" ? "country" : name);
    if (name === "country") validateField("country");
  });

  $("nextBtn").addEventListener("click", () => { if (validateStep(current)) goTo(current + 1); });
  $("prevBtn").addEventListener("click", () => goTo(current - 1));
  $("resetBtn").addEventListener("click", resetForm);
  form.addEventListener("submit", onSubmit);
  $("retryBtn").addEventListener("click", showForm);
  $("againBtn").addEventListener("click", () => { resetForm(); showForm(); });
  $("printBtn").addEventListener("click", () => window.print()); // choose "Save as PDF" in the print dialog
  enhanceInputs();
  goTo(0);
})();

// ---------- Validation ----------
function readValue(name) {
  if (name === "country") {
    const v = $("country").value;
    return v === "Other" ? $("countryOther").value.trim() : v; // actual country typed for "Other"
  }
  return form.elements[name].value.trim();
}

/** Validates one field, shows or clears its message, returns true if valid. */
function validateField(name) {
  const r = RULES[name];
  const raw = readValue(name);
  let msg = "";
  if (raw === "") {
    msg = name === "country" && $("country").value === "Other" ? "Type your country." : `${r.label} is required.`;
  } else if (r.kind !== "select") {
    const n = Number(raw);
    if (Number.isNaN(n)) msg = "Enter a number.";
    else if (r.kind === "int" && !Number.isInteger(n)) msg = "Enter a whole number.";
    else if (r.gt !== undefined && n <= r.gt) msg = `Must be greater than ${r.gt}.`;
    else if (r.lt !== undefined && n >= r.lt) msg = `Must be less than ${r.lt}.`;
  }
  const holder = (name === "country" && $("country").value === "Other" && raw === "") ? $("countryOther") : form.elements[name];
  const field = (name === "country" ? $("country") : form.elements[name]).closest(".field");
  field.classList.toggle("invalid", !!msg);
  field.querySelector(".err").textContent = msg;
  if (name === "country" && $("country").value === "Other") {
    const f2 = $("otherWrap"); f2.classList.toggle("invalid", !!msg); f2.querySelector(".err").textContent = msg;
  }
  holder.setAttribute("aria-invalid", !!msg);
  return !msg;
}

function validateStep(i) {
  if (i > 2) return true;
  const results = STEP_FIELDS[i].map(validateField); // validate all so every error shows
  const ok = results.every(Boolean);
  if (!ok) document.querySelector(".step.active .invalid input:not([type=range]), .step.active .invalid select:not(.enhanced), .step.active .invalid .chip")?.focus();
  return ok;
}

// ---------- Step navigation ----------
function goTo(i) {
  current = Math.max(0, Math.min(steps.length - 1, i));
  steps.forEach((s, idx) => s.classList.toggle("active", idx === current));
  crumbs.forEach((c, idx) => {
    c.classList.toggle("done", idx < current);
    c.classList.toggle("current", idx === current);
    c.toggleAttribute("aria-current", idx === current);
  });
  $("prevBtn").style.visibility = current === 0 ? "hidden" : "visible";
  $("nextBtn").classList.toggle("hidden", current === steps.length - 1);
  $("submitBtn").classList.toggle("hidden", current !== steps.length - 1);
  if (current === 3) renderList($("review"), buildPayload());
}

function resetForm() {
  form.reset();
  syncChips();
  $("otherWrap").classList.add("hidden");
  document.querySelectorAll(".invalid").forEach((f) => f.classList.remove("invalid"));
  document.querySelectorAll(".err").forEach((e) => (e.textContent = ""));
  goTo(0);
}

// ---------- Payload ----------
/** Builds the exact JSON body the backend expects: same keys, numbers as numbers, no extras. */
function buildPayload() {
  const p = {};
  for (const name of Object.keys(RULES)) {
    const raw = readValue(name);
    p[name] = RULES[name].kind === "select" || name === "country" ? raw : Number(raw);
  }
  return p; // key order follows RULES, which matches the spec
}

function renderList(dl, payload) {
  dl.replaceChildren();
  for (const [k, v] of Object.entries(payload)) {
    const wrap = document.createElement("div");
    const dt = document.createElement("dt"); dt.textContent = RULES[k].label;
    const dd = document.createElement("dd"); dd.textContent = v; // textContent avoids HTML injection
    wrap.append(dt, dd); dl.append(wrap);
  }
}

// ---------- API call ----------
async function onSubmit(e) {
  e.preventDefault();
  // Re-validate every step before sending
  for (let i = 0; i < 3; i++) if (!validateStep(i)) { goTo(i); return; }
  lastPayload = buildPayload();
  show("loading");
  try {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lastPayload),
    });
    if (!res.ok) {
      let detail = "";
      try { detail = formatDetail((await res.json()).detail); } catch (_) {}
      throw new Error(`The server replied with status ${res.status}. ${detail}`);
    }
    const data = await res.json();
    const score = data.predicted_mental_health_score;
    if (typeof score !== "number" || !Number.isFinite(score)) throw new Error("The response did not contain a valid predicted_mental_health_score.");
    showResult(score);
  } catch (err) {
    const offline = err instanceof TypeError; // fetch throws TypeError when the server is unreachable
    $("apiErrorMsg").textContent = offline
      ? `Can't reach the backend at ${API_BASE_URL}. Check that FastAPI is running (uvicorn main:app --reload --port 8000).`
      : err.message;
    show("apiError");
  }
}

/** FastAPI 422 errors come as a list of {loc, msg}; turn them into a readable line. */
function formatDetail(d) {
  if (Array.isArray(d)) return d.map((x) => `${(x.loc || []).slice(1).join(".")}: ${x.msg}`).join("; ");
  return typeof d === "string" ? d : "";
}

// ---------- Results ----------
function showResult(score) {
  show("results");
  renderList($("insights"), lastPayload);
  $("scoreMax").textContent = `gauge scale 0–${SCORE_MAX}`;
  $("scoreExplain").textContent = `The model returned ${score} for the details you entered. This is an estimate based on patterns in its training data, not a diagnosis. The gauge assumes a 0–${SCORE_MAX} scale.`;

  // Animate the number and the circular gauge
  const circ = 2 * Math.PI * 85;
  const fg = $("gaugeFg");
  fg.style.strokeDasharray = circ;
  fg.style.strokeDashoffset = circ;
  const fraction = Math.min(Math.max(score / SCORE_MAX, 0), 1);
  requestAnimationFrame(() => (fg.style.strokeDashoffset = circ * (1 - fraction)));
  const start = performance.now(), dur = 1200;
  (function tick(t) {
    const k = Math.min((t - start) / dur, 1);
    $("scoreNum").textContent = (score * k).toFixed(2);
    if (k < 1) requestAnimationFrame(tick); else $("scoreNum").textContent = score.toFixed(2);
  })(start);
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- Panel switching ----------
function show(id) {
  ["formPanel", "loading", "apiError", "results"].forEach((p) => $(p).classList.toggle("hidden", p !== id));
}
function showForm() { show("formPanel"); }

// ---------- Friendlier inputs ----------
const CHIP_FIELDS = ["gender", "academic_level", "most_used_platform", "purpose_of_use", "stress_level"];
const SLIDERS = { avg_daily_usage_hours: [0, 24, 0.5], study_hours: [0, 24, 0.5], physical_activity_hours: [0, 3, 0.1], sleep_hours_per_night: [0, 24, 0.5] };

function enhanceInputs() {
  CHIP_FIELDS.forEach((name) => {
    const sel = form.elements[name];
    sel.classList.add("enhanced");
    const group = document.createElement("div");
    group.className = "chips";
    group.dataset.for = name;
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", RULES[name].label);
    [...sel.options].filter((o) => o.value).forEach((o) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = o.value; b.dataset.value = o.value;
      b.setAttribute("role", "radio");
      b.addEventListener("click", () => {
        sel.value = o.value;
        sel.dispatchEvent(new Event("input", { bubbles: true })); // reuse live validation
        syncChips();
      });
      group.append(b);
    });
    sel.after(group);
  });
  Object.entries(SLIDERS).forEach(([name, [min, max, step]]) => {
    const num = form.elements[name];
    const r = document.createElement("input");
    Object.assign(r, { type: "range", min, max, step, className: "slider" });
    r.defaultValue = min; r.value = min;
    r.setAttribute("aria-label", `${RULES[name].label} slider`);
    r.addEventListener("input", () => { num.value = r.value; num.dispatchEvent(new Event("input", { bubbles: true })); });
    num.addEventListener("input", () => { if (num.value !== "") r.value = num.value; });
    num.after(r);
  });
  syncChips();
}

/** Marks the chip that matches each select's current value. */
function syncChips() {
  document.querySelectorAll(".chips").forEach((g) => {
    const v = form.elements[g.dataset.for].value;
    g.querySelectorAll(".chip").forEach((c) => {
      const on = c.dataset.value === v;
      c.classList.toggle("on", on);
      c.setAttribute("aria-checked", on);
    });
  });
  document.querySelectorAll(".slider").forEach((r) => { const n = r.previousElementSibling; r.value = n.value === "" ? r.min : n.value; });
}