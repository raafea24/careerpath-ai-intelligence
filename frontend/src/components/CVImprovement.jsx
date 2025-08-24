import React, { useState } from 'react';

// Helper function to analyze skills and identify potential gaps
const analyzeSkills = (skills = []) => {
  // Common skills that are valuable across different roles
  const commonTechSkills = [
    "javascript", "typescript", "python", "java", "c#", "react", "angular", "vue", "node.js", 
    "express", "django", "spring", "aws", "azure", "git", "docker", "kubernetes", "ci/cd"
  ];
  
  const commonSoftSkills = [
    "communication", "teamwork", "leadership", "problem-solving", "time management", 
    "project management", "agile", "scrum"
  ];
  
  const technicalSkillsPresent = skills.filter(skill => 
    commonTechSkills.some(techSkill => 
      skill.toLowerCase().includes(techSkill.toLowerCase())
    )
  );
  
  const softSkillsPresent = skills.filter(skill => 
    commonSoftSkills.some(softSkill => 
      skill.toLowerCase().includes(softSkill.toLowerCase())
    )
  );
  
  const missingTechSkills = commonTechSkills.filter(techSkill => 
    !skills.some(skill => skill.toLowerCase().includes(techSkill.toLowerCase()))
  );
  
  const missingSoftSkills = commonSoftSkills.filter(softSkill => 
    !skills.some(skill => skill.toLowerCase().includes(softSkill.toLowerCase()))
  );
  
  const recommendations = [];
  
  if (technicalSkillsPresent.length < 3) {
    recommendations.push("Consider adding more technical skills to your CV. Technical skills demonstrate your hands-on capabilities.");
  }
  
  if (softSkillsPresent.length < 2) {
    recommendations.push("Consider adding more soft skills to your CV. Employers value candidates with strong interpersonal and communication abilities.");
  }
  
  if (missingTechSkills.length > 0) {
    const suggestedSkills = missingTechSkills.slice(0, 3);
    recommendations.push(`Consider learning and adding these in-demand technical skills: ${suggestedSkills.join(', ')}.`);
  }
  
  if (missingSoftSkills.length > 0) {
    const suggestedSkills = missingSoftSkills.slice(0, 2);
    recommendations.push(`Consider highlighting these valuable soft skills if you possess them: ${suggestedSkills.join(', ')}.`);
  }
  
  return recommendations;
};

// Helper function to analyze education
const analyzeEducation = (education) => {
  const recommendations = [];
  
  if (!education || 
     (typeof education === 'string' && education.length < 20) || 
     (Array.isArray(education) && education.length === 0)) {
    recommendations.push("Consider providing more details about your educational background, including degrees, institutions, and graduation dates.");
  }
  
  if (Array.isArray(education)) {
    // Check for missing details in education entries
    education.forEach((edu, index) => {
      if (typeof edu === 'object') {
        if (!edu.degree || edu.degree.length < 3) {
          recommendations.push(`Education entry #${index + 1}: Consider adding your degree or certification title.`);
        }
        if (!edu.institution || edu.institution.length < 3) {
          recommendations.push(`Education entry #${index + 1}: Consider adding the name of your educational institution.`);
        }
      }
    });
  }
  
  return recommendations;
};

// Helper function to analyze work experience
const analyzeWorkExperience = (experience) => {
  const recommendations = [];
  
  if (!experience || 
     (typeof experience === 'string' && experience.length < 30) || 
     (Array.isArray(experience) && experience.length === 0)) {
    recommendations.push("Consider adding more details about your work experience, including job titles, companies, and responsibilities.");
  }
  
  if (Array.isArray(experience)) {
    // Check for missing details in experience entries
    experience.forEach((exp, index) => {
      if (typeof exp === 'object') {
        // Handle different property names that might be used in the data
        const hasPosition = exp.position || exp.role || exp.title || exp.jobTitle;
        const hasCompany = exp.company || exp.organization || exp.employer;
        const hasDescription = exp.description || exp.responsibilities || exp.duties || exp.achievements;
        
        if (!hasPosition) {
          recommendations.push(`Work experience entry #${index + 1}: Consider adding your job title/position.`);
        }
        if (!hasCompany) {
          recommendations.push(`Work experience entry #${index + 1}: Consider adding the company name.`);
        }
        if (!hasDescription || 
            (typeof hasDescription === 'string' && hasDescription.length < 40)) {
          recommendations.push(`Work experience entry #${index + 1}: Consider adding more detailed description of your responsibilities and achievements.`);
        }
      }
    });
  }
  
  return recommendations;
};

