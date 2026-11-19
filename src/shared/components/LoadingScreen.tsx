import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
    isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
    const [shouldRender, setShouldRender] = useState(isLoading);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setFadeOut(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setShouldRender(true);
            setFadeOut(false);
        }
    }, [isLoading]);

    if (!shouldRender) return null;

    return (
        <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
            <div className="loading-container">
                <svg width="300" height="300" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                    <rect id="logo-background" width="500" height="500" rx="20" />

                    <path className="logo-bg-path" d="M301.763 244.442C348.408 211.095 335.939 143.01 290.679 118C398.748 123.558 426.92 203.684 335.939 242.589C380.56 258.579 402.905 276.863 398.748 315.305C394.592 353.747 399.672 375.979 432 368.568C421.987 378.08 414.777 381.953 395.316 382C395.076 382 394.835 382 394.592 382C354.412 382 338.71 370.421 338.71 322.715C338.71 275.01 328.304 260.365 301.763 244.442Z" />
                    <path className="logo-bg-path" d="M79.1603 202.758V118.463H163.214C116.817 139.318 98.3258 157.691 79.1603 202.758Z" />
                    <path className="logo-bg-path" d="M279.134 300.484C257.978 344.217 240.769 362.041 200.622 382H279.134V300.484Z" />
                    <path className="logo-bg-path" d="M230.179 118H277.748C277.748 118 155.081 354.21 148.525 366.715C141.969 379.221 136.427 382 122.111 382H69C69 382 202.171 139.768 207.401 130.042C212.63 120.316 218.634 118 230.179 118Z" />

                    <path id="logo-stroke-1" className="logo-stroke" d="M301.763 244.442C348.408 211.095 335.939 143.01 290.679 118C398.748 123.558 426.92 203.684 335.939 242.589C380.56 258.579 402.905 276.863 398.748 315.305C394.592 353.747 399.672 375.979 432 368.568C421.987 378.08 414.777 381.953 395.316 382C395.076 382 394.835 382 394.592 382C354.412 382 338.71 370.421 338.71 322.715C338.71 275.01 328.304 260.365 301.763 244.442Z" />
                    <path id="logo-stroke-2" className="logo-stroke" d="M79.1603 202.758V118.463H163.214C116.817 139.318 98.3258 157.691 79.1603 202.758Z" />
                    <path id="logo-stroke-3" className="logo-stroke" d="M279.134 300.484C257.978 344.217 240.769 362.041 200.622 382H279.134V300.484Z" />
                    <path id="logo-stroke-4" className="logo-stroke" d="M230.179 118H277.748C277.748 118 155.081 354.21 148.525 366.715C141.969 379.221 136.427 382 122.111 382H69C69 382 202.171 139.768 207.401 130.042C212.63 120.316 218.634 118 230.179 118Z" />
                </svg>
            </div>
        </div>
    );
};

export default LoadingScreen;
