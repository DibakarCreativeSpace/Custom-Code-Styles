/*
 * Lucy Lite — low-power visual layer for VS Code
 *
 * Performance model:
 *   - No perpetual requestAnimationFrame loop.
 *   - One pooled cursor core and one pooled pulse ring.
 *   - One coalesced frame only after real user activity.
 *   - No MutationObserver, no setInterval, no blur, no blend-mode layer.
 *   - Only transform and opacity transitions on a tiny isolated layer.
 *
 * Toggle: Ctrl/Cmd + Alt + N
 */
(() => {
  "use strict";

  const VERSION = "1.2.0-lucy-low-power";
  const STYLE_ID = "mrdib-lucy-lite-style";
  const LAYER_ID = "mrdib-lucy-lite-layer";
  const SCROLL_DELAY = 40;

  const previous = window.__mrdibLucyLite;
  if (previous && typeof previous.destroy === "function") previous.destroy();

  let destroyed = false;
  let enabled = true;
  let frameId = 0;
  let syncTimer = 0;
  let pulseTimer = 0;
  let bootTimer = 0;
  let lastPosition = null;
  let api = null;
  const listeners = [];

  const on = (target, eventName, handler, options) => {
    const capture =
      typeof options === "boolean" ? options : Boolean(options?.capture);
    target.addEventListener(eventName, handler, options);
    listeners.push(() => target.removeEventListener(eventName, handler, capture));
  };

  const clearScheduledWork = () => {
    if (frameId) cancelAnimationFrame(frameId);
    if (syncTimer) clearTimeout(syncTimer);
    if (pulseTimer) clearTimeout(pulseTimer);
    if (bootTimer) clearTimeout(bootTimer);
    frameId = 0;
    syncTimer = 0;
    pulseTimer = 0;
    bootTimer = 0;
  };

  const injectStyle = () => {
    document.getElementById(STYLE_ID)?.remove();

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Keep the existing wallpaper visible without a recurring JS mutation. */
      .monaco-workbench > .monaco-grid-view,
      .monaco-workbench.floating-panels,
      .monaco-workbench.floating-panels > .monaco-grid-view {
        background-color: transparent !important;
        background-image: none !important;
      }

      /* The native caret stays crisp; the pooled Lite core supplies the accent. */
      .monaco-editor .cursor {
        animation: none !important;
        filter: none !important;
        box-shadow: 0 0 5px rgba(0, 255, 145, 0.7) !important;
      }

      /* Remove the old full-editor radial blend layer. */
      .monaco-editor:not(:has(.settings-editor)):not(:has(.keybindings-editor))::after {
        background: none !important;
        mix-blend-mode: normal !important;
      }

      #${LAYER_ID} {
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483000 !important;
        pointer-events: none !important;
        overflow: hidden !important;
        contain: layout style paint !important;
        isolation: isolate !important;
      }

      #${LAYER_ID} .lucy-lite-core,
      #${LAYER_ID} .lucy-lite-pulse {
        position: absolute;
        left: 0;
        top: 0;
        pointer-events: none;
        transform: translate3d(
            var(--mrdib-x, -100px),
            var(--mrdib-y, -100px),
            0
          )
          translate(-50%, -50%);
      }

      #${LAYER_ID} .lucy-lite-core {
        width: 18px;
        height: 18px;
        border: 1px solid rgba(0, 255, 190, 0.96);
        border-radius: 50%;
        opacity: 0;
        box-shadow: 0 0 8px rgba(0, 255, 145, 0.68);
        transition:
          transform 120ms cubic-bezier(0.2, 0.75, 0.25, 1),
          opacity 100ms ease-out;
      }

      #${LAYER_ID} .lucy-lite-core::before {
        content: "";
        position: absolute;
        inset: 4px;
        border: 1px solid rgba(0, 238, 255, 0.9);
        border-radius: 50%;
        opacity: 0.82;
      }

      #${LAYER_ID} .lucy-lite-core::after {
        content: "";
        position: absolute;
        left: -8px;
        top: 8px;
        width: 34px;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(0, 255, 145, 0.85) 28%,
          rgba(0, 238, 255, 0.9) 50%,
          rgba(0, 255, 145, 0.85) 72%,
          transparent
        );
        opacity: 0.72;
      }

      #${LAYER_ID} .lucy-lite-pulse {
        width: 30px;
        height: 30px;
        border: 1px dashed rgba(0, 238, 255, 0.74);
        border-radius: 50%;
        opacity: 0;
        transform: translate3d(
            var(--mrdib-x, -100px),
            var(--mrdib-y, -100px),
            0
          )
          translate(-50%, -50%)
          scale(0.72);
        transition:
          transform 300ms cubic-bezier(0.2, 0.7, 0.2, 1),
          opacity 300ms ease-out;
      }

      #${LAYER_ID} .lucy-lite-pulse.active {
        opacity: 0.68;
        transform: translate3d(
            var(--mrdib-x, -100px),
            var(--mrdib-y, -100px),
            0
          )
          translate(-50%, -50%)
          scale(1.35);
      }

      #${LAYER_ID}.visible .lucy-lite-core {
        opacity: 0.96;
      }

      #${LAYER_ID}.disabled,
      #${LAYER_ID}.disabled * {
        display: none !important;
      }

      #${LAYER_ID} .lucy-lite-boot {
        position: absolute;
        top: 18px;
        left: 24px;
        padding: 7px 10px;
        border-left: 2px solid rgba(0, 255, 145, 0.9);
        color: rgba(170, 255, 232, 0.92);
        background: rgba(4, 18, 24, 0.74);
        font: 600 10px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
        letter-spacing: 0.13em;
        text-transform: uppercase;
        opacity: 0;
        transform: translate3d(-6px, 0, 0);
        animation: lucy-lite-boot 1.2s ease-out forwards;
      }

      #${LAYER_ID} .lucy-lite-boot small {
        display: block;
        margin-top: 2px;
        color: rgba(0, 238, 255, 0.72);
        font-size: 8px;
        letter-spacing: 0.1em;
      }

      @keyframes lucy-lite-boot {
        0% { opacity: 0; transform: translate3d(-6px, 0, 0); }
        18%, 78% { opacity: 1; transform: translate3d(0, 0, 0); }
        100% { opacity: 0; transform: translate3d(4px, 0, 0); }
      }

      @media (prefers-reduced-motion: reduce) {
        #${LAYER_ID} .lucy-lite-core,
        #${LAYER_ID} .lucy-lite-pulse,
        #${LAYER_ID} .lucy-lite-boot {
          transition: none !important;
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const findCursor = () =>
    document.querySelector(".monaco-editor.focused .cursor") ||
    document.querySelector(".monaco-editor .cursor");

  const setPosition = (element, x, y) => {
    element.style.setProperty("--mrdib-x", `${x}px`);
    element.style.setProperty("--mrdib-y", `${y}px`);
  };

  const pulse = (pulseElement) => {
    if (pulseElement.classList.contains("active")) return;
    pulseElement.classList.add("active");
    pulseTimer = setTimeout(() => {
      pulseElement.classList.remove("active");
      pulseTimer = 0;
    }, 320);
  };

  const syncPosition = (layer, core, pulseElement) => {
    if (destroyed || !enabled || document.hidden) {
      layer.classList.remove("visible");
      return;
    }

    const cursor = findCursor();
    if (!cursor) {
      layer.classList.remove("visible");
      lastPosition = null;
      return;
    }

    const rect = cursor.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      layer.classList.remove("visible");
      return;
    }

    const x = Math.round(rect.left + Math.max(rect.width, 2) / 2);
    const y = Math.round(rect.top + Math.max(rect.height, 16) / 2);
    const moved =
      !lastPosition ||
      Math.abs(x - lastPosition.x) > 1 ||
      Math.abs(y - lastPosition.y) > 1;

    setPosition(core, x, y);
    setPosition(pulseElement, x, y);
    layer.classList.add("visible");
    layer.classList.remove("disabled");

    if (moved) pulse(pulseElement);
    lastPosition = { x, y };
  };

  const scheduleSync = (layer, core, pulseElement, delay = 0) => {
    if (destroyed || !enabled || syncTimer) return;

    syncTimer = setTimeout(() => {
      syncTimer = 0;
      if (destroyed || !enabled || frameId) return;

      frameId = requestAnimationFrame(() => {
        frameId = 0;
        syncPosition(layer, core, pulseElement);
      });
    }, delay);
  };

  const start = () => {
    if (destroyed || !document.body) return;

    injectStyle();

    const layer = document.createElement("div");
    layer.id = LAYER_ID;
    layer.innerHTML = `
      <div class="lucy-lite-pulse" aria-hidden="true"></div>
      <div class="lucy-lite-core" aria-hidden="true"></div>
      <div class="lucy-lite-boot" aria-hidden="true">
        LUCY // LOW-POWER VISUAL CORE
        <small>NEURAL UI ONLINE · RENDER COST LIMITED</small>
      </div>
    `;
    document.body.appendChild(layer);

    const core = layer.querySelector(".lucy-lite-core");
    const pulseElement = layer.querySelector(".lucy-lite-pulse");
    const boot = layer.querySelector(".lucy-lite-boot");

    bootTimer = setTimeout(() => {
      boot?.remove();
      bootTimer = 0;
    }, 1450);

    const activity = (event) => {
      if (
        event.type === "keydown" &&
        (event.ctrlKey || event.metaKey) &&
        event.altKey &&
        event.key.toLowerCase() === "n"
      ) {
        api?.toggle();
        return;
      }

      const delay = event.type === "scroll" ? SCROLL_DELAY : 0;
      scheduleSync(layer, core, pulseElement, delay);
    };

    ["keydown", "pointerdown", "click", "focusin"].forEach((eventName) =>
      on(document, eventName, activity, true)
    );
    on(document, "scroll", activity, { capture: true, passive: true });
    on(window, "resize", () => scheduleSync(layer, core, pulseElement));
    on(window, "focus", () => scheduleSync(layer, core, pulseElement));
    on(document, "visibilitychange", () => {
      if (document.hidden) {
        layer.classList.remove("visible");
      } else {
        scheduleSync(layer, core, pulseElement);
      }
    });

    api = {
      version: VERSION,
      get enabled() {
        return enabled;
      },
      toggle() {
        enabled = !enabled;
        if (!enabled) {
          clearScheduledWork();
          layer.classList.add("disabled");
          layer.classList.remove("visible");
          lastPosition = null;
        } else {
          layer.classList.remove("disabled");
          scheduleSync(layer, core, pulseElement);
        }
        console.log(`🧿 Lucy Lite: ${enabled ? "ONLINE" : "DORMANT"}`);
      },
      reset() {
        lastPosition = null;
        layer.classList.remove("visible");
        scheduleSync(layer, core, pulseElement);
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        clearScheduledWork();
        listeners.splice(0).forEach((remove) => remove());
        layer.remove();
        document.getElementById(STYLE_ID)?.remove();
        if (window.__mrdibLucyLite === api) {
          delete window.__mrdibLucyLite;
        }
        if (window.MrDibLucy === api) {
          delete window.MrDibLucy;
        }
      },
    };

    window.__mrdibLucyLite = api;
    window.MrDibLucy = api;
    console.log(`🧿 Lucy Lite ${VERSION}: ONLINE — event-driven, pooled, low-power`);
    scheduleSync(layer, core, pulseElement, 150);
  };

  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }
})();