// Helper function to check overall CV completion
const analyzeOverallCompletion = (data) => {
  const recommendations = [];
  
  if (!data.name || data.name.length < 3) {
    recommendations.push("Your CV should include your full name.");
  }
  
  if (!data.email || !data.email.includes('@')) {
    recommendations.push("Make sure your CV includes a valid email address for contact.");
  }
  
  if (!data.skills || (Array.isArray(data.skills) && data.skills.length < 5)) {
    recommendations.push("Try to include at least 5-10 relevant skills in your CV to showcase your capabilities.");
  }
  
  if (!data.projects || (Array.isArray(data.projects) && data.projects.length === 0)) {
    recommendations.push("Consider adding projects to your CV to showcase practical application of your skills.");
  }
  
  return recommendations;
};

const CVImprovement = ({ data, isUsingFallback }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  if (!data) return null;
  
  // If we're in fallback mode, provide limited suggestions
  if (isUsingFallback) {
    return (
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="font-medium text-blue-700 dark:text-blue-300">CV Improvement</h4>
        </div>
        <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
          Detailed CV improvement suggestions are available when using full AI analysis. 
          Try again later when API limits reset for personalized recommendations.
        </p>
        <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
          <p>General CV best practices:</p>
          <ul className="list-disc list-inside mt-1 ml-2">
            <li>Keep your CV concise (1-2 pages)</li>
            <li>Use bullet points for better readability</li>
            <li>Highlight quantifiable achievements</li>
            <li>Tailor your CV for each job application</li>
            <li>Ensure proper formatting and no spelling errors</li>
          </ul>
        </div>
      </div>
    );
  }
  
  const skillRecommendations = data.skills ? analyzeSkills(data.skills) : [];
  const educationRecommendations = analyzeEducation(data.education);
  const experienceRecommendations = analyzeWorkExperience(data.work_experience);
  const overallRecommendations = analyzeOverallCompletion(data);
  
  const allRecommendations = [
    ...overallRecommendations,
    ...skillRecommendations,
    ...educationRecommendations,
    ...experienceRecommendations
  ];
  
  if (allRecommendations.length === 0) {
    return (
      <div className="mt-6 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <h4 className="font-medium text-green-700 dark:text-green-300">Your CV looks great!</h4>
        </div>
        <p className="text-green-600 dark:text-green-400 text-sm mt-1">
          We don't have any suggestions for improvement at this time. Your CV appears to be well structured and complete.
        </p>
      </div>
    );
  }
  
  return (
    <div className="mt-6 bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h4 className="font-medium text-amber-700 dark:text-amber-300">CV Improvement Suggestions</h4>
        </div>
        <button 
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-amber-700 dark:text-amber-300 hover:underline text-sm"
        >
          {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
        </button>
      </div>
      
      {showSuggestions && (
        <div className="mt-3 space-y-2">
          {allRecommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start text-sm">
              <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-amber-800 dark:text-amber-200">{recommendation}</span>
            </div>
          ))}
          
          <div className="pt-2 text-xs text-amber-600 dark:text-amber-400">
            These suggestions are automatically generated based on CV best practices and may not apply to all situations.
          </div>
        </div>
      )}
    </div>
  );
};

export default CVImprovement;
