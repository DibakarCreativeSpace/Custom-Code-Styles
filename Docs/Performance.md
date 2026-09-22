# Lucy performance notes

## What was removed from the active path

- The VS Code Animations extension's injected `updateHandler.js` import.
- The previous heavy `CustomJavascript.js` layer with recurring observers, intervals, and boot/watchdog work.
- Broad idle animation and blur behavior from the final Lucy overrides.

## What remains

- A single wallpaper image layer.
- Native VS Code terminal rendering with static CSS framing.
- Short hover/focus transitions for navigation feedback.
- One event-driven cursor core and one click pulse, both pooled and destroyed cleanly.

## If VS Code becomes heavy again

1. Toggle the cursor layer with `Cmd/Ctrl + Alt + N`.
2. Temporarily remove `Styles/LucyWorkbench.css` from the imports to isolate workbench chrome from the base visual layer.
3. Check the process list for extension helpers before disabling the Lucy layers; the largest process is not necessarily caused by CSS.
4. Keep `editor.smoothScrolling`, terminal smooth scrolling, and the animations extension disabled for the low-latency profile.
