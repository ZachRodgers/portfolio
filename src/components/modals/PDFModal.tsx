import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './PDFModal.css';

interface PDFModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfDirectory?: string;
    pageCount?: number;
    title?: string;
    content?: string;
}

const PDFModal: React.FC<PDFModalProps> = ({ isOpen, onClose, pdfDirectory, pageCount, title, content }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pages, setPages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayContainer, setDisplayContainer] = useState<HTMLDivElement | null>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(0);
    const [dragStartScroll, setDragStartScroll] = useState(0);
    const [scrollbarHeight, setScrollbarHeight] = useState(400);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePreviousPage();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                handleNextPage();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, currentPage, pageCount]);

    useEffect(() => {
        if (isOpen && pdfDirectory && pageCount) {
            loadPages();
        }
    }, [isOpen, pdfDirectory, pageCount]);

    useEffect(() => {
        const handleScroll = () => {
            if (displayContainer) {
                const { scrollTop, scrollHeight, clientHeight } = displayContainer;
                const progress = scrollTop / (scrollHeight - clientHeight);
                setScrollProgress(Math.max(0, Math.min(1, progress)));

                // Update current page based on scroll position
                const pageElements = displayContainer.querySelectorAll('[data-page]');
                const containerRect = displayContainer.getBoundingClientRect();
                const containerCenter = containerRect.top + containerRect.height / 2;

                let closestPage = 1;
                let minDistance = Infinity;

                pageElements.forEach((element) => {
                    const elementRect = element.getBoundingClientRect();
                    const elementCenter = elementRect.top + elementRect.height / 2;
                    const distance = Math.abs(elementCenter - containerCenter);

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPage = parseInt(element.getAttribute('data-page') || '1');
                    }
                });

                setCurrentPage(closestPage);
            }
        };

        if (displayContainer) {
            displayContainer.addEventListener('scroll', handleScroll);
            handleScroll(); // Initialize scroll position
            return () => displayContainer.removeEventListener('scroll', handleScroll);
        }
    }, [displayContainer]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && displayContainer) {
                const deltaY = e.clientY - dragStartY;
                const scrollHeight = displayContainer.scrollHeight - displayContainer.clientHeight;
                const scrollbarTrackHeight = scrollbarHeight;
                const scrollRatio = deltaY / scrollbarTrackHeight;
                const newScroll = dragStartScroll + (scrollRatio * scrollHeight);
                displayContainer.scrollTop = Math.max(0, Math.min(scrollHeight, newScroll));
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStartY, dragStartScroll, displayContainer, scrollbarHeight]);

    const loadPages = async () => {
        if (!pdfDirectory || !pageCount) return;

        setLoading(true);
        setError(null);

        try {
            const pagePaths: string[] = [];
            for (let i = 1; i <= pageCount; i++) {
                pagePaths.push(`/assets/modals/pdfs/${pdfDirectory}/page${i}.jpg`);
            }
            setPages(pagePaths);
            setCurrentPage(1);
        } catch (err) {
            setError('Failed to load PDF pages');
            console.error('Error loading PDF pages:', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToPage = (pageNumber: number) => {
        if (displayContainer) {
            const pageElement = displayContainer.querySelector(`[data-page="${pageNumber}"]`) as HTMLElement;
            if (pageElement) {
                pageElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            scrollToPage(newPage);
        }
    };

    const handleNextPage = () => {
        if (currentPage < (pageCount || 1)) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            scrollToPage(newPage);
        }
    };

    const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        scrollToPage(pageNumber);
    };

    const handleScrollbarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (displayContainer) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const percentage = clickY / rect.height;
            const maxScroll = displayContainer.scrollHeight - displayContainer.clientHeight;
            const targetScroll = percentage * maxScroll;

            displayContainer.scrollTop = targetScroll;
        }
    };

    const handleScrollbarThumbClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    const handleThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStartY(e.clientY);
        setDragStartScroll(displayContainer?.scrollTop || 0);
    };

    if (!isOpen) return null;

    return (
        <div className="pdf-modal-overlay" onClick={onClose}>
            <div className="pdf-modal-content" onClick={e => e.stopPropagation()}>
                <button className="pdf-modal-close" onClick={onClose}>
                    Close (Esc) <X className="pdf-modal-close-icon" />
                </button>

                <div className="pdf-modal-header">
                    <img
                        src="/assets/modals/icons/modal_pdf.svg"
                        alt="PDF icon"
                        className="pdf-modal-icon"
                    />
                    <div className="pdf-modal-text-container">
                        <h2 className="pdf-modal-title">{title || 'PDF Document'}</h2>
                        <p className="pdf-modal-description">{content || 'PDF content goes here'}</p>
                    </div>
                </div>

                <div className="pdf-modal-main-content">
                    <div className="pdf-modal-nav-column">
                        <div className="pdf-modal-page-info">
                            Page {currentPage} of {pageCount || 0}
                        </div>
                        <div className="pdf-modal-nav-buttons">
                            <button
                                className="pdf-modal-nav-button"
                                onClick={handlePreviousPage}
                                disabled={currentPage <= 1}
                            >
                                <ChevronLeft size={16} />
                                Previous (Up)
                            </button>
                            <button
                                className="pdf-modal-nav-button"
                                onClick={handleNextPage}
                                disabled={currentPage >= (pageCount || 1)}
                            >
                                <ChevronRight size={16} />
                                Next (Down)
                            </button>
                            <button
                                className="pdf-modal-nav-button"
                                onClick={onClose}
                            >
                                <X size={16} />
                                Close (Esc)
                            </button>
                        </div>
                    </div>

                    <div className="pdf-modal-display-column">
                        <div
                            className="pdf-modal-display-container"
                            ref={setDisplayContainer}
                        >
                            {loading ? (
                                <div className="pdf-modal-loading">Loading PDF pages...</div>
                            ) : error ? (
                                <div className="pdf-modal-error">{error}</div>
                            ) : pages.length > 0 ? (
                                <div className="pdf-modal-pages-stack">
                                    {pages.map((page, index) => (
                                        <img
                                            key={index}
                                            src={page}
                                            alt={`Page ${index + 1}`}
                                            className="pdf-modal-page-display"
                                            data-page={index + 1}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="pdf-modal-loading">No pages available</div>
                            )}

                        </div>

                        {/* Bottom Gradient Overlay */}
                        <div className="pdf-modal-bottom-gradient" />
                    </div>

                    <div className="pdf-modal-scrollbar-column">
                        {/* Custom Scrollbar */}
                        {pages.length > 0 && displayContainer && (
                            <div
                                className="pdf-modal-custom-scrollbar"
                                ref={(el) => {
                                    if (el) {
                                        setScrollbarHeight(el.clientHeight);
                                    }
                                }}
                            >
                                <div
                                    className="pdf-modal-scrollbar-track"
                                    onClick={handleScrollbarClick}
                                >
                                    <div
                                        className="pdf-modal-scrollbar-thumb"
                                        onClick={handleScrollbarThumbClick}
                                        onMouseDown={handleThumbMouseDown}
                                        style={{
                                            height: `${Math.max(20, (displayContainer.clientHeight / displayContainer.scrollHeight) * scrollbarHeight)}px`,
                                            top: `${scrollProgress * (scrollbarHeight - Math.max(20, (displayContainer.clientHeight / displayContainer.scrollHeight) * scrollbarHeight))}px`
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pdf-modal-preview-column">
                        <div className="pdf-modal-preview-scroll">
                            {pages.map((page, index) => (
                                <div
                                    key={index}
                                    className={`pdf-modal-preview-item ${index + 1 === currentPage ? 'active' : 'inactive'
                                        }`}
                                    onClick={() => handlePageClick(index + 1)}
                                >
                                    <img
                                        src={page}
                                        alt={`Page ${index + 1} preview`}
                                        className="pdf-modal-preview-image"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFModal;