const $ = id => document.getElementById(id);

const menu = $("menu");
const mode = $("mode");
const select = $("select");
const difficulty = $("difficulty");
const how = $("how");
const gameScreen = $("gameScreen");

const tankGrid = $("tankGrid");
const canvas = $("game");
const ctx = canvas.getContext("2d");

const tankNameEl = $("tankName");
const hpFill = $("hpFill");
const hpFill2 = $("hpFill2");
const p2Hud = $("p2Hud");

const waveText = $("waveText");
const levelText = $("levelText");
const scoreText = $("scoreText");
const enemyText = $("enemyText");
const difficultyText = $("difficultyText");

const selectTitle = $("selectTitle");
const selectSubText = $("selectSubText");

const overlay = $("overlay");
const overlayTitle = $("overlayTitle");
const overlayText = $("overlayText");
const upgradeList = $("upgradeList");
const overlayMainBtn = $("overlayMainBtn");
const overlayMenuBtn = $("overlayMenuBtn");

const W = canvas.width;
const H = canvas.height;

let currentScreen = "menu";
let playerCount = 1;
let choosingPlayer = 1;
let selectedTankP1 = "vanguard";
let selectedTankP2 = "vanguard";
let selectedDifficulty = "normal";

let players = [];
let enemies = [];
let bullets = [];
let particles = [];
let texts = [];
let pickups = [];
let obstacles = [];
let keys = {};

let running = false;
let paused = false;
let gameOver = false;
let choosingUpgrade = false;

let score = 0;
let level = 1;
let wave = 1;
let kills = 0;
let spawnTimer = 0;
let waveTimer = 0;
let bossAlive = false;
let shake = 0;
let lastTime = 0;

let audioCtx = null;
let audioReady = false;

const MAX_ENEMIES = 3;

const difficultySettings = {
  veryEasy: {
    label: "Çok Kolay",
    enemySpeed: 0.58,
    enemyDamage: 0.45,
    enemyReload: 1.75,
    bulletSpeed: 0.70,
    spawnDelay: 1.75,
    aimError: 0.55,
    maxEnemies: 2,
    bossHp: 0.70
  },
  easy: {
    label: "Kolay",
    enemySpeed: 0.75,
    enemyDamage: 0.65,
    enemyReload: 1.35,
    bulletSpeed: 0.82,
    spawnDelay: 1.35,
    aimError: 0.38,
    maxEnemies: 2,
    bossHp: 0.85
  },
  normal: {
    label: "Orta",
    enemySpeed: 1.00,
    enemyDamage: 1.00,
    enemyReload: 1.00,
    bulletSpeed: 1.00,
    spawnDelay: 1.00,
    aimError: 0.20,
    maxEnemies: 3,
    bossHp: 1.00
  },
  hard: {
    label: "Zor",
    enemySpeed: 1.18,
    enemyDamage: 1.22,
    enemyReload: 0.82,
    bulletSpeed: 1.15,
    spawnDelay: 0.82,
    aimError: 0.10,
    maxEnemies: 3,
    bossHp: 1.18
  },
  nightmare: {
    label: "Çok Zor",
    enemySpeed: 1.38,
    enemyDamage: 1.45,
    enemyReload: 0.68,
    bulletSpeed: 1.28,
    spawnDelay: 0.68,
    aimError: 0.04,
    maxEnemies: 3,
    bossHp: 1.38
  }
};

const tankTypes = {
  vanguard: {
    name: "Mavi Vanguard",
    desc: "Dengeli, sağlam ve güvenli seçim.",
    c1: "#1f74ff",
    c2: "#77e6ff",
    hp: 150,
    speed: 275,
    reload: 0.22,
    damage: 18,
    bulletSpeed: 900,
    radius: 5,
    style: "normal",
    stats: { Can: 75, Hız: 70, Hasar: 60, Atış: 68 }
  },
  raptor: {
    name: "Yeşil Raptor",
    desc: "Çok hızlı hareket eder, seri lazer ateşi açar.",
    c1: "#19aa55",
    c2: "#85ffaf",
    hp: 115,
    speed: 350,
    reload: 0.145,
    damage: 13,
    bulletSpeed: 1120,
    radius: 4,
    style: "laser",
    stats: { Can: 55, Hız: 92, Hasar: 45, Atış: 92 }
  },
  titan: {
    name: "Sarı Titan",
    desc: "Yavaş ama çok dayanıklı. Ağır top mermisi kullanır.",
    c1: "#b8860b",
    c2: "#ffdf65",
    hp: 230,
    speed: 210,
    reload: 0.43,
    damage: 36,
    bulletSpeed: 760,
    radius: 8,
    style: "heavy",
    stats: { Can: 96, Hız: 42, Hasar: 94, Atış: 36 }
  },
  phantom: {
    name: "Mor Phantom",
    desc: "Enerji mermisiyle hızlı ve agresif oynanır.",
    c1: "#7438ff",
    c2: "#db7cff",
    hp: 130,
    speed: 305,
    reload: 0.17,
    damage: 15,
    bulletSpeed: 1180,
    radius: 4.5,
    style: "plasma",
    stats: { Can: 62, Hız: 82, Hasar: 52, Atış: 84 }
  }
};

