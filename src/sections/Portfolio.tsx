import React, { useState, useEffect } from 'react';

interface PortfolioImage {
    projectNumber: number;
    projectName: string;
    pageNumber: number;
    pageName: string;
    fileName: string;
    fullPath: string;
}

const Portfolio: React.FC = () => {
    const [projects, setProjects] = useState<{ [key: string]: PortfolioImage[] }>({});

    useEffect(() => {
        // Load image list from JSON file
        fetch('/assets/portfolio/images.json')
            .then(response => response.json())
            .then(imageFiles => {
                const parsedImages: PortfolioImage[] = imageFiles.map((fileName: string) => {
                    // Handle both dash and underscore separators
                    const separator = fileName.includes('-') ? '-' : '_';
                    const parts = fileName.replace('.jpg', '').split(separator);

                    if (parts.length >= 2) {
                        const projectPart = parts[0];
                        const pagePart = parts[1];

                        // Extract project number and name
                        const projectMatch = projectPart.match(/^(\d+)([A-Za-z]+.*)$/);
                        if (projectMatch) {
                            const projectNumber = parseInt(projectMatch[1]);
                            let projectName = projectMatch[2];

                            // Extract page number and name
                            const pageMatch = pagePart.match(/^(\d+)([A-Za-z]+.*)$/);
                            if (pageMatch) {
                                const pageNumber = parseInt(pageMatch[1]);
                                const pageName = pageMatch[2];

                                // Convert underscores to spaces in project name
                                projectName = projectName.replace(/_/g, ' ');

                                return {
                                    projectNumber,
                                    projectName,
                                    pageNumber,
                                    pageName,
                                    fileName,
                                    fullPath: `/assets/portfolio/${fileName}`
                                };
                            }
                        }
                    }

                    // Fallback for unmatched patterns
                    return null;
                }).filter(Boolean) as PortfolioImage[];

                // Group by project and sort
                const groupedProjects: { [key: string]: PortfolioImage[] } = {};

                parsedImages.forEach(image => {
                    const projectKey = `${image.projectNumber}-${image.projectName}`;
                    if (!groupedProjects[projectKey]) {
                        groupedProjects[projectKey] = [];
                    }
                    groupedProjects[projectKey].push(image);
                });

                // Sort projects by project number and images within each project by page number
                Object.keys(groupedProjects).forEach(projectKey => {
                    groupedProjects[projectKey].sort((a, b) => a.pageNumber - b.pageNumber);
                });

                setProjects(groupedProjects);
            })
            .catch(error => {
                console.error('Error loading portfolio images:', error);
            });
    }, []);

    const formatProjectTitle = (projectNumber: number, projectName: string): string => {
        return `${projectNumber.toString().padStart(2, '0')} ${projectName}`;
    };

    return (
        <section className="component-container">
            {Object.keys(projects)
                .sort((a, b) => {
                    const numA = parseInt(a.split('-')[0]);
                    const numB = parseInt(b.split('-')[0]);
                    return numA - numB;
                })
                .map(projectKey => {
                    const [projectNum, projectName] = projectKey.split('-');
                    const images = projects[projectKey];

                    return (
                        <div key={projectKey} className="project-section" id={`project-${projectNum}`}>
                            <h3>
                                {formatProjectTitle(parseInt(projectNum), projectName)}
                            </h3>
                            <div className="project-images">
                                {images.map(image => (
                                    <div key={image.fileName} className="portfolio-image" id={`${image.projectName.toLowerCase()}-${image.pageName.toLowerCase()}`}>
                                        <img
                                            src={image.fullPath}
                                            alt={`${formatProjectTitle(image.projectNumber, image.projectName)} - ${image.pageName}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
        </section>
    );
};

export default Portfolio;
