/* ╔══════════════════════════════════════════════════════════════════╗ */
/* ║             🚀 MrDib's CUSTOM JAVASCRIPT — v6.1 🚀                ║ */
/* ║   JARVIS Boot + Neural Glyph v4 + Command Blur + Editor Fix      ║ */
/* ║      Isolated render layer + circuit-breaker safety net          ║ */
/* ╚══════════════════════════════════════════════════════════════════╝ */

window.addEventListener("error", (e) => {
  console.error(
    "🚨 MrDib Custom JS uncaught error:",
    e.message,
    "@",
    e.filename + ":" + e.lineno,
  );
});

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🧰 MODULE 0: SHARED UTILITIES — window.MrDibUtils              │ */
/* └──────────────────────────────────────────────────────────────────┘ */

(function initMrDibUtils() {
  if (window.MrDibUtils) return;

  function debounce(fn, wait) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function safe(fn, label) {
    return function (...args) {
      try {
        return fn.apply(this, args);
      } catch (err) {
        console.error(`🚨 MrDib [${label || "unknown"}] error:`, err);
      }
    };
  }

  /* 🛑 CIRCUIT BREAKER — wraps ANY callback (esp. MutationObserver callbacks).
     If it fires more than maxCalls times within windowMs, it permanently
     no-ops itself and logs loudly. This is the #1 defense against the
     kind of feedback loop that caused the boot hang. */
  function circuitBreak(
    fn,
    { maxCalls = 150, windowMs = 1000, label = "observer" } = {},
  ) {
    let count = 0;
    let windowStart = Date.now();
    let tripped = false;
    return function guarded(...args) {
      if (tripped) return;
      const now = Date.now();
      if (now - windowStart > windowMs) {
        windowStart = now;
        count = 0;
      }
      count++;
      if (count > maxCalls) {
        tripped = true;
        console.error(
          `🛑 MrDib CIRCUIT BREAKER TRIPPED: [${label}] fired >${maxCalls}x in ${windowMs}ms — ` +
            `disabling it for this session to prevent a hang. Check for feedback loops.`,
        );
        return;
      }
      return fn.apply(this, args);
    };
  }

  function isElementVisible(el) {
    if (!el || !el.isConnected) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = getComputedStyle(el);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    )
      return false;
    return true;
  }

  function safeRemove(el) {
    try {
      el && el.remove();
    } catch (_) {}
  }

  function injectStyleOnce(id, css) {
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }

  window.MrDibUtils = {
    debounce,
    safe,
    circuitBreak,
    isElementVisible,
    safeRemove,
    injectStyleOnce,
  };
  console.log("🧰 MrDib: Shared Utils v2 (circuit breaker armed) — ONLINE ✅");
})();

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🛠️ MODULE 1: SPECIAL EDITOR DETECTOR                          │ */
/* └──────────────────────────────────────────────────────────────────┘ */

(function initSpecialEditorDetector() {
  const { debounce, safe, circuitBreak } = window.MrDibUtils;

  const SPECIAL_EDITORS = [
    { selector: ".settings-editor", bodyClass: "has-settings-editor" },
    { selector: ".keybindings-editor", bodyClass: "has-keybindings-editor" },
    { selector: ".gettingStartedContainer", bodyClass: "has-welcome-editor" },
    { selector: ".extension-editor", bodyClass: "has-extension-editor" },
    { selector: ".notebookOverlay", bodyClass: "has-notebook-editor" },
    { selector: ".webview", bodyClass: "has-webview-editor" },
    { selector: ".markdown-body", bodyClass: "has-markdown-preview" },
  ];

  const syncEditorClasses = safe(function () {
    SPECIAL_EDITORS.forEach(({ selector, bodyClass }) => {
      document.body.classList.toggle(
        bodyClass,
        !!document.querySelector(selector),
      );
    });
  }, "Module1:sync");

  const debouncedSync = debounce(syncEditorClasses, 60);
  syncEditorClasses();

  /* 🔧 Ignore mutations coming from our own neural render layer */
  const guardedObserverCb = circuitBreak(
    safe(function (mutations) {
      const relevant = mutations.some(
        (m) => !(m.target.closest && m.target.closest("#mrdib-neural-layer")),
      );
      if (relevant) debouncedSync();
    }, "Module1:observer"),
    { label: "Module1:bodyObserver", maxCalls: 200, windowMs: 1000 },
  );

  new MutationObserver(guardedObserverCb).observe(document.body, {
    childList: true,
    subtree: true,
  });

  setInterval(syncEditorClasses, 500);

  const debouncedInputSync = debounce(syncEditorClasses, 150);
  document.addEventListener("click", debouncedInputSync);
  document.addEventListener("keyup", debouncedInputSync);

  console.log("🛠️ MrDib: Special Editor Detector — ONLINE ✅");
})();

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🪟 MODULE 1.5: SPECIAL EDITOR FULLSCREEN GLASS                │ */
/* └──────────────────────────────────────────────────────────────────┘ */

