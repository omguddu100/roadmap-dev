const fs = require('fs');

const file = 'public/assets/job-ready-basic-to-advanced-javascript.json';
if (!fs.existsSync(file)) process.exit(0);
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
      else if (num === 3) newRank = 'Intermediate'; 
      else if (num === 4) newRank = 'Intermediate'; 
      else if (num === 5) newRank = 'Intermediate'; 
      else if (num === 6) newRank = 'Intermediate'; 
      else if (num === 7) newRank = 'Advanced'; 
      else if (num === 8) newRank = 'Intermediate'; 
      else if (num === 9) newRank = 'Intermediate'; 
      else if (num === 10) newRank = 'Advanced'; 
      else if (num === 11) newRank = 'Advanced'; 
      else if (num === 12) newRank = 'Advanced'; 
      else if (num === 13) newRank = 'Advanced'; 
      else if (num === 14) newRank = 'Advanced'; 
      else if (num === 15) newRank = 'Advanced'; 
      
      if (topic.priority !== newRank) {
        topic.priority = newRank;
        updatedCount++;
      }
    });
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated ${updatedCount} priorities in ${file}`);