const enemyTypes = [
  {
    name: "Kızıl Kaplan",
    c1: "#941717",
    c2: "#ff7474",
    hp: 54,
    speed: 145,
    reload: 1.45,
    damage: 12,
    bulletSpeed: 540,
    w: 50,
    h: 64,
    score: 55,
    kind: "normal"
  },
  {
    name: "Çöl Akrebi",
    c1: "#b75a0b",
    c2: "#ffb26b",
    hp: 32,
    speed: 205,
    reload: 1.15,
    damage: 9,
    bulletSpeed: 600,
    w: 43,
    h: 55,
    score: 45,
    kind: "fast"
  },
  {
    name: "Mor Keskin",
    c1: "#531bb0",
    c2: "#b886ff",
    hp: 42,
    speed: 120,
    reload: 1.75,
    damage: 18,
    bulletSpeed: 780,
    w: 45,
    h: 58,
    score: 75,
    kind: "sniper"
  },
  {
    name: "Demir Boğa",
    c1: "#651313",
    c2: "#ff8c8c",
    hp: 82,
    speed: 100,
    reload: 1.65,
    damage: 19,
    bulletSpeed: 540,
    w: 58,
    h: 70,
    score: 95,
    kind: "heavy"
  },
  {
    name: "Alev Teker",
    c1: "#b33512",
    c2: "#ffdf68",
    hp: 28,
    speed: 235,
    reload: 1.05,
    damage: 8,
    bulletSpeed: 630,
    w: 40,
    h: 52,
    score: 50,
    kind: "fast"
  }
];

const upgrades = [
  {
    title: "Ağır Namlu",
    desc: "Tüm oyuncuların hasarı %15 artar.",
    apply: () => players.forEach(p => p.damage *= 1.15)
  },
  {
    title: "Hızlı Şarjör",
    desc: "Tüm oyuncuların ateş süresi %12 kısalır.",
    apply: () => players.forEach(p => p.reload *= 0.88)
  },
  {
    title: "Zırh Paketi",
    desc: "Maksimum can +30 artar ve can yenilenir.",
    apply: () => {
      players.forEach(p => {
        p.maxHp += 30;
        p.hp = Math.min(p.maxHp, p.hp + 55);
      });
    }
  },
  {
    title: "Turbo Motor",
    desc: "Tüm oyuncuların hızı %10 artar.",
    apply: () => players.forEach(p => p.speed *= 1.10)
  },
  {
    title: "Delici Mermi",
    desc: "Mermi hızı ve hasar artar.",
    apply: () => {
      players.forEach(p => {
        p.bulletSpeed *= 1.10;
        p.damage *= 1.08;
      });
    }
  },
  {
    title: "Tamir Kiti",
    desc: "Tüm oyunculara 90 can verir.",
    apply: () => {
      players.forEach(p => {
        if (p.alive) p.hp = Math.min(p.maxHp, p.hp + 90);
      });
    }
  },
  {
    title: "Geniş Kalibre",
    desc: "Mermi boyutu ve hasar biraz artar.",
    apply: () => {
      players.forEach(p => {
        p.radius += 1;
        p.damage *= 1.07;
      });
    }
  },
  {
    title: "Komutan Refleksi",
    desc: "Hız ve atış dengeli şekilde artar.",
    apply: () => {
      players.forEach(p => {
        p.speed *= 1.06;
        p.reload *= 0.93;
      });
    }
  }
];

function getDifficulty() {
  return difficultySettings[selectedDifficulty] || difficultySettings.normal;
}

function showScreen(name) {
  currentScreen = name;

  [menu, mode, select, difficulty, how, gameScreen].forEach(s => {
    s.classList.remove("active");
  });

  if (name === "menu") menu.classList.add("active");
  if (name === "mode") mode.classList.add("active");
  if (name === "select") select.classList.add("active");
  if (name === "difficulty") difficulty.classList.add("active");
  if (name === "how") how.classList.add("active");
  if (name === "game") gameScreen.classList.add("active");
}

function buildTankCards() {
  tankGrid.innerHTML = "";

  Object.entries(tankTypes).forEach(([key, t]) => {
    const card = document.createElement("div");

    card.className = "tank-card";
    card.style.setProperty("--c1", t.c1);
    card.style.setProperty("--c2", t.c2);

    const stats = Object.entries(t.stats).map(([name, val]) => `
      <div class="stat">
        <span>${name}</span>
        <div class="meter"><i style="width:${val}%"></i></div>
      </div>
    `).join("");

    card.innerHTML = `
      <h3>${t.name}</h3>
      <p>${t.desc}</p>
      <div class="tank-art"></div>
      ${stats}
    `;

    card.onclick = () => selectTank(key);

    tankGrid.appendChild(card);
  });
}

function startModeSelection(count) {
  playerCount = count;
  choosingPlayer = 1;
  selectedTankP1 = null;
  selectedTankP2 = null;

  updateSelectHeader();
  showScreen("select");
}

function updateSelectHeader() {
  if (playerCount === 1) {
    selectTitle.textContent = "Tankını seç";
    selectSubText.textContent = "Tek oyuncu modu için tankını seç.";
  } else {
    selectTitle.textContent = `${choosingPlayer}. oyuncu tankını seç`;
    selectSubText.textContent = choosingPlayer === 1
      ? "Önce 1. oyuncu tankını seçecek."
      : "Şimdi 2. oyuncu tankını seçecek.";
  }
}

function selectTank(key) {
  if (playerCount === 1) {
    selectedTankP1 = key;
    showScreen("difficulty");
    return;
  }

  if (choosingPlayer === 1) {
    selectedTankP1 = key;
    choosingPlayer = 2;
    updateSelectHeader();
    return;
  }

  selectedTankP2 = key;
  showScreen("difficulty");
}

function selectDifficulty(key) {
  selectedDifficulty = key;
  startGame();
}

