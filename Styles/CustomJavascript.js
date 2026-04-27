/* ╔══════════════════════════════════════════════════════════════════╗ */
/* ║             🚀 MrDib's CUSTOM JAVASCRIPT - v5.0 🚀                ║ */
/* ║      JARVIS Boot + Neural Glyph + Command Blur + Editor Fix      ║ */
/* ╚══════════════════════════════════════════════════════════════════╝ */

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🛠️ MODULE 1: SPECIAL EDITOR DETECTOR                          │ */
/* └──────────────────────────────────────────────────────────────────┘ */

(function initSpecialEditorDetector() {
  const SPECIAL_EDITORS = [
    { selector: ".settings-editor", bodyClass: "has-settings-editor" },
    { selector: ".keybindings-editor", bodyClass: "has-keybindings-editor" },
    { selector: ".gettingStartedContainer", bodyClass: "has-welcome-editor" },
    { selector: ".extension-editor", bodyClass: "has-extension-editor" },
    { selector: ".notebookOverlay", bodyClass: "has-notebook-editor" },
    { selector: ".webview", bodyClass: "has-webview-editor" },
    { selector: ".markdown-body", bodyClass: "has-markdown-preview" },
  ];

  function syncEditorClasses() {
    SPECIAL_EDITORS.forEach(({ selector, bodyClass }) => {
      document.body.classList.toggle(
        bodyClass,
        !!document.querySelector(selector),
      );
    });
  }

  /* ── Run immediately ── */
  syncEditorClasses();

  /* ── MutationObserver watches for DOM changes ── */
  new MutationObserver(syncEditorClasses).observe(document.body, {
    childList: true,
    subtree: true,
  });

  /* ── Polling fallback every 300ms ──
       Catches lazy-loaded editors that MutationObserver misses */
  setInterval(syncEditorClasses, 300);

  /* ── Also re-check when tabs are clicked ── */
  document.addEventListener("click", () => setTimeout(syncEditorClasses, 100));
  document.addEventListener("keyup", () => setTimeout(syncEditorClasses, 100));

  console.log("🛠️ MrDib: Special Editor Detector — ONLINE ✅");
})();

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🪟 MODULE 1.5: SPECIAL EDITOR FULLSCREEN GLASS                │ */
/* │   Same strategy as Command Palette — blur the WHOLE window      │ */
/* │   when Settings / Keybindings / Welcome etc. are open           │ */
/* └──────────────────────────────────────────────────────────────────┘ */

(function initSpecialEditorGlass() {
  /* ── Theme config per editor type ── */
  const EDITOR_THEMES = {
    "has-settings-editor": {
      tint: "rgba(10, 10, 20, 0.85)",
      glow: "rgba(255, 215, 0, 0.08)",
      border: "rgba(255, 215, 0, 0.25)",
    },
    "has-keybindings-editor": {
      tint: "rgba(5, 15, 8, 0.85)",
      glow: "rgba(0, 255, 136, 0.08)",
      border: "rgba(0, 255, 136, 0.25)",
    },
    "has-welcome-editor": {
      tint: "rgba(10, 5, 20, 0.85)",
      glow: "rgba(170, 0, 255, 0.08)",
      border: "rgba(170, 0, 255, 0.25)",
    },
    "has-extension-editor": {
      tint: "rgba(5, 10, 20, 0.85)",
      glow: "rgba(30, 144, 255, 0.08)",
      border: "rgba(30, 144, 255, 0.25)",
    },
    "has-markdown-preview": {
      tint: "rgba(8, 8, 20, 0.85)",
      glow: "rgba(255, 255, 255, 0.04)",
      border: "rgba(255, 255, 255, 0.15)",
    },
  };

  /* ── Inject base styles ── */
  if (!document.getElementById("special-editor-glass-styles")) {
    const s = document.createElement("style");
    s.id = "special-editor-glass-styles";
    s.textContent = `
  .special-editor-glass-overlay {
    position: fixed !important;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    transition: opacity 0.4s ease-in-out;
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
  }

  body.special-editor-active .monaco-workbench .part.editor {
    position: relative;
    z-index: 6;
  }

  body.special-editor-active .monaco-workbench .part.sidebar,
  body.special-editor-active .monaco-workbench .part.panel,
  body.special-editor-active .monaco-workbench .part.activitybar,
  body.special-editor-active .monaco-workbench .part.auxiliarybar {
    filter: blur(3px) brightness(0.6);
    transition: filter 0.4s ease-in-out;
  }

  body:not(.special-editor-active) .monaco-workbench .part.sidebar,
  body:not(.special-editor-active) .monaco-workbench .part.panel,
  body:not(.special-editor-active) .monaco-workbench .part.activitybar,
  body:not(.special-editor-active) .monaco-workbench .part.auxiliarybar {
    filter: none;
    transition: filter 0.4s ease-in-out;
  }
`;
    document.head.appendChild(s);
  }

  let overlay = null;
  let currentTheme = null;

  function activateGlass(themeKey) {
    const theme = EDITOR_THEMES[themeKey];
    if (!theme) return;

    /* Avoid re-creating if same theme */
    if (currentTheme === themeKey) return;
    currentTheme = themeKey;

    document.body.classList.add("special-editor-active");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "special-editor-glass-overlay";
      /* Insert BEFORE .monaco-workbench's children but after ::before wallpaper */
      const workbench = document.querySelector(".monaco-workbench");
      if (workbench) {
        workbench.appendChild(overlay);
      } else {
        document.body.appendChild(overlay);
      }
    }

    overlay.style.background = theme.tint;
    overlay.style.boxShadow = `0 0 80px ${theme.glow} inset`;
    overlay.style.borderTop = `1px solid ${theme.border}`;
    overlay.style.opacity = "1";
  }

  function deactivateGlass() {
    if (!currentTheme) return;
    currentTheme = null;

    document.body.classList.remove("special-editor-active");

    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay?.remove();
        overlay = null;
      }, 400);
    }
  }

  function syncGlass() {
    /* Check which special editor is active (priority order) */
    for (const themeKey of Object.keys(EDITOR_THEMES)) {
      if (document.body.classList.contains(themeKey)) {
        activateGlass(themeKey);
        return;
      }
    }
    /* No special editor active */
    deactivateGlass();
  }

  /* ── Sync whenever Module 1 updates body classes ── */
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "class") {
        syncGlass();
        return;
      }
    }
  }).observe(document.body, { attributes: true });

  /* ── Polling fallback ── */
  setInterval(syncGlass, 500);

  /* ── Initial check ── */
  syncGlass();

  console.log("🪟 MrDib: Special Editor Glass Overlay — ONLINE ✅");
})();

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🎭 MODULE 2: COMMAND PALETTE BLUR EFFECT                      │ */
/* │   ⚠️  NO DOMContentLoaded wrapper — runs immediately!           │ */
/* └──────────────────────────────────────────────────────────────────┘ */

