import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface TextModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    content?: string;
}

const TextModal: React.FC<TextModalProps> = ({ isOpen, onClose, title, content }) => {
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
                    <div className="modal-footer text-modal-content" style={{ flex: 1, borderTop: 'none' }}>
                        <div className="modal-header">
                            <img
                                src="/assets/modals/icons/modal_info.svg"
                                alt="Info icon"
                                className="modal-icon"
                            />
                            <div className="modal-text-container">
                                <h2 className="modal-title">{title || 'Text Modal'}</h2>
                                <p className="modal-description">{content || 'Text content goes here'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextModal;
