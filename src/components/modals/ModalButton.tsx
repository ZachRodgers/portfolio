import React from 'react';
import './Modal.css';

interface ModalButtonProps {
    modalType: 'video' | 'image' | 'text' | 'pdf';
    onClick: () => void;
    location?: 'top_left' | 'top_mid' | 'top_right' | 'mid_left' | 'mid_mid' | 'mid_right' | 'bottom_left' | 'bottom_mid' | 'bottom_right';
}

const ModalButton: React.FC<ModalButtonProps> = ({ modalType, onClick, location = 'mid_mid' }) => {
    const getIconSrc = () => {
        switch (modalType) {
            case 'video':
                return '/assets/modals/icons/modal_video.svg';
            case 'image':
                return '/assets/modals/icons/modal_photo.svg';
            case 'text':
                return '/assets/modals/icons/modal_info.svg';
            case 'pdf':
                return '/assets/modals/icons/modal_pdf.svg';
            default:
                return '/assets/modals/icons/modal_info.svg';
        }
    };

    return (
        <button className={`modal-button ${location}`} onClick={onClick}>
            <img
                src={getIconSrc()}
                alt={`${modalType} modal`}
                className="modal-button-icon"
            />
        </button>
    );
};

export default ModalButton;
