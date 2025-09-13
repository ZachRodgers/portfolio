import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc?: string;
    title?: string;
    content?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageSrc, title, content }) => {
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
                        {imageSrc && <img src={imageSrc} alt="Modal content" />}
                    </div>
                    <div className="modal-footer">
                        <div className="modal-header">
                            <img
                                src="/assets/modals/icons/modal_photo.svg"
                                alt="Image icon"
                                className="modal-icon"
                            />
                            <div className="modal-text-container">
                                <h2 className="modal-title">{title || 'Image Modal'}</h2>
                                <p className="modal-description">{content || 'Image content goes here'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