window.selectDifficulty = selectDifficulty;
window.getDifficulty = getDifficulty;

function unlockAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  audioReady = true;
}

function tone(freq = 220, end = 80, dur = 0.1, type = "square", vol = 0.06) {
  if (!audioReady || !audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(24, end), now + dur);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(vol, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + dur + 0.02);
}

function noise(dur = 0.2, vol = 0.1, start = 1500, end = 80) {
  if (!audioReady || !audioCtx) return;

  const sr = audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, Math.floor(sr * dur), sr);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const src = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  src.buffer = buffer;

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(start, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(end, audioCtx.currentTime + dur);

  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  src.start();
  src.stop(audioCtx.currentTime + dur + 0.02);
}

function soundShoot(style) {
  if (style === "heavy") {
    tone(160, 45, 0.18, "square", 0.12);
    noise(0.07, 0.05, 1000, 220);
  } else if (style === "laser") {
    tone(760, 220, 0.065, "sawtooth", 0.055);
  } else if (style === "plasma") {
    tone(470, 130, 0.095, "triangle", 0.07);
  } else {
    tone(270, 85, 0.085, "square", 0.07);
  }
}

function soundExplosion(big = false) {
  noise(big ? 0.42 : 0.24, big ? 0.18 : 0.10, big ? 1900 : 1400, 55);
  tone(big ? 90 : 130, big ? 32 : 60, big ? 0.32 : 0.18, "triangle", big ? 0.11 : 0.06);
}

function soundHit() {
  tone(540, 240, 0.045, "triangle", 0.035);
}

function soundPower() {
  tone(420, 760, 0.11, "sine", 0.05);
  setTimeout(() => tone(620, 980, 0.1, "sine", 0.04), 80);
}

function startGame() {
  unlockAudio();

  players = [];

  const p1Tank = tankTypes[selectedTankP1 || "vanguard"];

  players.push(createPlayer({
    id: 1,
    x: 180,
    y: playerCount === 1 ? H / 2 : H / 2 - 70,
    tank: p1Tank,
    controls: {
      up: "w",
      down: "s",
      left: "a",
      right: "d",
      fire: " "
    }
  }));

  if (playerCount === 2) {
    const p2Tank = tankTypes[selectedTankP2 || "vanguard"];

    players.push(createPlayer({
      id: 2,
      x: 180,
      y: H / 2 + 90,
      tank: p2Tank,
      controls: {
        up: "arrowup",
        down: "arrowdown",
        left: "arrowleft",
        right: "arrowright",
        fire: "shift"
      }
    }));
  }

  enemies = [];
  bullets = [];
  particles = [];
  texts = [];
  pickups = [];
  obstacles = createObstacles();

  score = 0;
  level = 1;
  wave = 1;
  kills = 0;
  spawnTimer = 0;
  waveTimer = 0;
  bossAlive = false;
  shake = 0;

  running = true;
  paused = false;
  gameOver = false;
  choosingUpgrade = false;

  overlay.classList.remove("active");
  p2Hud.classList.toggle("hidden", playerCount === 1);

  showScreen("game");
  updateHud();
}

function createPlayer(data) {
  const t = data.tank;

  return {
    id: data.id,
    x: data.x,
    y: data.y,
    w: 56,
    h: 72,
    angle: 0,
    turret: 0,
    hp: t.hp,
    maxHp: t.hp,
    speed: t.speed,
    reload: t.reload,
    reloadLeft: 0,
    damage: t.damage,
    bulletSpeed: t.bulletSpeed,
    radius: t.radius,
    style: t.style,
    c1: t.c1,
    c2: t.c2,
    name: t.name,
    alive: true,
    controls: data.controls
  };
}

function createObstacles() {
  return [
    { x: 310, y: 145, w: 170, h: 96, type: "rock" },
    { x: 590, y: 355, w: 135, h: 135, type: "crate" },
    { x: 910, y: 150, w: 170, h: 105, type: "rock" },
    { x: 1180, y: 530, w: 170, h: 100, type: "crate" },
    { x: 270, y: 625, w: 150, h: 88, type: "crate" },
    { x: 1095, y: 70, w: 155, h: 82, type: "rock" },
    { x: 750, y: 640, w: 160, h: 84, type: "rock" },
    { x: 1320, y: 250, w: 95, h: 175, type: "rock" }
  ];
}

function showOverlay(title, html, button = "Devam", upgradesMode = false) {
  overlayTitle.textContent = title;
  overlayText.innerHTML = html;
  overlayMainBtn.textContent = button;
  upgradeList.innerHTML = "";
  upgradeList.style.display = upgradesMode ? "grid" : "none";
  overlay.classList.add("active");
}

function openUpgrade() {
  choosingUpgrade = true;

  const list = [...upgrades].sort(() => Math.random() - 0.5).slice(0, 3);

  showOverlay(
    "Seviye Atladın",
    `Seviye <b>${level}</b> oldun. Bir geliştirme seç.`,
    "Geliştirme seç",
    true
  );

  list.forEach(up => {
    const div = document.createElement("div");

    div.className = "upgrade-option";
    div.innerHTML = `<b>${up.title}</b><p>${up.desc}</p>`;

    div.onclick = () => {
      up.apply();
      choosingUpgrade = false;
      overlay.classList.remove("active");
      soundPower();
      updateHud();
    };

    upgradeList.appendChild(div);
  });
}

function setPause(v) {
  if (gameOver || choosingUpgrade || currentScreen !== "game") return;

  paused = v;

  if (paused) {
    showOverlay(
      "Duraklatıldı",
      "Oyuna devam etmek için Devam butonuna veya P tuşuna bas.",
      "Devam",
      false
    );
  } else {
    overlay.classList.remove("active");
  }
}

