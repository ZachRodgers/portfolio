# Portfolio

My Industrial Design to showcase University Projects.

## Tech Stack

- React 18
- TypeScript

## Adding Projects

To add a new project:

1. Add project images to `public/assets/portfolio/` using the naming scheme: `[ProjectNumber][ProjectName]_[ImageNumber][Image_Name].jpg`
2. Update `public/assets/portfolio/projects.json` with project details
3. Add an SVG icon to `public/assets/icons/project_icons/` with the same name as the project

The Portfolio and DynamicNav components automatically load from `projects.json` and will update accordingly.

## Routes and content

Routing lives in `src/App.tsx`. Change `DEFAULT_ROUTE` there to choose where
`/` resolves (currently `/ux_ui`). Query parameters and section hashes are retained.
The hosting server must serve `index.html` for direct visits to these routes.

- `/industrial_design`: existing industrial portfolio in `src/industrial_design`.
- `/ux_ui`: UX/UI page in `src/ux_ui`, with empty hero, contents, and portfolio divs.
- `/recipes`: recipes in `src/recipes`.
- `src/shared`: resume, branding, footer, navigation, loading screen, and modals.

UX/UI configuration is in `src/ux_ui/content/page.json`. Its resume uses
`public/assets/resume/ux_ui.json`, initially copied from the existing resume for
independent editing. Industrial content and shared media keep their existing asset
URLs. Branding and footer use the same components and content on both portfolios.

The shared navigation accepts a `projects` array; UX/UI supplies its own empty list
until projects are built. Future project sections should use `project-{number}`
IDs and page IDs of `{projectName.toLowerCase()}-{pageName.toLowerCase()}` to match
the existing navigation. Industrial navigation continues to load its existing JSON.
