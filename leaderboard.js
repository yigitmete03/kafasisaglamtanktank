(function () {
  const STORAGE_KEY = "tankArenaEliteLeaderboard_v3";

  let pendingDifficultyCard = null;

  let playerNames = {
    p1: "Oyuncu 1",
    p2: "Oyuncu 2"
  };

  let lastSavedSignature = "";

  const modal = document.getElementById("nameModal");
  const p1Input = document.getElementById("playerOneNameInput");
  const p2Input = document.getElementById("playerTwoNameInput");
  const p2Group = document.getElementById("playerTwoNameGroup");
  const startBtn = document.getElementById("nameStartBtn");
  const cancelBtn = document.getElementById("nameCancelBtn");
  const list = document.getElementById("leaderboardList");
  const clearBtn = document.getElementById("clearLeaderboardBtn");

  if (!modal || !p1Input || !p2Input || !p2Group || !startBtn || !cancelBtn) {
    console.warn("Leaderboard sistemi için gerekli HTML elemanları bulunamadı.");
    return;
  }

  function cleanName(value, fallback) {
    const name = String(value || "").trim();
    if (!name) return fallback;
    return name.slice(0, 18);
  }

  function getBoard() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveBoard(board) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board.slice(0, 20)));
  }

  function escapeHTML(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isTwoPlayerModeBeforeGame() {
    const title = document.getElementById("selectTitle");
    const titleText = title ? title.textContent : "";

    if (titleText.includes("2.")) return true;

    const cards = document.querySelectorAll(".tank-card");
    if (cards.length && titleText.includes("2")) return true;

    return false;
  }

  function isTwoPlayerModeInGame() {
    const p2Hud = document.getElementById("p2Hud");
    return p2Hud && !p2Hud.classList.contains("hidden");
  }

  function getModeLabel() {
    return isTwoPlayerModeInGame() ? "2 Oyuncu Co-op" : "Tek Oyuncu";
  }

  function getPlayerLabel() {
    if (isTwoPlayerModeInGame()) {
      return `${playerNames.p1} & ${playerNames.p2}`;
    }

    return playerNames.p1;
  }

  function getTextNumber(id, fallback = 0) {
    const el = document.getElementById(id);
    if (!el) return fallback;

    const n = Number(String(el.textContent || "").trim());
    return Number.isFinite(n) ? n : fallback;
  }

  function getDifficultyLabel() {
    const el = document.getElementById("difficultyText");
    return el ? String(el.textContent || "Orta").trim() : "Orta";
  }

  function openNameModal(card) {
    pendingDifficultyCard = card;

    const isTwo = isTwoPlayerModeBeforeGame();

    p2Group.style.display = isTwo ? "grid" : "none";

    p1Input.value = playerNames.p1 === "Oyuncu 1" ? "" : playerNames.p1;
    p2Input.value = playerNames.p2 === "Oyuncu 2" ? "" : playerNames.p2;

    modal.classList.add("active");

    setTimeout(() => p1Input.focus(), 50);
  }

  function closeNameModal() {
    modal.classList.remove("active");
    pendingDifficultyCard = null;
  }

  function startGameAfterName() {
    if (!pendingDifficultyCard) return;

    playerNames.p1 = cleanName(p1Input.value, "Oyuncu 1");

    if (p2Group.style.display !== "none") {
      playerNames.p2 = cleanName(p2Input.value, "Oyuncu 2");
    } else {
      playerNames.p2 = "Oyuncu 2";
    }

    const card = pendingDifficultyCard;
    closeNameModal();

    const difficultyKey = card.dataset.difficulty;

    if (typeof selectDifficulty === "function") {
      selectDifficulty(difficultyKey);
    } else {
      console.error("selectDifficulty fonksiyonu bulunamadı. game.js yüklenmemiş olabilir.");
      alert("Oyun başlatılamadı. game.js dosyasında hata var. F12 > Console ekranını at.");
    }
  }

  function renderLeaderboard() {
    if (!list) return;

    const board = getBoard().slice(0, 10);

    if (!board.length) {
      list.innerHTML = `<div class="leaderboard-empty">Henüz skor yok. İlk rekoru sen kır.</div>`;
      return;
    }

    list.innerHTML = board.map((item, index) => {
      return `
        <div class="leaderboard-item">
          <div class="leaderboard-rank">${index + 1}</div>

          <div>
            <div class="leaderboard-name">${escapeHTML(item.name)}</div>
            <span class="leaderboard-meta">
              ${escapeHTML(item.mode)} • ${escapeHTML(item.difficulty)} • Dalga ${item.wave} • Seviye ${item.level}
            </span>
          </div>

          <div class="leaderboard-score">${item.score}</div>
        </div>
      `;
    }).join("");
  }

  function addScoreToBoard() {
    const score = getTextNumber("scoreText", 0);
    const wave = getTextNumber("waveText", 1);
    const level = getTextNumber("levelText", 1);
    const difficulty = getDifficultyLabel();

    const signature = `${getPlayerLabel()}-${score}-${wave}-${level}-${difficulty}`;

    if (signature === lastSavedSignature) return;

    lastSavedSignature = signature;

    const board = getBoard();

    board.push({
      name: getPlayerLabel(),
      score,
      wave,
      level,
      difficulty,
      mode: getModeLabel(),
      date: new Date().toLocaleString("tr-TR")
    });

    board.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.wave !== a.wave) return b.wave - a.wave;
      return b.level - a.level;
    });

    saveBoard(board);
    renderLeaderboard();
  }

  function watchGameOver() {
    const overlayTitle = document.getElementById("overlayTitle");
    if (!overlayTitle) return;

    const observer = new MutationObserver(() => {
      const title = String(overlayTitle.textContent || "").trim();

      if (title === "Oyun Bitti") {
        setTimeout(addScoreToBoard, 150);
      }
    });

    observer.observe(overlayTitle, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function replaceDifficultyClicks() {
    document.querySelectorAll(".difficulty-card").forEach(card => {
      card.onclick = null;

      card.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openNameModal(card);
      });
    });
  }

  function bindButtons() {
    startBtn.addEventListener("click", startGameAfterName);
    cancelBtn.addEventListener("click", closeNameModal);

    p1Input.addEventListener("keydown", e => {
      if (e.key === "Enter") startGameAfterName();
    });

    p2Input.addEventListener("keydown", e => {
      if (e.key === "Enter") startGameAfterName();
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        const ok = confirm("Skor tablosunu temizlemek istiyor musun?");
        if (!ok) return;

        localStorage.removeItem(STORAGE_KEY);
        renderLeaderboard();
      });
    }
  }

  function init() {
    replaceDifficultyClicks();
    bindButtons();
    renderLeaderboard();
    watchGameOver();
  }

  init();
})();
