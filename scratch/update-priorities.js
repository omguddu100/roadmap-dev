const fs = require('fs');

const files = [
  'public/assets/angular-frontend-developer.json',
  'public/assets/job-ready-basic-to-advanced-javascript.json',
  'public/assets/javascript-fundamentals-all-in-one.json'
];

function mapPriority(p) {
  if (!p) return 'Basic';
  if (p === 'Core') return 'Basic';
  if (p.includes('⭐⭐⭐⭐⭐')) return 'Advanced';
  if (p.includes('⭐⭐⭐⭐')) return 'Intermediate';
  if (p === 'Important') return 'Advanced';
  if (p === 'Modern Angular') return 'Advanced';
  if (p === 'Final') return 'Advanced';
  if (p === 'Interview') return 'Advanced';
  return 'Intermediate';
}

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} - not found`);
    continue;
  }
  
  const raw = fs.readFileSync(file, 'utf8');
  let data = JSON.parse(raw);
  
  let phases = Array.isArray(data) ? data : (data.roadmap || data.phases || []);
  
  let updatedCount = 0;
  
  phases.forEach(phase => {
    if (phase.topics) {
      phase.topics.forEach(topic => {
        if (topic.priority) {
          const old = topic.priority;
          topic.priority = mapPriority(topic.priority);
          if (old !== topic.priority) {
            updatedCount++;
          }
        }
      });
    }
  });
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} priorities in ${file}`);
}
