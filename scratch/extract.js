const fs = require('fs');

const dataStr = fs.readFileSync('public/assets/data.json', 'utf8');
const data = JSON.parse(dataStr);

const phase1 = data.roadmap.find(p => p.id === 'phase1');
const restPhases = data.roadmap.filter(p => p.id !== 'phase1');

// Re-number remaining phases
restPhases.forEach((p, idx) => {
  p.num = String(idx + 1);
});

const angularData = {
  roadmap: restPhases,
  topicReferences: {}
};

const jsData = {
  roadmap: [
    {
      ...phase1,
      title: "Basic to Advanced JavaScript Fundamentals"
    }
  ],
  topicReferences: {}
};

// Filter topic references
for (const [key, value] of Object.entries(data.topicReferences)) {
  if (key.startsWith('js-')) {
    jsData.topicReferences[key] = value;
  } else {
    angularData.topicReferences[key] = value;
  }
}

fs.writeFileSync('public/assets/angular.json', JSON.stringify(angularData, null, 2));
fs.writeFileSync('public/assets/Basic_to_Advanced_JavaScript_Fundamentals.json', JSON.stringify(jsData, null, 2));

// Delete old data.json
fs.unlinkSync('public/assets/data.json');

console.log('Successfully separated data files');