(function initCommandPaletteBlur() {
  /* ── Inject styles immediately (no DOMContentLoaded!) ── */
  if (!document.getElementById("command-blur-styles")) {
    const blurStyles = document.createElement("style");
    blurStyles.id = "command-blur-styles";
    blurStyles.textContent = `
      body.command-palette-open .monaco-workbench .part.editor,
      body.command-palette-open .monaco-workbench .part.sidebar,
      body.command-palette-open .monaco-workbench .part.panel,
      body.command-palette-open .monaco-workbench .part.activitybar,
      body.command-palette-open .monaco-workbench .part.titlebar,
      body.command-palette-open .monaco-workbench .part.statusbar {
        filter: blur(5px) brightness(0.7);
        transition: filter 0.3s ease-in-out;
      }

      .command-dark-overlay {
        position: fixed !important;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        pointer-events: none;
        transition: opacity 0.3s ease-in-out;
      }

      body.command-palette-open .quick-input-widget {
        filter: none !important;
        z-index: 10000 !important;
        box-shadow:
          0 0 50px rgba(0, 255, 136, 0.4),
          0 0 100px rgba(0, 255, 136, 0.2) !important;
        background: rgba(10, 30, 10, 0.98) !important;
        border: 2px solid rgba(0, 255, 136, 0.5) !important;
      }

      body.command-palette-open .quick-input-widget input {
        background: rgba(0, 40, 0, 0.9) !important;
        color: #00ff88 !important;
        caret-color: #00ff88 !important;
        border: 1px solid rgba(0, 255, 136, 0.3) !important;
      }

      body.command-palette-open .quick-input-list      { background: transparent !important; }
      body.command-palette-open .monaco-list-row       { color: #00ff88 !important; }
      body.command-palette-open .label-name            { color: #00ff88 !important; }
      body.command-palette-open .label-description     { color: rgba(0, 255, 136, 0.7) !important; }
      body.command-palette-open .codicon               { color: #00ff88 !important; }

      body.command-palette-open .monaco-list-row.focused {
        background: rgba(0, 255, 136, 0.15) !important;
        border: 1px solid rgba(0, 255, 136, 0.3) !important;
      }
    `;
    document.head.appendChild(blurStyles);
  }

  let darkOverlay = null;

  function activatePaletteMode() {
    document.body.classList.add("command-palette-open");
    if (typeof CURSOR_CONFIG !== "undefined") CURSOR_CONFIG.enabled = false;
    if (!darkOverlay) {
      darkOverlay = document.createElement("div");
      darkOverlay.className = "command-dark-overlay";
      document.body.appendChild(darkOverlay);
    }
  }

  function deactivatePaletteMode() {
    document.body.classList.remove("command-palette-open");
    if (typeof CURSOR_CONFIG !== "undefined") CURSOR_CONFIG.enabled = true;
    if (darkOverlay) {
      darkOverlay.style.opacity = "0";
      setTimeout(() => {
        darkOverlay?.remove();
        darkOverlay = null;
      }, 300);
    }
  }

  /* ── Keyboard shortcut detection — added immediately ── */
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "p") {
      setTimeout(activatePaletteMode, 50);
    } else if (e.key === "Escape") {
      deactivatePaletteMode();
    }
  });

  /* ── Poll for the palette widget (can't use DOMContentLoaded!) ── */
  const checkPalette = setInterval(() => {
    const palette = document.querySelector(".quick-input-widget");
    if (!palette) return;

    clearInterval(checkPalette);
    console.log("🎭 MrDib: Command Palette found — attaching observer ✅");

    /* Check if already visible */
    if (palette.style.display !== "none") activatePaletteMode();

    /* Watch for show/hide changes */
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === "attributes" && m.attributeName === "style") {
          palette.style.display === "none"
            ? deactivatePaletteMode()
            : activatePaletteMode();
        }
      });
    }).observe(palette, { attributes: true });
  }, 300);

  console.log("🎭 MrDib: Command Palette Blur — ONLINE ✅");
})();

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🔧 MODULE 3: JARVIS BOOT SEQUENCE (Arc Reactor Edition)        │ */
/* └──────────────────────────────────────────────────────────────────┘ */