(function initSpecialEditorGlass() {
  const { safe, circuitBreak, injectStyleOnce } = window.MrDibUtils;

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

  injectStyleOnce(
    "special-editor-glass-styles",
    `
    .special-editor-glass-overlay {
      position: fixed !important; inset: 0; z-index: 5; pointer-events: none;
      transition: opacity 0.4s ease-in-out;
      backdrop-filter: blur(20px) saturate(1.4);
      -webkit-backdrop-filter: blur(20px) saturate(1.4);
    }
    body.special-editor-active .monaco-workbench .part.editor { position: relative; z-index: 6; }
    body.special-editor-active .monaco-workbench .part.sidebar,
    body.special-editor-active .monaco-workbench .part.panel,
    body.special-editor-active .monaco-workbench .part.activitybar,
    body.special-editor-active .monaco-workbench .part.auxiliarybar {
      filter: blur(3px) brightness(0.6); transition: filter 0.4s ease-in-out;
    }
    body:not(.special-editor-active) .monaco-workbench .part.sidebar,
    body:not(.special-editor-active) .monaco-workbench .part.panel,
    body:not(.special-editor-active) .monaco-workbench .part.activitybar,
    body:not(.special-editor-active) .monaco-workbench .part.auxiliarybar {
      filter: none; transition: filter 0.4s ease-in-out;
    }
  `,
  );

  let overlay = null;
  let currentTheme = null;

  const activateGlass = safe(function (themeKey) {
    const theme = EDITOR_THEMES[themeKey];
    if (!theme || currentTheme === themeKey) return;
    currentTheme = themeKey;
    document.body.classList.add("special-editor-active");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "special-editor-glass-overlay";
      (
        document.querySelector(".monaco-workbench") || document.body
      ).appendChild(overlay);
    }
    overlay.style.background = theme.tint;
    overlay.style.boxShadow = `0 0 80px ${theme.glow} inset`;
    overlay.style.borderTop = `1px solid ${theme.border}`;
    overlay.style.opacity = "1";
  }, "Module1.5:activate");

  const deactivateGlass = safe(function () {
    if (!currentTheme) return;
    currentTheme = null;
    document.body.classList.remove("special-editor-active");
    if (overlay) {
      overlay.style.opacity = "0";
      const el = overlay;
      overlay = null;
      setTimeout(() => el.remove(), 400);
    }
  }, "Module1.5:deactivate");

  const syncGlass = safe(function () {
    for (const themeKey of Object.keys(EDITOR_THEMES)) {
      if (document.body.classList.contains(themeKey))
        return activateGlass(themeKey);
    }
    deactivateGlass();
  }, "Module1.5:sync");

  const guardedGlassCb = circuitBreak(
    function (mutations) {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class")
          return syncGlass();
      }
    },
    { label: "Module1.5:bodyClassObserver", maxCalls: 100, windowMs: 1000 },
  );

  new MutationObserver(guardedGlassCb).observe(document.body, {
    attributes: true,
  });

  setInterval(syncGlass, 500);
  syncGlass();

  console.log("🪟 MrDib: Special Editor Glass Overlay — ONLINE ✅");
})();

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🔥 MODULE 1.75: NUKE MODERN-UI-SHELL-BACKGROUND (loop-safe)   │ */
/* └──────────────────────────────────────────────────────────────────┘ */

