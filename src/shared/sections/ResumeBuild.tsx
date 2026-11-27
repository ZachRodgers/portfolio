import GenerativeBuild from '../components/GenerativeBuild';
import './ResumeBuild.css';

export default function ResumeBuild() {
    return <GenerativeBuild
        targets=".profile-section, .experience-section, .education-section, .languages-section, .achievements-section, .skills-section"
        resizeTargets=".experience-section, .education-section, .achievements-section"
        progressTargets=".language-progress"
        rearrangeTargets=".skill-icon"
        skipRevealTargets=".resume-portrait"
    />;
}
