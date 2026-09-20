const fs = require('fs');
const path = 'public/assets/angular.json';

const dataStr = fs.readFileSync(path, 'utf8');
const data = JSON.parse(dataStr);

// Find and remove "Top JavaScript Interview Questions"
data.roadmap.forEach(phase => {
  if (phase.topics) {
    const originalLength = phase.topics.length;
    phase.topics = phase.topics.filter(topic => topic.title !== "Top JavaScript Interview Questions");
    if (phase.topics.length < originalLength) {
      console.log(`Removed from phase: ${phase.title}`);
    }
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Successfully updated angular.json');
