import uxContent from './ux_ui/content/page.json';

export interface PageProps {
    mainRoute: string;
}

export const footerPages = [
    { route: '/ux_ui', label: 'UX/UI' },
    { route: '/industrial_design', label: 'Design' },
    { route: '/recipes', label: 'Recipes' },
];

export const uxFooterProjects = {
    route: '/ux_ui',
    items: uxContent.footerProjects,
};

export const industrialFooterProjects = {
    dataUrl: '/assets/industrial_design/portfolio/projects.json',
    route: '/industrial_design',
    icons: {
        Spark: '/assets/industrial_design/icons/project_icons/Spark.svg',
        Obsidian: '/assets/industrial_design/icons/project_icons/Obsidian.svg',
        Vital: '/assets/industrial_design/icons/project_icons/Vital.svg',
        Parallel: '/assets/industrial_design/icons/project_icons/Parallel.svg',
        Batterola: '/assets/industrial_design/icons/project_icons/Batterola.svg',
    },
};
