const $ = id => document.getElementById(id);

const menu = $("menu");
const mode = $("mode");
const select = $("select");
const difficulty = $("difficulty");
const how = $("how");
const market = $("market");
const missionsScreen = $("missions");
const dailyScreen = $("daily");
const mapsScreen = $("maps");
const gameScreen = $("gameScreen");

const tankGrid = $("tankGrid");
const marketGrid = $("marketGrid");
const missionsGrid = $("missionsGrid");
const mapsGrid = $("mapsGrid");
const marketCoinText = $("marketCoinText");
const dailyRewardText = $("dailyRewardText");
const dailyStreakText = $("dailyStreakText");

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
const coinText = $("coinText");

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
let coins = [];
let zones = [];
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
let bossKills = 0;
let spawnTimer = 0;
let waveTimer = 0;
let shake = 0;
let lastTime = 0;
let prepText = "";
let prepTimer = 0;

let audioCtx = null;
let audioReady = false;

let activeShopTab = "tanks";

let coinBalance = Number(localStorage.getItem("tankArenaCoins") || 0);
let ownedTanks = JSON.parse(localStorage.getItem("tankArenaOwnedTanks") || '["vanguard","raptor","titan","phantom"]');
let tankCustoms = JSON.parse(localStorage.getItem("tankArenaTankCustoms") || "{}");
let tankXP = JSON.parse(localStorage.getItem("tankArenaTankXP") || "{}");
let permUpgrades = JSON.parse(localStorage.getItem("tankArenaPermUpgrades") || "{}");
let unlockedSkins = JSON.parse(localStorage.getItem("tankArenaUnlockedSkins") || '["default"]');
let selectedSkins = JSON.parse(localStorage.getItem("tankArenaSelectedSkins") || "{}");
let claimedMissions = JSON.parse(localStorage.getItem("tankArenaClaimedMissions") || "[]");
let missionStats = JSON.parse(localStorage.getItem("tankArenaMissionStats") || "{}");
let dailyData = JSON.parse(localStorage.getItem("tankArenaDaily") || "{}");
let selectedMap = localStorage.getItem("tankArenaSelectedMap") || "forest";

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
    bossHp: 0.70,
    coin: 0.75
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
    bossHp: 0.85,
    coin: 0.85
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
    bossHp: 1.00,
    coin: 1.00
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
    bossHp: 1.18,
    coin: 1.08
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
    bossHp: 1.38,
    coin: 1.18
  }
};

const tankTypes = {
  vanguard: {
    name: "Mavi Vanguard",
    desc: "Dengeli, sağlam ve güvenli seçim. Yeteneği: 3 saniye kalkan.",
    c1: "#1f74ff",
    c2: "#77e6ff",
    hp: 150,
    speed: 275,
    reload: 0.22,
    damage: 18,
    bulletSpeed: 900,
    radius: 5,
    style: "normal",
    ability: "shield",
    stats: { Can: 75, Hız: 70, Hasar: 60, Atış: 68 }
  },
  raptor: {
    name: "Yeşil Raptor",
    desc: "Çok hızlı lazer tankı. Yeteneği: dash.",
    c1: "#19aa55",
    c2: "#85ffaf",
    hp: 115,
    speed: 350,
    reload: 0.145,
    damage: 13,
    bulletSpeed: 1120,
    radius: 4,
    style: "laser",
    ability: "dash",
    stats: { Can: 55, Hız: 92, Hasar: 45, Atış: 92 }
  },
  titan: {
    name: "Sarı Titan",
    desc: "Ağır ve dayanıklı tank. Yeteneği: alan patlaması.",
    c1: "#b8860b",
    c2: "#ffdf65",
    hp: 230,
    speed: 210,
    reload: 0.43,
    damage: 36,
    bulletSpeed: 760,
    radius: 8,
    style: "heavy",
    ability: "blast",
    stats: { Can: 96, Hız: 42, Hasar: 94, Atış: 36 }
  },
  phantom: {
    name: "Mor Phantom",
    desc: "Enerji tankı. Yeteneği: kısa süre görünmezlik.",
    c1: "#7438ff",
    c2: "#db7cff",
    hp: 130,
    speed: 305,
    reload: 0.17,
    damage: 15,
    bulletSpeed: 1180,
    radius: 4.5,
    style: "plasma",
    ability: "cloak",
    stats: { Can: 62, Hız: 82, Hasar: 52, Atış: 84 }
  },
  nova: {
    name: "Nova X",
    desc: "Market özel tankı. Yeteneği: lazer yağmuru.",
    c1: "#00c8ff",
    c2: "#a6fff8",
    hp: 145,
    speed: 365,
    reload: 0.135,
    damage: 15,
    bulletSpeed: 1240,
    radius: 4.6,
    style: "laser",
    ability: "laserRain",
    price: 650,
    special: true,
    stats: { Can: 70, Hız: 96, Hasar: 56, Atış: 95 }
  },
  inferno: {
    name: "Inferno Rex",
    desc: "Market özel tankı. Yeteneği: ateş alanı bırakır.",
    c1: "#ff3b1f",
    c2: "#ffd166",
    hp: 260,
    speed: 215,
    reload: 0.39,
    damage: 42,
    bulletSpeed: 790,
    radius: 8.5,
    style: "heavy",
    ability: "fireZone",
    price: 900,
    special: true,
    stats: { Can: 100, Hız: 45, Hasar: 100, Atış: 42 }
  },
  frost: {
    name: "Frostbite",
    desc: "Market özel tankı. Yeteneği: düşmanları yavaşlatır.",
    c1: "#3d7cff",
    c2: "#d9f7ff",
    hp: 175,
    speed: 300,
    reload: 0.18,
    damage: 19,
    bulletSpeed: 1040,
    radius: 5.5,
    style: "plasma",
    ability: "freeze",
    price: 800,
    special: true,
    stats: { Can: 82, Hız: 78, Hasar: 68, Atış: 82 }
  },
  void: {
    name: "Void Phantom",
    desc: "Market özel tankı. Yeteneği: ileri ışınlanır.",
    c1: "#4b008f",
    c2: "#ff7bff",
    hp: 120,
    speed: 390,
    reload: 0.125,
    damage: 14,
    bulletSpeed: 1320,
    radius: 4,
    style: "plasma",
    ability: "teleport",
    price: 1100,
    special: true,
    stats: { Can: 55, Hız: 100, Hasar: 54, Atış: 100 }
  },
  thunder: {
    name: "Thunder MK-II",
    desc: "Elektrik temalı özel tank. Yeteneği: düşmanları alanda yavaşlatır.",
    c1: "#172bff",
    c2: "#7cf7ff",
    hp: 165,
    speed: 320,
    reload: 0.19,
    damage: 21,
    bulletSpeed: 1120,
    radius: 5.4,
    style: "plasma",
    ability: "freeze",
    price: 1250,
    special: true,
    stats: { Can: 78, Hız: 85, Hasar: 76, Atış: 78 }
  },
  reaper: {
    name: "Reaper",
    desc: "Karanlık operasyon tankı. Hızlı, kırılgan ama yüksek hasarlı.",
    c1: "#111111",
    c2: "#9b5cff",
    hp: 110,
    speed: 405,
    reload: 0.14,
    damage: 22,
    bulletSpeed: 1280,
    radius: 4.4,
    style: "plasma",
    ability: "cloak",
    price: 1500,
    special: true,
    stats: { Can: 48, Hız: 100, Hasar: 84, Atış: 94 }
  },
  juggernaut: {
    name: "Juggernaut",
    desc: "Aşırı dayanıklı ağır tank. Yavaş ama kolay kolay ölmez.",
    c1: "#3a3a3a",
    c2: "#d1d1d1",
    hp: 330,
    speed: 175,
    reload: 0.48,
    damage: 48,
    bulletSpeed: 720,
    radius: 9.5,
    style: "heavy",
    ability: "shield",
    price: 1650,
    special: true,
    stats: { Can: 100, Hız: 30, Hasar: 100, Atış: 30 }
  },
  viper: {
    name: "Viper",
    desc: "Seri atışlı zehirli saldırı tankı. Çok hızlı oynanır.",
    c1: "#0b6b35",
    c2: "#b6ff63",
    hp: 135,
    speed: 380,
    reload: 0.115,
    damage: 12,
    bulletSpeed: 1350,
    radius: 4.2,
    style: "laser",
    ability: "dash",
    price: 1350,
    special: true,
    stats: { Can: 58, Hız: 98, Hasar: 50, Atış: 100 }
  },
  solaris: {
    name: "Solaris",
    desc: "Altın enerji tankı. Dengeli, pahalı ve güçlü.",
    c1: "#ff9f1c",
    c2: "#fff27a",
    hp: 210,
    speed: 285,
    reload: 0.20,
    damage: 27,
    bulletSpeed: 1080,
    radius: 6.2,
    style: "plasma",
    ability: "laserRain",
    price: 2000,
    special: true,
    stats: { Can: 88, Hız: 74, Hasar: 88, Atış: 82 }
  },
  medic: {
    name: "Medic Core",
    desc: "Destek tankı. Daha dayanıklı ve güvenli oynanır.",
    c1: "#0e8f6f",
    c2: "#a8ffd9",
    hp: 240,
    speed: 255,
    reload: 0.25,
    damage: 19,
    bulletSpeed: 940,
    radius: 5.6,
    style: "normal",
    ability: "shield",
    price: 1150,
    special: true,
    stats: { Can: 92, Hız: 64, Hasar: 64, Atış: 70 }
  }
};