function updateHud() {
  if (!players.length) return;

  tankNameEl.textContent = players.map(p => `${p.id}P ${p.name}`).join(" + ");
  waveText.textContent = wave;
  levelText.textContent = level;
  scoreText.textContent = score;
  enemyText.textContent = enemies.length;
  difficultyText.textContent = getDifficulty().label;

  updateHpBar(hpFill, players[0]);

  if (playerCount === 2) {
    updateHpBar(hpFill2, players[1]);
  }
}

function updateHpBar(bar, p) {
  if (!bar || !p) return;

  const pct = Math.max(0, p.hp / p.maxHp) * 100;

  bar.style.width = pct + "%";

  if (!p.alive) {
    bar.style.background = "linear-gradient(90deg,#444,#777)";
  } else if (pct < 30) {
    bar.style.background = "linear-gradient(90deg,#ff5d6c,#ff9f5d)";
  } else if (pct < 60) {
    bar.style.background = "linear-gradient(90deg,#ffd166,#fff05d)";
  } else {
    bar.style.background = "linear-gradient(90deg,#7dff9d,#dfff5d)";
  }
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function rects(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function circleRect(cx, cy, r, rx, ry, rw, rh) {
  const nx = clamp(cx, rx, rx + rw);
  const ny = clamp(cy, ry, ry + rh);
  const dx = cx - nx;
  const dy = cy - ny;

  return dx * dx + dy * dy <= r * r;
}

function hitTank(b, t) {
  return circleRect(
    b.x,
    b.y,
    b.r,
    t.x - t.w / 2,
    t.y - t.h / 2,
    t.w,
    t.h
  );
}

function moveEntity(e, dx, dy) {
  e.x += dx;

  for (const o of obstacles) {
    if (rects({ x: e.x - e.w / 2, y: e.y - e.h / 2, w: e.w, h: e.h }, o)) {
      if (dx > 0) e.x = o.x - e.w / 2;
      if (dx < 0) e.x = o.x + o.w + e.w / 2;
    }
  }

  e.y += dy;

  for (const o of obstacles) {
    if (rects({ x: e.x - e.w / 2, y: e.y - e.h / 2, w: e.w, h: e.h }, o)) {
      if (dy > 0) e.y = o.y - e.h / 2;
      if (dy < 0) e.y = o.y + o.h + e.h / 2;
    }
  }

  e.x = clamp(e.x, e.w / 2 + 8, W - e.w / 2 - 8);
  e.y = clamp(e.y, e.h / 2 + 8, H - e.h / 2 - 8);
}

function getTankCollisionRadius(t) {
  if (t.boss) return Math.max(t.w, t.h) * 0.43;
  return Math.max(t.w, t.h) * 0.42;
}

function resolveTankCollisions() {
  const allTanks = [
    ...players.filter(p => p.alive),
    ...enemies
  ];

  for (let i = 0; i < allTanks.length; i++) {
    for (let j = i + 1; j < allTanks.length; j++) {
      const a = allTanks[i];
      const b = allTanks[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.0001;

      const ra = getTankCollisionRadius(a);
      const rb = getTankCollisionRadius(b);
      const minDist = ra + rb;

      if (dist < minDist) {
        const overlap = minDist - dist;

        const nx = dx / dist;
        const ny = dy / dist;

        const aIsPlayer = players.includes(a);
        const bIsPlayer = players.includes(b);

        let pushA = 0.5;
        let pushB = 0.5;

        if (aIsPlayer && !bIsPlayer) {
          pushA = 0.35;
          pushB = 0.65;
        } else if (!aIsPlayer && bIsPlayer) {
          pushA = 0.65;
          pushB = 0.35;
        }

        if (a.boss) {
          pushA = 0.2;
          pushB = 0.8;
        }

        if (b.boss) {
          pushA = 0.8;
          pushB = 0.2;
        }

        a.x -= nx * overlap * pushA;
        a.y -= ny * overlap * pushA;

        b.x += nx * overlap * pushB;
        b.y += ny * overlap * pushB;

        a.x = clamp(a.x, a.w / 2 + 8, W - a.w / 2 - 8);
        a.y = clamp(a.y, a.h / 2 + 8, H - a.h / 2 - 8);

        b.x = clamp(b.x, b.w / 2 + 8, W - b.w / 2 - 8);
        b.y = clamp(b.y, b.h / 2 + 8, H - b.h / 2 - 8);
      }
    }
  }
}

function spawnEnemy() {
  const diff = getDifficulty();
  const maxAllowed = Math.min(MAX_ENEMIES, diff.maxEnemies);

  if (enemies.length >= maxAllowed) return;

  const base = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  const scale = 1 + (level - 1) * 0.10 + (wave - 1) * 0.035;

  const edge = Math.floor(Math.random() * 4);

  let x;
  let y;

  if (edge === 0) {
    x = -70;
    y = Math.random() * H;
  } else if (edge === 1) {
    x = W + 70;
    y = Math.random() * H;
  } else if (edge === 2) {
    x = Math.random() * W;
    y = -70;
  } else {
    x = Math.random() * W;
    y = H + 70;
  }

  enemies.push({
    x,
    y,
    w: base.w,
    h: base.h,
    angle: 0,
    turret: 0,
    hp: Math.round(base.hp * scale),
    maxHp: Math.round(base.hp * scale),
    speed: (base.speed + level * 3 + wave) * diff.enemySpeed,
    reload: Math.max(0.65, (base.reload - level * 0.015) * diff.enemyReload),
    reloadLeft: Math.random() * 1.2,
    damage: Math.round(base.damage * scale * diff.enemyDamage),
    bulletSpeed: (base.bulletSpeed + level * 8) * diff.bulletSpeed,
    c1: base.c1,
    c2: base.c2,
    name: base.name,
    score: base.score,
    kind: base.kind,
    boss: false
  });
}

function spawnBoss() {
  const diff = getDifficulty();

  if (bossAlive || enemies.length >= MAX_ENEMIES) return;

  bossAlive = true;

  const bossHp = Math.round((520 + level * 80 + wave * 30) * diff.bossHp);

  enemies.push({
    x: W + 120,
    y: H / 2,
    w: 105,
    h: 130,
    angle: Math.PI,
    turret: Math.PI,
    hp: bossHp,
    maxHp: bossHp,
    speed: (95 + level * 2) * diff.enemySpeed,
    reload: Math.max(0.55, (0.86 - level * 0.008) * diff.enemyReload),
    reloadLeft: 1,
    damage: Math.round((28 + level * 2) * diff.enemyDamage),
    bulletSpeed: (760 + level * 10) * diff.bulletSpeed,
    c1: "#230000",
    c2: "#ff3e4e",
    name: "Kara Komutan",
    score: 700,
    kind: "boss",
    boss: true
  });

  showOverlay(
    "BOSS GELDİ",
    "<b>Kara Komutan</b> arenaya giriş yaptı. 5. dalga boss savaşı başladı.",
    "Savaşa Devam",
    false
  );

  setTimeout(() => {
    if (!gameOver && !choosingUpgrade) overlay.classList.remove("active");
  }, 1300);

  soundExplosion(true);
  shake = 18;
}

function shoot(shooter, owner) {
  if (owner === "player" && !shooter.alive) return;

  const ang = shooter.turret;
  const dist = shooter.h * 0.52;

  const x = shooter.x + Math.cos(ang) * dist;
  const y = shooter.y + Math.sin(ang) * dist;

  const style = owner === "player" ? shooter.style : shooter.boss ? "heavy" : "enemy";

  const color = owner === "player"
    ? style === "laser"
      ? "#8fffff"
      : style === "plasma"
      ? "#db8cff"
      : style === "heavy"
      ? "#ffba55"
      : "#ffe66d"
    : shooter.boss
    ? "#ff5264"
    : "#ff8b6d";

  bullets.push({
    x,
    y,
    vx: Math.cos(ang) * shooter.bulletSpeed,
    vy: Math.sin(ang) * shooter.bulletSpeed,
    r: owner === "player" ? shooter.radius : shooter.boss ? 8 : 5,
    damage: shooter.damage,
    owner,
    playerId: owner === "player" ? shooter.id : null,
    style,
    color,
    life: 2.4,
    trail: []
  });

  soundShoot(style);
}

function update(dt) {
  if (!running || paused || gameOver || choosingUpgrade || currentScreen !== "game") return;

  waveTimer += dt;

  if (waveTimer >= 30) {
    waveTimer = 0;
    wave++;

    players.forEach(p => {
      if (p.alive) p.hp = Math.min(p.maxHp, p.hp + 24);
    });

    spawnText(W / 2, 90, "DALGA " + wave, "#8fffff");

    if (wave % 5 === 0 && !bossAlive) {
      spawnBoss();
    }
  }

  players.forEach(p => updatePlayer(p, dt));

  spawnTimer += dt;

  const diff = getDifficulty();
  const delay = Math.max(1.15, (3.0 - level * 0.06 - wave * 0.03) * diff.spawnDelay);

  if (spawnTimer >= delay) {
    spawnTimer = 0;
    spawnEnemy();
  }

  for (const e of enemies) updateEnemy(e, dt);

  resolveTankCollisions();

  updateBullets(dt);
  updateParticles(dt);
  updatePickups(dt);

  shake = Math.max(0, shake - dt * 18);

  updateHud();
}

function updatePlayer(p, dt) {
  if (!p.alive) return;

  let mx = 0;
  let my = 0;

  if (keys[p.controls.up]) my--;
  if (keys[p.controls.down]) my++;
  if (keys[p.controls.left]) mx--;
  if (keys[p.controls.right]) mx++;

  const len = Math.hypot(mx, my);

  if (len) {
    mx /= len;
    my /= len;

    p.angle = Math.atan2(my, mx);
    p.turret = p.angle;
  }

  moveEntity(p, mx * p.speed * dt, my * p.speed * dt);

  p.reloadLeft -= dt;

  if (keys[p.controls.fire] && p.reloadLeft <= 0) {
    p.reloadLeft = p.reload;
    shoot(p, "player");
  }
}

function getAlivePlayers() {
  return players.filter(p => p.alive);
}

function findNearestAlivePlayer(enemy) {
  const alive = getAlivePlayers();

  if (!alive.length) return null;

  let nearest = alive[0];
  let bestDistance = Infinity;

  for (const p of alive) {
    const d = Math.hypot(p.x - enemy.x, p.y - enemy.y);

    if (d < bestDistance) {
      bestDistance = d;
      nearest = p;
    }
  }

  return nearest;
}

function updateEnemy(e, dt) {
  const target = findNearestAlivePlayer(e);
  if (!target) return;

  const diff = getDifficulty();

  const dx = target.x - e.x;
  const dy = target.y - e.y;
  const d = Math.hypot(dx, dy) || 1;

  let mx = dx / d;
  let my = dy / d;

  if (e.kind === "sniper" && d < 430) {
    mx *= -1;
    my *= -1;
  }

  if (e.boss && d < 330) {
    mx *= 0.4;
    my *= 0.4;
  }

  e.angle = Math.atan2(my, mx);

  const aimError = (Math.random() - 0.5) * diff.aimError;
  e.turret = Math.atan2(dy, dx) + aimError;

  moveEntity(e, mx * e.speed * dt, my * e.speed * dt);

  e.reloadLeft -= dt;

  if (e.reloadLeft <= 0) {
    e.reloadLeft = e.reload;
    shoot(e, "enemy");

    if (e.boss && selectedDifficulty !== "veryEasy") {
      const old = e.turret;

      e.turret = old - 0.18;
      shoot(e, "enemy");

      e.turret = old + 0.18;
      shoot(e, "enemy");

      e.turret = old;
    }
  }

  if (Math.hypot(target.x - e.x, target.y - e.y) < (target.w + e.w) * 0.42) {
    damagePlayer(target, e.boss ? 22 * dt : 14 * dt);
  }
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    b.life -= dt;

    b.trail.push({ x: b.x, y: b.y, life: 0.18 });

    if (b.trail.length > 12) b.trail.shift();

    b.trail.forEach(t => t.life -= dt);
    b.trail = b.trail.filter(t => t.life > 0);

    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.life <= 0 || b.x < -60 || b.x > W + 60 || b.y < -60 || b.y > H + 60) {
      bullets.splice(i, 1);
      continue;
    }

    let removed = false;

    for (const o of obstacles) {
      if (circleRect(b.x, b.y, b.r, o.x, o.y, o.w, o.h)) {
        impact(b.x, b.y, b.color, b.style === "heavy" ? 16 : 9);
        bullets.splice(i, 1);
        removed = true;
        break;
      }
    }

    if (removed) continue;

    if (b.owner === "player") {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];

        if (hitTank(b, e)) {
          e.hp -= b.damage;

          spawnText(e.x, e.y - e.h / 2 - 24, "-" + Math.round(b.damage), "#ffd27d");
          impact(b.x, b.y, b.color, b.style === "heavy" ? 18 : 10);
          soundHit();

          bullets.splice(i, 1);
          removed = true;

          if (e.hp <= 0) destroyEnemy(j);

          break;
        }
      }
    } else {
      for (const p of players) {
        if (p.alive && hitTank(b, p)) {
          impact(b.x, b.y, "#ff8f79", b.style === "heavy" ? 16 : 9);
          bullets.splice(i, 1);
          removed = true;
          damagePlayer(p, b.damage);
          break;
        }
      }
    }

    if (removed) continue;
  }
}

