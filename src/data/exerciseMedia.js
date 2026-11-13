// Maps every default plan exercise to the closest exercise in
// https://github.com/yuhonas/free-exercise-db (public domain / Unlicense).
//
// Images are downloaded into public/exercises/<datasetId>/0.jpg and 1.jpg.
// The app never hotlinks the dataset at runtime.
//
// Search terms that produced each pair (case-insensitive, exact > prefix > partial):
//   one-arm-row "one-arm dumbbell row" | deadlift "barbell deadlift" |
//   seated-row "seated cable rows" | lat-pulldown "wide-grip lat pulldown" |
//   low-pull "seated cable rows" (the only "low pulley row" entry is a row-to-neck
//   variant, so the second term was used) | supported-squats "bodyweight squat" |
//   leg-press "leg press" | leg-extension "leg extensions" | leg-curl "lying leg curls" |
//   hip-abductor "thigh abductor" | hip-adductor "thigh adductor" |
//   standing-calf "standing calf raises" | cross-trainer "elliptical trainer" |
//   crunches "crunches" | reverse-crunches "reverse crunch" | russian-twist "russian twist" |
//   planks "plank" | chest-press "machine bench press" | incline-db-press "incline dumbbell press" |
//   pec-fly "butterfly" | pullover "bent-arm dumbbell pullover" |
//   pushups-modified: dataset has no on-knees push-up (only foot-elevated), so SVG is used |
//   shoulder-press "dumbbell shoulder press" | lateral-raise "side lateral raise" |
//   front-raise "front dumbbell raise" | rear-delt "reverse machine flyes" | shrugs "dumbbell shrug" |
//   free-squats "bodyweight squat" | db-curl "dumbbell bicep curl" | hammer-curl "hammer curls" |
//   reverse-curl "reverse barbell curl" | triceps-single "tricep dumbbell kickback" |
//   triceps-pushdown "triceps pushdown" |
//   triceps-extension "standing dumbbell triceps extension".
//
// No dataset match, animated SVG instead: cardio, cycling, walking, stretching, surya-namaskar.

export const EXERCISE_MEDIA = {
  'one-arm-row': { type: 'pair', datasetId: 'One-Arm_Dumbbell_Row', datasetName: 'One-Arm Dumbbell Row' },
  deadlift: { type: 'pair', datasetId: 'Barbell_Deadlift', datasetName: 'Barbell Deadlift' },
  'seated-row': { type: 'pair', datasetId: 'Seated_Cable_Rows', datasetName: 'Seated Cable Rows' },
  'lat-pulldown': { type: 'pair', datasetId: 'Wide-Grip_Lat_Pulldown', datasetName: 'Wide-Grip Lat Pulldown' },
  'low-pull': { type: 'pair', datasetId: 'Seated_Cable_Rows', datasetName: 'Seated Cable Rows' },
  'supported-squats': { type: 'pair', datasetId: 'Bodyweight_Squat', datasetName: 'Bodyweight Squat' },
  'leg-press': { type: 'pair', datasetId: 'Leg_Press', datasetName: 'Leg Press' },
  'leg-extension': { type: 'pair', datasetId: 'Leg_Extensions', datasetName: 'Leg Extensions' },
  'leg-curl': { type: 'pair', datasetId: 'Lying_Leg_Curls', datasetName: 'Lying Leg Curls' },
  'hip-abductor': { type: 'pair', datasetId: 'Thigh_Abductor', datasetName: 'Thigh Abductor' },
  'hip-adductor': { type: 'pair', datasetId: 'Thigh_Adductor', datasetName: 'Thigh Adductor' },
  'standing-calf': { type: 'pair', datasetId: 'Standing_Calf_Raises', datasetName: 'Standing Calf Raises' },
  'cross-trainer': { type: 'pair', datasetId: 'Elliptical_Trainer', datasetName: 'Elliptical Trainer' },
  crunches: { type: 'pair', datasetId: 'Crunches', datasetName: 'Crunches' },
  'reverse-crunches': { type: 'pair', datasetId: 'Reverse_Crunch', datasetName: 'Reverse Crunch' },
  'russian-twist': { type: 'pair', datasetId: 'Russian_Twist', datasetName: 'Russian Twist' },
  planks: { type: 'pair', datasetId: 'Plank', datasetName: 'Plank' },
  'chest-press': { type: 'pair', datasetId: 'Machine_Bench_Press', datasetName: 'Machine Bench Press' },
  'incline-db-press': { type: 'pair', datasetId: 'Incline_Dumbbell_Press', datasetName: 'Incline Dumbbell Press' },
  'pec-fly': { type: 'pair', datasetId: 'Butterfly', datasetName: 'Butterfly' },
  pullover: { type: 'pair', datasetId: 'Bent-Arm_Dumbbell_Pullover', datasetName: 'Bent-Arm Dumbbell Pullover' },
  'shoulder-press': { type: 'pair', datasetId: 'Dumbbell_Shoulder_Press', datasetName: 'Dumbbell Shoulder Press' },
  'lateral-raise': { type: 'pair', datasetId: 'Side_Lateral_Raise', datasetName: 'Side Lateral Raise' },
  'front-raise': { type: 'pair', datasetId: 'Front_Dumbbell_Raise', datasetName: 'Front Dumbbell Raise' },
  'rear-delt': { type: 'pair', datasetId: 'Reverse_Machine_Flyes', datasetName: 'Reverse Machine Flyes' },
  shrugs: { type: 'pair', datasetId: 'Dumbbell_Shrug', datasetName: 'Dumbbell Shrug' },
  'free-squats': { type: 'pair', datasetId: 'Bodyweight_Squat', datasetName: 'Bodyweight Squat' },
  'db-curl': { type: 'pair', datasetId: 'Dumbbell_Bicep_Curl', datasetName: 'Dumbbell Bicep Curl' },
  'hammer-curl': { type: 'pair', datasetId: 'Hammer_Curls', datasetName: 'Hammer Curls' },
  'reverse-curl': { type: 'pair', datasetId: 'Reverse_Barbell_Curl', datasetName: 'Reverse Barbell Curl' },
  'triceps-single': { type: 'pair', datasetId: 'Tricep_Dumbbell_Kickback', datasetName: 'Tricep Dumbbell Kickback' },
  'triceps-pushdown': { type: 'pair', datasetId: 'Triceps_Pushdown', datasetName: 'Triceps Pushdown' },
  'triceps-extension': {
    type: 'pair',
    datasetId: 'Standing_Dumbbell_Triceps_Extension',
    datasetName: 'Standing Dumbbell Triceps Extension',
  },
  cardio: { type: 'svg', animation: 'walking' },
  walking: { type: 'svg', animation: 'walking' },
  cycling: { type: 'svg', animation: 'cycling' },
  stretching: { type: 'svg', animation: 'stretching' },
  'surya-namaskar': { type: 'svg', animation: 'surya' },
  'pushups-modified': { type: 'svg', animation: 'kneeling-pushup' },
};