const jarvisStyle = document.createElement("style");
jarvisStyle.textContent = `
  :root {
    --stark-blue: #00d4ff;
    --arc-white: #ffffff;
    --reactor-orange: #ff6600;
    --holo-glass: rgba(0, 212, 255, 0.1);
    --text-glow: #00ff88;
    --text-accent: #ffffff;
  }

  @keyframes arcReactorBoot {
    0%   { transform: translate(-50%, -50%) scale(0) rotate(0deg);   opacity: 0; filter: brightness(2) blur(10px); }
    50%  { transform: translate(-50%, -50%) scale(1) rotate(180deg); opacity: 1; filter: brightness(1.5) blur(0px); }
    100% { transform: translate(-50%, -50%) scale(1) rotate(360deg);             filter: brightness(1) blur(0px); }
  }

  @keyframes hologramBoot {
    0%   { transform: translate(-50%, -50%) rotateX(90deg) scale(0); opacity: 0; }
    100% { transform: translate(-50%, -50%) rotateX(0deg) scale(1);  opacity: 1; }
  }

  @keyframes dataStream {
    0%   { transform: translateY(100%);  opacity: 0; }
    50%  {                               opacity: 1; }
    100% { transform: translateY(-100%); opacity: 0; }
  }

  @keyframes hudFrame {
    0%   { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);           opacity: 0; }
    25%  { clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);           opacity: 1; }
    50%  { clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%);              }
    75%  { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);                 }
    100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);     opacity: 1; }
  }

  @keyframes powerUp {
    0%   { box-shadow: 0 0 0 0 var(--stark-blue); }
    50%  { box-shadow: 0 0 20px 10px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }

  @keyframes textHologram {
    0%   { opacity: 0; transform: translateZ(-100px) rotateY(90deg); filter: blur(5px); }
    100% { opacity: 1; transform: translateZ(0) rotateY(0deg);       filter: blur(0px); }
  }

  @keyframes textGlow {
    0%, 100% {
      text-shadow:
        0 0 10px var(--text-glow), 0 0 20px var(--text-glow),
        0 0 30px var(--text-glow), 0 0 40px var(--text-accent);
    }
    50% {
      text-shadow:
        0 0 20px var(--text-glow), 0 0 30px var(--text-glow),
        0 0 40px var(--text-glow), 0 0 50px var(--text-accent),
        0 0 60px var(--text-accent);
    }
  }

  @keyframes textPanel {
    0%   { opacity: 0; transform: scaleX(0); }
    100% { opacity: 1; transform: scaleX(1); }
  }

  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

  .jarvis-boot {
    position: fixed; inset: 0;
    z-index: 100000;
    background: radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 100%);
    pointer-events: none;
    perspective: 1000px;
    overflow: hidden;
  }

  .arc-reactor {
    position: fixed; top: 50%; left: 50%;
    width: 200px; height: 200px;
    transform: translate(-50%, -50%);
    animation: arcReactorBoot 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .reactor-ring {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    border: 2px solid var(--stark-blue);
    border-radius: 50%;
    box-shadow: 0 0 20px var(--stark-blue), inset 0 0 20px var(--stark-blue);
  }

  .reactor-ring:nth-child(1) { width: 100%; height: 100%; animation: powerUp 1.8s ease-out infinite; }
  .reactor-ring:nth-child(2) { width: 70%;  height: 70%;  animation: powerUp 1.8s ease-out 0.2s infinite; }
  .reactor-ring:nth-child(3) {
    width: 40%; height: 40%;
    background: var(--stark-blue);
    box-shadow: 0 0 30px var(--stark-blue), 0 0 60px var(--arc-white);
    animation: powerUp 1.8s ease-out 0.4s infinite;
  }

  .hud-frame {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 80vw; height: 60vh;
    border: 1px solid var(--stark-blue);
    animation: hudFrame 1.2s ease-out 0.8s both;
    box-shadow: 0 0 20px var(--holo-glass), inset 0 0 20px var(--holo-glass);
  }

  .hud-corner {
    position: absolute; width: 20px; height: 20px;
    border: 2px solid var(--stark-blue);
  }

  .hud-corner::after {
    content: ''; position: absolute;
    width: 4px; height: 4px;
    background: var(--arc-white);
    box-shadow: 0 0 10px var(--arc-white);
  }

  .hud-corner.tl { top: -1px; left: -1px;   border-right: none; border-bottom: none; }
  .hud-corner.tr { top: -1px; right: -1px;  border-left: none;  border-bottom: none; }
  .hud-corner.bl { bottom: -1px; left: -1px;  border-right: none; border-top: none; }
  .hud-corner.br { bottom: -1px; right: -1px; border-left: none;  border-top: none; }

  .hud-corner.tl::after { bottom: -2px; right: -2px; }
  .hud-corner.tr::after { bottom: -2px; left: -2px; }
  .hud-corner.bl::after { top: -2px;    right: -2px; }
  .hud-corner.br::after { top: -2px;    left: -2px; }

  .holo-display {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    transform-style: preserve-3d;
    animation: hologramBoot 1.2s ease-out 1.5s both;
    text-align: center;
    z-index: 100001;
    padding: 2rem 3rem;
  }

  .text-backdrop {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%);
    border: 1px solid rgba(0, 255, 136, 0.3);
    border-radius: 10px;
    box-shadow: 0 0 30px rgba(0,255,136,0.2), inset 0 0 30px rgba(0,0,0,0.5);
    z-index: -1;
    animation: textPanel 0.5s ease-out 1.8s both;
  }

  .jarvis-text {
    font-family: 'Arial', sans-serif;
    font-weight: 300;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    white-space: nowrap;
    position: relative;
    z-index: 1;
  }

  .jarvis-text.primary {
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin-bottom: 1rem;
    color: var(--text-accent);
    font-weight: bold;
    text-shadow:
      0 0 10px var(--text-glow), 0 0 20px var(--text-glow),
      0 0 30px var(--text-glow), 0 0 40px var(--text-accent),
      0 2px 4px rgba(0,0,0,0.8);
    animation: textHologram 1s ease-out 2s both, textGlow 2s ease-in-out 3s infinite;
  }

  .jarvis-text.secondary {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    color: var(--reactor-orange);
    letter-spacing: 0.4em;
    font-weight: 400;
    animation: textHologram 1s ease-out 2.5s both;
    text-shadow:
      0 0 10px var(--reactor-orange), 0 0 20px var(--reactor-orange),
      0 0 30px #ff3300, 0 2px 4px rgba(0,0,0,0.8);
  }

  .data-viz {
    position: fixed; top: 50%; transform: translateY(-50%);
    width: 100px; height: 200px;
    display: flex; align-items: flex-end; justify-content: space-around;
    opacity: 0;
    animation: fadeIn 0.8s ease-out 2.8s both;
  }

  .data-viz.left  { left: 10%; }
  .data-viz.right { right: 10%; }

  .data-bar {
    width: 15px;
    background: linear-gradient(to top, var(--stark-blue) 0%, var(--arc-white) 100%);
    animation: dataStream 2.5s ease-in-out infinite;
    opacity: 0.7;
  }

  .data-bar:nth-child(1) { height: 60%; animation-delay: 0s; }
  .data-bar:nth-child(2) { height: 80%; animation-delay: 0.2s; }
  .data-bar:nth-child(3) { height: 40%; animation-delay: 0.4s; }
  .data-bar:nth-child(4) { height: 90%; animation-delay: 0.6s; }
  .data-bar:nth-child(5) { height: 70%; animation-delay: 0.8s; }

  .status-text {
    position: fixed; bottom: 10%; left: 50%;
    transform: translateX(-50%);
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: var(--reactor-orange);
    letter-spacing: 0.1em;
    opacity: 0;
    animation: fadeIn 0.8s ease-out 3.2s both;
  }

  .jarvis-boot.shutting-down { animation: fadeOut 1s ease-out forwards; }
`;
document.head.appendChild(jarvisStyle);

