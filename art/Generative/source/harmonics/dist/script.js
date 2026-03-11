const canvas = document.getElementById('harmonicCanvas');
const ctx = canvas.getContext('2d', { 
  alpha: false,
  desynchronized: true
});
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

const ratioText = document.getElementById('ratioText');

const intervals = [
  [1, 1],      // 0: unison
  [16, 15],    // 1: minor second
  [9, 8],      // 2: major second
  [6, 5],      // 3: minor third
  [5, 4],      // 4: major third
  [4, 3],      // 5: perfect fourth
  [45, 32],    // 6: tritone
  [3, 2],      // 7: perfect fifth
  [8, 5],      // 8: minor sixth
  [5, 3],      // 9: major sixth
  [9, 5],      // 10: minor seventh
  [15, 8],     // 11: major seventh
  [2, 1]       // 12: octave
];

const views = ['lateralClosed', 'counterCurrent', 'lateralOpen', 'concurrent'];

const passDuration = 90; // seconds per pass
const totalCycleDuration = 720; // 12 minutes total
const motionBlurAlpha = 0.05;

/**
 * Time warping function - creates slowdown at every harmonic ratio
 * Input: 0-1 linear progress
 * Output: 0-1 warped progress
 */
const timeWarp = (x) => {
  const numIntervals = intervals.length - 1;
  const scaledProgress = x * numIntervals;
  const currentInterval = Math.floor(scaledProgress);
  const localProgress = scaledProgress - currentInterval;

  // Smoothstep easing function
  const smoothstep = (t) => {
    return t * t * (3 - 2 * t);
  };

  // Apply smoothstep twice for extra smoothness
  let eased = smoothstep(localProgress);
  eased = smoothstep(eased);

  const warpedProgress = (currentInterval + eased) / numIntervals;
  return warpedProgress;
};

/**
 * Calculate coordinates for a given parametric angle in a specific view
 */
const getCoordinates = (t, ratio, view, scale, baseRadius) => {
  const [a, b] = ratio;

  // Safety check
  if (!isFinite(a) || !isFinite(b) || !isFinite(t)) {
    return { x: 0, y: 0 };
  }

  switch(view) {
    case 'lateralOpen':
      return {
        x: scale * Math.sin(a * t),
        y: scale * Math.sin(b * t)
      };

    case 'lateralClosed':
      return {
        x: scale * Math.cos(a * t),
        y: scale * Math.sin(b * t)
      };

    case 'concurrent':
      const r1 = baseRadius * (1 + 0.6 * Math.sin(b * t));
      const angle1 = a * t;
      return {
        x: r1 * Math.cos(angle1),
        y: r1 * Math.sin(angle1)
      };

    case 'counterCurrent':
      const r2 = baseRadius * (1 + 0.6 * Math.sin(b * t));
      const angle2 = a * t - b * t;
      return {
        x: r2 * Math.cos(angle2),
        y: r2 * Math.sin(angle2)
      };

    default:
      return { x: 0, y: 0 };
  }
};

/**
 * Draw the harmonic pattern with motion blur
 */
const drawUnifiedPattern = (ratio, currentView, nextView, viewT) => {
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  // Motion blur effect
  ctx.fillStyle = `rgba(0, 0, 0, ${motionBlurAlpha})`;
  ctx.fillRect(0, 0, w, h);

  const points = 800;
  const scale = Math.min(w, h) * 0.35;
  const baseRadius = scale * 0.7;

  ctx.fillStyle = '#f5f5f5';

  const cycles = Math.max(2, Math.ceil(Math.max(ratio[0], ratio[1])) * 2);

  // Draw points
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 * cycles;

    // Get coordinates in both views
    const current = getCoordinates(angle, ratio, currentView, scale, baseRadius);
    const next = getCoordinates(angle, ratio, nextView, scale, baseRadius);

    // Interpolate between views
    const x = cx + current.x * (1 - viewT) + next.x * viewT;
    const y = cy + current.y * (1 - viewT) + next.y * viewT;

    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
};

const startTime = Date.now();

/**
 * Main animation loop
 */
const animate = () => {
  const elapsed = (Date.now() - startTime) / 1000;
  const cycleTime = elapsed % totalCycleDuration;

  // Determine which pass we're on (0-7)
  const passIndex = Math.floor(cycleTime / passDuration);
  const timeInPass = cycleTime % passDuration;

  // Even passes: ascending, view stable
  // Odd passes: descending, view transitioning
  const isAscending = passIndex % 2 === 0;
  const isTransitioning = !isAscending;

  // Determine current and next view
  const viewSegment = Math.floor(passIndex / 2);
  const currentViewIndex = viewSegment % views.length;
  const nextViewIndex = (viewSegment + 1) % views.length;

  // Calculate ratio progress with time warping
  const linearProgress = timeInPass / passDuration;
  const warpedProgress = timeWarp(linearProgress);

  let ratioProgress;
  if (isAscending) {
    // 1:1 → 2:1
    ratioProgress = warpedProgress * (intervals.length - 1);
  } else {
    // 2:1 → 1:1
    ratioProgress = (intervals.length - 1) * (1 - warpedProgress);
  }

  const viewProgress = isTransitioning ? warpedProgress : 0;

  // Get current ratio by interpolation
  const ratioIndex = Math.floor(ratioProgress);
  const ratioT = ratioProgress - ratioIndex;

  const safeRatioIndex = Math.min(Math.max(ratioIndex, 0), intervals.length - 1);
  const safeNextRatioIndex = Math.min(Math.max(ratioIndex + 1, 0), intervals.length - 1);

  const currentRatio = [
    intervals[safeRatioIndex][0] + (intervals[safeNextRatioIndex][0] - intervals[safeRatioIndex][0]) * ratioT,
    intervals[safeRatioIndex][1] + (intervals[safeNextRatioIndex][1] - intervals[safeRatioIndex][1]) * ratioT
  ];

  // Update ratio display
  ratioText.textContent = `${currentRatio[0].toFixed(2)}:${currentRatio[1].toFixed(2)}`;

  // Draw the pattern
  drawUnifiedPattern(
    currentRatio,
    views[currentViewIndex],
    views[nextViewIndex],
    viewProgress
  );

  requestAnimationFrame(animate);
};

// Start the animation
animate();