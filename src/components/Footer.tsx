import React, { useState, useEffect } from 'react';
import { Github, Mail, Linkedin, ArrowUp, FolderOpen, FileText } from 'lucide-react';
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

const Footer: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [brandingProjects, setBrandingProjects] = useState<BrandingProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [brandingLoading, setBrandingLoading] = useState(true);
    const [selectedBrandingProject, setSelectedBrandingProject] = useState<BrandingProject | null>(null);
    const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

    useEffect(() => {
        fetch('/assets/portfolio/projects.json')
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
    }, []);

    useEffect(() => {
        fetch('/assets/branding/branding.json')
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

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToTop = () => {
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
        const iconMap: { [key: string]: string } = {
            'Spark': '/assets/icons/project_icons/Spark.svg',
            'Obsidian': '/assets/icons/project_icons/Obsidian.svg',
            'Vital': '/assets/icons/project_icons/Vital.svg',
            'Batterola': '/assets/icons/project_icons/Batterola.svg'
        };
        return iconMap[projectName] || '/assets/icons/project_icons/More.svg';
    };

    return (
        <footer className="footer">
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
                                            onClick={() => scrollToSection(`project-${index + 1}`)}
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
                                                src="/assets/modals/icons/modal_pdf.svg"
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
                                    onClick={() => scrollToSection('project-1')}
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
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright">
                        <p>&copy; {getCurrentYear()} Zach Rodgers. All rights reserved.</p>
                    </div>
                    <div className="footer-logo">
                        <img
                            src="/assets/icons/project_icons/ZR.svg"
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