(function initModernUIShellNuke() {
  const { safe, circuitBreak } = window.MrDibUtils;

  const nukeModernUIShell = safe(function () {
    const el = document.querySelector("body > div.file-icons-enabled");
    if (el) {
      el.style.setProperty(
        "--modern-ui-shell-background",
        "unset",
        "important",
      );
    }
  }, "Module1.75:nuke");

  nukeModernUIShell();

  /* 🔧 FIX: observe ONLY the specific shell div itself — never subtree.
     This is what caused today's hang. Never remove `subtree: false` here. */
  let observerAttached = false;
  const guardedNuke = circuitBreak(nukeModernUIShell, {
    label: "Module1.75:shellObserver",
    maxCalls: 100,
    windowMs: 1000,
  });

  function attachObserver() {
    if (observerAttached) return;
    const el = document.querySelector("body > div.file-icons-enabled");
    if (!el) return;
    observerAttached = true;
    new MutationObserver(guardedNuke).observe(el, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: false, // ← CRITICAL — do not change this
    });
  }

  attachObserver();
  setInterval(() => {
    nukeModernUIShell();
    attachObserver();
  }, 1000);

  console.log(
    "🔥 MrDib: Modern-UI-Shell-Background Nuke — ONLINE ✅ (loop-safe)",
  );
})();

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🎭 MODULE 2: COMMAND PALETTE BLUR EFFECT                      │ */
/* └──────────────────────────────────────────────────────────────────┘ */

(function initCommandPaletteBlur() {
  const { safe, circuitBreak, injectStyleOnce } = window.MrDibUtils;

  injectStyleOnce(
    "command-blur-styles",
    `
    body.command-palette-open .monaco-workbench .part.editor,
    body.command-palette-open .monaco-workbench .part.sidebar,
    body.command-palette-open .monaco-workbench .part.panel,
    body.command-palette-open .monaco-workbench .part.activitybar,
    body.command-palette-open .monaco-workbench .part.titlebar,
    body.command-palette-open .monaco-workbench .part.statusbar {
      filter: blur(5px) brightness(0.7); transition: filter 0.3s ease-in-out;
    }
    .command-dark-overlay {
      position: fixed !important; inset: 0; background: rgba(0, 0, 0, 0.5);
      z-index: 999; pointer-events: none; transition: opacity 0.3s ease-in-out;
    }
    body.command-palette-open .quick-input-widget {
      filter: none !important; z-index: 10000 !important;
      box-shadow: 0 0 50px rgba(0, 255, 136, 0.4), 0 0 100px rgba(0, 255, 136, 0.2) !important;
      background: rgba(10, 30, 10, 0.98) !important;
      border: 2px solid rgba(0, 255, 136, 0.5) !important;
    }
    body.command-palette-open .quick-input-widget input {
      background: rgba(0, 40, 0, 0.9) !important; color: #00ff88 !important;
      caret-color: #00ff88 !important; border: 1px solid rgba(0, 255, 136, 0.3) !important;
    }
    body.command-palette-open .quick-input-list  { background: transparent !important; }
    body.command-palette-open .monaco-list-row   { color: #00ff88 !important; }
    body.command-palette-open .label-name        { color: #00ff88 !important; }
    body.command-palette-open .label-description { color: rgba(0, 255, 136, 0.7) !important; }
    body.command-palette-open .codicon           { color: #00ff88 !important; }
    body.command-palette-open .monaco-list-row.focused {
      background: rgba(0, 255, 136, 0.15) !important; border: 1px solid rgba(0, 255, 136, 0.3) !important;
    }
  `,
  );

  let darkOverlay = null;

  const activatePaletteMode = safe(function () {
    document.body.classList.add("command-palette-open");
    if (window.MrDibNeuralCursor)
      window.MrDibNeuralCursor.config.enabled = false;
    if (!darkOverlay) {
      darkOverlay = document.createElement("div");
      darkOverlay.className = "command-dark-overlay";
      document.body.appendChild(darkOverlay);
    }
  }, "Module2:activate");

  const deactivatePaletteMode = safe(function () {
    document.body.classList.remove("command-palette-open");
    if (window.MrDibNeuralCursor)
      window.MrDibNeuralCursor.config.enabled = true;
    if (darkOverlay) {
      darkOverlay.style.opacity = "0";
      const el = darkOverlay;
      darkOverlay = null;
      setTimeout(() => el.remove(), 300);
    }
  }, "Module2:deactivate");

  document.addEventListener(
    "keydown",
    safe(function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        setTimeout(activatePaletteMode, 50);
      } else if (e.key === "Escape") {
        deactivatePaletteMode();
      }
    }, "Module2:keydown"),
  );

  const checkPalette = setInterval(
    safe(function () {
      const palette = document.querySelector(".quick-input-widget");
      if (!palette) return;
      clearInterval(checkPalette);
      console.log("🎭 MrDib: Command Palette found — attaching observer ✅");
      if (palette.style.display !== "none") activatePaletteMode();

      const guardedPaletteCb = circuitBreak(
        safe(function (mutations) {
          mutations.forEach((m) => {
            if (m.type === "attributes" && m.attributeName === "style") {
              palette.style.display === "none"
                ? deactivatePaletteMode()
                : activatePaletteMode();
            }
          });
        }, "Module2:paletteObserver"),
        { label: "Module2:paletteObserver", maxCalls: 100, windowMs: 1000 },
      );

      new MutationObserver(guardedPaletteCb).observe(palette, {
        attributes: true,
      });
    }, "Module2:checkPalette"),
    300,
  );

  console.log("🎭 MrDib: Command Palette Blur — ONLINE ✅");
})();

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🔧 MODULE 3: JARVIS BOOT SEQUENCE (Arc Reactor Edition)        │ */
/* │   Now with an independent watchdog — guarantees removal even    │ */
/* │   if the primary setTimeout chain is ever delayed               │ */
/* └──────────────────────────────────────────────────────────────────┘ */

