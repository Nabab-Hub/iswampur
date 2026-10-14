import confetti from 'canvas-confetti';

/**
 * Triggers a festive celebratory confetti / party popper explosion
 */
export function firePartyPopper() {
  try {
    // Left cannon
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#F26522', '#F9A01B', '#00A3E0', '#10B981', '#E11D48', '#FFD700'],
      zIndex: 9999,
    });

    // Right cannon
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 70,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#F26522', '#F9A01B', '#00A3E0', '#10B981', '#E11D48', '#FFD700'],
      zIndex: 9999,
    });

    // Center burst with stars and shapes
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        shapes: ['circle', 'square'],
        colors: ['#FFD700', '#FFA500', '#F26522', '#10B981', '#00A3E0'],
        zIndex: 9999,
      });
    }, 200);
  } catch (err) {
    console.warn('Confetti animation error:', err);
  }
}

/**
 * Grand Finale Championship celebratory continuous fireworks blast
 */
export function fireChampionshipGrandBurst() {
  try {
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        startVelocity: 35,
        spread: 360,
        ticks: 70,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
        colors: ['#FFD700', '#F9A01B', '#F26522', '#10B981', '#3B82F6', '#EC4899'],
        zIndex: 9999,
      });
    }, 250);
  } catch (err) {
    console.warn('Grand burst error:', err);
  }
}