function initJarvisWelcome() {
  const jarvis = document.createElement("div");
  jarvis.className = "jarvis-boot";

  const reactor = document.createElement("div");
  reactor.className = "arc-reactor";
  reactor.innerHTML = `
    <div class="reactor-ring"></div>
    <div class="reactor-ring"></div>
    <div class="reactor-ring"></div>
  `;
  jarvis.appendChild(reactor);

  const hudFrame = document.createElement("div");
  hudFrame.className = "hud-frame";
  ["tl", "tr", "bl", "br"].forEach((pos) => {
    const corner = document.createElement("div");
    corner.className = `hud-corner ${pos}`;
    hudFrame.appendChild(corner);
  });
  jarvis.appendChild(hudFrame);

  const holoDisplay = document.createElement("div");
  holoDisplay.className = "holo-display";

  const backdrop = document.createElement("div");
  backdrop.className = "text-backdrop";
  holoDisplay.appendChild(backdrop);

  const primaryText = document.createElement("div");
  primaryText.className = "jarvis-text primary";
  primaryText.textContent = "WELCOME BACK";

  const secondaryText = document.createElement("div");
  secondaryText.className = "jarvis-text secondary";
  secondaryText.textContent = "DIBAKAR";

  holoDisplay.appendChild(primaryText);
  holoDisplay.appendChild(secondaryText);
  jarvis.appendChild(holoDisplay);

  ["left", "right"].forEach((side) => {
    const dataViz = document.createElement("div");
    dataViz.className = `data-viz ${side}`;
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement("div");
      bar.className = "data-bar";
      dataViz.appendChild(bar);
    }
    jarvis.appendChild(dataViz);
  });

  const status = document.createElement("div");
  status.className = "status-text";
  status.textContent = "SYSTEM: ONLINE";
  jarvis.appendChild(status);

  document.body.appendChild(jarvis);

  setTimeout(() => {
    jarvis.classList.add("shutting-down");
    setTimeout(() => {
      jarvis.remove();
      console.log("⎊ JARVIS: Welcome back, sir.");
    }, 1000);
  }, 4500);
}

