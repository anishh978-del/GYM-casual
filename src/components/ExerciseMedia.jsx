import { useEffect, useMemo, useRef, useState } from 'react';
import { imagePairSrc, resolveMedia } from '../data/exerciseMedia.js';
import { usePrefersReducedMotion } from '../lib/hooks.js';
import SvgAnimation from './SvgAnimation.jsx';

/**
 * Renders the demonstration for an exercise.
 * media.type: pair | svg | youtube | video | image (uploads / GIFs)
 */
export default function ExerciseMedia({
  exercise,
  size = 'large',
  playing = true,
  slow = false,
  className = '',
}) {
  const media = useMemo(() => resolveMedia(exercise), [exercise]);
  const reduced = usePrefersReducedMotion();
  const thumb = size === 'thumb';

  if (media.type === 'svg') {
    return (
      <div className={`media media-svg ${thumb ? 'is-thumb' : ''} ${className}`}>
        <SvgAnimation
          key={media.animation || 'stretching'}
          name={media.animation || 'stretching'}
          playing={!reduced && playing}
          speed={slow ? 0.5 : 1}
          reduced={reduced}
        />
      </div>
    );
  }

  if (media.type === 'pair') {
    return (
      <ImagePair
        datasetId={media.datasetId}
        playing={!reduced && playing}
        slow={slow}
        thumb={thumb}
        className={className}
        label={exercise?.nameEn}
      />
    );
  }

  if (media.type === 'youtube') {
    return <YouTubeMedia url={media.url} playing={playing} slow={slow} thumb={thumb} className={className} />;
  }

  if (media.type === 'video') {
    return <VideoMedia src={media.src} playing={playing} slow={slow} thumb={thumb} className={className} />;
  }

  return (
    <div className={`media media-image ${thumb ? 'is-thumb' : ''} ${className}`}>
      <img src={media.src} alt={exercise?.nameEn || 'Exercise demo'} loading={thumb ? 'lazy' : 'eager'} />
    </div>
  );
}

function ImagePair({ datasetId, playing, slow, thumb, className, label }) {
  const [frame, setFrame] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), slow ? 2000 : 1000);
    return () => clearInterval(id);
  }, [playing, slow]);

  useEffect(() => {
    setFrame(0);
    setFailed(false);
  }, [datasetId]);

  if (failed) {
    return (
      <div className={`media media-svg ${thumb ? 'is-thumb' : ''} ${className}`}>
        <SvgAnimation name={thumb ? 'stretching' : 'idle'} playing={false} reduced />
        {!thumb && <p className="media-error">Demo unavailable</p>}
      </div>
    );
  }

  return (
    <div className={`media media-pair ${thumb ? 'is-thumb' : ''} ${className}`}>
      <img
        className={`pair-img ${frame === 0 ? 'is-on' : ''}`}
        src={imagePairSrc(datasetId, 0)}
        alt={label ? `${label}, start position` : 'Start position'}
        onError={() => setFailed(true)}
        loading={thumb ? 'lazy' : 'eager'}
        draggable="false"
      />
      <img
        className={`pair-img ${frame === 1 ? 'is-on' : ''}`}
        src={imagePairSrc(datasetId, 1)}
        alt={label ? `${label}, end position` : 'End position'}
        onError={() => setFailed(true)}
        loading={thumb ? 'lazy' : 'eager'}
        draggable="false"
      />
    </div>
  );
}

function VideoMedia({ src, playing, slow, thumb, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.playbackRate = slow ? 0.55 : 1;
    if (playing) el.play().catch(() => {});
    else el.pause();
  }, [playing, slow]);
  return (
    <div className={`media media-video ${thumb ? 'is-thumb' : ''} ${className}`}>
      <video ref={ref} src={src} muted loop playsInline preload="metadata" />
    </div>
  );
}

function youtubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([\w-]{6,})/,
    /[?&]v=([\w-]{6,})/,
    /youtube\.com\/embed\/([\w-]{6,})/,
    /youtube\.com\/shorts\/([\w-]{6,})/,
  ];
  for (const re of patterns) {
    const m = String(url).match(re);
    if (m) return m[1];
  }
  return null;
}

function YouTubeMedia({ url, playing, slow, thumb, className }) {
  const id = youtubeId(url);
  const frameRef = useRef(null);

  useEffect(() => {
    if (thumb || !id) return;
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    const send = (func, args = []) =>
      win.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    send(playing ? 'playVideo' : 'pauseVideo');
    send('setPlaybackRate', [slow ? 0.5 : 1]);
  }, [playing, slow, id, thumb]);

  if (!id) return <div className={`media media-error-box ${thumb ? 'is-thumb' : ''} ${className}`}>Video</div>;

  if (thumb) {
    return (
      <div className={`media media-youtube ${thumb ? 'is-thumb' : ''} ${className}`}>
        <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" />
        <span className="yt-play" aria-hidden="true">▶</span>
      </div>
    );
  }

  return (
    <div className={`media media-youtube large ${className}`}>
      <iframe
        ref={frameRef}
        title="Exercise video"
        src={`https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0&playsinline=1&controls=0&modestbranding=1&loop=1&playlist=${id}&autoplay=1&mute=1`}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
