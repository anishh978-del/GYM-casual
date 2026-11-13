// Stick-figure animation definitions used when the dataset has no photo pair.
// Each pose targets hand/foot positions; elbows and knees are solved with 2-bone IK.
// Coordinates are in a 340x230 viewBox, character facing right.

const L = { torso: 46, upperArm: 27, forearm: 25, thigh: 33, shin: 31 };

const BASE = {
  hip: [170, 134],
  torso: -90,
  handA: [186, 134],
  handB: [154, 134],
  footA: [182, 196],
  footB: [158, 196],
  bendA: 1,
  bendB: 1,
  kneeA: -1,
  kneeB: -1,
};

const P = (patch) => ({ ...BASE, ...patch });
const pt = (p, angleDeg, len) => [
  p[0] + Math.cos((angleDeg * Math.PI) / 180) * len,
  p[1] + Math.sin((angleDeg * Math.PI) / 180) * len,
];

export const SVG_ANIMATIONS = {
  walking: {
    label: 'Treadmill walking',
    duration: 2200,
    props: ['treadmill'],
    keys: [
      {
        at: 0,
        pose: P({
          hip: [170, 133],
          torso: -88,
          handA: [150, 134],
          handB: [192, 132],
          footA: [192, 196],
          footB: [150, 196],
          bendA: 1,
          bendB: 1,
        }),
      },
      {
        at: 0.25,
        pose: P({
          hip: [170, 130],
          torso: -88,
          handA: [162, 136],
          handB: [180, 136],
          footA: [174, 196],
          footB: [160, 188],
        }),
      },
      {
        at: 0.5,
        pose: P({
          hip: [170, 133],
          torso: -88,
          handA: [190, 132],
          handB: [148, 134],
          footA: [150, 196],
          footB: [192, 196],
        }),
      },
      {
        at: 0.75,
        pose: P({
          hip: [170, 130],
          torso: -88,
          handA: [178, 136],
          handB: [160, 136],
          footA: [160, 188],
          footB: [174, 196],
        }),
      },
      {
        at: 1,
        pose: P({
          hip: [170, 133],
          torso: -88,
          handA: [150, 134],
          handB: [192, 132],
          footA: [192, 196],
          footB: [150, 196],
        }),
      },
    ],
  },

  cycling: {
    label: 'Stationary cycling',
    duration: 2400,
    props: ['bike'],
    keys: [
      {
        at: 0,
        pose: P({
          hip: [190, 140],
          torso: -75,
          handA: [240, 110],
          handB: [233, 112],
          footA: [228, 178],
          footB: [202, 178],
          bendA: 1,
          bendB: 1,
          kneeA: -1,
          kneeB: -1,
        }),
      },
      {
        at: 0.25,
        pose: P({
          hip: [190, 140],
          torso: -75,
          handA: [240, 110],
          handB: [233, 112],
          footA: [215, 191],
          footB: [215, 165],
          kneeA: -1,
          kneeB: -1,
        }),
      },
      {
        at: 0.5,
        pose: P({
          hip: [190, 140],
          torso: -75,
          handA: [240, 110],
          handB: [233, 112],
          footA: [202, 178],
          footB: [228, 178],
        }),
      },
      {
        at: 0.75,
        pose: P({
          hip: [190, 140],
          torso: -75,
          handA: [240, 110],
          handB: [233, 112],
          footA: [215, 165],
          footB: [215, 191],
        }),
      },
      {
        at: 1,
        pose: P({
          hip: [190, 140],
          torso: -75,
          handA: [240, 110],
          handB: [233, 112],
          footA: [228, 178],
          footB: [202, 178],
        }),
      },
    ],
  },

  stretching: {
    label: 'Standing side stretch',
    duration: 5200,
    props: ['mat'],
    keys: [
      {
        at: 0,
        pose: P({
          handA: [182, 38],
          handB: [158, 38],
          footA: [184, 196],
          footB: [156, 196],
        }),
      },
      {
        at: 0.25,
        pose: P({
          torso: -104,
          handA: [130, 42],
          handB: [118, 54],
          footA: [184, 196],
          footB: [156, 196],
          kneeA: -1,
          kneeB: -1,
        }),
      },
      {
        at: 0.5,
        pose: P({
          handA: [182, 38],
          handB: [158, 38],
          footA: [184, 196],
          footB: [156, 196],
        }),
      },
      {
        at: 0.75,
        pose: P({
          torso: -76,
          handA: [210, 42],
          handB: [222, 54],
          footA: [184, 196],
          footB: [156, 196],
        }),
      },
      {
        at: 1,
        pose: P({
          handA: [182, 38],
          handB: [158, 38],
          footA: [184, 196],
          footB: [156, 196],
        }),
      },
    ],
  },

  surya: {
    label: 'Surya Namaskar flow',
    duration: 9000,
    props: ['mat'],
    keys: [
      {
        at: 0,
        pose: P({
          handA: [181, 106],
          handB: [173, 110],
          footA: [181, 196],
          footB: [159, 196],
        }),
      },
      {
        at: 0.14,
        pose: P({
          torso: -92,
          handA: [182, 38],
          handB: [158, 38],
          footA: [181, 196],
          footB: [159, 196],
        }),
      },
      {
        at: 0.3,
        pose: P({
          torso: 35,
          handA: [214, 196],
          handB: [202, 198],
          footA: [181, 196],
          footB: [159, 196],
        }),
      },
      {
        at: 0.45,
        pose: P({
          hip: [176, 152],
          torso: -8,
          handA: [234, 196],
          handB: [226, 198],
          footA: [138, 196],
          footB: [128, 198],
          kneeA: -1,
          kneeB: -1,
        }),
      },
      {
        at: 0.6,
        pose: P({
          hip: [170, 186],
          torso: -30,
          handA: [222, 196],
          handB: [214, 198],
          footA: [128, 196],
          footB: [136, 198],
          kneeA: 1,
          kneeB: 1,
        }),
      },
      {
        at: 0.75,
        pose: P({
          torso: 35,
          handA: [214, 196],
          handB: [202, 198],
          footA: [181, 196],
          footB: [159, 196],
        }),
      },
      {
        at: 0.88,
        pose: P({
          torso: -92,
          handA: [182, 38],
          handB: [158, 38],
          footA: [181, 196],
          footB: [159, 196],
        }),
      },
      {
        at: 1,
        pose: P({
          handA: [181, 106],
          handB: [173, 110],
          footA: [181, 196],
          footB: [159, 196],
        }),
      },
    ],
  },

  'kneeling-pushup': {
    label: 'Kneeling push-up',
    duration: 2800,
    props: ['mat'],
    arrows: [{ from: [252, 146], to: [252, 182] }],
    keys: [
      {
        at: 0,
        pose: P({
          hip: [170, 158],
          torso: -15,
          handA: [230, 196],
          handB: [221, 198],
          footA: [126, 176],
          footB: [136, 180],
          bendA: 1,
          bendB: 1,
          kneeA: 1,
          kneeB: 1,
        }),
      },
      {
        at: 0.22,
        pose: P({
          hip: [170, 158],
          torso: -15,
          handA: [230, 196],
          handB: [221, 198],
          footA: [126, 176],
          footB: [136, 180],
          kneeA: 1,
          kneeB: 1,
        }),
      },
      {
        at: 0.5,
        pose: P({
          hip: [169, 167],
          torso: -4,
          handA: [229, 196],
          handB: [220, 198],
          footA: [126, 181],
          footB: [136, 184],
          kneeA: 1,
          kneeB: 1,
        }),
      },
      {
        at: 0.78,
        pose: P({
          hip: [170, 158],
          torso: -15,
          handA: [230, 196],
          handB: [221, 198],
          footA: [126, 176],
          footB: [136, 180],
          kneeA: 1,
          kneeB: 1,
        }),
      },
      { at: 1, pose: P({
        hip: [170, 158],
        torso: -15,
        handA: [230, 196],
        handB: [221, 198],
        footA: [126, 176],
        footB: [136, 180],
        kneeA: 1,
        kneeB: 1,
      }) },
    ],
  },

  idle: {
    label: 'Standing figure',
    duration: 4000,
    props: ['mat'],
    keys: [
      { at: 0, pose: P({}) },
      { at: 0.5, pose: P({ hip: [170, 132], torso: -91, handA: [188, 133], handB: [152, 133] }) },
      { at: 1, pose: P({}) },
    ],
  },
};

