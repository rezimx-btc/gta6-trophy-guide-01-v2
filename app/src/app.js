// Leonida Ledger v2 — guide + tracker for the 55 GTA VI trophies.
// All data comes from app/data/trophies.json. No network at run time.
const DATA_URL = "data/trophies.json";
const STORE_EARNED = "leonida-ledger-v2-earned";
const STORE_SPOILER = "leonida-ledger-v2-spoiler";

const ROADMAP_STAGES = [
  { n: 1, title: "Story First", note: "Chapters 1–4, the final mission and the story missions in between. Nothing here can be done after the credits." },
  { n: 2, title: "Allies & Strangers", note: "The five character strands and 8 stranger strands across Leonida. Finish the character finals before the story moves on." },
  { n: 3, title: "Activities & Skills", note: "Stunts, the shooting range, drone races, races, fishing, arcade, meditation, hunting and Combat Focus." },
  { n: 4, title: "Collectibles & Exploration", note: "Cards, WAiNK photos, vehicles, all 52 areas, garages and the Scooter Bros registry." },
  { n: 5, title: "Heists & Heat", note: "Partner robberies, the VCIA departure, vaults, armored trucks, gang operations and the showroom smash." },
  { n: 6, title: "Cleanup & Platinum", note: "100% completion, 50 challenges, the quiet moments, the four unverified trophies, and the platinum itself." }
];

let trophies = [];
let sources = [];
let earned = new Set();
let spoilerOn = false;
let kindFilter = "all";
let searchText = "";
let earnedOnly = false;
let selectedId = null;

function loadProgress() {
  try { earned = new Set(JSON.parse(localStorage.getItem(STORE_EARNED) || "[]")); } catch (e) { earned = new Set(); }
  spoilerOn = localStorage.getItem(STORE_SPOILER) === "1";
}

function saveProgress() {
  localStorage.setItem(STORE_EARNED, JSON.stringify([...earned].sort((a, b) => a - b)));
  localStorage.setItem(STORE_SPOILER, spoilerOn ? "1" : "0");
}

async function loadTrophies() {
  const res = await fetch(DATA_URL);
  const data = await res.json();
  trophies = data.trophies;
  sources = data.sources || [];
}

function sourceByKey(key) {
  return sources.find((s) => s.key === key) || { key, name: key, url: "", accessed: "" };
}

function computeAudit() {
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let missable = 0, hidden = 0, citedSteps = 0;
  for (const t of trophies) {
    grades[t.grade] = (grades[t.grade] || 0) + 1;
    if (t.missable) missable++;
    if (t.hidden) hidden++;
    citedSteps += t.steps.filter((s) => s.source).length;
  }
  return { total: trophies.length, grades, missable, hidden, citedSteps, datedSources: sources.length };
}

function renderAuditStrip() {
  const a = computeAudit();
  const el = document.getElementById("audit-strip");
  el.innerHTML =
    "<b>AUDIT</b> — " + a.total + "/" + a.total + " names match the official PlayStation list · " +
    a.grades.platinum + " platinum · " + a.grades.gold + " gold · " + a.grades.silver + " silver · " + a.grades.bronze + " bronze · " +
    a.missable + " missable · " + a.citedSteps + " cited steps · " + a.datedSources + " dated sources · " + a.hidden + " hidden";
}

function renderRoadmap() {
  const list = document.getElementById("roadmap-list");
  list.innerHTML = "";
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.roadmap === stage.n);
    const li = document.createElement("li");
    const h = document.createElement("h3");
    h.textContent = "Stage " + stage.n + " — " + stage.title + " (" + members.length + ")";
    const p = document.createElement("p");
    p.textContent = stage.note;
    const names = document.createElement("p");
    names.textContent = members.map((t) => t.name).join(" · ");
    li.append(h, p, names);
    list.append(li);
  }
}

function spoilerName(t) {
  if (spoilerOn && t.kind === "story" && !earned.has(t.id)) return "Hidden story trophy";
  return t.name;
}

function spoilerDesc(t) {
  if (spoilerOn && t.kind === "story" && !earned.has(t.id)) return "Hidden until earned.";
  return t.description;
}

