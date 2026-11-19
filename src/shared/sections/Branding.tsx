import React, { useState, useEffect } from 'react';
import PDFModal from '../components/modals/PDFModal';
import './Branding.css';

interface BrandingProject {
    id: string;
    type: string;
    pdfDirectory: string;
    pageCount: number;
    title: string;
    content: string;
}

const Branding: React.FC = () => {
    const [projects, setProjects] = useState<BrandingProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<BrandingProject | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBrandingProjects = async () => {
            try {
                const response = await fetch('/assets/branding/branding.json');
                const data = await response.json();
                setProjects(data);
            } catch (error) {
                console.error('Error loading branding projects:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBrandingProjects();
    }, []);

    const handleCardClick = (project: BrandingProject) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    if (loading) {
        return (
            <section className="branding-section">
                <div className="branding-container">
                    <h1 className="branding-title">Checkout some of my branding work:</h1>
                    <div>Loading...</div>
                </div>
            </section>
        );
    }

    return (
        <section className="branding-section">
            <div className="branding-container">
                <h1 className="branding-title">Checkout some of my branding work:</h1>

                <div className="branding-grid">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="branding-card"
                            onClick={() => handleCardClick(project)}
                        >
                            <div className="branding-card-image-container">
                                <img
                                    src={`/assets/modals/pdfs/${project.pdfDirectory}/page1.jpg`}
                                    alt={project.title}
                                    className="branding-card-image"
                                />
                                <div className="branding-card-overlay">
                                    <img
                                        src="/assets/modals/icons/modal_pdf.svg"
                                        alt="PDF icon"
                                        className="branding-pdf-icon"
                                    />
                                </div>
                            </div>
                            <div className="branding-card-content">
                                <h2 className="branding-card-title">{project.title}</h2>
                                <p className="branding-card-description">{project.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedProject && (
                <PDFModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    pdfDirectory={selectedProject.pdfDirectory}
                    pageCount={selectedProject.pageCount}
                    title={selectedProject.title}
                    content={selectedProject.content}
                />
            )}
        </section>
    );
};

export default Branding;
