import React, { useState, useEffect } from 'react';
import './Contents.css';

interface ProjectImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc: string;
}

interface Project {
    number: number;
    name: string;
    description: string;
    backgroundImage: string;
    overlayImage: string;
    animationScale: number;
    animationRotate: number;
    animationOrigin: string;
}

const ProjectImage: React.FC<ProjectImageProps> = ({ src, alt, className, fallbackSrc }) => {
    const [currentSrc, setCurrentSrc] = useState(src);

    const handleError = () => {
        if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
        }
    };

    return (
        <img
            src={currentSrc}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
};

const Contents: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    const getImagePath = (folder: string, name: string): string => {
        return `/assets/contents/${folder}/${name}.png`;
    };

    const handleProjectClick = (projectNumber: number) => {
        const projectSection = document.getElementById(`project-${projectNumber}`);
        if (projectSection) {
            projectSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 600);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetch('/assets/portfolio/projects.json')
            .then(response => response.json())
            .then(data => {
                const imageFiles = data.images;
                const projectsData = data.projects;
                const projectMap = new Map<number, string>();

                imageFiles.forEach((fileName: string) => {
                    const separator = fileName.includes('-') ? '-' : '_';
                    const parts = fileName.replace('.jpg', '').split(separator);

                    if (parts.length >= 2) {
                        const projectPart = parts[0];
                        const projectMatch = projectPart.match(/^(\d+)([A-Za-z]+.*)$/);

                        if (projectMatch) {
                            const projectNumber = parseInt(projectMatch[1]);
                            let projectName = projectMatch[2];
                            projectName = projectName.replace(/_/g, ' ');

                            if (!projectMap.has(projectNumber)) {
                                projectMap.set(projectNumber, projectName);
                            }
                        }
                    }
                });

                const sortedProjects: Project[] = Array.from(projectMap.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([number, name]) => {
                        const projectData = projectsData[number.toString()];
                        return {
                            number,
                            name: projectData?.name || name,
                            description: projectData?.description || 'Coming Soon',
                            backgroundImage: getImagePath('background', projectData?.name || name),
                            overlayImage: getImagePath('overlay', projectData?.name || name),
                            animationScale: projectData?.['animation-scale'] || 1,
                            animationRotate: projectData?.['animation-rotate'] || 0,
                            animationOrigin: projectData?.['animation-origin'] || 'bottom right'
                        };
                    });

                const finalProjects: Project[] = [];

                for (let i = 1; i <= 5; i++) {
                    const existingProject = sortedProjects.find(p => p.number === i);
                    if (existingProject) {
                        finalProjects.push(existingProject);
                    } else {
                        finalProjects.push({
                            number: i,
                            name: 'Placeholder',
                            description: 'Coming Soon',
                            backgroundImage: '/assets/contents/background/Placeholder.png',
                            overlayImage: '/assets/contents/overlay/Placeholder.png',
                            animationScale: 1.05,
                            animationRotate: 3,
                            animationOrigin: 'center'
                        });
                    }
                }

                setProjects(finalProjects);
            })
            .catch(error => {
                console.error('Error loading portfolio images:', error);
            });
    }, []);

    return (
        <section className="contents-section">
            <div className="contents-container">
                {isMobile ? (
                    <div className="mobile-contents">
                        {projects.filter(project => project.name !== 'Placeholder').map((project) => (
                            <div
                                key={project.number}
                                className="mobile-project-item"
                                onClick={() => handleProjectClick(project.number)}
                            >
                                <div className="mobile-project-icon">
                                    <img
                                        src={`/assets/icons/project_icons/${project.name}.svg`}
                                        alt={project.name}
                                        onError={(e) => {
                                            console.error(`Failed to load icon: ${project.name}.svg`);
                                            e.currentTarget.style.display = 'none';
                                            const fallback = document.createElement('div');
                                            fallback.className = 'mobile-icon-fallback';
                                            fallback.textContent = project.name.charAt(0).toUpperCase();
                                            e.currentTarget.parentNode?.appendChild(fallback);
                                        }}
                                    />
                                </div>
                                <div className="mobile-project-info">
                                    <h3>{project.name}</h3>
                                    <p>{project.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="contents-grid">
                        {projects.map((project) => (
                            <div
                                key={project.number}
                                className="project-card"
                                data-project-name={project.name}
                                onClick={() => handleProjectClick(project.number)}
                            >
                                <div className="project-image-container">
                                    <h3 className="project-number">{String(project.number).padStart(2, '0')}</h3>
                                    <div className="project-background">
                                        <ProjectImage
                                            src={project.backgroundImage}
                                            alt={`${project.name} background`}
                                            fallbackSrc="/assets/contents/background/Placeholder.png"
                                        />
                                    </div>
                                    <div
                                        className="project-overlay"
                                        style={{
                                            transformOrigin: project.animationOrigin,
                                            '--animation-scale': project.animationScale,
                                            '--animation-rotate': `${project.animationRotate}deg`
                                        } as React.CSSProperties}
                                    >
                                        <ProjectImage
                                            src={project.overlayImage}
                                            alt={`${project.name} overlay`}
                                            fallbackSrc="/assets/contents/overlay/Placeholder.png"
                                        />
                                    </div>
                                </div>
                                <div className="project-info">
                                    <h2>{project.name}</h2>
                                    <p>{project.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Contents;