const skins = {
  default: { name: "Varsayılan", price: 0, c1: null, c2: null },
  gold: { name: "Altın Kaplama", price: 500, c1: "#b8860b", c2: "#fff06a" },
  neon: { name: "Neon", price: 450, c1: "#00ffe1", c2: "#ff00f5" },
  ice: { name: "Buz", price: 400, c1: "#4aa3ff", c2: "#eaffff" },
  fire: { name: "Alev", price: 400, c1: "#ff3b1f", c2: "#ffd166" },
  blackops: { name: "Kara Operasyon", price: 650, c1: "#080b12", c2: "#5b667a" },
  camo: { name: "Askeri Kamuflaj", price: 350, c1: "#3e5f2b", c2: "#b7a46a" },
  blood: { name: "Kan Kırmızısı", price: 550, c1: "#3b0000", c2: "#ff2d2d" },
  toxic: { name: "Toxic Yeşil", price: 520, c1: "#123d18", c2: "#9dff00" },
  royal: { name: "Kraliyet Moru", price: 600, c1: "#3d0b70", c2: "#e3a7ff" },
  ocean: { name: "Okyanus", price: 480, c1: "#004e92", c2: "#00d4ff" },
  sunset: { name: "Gün Batımı", price: 500, c1: "#ff512f", c2: "#f9d423" },
  chrome: { name: "Krom", price: 750, c1: "#5d6875", c2: "#f2f6ff" },
  carbon: { name: "Karbon Fiber", price: 800, c1: "#050505", c2: "#404040" },
  galaxy: { name: "Galaksi", price: 950, c1: "#1b0036", c2: "#00c3ff" },
  emerald: { name: "Zümrüt", price: 700, c1: "#005c37", c2: "#5dffb1" }
};

const permanentUpgradeDefs = {
  hpBoost: {
    name: "Kalıcı Zırh",
    desc: "Her seviyede maksimum can +%6.",
    price: 360,
    max: 5
  },
  damageBoost: {
    name: "Kalıcı Hasar",
    desc: "Her seviyede hasar +%5.",
    price: 420,
    max: 5
  },
  speedBoost: {
    name: "Kalıcı Motor",
    desc: "Her seviyede hız +%4.",
    price: 400,
    max: 5
  },
  coinBoost: {
    name: "Coin Mıknatısı",
    desc: "Her seviyede coin kazancı +%6.",
    price: 700,
    max: 5
  },
  revive: {
    name: "Acil Revive",
    desc: "Oyunda 1 kere otomatik canlandırma verir.",
    price: 1500,
    max: 1
  },
  cooldownBoost: {
    name: "Yetenek Soğutucu",
    desc: "Her seviyede özel yetenek bekleme süresi azalır.",
    price: 650,
    max: 4
  },
  pickupBoost: {
    name: "Toplama Alanı",
    desc: "Coin ve can toplama mesafesi kalıcı artar.",
    price: 520,
    max: 4
  },
  armorTraining: {
    name: "Zırh Eğitimi",
    desc: "Alınan hasarı az miktarda azaltır.",
    price: 800,
    max: 4
  }
};

const crates = {
  bronze: {
    name: "Bronz Sandık",
    price: 180,
    minCoin: 35,
    maxCoin: 140,
    skinChance: 0.06
  },
  silver: {
    name: "Gümüş Sandık",
    price: 420,
    minCoin: 100,
    maxCoin: 330,
    skinChance: 0.14
  },
  gold: {
    name: "Altın Sandık",
    price: 850,
    minCoin: 260,
    maxCoin: 720,
    skinChance: 0.28
  },
  diamond: {
    name: "Elmas Sandık",
    price: 1500,
    minCoin: 450,
    maxCoin: 1250,
    skinChance: 0.45
  },
  military: {
    name: "Askeri Sandık",
    price: 650,
    minCoin: 150,
    maxCoin: 520,
    skinChance: 0.20
  },
  experimental: {
    name: "Deneysel Sandık",
    price: 2200,
    minCoin: 700,
    maxCoin: 1900,
    skinChance: 0.60
  }
};

const maps = {
  forest: {
    name: "Orman Üssü",
    desc: "Klasik yeşil savaş alanı.",
    bg1: "#2d4825",
    bg2: "#23391e",
    bg3: "#162713",
    obstacle: "#747d80"
  },
  desert: {
    name: "Çöl Savaşı",
    desc: "Sarı/kahverengi açık arazi.",
    bg1: "#5b4323",
    bg2: "#46321d",
    bg3: "#281c12",
    obstacle: "#8a693b"
  },
  ice: {
    name: "Buz Bölgesi",
    desc: "Soğuk, mavi ve parlak harita.",
    bg1: "#24465c",
    bg2: "#183347",
    bg3: "#0c1d2b",
    obstacle: "#8cb6c9"
  },
  volcano: {
    name: "Volkan Alanı",
    desc: "Kırmızı ve tehlikeli atmosfer.",
    bg1: "#4b1d16",
    bg2: "#34120f",
    bg3: "#170807",
    obstacle: "#6b3b2d"
  },
  night: {
    name: "Gece Operasyonu",
    desc: "Karanlık operasyon sahası.",
    bg1: "#141a2f",
    bg2: "#0d1326",
    bg3: "#050711",
    obstacle: "#4d566b"
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
  },
  {
    name: "Buz Nişancı",
    c1: "#1d4ed8",
    c2: "#bfdbfe",
    hp: 46,
    speed: 115,
    reload: 1.9,
    damage: 16,
    bulletSpeed: 840,
    w: 46,
    h: 60,
    score: 90,
    kind: "sniper"
  },
  {
    name: "Kara Akıncı",
    c1: "#101010",
    c2: "#777777",
    hp: 38,
    speed: 255,
    reload: 0.95,
    damage: 10,
    bulletSpeed: 700,
    w: 42,
    h: 54,
    score: 80,
    kind: "fast"
  },
  {
    name: "Zırhlı Komando",
    c1: "#374151",
    c2: "#d1d5db",
    hp: 105,
    speed: 88,
    reload: 1.8,
    damage: 22,
    bulletSpeed: 520,
    w: 62,
    h: 74,
    score: 120,
    kind: "heavy"
  },
  {
    name: "Plazma Avcısı",
    c1: "#581c87",
    c2: "#f0abfc",
    hp: 58,
    speed: 155,
    reload: 1.25,
    damage: 15,
    bulletSpeed: 900,
    w: 49,
    h: 62,
    score: 110,
    kind: "normal"
  }
];

