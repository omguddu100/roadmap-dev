const fs = require('fs');

const file = 'public/assets/angular-frontend-developer.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

let updatedCount = 0;
const phases = data.roadmap || data.phases || data;

phases.forEach(phase => {
  const num = parseInt(phase.num, 10);
  
  if (phase.topics) {
    phase.topics.forEach(topic => {
      let newRank = 'Basic';
      
      if (num === 1) newRank = 'Basic';
      else if (num === 2) newRank = 'Intermediate'; 
      else if (num === 3) newRank = 'Advanced'; 
      else if (num === 4) newRank = 'Advanced'; 
      
      if (topic.priority !== newRank) {
        topic.priority = newRank;
        updatedCount++;
      }
    });
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated ${updatedCount} priorities in ${file}`);