function damagePlayer(p, amount) {
  if (!p.alive) return;

  p.hp -= amount;

  if (amount >= 1) {
    spawnText(p.x, p.y - p.h / 2 - 22, "-" + Math.round(amount), "#ff8b8b");
  }

  shake = Math.max(shake, 5);

  if (p.hp <= 0) {
    p.hp = 0;
    p.alive = false;
    explosion(p.x, p.y, true);
    spawnText(p.x, p.y - 40, `${p.id}. OYUNCU DÜŞTÜ`, "#ff8b8b");
  }

  if (getAlivePlayers().length === 0) {
    endGame();
  }

  updateHud();
}

function destroyEnemy(index) {
  const e = enemies[index];

  if (e.boss) {
    bossAlive = false;
    score += e.score;

    healAlivePlayers(60);

    explosion(e.x, e.y, true);
    spawnText(e.x, e.y - 60, "BOSS YOK EDİLDİ", "#ffdf7a");
    spawnText(e.x, e.y - 85, "+60 CAN", "#7dff9d");

    shake = 22;
  } else {
    score += e.score;

    healAlivePlayers(18);

    explosion(e.x, e.y, false);
    spawnText(e.x, e.y - 55, "+18 CAN", "#7dff9d");

    if (Math.random() < 0.35) spawnPickup(e.x, e.y);

    shake = Math.max(shake, 8);
  }

  enemies.splice(index, 1);
  kills++;

  const newLevel = Math.floor(score / 520) + 1;

  if (newLevel > level) {
    level = newLevel;
    updateHud();
    openUpgrade();
  }

  updateHud();
}

