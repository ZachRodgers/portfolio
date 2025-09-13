import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface PDFModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfSrc?: string;
    title?: string;
    content?: string;
}

const PDFModal: React.FC<PDFModalProps> = ({ isOpen, onClose, pdfSrc, title, content }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    Close (Esc) <X className="modal-close-icon" />
                </button>
                <div className="modal-main-content">
                    <div className="modal-media">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            fontSize: '2rem',
                            color: '#666',
                            fontWeight: 'bold'
                        }}>
                            Coming Soon
                        </div>
                    </div>
                    <div className="modal-footer">
                        <div className="modal-header">
                            <img
                                src="/assets/modals/icons/modal_pdf.svg"
                                alt="PDF icon"
                                className="modal-icon"
                            />
                            <div className="modal-text-container">
                                <h2 className="modal-title">{title || 'PDF Modal'}</h2>
                                <p className="modal-description">{content || 'PDF content goes here'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFModal;