import React, { useState, useEffect } from 'react';
import { Github, Mail, Linkedin, ArrowUp, FolderOpen, FileText, CookingPot } from 'lucide-react';
import PDFModal from './modals/PDFModal';
import './Footer.css';

interface Project {
    name: string;
    description: string;
}

interface ProjectsData {
    projects: { [key: string]: Project };
}

interface BrandingProject {
    id: string;
    type: string;
    pdfDirectory: string;
    pageCount: number;
    title: string;
    content: string;
}

type FooterProps = {
    variant?: 'default' | 'light';
    homeHref?: string;
    projectSource: {
        dataUrl: string;
        route: string;
        icons: Record<string, string>;
    };
};

const Footer: React.FC<FooterProps> = ({ variant = 'default', projectSource, homeHref }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [brandingProjects, setBrandingProjects] = useState<BrandingProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [brandingLoading, setBrandingLoading] = useState(true);
    const [selectedBrandingProject, setSelectedBrandingProject] = useState<BrandingProject | null>(null);
    const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

    useEffect(() => {
        fetch(projectSource.dataUrl)
            .then(response => response.json())
            .then((data: ProjectsData) => {
                const projectList = Object.values(data.projects);
                setProjects(projectList);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading projects:', error);
                setLoading(false);
            });
    }, [projectSource.dataUrl]);

    useEffect(() => {
        fetch('/assets/shared/branding/branding.json')
            .then(response => response.json())
            .then((data: BrandingProject[]) => {
                setBrandingProjects(data);
                setBrandingLoading(false);
            })
            .catch(error => {
                console.error('Error loading branding projects:', error);
                setBrandingLoading(false);
            });
    }, []);

    const getPortfolioBaseUrl = () => {
        const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
        return `${window.location.origin}${publicUrl}${projectSource.route}`;
    };

    const navigateToPortfolioSection = (sectionId?: string) => {
        const base = getPortfolioBaseUrl();
        const target = sectionId ? `${base}/#${sectionId}` : `${base}/`;
        window.location.href = target;
    };

    const scrollToSection = (sectionId: string) => {
        if (!document.getElementById(sectionId)) {
            navigateToPortfolioSection(sectionId);
            return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToProject = (sectionId: string) => {
        const path = window.location.pathname.replace(/\/+$/, '');
        if (path !== projectSource.route) {
            navigateToPortfolioSection(sectionId);
            return;
        }
        scrollToSection(sectionId);
    };

    const scrollToTop = () => {
        if (homeHref) {
            window.location.href = homeHref;
            return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getCurrentYear = () => {
        return new Date().getFullYear();
    };

    const handleBrandingClick = (project: BrandingProject) => {
        setSelectedBrandingProject(project);
        setIsBrandingModalOpen(true);
    };

    const handleCloseBrandingModal = () => {
        setIsBrandingModalOpen(false);
        setSelectedBrandingProject(null);
    };

    const getProjectIcon = (projectName: string) => {
        return projectSource.icons[projectName] || '/assets/shared/icons/More.svg';
    };

    return (
        <footer className={`footer ${variant === 'light' ? 'footer-light' : ''}`}>
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Projects</h3>
                        <ul className="footer-links">
                            {loading ? (
                                <li>Loading projects...</li>
                            ) : (
                                projects.map((project, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={() => scrollToProject(`project-${index + 1}`)}
                                            className="footer-link footer-link-with-icon"
                                        >
                                            <img
                                                src={getProjectIcon(project.name)}
                                                alt={`${project.name} icon`}
                                                className="footer-project-icon"
                                            />
                                            <span>{project.name}</span>
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Branding</h3>
                        <ul className="footer-links">
                            {brandingLoading ? (
                                <li>Loading branding...</li>
                            ) : (
                                brandingProjects.map((project) => (
                                    <li key={project.id}>
                                        <button
                                            onClick={() => handleBrandingClick(project)}
                                            className="footer-link footer-link-with-icon"
                                        >
                                            <img
                                                src="/assets/shared/modals/icons/modal_pdf.svg"
                                                alt="PDF icon"
                                                className="footer-pdf-icon"
                                            />
                                            <span>{project.title}</span>
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Connect</h3>
                        <ul className="footer-links">
                            <li>
                                <a
                                    href="mailto:zachary.w.rodgers@gmail.com"
                                    className="footer-link footer-link-with-icon"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Mail size={16} />
                                    <span>Email</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/zachrodgers"
                                    className="footer-link footer-link-with-icon"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Github size={16} />
                                    <span>GitHub</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.linkedin.com/in/zachrodgers1000/"
                                    className="footer-link footer-link-with-icon"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Linkedin size={16} />
                                    <span>LinkedIn</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Navigation</h3>
                        <ul className="footer-links">
                            <li>
                                <button
                                    onClick={scrollToTop}
                                    className="footer-link footer-link-with-icon"
                                >
                                    <ArrowUp size={16} />
                                    <span>Home</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToProject('project-1')}
                                    className="footer-link footer-link-with-icon"
                                >
                                    <FolderOpen size={16} />
                                    <span>Projects</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToSection('resume-section')}
                                    className="footer-link footer-link-with-icon"
                                >
                                    <FileText size={16} />
                                    <span>Resume</span>
                                </button>
                            </li>
                            <li>
                                <a
                                    href="/recipes"
                                    className="footer-link footer-link-with-icon"
                                >
                                    <CookingPot size={16} />
                                    <span>Recipes</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright">
                        <p>&copy; {getCurrentYear()} Zach Rodgers. All rights reserved.</p>
                    </div>
                    <div className="footer-logo">
                        <img
                            src="/assets/shared/icons/ZR.svg"
                            alt="Zach Rodgers Logo"
                            className="footer-logo-img"
                        />
                    </div>
                </div>
            </div>

            {selectedBrandingProject && (
                <PDFModal
                    isOpen={isBrandingModalOpen}
                    onClose={handleCloseBrandingModal}
                    pdfDirectory={selectedBrandingProject.pdfDirectory}
                    pageCount={selectedBrandingProject.pageCount}
                    title={selectedBrandingProject.title}
                    content={selectedBrandingProject.content}
                />
            )}
        </footer>
    );
};

export default Footer;
