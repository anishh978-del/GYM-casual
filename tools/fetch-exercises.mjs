import fs from 'node:fs/promises';
import path from 'node:path';

const ids = [
  'One-Arm_Dumbbell_Row', 'Barbell_Deadlift', 'Seated_Cable_Rows', 'Wide-Grip_Lat_Pulldown',
  'Bodyweight_Squat', 'Leg_Press', 'Leg_Extensions', 'Lying_Leg_Curls', 'Thigh_Abductor',
  'Thigh_Adductor', 'Standing_Calf_Raises', 'Elliptical_Trainer', 'Crunches', 'Reverse_Crunch',
  'Russian_Twist', 'Plank', 'Machine_Bench_Press', 'Incline_Dumbbell_Press', 'Butterfly',
  'Bent-Arm_Dumbbell_Pullover', 'Dumbbell_Shoulder_Press', 'Side_Lateral_Raise', 'Front_Dumbbell_Raise',
  'Reverse_Machine_Flyes', 'Dumbbell_Shrug', 'Dumbbell_Bicep_Curl', 'Hammer_Curls', 'Reverse_Barbell_Curl',
  'Tricep_Dumbbell_Kickback', 'Triceps_Pushdown', 'Standing_Dumbbell_Triceps_Extension',
];

const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
const OUT = path.resolve('public/exercises');
const IMG_RE = /^(One-Arm_Dumbbell_Row|Barbell_Deadlift|Seated_Cable_Rows|Wide-Grip_Lat_Pulldown|Bodyweight_Squat|Leg_Press|Leg_Extensions|Lying_Leg_Curls|Thigh_Abductor|Thigh_Adductor|Standing_Calf_Raises|Elliptical_Trainer|Crunches|Reverse_Crunch|Russian_Twist|Plank|Machine_Bench_Press|Incline_Dumbbell_Press|Butterfly|Bent-Arm_Dumbbell_Pullover|Dumbbell_Shoulder_Press|Side_Lateral_Raise|Front_Dumbbell_Raise|Reverse_Machine_Flyes|Dumbbell_Shrug|Dumbbell_Bicep_Curl|Hammer_Curls|Reverse_Barbell_Curl|Tricep_Dumbbell_Kickback|Triceps_Pushdown|Standing_Dumbbell_Triceps_Extension)/;

async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (attempt === 2) throw err;
      await new Promise(r => setTimeout(r, 700));
    }
  }
}

let total = 0;
for (const id of ids) {
  const dir = path.join(OUT, id);
  await fs.mkdir(dir, { recursive: true });
  for (const frame of ['0.jpg', '1.jpg']) {
    const buf = await get(`${BASE}/${id}/${frame}`);
    if (buf.length < 2000) throw new Error(`tiny file ${id}/${frame}`);
    await fs.writeFile(path.join(dir, frame), buf);
    total += buf.length;
  }
  process.stdout.write(`${id} ${Math.round(total / 1024)}KB total\n`);
}
console.log('DONE', ids.length, 'exercises,', Math.round(total / 1024 / 1024 * 10) / 10, 'MB');
