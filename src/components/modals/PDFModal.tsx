import React from 'react';
import './Modal.css';

interface PDFModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfSrc?: string;
}

const PDFModal: React.FC<PDFModalProps> = ({ isOpen, onClose, pdfSrc }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>PDF Modal</h2>
                {pdfSrc && <iframe src={pdfSrc} width="100%" height="500px" />}
            </div>
        </div>
    );
};

export default PDFModal;
