import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ImageModal from './ImageModal';
import VideoModal from './VideoModal';
import TextModal from './TextModal';
import PDFModal from './PDFModal';
import ModalButton from './ModalButton';

interface ModalConfig {
    id: string;
    type: 'video' | 'image' | 'text' | 'pdf';
    video?: string;
    image?: string;
    pdf?: string;
    pdfDirectory?: string;
    pageCount?: number;
    title: string;
    content: string;
    targetImage: string;
    targetLocation?: 'top_left' | 'top_mid' | 'top_right' | 'mid_left' | 'mid_mid' | 'mid_right' | 'bottom_left' | 'bottom_mid' | 'bottom_right';
}

interface ModalManagerProps {
    targetImage: string;
}

const ModalManager: React.FC<ModalManagerProps> = ({ targetImage }) => {
    const [modals, setModals] = useState<ModalConfig[]>([]);
    const [activeModal, setActiveModal] = useState<ModalConfig | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch('/assets/modals/modals.json')
            .then(response => response.json())
            .then(data => {
                setModals(data.modals);
            })
            .catch(error => {
                console.error('Error loading modals:', error);
            });
    }, []);

    const handleModalOpen = (modal: ModalConfig) => {
        setActiveModal(modal);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setActiveModal(null);
    };

    const relevantModals = modals.filter(modal => modal.targetImage === targetImage);

    if (relevantModals.length === 0) {
        return null;
    }

    return (
        <>
            {relevantModals.map(modal => (
                <ModalButton
                    key={modal.id}
                    modalType={modal.type}
                    onClick={() => handleModalOpen(modal)}
                    location={modal.targetLocation}
                />
            ))}

            {activeModal && createPortal(
                <>
                    {activeModal.type === 'video' && (
                        <VideoModal
                            isOpen={isModalOpen}
                            onClose={handleModalClose}
                            videoSrc={activeModal.video}
                            title={activeModal.title}
                            content={activeModal.content}
                        />
                    )}
                    {activeModal.type === 'image' && (
                        <ImageModal
                            isOpen={isModalOpen}
                            onClose={handleModalClose}
                            imageSrc={activeModal.image ? `/assets/modals/images/${activeModal.image}` : undefined}
                            title={activeModal.title}
                            content={activeModal.content}
                        />
                    )}
                    {activeModal.type === 'text' && (
                        <TextModal
                            isOpen={isModalOpen}
                            onClose={handleModalClose}
                            title={activeModal.title}
                            content={activeModal.content}
                        />
                    )}
                    {activeModal.type === 'pdf' && (
                        <PDFModal
                            isOpen={isModalOpen}
                            onClose={handleModalClose}
                            pdfDirectory={activeModal.pdfDirectory}
                            pageCount={activeModal.pageCount}
                            title={activeModal.title}
                            content={activeModal.content}
                        />
                    )}
                </>,
                document.body
            )}
        </>
    );
};

export default ModalManager;
