import React from 'react';
import './Modal.css';

interface TextModalProps {
    isOpen: boolean;
    onClose: () => void;
    text?: string;
}

const TextModal: React.FC<TextModalProps> = ({ isOpen, onClose, text }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>Text Modal</h2>
                <p>{text || 'Modal content goes here'}</p>
            </div>
        </div>
    );
};

export default TextModal;
