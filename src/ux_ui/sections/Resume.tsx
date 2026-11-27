import React from 'react';
import SharedResume from '../../shared/sections/Resume';
import content from '../content/page.json';

const Resume: React.FC = () => <SharedResume animated dataUrl={content.resumeDataUrl} />;

export default Resume;