const bossTypes = [
  {
    name: "Kara Komutan",
    c1: "#230000",
    c2: "#ff3e4e",
    hp: 520,
    speed: 95,
    reload: 0.86,
    damage: 28,
    bulletSpeed: 760,
    kind: "triple"
  },
  {
    name: "Demir Dev",
    c1: "#222831",
    c2: "#d0d7de",
    hp: 760,
    speed: 68,
    reload: 1.15,
    damage: 38,
    bulletSpeed: 640,
    kind: "tank"
  },
  {
    name: "Zeus Tank",
    c1: "#1d2b53",
    c2: "#7cf7ff",
    hp: 460,
    speed: 110,
    reload: 0.78,
    damage: 22,
    bulletSpeed: 850,
    kind: "electric"
  },
  {
    name: "Alev Lordu",
    c1: "#5a160b",
    c2: "#ffb347",
    hp: 560,
    speed: 100,
    reload: 0.92,
    damage: 26,
    bulletSpeed: 760,
    kind: "fire"
  },
  {
    name: "Hayalet Boss",
    c1: "#2a124f",
    c2: "#d48cff",
    hp: 430,
    speed: 150,
    reload: 0.70,
    damage: 20,
    bulletSpeed: 940,
    kind: "ghost"
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
    title: "Çift Namlu Eğitimi",
    desc: "Hasar biraz artar, mermi boyutu büyür.",
    apply: () => {
      players.forEach(p => {
        p.damage *= 1.10;
        p.radius += 0.9;
      });
    }
  },
  {
    title: "Refleks Sistemi",
    desc: "Yetenek bekleme süresi %15 azalır.",
    apply: () => {
      players.forEach(p => {
        p.abilityMaxCooldown *= 0.85;
        p.abilityCooldown = Math.min(p.abilityCooldown, p.abilityMaxCooldown);
      });
    }
  },
  {
    title: "Zırh Yenileme",
    desc: "Canın azaldığında daha dayanıklı hale gelirsin.",
    apply: () => {
      players.forEach(p => {
        p.maxHp += 18;
        p.hp = Math.min(p.maxHp, p.hp + 35);
        p.damage *= 1.04;
      });
    }
  },
  {
    title: "Keskin Nişancı Modu",
    desc: "Mermi hızı ciddi artar, hasar biraz artar.",
    apply: () => {
      players.forEach(p => {
        p.bulletSpeed *= 1.22;
        p.damage *= 1.06;
      });
    }
  },
  {
    title: "Hafif Gövde",
    desc: "Hız artar ama maksimum can biraz azalır.",
    apply: () => {
      players.forEach(p => {
        p.speed *= 1.18;
        p.maxHp *= 0.94;
        p.hp = Math.min(p.hp, p.maxHp);
      });
    }
  },
  {
    title: "Savaş Tamircisi",
    desc: "Maksimum can artar ve anlık büyük can yeniler.",
    apply: () => {
      players.forEach(p => {
        p.maxHp += 45;
        p.hp = Math.min(p.maxHp, p.hp + 100);
      });
    }
  },
  {
    title: "Plazma Çekirdeği",
    desc: "Hasar ve atış hızı dengeli artar.",
    apply: () => {
      players.forEach(p => {
        p.damage *= 1.09;
        p.reload *= 0.92;
      });
    }
  },
  {
    title: "Manyetik Toplayıcı",
    desc: "Coin ve can toplama mesafesi hissedilir biçimde artar.",
    apply: () => {
      players.forEach(p => {
        p.pickupRange = (p.pickupRange || 42) + 18;
      });
    }
  },
  {
    title: "Komutan Paketi",
    desc: "Her şeyden az az güçlenirsin.",
    apply: () => {
      players.forEach(p => {
        p.maxHp += 20;
        p.hp = Math.min(p.maxHp, p.hp + 35);
        p.damage *= 1.06;
        p.speed *= 1.06;
        p.reload *= 0.95;
      });
    }
  }
];

const missions = [
  {
    id: "kill10",
    title: "İlk Kan",
    desc: "10 düşman yok et.",
    target: 10,
    reward: 120,
    stat: "kills"
  },
  {
    id: "kill50",
    title: "Tank Avcısı",
    desc: "50 düşman yok et.",
    target: 50,
    reward: 400,
    stat: "kills"
  },
  {
    id: "boss1",
    title: "Boss Avı",
    desc: "1 boss yok et.",
    target: 1,
    reward: 250,
    stat: "bossKills"
  },
  {
    id: "coins500",
    title: "Koleksiyoncu",
    desc: "500 coin topla.",
    target: 500,
    reward: 250,
    stat: "coinsCollected"
  },
  {
    id: "wave7",
    title: "İlk Büyük Dalga",
    desc: "7. dalgaya ulaş.",
    target: 7,
    reward: 300,
    stat: "bestWave"
  },
  {
    id: "score3000",
    title: "Skor Ustası",
    desc: "3000 skor yap.",
    target: 3000,
    reward: 450,
    stat: "bestScore"
  }
];

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveAll() {
  localStorage.setItem("tankArenaCoins", String(coinBalance));
  localStorage.setItem("tankArenaOwnedTanks", JSON.stringify(ownedTanks));
  localStorage.setItem("tankArenaTankCustoms", JSON.stringify(tankCustoms));
  localStorage.setItem("tankArenaTankXP", JSON.stringify(tankXP));
  localStorage.setItem("tankArenaPermUpgrades", JSON.stringify(permUpgrades));
  localStorage.setItem("tankArenaUnlockedSkins", JSON.stringify(unlockedSkins));
  localStorage.setItem("tankArenaSelectedSkins", JSON.stringify(selectedSkins));
  localStorage.setItem("tankArenaClaimedMissions", JSON.stringify(claimedMissions));
  localStorage.setItem("tankArenaMissionStats", JSON.stringify(missionStats));
  localStorage.setItem("tankArenaDaily", JSON.stringify(dailyData));
  localStorage.setItem("tankArenaSelectedMap", selectedMap);
}

function getDifficulty() {
  return difficultySettings[selectedDifficulty] || difficultySettings.normal;
}

function getUpgradeLevel(key) {
  return Number(permUpgrades[key] || 0);
}

function getTankLevel(key) {
  const xp = Number(tankXP[key] || 0);
  return Math.floor(xp / 250) + 1;
}

function addTankXP(key, amount) {
  if (!key) return;
  tankXP[key] = Number(tankXP[key] || 0) + amount;
  saveAll();
}

function isTankOwned(key) {
  return ownedTanks.includes(key);
}

function applySkinToTank(key, tank) {
  const skinKey = selectedSkins[key] || "default";
  const skin = skins[skinKey];

  if (!skin || skinKey === "default") return tank;

  return {
    ...tank,
    c1: skin.c1 || tank.c1,
    c2: skin.c2 || tank.c2
  };
}

function getTankDisplay(key) {
  const base = tankTypes[key];
  const custom = tankCustoms[key];
  const lvl = getTankLevel(key);

  let t = {
    ...base,
    name: custom?.name || base.name,
    c1: custom?.c1 || base.c1,
    c2: custom?.c2 || base.c2
  };

  t = applySkinToTank(key, t);

  const hpMul = 1 + getUpgradeLevel("hpBoost") * 0.06 + (lvl - 1) * 0.025;
  const dmgMul = 1 + getUpgradeLevel("damageBoost") * 0.05 + (lvl - 1) * 0.02;
  const speedMul = 1 + getUpgradeLevel("speedBoost") * 0.04 + (lvl - 1) * 0.012;

  return {
    ...t,
    hp: Math.round(t.hp * hpMul),
    damage: t.damage * dmgMul,
    speed: t.speed * speedMul,
    displayLevel: lvl
  };
}

