const fs = require('fs');

const commands = process.argv;
const filename = commands[commands.length - 1];
const result = fs.readFileSync(filename).toString();
const lines = result.split('\n');

const titles = lines[0];

const radios = [];

// splits logic
let tmp = [], adjust = false, baseTime;
for(let i = 1; i < lines.length; i++) {
  if(lines[i].trim().length === 0) continue;
  const phrases = lines[i].split(',');
  if(phrases[0].endsWith('.m')){
    // xxx.m.mov
    if(tmp.length !== 0) {
      radios.push(tmp);
      tmp = [];
      adjust = true;
      baseTime = Number.parseFloat(phrases[1]);
    }
  } else {
    if(adjust) {
      phrases[1] = ("" + Number.parseFloat(phrases[1]) - baseTime)
    }
    tmp.push(phrases.join(','));
  }
}
if(tmp.length !== 0) {
  radios.push(tmp);
  tmp = [];
}

let ans = '';
ans += (titles + '\n');
for(let i = 0; i < radios.length; i++) {
  ans += (radios[i].join('\n') + '\n\n');
}

const filenameArray = filename.split('.');
const trailing = filenameArray.pop();
filenameArray.push('out');
filenameArray.push(trailing);

fs.writeFileSync(filenameArray.join('.'), ans);