if (!document.querySelector(".jarvis-boot")) {
  initJarvisWelcome();
}

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🧿 MODULE 4: NEURAL GLYPH CURSOR (Dimensional Rift Edition)    │ */
/* └──────────────────────────────────────────────────────────────────┘ */

const CURSOR_CONFIG = {
  enabled: true,
  maxGlyphs: 80,
  glyphLife: 1200,
  colors: {
    primary: "#00ff41",
    accent: "#00ffff",
    flash: "#ff00ff",
    core: "#ffffff",
    rift: "#ff00ff",
  },
  idleTimeout: 5000,
};

let cursorGlyphs = [];
let cursorLastPos = null;
let cursorLastMoveTime = Date.now();
let cursorIsIdle = false;
let cursorIdleAnimation = null;
let cursorVelocity = { x: 0, y: 0 };

const CURSOR_GLYPH_SYMBOLS = [
  "◢",
  "◣",
  "◤",
  "◥",
  "▵",
  "▿",
  "◊",
  "◇",
  "⬡",
  "⬢",
  "⎯",
  "⎪",
  "╱",
  "╲",
  "⟨",
  "⟩",
  "△",
  "▽",
  "⧈",
  "⧉",
];

function getCursorContextColor(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return CURSOR_CONFIG.colors.primary;
  const c = el.className;
  if (typeof c === "string") {
    if (c.includes("mtk3") || c.includes("keyword"))
      return CURSOR_CONFIG.colors.accent;
    if (c.includes("mtk10") || c.includes("string"))
      return CURSOR_CONFIG.colors.primary;
    if (c.includes("squiggly-error")) return CURSOR_CONFIG.colors.flash;
  }
  return CURSOR_CONFIG.colors.primary;
}

class CursorGlyph {
  constructor(x, y, type = "normal", velocity = null) {
    this.x = x;
    this.y = y;
    this.born = Date.now();
    this.type = type;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 3;
    this.scale = 0.8 + Math.random() * 0.4;
    this.glitchOffset = { x: 0, y: 0 };
    this.symbol =
      CURSOR_GLYPH_SYMBOLS[
        Math.floor(Math.random() * CURSOR_GLYPH_SYMBOLS.length)
      ];
    this.vx = velocity ? velocity.x : (Math.random() - 0.5) * 0.5;
    this.vy = velocity ? velocity.y : (Math.random() - 0.5) * 0.5;

    const ctx = getCursorContextColor(x, y);
    this.color =
      type === "pulse"
        ? CURSOR_CONFIG.colors.accent
        : type === "rift"
          ? CURSOR_CONFIG.colors.rift
          : ctx;

    this.el = document.createElement("div");
    this.el.className = "neural-glyph";
    this.el.textContent = this.symbol;

    Object.assign(this.el.style, {
      position: "absolute",
      left: x + "px",
      top: y + "px",
      color: this.color,
      fontSize: type === "rift" ? "16px" : "12px",
      fontFamily: "monospace",
      fontWeight: "bold",
      pointerEvents: "none",
      zIndex: "9999",
      transform: `translate(-50%, -50%) rotate(${this.rotation}deg) scale(${this.scale})`,
      textShadow: `0 0 8px ${this.color}, 0 0 12px ${this.color}`,
      willChange: "transform, opacity",
      mixBlendMode: "screen",
    });

    (document.querySelector(".monaco-editor") || document.body).appendChild(
      this.el,
    );
  }

