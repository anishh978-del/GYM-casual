import fs from 'node:fs';
const db = JSON.parse(fs.readFileSync('./.tmp/exercises.json', 'utf8'));

const rows = [
  ['one-arm-row', ['one-arm dumbbell row'], 'svg'],
  ['deadlift', ['barbell deadlift'], 'svg'],
  ['seated-row', ['seated cable rows'], 'svg'],
  ['lat-pulldown', ['wide-grip lat pulldown'], 'svg'],
  ['low-pull', ['low pulley row', 'seated cable rows'], 'svg'],
  ['supported-squats', ['bodyweight squat'], 'svg'],
  ['leg-press', ['leg press'], 'svg'],
  ['leg-extension', ['leg extensions'], 'svg'],
  ['leg-curl', ['lying leg curls', 'seated leg curl'], 'svg'],
  ['hip-abductor', ['thigh abductor'], 'svg'],
  ['hip-adductor', ['thigh adductor'], 'svg'],
  ['standing-calf', ['standing calf raises'], 'svg'],
  ['cross-trainer', ['elliptical trainer'], 'svg'],
  ['crunches', ['crunches'], 'svg'],
  ['reverse-crunches', ['reverse crunch'], 'svg'],
  ['russian-twist', ['russian twist'], 'svg'],
  ['planks', ['plank'], 'svg'],
  ['chest-press', ['machine bench press'], 'svg'],
  ['incline-db-press', ['incline dumbbell press'], 'svg'],
  ['pec-fly', ['butterfly'], 'svg'],
  ['pullover', ['bent-arm dumbbell pullover'], 'svg'],
  ['pushups-modified', ['kneeling push-up', 'push-ups'], 'svg'],
  ['shoulder-press', ['dumbbell shoulder press'], 'svg'],
  ['lateral-raise', ['side lateral raise'], 'svg'],
  ['front-raise', ['front dumbbell raise'], 'svg'],
  ['rear-delt', ['reverse machine flyes'], 'svg'],
  ['shrugs', ['dumbbell shrug'], 'svg'],
  ['free-squats', ['bodyweight squat'], 'svg'],
  ['db-curl', ['dumbbell bicep curl'], 'svg'],
  ['hammer-curl', ['hammer curls'], 'svg'],
  ['reverse-curl', ['reverse barbell curl'], 'svg'],
  ['triceps-single', ['tricep dumbbell kickback'], 'svg'],
  ['triceps-pushdown', ['triceps pushdown'], 'svg'],
  ['triceps-extension', ['standing dumbbell triceps extension'], 'svg'],
  ['cardio', [], 'svg'],
  ['cycling', [], 'svg'],
  ['walking', [], 'svg'],
  ['stretching', ['stretching'], 'svg'],
  ['surya-namaskar', [], 'svg'],
];

function find(term) {
  const t = term.toLowerCase();
  let c = db.filter(e => e.name.toLowerCase() === t);
  if (!c.length) c = db.filter(e => e.name.toLowerCase().startsWith(t));
  if (!c.length) c = db.filter(e => e.name.toLowerCase().includes(t));
  c.sort((a, b) => a.name.length - b.name.length);
  return c;
}

const out = [];
for (const [planId, terms, fallback] of rows) {
  let chosen = null, tried = [], all = [];
  for (const term of terms) {
    const c = find(term);
    if (c.length) { chosen = c[0]; tried.push(term); all = c; break; }
    tried.push(term + ' (none)');
  }
  out.push({ planId, terms: tried.join(', ') || '—', name: chosen?.name ?? '—', id: chosen?.id ?? fallback, images: chosen?.images ?? null });
}
console.log('PLAN ID | TERMS | MATCHED NAME | DATASET ID');
for (const r of out) console.log(`${r.planId} | ${r.terms} | ${r.name} | ${r.id}`);

// extras: show near-misses for review
for (const [pid, terms] of [['pushups-modified', ['push', 'kneel']], ['front-raise', ['front']], ['low-pull', ['low pulley']], ['stretching', ['stretch']], ['triceps-single', ['kickback']]]) {
  console.log('\nNEAR ' + pid);
  for (const t of terms) console.log('  ' + t + ': ' + db.filter(e => e.name.toLowerCase().includes(t)).map(e => e.id).slice(0, 12).join(', '));
}
fs.writeFileSync('./.tmp/media-map.json', JSON.stringify(out, null, 2));
