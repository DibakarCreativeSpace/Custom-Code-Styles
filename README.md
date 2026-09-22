# Lucy VS Code Custom Interface

A performance-first, Lucy-themed VS Code customization for macOS. The profile keeps the original futuristic wallpaper and hacker aesthetic while moving visual work into static CSS and a tiny event-driven cursor layer.

## Design goals

- Keep the cyberpunk hacker aesthetic under the **Lucy** identity.
- Make Explorer, Search, Source Control, Run/Debug, Extensions, auxiliary views, and panel headers feel like one command center.
- Avoid idle CPU work: no matrix loop, perpetual `requestAnimationFrame`, `MutationObserver`, `setInterval`, `backdrop-filter`, `mix-blend-mode`, or broad `transition: all` in the final Lucy layers.
- Keep the integrated terminal fast by using VS Code's native xterm canvas and a static cyan/green command-deck frame.
- Keep `~/.zshrc` and `~/.zprofile` project-agnostic and untouched.

## Repository layout

```text
CustomCode/
├── Assets/Images/          Active wallpaper and interface artwork
├── Configs/                 Final Lucy settings snapshot
├── Dictionaries/           Active cSpell dictionary
├── Docs/                    Installation and performance notes
├── Styles/                  Active CSS/JS layers loaded by VS Code
├── .gitignore
├── LICENSE
└── README.md
```

## Active layers

The VS Code profile loads these files in order:

1. `Styles/LucyBase.css` — existing visual identity, typography, transparent workbench foundation, and artwork.
2. `Styles/LucyWallpaper.css` — compact embedded copy of the existing wallpaper for reliable renderer loading.
3. `Styles/LucyPerformance.css` — low-power overrides for the original style system.
4. `Styles/LucyWorkbench.css` — Lucy activity bar, sidebar views, panel headers, lists, inputs, badges, menus, and quick surfaces.
5. `Styles/LucyTerminal.css` — static integrated-terminal command deck labeled `LUCY // COMMAND`.
6. `Styles/LucyLite.js` — pooled cursor core and event-driven click pulse.

`Configs/Lucy-Settings.json` is the final settings snapshot corresponding to the active profile. The live file remains VS Code's user settings file.

## Applying changes

The live VS Code settings reference this repository with `vscode_custom_css.imports`. After changing a style layer, run **Developer: Reload Window**. If the custom CSS extension requests it, run **Enable Custom CSS and JS** and restart VS Code.

The customization does not require shell-prompt changes. No `.zshrc` or `.zprofile` edits are part of this profile.

## Performance model

The wallpaper is one static image. Sidebar and panel decoration uses opaque/translucent colors, short color transitions, and small shadows. The cursor effect creates one pooled core and one pooled pulse ring only after actual input activity; it stops when the window is hidden or the feature is toggled.

Toggle the Lucy cursor layer with `Cmd/Ctrl + Alt + N`.

## Safety and portability

The repository contains the active personal visual assets used by the current profile. Review those files before publishing publicly. The repository has no remote configured because a destination GitHub repository was not supplied.