(function initJarvisBoot() {
  if (window.__mrdibJarvisLoaded) {
    console.log("🔧 MrDib: JARVIS already booted this session — skipping");
    return;
  }
  window.__mrdibJarvisLoaded = true;

  try {
    const { injectStyleOnce } = window.MrDibUtils;

    injectStyleOnce(
      "jarvis-boot-styles",
      `
      :root {
        --stark-blue: #00d4ff; --arc-white: #ffffff; --reactor-orange: #ff6600;
        --holo-glass: rgba(0, 212, 255, 0.1); --text-glow: #00ff88; --text-accent: #ffffff;
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
        0%, 100% { text-shadow: 0 0 10px var(--text-glow), 0 0 20px var(--text-glow), 0 0 30px var(--text-glow), 0 0 40px var(--text-accent); }
        50%      { text-shadow: 0 0 20px var(--text-glow), 0 0 30px var(--text-glow), 0 0 40px var(--text-glow), 0 0 50px var(--text-accent), 0 0 60px var(--text-accent); }
      }
      @keyframes textPanel { 0% { opacity: 0; transform: scaleX(0); } 100% { opacity: 1; transform: scaleX(1); } }
      @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

      .jarvis-boot {
        position: fixed; inset: 0; z-index: 100000;
        background: radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 100%);
        pointer-events: none; perspective: 1000px; overflow: hidden;
      }
      .arc-reactor { position: fixed; top: 50%; left: 50%; width: 200px; height: 200px; transform: translate(-50%, -50%); animation: arcReactorBoot 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      .reactor-ring { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border: 2px solid var(--stark-blue); border-radius: 50%; box-shadow: 0 0 20px var(--stark-blue), inset 0 0 20px var(--stark-blue); }
      .reactor-ring:nth-child(1) { width: 100%; height: 100%; animation: powerUp 1.8s ease-out infinite; }
      .reactor-ring:nth-child(2) { width: 70%;  height: 70%;  animation: powerUp 1.8s ease-out 0.2s infinite; }
      .reactor-ring:nth-child(3) { width: 40%; height: 40%; background: var(--stark-blue); box-shadow: 0 0 30px var(--stark-blue), 0 0 60px var(--arc-white); animation: powerUp 1.8s ease-out 0.4s infinite; }
      .hud-frame { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80vw; height: 60vh; border: 1px solid var(--stark-blue); animation: hudFrame 1.2s ease-out 0.8s both; box-shadow: 0 0 20px var(--holo-glass), inset 0 0 20px var(--holo-glass); }
      .hud-corner { position: absolute; width: 20px; height: 20px; border: 2px solid var(--stark-blue); }
      .hud-corner::after { content: ''; position: absolute; width: 4px; height: 4px; background: var(--arc-white); box-shadow: 0 0 10px var(--arc-white); }
      .hud-corner.tl { top: -1px; left: -1px;   border-right: none; border-bottom: none; }
      .hud-corner.tr { top: -1px; right: -1px;  border-left: none;  border-bottom: none; }
      .hud-corner.bl { bottom: -1px; left: -1px;  border-right: none; border-top: none; }
      .hud-corner.br { bottom: -1px; right: -1px; border-left: none;  border-top: none; }
      .hud-corner.tl::after { bottom: -2px; right: -2px; }
      .hud-corner.tr::after { bottom: -2px; left: -2px; }
      .hud-corner.bl::after { top: -2px;    right: -2px; }
      .hud-corner.br::after { top: -2px;    left: -2px; }
      .holo-display { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); transform-style: preserve-3d; animation: hologramBoot 1.2s ease-out 1.5s both; text-align: center; z-index: 100001; padding: 2rem 3rem; }
      .text-backdrop { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 10px; box-shadow: 0 0 30px rgba(0,255,136,0.2), inset 0 0 30px rgba(0,0,0,0.5); z-index: -1; animation: textPanel 0.5s ease-out 1.8s both; }
      .jarvis-text { font-family: 'Arial', sans-serif; font-weight: 300; text-align: center; text-transform: uppercase; letter-spacing: 0.2em; white-space: nowrap; position: relative; z-index: 1; }
      .jarvis-text.primary { font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 1rem; color: var(--text-accent); font-weight: bold; text-shadow: 0 0 10px var(--text-glow), 0 0 20px var(--text-glow), 0 0 30px var(--text-glow), 0 0 40px var(--text-accent), 0 2px 4px rgba(0,0,0,0.8); animation: textHologram 1s ease-out 2s both, textGlow 2s ease-in-out 3s infinite; }
      .jarvis-text.secondary { font-size: clamp(1rem, 2.5vw, 1.5rem); color: var(--reactor-orange); letter-spacing: 0.4em; font-weight: 400; animation: textHologram 1s ease-out 2.5s both; text-shadow: 0 0 10px var(--reactor-orange), 0 0 20px var(--reactor-orange), 0 0 30px #ff3300, 0 2px 4px rgba(0,0,0,0.8); }
      .data-viz { position: fixed; top: 50%; transform: translateY(-50%); width: 100px; height: 200px; display: flex; align-items: flex-end; justify-content: space-around; opacity: 0; animation: fadeIn 0.8s ease-out 2.8s both; }
      .data-viz.left  { left: 10%; }
      .data-viz.right { right: 10%; }
      .data-bar { width: 15px; background: linear-gradient(to top, var(--stark-blue) 0%, var(--arc-white) 100%); animation: dataStream 2.5s ease-in-out infinite; opacity: 0.7; }
      .data-bar:nth-child(1) { height: 60%; animation-delay: 0s; }
      .data-bar:nth-child(2) { height: 80%; animation-delay: 0.2s; }
      .data-bar:nth-child(3) { height: 40%; animation-delay: 0.4s; }
      .data-bar:nth-child(4) { height: 90%; animation-delay: 0.6s; }
      .data-bar:nth-child(5) { height: 70%; animation-delay: 0.8s; }
      .status-text { position: fixed; bottom: 10%; left: 50%; transform: translateX(-50%); font-family: 'Courier New', monospace; font-size: 0.9rem; color: var(--reactor-orange); letter-spacing: 0.1em; opacity: 0; animation: fadeIn 0.8s ease-out 3.2s both; }
      .jarvis-boot.shutting-down { animation: fadeOut 1s ease-out forwards; }
    `,
    );

    function initJarvisWelcome() {
      const jarvis = document.createElement("div");
      jarvis.className = "jarvis-boot";

      const reactor = document.createElement("div");
      reactor.className = "arc-reactor";
      reactor.innerHTML = `<div class="reactor-ring"></div><div class="reactor-ring"></div><div class="reactor-ring"></div>`;
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
      const bootTime = Date.now();

      setTimeout(() => {
        jarvis.classList.add("shutting-down");
        setTimeout(() => {
          jarvis.remove();
          console.log("⎊ JARVIS: Welcome back, sir.");
        }, 1000);
      }, 4500);

      /* 🛡️ WATCHDOG: independent of the timers above. If the JARVIS overlay
         is somehow still in the DOM 10s after boot (main thread was busy,
         a future bug, whatever) — force-remove it unconditionally. */
      const watchdog = setInterval(() => {
        if (!jarvis.isConnected) {
          clearInterval(watchdog);
          return;
        }
        if (Date.now() - bootTime > 10000) {
          console.warn(
            "🛡️ MrDib: JARVIS watchdog force-removing stuck boot overlay",
          );
          jarvis.remove();
          clearInterval(watchdog);
        }
      }, 1000);
    }

    if (!document.querySelector(".jarvis-boot")) {
      initJarvisWelcome();
    }

    console.log("🔧 MrDib: JARVIS Boot Sequence — ONLINE ✅ (watchdog armed)");
  } catch (err) {
    console.error("🔧 MrDib: JARVIS Boot failed:", err);
  }
})();

