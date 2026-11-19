# Portfolio

UX/UI and industrial design portfolios, plus recipes.

## Tech Stack

- React 18
- TypeScript

## Adding Projects

To add a new project:

1. Add project images to `public/assets/industrial_design/portfolio/` using the naming scheme: `[ProjectNumber][ProjectName]_[ImageNumber][Image_Name].jpg`
2. Update `public/assets/industrial_design/portfolio/projects.json` with project details
3. Add an SVG icon to `public/assets/industrial_design/icons/project_icons/` with the same name as the project

The Portfolio and DynamicNav components automatically load from `projects.json` and will update accordingly.

## Routes and content

Routing lives in `src/App.tsx`. Change `DEFAULT_ROUTE` there to choose where
`/` resolves (currently `/ux_ui`). Unknown URLs also resolve to that default page. Query parameters and section hashes are retained.
The hosting server must serve `index.html` for direct visits to these routes.

- `/industrial_design`: existing industrial portfolio in `src/industrial_design`.
- `/ux_ui`: UX/UI page in `src/ux_ui`, with empty hero, contents, and portfolio divs.
- `/recipes`: recipes in `src/recipes`.

Aliases `/design` and `/id` resolve to `/industrial_design`; `/ux`, `/ui`, and
`/uxui` resolve to `/ux_ui`. Alias mappings live alongside routing in `src/App.tsx`.

- `src/shared`: resume, branding, footer, navigation, loading screen, and modals.

UX/UI configuration is in `src/ux_ui/content/page.json`. Its resume uses
`public/assets/ux_ui/resume/resume.json`, initially copied from the existing resume for
independent editing. Assets follow the same namespaces as the source code. Branding and footer use the same components and content on both portfolios.

The shared navigation accepts a `projects` array; UX/UI supplies its own empty list
until projects are built. Future project sections should use `project-{number}`
IDs and page IDs of `{projectName.toLowerCase()}-{pageName.toLowerCase()}` to match
the existing navigation. Industrial navigation continues to load its existing JSON.

## Asset namespaces

- `public/assets/shared`: branding JSON and PDFs, resume media and skill icons,
  common modal icons, site logo, favicon, and webclip.
- `public/assets/industrial_design`: hero media, project images and JSON,
  contents images, project icons, resume JSON, and project modal content.
- `public/assets/ux_ui`: independently editable resume JSON and future UX/UI media.
- `public/assets/recipes`: recipe JSON, photos, and icons.

Shared resume media serves both resume JSON files. Shared modal renderers accept
a base path for page-specific content; branding PDFs remain shared.

## Continuing UX/UI work

Start with `src/ux_ui/sections/Hero.tsx`, `Contents.tsx`, and `Portfolio.tsx`.
These currently contain empty divs. Edit the resume content in
`public/assets/ux_ui/resume/resume.json`; its layout remains shared.

`src/ux_ui/content/page.json` supplies navigation projects and the UX/UI icon
base path. Add that icon directory when you add actual icons. Industrial project
links in the shared footer always target the industrial portfolio, even if UX/UI
uses the same section IDs. Both portfolios support hashes for asynchronously
loaded sections through `src/shared/hooks/useHashScroll.ts`.

Styles remain global CSS, with component styles beside their components.
Use a page-specific wrapper for new UX/UI styles to avoid changing shared or
industrial styles. Run `CI=true npm test -- --watchAll=false --runInBand` and
`npm run build` before deployment.

## Shared component configuration

Shared components contain no industrial or UX/UI asset defaults. Each portfolio
passes its resume JSON URL, project list, icon base path, and modal base path.
Industrial filename parsing lives in
`src/industrial_design/hooks/useNavigationProjects.ts`; UX/UI supplies its own
navigation data through its page JSON.

`src/siteContent.ts` selects the projects shown in the shared footer across all
pages. The current selection remains industrial projects. The recipes page
explicitly sets the footer's Home destination; portfolio Home buttons scroll
their current page to the top. No page wrappers or CSS scoping changes were added.