export const SVG_ANIMATION_OPTIONS = Object.entries(SVG_ANIMATIONS).map(([id, def]) => ({
  id,
  label: def.label,
}));

function ease(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpPoint(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

export function samplePose(def, time) {
  const keys = def.keys;
  const total = def.duration;
  const t = ((time % total) + total) % total;
  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (t >= keys[i].at * total && t <= keys[i + 1].at * total) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  const span = (b.at - a.at) * total || 1;
  const raw = Math.min(1, Math.max(0, (t - a.at * total) / span));
  const k = ease(raw);
  const pa = a.pose;
  const pb = b.pose;
  return {
    hip: lerpPoint(pa.hip, pb.hip, k),
    torso: lerp(pa.torso, pb.torso, k),
    handA: lerpPoint(pa.handA, pb.handA, k),
    handB: lerpPoint(pa.handB, pb.handB, k),
    footA: lerpPoint(pa.footA, pb.footA, k),
    footB: lerpPoint(pa.footB, pb.footB, k),
    bendA: lerp(pa.bendA, pb.bendA, k),
    bendB: lerp(pa.bendB, pb.bendB, k),
    kneeA: lerp(pa.kneeA, pb.kneeA, k),
    kneeB: lerp(pa.kneeB, pb.kneeB, k),
  };
}

export function solveFigure(pose) {
  const shoulder = pt(pose.hip, pose.torso, L.torso);
  const head = pt(shoulder, pose.torso, 23);
  const armA = ik(shoulder, pose.handA, L.upperArm, L.forearm, pose.bendA);
  const armB = ik(shoulder, pose.handB, L.upperArm, L.forearm, pose.bendB);
  const legA = ik(pose.hip, pose.footA, L.thigh, L.shin, pose.kneeA);
  const legB = ik(pose.hip, pose.footB, L.thigh, L.shin, pose.kneeB);
  return {
    hip: pose.hip,
    shoulder,
    head,
    armA,
    armB,
    legA,
    legB,
    footA: shoe(legA),
    footB: shoe(legB),
  };
}

function shoe(leg) {
  const angle = Math.atan2(leg.end[1] - leg.joint[1], leg.end[0] - leg.joint[0]);
  const deg = (angle * 180) / Math.PI - 90;
  return pt(leg.end, deg, 11);
}

function ik(root, target, l1, l2, bend = 1) {
  const dx = target[0] - root[0];
  const dy = target[1] - root[1];
  const dist = Math.hypot(dx, dy);
  const d = Math.min(Math.max(dist, Math.abs(l1 - l2) + 0.6), l1 + l2 - 0.4);
  const base = Math.atan2(dy, dx);
  const cos = (d * d + l1 * l1 - l2 * l2) / (2 * d * l1);
  const angle = base + bend * Math.acos(Math.min(1, Math.max(-1, cos)));
  const joint = [root[0] + Math.cos(angle) * l1, root[1] + Math.sin(angle) * l1];
  const endAngle = Math.atan2(target[1] - joint[1], target[0] - joint[0]);
  const end = [joint[0] + Math.cos(endAngle) * l2, joint[1] + Math.sin(endAngle) * l2];
  return { joint, end };
}

export function animLabel(id) {
  return SVG_ANIMATIONS[id]?.label || id;
}