function updateCoinTexts() {
  if (marketCoinText) marketCoinText.textContent = coinBalance;
  if (coinText) coinText.textContent = coinBalance;
}

function showScreen(name) {
  currentScreen = name;

  [menu, mode, select, difficulty, how, market, missionsScreen, dailyScreen, mapsScreen, gameScreen].forEach(s => {
    if (s) s.classList.remove("active");
  });

  if (name === "menu") menu.classList.add("active");
  if (name === "mode") mode.classList.add("active");
  if (name === "select") select.classList.add("active");
  if (name === "difficulty") difficulty.classList.add("active");
  if (name === "how") how.classList.add("active");
  if (name === "market") market.classList.add("active");
  if (name === "missions") missionsScreen.classList.add("active");
  if (name === "daily") dailyScreen.classList.add("active");
  if (name === "maps") mapsScreen.classList.add("active");
  if (name === "game") gameScreen.classList.add("active");

  if (name === "market") renderMarket();
  if (name === "missions") renderMissions();
  if (name === "daily") renderDaily();
  if (name === "maps") renderMaps();

  updateCoinTexts();
}

function setShopTab(tab) {
  activeShopTab = tab;

  document.querySelectorAll(".shop-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.shopTab === tab);
  });

  renderMarket();
}

function renderMarket() {
  if (!marketGrid) return;

  updateCoinTexts();
  marketGrid.innerHTML = "";

  if (activeShopTab === "tanks") renderTankMarket();
  if (activeShopTab === "upgrades") renderUpgradeMarket();
  if (activeShopTab === "crates") renderCrateMarket();
  if (activeShopTab === "skins") renderSkinMarket();
}

function renderTankMarket() {
  Object.entries(tankTypes)
    .filter(([key, tank]) => tank.special)
    .forEach(([key, baseTank]) => {
      const t = getTankDisplay(key);
      const owned = isTankOwned(key);

      const card = document.createElement("div");
      card.className = `market-card ${owned ? "owned" : "locked"}`;
      card.style.setProperty("--tank-c1", t.c1);
      card.style.setProperty("--tank-c2", t.c2);

      const skinOptions = Object.entries(skins)
        .filter(([skinKey]) => unlockedSkins.includes(skinKey))
        .map(([skinKey, skin]) => `<option value="${skinKey}" ${selectedSkins[key] === skinKey ? "selected" : ""}>${skin.name}</option>`)
        .join("");

      card.innerHTML = `
        <h3>${escapeHTML(t.name)}</h3>
        <p>${escapeHTML(t.desc)}</p>
        <div class="market-tank-preview"></div>
        <div class="market-price">${owned ? "Satın Alındı" : `${baseTank.price} Coin`}</div>

        <div class="market-actions">
          ${
            owned
              ? `
                <input type="text" id="name_${key}" value="${escapeHTML(t.name)}" maxlength="18" placeholder="Tank ismi">
                <input type="color" id="color1_${key}" value="${t.c1}">
                <input type="color" id="color2_${key}" value="${t.c2}">
                <select id="skin_${key}">${skinOptions}</select>
                <button class="market-save-btn" data-save="${key}">Özelleştirmeyi Kaydet</button>
              `
              : `
                <button class="market-buy-btn" data-buy="${key}" ${coinBalance < baseTank.price ? "disabled" : ""}>Satın Al</button>
              `
          }
        </div>
      `;

      marketGrid.appendChild(card);
    });

  document.querySelectorAll("[data-buy]").forEach(btn => {
    btn.onclick = () => buyTank(btn.dataset.buy);
  });

  document.querySelectorAll("[data-save]").forEach(btn => {
    btn.onclick = () => saveTankCustomization(btn.dataset.save);
  });
}

