let audioCtx;

function getCtx() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

/** Soft triple beep for the end of a rest / timer. */
export function beep(times = 3) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < times; i += 1) {
      const start = now + i * 0.34;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.11, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.32);
    }
  } catch {
    /* audio is a nice-to-have */
  }
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([180, 90, 180]);
  }
}
