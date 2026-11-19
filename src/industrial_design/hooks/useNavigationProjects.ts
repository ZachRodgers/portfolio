import { useEffect, useState } from 'react';
import type { PortfolioImage, Project } from '../../shared/components/DynamicNav';

export default function useNavigationProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    useEffect(() => {
        fetch('/assets/industrial_design/portfolio/projects.json')
            .then(response => response.json())
            .then(data => {
                const imageFiles = data.images;
                const parsedImages: PortfolioImage[] = imageFiles.map((fileName: string, imageIndex: number) => {
                    const separator = fileName.includes('-') ? '-' : '_';
                    const parts = fileName.replace('.jpg', '').split(separator);

                    if (parts.length >= 2) {
                        const projectPart = parts[0];
                        const pagePart = parts[1];

                        const projectMatch = projectPart.match(/^(\d+)([A-Za-z]+.*)$/);
                        if (projectMatch) {
                            const projectNumber = parseInt(projectMatch[1]);
                            let projectName = projectMatch[2];

                            const pageMatch = pagePart.match(/^(\d+)([A-Za-z]+.*)$/);
                            if (pageMatch || pagePart) {
                                const pageNumber = pageMatch ? parseInt(pageMatch[1]) : imageIndex + 1;
                                const pageName = pageMatch ? pageMatch[2] : parts.slice(1).join('_');

                                projectName = projectName.replace(/_/g, ' ');

                                return {
                                    projectNumber,
                                    projectName,
                                    pageNumber,
                                    pageName,
                                    fileName,
                                    fullPath: `/assets/industrial_design/portfolio/${fileName}`
                                };
                            }
                        }
                    }
                    return null;
                }).filter(Boolean) as PortfolioImage[];

                const groupedProjects: { [key: string]: PortfolioImage[] } = {};
                parsedImages.forEach(image => {
                    const projectKey = `${image.projectNumber}-${image.projectName}`;
                    if (!groupedProjects[projectKey]) {
                        groupedProjects[projectKey] = [];
                    }
                    groupedProjects[projectKey].push(image);
                });

                Object.keys(groupedProjects).forEach(projectKey => {
                    groupedProjects[projectKey].sort((a, b) => a.pageNumber - b.pageNumber);
                });

                const projectList: Project[] = Object.keys(groupedProjects)
                    .sort((a, b) => {
                        const numA = parseInt(a.split('-')[0]);
                        const numB = parseInt(b.split('-')[0]);
                        return numA - numB;
                    })
                    .map(projectKey => {
                        const [projectNum, projectName] = projectKey.split('-');
                        const images = groupedProjects[projectKey];

                        return {
                            number: parseInt(projectNum),
                            name: projectName,
                            iconName: projectName,
                            pages: images
                        };
                    });

                setProjects(projectList);
            })
            .catch(error => {
                console.error('Error loading portfolio images:', error);
            });
    }, []);

    return projects;
}
