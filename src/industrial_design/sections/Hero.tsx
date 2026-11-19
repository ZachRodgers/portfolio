import React, { useRef, useEffect, useState } from 'react';
import './Hero.css';

const Hero: React.FC = () => {
    // Configuration variables
    const SCROLL_HEIGHT = 1000; // Height in pixels to play through the video
    const STATIC_VIDEO = 'cube_static';
    const EXPLODE_VIDEO = 'cube_explode';
    const VIDEO_PATH = '/assets/hero/';

    const staticVideoRef = useRef<HTMLVideoElement>(null);
    const explodeVideoRef = useRef<HTMLVideoElement>(null);
    const [currentVideo, setCurrentVideo] = useState(STATIC_VIDEO);
    const [textTransform, setTextTransform] = useState(0);
    const lastScrollPosition = useRef<number>(0);
    const isScrollingDown = useRef<boolean>(true);
    const reverseStartTime = useRef<number>(0);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset;

            // Calculate text transform based on scroll position
            const maxScroll = 800; // 800px scroll distance
            const maxTransform = 400; // 400px transform distance
            const transformValue = Math.min(scrollTop / maxScroll, 1) * maxTransform;
            setTextTransform(transformValue);

            if (scrollTop === 0) {
                // At the very top, only switch to static if we're not in reverse mode
                // Let the reverse animation complete naturally
                if (currentVideo !== STATIC_VIDEO && isScrollingDown.current) {
                    setCurrentVideo(STATIC_VIDEO);
                }
            } else if (scrollTop > 0) {
                // Start scrolling, switch to explode video
                if (currentVideo !== EXPLODE_VIDEO) {
                    setCurrentVideo(EXPLODE_VIDEO);
                }

                if (explodeVideoRef.current && explodeVideoRef.current.duration) {
                    // Detect scroll direction
                    const scrollDelta = scrollTop - lastScrollPosition.current;
                    const wasScrollingDown = isScrollingDown.current;
                    const nowScrollingDown = scrollDelta > 0;

                    // If direction changed from down to up, capture the current time for reverse
                    if (wasScrollingDown && !nowScrollingDown && scrollDelta < 0) {
                        try {
                            // Only proceed if video is ready
                            if (explodeVideoRef.current.readyState >= 2 && explodeVideoRef.current.duration) {
                                console.log('Switching to reverse mode');
                                reverseStartTime.current = explodeVideoRef.current.currentTime;
                                isScrollingDown.current = false;
                                // Stop the video and start reverse animation
                                explodeVideoRef.current.pause();
                                startReverseAnimation();
                            }
                        } catch (error) {
                            console.log('Error switching to reverse:', error);
                        }
                    } else if (!wasScrollingDown && nowScrollingDown && scrollDelta > 0) {
                        try {
                            console.log('Switching to forward mode');
                            isScrollingDown.current = true;
                            // Stop reverse animation and start forward
                            if (animationFrameRef.current) {
                                cancelAnimationFrame(animationFrameRef.current);
                            }
                            if (explodeVideoRef.current.readyState >= 2) {
                                explodeVideoRef.current.playbackRate = 1.0; // Reset to normal speed
                                explodeVideoRef.current.play();
                            }
                        } catch (error) {
                            console.log('Error switching to forward:', error);
                        }
                    }

                    lastScrollPosition.current = scrollTop;
                }
            }
        };

        // Alternative approach: Use video playback rate manipulation
        const startReverseAnimation = () => {
            if (explodeVideoRef.current && explodeVideoRef.current.readyState >= 2) {
                console.log('Starting reverse animation');

                // Try to use native reverse playback
                try {
                    explodeVideoRef.current.playbackRate = -1.0;
                    explodeVideoRef.current.play();

                    // Monitor when we reach the beginning
                    const checkReverse = () => {
                        if (explodeVideoRef.current && !isScrollingDown.current && currentVideo === EXPLODE_VIDEO) {
                            if (explodeVideoRef.current.currentTime <= 0.1) {
                                console.log('Reverse complete via native playback');
                                explodeVideoRef.current.pause();
                                explodeVideoRef.current.currentTime = 0;
                                explodeVideoRef.current.playbackRate = 1.0;
                                setCurrentVideo(STATIC_VIDEO);
                            } else {
                                setTimeout(checkReverse, 50);
                            }
                        }
                    };
                    checkReverse();
                } catch (error) {
                    console.log('Native reverse failed, using manual method');
                    // Fallback to manual reverse with larger steps for better visibility
                    const startTime = explodeVideoRef.current.currentTime;
                    let targetTime = startTime;

                    const manualReverse = () => {
                        if (explodeVideoRef.current && !isScrollingDown.current && currentVideo === EXPLODE_VIDEO) {
                            targetTime -= 0.1; // Larger steps for more visible changes

                            if (targetTime <= 0.1) {
                                console.log('Manual reverse complete');
                                explodeVideoRef.current.currentTime = 0;
                                explodeVideoRef.current.pause();
                                setCurrentVideo(STATIC_VIDEO);
                            } else {
                                explodeVideoRef.current.currentTime = targetTime;
                                setTimeout(manualReverse, 100); // Slower for more visible changes
                            }
                        }
                    };
                    manualReverse();
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [currentVideo]);

    // Handle video initialization - both videos are always loaded
    useEffect(() => {
        const initializeVideos = () => {
            if (staticVideoRef.current) {
                staticVideoRef.current.currentTime = 0;
                staticVideoRef.current.loop = true;
                if (currentVideo === STATIC_VIDEO) {
                    staticVideoRef.current.play();
                }
            }

            if (explodeVideoRef.current) {
                explodeVideoRef.current.currentTime = 0;
                explodeVideoRef.current.loop = false;
                if (currentVideo === EXPLODE_VIDEO) {
                    explodeVideoRef.current.play();
                }
            }
        };

        initializeVideos();
    }, [currentVideo]);

    return (
        <section className="hero-container">
            {/* Static cube video - always loaded */}
            <video
                ref={staticVideoRef}
                className="hero-video"
                muted
                playsInline
                preload="auto"
                loop
                style={{
                    opacity: currentVideo === STATIC_VIDEO ? 1 : 0,
                    transition: currentVideo === STATIC_VIDEO ? 'opacity 0.1s ease-in-out' : 'opacity 0.1s ease-in-out 0.1s',
                }}
            >
                <source src={`${VIDEO_PATH}${STATIC_VIDEO}.mp4`} type="video/mp4" />
            </video>

            {/* Explode cube video - always loaded */}
            <video
                ref={explodeVideoRef}
                className="hero-video"
                muted
                playsInline
                preload="auto"
                style={{
                    opacity: currentVideo === EXPLODE_VIDEO ? 1 : 0,
                    transition: currentVideo === EXPLODE_VIDEO ? 'opacity 0.1s ease-in-out' : 'opacity 0.1s ease-in-out 0.1s',
                }}
            >
                <source src={`${VIDEO_PATH}${EXPLODE_VIDEO}.mp4`} type="video/mp4" />
            </video>

            {/* Text overlay */}
            <div
                className="hero-text-overlay"
                style={{
                    transform: `translate(-50%, calc(-50% + ${textTransform}px))`
                }}
            >
                <h1
                    className="hero-name"
                    style={{
                        '--gradient-stop': `${Math.min(textTransform / 4, 52)}%`
                    } as React.CSSProperties}
                >
                    zach rodgers
                </h1>
                <p
                    className="hero-subtitle"
                    style={{
                        color: 'var(--text-primary)'
                    }}
                >
                    industrial design portfolio
                </p>
            </div>
        </section>
    );
};

export default Hero;
