import React, { useState, useEffect } from 'react';
import { Github, Mail, Linkedin, ArrowUp, FolderOpen, FileText, CookingPot } from 'lucide-react';
import PDFModal from './modals/PDFModal';
import './Footer.css';

interface Project {
    id: string;
    name: string;
    icon?: string;
}

interface ProjectSource {
    route: string;
    dataUrl?: string;
    icons?: Record<string, string>;
    items?: Project[];
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
    currentRoute: string;
    mainRoute: string;
    resumeRoute: string;
    pages: Array<{ route: string; label: string }>;
    projectSource: ProjectSource;
};

const Footer: React.FC<FooterProps> = ({ variant = 'default', projectSource, currentRoute, mainRoute, resumeRoute, pages }) => {
    const [projects, setProjects] = useState<Project[]>(projectSource.items || []);
    const [brandingProjects, setBrandingProjects] = useState<BrandingProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [brandingLoading, setBrandingLoading] = useState(true);
    const [selectedBrandingProject, setSelectedBrandingProject] = useState<BrandingProject | null>(null);
    const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setProjects(projectSource.items || []);
        setLoading(!!projectSource.dataUrl);
        if (!projectSource.dataUrl) return;
        fetch(projectSource.dataUrl)
            .then(response => {
                if (!response.ok) throw new Error(`Project request failed: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (cancelled) return;
                setProjects(Object.entries(data.projects).map(([number, project]) => ({
                    id: `project-${number}`,
                    name: (project as { name: string }).name,
                })));
            })
            .catch(error => {
                if (!cancelled) console.error('Error loading projects:', error);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [projectSource.dataUrl, projectSource.items]);

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

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const scrollToSection = (event: React.MouseEvent<HTMLAnchorElement>, route: string, id: string) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (route !== currentRoute) return;
        const target = document.getElementById(id);
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
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
                                projects.map((project) => (
                                    <li key={project.id}>
                                        <a
                                            href={`${projectSource.route}#${project.id}`}
                                            onClick={event => scrollToSection(event, projectSource.route, project.id)}
                                            className="footer-link footer-link-with-icon"
                                        >
                                            <img
                                                src={project.icon || projectSource.icons?.[project.name] || '/assets/shared/icons/More.svg'}
                                                alt={`${project.name} icon`}
                                                className="footer-project-icon"
                                            />
                                            <span>{project.name}</span>
                                        </a>
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
                                <button onClick={scrollToTop} className="footer-link footer-link-with-icon">
                                    <ArrowUp size={16} />
                                    <span>{currentRoute === mainRoute ? 'Home' : 'Top'}</span>
                                </button>
                            </li>
                            <li>
                                <a
                                    href={`${resumeRoute}#resume-section`}
                                    onClick={event => scrollToSection(event, resumeRoute, 'resume-section')}
                                    className="footer-link footer-link-with-icon"
                                >
                                    <FileText size={16} />
                                    <span>Resume</span>
                                </a>
                            </li>
                            {pages.filter(page => page.route !== currentRoute).map(page => (
                                <li key={page.route}>
                                    <a href={page.route} className="footer-link footer-link-with-icon">
                                        {page.route === '/recipes' ? <CookingPot size={16} /> : <FolderOpen size={16} />}
                                        <span>{page.label}</span>
                                    </a>
                                </li>
                            ))}
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