function healAlivePlayers(amount) {
  players.forEach(p => {
    if (!p.alive) return;

    p.hp = Math.min(p.maxHp, p.hp + amount);
  });
}

function endGame() {
  gameOver = true;
  paused = true;

  showOverlay(
    "Oyun Bitti",
    `Skorunuz: <b>${score}</b><br>Seviye: <b>${level}</b><br>Dalga: <b>${wave}</b>`,
    "Yeniden Başlat",
    false
  );
}

function spawnPickup(x, y) {
  pickups.push({
    x,
    y,
    r: 13,
    type: Math.random() < 0.55 ? "repair" : "power",
    life: 9
  });
}

function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];

    p.life -= dt;

    for (const player of players) {
      if (!player.alive) continue;

      if (Math.hypot(player.x - p.x, player.y - p.y) < 38) {
        if (p.type === "repair") {
          player.hp = Math.min(player.maxHp, player.hp + 45);
          spawnText(p.x, p.y - 16, "+CAN", "#7dff9d");
        } else {
          player.reloadLeft = 0;
          player.damage *= 1.015;
          spawnText(p.x, p.y - 16, "GÜÇ", "#8fffff");
        }

        soundPower();
        pickups.splice(i, 1);
        updateHud();
        break;
      }
    }

    if (p.life <= 0) pickups.splice(i, 1);
  }
}