  update() {
    const age = Date.now() - this.born;
    const maxLife =
      this.type === "pulse"
        ? 600
        : this.type === "rift"
          ? 4000
          : CURSOR_CONFIG.glyphLife;

    if (age > maxLife) {
      this.el.remove();
      return false;
    }

    const progress = age / maxLife;

    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.rotation += this.rotationSpeed;

    if (Math.random() < 0.1) {
      this.glitchOffset.x = (Math.random() - 0.5) * 2;
      this.glitchOffset.y = (Math.random() - 0.5) * 2;
    } else {
      this.glitchOffset.x *= 0.8;
      this.glitchOffset.y *= 0.8;
    }

    const opacity =
      this.type === "pulse"
        ? (1 - progress) * 0.6
        : this.type === "rift"
          ? Math.sin(progress * Math.PI)
          : 1 - progress;

    const scale =
      this.type === "pulse"
        ? this.scale * (1 + progress * 2)
        : this.type === "rift"
          ? this.scale * (1 + Math.sin(progress * Math.PI * 2) * 0.3)
          : this.scale * (1 - progress * 0.3);

    this.el.style.left = this.x + this.glitchOffset.x + "px";
    this.el.style.top = this.y + this.glitchOffset.y + "px";
    this.el.style.opacity = opacity;
    this.el.style.transform = `translate(-50%, -50%) rotate(${this.rotation}deg) scale(${scale})`;

    return true;
  }
}

class CursorPulseRing {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.born = Date.now();
    this.maxLife = 500;

    this.el = document.createElement("div");
    this.el.className = "neural-pulse";

    Object.assign(this.el.style, {
      position: "absolute",
      left: x + "px",
      top: y + "px",
      width: "10px",
      height: "10px",
      border: `2px solid ${CURSOR_CONFIG.colors.accent}`,
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: "9998",
      transform: "translate(-50%, -50%)",
      boxShadow: `0 0 15px ${CURSOR_CONFIG.colors.accent}`,
      willChange: "transform, opacity",
    });

    (document.querySelector(".monaco-editor") || document.body).appendChild(
      this.el,
    );
  }

  update() {
    const age = Date.now() - this.born;
    if (age > this.maxLife) {
      this.el.remove();
      return false;
    }

    const progress = age / this.maxLife;
    this.el.style.transform = `translate(-50%, -50%) scale(${1 + progress * 15})`;
    this.el.style.opacity = 1 - progress;
    return true;
  }
}

