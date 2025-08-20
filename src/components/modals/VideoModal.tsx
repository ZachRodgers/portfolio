import React from 'react';
import './Modal.css';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoSrc?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoSrc }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>Video Modal</h2>
                {videoSrc && <video src={videoSrc} controls width="100%" />}
            </div>
        </div>
    );
};

export default VideoModal;
