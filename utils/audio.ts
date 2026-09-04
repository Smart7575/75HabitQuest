// Gamified Web Audio Synthesizer for HabitQuest

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (err) {
    console.warn('AudioContext not available or blocked:', err);
    return null;
  }
}

/**
 * Play a gamified RPG quest completion chime
 * Ascending bright notes with a warm harmonic decay
 */
export function playTaskCompleteSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Arpeggio notes: G4 (392Hz), C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
    const notes = [
      { freq: 392.00, start: now + 0.00, duration: 0.12, gain: 0.18 },
      { freq: 523.25, start: now + 0.07, duration: 0.15, gain: 0.22 },
      { freq: 659.25, start: now + 0.14, duration: 0.18, gain: 0.25 },
      { freq: 783.99, start: now + 0.21, duration: 0.45, gain: 0.30 },
      { freq: 1046.50, start: now + 0.28, duration: 0.50, gain: 0.20 } // Shimmer C6
    ];

    notes.forEach(({ freq, start, duration, gain: noteGain }) => {
      // Main tone (sine)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gainNode.gain.setValueAtTime(0.0001, start);
      gainNode.gain.exponentialRampToValueAtTime(noteGain, start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);

      // Add high sparkle harmonic for the final notes
      if (freq >= 783) {
        const sparkle = ctx.createOscillator();
        const sparkleGain = ctx.createGain();
        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(freq * 2, start);

        sparkleGain.gain.setValueAtTime(0.0001, start);
        sparkleGain.gain.exponentialRampToValueAtTime(noteGain * 0.35, start + 0.02);
        sparkleGain.gain.exponentialRampToValueAtTime(0.0001, start + duration * 0.8);

        sparkle.connect(sparkleGain);
        sparkleGain.connect(ctx.destination);

        sparkle.start(start);
        sparkle.stop(start + duration * 0.8);
      }
    });
  } catch (e) {
    console.warn('Error playing task completion sound:', e);
  }
}

/**
 * Play a triumphant Level Up fanfare
 */
export function playLevelUpSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 440.00, start: now + 0.00, duration: 0.12 }, // A4
      { freq: 554.37, start: now + 0.10, duration: 0.12 }, // C#5
      { freq: 659.25, start: now + 0.20, duration: 0.12 }, // E5
      { freq: 880.00, start: now + 0.30, duration: 0.60 }  // A5
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gainNode.gain.setValueAtTime(0.0001, start);
      gainNode.gain.exponentialRampToValueAtTime(0.28, start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    });
  } catch (e) {
    console.warn('Error playing level up sound:', e);
  }
}

/**
 * Play a subtle click / tap sound when toggling or unchecking
 */
export function playSubtleClick(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {
    console.warn('Error playing click sound:', e);
  }
}