function renderUpgradeMarket() {
  Object.entries(permanentUpgradeDefs).forEach(([key, up]) => {
    const lvl = getUpgradeLevel(key);
    const nextPrice = Math.round(up.price * (1 + lvl * 0.65));
    const maxed = lvl >= up.max;

    const card = document.createElement("div");
    card.className = `market-card ${maxed ? "owned" : ""}`;

    card.innerHTML = `
      <h3>${up.name}</h3>
      <p>${up.desc}</p>
      <div class="market-price">Seviye ${lvl}/${up.max}</div>
      <div class="progress-bar"><i style="width:${(lvl / up.max) * 100}%"></i></div>
      <div class="market-actions">
        <button class="market-buy-btn" data-upgrade="${key}" ${maxed || coinBalance < nextPrice ? "disabled" : ""}>
          ${maxed ? "Maksimum" : `${nextPrice} Coin'e Yükselt`}
        </button>
      </div>
    `;

    marketGrid.appendChild(card);
  });

  document.querySelectorAll("[data-upgrade]").forEach(btn => {
    btn.onclick = () => buyPermanentUpgrade(btn.dataset.upgrade);
  });
}

function renderCrateMarket() {
  Object.entries(crates).forEach(([key, crate]) => {
    const card = document.createElement("div");
    card.className = "market-card";

    card.innerHTML = `
      <h3>${crate.name}</h3>
      <p>İçinden coin, skin veya ekstra ödül çıkabilir. Skin garantisi yoktur.</p>
      <div class="market-price">${crate.price} Coin</div>
      <div class="market-actions">
        <button class="market-open-btn" data-crate="${key}" ${coinBalance < crate.price ? "disabled" : ""}>Sandık Aç</button>
      </div>
    `;

    marketGrid.appendChild(card);
  });

  document.querySelectorAll("[data-crate]").forEach(btn => {
    btn.onclick = () => openCrate(btn.dataset.crate);
  });
}

function renderSkinMarket() {
  Object.entries(skins).forEach(([key, skin]) => {
    if (key === "default") return;

    const owned = unlockedSkins.includes(key);
    const card = document.createElement("div");

    card.className = `market-card ${owned ? "owned" : "locked"}`;
    card.style.setProperty("--tank-c1", skin.c1);
    card.style.setProperty("--tank-c2", skin.c2);

    card.innerHTML = `
      <h3>${skin.name}</h3>
      <p>Satın alındıktan sonra tank özelleştirme kısmından seçilebilir.</p>
      <div class="market-tank-preview"></div>
      <div class="market-price">${owned ? "Açık" : `${skin.price} Coin`}</div>
      <div class="market-actions">
        <button class="market-buy-btn" data-skin="${key}" ${owned || coinBalance < skin.price ? "disabled" : ""}>
          ${owned ? "Satın Alındı" : "Satın Al"}
        </button>
      </div>
    `;

    marketGrid.appendChild(card);
  });

  document.querySelectorAll("[data-skin]").forEach(btn => {
    btn.onclick = () => buySkin(btn.dataset.skin);
  });
}

function buyTank(key) {
  const tank = tankTypes[key];

  if (!tank || isTankOwned(key)) return;

  if (coinBalance < tank.price) {
    alert("Yeterli coinin yok.");
    return;
  }

  coinBalance -= tank.price;
  ownedTanks.push(key);

  saveAll();
  buildTankCards();
  renderMarket();

  alert(`${tank.name} satın alındı!`);
}

function saveTankCustomization(key) {
  const nameInput = document.getElementById(`name_${key}`);
  const color1Input = document.getElementById(`color1_${key}`);
  const color2Input = document.getElementById(`color2_${key}`);
  const skinInput = document.getElementById(`skin_${key}`);
  const base = tankTypes[key];

  tankCustoms[key] = {
    name: (nameInput.value || "").trim().slice(0, 18) || base.name,
    c1: color1Input.value || base.c1,
    c2: color2Input.value || base.c2
  };

  selectedSkins[key] = skinInput.value || "default";

  saveAll();
  buildTankCards();
  renderMarket();

  alert("Tank özelleştirmesi kaydedildi.");
}

function buyPermanentUpgrade(key) {
  const up = permanentUpgradeDefs[key];
  const lvl = getUpgradeLevel(key);

  if (!up || lvl >= up.max) return;

  const price = Math.round(up.price * (1 + lvl * 0.65));

  if (coinBalance < price) {
    alert("Yeterli coinin yok.");
    return;
  }

  coinBalance -= price;
  permUpgrades[key] = lvl + 1;

  saveAll();
  renderMarket();

  alert(`${up.name} seviye ${lvl + 1} oldu.`);
}

function buySkin(key) {
  const skin = skins[key];

  if (!skin || unlockedSkins.includes(key)) return;

  if (coinBalance < skin.price) {
    alert("Yeterli coinin yok.");
    return;
  }

  coinBalance -= skin.price;
  unlockedSkins.push(key);

  saveAll();
  renderMarket();

  alert(`${skin.name} açıldı!`);
}

function openCrate(key) {
  const crate = crates[key];

  if (!crate) return;

  if (coinBalance < crate.price) {
    alert("Yeterli coinin yok.");
    return;
  }

  coinBalance -= crate.price;

  const gained = rand(crate.minCoin, crate.maxCoin);
  coinBalance += gained;

  let message = `${crate.name} açıldı!\n+${gained} Coin kazandın.`;

  if (Math.random() < crate.skinChance) {
    const lockedSkins = Object.keys(skins).filter(s => s !== "default" && !unlockedSkins.includes(s));

    if (lockedSkins.length) {
      const skinKey = lockedSkins[Math.floor(Math.random() * lockedSkins.length)];
      unlockedSkins.push(skinKey);
      message += `\nYeni skin açıldı: ${skins[skinKey].name}`;
    }
  }

  saveAll();
  renderMarket();
  alert(message);
}

function renderMissions() {
  if (!missionsGrid) return;

  missionsGrid.innerHTML = "";

  missions.forEach(m => {
    const value = Number(missionStats[m.stat] || 0);
    const done = value >= m.target;
    const claimed = claimedMissions.includes(m.id);

    const card = document.createElement("div");
    card.className = `mission-card ${claimed ? "done" : ""}`;

    card.innerHTML = `
      <h3>${m.title}</h3>
      <p>${m.desc}</p>
      <div class="progress-bar"><i style="width:${Math.min(100, (value / m.target) * 100)}%"></i></div>
      <div class="market-price">${value}/${m.target} • Ödül: ${m.reward} Coin</div>
      <div class="market-actions">
        <button class="market-buy-btn" data-mission="${m.id}" ${!done || claimed ? "disabled" : ""}>
          ${claimed ? "Alındı" : done ? "Ödülü Al" : "Tamamlanmadı"}
        </button>
      </div>
    `;

    missionsGrid.appendChild(card);
  });

  document.querySelectorAll("[data-mission]").forEach(btn => {
    btn.onclick = () => claimMission(btn.dataset.mission);
  });
}

function claimMission(id) {
  const m = missions.find(x => x.id === id);

  if (!m || claimedMissions.includes(id)) return;

  const value = Number(missionStats[m.stat] || 0);

  if (value < m.target) return;

  coinBalance += m.reward;
  claimedMissions.push(id);

  saveAll();
  renderMissions();
  updateCoinTexts();

  alert(`Görev ödülü alındı: +${m.reward} Coin`);
}

function renderDaily() {
  const today = todayKey();
  const last = dailyData.lastClaim || "";
  const streak = Number(dailyData.streak || 0);
  const reward = 150 + Math.min(6, streak) * 50;

  dailyRewardText.textContent = last === today ? "Bugün alındı" : `${reward} Coin`;
  dailyStreakText.textContent = streak;
  $("claimDailyBtn").disabled = last === today;
}

function claimDaily() {
  const today = todayKey();
  const yesterday = dateKeyOffset(-1);

  if (dailyData.lastClaim === today) {
    alert("Bugünkü ödülü zaten aldın.");
    return;
  }

  if (dailyData.lastClaim === yesterday) {
    dailyData.streak = Number(dailyData.streak || 0) + 1;
  } else {
    dailyData.streak = 1;
  }

  dailyData.lastClaim = today;

  const reward = 150 + Math.min(6, Number(dailyData.streak || 0)) * 50;

  coinBalance += reward;

  saveAll();
  renderDaily();
  updateCoinTexts();

  alert(`Günlük ödül alındı: +${reward} Coin`);
}

function renderMaps() {
  if (!mapsGrid) return;

  mapsGrid.innerHTML = "";

  Object.entries(maps).forEach(([key, map]) => {
    const card = document.createElement("div");
    card.className = `market-card ${selectedMap === key ? "owned" : ""}`;
    card.style.setProperty("--tank-c1", map.bg3);
    card.style.setProperty("--tank-c2", map.bg1);

    card.innerHTML = `
      <h3>${map.name}</h3>
      <p>${map.desc}</p>
      <div class="market-tank-preview"></div>
      <div class="market-price">${selectedMap === key ? "Seçili" : "Harita"}</div>
      <div class="market-actions">
        <button class="market-save-btn" data-map="${key}">${selectedMap === key ? "Seçili" : "Seç"}</button>
      </div>
    `;

    mapsGrid.appendChild(card);
  });

  document.querySelectorAll("[data-map]").forEach(btn => {
    btn.onclick = () => {
      selectedMap = btn.dataset.map;
      saveAll();
      renderMaps();
    };
  });
}

function buildTankCards() {
  tankGrid.innerHTML = "";

  Object.entries(tankTypes).forEach(([key, originalTank]) => {
    const t = getTankDisplay(key);
    const owned = isTankOwned(key);

    const card = document.createElement("div");
    card.className = `tank-card ${owned ? "" : "locked"}`;
    card.style.setProperty("--c1", t.c1);
    card.style.setProperty("--c2", t.c2);

    const stats = Object.entries(t.stats).map(([name, val]) => `
      <div class="stat">
        <span>${name}</span>
        <div class="meter"><i style="width:${val}%"></i></div>
      </div>
    `).join("");

    card.innerHTML = `
      <h3>${escapeHTML(t.name)}</h3>
      <p>${escapeHTML(t.desc)}</p>
      <div class="tank-art"></div>
      <div class="market-price">Tank Level ${t.displayLevel}</div>
      ${stats}
      ${owned ? "" : `<div class="market-price">Kilitli • ${originalTank.price} Coin</div>`}
    `;

    card.onclick = () => {
      if (!owned) {
        alert("Bu tank kilitli. Marketten satın almalısın.");
        showScreen("market");
        return;
      }

      selectTank(key);
    };

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
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  if (audioCtx.state === "suspended") audioCtx.resume();

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

function soundShoot(style) {
  if (style === "heavy") tone(160, 45, 0.18, "square", 0.12);
  else if (style === "laser") tone(760, 220, 0.065, "sawtooth", 0.055);
  else if (style === "plasma") tone(470, 130, 0.095, "triangle", 0.07);
  else tone(270, 85, 0.085, "square", 0.07);
}

function soundExplosion(big = false) {
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

  const p1Tank = getTankDisplay(selectedTankP1 || "vanguard");

  players.push(createPlayer({
    id: 1,
    tankKey: selectedTankP1 || "vanguard",
    x: 180,
    y: playerCount === 1 ? H / 2 : H / 2 - 70,
    tank: p1Tank,
    controls: {
      up: "w",
      down: "s",
      left: "a",
      right: "d",
      fire: " ",
      ability: "e"
    }
  }));

  if (playerCount === 2) {
    const p2Tank = getTankDisplay(selectedTankP2 || "vanguard");

    players.push(createPlayer({
      id: 2,
      tankKey: selectedTankP2 || "vanguard",
      x: 180,
      y: H / 2 + 90,
      tank: p2Tank,
      controls: {
        up: "arrowup",
        down: "arrowdown",
        left: "arrowleft",
        right: "arrowright",
        fire: "shift",
        ability: "enter"
      }
    }));
  }

  enemies = [];
  bullets = [];
  particles = [];
  texts = [];
  pickups = [];
  coins = [];
  zones = [];
  obstacles = createObstacles();

  score = 0;
  level = 1;
  wave = 1;
  kills = 0;
  bossKills = 0;
  spawnTimer = 0;
  waveTimer = 0;
  shake = 0;
  prepText = "Dalga 1 başlıyor";
  prepTimer = 2;

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
    tankKey: data.tankKey,
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
    ability: t.ability,
    abilityCooldown: 0,
    abilityMaxCooldown: Math.max(4.5, 8 - getUpgradeLevel("cooldownBoost") * 0.65),
    pickupRange: 42 + getUpgradeLevel("pickupBoost") * 12,
    damageReduction: getUpgradeLevel("armorTraining") * 0.045,
    shield: 0,
    invisible: 0,
    reviveUsed: false,
    c1: t.c1,
    c2: t.c2,
    name: t.name,
    alive: true,
    controls: data.controls
  };
}

function createObstacles() {
  if (selectedMap === "desert") {
    return [
      { x: 250, y: 140, w: 170, h: 100, type: "rock" },
      { x: 620, y: 290, w: 180, h: 115, type: "crate" },
      { x: 960, y: 145, w: 190, h: 100, type: "rock" },
      { x: 1190, y: 565, w: 180, h: 100, type: "crate" },
      { x: 330, y: 650, w: 180, h: 90, type: "rock" }
    ];
  }

  if (selectedMap === "ice") {
    return [
      { x: 360, y: 120, w: 130, h: 150, type: "rock" },
      { x: 690, y: 360, w: 170, h: 110, type: "rock" },
      { x: 1030, y: 160, w: 155, h: 135, type: "crate" },
      { x: 1170, y: 620, w: 220, h: 80, type: "rock" },
      { x: 250, y: 600, w: 160, h: 115, type: "crate" }
    ];
  }

  if (selectedMap === "volcano") {
    return [
      { x: 310, y: 160, w: 200, h: 95, type: "rock" },
      { x: 650, y: 390, w: 155, h: 155, type: "rock" },
      { x: 970, y: 130, w: 220, h: 95, type: "crate" },
      { x: 1190, y: 540, w: 140, h: 170, type: "rock" },
      { x: 260, y: 640, w: 190, h: 75, type: "crate" }
    ];
  }

  if (selectedMap === "night") {
    return [
      { x: 290, y: 130, w: 145, h: 145, type: "rock" },
      { x: 560, y: 360, w: 190, h: 100, type: "crate" },
      { x: 900, y: 190, w: 170, h: 135, type: "rock" },
      { x: 1170, y: 520, w: 190, h: 115, type: "crate" },
      { x: 710, y: 650, w: 210, h: 75, type: "rock" }
    ];
  }

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

  tankNameEl.textContent = players.map(p => {
    const abilityPercent = Math.max(0, Math.ceil(p.abilityCooldown));
    return `${p.id}P ${p.name} ${abilityPercent > 0 ? `(Yetenek ${abilityPercent}s)` : "(Yetenek hazır)"}`;
  }).join(" + ");

  waveText.textContent = wave;
  levelText.textContent = level;
  scoreText.textContent = score;
  enemyText.textContent = enemies.length;
  difficultyText.textContent = getDifficulty().label;

  updateCoinTexts();

  updateHpBar(hpFill, players[0]);

  if (playerCount === 2) updateHpBar(hpFill2, players[1]);
}

function updateHpBar(bar, p) {
  if (!bar || !p) return;

  const pct = Math.max(0, p.hp / p.maxHp) * 100;

  bar.style.width = pct + "%";

  if (!p.alive) bar.style.background = "linear-gradient(90deg,#444,#777)";
  else if (pct < 30) bar.style.background = "linear-gradient(90deg,#ff5d6c,#ff9f5d)";
  else if (pct < 60) bar.style.background = "linear-gradient(90deg,#ffd166,#fff05d)";
  else bar.style.background = "linear-gradient(90deg,#7dff9d,#dfff5d)";
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function rand(a, b) {
  return Math.floor(a + Math.random() * (b - a + 1));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dateKeyOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function updateMissionStat(key, value) {
  const old = Number(missionStats[key] || 0);

  if (key.startsWith("best")) missionStats[key] = Math.max(old, value);
  else missionStats[key] = old + value;

  saveAll();
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
  return circleRect(b.x, b.y, b.r, t.x - t.w / 2, t.y - t.h / 2, t.w, t.h);
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

      const minDist = getTankCollisionRadius(a) + getTankCollisionRadius(b);

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
    baseSpeed: (base.speed + level * 3 + wave) * diff.enemySpeed,
    reload: Math.max(0.65, (base.reload - level * 0.015) * diff.enemyReload),
    reloadLeft: Math.random() * 1.2,
    damage: Math.round(base.damage * scale * diff.enemyDamage),
    bulletSpeed: (base.bulletSpeed + level * 8) * diff.bulletSpeed,
    c1: base.c1,
    c2: base.c2,
    name: base.name,
    score: base.score,
    kind: base.kind,
    boss: false,
    slow: 0,
    invisibleTimer: 0
  });
}

function spawnBossWave() {
  prepText = "BOSS DALGASI! Tek boss geliyor";
  prepTimer = 2.4;

  spawnBoss(0);
}

function spawnBoss(index = 0) {
  const diff = getDifficulty();
  const base = bossTypes[(Math.floor(wave / 7) + index) % bossTypes.length];

  const bossHp = Math.round((base.hp + level * 80 + wave * 35) * diff.bossHp);

  enemies.push({
    x: W + 120,
    y: H / 2,
    w: 105,
    h: 130,
    angle: Math.PI,
    turret: Math.PI,
    hp: bossHp,
    maxHp: bossHp,
    speed: (base.speed + level * 2) * diff.enemySpeed,
    baseSpeed: (base.speed + level * 2) * diff.enemySpeed,
    reload: Math.max(0.55, (base.reload - level * 0.008) * diff.enemyReload),
    reloadLeft: 1,
    damage: Math.round((base.damage + level * 2) * diff.enemyDamage),
    bulletSpeed: (base.bulletSpeed + level * 10) * diff.bulletSpeed,
    c1: base.c1,
    c2: base.c2,
    name: base.name,
    score: 700 + wave * 18,
    kind: base.kind,
    boss: true,
    slow: 0,
    invisibleTimer: 0,
    fireTimer: 0,
    electricTimer: 0
  });

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
    tankKey: shooter.tankKey,
    style,
    color,
    life: 2.4,
    trail: []
  });

  soundShoot(style);
}

function update(dt) {
  if (!running || paused || gameOver || choosingUpgrade || currentScreen !== "game") return;

  prepTimer = Math.max(0, prepTimer - dt);

  waveTimer += dt;

  if (waveTimer >= 30) {
    waveTimer = 0;
    wave++;

    updateMissionStat("bestWave", wave);

    players.forEach(p => {
      if (p.alive) p.hp = Math.min(p.maxHp, p.hp + 24);
    });

    prepText = wave % 7 === 0
      ? `Dalga ${wave}: Boss dalgası`
      : `Dalga ${wave} başlıyor`;

    prepTimer = 2;

    spawnText(W / 2, 90, "DALGA " + wave, "#8fffff");

    if (wave % 7 === 0) {
      spawnBossWave();
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
  updateZones(dt);
  updateParticles(dt);
  updatePickups(dt);
  updateCoins(dt);

  shake = Math.max(0, shake - dt * 18);

  updateHud();
}

function updatePlayer(p, dt) {
  if (!p.alive) return;

  p.abilityCooldown = Math.max(0, p.abilityCooldown - dt);
  p.shield = Math.max(0, p.shield - dt);
  p.invisible = Math.max(0, p.invisible - dt);

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

  if (keys[p.controls.ability]) {
    useAbility(p);
    keys[p.controls.ability] = false;
  }
}

function useAbility(p) {
  if (!p.alive || p.abilityCooldown > 0) return;

  p.abilityCooldown = p.abilityMaxCooldown;

  if (p.ability === "shield") {
    p.shield = 3;
    spawnText(p.x, p.y - 52, "KALKAN", "#7dff9d");
  }

  if (p.ability === "dash") {
    p.x += Math.cos(p.angle) * 180;
    p.y += Math.sin(p.angle) * 180;
    p.x = clamp(p.x, p.w / 2 + 8, W - p.w / 2 - 8);
    p.y = clamp(p.y, p.h / 2 + 8, H - p.h / 2 - 8);
    impact(p.x, p.y, "#85ffaf", 24);
    spawnText(p.x, p.y - 52, "DASH", "#85ffaf");
  }

  if (p.ability === "blast") {
    enemies.forEach(e => {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < 220) {
        e.hp -= 85;
        impact(e.x, e.y, "#ffdf65", 18);
      }
    });
    explosion(p.x, p.y, true);
    spawnText(p.x, p.y - 52, "ALAN PATLAMASI", "#ffdf65");
  }

  if (p.ability === "cloak") {
    p.invisible = 2.2;
    spawnText(p.x, p.y - 52, "GÖRÜNMEZ", "#db7cff");
  }

  if (p.ability === "laserRain") {
    for (let i = -2; i <= 2; i++) {
      bullets.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(p.turret + i * 0.12) * 1450,
        vy: Math.sin(p.turret + i * 0.12) * 1450,
        r: 4.5,
        damage: p.damage * 1.35,
        owner: "player",
        playerId: p.id,
        tankKey: p.tankKey,
        style: "laser",
        color: "#8fffff",
        life: 2.4,
        trail: []
      });
    }
    spawnText(p.x, p.y - 52, "LAZER YAĞMURU", "#8fffff");
  }

  if (p.ability === "fireZone") {
    zones.push({
      x: p.x,
      y: p.y,
      r: 150,
      life: 4,
      damage: 32,
      type: "fire",
      owner: "player"
    });
    spawnText(p.x, p.y - 52, "ALEV ALANI", "#ffb347");
  }

  if (p.ability === "freeze") {
    enemies.forEach(e => {
      if (Math.hypot(e.x - p.x, e.y - p.y) < 340) {
        e.slow = 4;
      }
    });
    impact(p.x, p.y, "#d9f7ff", 44);
    spawnText(p.x, p.y - 52, "DONDURMA", "#d9f7ff");
  }

  if (p.ability === "teleport") {
    p.x += Math.cos(p.angle) * 310;
    p.y += Math.sin(p.angle) * 310;
    p.x = clamp(p.x, p.w / 2 + 8, W - p.w / 2 - 8);
    p.y = clamp(p.y, p.h / 2 + 8, H - p.h / 2 - 8);
    impact(p.x, p.y, "#ff7bff", 34);
    spawnText(p.x, p.y - 52, "TELEPORT", "#ff7bff");
  }

  soundPower();
}

function getAlivePlayers(includeInvisible = false) {
  return players.filter(p => p.alive && (includeInvisible || p.invisible <= 0));
}

function findNearestAlivePlayer(enemy) {
  let alive = getAlivePlayers(false);

  if (!alive.length) alive = getAlivePlayers(true);

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
  e.slow = Math.max(0, e.slow - dt);

  if (e.kind === "ghost") {
    e.invisibleTimer = Math.max(0, e.invisibleTimer - dt);
    if (e.invisibleTimer <= 0 && Math.random() < 0.003) e.invisibleTimer = 1.8;
  }

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

  const slowMul = e.slow > 0 ? 0.45 : 1;

  e.angle = Math.atan2(my, mx);
  e.turret = Math.atan2(dy, dx) + (Math.random() - 0.5) * diff.aimError;

  moveEntity(e, mx * e.speed * slowMul * dt, my * e.speed * slowMul * dt);

  e.reloadLeft -= dt;

  if (e.reloadLeft <= 0) {
    e.reloadLeft = e.reload;

    shoot(e, "enemy");

    if (e.boss && (e.kind === "triple" || e.kind === "tank")) {
      const old = e.turret;

      e.turret = old - 0.18;
      shoot(e, "enemy");

      e.turret = old + 0.18;
      shoot(e, "enemy");

      e.turret = old;
    }
  }

  if (e.boss && e.kind === "fire") {
    e.fireTimer = (e.fireTimer || 0) - dt;

    if (e.fireTimer <= 0) {
      e.fireTimer = 4.5;

      zones.push({
        x: e.x,
        y: e.y,
        r: 130,
        life: 3.5,
        damage: 22,
        type: "enemyFire",
        owner: "enemy"
      });
    }
  }

  if (e.boss && e.kind === "electric") {
    e.electricTimer = (e.electricTimer || 0) - dt;

    if (e.electricTimer <= 0) {
      e.electricTimer = 3.8;

      players.forEach(p => {
        if (p.alive && Math.hypot(p.x - e.x, p.y - e.y) < 240) {
          damagePlayer(p, 24);
          impact(p.x, p.y, "#7cf7ff", 16);
        }
      });
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

        if (e.invisibleTimer > 0) continue;

        if (hitTank(b, e)) {
          e.hp -= b.damage;

          spawnText(e.x, e.y - e.h / 2 - 24, "-" + Math.round(b.damage), "#ffd27d");
          impact(b.x, b.y, b.color, b.style === "heavy" ? 18 : 10);
          soundHit();

          bullets.splice(i, 1);
          removed = true;

          if (e.hp <= 0) destroyEnemy(j, b.tankKey);

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

  amount *= Math.max(0.65, 1 - (p.damageReduction || 0));

  if (p.shield > 0) {
    amount *= 0.25;
    spawnText(p.x, p.y - 40, "KALKAN", "#7dff9d");
  }

  p.hp -= amount;

  if (amount >= 1) {
    spawnText(p.x, p.y - p.h / 2 - 22, "-" + Math.round(amount), "#ff8b8b");
  }

  shake = Math.max(shake, 5);

  if (p.hp <= 0) {
    if (getUpgradeLevel("revive") > 0 && !p.reviveUsed) {
      p.reviveUsed = true;
      p.hp = Math.round(p.maxHp * 0.45);
      p.alive = true;
      explosion(p.x, p.y, false);
      spawnText(p.x, p.y - 40, "REVIVE", "#7dff9d");
      return;
    }

    p.hp = 0;
    p.alive = false;
    explosion(p.x, p.y, true);
    spawnText(p.x, p.y - 40, `${p.id}. OYUNCU DÜŞTÜ`, "#ff8b8b");
  }

  if (getAlivePlayers(true).length === 0) {
    endGame();
  }

  updateHud();
}

function destroyEnemy(index, killerTankKey = null) {
  const e = enemies[index];

  if (e.boss) {
    score += e.score;
    bossKills++;
    updateMissionStat("bossKills", 1);

    spawnCoins(e.x, e.y, 28 + Math.floor(wave * 2.5));
    healAlivePlayers(70);

    explosion(e.x, e.y, true);
    spawnText(e.x, e.y - 60, "BOSS YOK EDİLDİ", "#ffdf7a");
    spawnText(e.x, e.y - 85, "+70 CAN", "#7dff9d");

    shake = 22;
  } else {
    score += e.score;

    spawnCoins(e.x, e.y, 3 + Math.floor(level * 0.7) + Math.floor(wave * 0.45));
    healAlivePlayers(22);

    explosion(e.x, e.y, false);
    spawnText(e.x, e.y - 55, "+22 CAN", "#7dff9d");

    if (Math.random() < 0.68) spawnPickup(e.x, e.y);

    shake = Math.max(shake, 8);
  }

  enemies.splice(index, 1);
  kills++;

  updateMissionStat("kills", 1);
  updateMissionStat("bestScore", score);

  if (killerTankKey) addTankXP(killerTankKey, e.boss ? 120 : 35);
  players.forEach(p => addTankXP(p.tankKey, e.boss ? 20 : 8));

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

  updateMissionStat("bestWave", wave);
  updateMissionStat("bestScore", score);

  showOverlay(
    "Oyun Bitti",
    `Skorunuz: <b>${score}</b><br>Seviye: <b>${level}</b><br>Dalga: <b>${wave}</b><br>Öldürme: <b>${kills}</b>`,
    "Yeniden Başlat",
    false
  );
}

function spawnCoins(x, y, amount) {
  const diff = getDifficulty();
  const coinMul = diff.coin * (1 + getUpgradeLevel("coinBoost") * 0.06);

  amount = Math.round(amount * coinMul);

  const coinCount = Math.max(1, Math.min(5, Math.ceil(amount / 7)));

  for (let i = 0; i < coinCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 12 + Math.random() * 36;

    coins.push({
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      r: 9,
      value: Math.ceil(amount / coinCount),
      life: 18
    });
  }
}

function spawnPickup(x, y) {
  pickups.push({
    x,
    y,
    r: 13,
    type: Math.random() < 0.78 ? "repair" : "power",
    life: 11
  });
}

function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];

    p.life -= dt;

    for (const player of players) {
      if (!player.alive) continue;

      if (Math.hypot(player.x - p.x, player.y - p.y) < (player.pickupRange || 42)) {
        if (p.type === "repair") {
          player.hp = Math.min(player.maxHp, player.hp + 55);
          spawnText(p.x, p.y - 16, "+CAN", "#7dff9d");
        } else {
          player.reloadLeft = 0;
          player.damage *= 1.02;
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

function updateCoins(dt) {
  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];

    c.life -= dt;

    for (const player of players) {
      if (!player.alive) continue;

      if (Math.hypot(player.x - c.x, player.y - c.y) < (player.pickupRange || 42)) {
        coinBalance += c.value;

        updateMissionStat("coinsCollected", c.value);

        spawnText(c.x, c.y - 14, "+" + c.value + " COIN", "#ffd166");
        soundPower();

        coins.splice(i, 1);
        updateCoinTexts();
        saveAll();

        break;
      }
    }

    if (c.life <= 0) coins.splice(i, 1);
  }
}

function updateZones(dt) {
  for (let i = zones.length - 1; i >= 0; i--) {
    const z = zones[i];

    z.life -= dt;

    if (z.owner === "player") {
      enemies.forEach(e => {
        if (Math.hypot(e.x - z.x, e.y - z.y) < z.r) {
          e.hp -= z.damage * dt;

          if (e.hp <= 0) {
            const idx = enemies.indexOf(e);
            if (idx >= 0) destroyEnemy(idx);
          }
        }
      });
    } else {
      players.forEach(p => {
        if (p.alive && Math.hypot(p.x - z.x, p.y - z.y) < z.r) {
          damagePlayer(p, z.damage * dt);
        }
      });
    }

    if (z.life <= 0) zones.splice(i, 1);
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

  zones.forEach(drawZone);
  obstacles.forEach(drawObstacle);
  coins.forEach(drawCoin);
  pickups.forEach(drawPickup);
  enemies.forEach(e => drawTank(e, false));

  players.forEach(p => {
    if (p.alive) drawTank(p, true);
    else drawDeadTank(p);
  });

  drawBullets();
  drawParticles();
  drawTexts();
  drawPrepText();
  drawVignette();

  ctx.restore();
}

function drawBackground() {
  const map = maps[selectedMap] || maps.forest;

  const g = ctx.createLinearGradient(0, 0, 0, H);

  g.addColorStop(0, map.bg1);
  g.addColorStop(0.55, map.bg2);
  g.addColorStop(1, map.bg3);

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

    ctx.fillStyle = `rgba(255,255,255,${0.02 + (i % 5) * 0.004})`;

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
  const map = maps[selectedMap] || maps.forest;

  if (o.type === "crate") {
    const g = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);

    g.addColorStop(0, "#8a693b");
    g.addColorStop(1, "#5a3f22");

    ctx.fillStyle = g;
    roundRect(o.x, o.y, o.w, o.h, 16);
  } else {
    const g = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);

    g.addColorStop(0, map.obstacle);
    g.addColorStop(1, "#343b40");

    ctx.fillStyle = g;
    roundRect(o.x, o.y, o.w, o.h, 22);
  }

  ctx.strokeStyle = "rgba(0,0,0,.35)";
  ctx.lineWidth = 3;
  roundRect(o.x, o.y, o.w, o.h, 16, false, true);
}

function drawTank(t, isPlayer) {
  ctx.save();

  if (t.invisible > 0 || t.invisibleTimer > 0) {
    ctx.globalAlpha = 0.35;
  }

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

  if (t.invisible > 0 || t.invisibleTimer > 0) {
    ctx.globalAlpha = 0.35;
  }

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

  if (t.shield > 0) {
    ctx.save();
    ctx.strokeStyle = "rgba(125,255,157,.85)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

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

function drawCoin(c) {
  ctx.save();
  ctx.translate(c.x, c.y);

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(0, 0, c.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, c.r - 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,.55)";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("C", 0, 1);

  ctx.restore();
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

function drawZone(z) {
  ctx.save();

  ctx.globalAlpha = clamp(z.life / 4, 0.18, 0.45);
  ctx.fillStyle = z.type === "fire" || z.type === "enemyFire"
    ? "rgba(255,90,30,.55)"
    : "rgba(125,255,157,.4)";

  ctx.beginPath();
  ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPrepText() {
  if (prepTimer <= 0 || !prepText) return;

  ctx.save();

  ctx.globalAlpha = clamp(prepTimer / 2, 0, 1);
  ctx.textAlign = "center";
  ctx.font = "bold 48px Arial";
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(0,0,0,.65)";
  ctx.fillStyle = "#ffffff";

  ctx.strokeText(prepText, W / 2, 92);
  ctx.fillText(prepText, W / 2, 92);

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
  buildTankCards();
  showScreen("mode");
};

$("marketBtn").onclick = () => showScreen("market");
$("marketBackBtn").onclick = () => showScreen("menu");

$("missionsBtn").onclick = () => showScreen("missions");
$("missionsBackBtn").onclick = () => showScreen("menu");

$("dailyBtn").onclick = () => showScreen("daily");
$("dailyBackBtn").onclick = () => showScreen("menu");
$("claimDailyBtn").onclick = () => claimDaily();

$("mapsBtn").onclick = () => showScreen("maps");
$("mapsBackBtn").onclick = () => showScreen("menu");

document.querySelectorAll(".shop-tab").forEach(btn => {
  btn.onclick = () => setShopTab(btn.dataset.shopTab);
});

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

$("difficultyBackBtn").onclick = () => showScreen("select");

document.querySelectorAll(".difficulty-card").forEach(card => {
  card.onclick = () => selectDifficulty(card.dataset.difficulty);
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
  if (gameOver) startGame();
  else setPause(false);
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

  if (e.key === "Enter") {
    keys["enter"] = true;
    e.preventDefault();
    return;
  }

  keys[key] = true;

  if (key === "p") setPause(!paused);
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

  if (e.key === "Enter") {
    keys["enter"] = false;
    e.preventDefault();
    return;
  }

  keys[key] = false;
});

buildTankCards();
renderMarket();
renderMissions();
renderDaily();
renderMaps();
showScreen("menu");
requestAnimationFrame(loop);
