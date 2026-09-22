# Installation and recovery

## Requirements

- VS Code with `be5invis.vscode-custom-css` enabled.
- The active Lucy assets and style files in this repository.
- macOS file access for the VS Code user settings file.

## Live configuration

The live profile is configured through:

```text
~/Library/Application Support/Code/User/settings.json
```

Its custom imports point to `Styles/LucyBase.css`, `Styles/LucyPerformance.css`, `Styles/LucyWorkbench.css`, `Styles/LucyTerminal.css`, and `Styles/LucyLite.js`.

## Recovery

Remove the Lucy import entries, disable Custom CSS and JS, and reload VS Code. The repository itself does not modify shell startup files.