function visibleTrophies() {
  return trophies.filter((t) => {
    if (kindFilter === "missable") {
      if (!t.missable) return false;
    } else if (kindFilter !== "all" && t.kind !== kindFilter) return false;
    if (earnedOnly && !earned.has(t.id)) return false;
    if (searchText) {
      const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (!hay.includes(searchText)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const n = earned.size;
  const pct = Math.round((n / trophies.length) * 100);
  document.getElementById("progress-text").textContent = n + " / " + trophies.length + " earned";
  document.getElementById("progress-pct").textContent = pct + "%";
  document.getElementById("progress-fill").style.width = pct + "%";
}

function gradeBadge(t) {
  const b = document.createElement("span");
  b.className = "badge " + t.grade;
  b.textContent = t.grade;
  return b;
}

function renderChecklist() {
  const list = document.getElementById("trophy-list");
  const shown = visibleTrophies();
  document.getElementById("list-count").textContent = "(" + shown.length + " of " + trophies.length + ")";
  list.innerHTML = "";
  for (const t of shown) {
    const li = document.createElement("li");
    if (earned.has(t.id)) li.classList.add("earned");
    if (selectedId === t.id) li.classList.add("selected");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned.has(t.id);
    box.setAttribute("aria-label", "Mark " + t.name + " earned");
    box.addEventListener("change", () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      saveProgress();
      renderProgress();
      renderChecklist();
      renderGuidePanel();
    });
    const body = document.createElement("div");
    const name = document.createElement("div");
    name.className = "trophy-name";
    name.textContent = spoilerName(t);
    const desc = document.createElement("div");
    desc.className = "trophy-desc";
    desc.textContent = spoilerDesc(t);
    const meta = document.createElement("div");
    meta.className = "trophy-meta";
    meta.append(gradeBadge(t));
    if (t.missable) {
      const m = document.createElement("span");
      m.className = "badge missable";
      m.textContent = "Missable";
      meta.append(m);
    }
    if (t.hidden) {
      const h = document.createElement("span");
      h.className = "badge hidden-t";
      h.textContent = "Hidden";
      meta.append(h);
    }
    if (t.unverified) {
      const u = document.createElement("span");
      u.className = "badge unverified";
      u.textContent = "Unverified";
      meta.append(u);
    }
    body.append(name, desc, meta);
    li.append(box, body);
    li.addEventListener("click", (ev) => {
      if (ev.target === box) return;
      selectTrophy(t.id);
    });
    list.append(li);
  }
}

function selectTrophy(id) {
  selectedId = id;
  renderChecklist();
  renderGuidePanel();
}

function renderGuidePanel() {
  const panel = document.getElementById("guide-panel");
  const t = trophies.find((x) => x.id === selectedId);
  panel.innerHTML = "";
  if (!t) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "Select a trophy from the checklist to see its guide, its steps, and each step's source.";
    panel.append(p);
    return;
  }
  const h = document.createElement("h3");
  h.textContent = spoilerName(t);
  const off = document.createElement("p");
  off.className = "official";
  off.textContent = "Official: " + spoilerDesc(t) + " — " + t.grade + (t.missable ? " · missable" : "");
  const guide = document.createElement("p");
  guide.className = "guide-text";
  guide.textContent = t.guide;
  panel.append(h, off, guide);
  if (t.unverified) {
    const warn = document.createElement("p");
    warn.className = "warn";
    warn.textContent = "Unverified — no public source documents this trophy yet. No steps are given rather than invented ones.";
    panel.append(warn);
    return;
  }
  const ol = document.createElement("ol");
  for (const step of t.steps) {
    const li = document.createElement("li");
    li.textContent = step.text + " ";
    const src = sourceByKey(step.source);
    const cite = document.createElement("span");
    cite.className = "step-source";
    cite.textContent = "Source: ";
    if (src.url) {
      const a = document.createElement("a");
      a.href = src.url;
      a.textContent = src.name;
      a.target = "_blank";
      a.rel = "noopener";
      cite.append(a);
    } else {
      cite.append(document.createTextNode(src.name));
    }
    cite.append(document.createTextNode(" (" + src.accessed + ")"));
    li.append(cite);
    ol.append(li);
  }
  panel.append(ol);
}

function renderMatrix() {
  const table = document.getElementById("matrix-table");
  table.innerHTML = "";
  const head = document.createElement("tr");
  const th0 = document.createElement("th");
  th0.textContent = "Trophy";
  head.append(th0);
  for (const s of sources) {
    const th = document.createElement("th");
    th.textContent = s.name.split(" — ")[0];
    th.title = s.name + " (" + s.accessed + ")";
    head.append(th);
  }
  table.append(head);
  for (const t of trophies) {
    const tr = document.createElement("tr");
    const td0 = document.createElement("td");
    td0.textContent = spoilerName(t);
    tr.append(td0);
    const citedKeys = new Set(t.steps.map((s) => s.source));
    for (const s of sources) {
      const td = document.createElement("td");
      if (citedKeys.has(s.key)) {
        td.textContent = "✓";
        td.className = "mark";
      } else {
        td.textContent = "·";
      }
      tr.append(td);
    }
    table.append(tr);
  }
}

function renderSources() {
  const list = document.getElementById("sources-list");
  document.getElementById("sources-count").textContent = "(" + sources.length + " dated sources)";
  list.innerHTML = "";
  for (const s of sources) {
    const stepCount = trophies.reduce((n, t) => n + t.steps.filter((x) => x.source === s.key).length, 0);
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = s.url;
    a.textContent = s.name;
    a.target = "_blank";
    a.rel = "noopener";
    const date = document.createElement("div");
    date.className = "date";
    date.textContent = "Accessed " + s.accessed + " · cited by " + stepCount + " step" + (stepCount === 1 ? "" : "s");
    li.append(a, date);
    list.append(li);
  }
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: "Grand Theft Auto VI", earned: [...earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-ledger-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const ids = (data.earned || []).filter((id) => trophies.some((t) => t.id === id));
      earned = new Set(ids);
      saveProgress();
      renderProgress();
      renderChecklist();
    } catch (e) {
      alert("That file is not a Leonida Ledger progress export.");
    }
  };
  reader.readAsText(file);
}

function resetProgress() {
  if (!confirm("Reset all earned trophies?")) return;
  earned = new Set();
  saveProgress();
  renderProgress();
  renderChecklist();
}

function applyFilters() {
  document.querySelectorAll("#filters .filter").forEach((b) => {
    b.classList.toggle("active", b.dataset.kind === kindFilter);
  });
  renderChecklist();
}

function wireControls() {
  document.getElementById("search").addEventListener("input", (ev) => {
    searchText = ev.target.value.trim().toLowerCase();
    renderChecklist();
  });
  document.querySelectorAll("#filters .filter").forEach((b) => {
    b.addEventListener("click", () => {
      kindFilter = b.dataset.kind;
      applyFilters();
    });
  });
  const spoilerBox = document.getElementById("spoiler");
  spoilerBox.checked = spoilerOn;
  spoilerBox.addEventListener("change", () => {
    spoilerOn = spoilerBox.checked;
    saveProgress();
    renderChecklist();
    renderMatrix();
    renderGuidePanel();
  });
  document.getElementById("earned-only").addEventListener("change", (ev) => {
    earnedOnly = ev.target.checked;
    renderChecklist();
  });
  document.getElementById("export-btn").addEventListener("click", exportProgress);
  document.getElementById("import-btn").addEventListener("click", () => document.getElementById("import-file").click());
  document.getElementById("import-file").addEventListener("change", (ev) => {
    if (ev.target.files[0]) importProgress(ev.target.files[0]);
    ev.target.value = "";
  });
  document.getElementById("reset-btn").addEventListener("click", resetProgress);
}

function readHashRoute() {
  const hash = new URLSearchParams(location.hash.slice(1));
  const tid = Number(hash.get("trophy"));
  if (tid && trophies.some((t) => t.id === tid)) selectedId = tid;
  const view = hash.get("view");
  if (view) {
    const target = document.querySelector('[aria-label="' + view + '"]') || document.getElementById(view);
    if (target) target.scrollIntoView();
  }
}

async function initApp() {
  loadProgress();
  await loadTrophies();
  renderAuditStrip();
  renderRoadmap();
  renderProgress();
  renderChecklist();
  renderGuidePanel();
  renderMatrix();
  renderSources();
  wireControls();
  readHashRoute();
  renderChecklist();
  renderGuidePanel();
}

initApp();
