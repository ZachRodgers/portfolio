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
