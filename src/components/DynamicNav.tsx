import React, { useState, useEffect } from 'react';
import './DynamicNav.css';

interface PortfolioImage {
    projectNumber: number;
    projectName: string;
    pageNumber: number;
    pageName: string;
    fileName: string;
    fullPath: string;
}

interface Project {
    number: number;
    name: string;
    iconName: string;
    pages: PortfolioImage[];
}

const DynamicNav: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<number | null>(null);
    const [activePage, setActivePage] = useState<string | null>(null);
    const [passedPages, setPassedPages] = useState<Set<string>>(new Set());
    const [isVisible, setIsVisible] = useState(false);
    const [expandedProject, setExpandedProject] = useState<number | null>(null);
    const [isDirectClick, setIsDirectClick] = useState(false);
    const [targetProject, setTargetProject] = useState<number | null>(null);

    useEffect(() => {
        const checkVisibility = () => {
            setIsVisible(window.innerWidth > 1400);
        };

        checkVisibility();
        window.addEventListener('resize', checkVisibility);
        return () => window.removeEventListener('resize', checkVisibility);
    }, []);

    useEffect(() => {
        fetch('/assets/portfolio/images.json')
            .then(response => response.json())
            .then(imageFiles => {
                const parsedImages: PortfolioImage[] = imageFiles.map((fileName: string) => {
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
                            if (pageMatch) {
                                const pageNumber = parseInt(pageMatch[1]);
                                const pageName = pageMatch[2];

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

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 2;
            const newPassedPages = new Set<string>();

            let currentProject: number | null = null;
            let currentPage: string | null = null;

            projects.forEach((project) => {
                const section = document.getElementById(`project-${project.number}`);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    const sectionTop = rect.top + window.scrollY;
                    const sectionBottom = sectionTop + rect.height;

                    if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                        currentProject = project.number;
                        if (!isDirectClick && targetProject !== project.number) {
                            setTimeout(() => setExpandedProject(project.number), 100);
                        }
                    }

                    project.pages.forEach((page) => {
                        const elementId = `${page.projectName.toLowerCase()}-${page.pageName.toLowerCase()}`;
                        const element = document.getElementById(elementId);
                        if (element) {
                            const imageRect = element.getBoundingClientRect();
                            const imageTop = imageRect.top + window.scrollY;
                            const imageBottom = imageTop + imageRect.height;

                            if (scrollPosition >= imageTop && scrollPosition <= imageBottom && currentProject === project.number) {
                                currentPage = page.pageName;
                            }

                            if (scrollPosition > imageBottom) {
                                newPassedPages.add(`${project.number}-${page.pageName}`);
                            }
                        }
                    });
                }
            });

            setActiveProject(currentProject);
            setActivePage(currentPage);
            setPassedPages(newPassedPages);

            if (newPassedPages.size > 0) {
                console.log('Passed pages:', Array.from(newPassedPages));
            }

            if (!currentProject && !isDirectClick) {
                setExpandedProject(null);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [projects, isDirectClick]);

    const scrollToProject = (projectNumber: number) => {
        setIsDirectClick(true);
        setTargetProject(projectNumber);

        if (expandedProject !== null && expandedProject !== projectNumber) {
            setExpandedProject(null);
            setTimeout(() => {
                setExpandedProject(projectNumber);
            }, 150);
        } else {
            setExpandedProject(projectNumber);
        }

        const section = document.getElementById(`project-${projectNumber}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }

        setTimeout(() => {
            setIsDirectClick(false);
            setTargetProject(null);
        }, 1000);
    };

    const scrollToPage = (projectNumber: number, pageName: string) => {
        const project = projects.find(p => p.number === projectNumber);
        if (project) {
            const page = project.pages.find(p => p.pageName === pageName);
            if (page) {
                const elementId = `${page.projectName.toLowerCase()}-${page.pageName.toLowerCase()}`;
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    };

    if (!isVisible) return null;

    return (
        <nav className="dynamic-nav">
            <div className="nav-content">
                {projects.map((project) => (
                    <div key={project.number} className="project-nav-item">
                        <div
                            className={`project-icon ${activeProject === project.number ? 'active' : ''}`}
                            onClick={() => scrollToProject(project.number)}
                        >
                            <img
                                src={`/assets/icons/project_icons/${project.iconName}.svg`}
                                alt={project.name}
                                onError={(e) => {
                                    console.error(`Failed to load icon: ${project.iconName}.svg`);
                                    e.currentTarget.style.display = 'none';
                                    const fallback = document.createElement('div');
                                    fallback.className = 'icon-fallback';
                                    fallback.textContent = project.name.charAt(0).toUpperCase();
                                    e.currentTarget.parentNode?.appendChild(fallback);
                                }}
                            />
                        </div>
                        <div className={`pages-list ${expandedProject === project.number ? 'expanded' : 'collapsed'}`}>
                            {project.pages.map((page) => {
                                const pageKey = `${project.number}-${page.pageName}`;
                                const isActive = activeProject === project.number && activePage === page.pageName;
                                const isPassed = passedPages.has(pageKey);

                                return (
                                    <div
                                        key={page.pageName}
                                        className={`page-item ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                                        onClick={() => scrollToPage(project.number, page.pageName)}
                                    >
                                        <span className="page-dot"></span>
                                        <span className="page-name">{page.pageName.replace(/_/g, ' ')}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default DynamicNav;