class CursorIdleAnimation {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.startTime = Date.now();
    this.phase = 0;
    this.orbitGlyphs = [];
    this.fieldGlyphs = [];
    this.coreGlyph = null;
    this.riftActive = false;
    this.lastSpawn = 0;
    this.createCore();
  }

  createCore() {
    this.coreGlyph = document.createElement("div");
    this.coreGlyph.className = "neural-core";
    this.coreGlyph.textContent = "◉";

    Object.assign(this.coreGlyph.style, {
      position: "absolute",
      left: this.x + "px",
      top: this.y + "px",
      color: CURSOR_CONFIG.colors.core,
      fontSize: "20px",
      fontFamily: "monospace",
      fontWeight: "bold",
      pointerEvents: "none",
      zIndex: "9998",
      transform: "translate(-50%, -50%) scale(0)",
      textShadow: `0 0 20px ${CURSOR_CONFIG.colors.accent}, 0 0 30px ${CURSOR_CONFIG.colors.primary}`,
      willChange: "transform, opacity",
      mixBlendMode: "screen",
      animation: "neural-core-pulse 2s ease-in-out infinite",
    });

    (document.querySelector(".monaco-editor") || document.body).appendChild(
      this.coreGlyph,
    );
  }

  update() {
    const elapsed = Date.now() - this.startTime;
    const now = Date.now();

    this.phase =
      elapsed > 8000 ? 3 : elapsed > 4000 ? 2 : elapsed > 1500 ? 1 : 0;

    const coreScale =
      Math.min(elapsed / 1000, 1) * (1 + Math.sin(elapsed * 0.002) * 0.1);
    this.coreGlyph.style.transform = `translate(-50%, -50%) scale(${coreScale})`;

    if (this.phase >= 0 && now - this.lastSpawn > 300) {
      this.lastSpawn = now;
      const angle = (elapsed * 0.002) % (Math.PI * 2);
      const gx = this.x + Math.cos(angle) * 30;
      const gy = this.y + Math.sin(angle) * 30;
      const g = new CursorGlyph(gx, gy, "rift");
      g.vx = -Math.cos(angle) * 0.5;
      g.vy = -Math.sin(angle) * 0.5;
      this.fieldGlyphs.push(g);
      cursorGlyphs.push(g);
    }

    if (this.phase >= 1) {
      for (let i = 0; i < 3; i++) {
        const angle = elapsed * 0.001 * (i + 1) + (i * Math.PI * 2) / 3;
        const ox = this.x + Math.cos(angle) * (25 + i * 15);
        const oy = this.y + Math.sin(angle) * (25 + i * 15);
        if (now - this.lastSpawn > 200 && this.orbitGlyphs.length < 12) {
          const g = new CursorGlyph(ox, oy, "rift");
          g.rotationSpeed = 5;
          this.orbitGlyphs.push(g);
          cursorGlyphs.push(g);
        }
      }
    }

    if (this.phase >= 2 && now - this.lastSpawn > 150) {
      this.lastSpawn = now;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + elapsed * 0.001;
        const g = new CursorGlyph(this.x, this.y, "rift", {
          x: Math.cos(angle) * 1.5,
          y: Math.sin(angle) * 1.5,
        });
        g.symbol = "⧈";
        g.color =
          i % 2 === 0 ? CURSOR_CONFIG.colors.accent : CURSOR_CONFIG.colors.rift;
        this.fieldGlyphs.push(g);
        cursorGlyphs.push(g);
      }
    }

    if (this.phase >= 3) {
      if (!this.riftActive) {
        this.riftActive = true;
        this.createRift();
      }

      if (now - this.lastSpawn > 100) {
        this.lastSpawn = now;
        const a = elapsed * 0.003;
        const r = 20 + Math.sin(elapsed * 0.002) * 10;
        const g = new CursorGlyph(
          this.x + Math.cos(a) * r,
          this.y + Math.sin(a) * r,
          "rift",
        );
        g.symbol = Math.random() > 0.5 ? "◊" : "⬡";
        g.vx = (Math.random() - 0.5) * 2;
        g.vy = (Math.random() - 0.5) * 2;
        g.rotationSpeed = (Math.random() - 0.5) * 10;
        g.scale = 0.5 + Math.random();
        this.fieldGlyphs.push(g);
        cursorGlyphs.push(g);
      }

      if (Math.random() < 0.1) {
        this.coreGlyph.style.filter = `hue-rotate(${Math.random() * 360}deg) saturate(2)`;
      } else {
        this.coreGlyph.style.filter = "none";
      }
    }

    this.fieldGlyphs = this.fieldGlyphs.filter((g) => g.update());
    return true;
  }

  createRift() {
    const rift = document.createElement("div");
    rift.className = "neural-rift";
    Object.assign(rift.style, {
      position: "absolute",
      left: this.x + "px",
      top: this.y + "px",
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: "9997",
      transform: "translate(-50%, -50%)",
      background: `radial-gradient(circle, transparent 30%, ${CURSOR_CONFIG.colors.rift}22 50%, transparent 70%)`,
      filter: "blur(2px)",
      animation: "neural-rift-pulse 3s ease-in-out infinite",
    });
    (document.querySelector(".monaco-editor") || document.body).appendChild(
      rift,
    );
    setTimeout(() => rift.remove(), 10000);
  }

  destroy() {
    this.coreGlyph?.remove();
    this.orbitGlyphs.forEach((g) => g.el?.remove());
    this.fieldGlyphs.forEach((g) => g.el?.remove());
  }
}

function getEditorCursorPos() {
  const cursor = document.querySelector(".monaco-editor .cursor");
  const editor = document.querySelector(".monaco-editor");
  if (!cursor || !editor) return null;

  const er = editor.getBoundingClientRect();
  const cr = cursor.getBoundingClientRect();

  return {
    x: cr.left - er.left + cr.width / 2,
    y: cr.top - er.top + cr.height / 2,
  };
}

