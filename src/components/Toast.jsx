import { useEffect, useRef } from 'react';

export default function Toast({ message, tone = 'success', onDone }) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!message) return undefined;
    const id = setTimeout(() => doneRef.current?.(), 2200);
    return () => clearTimeout(id);
  }, [message]);

  if (!message) return null;
  return (
    <div className={`toast toast-${tone}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