function impact(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 70 + Math.random() * 220;

    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      size: 2 + Math.random() * 4,
      color,
      life: 0.25 + Math.random() * 0.35,
      max: 0.6,
      gravity: 0
    });
  }
}

function explosion(x, y, big = false) {
  const count = big ? 48 : 24;

  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = (big ? 90 : 55) + Math.random() * (big ? 320 : 200);
    const color = i % 4 === 0 ? "#8b8f93" : i % 3 === 0 ? "#ff573c" : "#ffd166";

    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      size: (big ? 4 : 3) + Math.random() * (big ? 10 : 5),
      color,
      life: 0.42 + Math.random() * (big ? 0.75 : 0.38),
      max: 1,
      gravity: 85
    });
  }

  soundExplosion(big);
}

function spawnText(x, y, text, color) {
  texts.push({
    x,
    y,
    text,
    color,
    life: 0.85,
    max: 0.85
  });
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.life -= dt;
    p.vy += (p.gravity || 0) * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.985;
    p.vy *= 0.985;

    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];

    t.life -= dt;
    t.y -= 28 * dt;

    if (t.life <= 0) texts.splice(i, 1);
  }
}

function draw() {
  ctx.save();

  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  }

  drawBackground();

  obstacles.forEach(drawObstacle);
  pickups.forEach(drawPickup);
  enemies.forEach(e => drawTank(e, false));

  players.forEach(p => {
    if (p.alive) {
      drawTank(p, true);
    } else {
      drawDeadTank(p);
    }
  });

  drawBullets();
  drawParticles();
  drawTexts();
  drawVignette();

  ctx.restore();
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);

  g.addColorStop(0, "#2d4825");
  g.addColorStop(0.55, "#23391e");
  g.addColorStop(1, "#162713");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,.035)";
  ctx.lineWidth = 1;

  for (let x = 0; x < W; x += 55) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  for (let y = 0; y < H; y += 55) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  for (let i = 0; i < 70; i++) {
    const x = (i * 271) % W;
    const y = (i * 163) % H;

    ctx.fillStyle = `rgba(45,75,35,${0.075 + (i % 5) * 0.018})`;

    ctx.beginPath();
    ctx.arc(x, y, 16 + (i % 4) * 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

function roundRect(x, y, w, h, r, fill = true, stroke = false) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));

  ctx.beginPath();

  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);

  ctx.quadraticCurveTo(x + w, y, x + w, y + r);

  ctx.lineTo(x + w, y + h - r);

  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

  ctx.lineTo(x + r, y + h);

  ctx.quadraticCurveTo(x, y + h, x, y + h - r);

  ctx.lineTo(x, y + r);

  ctx.quadraticCurveTo(x, y, x + r, y);

  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawObstacle(o) {
  if (o.type === "crate") {
    const g = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);

    g.addColorStop(0, "#8a693b");
    g.addColorStop(1, "#5a3f22");

    ctx.fillStyle = g;
    roundRect(o.x, o.y, o.w, o.h, 16);

    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.lineWidth = 3;
    roundRect(o.x, o.y, o.w, o.h, 16, false, true);

    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.beginPath();
    ctx.moveTo(o.x + 14, o.y + 14);
    ctx.lineTo(o.x + o.w - 14, o.y + o.h - 14);
    ctx.moveTo(o.x + o.w - 14, o.y + 14);
    ctx.lineTo(o.x + 14, o.y + o.h - 14);
    ctx.stroke();
  } else {
    const g = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);

    g.addColorStop(0, "#747d80");
    g.addColorStop(1, "#4e5658");

    ctx.fillStyle = g;
    roundRect(o.x, o.y, o.w, o.h, 22);

    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.lineWidth = 3;
    roundRect(o.x, o.y, o.w, o.h, 22, false, true);
  }
}

function drawTank(t, isPlayer) {
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.rotate(t.angle);

  const body = ctx.createLinearGradient(-t.w / 2, -t.h / 2, t.w / 2, t.h / 2);
  body.addColorStop(0, t.c2);
  body.addColorStop(1, t.c1);

  ctx.fillStyle = "#161d24";
  roundRect(-t.w / 2 - 7, -t.h / 2 + 5, 12, t.h - 10, 6);
  roundRect(t.w / 2 - 5, -t.h / 2 + 5, 12, t.h - 10, 6);

  ctx.fillStyle = body;
  roundRect(-t.w / 2, -t.h / 2, t.w, t.h, 13);

  ctx.fillStyle = "rgba(0,0,0,.18)";
  roundRect(-t.w / 2 + 7, -t.h / 2 + 7, t.w - 14, t.h - 14, 10);

  ctx.fillStyle = body;
  roundRect(-t.w / 2 + 11, -t.h / 2 + 11, t.w - 22, t.h - 22, 9);

  ctx.fillStyle = "rgba(255,255,255,.13)";
  roundRect(t.w / 2 - 12, -t.h / 2 + 14, 4, t.h - 28, 3);

  ctx.restore();

  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.rotate(t.turret);

  ctx.fillStyle = "#202832";
  roundRect(6, -4, t.boss ? 68 : 52, t.boss ? 8 : 7, 4);

  ctx.fillStyle = "#111820";
  roundRect(t.boss ? 70 : 55, -5, 10, t.boss ? 10 : 9, 4);

  const turretGradient = ctx.createRadialGradient(-3, -3, 3, 0, 0, t.boss ? 24 : 18);
  turretGradient.addColorStop(0, "rgba(255,255,255,.20)");
  turretGradient.addColorStop(1, t.boss ? "#5b0d12" : t.c1);

  ctx.fillStyle = turretGradient;
  ctx.beginPath();
  ctx.arc(0, 0, t.boss ? 21 : 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,.32)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, t.boss ? 21 : 16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  drawTankHp(t);
  drawTankName(t);
}

