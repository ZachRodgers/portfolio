import React from 'react';
import './Modal.css';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageSrc }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>Image Modal</h2>
                {imageSrc && <img src={imageSrc} alt="Modal content" />}
            </div>
        </div>
    );
};

export default ImageModal;