// Pairs available locally. Used by the editor's "image pair" picker.
export const IMAGE_PAIRS = [
  { id: 'One-Arm_Dumbbell_Row', name: 'One-Arm Dumbbell Row' },
  { id: 'Barbell_Deadlift', name: 'Barbell Deadlift' },
  { id: 'Seated_Cable_Rows', name: 'Seated Cable Rows' },
  { id: 'Wide-Grip_Lat_Pulldown', name: 'Wide-Grip Lat Pulldown' },
  { id: 'Bodyweight_Squat', name: 'Bodyweight Squat' },
  { id: 'Leg_Press', name: 'Leg Press' },
  { id: 'Leg_Extensions', name: 'Leg Extensions' },
  { id: 'Lying_Leg_Curls', name: 'Lying Leg Curls' },
  { id: 'Thigh_Abductor', name: 'Thigh Abductor' },
  { id: 'Thigh_Adductor', name: 'Thigh Adductor' },
  { id: 'Standing_Calf_Raises', name: 'Standing Calf Raises' },
  { id: 'Elliptical_Trainer', name: 'Elliptical Trainer' },
  { id: 'Crunches', name: 'Crunches' },
  { id: 'Reverse_Crunch', name: 'Reverse Crunch' },
  { id: 'Russian_Twist', name: 'Russian Twist' },
  { id: 'Plank', name: 'Plank' },
  { id: 'Machine_Bench_Press', name: 'Machine Bench Press' },
  { id: 'Incline_Dumbbell_Press', name: 'Incline Dumbbell Press' },
  { id: 'Butterfly', name: 'Butterfly' },
  { id: 'Bent-Arm_Dumbbell_Pullover', name: 'Bent-Arm Dumbbell Pullover' },
  { id: 'Dumbbell_Shoulder_Press', name: 'Dumbbell Shoulder Press' },
  { id: 'Side_Lateral_Raise', name: 'Side Lateral Raise' },
  { id: 'Front_Dumbbell_Raise', name: 'Front Dumbbell Raise' },
  { id: 'Reverse_Machine_Flyes', name: 'Reverse Machine Flyes' },
  { id: 'Dumbbell_Shrug', name: 'Dumbbell Shrug' },
  { id: 'Dumbbell_Bicep_Curl', name: 'Dumbbell Bicep Curl' },
  { id: 'Hammer_Curls', name: 'Hammer Curls' },
  { id: 'Reverse_Barbell_Curl', name: 'Reverse Barbell Curl' },
  { id: 'Tricep_Dumbbell_Kickback', name: 'Tricep Dumbbell Kickback' },
  { id: 'Triceps_Pushdown', name: 'Triceps Pushdown' },
  { id: 'Standing_Dumbbell_Triceps_Extension', name: 'Standing Dumbbell Triceps Extension' },
];

export function imagePairSrc(datasetId, frame) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}exercises/${datasetId}/${frame}.jpg`;
}

// Resolve the media to show for an exercise: an explicit override from the
// editor wins, otherwise the default map, otherwise a safe SVG animation.
export function resolveMedia(exercise) {
  if (exercise?.media && exercise.media.type) return exercise.media;
  const mapped = EXERCISE_MEDIA[exercise?.id];
  if (mapped) return mapped;
  return { type: 'svg', animation: 'stretching' };
}

export function mediaLabel(media) {
  if (!media) return 'None';
  switch (media.type) {
    case 'pair':
      return `Photo pair: ${media.datasetName || media.datasetId}`;
    case 'svg':
      return `Animation: ${media.animation}`;
    case 'youtube':
      return 'YouTube video';
    case 'video':
      return media.name ? `Uploaded video: ${media.name}` : 'Video file';
    case 'image':
      return media.name ? `Uploaded image: ${media.name}` : 'Image / GIF';
    default:
      return media.type;
  }
}
