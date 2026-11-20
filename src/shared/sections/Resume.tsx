import React, { useState, useEffect, useRef } from 'react';
import './Resume.css';
import CellRevealImage from '../components/CellRevealImage';
import ResumeBuild from './ResumeBuild';

interface ResumeData {
    columns: {
        column1: number;
        column2: number;
        column3: number;
    };
    profile: {
        image: string;
        name: string;
        statement: string;
    };
    experience: Array<{
        icon: string;
        title: string;
        company: string;
        date: string;
        description: string;
    }>;
    education: Array<{
        icon: string;
        title: string;
        institution: string;
        date: string;
        description: string;
    }>;
    languages: Array<{
        name: string;
        percentage: number;
    }>;
    achievements: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
    skills: {
        numberOfIcons: number;
    };
}

interface ResumeProps {
    dataUrl: string;
    animated?: boolean;
}

const Resume: React.FC<ResumeProps> = ({ dataUrl, animated = false }) => {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sectionsInView, setSectionsInView] = useState({
        experience: false,
        education: false,
        languages: false,
        achievements: false,
        skills: false
    });

    const experienceRef = useRef<HTMLDivElement>(null);
    const educationRef = useRef<HTMLDivElement>(null);
    const languagesRef = useRef<HTMLDivElement>(null);
    const achievementsRef = useRef<HTMLDivElement>(null);
    const skillsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        setLoading(true);
        setResumeData(null);
        const loadResumeData = async () => {
            try {
                const response = await fetch(dataUrl, { signal: controller.signal });
                if (!response.ok) throw new Error(`Resume request failed: ${response.status}`);
                const data = await response.json();
                if (!cancelled) setResumeData(data);
            } catch (error) {
                if (!cancelled) console.error('Error loading resume data:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadResumeData();
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [dataUrl]);

    useEffect(() => {
        const checkSectionsInView = () => {
            const sections = {
                experience: experienceRef.current,
                education: educationRef.current,
                languages: languagesRef.current,
                achievements: achievementsRef.current,
                skills: skillsRef.current
            };

            const newSectionsInView = {
                experience: false,
                education: false,
                languages: false,
                achievements: false,
                skills: false
            };

            Object.entries(sections).forEach(([key, element]) => {
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    newSectionsInView[key as keyof typeof newSectionsInView] = isVisible;
                }
            });


            setSectionsInView(newSectionsInView);
        };

        // Check on load
        checkSectionsInView();

        // Check on scroll
        const handleScroll = () => {
            checkSectionsInView();
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [resumeData]);

    if (loading) {
        return <div className="component-container">Loading resume...</div>;
    }

    if (!resumeData) {
        return <div className="component-container">Error loading resume data</div>;
    }

    return (
        <section id="resume-section" className={`component-container ${animated ? 'resume-studio' : ''}`}>
            {animated && <ResumeBuild />}
            <div className="resume-container">
                <div className="resume-column" style={{ width: `${resumeData.columns.column1}%` }}>
                    <div className="profile-section">
                        {animated ? <ResumePortrait src={`/assets/shared/resume/${resumeData.profile.image}`} alt={resumeData.profile.name} /> : <img
                            src={`/assets/shared/resume/${resumeData.profile.image}`}
                            alt={resumeData.profile.name}
                            className="profile-image"
                        />}
                        <h1 className="profile-name">{resumeData.profile.name}</h1>
                        <p className="profile-statement">{resumeData.profile.statement}</p>
                    </div>
                </div>

                <div className="resume-column" style={{ width: `${resumeData.columns.column2}%` }}>
                    <div ref={experienceRef} className={`experience-section ${sectionsInView.experience ? 'animate' : ''}`}>
                        <h2 className="section-title">Experience</h2>
                        {resumeData.experience.map((job, index) => (
                            <div key={index} className="experience-item">
                                <div className="experience-header">
                                    <img
                                        src={`/assets/shared/resume/${job.icon}`}
                                        alt={job.company}
                                        className="experience-icon"
                                        style={{
                                            animationDelay: `${0.2 + index * 0.15}s`
                                        }}
                                    />
                                    <div className="experience-header-content">
                                        <h2 className="job-title">{job.title}</h2>
                                        <p className="job-company">{job.company} | {job.date}</p>
                                    </div>
                                </div>
                                <p className="job-description">{job.description}</p>
                            </div>
                        ))}
                    </div>

                    <div ref={educationRef} className={`education-section ${sectionsInView.education ? 'animate' : ''}`}>
                        <h2 className="section-title">Education</h2>
                        {resumeData.education.map((edu, index) => (
                            <div key={index} className="education-item">
                                <div className="education-header">
                                    <img
                                        src={`/assets/shared/resume/${edu.icon}`}
                                        alt={edu.institution}
                                        className="education-icon"
                                        style={{
                                            animationDelay: `${0.8 + index * 0.15}s`
                                        }}
                                    />
                                    <div className="education-header-content">
                                        <h2 className="education-title">{edu.title}</h2>
                                        <p className="education-institution">{edu.institution} | {edu.date}</p>
                                    </div>
                                </div>
                                <p className="education-description">{edu.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="resume-column" style={{ width: `${resumeData.columns.column3}%` }}>
                    <div ref={languagesRef} className={`languages-section ${sectionsInView.languages ? 'animate' : ''}`}>
                        <h2 className="section-title">Languages</h2>
                        {resumeData.languages.map((language, index) => (
                            <div key={index} className="language-item">
                                <p className="language-name">{language.name}</p>
                                <div className="language-bar">
                                    <div
                                        className="language-progress"
                                        style={{
                                            '--target-width': `${language.percentage}%`,
                                            animationDelay: `${0.5 + index * 0.2}s`
                                        } as React.CSSProperties}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div ref={achievementsRef} className={`achievements-section ${sectionsInView.achievements ? 'animate' : ''}`}>
                        <h2 className="section-title">Achievements</h2>
                        {resumeData.achievements.map((achievement, index) => (
                            <div key={index} className="achievement-item">
                                <div className="achievement-header">
                                    <img
                                        src={`/assets/shared/resume/${achievement.icon}`}
                                        alt={achievement.title}
                                        className="achievement-icon"
                                        style={{
                                            animationDelay: `${1.2 + index * 0.15}s`
                                        }}
                                    />
                                    <div className="achievement-header-content">
                                        <h2 className="achievement-title">{achievement.title}</h2>
                                        <p className="achievement-description">{achievement.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div ref={skillsRef} className={`skills-section ${sectionsInView.skills ? 'animate' : ''}`}>
                        <h2 className="section-title">Skills</h2>
                        <div className="skills-grid">
                            {Array.from({ length: resumeData.skills.numberOfIcons }, (_, index) => (
                                <img
                                    key={index}
                                    src={`/assets/shared/resume/app_icons/app${index + 1}.png`}
                                    alt={`Skill ${index + 1}`}
                                    className="skill-icon"
                                    style={{
                                        animationDelay: `${1.5 + index * 0.1}s`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

function ResumePortrait({ src, alt }: { src: string; alt: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
        }, { threshold: .2 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return <div ref={ref} className="resume-portrait"><CellRevealImage src={src} alt={alt} visible={visible} className="profile-image" durationMs={1100} /></div>;
}

export default Resume;
