# Portfolio

Zach Rodgers’ UX/UI and industrial design portfolios, plus recipes. React + TypeScript.

## Development

```sh
npm install
npm start
npm test -- --watchAll=false
npm run build
```

## Routes

| Page | URL | Aliases |
| --- | --- | --- |
| UX/UI | `/ux_ui` | `/ux`, `/ui`, `/uxui` |
| Industrial design | `/industrial_design` | `/design`, `/id` |
| Recipes | `/recipes` | |

`/` and unknown URLs resolve to `DEFAULT_ROUTE` in `src/App.tsx`, currently `/ux_ui`.
Configure hosting to serve `index.html` for page routes.

## Editing

- Pages: `src/ux_ui/UxUi.tsx`, `src/industrial_design/IndustrialDesign.tsx`, `src/recipes/Recipes.tsx`.
- Sections: each portfolio’s `sections/` folder. UX/UI hero, contents, and portfolio are placeholders.
- Shared components: `src/shared/`.
- Assets: `public/assets/{ux_ui,industrial_design,recipes,shared}/`.
- Resumes: `public/assets/{ux_ui,industrial_design}/resume/resume.json`.
- UX/UI navigation: `src/ux_ui/content/page.json`.
- Footer configuration: `src/siteContent.ts`; UX/UI project placeholders: `src/ux_ui/content/page.json`.

Industrial project images and metadata live in `public/assets/industrial_design/portfolio/`.
Add images using the existing filename pattern, update `projects.json`, and add matching
SVG icons in `public/assets/industrial_design/icons/project_icons/`.
