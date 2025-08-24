import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Define skill categories and their associated keywords
const SKILL_CATEGORIES = {
  'Programming': [
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'rust', 'go', 
    'scala', 'swift', 'kotlin', 'perl', 'bash', 'shell', 'powershell', 'r', 'lua', 'dart',
    'objective-c', 'groovy', 'haskell', 'clojure', 'webassembly', 'assembly', 'matlab', 'fortran'
  ],
  'Frontend': [
    'html', 'css', 'react', 'vue', 'angular', 'svelte', 'jquery', 'bootstrap', 'tailwind',
    'material ui', 'webpack', 'sass', 'less', 'styled-components', 'redux', 'responsive design',
    'pwa', 'progressive web app', 'spa', 'single page application', 'web components',
    'dom', 'browser', 'mobile first', 'responsive'
  ],
  'Backend': [
    'node', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', 'asp.net', 'fastapi',
    'api', 'rest', 'graphql', 'microservices', 'serverless', 'server-side', 'middleware', 
    'sockets', 'websockets', 'authentication', 'authorization', 'oauth', 'jwt', 'session',
    'http', 'https', 'cors', 'rpc'
  ],
  'Database': [
    'sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'database', 'oracle', 'sqlite', 
    'redis', 'cassandra', 'dynamodb', 'firebase', 'elasticsearch', 'couchbase', 'neo4j',
    'mariadb', 'data modeling', 'er diagram', 'normalization', 'queries', 'orm', 'transactions',
    'jdbc', 'odbc', 'sequelize', 'mongoose', 'prisma'
  ],
  'DevOps & Cloud': [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'ansible',
    'cloud', 'devops', 'git', 'github', 'gitlab', 'bitbucket', 'automated testing', 'deployment',
    'continuous integration', 'continuous deployment', 'infrastructure as code', 'monitoring',
    'logging', 'virtualization', 'containerization', 'heroku', 'netlify', 'vercel'
  ],
  'Data Science': [
    'analytics', 'data science', 'machine learning', 'ai', 'artificial intelligence',
    'statistics', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn',
    'data visualization', 'tableau', 'power bi', 'data mining', 'big data', 'hadoop', 'spark',
    'nlp', 'natural language processing', 'computer vision', 'neural networks', 'deep learning',
    'classification', 'clustering', 'regression', 'prediction'
  ],
  'Soft Skills': [
    'communication', 'teamwork', 'leadership', 'problem-solving', 'problem solving', 'time management',
    'adaptability', 'creativity', 'critical thinking', 'presentation', 'conflict resolution',
    'negotiation', 'collaboration', 'mentoring', 'coaching', 'project management',
    'organization', 'detail-oriented', 'customer service', 'interpersonal', 'public speaking',
    'emotional intelligence', 'agile', 'scrum', 'kanban'
  ],
  'Design': [
    'ui', 'ux', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'indesign',
    'wireframing', 'prototyping', 'visual design', 'typography', 'color theory',
    'responsive design', 'accessibility', 'user research', 'user testing', 'animation',
    'interaction design', 'user-centered design', 'information architecture', 'usability testing'
  ]
};

// Helper function to categorize skills with improved matching algorithm
const categorizeSkills = (skills) => {
  // Initialize categories with all defined categories plus 'Other'
  const categorized = {};
  Object.keys(SKILL_CATEGORIES).forEach(category => {
    categorized[category] = 0;
  });
  categorized['Other'] = 0;
  
  skills.forEach(skill => {
    if (!skill || typeof skill !== 'string') return;
    
    const lowerSkill = skill.toLowerCase().trim();
    if (!lowerSkill) return;
    
    let bestMatch = null;
    let bestMatchScore = 0;
    
    // Find the best category match for this skill
    for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
      // Check for exact matches first (highest priority)
      if (keywords.includes(lowerSkill)) {
        bestMatch = category;
        bestMatchScore = 100; // Maximum score
        break;
      }
      
      // Check for keyword containment with scoring
      for (const keyword of keywords) {
        // Skill contains keyword
        if (lowerSkill.includes(keyword) && keyword.length >= 3) {
          const matchScore = (keyword.length / lowerSkill.length) * 80;
          if (matchScore > bestMatchScore) {
            bestMatchScore = matchScore;
            bestMatch = category;
          }
        }
        // Keyword contains skill (for short skills that are part of larger keywords)
        else if (keyword.includes(lowerSkill) && lowerSkill.length >= 3) {
          const matchScore = (lowerSkill.length / keyword.length) * 70;
          if (matchScore > bestMatchScore) {
            bestMatchScore = matchScore;
            bestMatch = category;
          }
        }
      }
    }
    
    // Assign to best match category if score is high enough
    if (bestMatch && bestMatchScore > 40) {
      categorized[bestMatch]++;
    } else {
      categorized['Other']++;
    }
  });
  
  // Remove categories with zero skills (optional)
  const finalCategorized = {};
  Object.entries(categorized).forEach(([category, count]) => {
    if (count > 0) {
      finalCategorized[category] = count;
    }
  });
  
  return finalCategorized;
};

