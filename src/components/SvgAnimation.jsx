import { useEffect, useRef, useState } from 'react';
import { SVG_ANIMATIONS, samplePose, solveFigure } from '../lib/animations.js';

const INK = '#3f3a34';
const FAR = '#b7b0a6';
const HEAD_FILL = '#fffdf8';

/**
 * Looping stick-figure animation. Used for exercises that have no photo pair
 * (cardio, cycling, walking, stretching, Surya Namaskar, kneeling push-ups).
 */
export default function SvgAnimation({ name = 'stretching', playing = true, speed = 1, reduced = false }) {
  const def = SVG_ANIMATIONS[name] || SVG_ANIMATIONS.stretching;
  const [time, setTime] = useState(0);
  const clock = useRef({ value: 0, last: 0, acc: 0 });

  useEffect(() => {
    if (reduced) {
      clock.current.value = def.duration * 0.35;
      setTime(clock.current.value);
      return undefined;
    }
    if (!playing) return undefined;
    let raf;
    clock.current.last = performance.now();
    clock.current.acc = 0;
    const tick = (now) => {
      const dt = Math.min(now - clock.current.last, 100);
      clock.current.last = now;
      clock.current.value = (clock.current.value + dt * speed) % def.duration;
      clock.current.acc += dt;
      if (clock.current.acc >= 33) {
        clock.current.acc = 0;
        setTime(clock.current.value);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, reduced, def.duration]);

  const pose = samplePose(def, time);
  const figure = solveFigure(pose);
  const phase = (time / def.duration) * Math.PI * 2;

  return (
    <svg
      className="svg-anim"
      viewBox="0 0 340 230"
      role="img"
      aria-label="Exercise demonstration"
      preserveAspectRatio="xMidYMid meet"
    >
      <ellipse cx="170" cy="203" rx="74" ry="5" fill="rgba(63,58,52,0.09)" />
      <SceneProps def={def} figure={figure} />
      <Figure figure={figure} />
      {def.arrows?.map((arrow, i) => (
        <Arrow key={i} {...arrow} pulse={0.5 + 0.5 * Math.sin(phase)} />
      ))}
    </svg>
  );
}

function Figure({ figure }) {
  const { hip, shoulder, head, armA, armB, legA, legB, footA, footB } = figure;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* far side, lighter */}
      <polyline points={[hip, legB.joint, legB.end].map((p) => p.join(',')).join(' ')} stroke={FAR} strokeWidth="10" />
      <line x1={legB.end[0]} y1={legB.end[1]} x2={footB[0]} y2={footB[1]} stroke={FAR} strokeWidth="7" />
      <polyline
        points={[shoulder, armB.joint, armB.end].map((p) => p.join(',')).join(' ')}
        stroke={FAR}
        strokeWidth="9"
      />
      <circle cx={armB.end[0]} cy={armB.end[1]} r="4" fill={FAR} stroke="none" />

      {/* torso + head */}
      <line x1={hip[0]} y1={hip[1]} x2={shoulder[0]} y2={shoulder[1]} stroke={INK} strokeWidth="13" />
      <line x1={shoulder[0]} y1={shoulder[1]} x2={head[0]} y2={head[1]} stroke={INK} strokeWidth="7" />
      <circle cx={head[0]} cy={head[1]} r="13" fill={HEAD_FILL} stroke={INK} strokeWidth="4" />

      {/* near side */}
      <polyline points={[hip, legA.joint, legA.end].map((p) => p.join(',')).join(' ')} stroke={INK} strokeWidth="10" />
      <line x1={legA.end[0]} y1={legA.end[1]} x2={footA[0]} y2={footA[1]} stroke={INK} strokeWidth="8" />
      <polyline
        points={[shoulder, armA.joint, armA.end].map((p) => p.join(',')).join(' ')}
        stroke={INK}
        strokeWidth="9"
      />
      <circle cx={armA.end[0]} cy={armA.end[1]} r="4.5" fill={INK} stroke="none" />
    </g>
  );
}

function SceneProps({ def, figure }) {
  const has = (kind) => def.props?.includes(kind);
  return (
    <g>
      {has('mat') && <rect x="86" y="199" width="180" height="9" rx="4.5" fill="#efe7da" />}
      {has('treadmill') && <Treadmill />}
      {has('bike') && <Bike figure={figure} />}
    </g>
  );
}

function Treadmill() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <rect x="74" y="199" width="204" height="12" rx="6" fill="#e7e1d8" stroke="#c9c2b6" strokeWidth="2" />
      <line x1="96" y1="204" x2="250" y2="204" stroke="#bdb5a8" strokeWidth="3" strokeDasharray="9 9" />
      <path d="M264 201 L268 124" stroke="#a8a198" strokeWidth="6" />
      <rect x="242" y="100" width="48" height="28" rx="7" fill="#f7f3ea" stroke="#a8a198" strokeWidth="3" />
      <line x1="252" y1="110" x2="280" y2="110" stroke="#c9c2b6" strokeWidth="3" />
      <line x1="252" y1="118" x2="274" y2="118" stroke="#c9c2b6" strokeWidth="3" />
    </g>
  );
}

function Bike({ figure }) {
  const crank = [215, 178];
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1="92" y1="202" x2="296" y2="202" stroke="#c9c2b6" strokeWidth="5" />
      <circle cx="272" cy="160" r="33" stroke="#b8b2a8" strokeWidth="5" />
      <circle cx="272" cy="160" r="7" fill="#b8b2a8" stroke="none" />
      <path d="M272 160 L215 178 L190 140 L272 160" stroke="#a8a198" strokeWidth="6" />
      <path d="M215 178 L188 148" stroke="#a8a198" strokeWidth="6" />
      <path d="M252 164 L247 106" stroke="#a8a198" strokeWidth="6" />
      <line x1="230" y1="106" x2="262" y2="102" stroke="#8f887d" strokeWidth="8" />
      <rect x="166" y="143" width="44" height="9" rx="4.5" fill="#8f887d" />
      <line x1="188" y1="148" x2="188" y2="158" stroke="#a8a198" strokeWidth="6" />
      <circle cx={crank[0]} cy={crank[1]} r="8" stroke="#8f887d" strokeWidth="4" />
      <g stroke="#8f887d" strokeWidth="5">
        <line x1={crank[0]} y1={crank[1]} x2={figure.legA.end[0]} y2={figure.legA.end[1]} />
        <line x1={crank[0]} y1={crank[1]} x2={figure.legB.end[0]} y2={figure.legB.end[1]} />
      </g>
      <rect x={figure.legA.end[0] - 7} y={figure.legA.end[1] - 2} width="14" height="5" rx="2" fill="#57534e" />
    </g>
  );
}

function Arrow({ from, to, pulse }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 8;
  const left = [x2 - Math.cos(angle - 0.5) * size, y2 - Math.sin(angle - 0.5) * size];
  const right = [x2 - Math.cos(angle + 0.5) * size, y2 - Math.sin(angle + 0.5) * size];
  return (
    <g opacity={0.25 + pulse * 0.45} stroke="#15803d" fill="#15803d">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="5 6" />
      <polygon points={`${x2},${y2} ${left.join(',')} ${right.join(',')}`} stroke="none" />
    </g>
  );
}