/* ┌──────────────────────────────────────────────────────────────────┐ */
/* │   🧿 MODULE 4: NEURAL GLYPH CURSOR v4 (Isolated Layer Edition)   │ */
/* │   • Renders into its OWN fixed layer, outside every observed    │ */
/* │     subtree — cannot trigger Module 1 / 1.75 ever again          │ */
/* │   • Visibility-aware active editor detection (tab-switch fix)    │ */
/* │   • Per-frame identity check + instant title/tab observers       │ */
/* └──────────────────────────────────────────────────────────────────┘ */

(function initNeuralGlyphCursor() {
  if (window.__mrdibNeuralCursorLoaded) {
    console.log("🧿 MrDib: Neural Glyph already loaded — skipping re-init");
    return;
  }
  window.__mrdibNeuralCursorLoaded = true;

  try {
    const {
      isElementVisible,
      safeRemove,
      safe,
      circuitBreak,
      injectStyleOnce,
    } = window.MrDibUtils;

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

    const SYMBOLS = [
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

    /* 🔒 ISOLATED RENDER LAYER — direct child of body, fixed to viewport,
       marked so Module 1's observer explicitly ignores it. This is what
       structurally prevents the Module1.75/Module4 feedback loop. */
    const neuralLayer = (function createNeuralLayer() {
      let layer = document.getElementById("mrdib-neural-layer");
      if (!layer) {
        layer = document.createElement("div");
        layer.id = "mrdib-neural-layer";
        Object.assign(layer.style, {
          position: "fixed",
          inset: "0",
          pointerEvents: "none",
          zIndex: "9999",
        });
        document.body.appendChild(layer);
      }
      return layer;
    })();

    const state = {
      glyphs: [],
      lastPos: null,
      lastMoveTime: Date.now(),
      isIdle: false,
      idleAnimation: null,
      velocity: { x: 0, y: 0 },
      activeEditorEl: null,
    };

    function getActiveEditor() {
      const editors = document.querySelectorAll(".monaco-editor");
      let visibleFocused = null;
      let visibleAny = null;
      for (const ed of editors) {
        if (!isElementVisible(ed)) continue;
        if (!visibleAny) visibleAny = ed;
        if (ed.classList.contains("focused")) {
          visibleFocused = ed;
          break;
        }
      }
      return visibleFocused || visibleAny || null;
    }

    /* 🔧 Returns VIEWPORT coordinates now (layer is position:fixed) */
    function getCursorViewportPos(editor) {
      const cursor = editor.querySelector(".cursor");
      if (!cursor) return null;
      const cr = cursor.getBoundingClientRect();
      return { x: cr.left + cr.width / 2, y: cr.top + cr.height / 2 };
    }

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
        this.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
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
          transform: `translate(-50%, -50%) rotate(${this.rotation}deg) scale(${this.scale})`,
          textShadow: `0 0 8px ${this.color}, 0 0 12px ${this.color}`,
          willChange: "transform, opacity",
          mixBlendMode: "screen",
        });

        neuralLayer.appendChild(this.el);
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
          safeRemove(this.el);
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
          transform: "translate(-50%, -50%)",
          boxShadow: `0 0 15px ${CURSOR_CONFIG.colors.accent}`,
          willChange: "transform, opacity",
        });
        neuralLayer.appendChild(this.el);
      }
      update() {
        const age = Date.now() - this.born;
        if (age > this.maxLife) {
          safeRemove(this.el);
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
        this.riftEl = null;
        this.riftTimeoutId = null;
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
          transform: "translate(-50%, -50%) scale(0)",
          textShadow: `0 0 20px ${CURSOR_CONFIG.colors.accent}, 0 0 30px ${CURSOR_CONFIG.colors.primary}`,
          willChange: "transform, opacity",
          mixBlendMode: "screen",
          animation: "neural-core-pulse 2s ease-in-out infinite",
        });
        neuralLayer.appendChild(this.coreGlyph);
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
          const g = new CursorGlyph(
            this.x + Math.cos(angle) * 30,
            this.y + Math.sin(angle) * 30,
            "rift",
          );
          g.vx = -Math.cos(angle) * 0.5;
          g.vy = -Math.sin(angle) * 0.5;
          this.fieldGlyphs.push(g);
          state.glyphs.push(g);
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
              state.glyphs.push(g);
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
              i % 2 === 0
                ? CURSOR_CONFIG.colors.accent
                : CURSOR_CONFIG.colors.rift;
            this.fieldGlyphs.push(g);
            state.glyphs.push(g);
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
            state.glyphs.push(g);
          }
          this.coreGlyph.style.filter =
            Math.random() < 0.1
              ? `hue-rotate(${Math.random() * 360}deg) saturate(2)`
              : "none";
        }

        this.orbitGlyphs = this.orbitGlyphs.filter(
          (g) => g.el && g.el.isConnected,
        );
        this.fieldGlyphs = this.fieldGlyphs.filter((g) => g.update());
        return true;
      }

      createRift() {
        this.riftEl = document.createElement("div");
        this.riftEl.className = "neural-rift";
        Object.assign(this.riftEl.style, {
          position: "absolute",
          left: this.x + "px",
          top: this.y + "px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, transparent 30%, ${CURSOR_CONFIG.colors.rift}22 50%, transparent 70%)`,
          filter: "blur(2px)",
          animation: "neural-rift-pulse 3s ease-in-out infinite",
        });
        neuralLayer.appendChild(this.riftEl);
        this.riftTimeoutId = setTimeout(() => {
          safeRemove(this.riftEl);
          this.riftEl = null;
        }, 10000);
      }

      destroy() {
        safeRemove(this.coreGlyph);
        this.coreGlyph = null;
        if (this.riftTimeoutId) clearTimeout(this.riftTimeoutId);
        safeRemove(this.riftEl);
        this.riftEl = null;
        this.orbitGlyphs.forEach((g) => safeRemove(g.el));
        this.fieldGlyphs.forEach((g) => safeRemove(g.el));
        this.orbitGlyphs = [];
        this.fieldGlyphs = [];
      }
    }

    function hardReset() {
      state.glyphs.forEach((g) => safeRemove(g.el));
      state.glyphs = [];
      if (state.idleAnimation) {
        state.idleAnimation.destroy();
        state.idleAnimation = null;
      }
      state.isIdle = false;
      state.lastPos = null;
      state.lastMoveTime = Date.now();
      sweepOrphans();
    }

    function sweepOrphans() {
      /* Simplified now: layer isn't nested in editors, so just cap total count
         as a safety net against any leak */
      const all = neuralLayer.children;
      while (all.length > CURSOR_CONFIG.maxGlyphs + 30) {
        safeRemove(all[0]);
      }
    }

    const animateCursor = function () {
      try {
        if (CURSOR_CONFIG.enabled) {
          const editor = getActiveEditor();

          if (editor !== state.activeEditorEl) {
            hardReset();
            state.activeEditorEl = editor;
          }

          const pos = editor ? getCursorViewportPos(editor) : null;
          const now = Date.now();

          if (
            pos &&
            state.lastPos &&
            (Math.abs(pos.x - state.lastPos.x) > 0.1 ||
              Math.abs(pos.y - state.lastPos.y) > 0.1)
          ) {
            state.lastMoveTime = now;
            if (state.isIdle && state.idleAnimation) {
              state.isIdle = false;
              state.idleAnimation.destroy();
              state.idleAnimation = null;
            }

            const dx = pos.x - state.lastPos.x;
            const dy = pos.y - state.lastPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            state.velocity.x = dx * 0.2;
            state.velocity.y = dy * 0.2;

            if (distance > 100) {
              state.glyphs.push(
                new CursorPulseRing(state.lastPos.x, state.lastPos.y),
              );
              for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                state.glyphs.push(
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
                  state.lastPos.x + dx * t,
                  state.lastPos.y + dy * t,
                  "fast",
                  { x: state.velocity.x * 0.5, y: state.velocity.y * 0.5 },
                );
                g.rotationSpeed = (Math.random() - 0.5) * 8;
                state.glyphs.push(g);
              }
            } else {
              for (let i = 0; i < 2; i++) {
                state.glyphs.push(
                  new CursorGlyph(
                    pos.x + (Math.random() - 0.5) * 6,
                    pos.y + (Math.random() - 0.5) * 6,
                    "normal",
                  ),
                );
              }
            }

            while (state.glyphs.length > CURSOR_CONFIG.maxGlyphs)
              safeRemove(state.glyphs.shift()?.el);
            state.lastPos = { x: pos.x, y: pos.y };
          } else if (
            pos &&
            now - state.lastMoveTime > CURSOR_CONFIG.idleTimeout &&
            !state.isIdle
          ) {
            state.isIdle = true;
            state.idleAnimation = new CursorIdleAnimation(pos.x, pos.y);
          } else if (!pos && state.isIdle) {
            state.isIdle = false;
            state.idleAnimation?.destroy();
            state.idleAnimation = null;
          }

          if (state.isIdle && state.idleAnimation) state.idleAnimation.update();
          if (pos) state.lastPos = { x: pos.x, y: pos.y };
        }
      } catch (err) {
        console.error("🧿 Neural Cursor frame error:", err);
      }

      state.glyphs = state.glyphs.filter((g) => {
        try {
          return g.update();
        } catch (err) {
          safeRemove(g.el);
          return false;
        }
      });

      requestAnimationFrame(animateCursor);
    };

    const instantReset = safe(function () {
      hardReset();
      state.activeEditorEl = getActiveEditor();
    }, "Module4:instantReset");

    function watchTitle() {
      const titleEl = document.querySelector("title");
      if (!titleEl || titleEl.__mrdibObserved) return;
      titleEl.__mrdibObserved = true;
      const guarded = circuitBreak(instantReset, {
        label: "Module4:titleObserver",
        maxCalls: 100,
        windowMs: 1000,
      });
      new MutationObserver(guarded).observe(titleEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    function watchTabs() {
      const tabsContainer = document.querySelector(".tabs-container");
      if (!tabsContainer || tabsContainer.__mrdibObserved) return;
      tabsContainer.__mrdibObserved = true;
      const guarded = circuitBreak(instantReset, {
        label: "Module4:tabsObserver",
        maxCalls: 100,
        windowMs: 1000,
      });
      new MutationObserver(guarded).observe(tabsContainer, {
        attributes: true,
        attributeFilter: ["class"],
        subtree: true,
        childList: true,
      });
    }

    watchTitle();
    watchTabs();
    setInterval(() => {
      watchTitle();
      watchTabs();
    }, 1000);

    setInterval(safe(sweepOrphans, "Module4:sweep"), 2000);

    injectStyleOnce(
      "neural-cursor-core-style",
      `
      .monaco-editor .cursor {
        animation: neural-pulse 2s ease-in-out infinite !important;
        filter: drop-shadow(0 0 8px ${CURSOR_CONFIG.colors.primary}) drop-shadow(0 0 12px ${CURSOR_CONFIG.colors.accent}) !important;
      }
      @keyframes neural-pulse {
        0%, 100% { filter: drop-shadow(0 0 6px  ${CURSOR_CONFIG.colors.primary}) drop-shadow(0 0 10px ${CURSOR_CONFIG.colors.accent}); }
        50%      { filter: drop-shadow(0 0 12px ${CURSOR_CONFIG.colors.primary}) drop-shadow(0 0 18px ${CURSOR_CONFIG.colors.accent}) drop-shadow(0 0 24px ${CURSOR_CONFIG.colors.core}); }
      }
      @keyframes neural-core-pulse {
        0%, 100% { opacity: 0.8; filter: brightness(1); }
        50%      { opacity: 1;   filter: brightness(1.5) saturate(1.5); }
      }
      @keyframes neural-rift-pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1)   rotate(0deg);   opacity: 0.4; }
        50%      { transform: translate(-50%, -50%) scale(1.2) rotate(180deg); opacity: 0.7; }
      }
    `,
    );

    animateCursor();

    window.MrDibNeuralCursor = { config: CURSOR_CONFIG, reset: hardReset };

    document.addEventListener(
      "keydown",
      safe(function (e) {
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "n") {
          CURSOR_CONFIG.enabled = !CURSOR_CONFIG.enabled;
          console.log(
            "🧿 Neural Glyph:",
            CURSOR_CONFIG.enabled ? "ACTIVATED" : "DORMANT",
          );
          if (!CURSOR_CONFIG.enabled) hardReset();
        }
      }, "Module4:toggle"),
    );

    console.log(
      "🧿 MrDib: Neural Glyph Cursor v4 — ONLINE ✅ (isolated layer, loop-proof)",
    );
  } catch (err) {
    console.error("🧿 MrDib: Neural Glyph Cursor v4 init failed:", err);
  }
})();

/* ╔══════════════════════════════════════════════════════════════════╗ */
/* ║                   END OF CUSTOM JAVASCRIPT                       ║ */
/* ║  "Code is poetry, bugs are just typos in the verse!" ~ MrDib 🎨  ║ */
/* ╚══════════════════════════════════════════════════════════════════╝ */
