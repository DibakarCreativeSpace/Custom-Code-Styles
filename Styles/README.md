# Lucy style layers

| File | Responsibility | Runtime model |
| --- | --- | --- |
| `LucyBase.css` | Typography, editor identity, existing artwork, and transparent workbench foundation | Static CSS |
| `LucyWallpaper.css` | Renderer-safe embedded copy of the existing wallpaper | Static CSS |
| `LucyPerformance.css` | Low-power overrides for expensive base rules | Static CSS |
| `LucyWorkbench.css` | Activity bar, sidebar views, panel headers, lists, inputs, menus | Static CSS |
| `LucyTerminal.css` | Integrated terminal command-deck frame | Static CSS |
| `LucyLite.js` | Cursor core and click pulse | Event-driven, pooled DOM |

Keep the import order in this table. Later layers intentionally override the older base layer.
