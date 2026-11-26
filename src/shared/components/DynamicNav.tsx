import React, { useState, useEffect } from 'react';
import './DynamicNav.css';

export interface PortfolioImage {
    projectNumber: number;
    projectName: string;
    pageNumber: number;
    pageName: string;
    fileName: string;
    fullPath: string;
    sectionId?: string;
}

export interface Project {
    number: number;
    name: string;
    iconName: string;
    iconPath?: string;
    pages: PortfolioImage[];
}

interface DynamicNavProps {
    projects: Project[];
    iconBasePath: string;
    portfolioOnly?: boolean;
}

const DynamicNav: React.FC<DynamicNavProps> = ({ projects, iconBasePath, portfolioOnly = false }) => {
    const [activeProject, setActiveProject] = useState<number | null>(null);
    const [activePage, setActivePage] = useState<string | null>(null);
    const [passedPages, setPassedPages] = useState<Set<string>>(new Set());
    const [inPortfolio, setInPortfolio] = useState(!portfolioOnly);
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
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 2;
            if (portfolioOnly) {
                const portfolio = document.getElementById("portfolio");
                const rect = portfolio?.getBoundingClientRect();
                setInPortfolio(!!rect && rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2);
            }
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
                        const elementId = page.sectionId || `${page.projectName.toLowerCase()}-${page.pageName.toLowerCase()}`;
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


            if (!currentProject && !isDirectClick) {
                setExpandedProject(null);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [projects, isDirectClick, targetProject, portfolioOnly]);

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
                const elementId = page.sectionId || `${page.projectName.toLowerCase()}-${page.pageName.toLowerCase()}`;
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    };

    if (!isVisible || !inPortfolio || projects.length === 0) return null;

    return (
        <nav className="dynamic-nav">
            <div className="nav-content">
                {projects.map((project) => (
                    <div key={project.number} className="project-nav-item">
                        <div
                            className={`project-icon ${activeProject === project.number ? 'active' : ''}`}
                            role="button" tabIndex={0} aria-label={`Go to ${project.name}`}
                            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); scrollToProject(project.number); } }}
                            onClick={() => scrollToProject(project.number)}
                        >
                            <img
                                src={project.iconPath || `${iconBasePath}/${project.iconName}.svg`}
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
                                        role="button" tabIndex={expandedProject === project.number ? 0 : -1}
                                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); scrollToPage(project.number, page.pageName); } }}
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