function animateCursor() {
  if (CURSOR_CONFIG.enabled) {
    const pos = getEditorCursorPos();
    const now = Date.now();

    if (
      pos &&
      cursorLastPos &&
      (Math.abs(pos.x - cursorLastPos.x) > 0.1 ||
        Math.abs(pos.y - cursorLastPos.y) > 0.1)
    ) {
      cursorLastMoveTime = now;

      if (cursorIsIdle && cursorIdleAnimation) {
        cursorIsIdle = false;
        cursorIdleAnimation.destroy();
        cursorIdleAnimation = null;
      }

      const dx = pos.x - cursorLastPos.x;
      const dy = pos.y - cursorLastPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      cursorVelocity.x = dx * 0.2;
      cursorVelocity.y = dy * 0.2;

      if (distance > 100) {
        cursorGlyphs.push(
          new CursorPulseRing(cursorLastPos.x, cursorLastPos.y),
        );
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          cursorGlyphs.push(
            new CursorGlyph(pos.x, pos.y, "pulse", {
              x: Math.cos(angle) * 2,
              y: Math.sin(angle) * 2,
            }),
          );
        }
      } else if (distance > 15) {
        const n = Math.floor(distance / 8);
        for (let i = 0; i < n; i++) {
          const t = i / n;
          const g = new CursorGlyph(
            cursorLastPos.x + dx * t,
            cursorLastPos.y + dy * t,
            "fast",
            { x: cursorVelocity.x * 0.5, y: cursorVelocity.y * 0.5 },
          );
          g.rotationSpeed = (Math.random() - 0.5) * 8;
          cursorGlyphs.push(g);
        }
      } else {
        for (let i = 0; i < 2; i++) {
          cursorGlyphs.push(
            new CursorGlyph(
              pos.x + (Math.random() - 0.5) * 6,
              pos.y + (Math.random() - 0.5) * 6,
              "normal",
            ),
          );
        }
      }

      while (cursorGlyphs.length > CURSOR_CONFIG.maxGlyphs) {
        const old = cursorGlyphs.shift();
        old?.el?.remove();
      }

      cursorLastPos = pos;
    } else if (
      pos &&
      now - cursorLastMoveTime > CURSOR_CONFIG.idleTimeout &&
      !cursorIsIdle
    ) {
      cursorIsIdle = true;
      cursorIdleAnimation = new CursorIdleAnimation(pos.x, pos.y);
    }

    if (cursorIsIdle && cursorIdleAnimation) cursorIdleAnimation.update();
    if (pos) cursorLastPos = pos;
  }

  cursorGlyphs = cursorGlyphs.filter((g) => g.update());
  requestAnimationFrame(animateCursor);
}

function addCursorCoreStyle() {
  const s = document.createElement("style");
  s.textContent = `
    .monaco-editor .cursor {
      animation: neural-pulse 2s ease-in-out infinite !important;
      filter:
        drop-shadow(0 0 8px ${CURSOR_CONFIG.colors.primary})
        drop-shadow(0 0 12px ${CURSOR_CONFIG.colors.accent}) !important;
    }

    @keyframes neural-pulse {
      0%, 100% {
        filter:
          drop-shadow(0 0 6px  ${CURSOR_CONFIG.colors.primary})
          drop-shadow(0 0 10px ${CURSOR_CONFIG.colors.accent});
      }
      50% {
        filter:
          drop-shadow(0 0 12px ${CURSOR_CONFIG.colors.primary})
          drop-shadow(0 0 18px ${CURSOR_CONFIG.colors.accent})
          drop-shadow(0 0 24px ${CURSOR_CONFIG.colors.core});
      }
    }

    @keyframes neural-core-pulse {
      0%, 100% { opacity: 0.8; filter: brightness(1); }
      50%      { opacity: 1;   filter: brightness(1.5) saturate(1.5); }
    }

    @keyframes neural-rift-pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1)   rotate(0deg);   opacity: 0.4; }
      50%      { transform: translate(-50%, -50%) scale(1.2) rotate(180deg); opacity: 0.7; }
    }
  `;
  document.head.appendChild(s);
}

animateCursor();
addCursorCoreStyle();

/* Toggle Neural Glyph: Ctrl+Alt+N */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.altKey && e.key === "n") {
    CURSOR_CONFIG.enabled = !CURSOR_CONFIG.enabled;
    console.log(
      "🧿 Neural Glyph:",
      CURSOR_CONFIG.enabled ? "ACTIVATED" : "DORMANT",
    );

    if (!CURSOR_CONFIG.enabled) {
      cursorGlyphs.forEach((g) => g.el?.remove());
      cursorGlyphs = [];
      cursorIdleAnimation?.destroy();
      cursorIdleAnimation = null;
      cursorIsIdle = false;
      document.querySelectorAll(".neural-rift").forEach((r) => r.remove());
    }
  }
});

/* ╔══════════════════════════════════════════════════════════════════╗ */
/* ║                   END OF CUSTOM JAVASCRIPT                       ║ */
/* ║  "Code is poetry, bugs are just typos in the verse!" ~ MrDib 🎨  ║ */
/* ╚══════════════════════════════════════════════════════════════════╝ */
