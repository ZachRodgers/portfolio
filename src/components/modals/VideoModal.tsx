import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoSrc?: string;
    title?: string;
    content?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoSrc, title, content }) => {
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

    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    Close (Esc) <X className="modal-close-icon" />
                </button>
                <div className="modal-main-content">
                    <div className="modal-media">
                        {videoSrc && (
                            <iframe
                                src={getYouTubeEmbedUrl(videoSrc)}
                                title="Video content"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>
                    <div className="modal-footer">
                        <div className="modal-header">
                            <img
                                src="/assets/modals/icons/modal_video.svg"
                                alt="Video icon"
                                className="modal-icon"
                            />
                            <div className="modal-text-container">
                                <h2 className="modal-title">{title || 'Video Modal'}</h2>
                                <p className="modal-description">{content || 'Video content goes here'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