function drawDeadTank(t) {
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.rotate(t.angle);

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#555";
  roundRect(-t.w / 2, -t.h / 2, t.w, t.h, 13);

  ctx.fillStyle = "#222";
  roundRect(0, -5, 45, 10, 5);

  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawTankHp(t) {
  const bw = t.boss ? 118 : 66;
  const bh = 7;
  const x = t.x - bw / 2;
  const y = t.y - t.h / 2 - 18;
  const pct = clamp(t.hp / t.maxHp, 0, 1);

  ctx.fillStyle = "rgba(0,0,0,.48)";
  roundRect(x, y, bw, bh, 99);

  const g = ctx.createLinearGradient(x, y, x + bw, y);

  if (pct > 0.6) {
    g.addColorStop(0, "#7dff9d");
    g.addColorStop(1, "#dfff5d");
  } else if (pct > 0.3) {
    g.addColorStop(0, "#ffd166");
    g.addColorStop(1, "#fff05d");
  } else {
    g.addColorStop(0, "#ff5d6c");
    g.addColorStop(1, "#ff9f5d");
  }

  ctx.fillStyle = g;
  roundRect(x, y, bw * pct, bh, 99);
}

function drawTankName(t) {
  ctx.save();

  ctx.font = t.boss ? "bold 15px Arial" : "12px Arial";
  ctx.textAlign = "center";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(0,0,0,.55)";
  ctx.fillStyle = "rgba(255,255,255,.95)";

  const y = t.y - t.h / 2 - 27;

  ctx.strokeText(t.name, t.x, y);
  ctx.fillText(t.name, t.x, y);

  ctx.restore();
}

function drawBullets() {
  bullets.forEach(b => {
    b.trail.forEach(t => {
      const a = t.life / 0.18;

      ctx.save();
      ctx.globalAlpha = a * 0.45;
      ctx.fillStyle = b.color;

      ctx.beginPath();
      ctx.arc(t.x, t.y, Math.max(1, b.r * a), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    ctx.save();

    ctx.fillStyle = b.color;

    if (b.style === "laser" || b.style === "plasma") {
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r * 2.4, b.r, Math.atan2(b.vy, b.vx), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawParticles() {
  particles.forEach(p => {
    const a = clamp(p.life / p.max, 0, 1);

    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawTexts() {
  texts.forEach(t => {
    const a = clamp(t.life / t.max, 0, 1);

    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.font = "bold 17px Arial";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,.55)";
    ctx.fillStyle = t.color;

    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);

    ctx.restore();
  });
}

function drawPickup(p) {
  ctx.save();
  ctx.translate(p.x, p.y);

  ctx.fillStyle = p.type === "repair" ? "#7dff9d" : "#8fffff";

  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,.45)";
  ctx.font = "bold 15px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.type === "repair" ? "+" : "⚡", 0, 1);

  ctx.restore();
}

function drawVignette() {
  const g = ctx.createRadialGradient(W / 2, H / 2, 220, W / 2, H / 2, H * 0.8);

  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,.32)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function loop(ts) {
  const dt = Math.min(0.033, (ts - lastTime) / 1000 || 0);

  lastTime = ts;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

$("playBtn").onclick = () => {
  unlockAudio();
  showScreen("mode");
};

$("onePlayerBtn").onclick = () => startModeSelection(1);
$("twoPlayerBtn").onclick = () => startModeSelection(2);

$("modeBackBtn").onclick = () => showScreen("menu");

$("backModeBtn").onclick = () => {
  if (playerCount === 2 && choosingPlayer === 2) {
    choosingPlayer = 1;
    updateSelectHeader();
  } else {
    showScreen("mode");
  }
};

$("difficultyBackBtn").onclick = () => {
  showScreen("select");
};

document.querySelectorAll(".difficulty-card").forEach(card => {
  card.onclick = () => {
    selectDifficulty(card.dataset.difficulty);
  };
});

$("howBtn").onclick = () => showScreen("how");
$("howBackBtn").onclick = () => showScreen("menu");

$("pauseBtn").onclick = () => setPause(!paused);
$("restartBtn").onclick = () => startGame();

$("toMenuBtn").onclick = () => {
  running = false;
  showScreen("menu");
};

overlayMenuBtn.onclick = () => {
  overlay.classList.remove("active");
  running = false;
  showScreen("menu");
};

overlayMainBtn.onclick = () => {
  if (gameOver) {
    startGame();
  } else {
    setPause(false);
  }
};

window.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();

  if (e.code === "Space") {
    keys[" "] = true;
    e.preventDefault();
    return;
  }

  if (e.key === "Shift") {
    keys["shift"] = true;
    e.preventDefault();
    return;
  }

  keys[key] = true;

  if (key === "p") {
    setPause(!paused);
  }
});

window.addEventListener("keyup", e => {
  const key = e.key.toLowerCase();

  if (e.code === "Space") {
    keys[" "] = false;
    e.preventDefault();
    return;
  }

  if (e.key === "Shift") {
    keys["shift"] = false;
    e.preventDefault();
    return;
  }

  keys[key] = false;
});

buildTankCards();
showScreen("menu");
requestAnimationFrame(loop);
