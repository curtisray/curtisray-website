import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion/react';
import { motionTokens } from '../design/motion';

type Scene = Awaited<
  ReturnType<typeof import('../lib/tensorview/scene').createTensorScene>
>;
const initial = { x: -0.38, y: -0.58, separation: 0 };

export default function TensorPlayground({ fallback }: { fallback: string }) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene | null>(null);
  const pose = useRef({ ...initial });
  const stop = useRef<(() => void) | null>(null);
  const drag = useRef<{
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    active: boolean;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [separation, setSeparation] = useState(0);
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw = () =>
    scene.current?.setPose(
      pose.current.x,
      pose.current.y,
      pose.current.separation,
    );
  useEffect(() => {
    let cancelled = false;
    import('../lib/tensorview/scene')
      .then(({ createTensorScene }) => {
        if (cancelled || !host.current) return;
        try {
          scene.current = createTensorScene(host.current, (x, y) => {
            pose.current.x = x;
            pose.current.y = y;
          });
          scene.current.setPose(initial.x, initial.y, 0);
          setReady(true);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      stop.current?.();
      scene.current?.destroy();
      scene.current = null;
    };
  }, []);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => {
      if (preference.matches) {
        stop.current?.();
        scene.current?.stopRotation();
      }
    };
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);
  function reset() {
    stop.current?.();
    scene.current?.stopRotation();
    setSeparation(0);
    const from = { ...pose.current };
    const animation = animate(0, 1, {
      duration: prefersReducedMotion() ? 0 : motionTokens.standard,
      ease: motionTokens.ease,
      onUpdate: (progress) => {
        pose.current = {
          x: from.x + (initial.x - from.x) * progress,
          y: from.y + (initial.y - from.y) * progress,
          separation: from.separation * (1 - progress),
        };
        draw();
      },
    });
    stop.current = () => animation.stop();
  }
  return (
    <div className="tensor-playground">
      <div
        className="tensor-stage"
        ref={host}
        role="group"
        aria-label="Interactive four by four by four tensor"
        tabIndex={ready ? 0 : -1}
        aria-describedby="tensor-help"
        onKeyDown={(event) => {
          if (
            !ready ||
            !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
              event.key,
            )
          )
            return;
          event.preventDefault();
          stop.current?.();
          scene.current?.stopRotation();
          if (event.key === 'ArrowLeft') pose.current.y -= 0.15;
          if (event.key === 'ArrowRight') pose.current.y += 0.15;
          if (event.key === 'ArrowUp') pose.current.x -= 0.15;
          if (event.key === 'ArrowDown') pose.current.x += 0.15;
          draw();
        }}
        onPointerDown={(event) => {
          if (!ready || event.button !== 0) return;
          stop.current?.();
          scene.current?.stopRotation();
          if (event.pointerType === 'mouse')
            event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            lastX: event.clientX,
            lastY: event.clientY,
            active: event.pointerType === 'mouse',
          };
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current) return;
          if (!current.active) {
            const dx = Math.abs(event.clientX - current.x),
              dy = Math.abs(event.clientY - current.y);
            if (dy > dx && dy > 8) {
              drag.current = null;
              return;
            }
            if (dx < 8) return;
            current.active = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          scene.current?.rotateBy(
            (event.clientY - current.lastY) * 0.009,
            (event.clientX - current.lastX) * 0.009,
            !prefersReducedMotion(),
          );
          current.lastX = event.clientX;
          current.lastY = event.clientY;
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          scene.current?.stopRotation();
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        {!ready && (
          <img
            className="tensor-fallback"
            src={fallback}
            alt="A colorful three-dimensional cube made of smaller tensor cells"
          />
        )}
        <span className="tensor-stage-label" aria-hidden="true">
          T ∈ ℝ⁴×⁴×⁴
        </span>
      </div>
      <div className="tensor-controls">
        <label htmlFor="tensor-separation">
          Separate layers <span>{Math.round(separation * 100)}%</span>
        </label>
        <input
          id="tensor-separation"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={separation}
          disabled={!ready}
          onChange={(event) => {
            stop.current?.();
            const value = Number(event.target.value);
            setSeparation(value);
            pose.current.separation = value;
            draw();
          }}
        />
        <button type="button" disabled={!ready} onClick={reset}>
          Reset view ↺
        </button>
      </div>
      <p id="tensor-help" className="tensor-help" aria-live="polite">
        {failed
          ? 'The 3D preview is unavailable here. Explore the full app using the link above.'
          : 'Drag to rotate. Use the slider to pull the layers apart. Keyboard: focus the cube and use arrow keys.'}
      </p>
    </div>
  );
}