// Helper function to get color class for a category
const getColorClassForCategory = (category) => {
  const colorMap = {
    'Programming': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'Frontend': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
    'Backend': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'Database': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    'DevOps & Cloud': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    'Data Science': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    'Soft Skills': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
    'Design': 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
    'Other': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  };
  
  return colorMap[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
};

export default function SkillsVisualization({ skills }) {
  if (!skills || skills.length === 0) {
    return <div className="text-center text-gray-500 my-4">No skills data available for visualization</div>;
  }

  const categorizedSkills = categorizeSkills(skills);
  
  // Generate dynamic colors for categories
  const generateColors = () => {
    const baseColors = [
      { bg: 'rgba(54, 162, 235, 0.7)', border: 'rgb(54, 162, 235)' },   // Blue
      { bg: 'rgba(255, 99, 132, 0.7)', border: 'rgb(255, 99, 132)' },   // Red
      { bg: 'rgba(75, 192, 192, 0.7)', border: 'rgb(75, 192, 192)' },   // Green
      { bg: 'rgba(153, 102, 255, 0.7)', border: 'rgb(153, 102, 255)' }, // Purple
      { bg: 'rgba(255, 159, 64, 0.7)', border: 'rgb(255, 159, 64)' },   // Orange
      { bg: 'rgba(255, 205, 86, 0.7)', border: 'rgb(255, 205, 86)' },   // Yellow
      { bg: 'rgba(201, 203, 207, 0.7)', border: 'rgb(201, 203, 207)' }, // Gray
      { bg: 'rgba(94, 224, 138, 0.7)', border: 'rgb(94, 224, 138)' },   // Light Green
      { bg: 'rgba(214, 106, 241, 0.7)', border: 'rgb(214, 106, 241)' }  // Pink
    ];
    
    // Map categories to consistent colors
    const predefinedColorMap = {
      'Programming': baseColors[0],
      'Frontend': baseColors[1],
      'Backend': baseColors[2],
      'Database': baseColors[3],
      'DevOps & Cloud': baseColors[4],
      'Data Science': baseColors[5],
      'Soft Skills': baseColors[6],
      'Design': baseColors[7],
      'Other': baseColors[8]
    };
    
    const backgroundColors = [];
    const borderColors = [];
    
    // Get colors for each category
    const categories = Object.keys(categorizedSkills);
    categories.forEach(category => {
      if (predefinedColorMap[category]) {
        backgroundColors.push(predefinedColorMap[category].bg);
        borderColors.push(predefinedColorMap[category].border);
      } else {
        // Fallback for any new categories
        const index = categories.indexOf(category) % baseColors.length;
        backgroundColors.push(baseColors[index].bg);
        borderColors.push(baseColors[index].border);
      }
    });
    
    return { backgroundColors, borderColors };
  };
  
  // Get colors for current categories
  const { backgroundColors, borderColors } = generateColors(Object.keys(categorizedSkills).length);
  
  // Prepare data for bar chart
  const barData = {
    labels: Object.keys(categorizedSkills),
    datasets: [
      {
        label: 'Skills by Category',
        data: Object.values(categorizedSkills),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  // Pie chart data
  const pieData = {
    labels: Object.keys(categorizedSkills),
    datasets: [
      {
        data: Object.values(categorizedSkills),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
        }
      },
      title: {
        display: true,
        text: 'Skills Distribution by Category',
        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
        }
      },
      title: {
        display: true,
        text: 'Skills Distribution',
        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
      },
    },
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-fade-in">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Skills Visualization
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium text-indigo-600 dark:text-indigo-400 mb-2 text-center">
            Skills by Category (Bar Chart)
          </h4>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-indigo-600 dark:text-indigo-400 mb-2 text-center">
            Skills Distribution (Pie Chart)
          </h4>
          <div className="h-64">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 text-lg">Your Skills by Category:</h4>
        
        {/* Group and display skills by category */}
        <div className="mt-4 space-y-4">
          {Object.entries(SKILL_CATEGORIES).map(([category, keywords]) => {
            // Filter skills that belong to this category
            const categorySkills = skills.filter(skill => {
              const lowerSkill = skill.toLowerCase().trim();
              // Check if skill matches any keyword in this category
              return keywords.some(keyword => 
                lowerSkill.includes(keyword) || (keyword.includes(lowerSkill) && lowerSkill.length >= 3)
              );
            });
            
            if (categorySkills.length === 0) return null;
            
            // Get color for this category
            const colorClass = getColorClassForCategory(category);
            
            return (
              <div key={category} className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <h5 className="font-medium mb-2 text-gray-800 dark:text-gray-200">{category} ({categorySkills.length})</h5>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill, i) => (
                    <span 
                      key={i} 
                      className={`px-2 py-1 ${colorClass} rounded-full text-sm`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Other uncategorized skills */}
          {(() => {
            const otherSkills = skills.filter(skill => {
              const lowerSkill = skill.toLowerCase().trim();
              // Check if skill doesn't match any category
              return !Object.values(SKILL_CATEGORIES).some(keywords => 
                keywords.some(keyword => lowerSkill.includes(keyword) || (keyword.includes(lowerSkill) && lowerSkill.length >= 3))
              );
            });
            
            if (otherSkills.length === 0) return null;
            
            return (
              <div className="pb-3">
                <h5 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Other ({otherSkills.length})</h5>
                <div className="flex flex-wrap gap-2">
                  {otherSkills.map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
