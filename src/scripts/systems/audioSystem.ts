let audioContext: AudioContext;
const audioBuffers: Map<string, AudioBuffer> = new Map();
let soundsLoaded = false;

const soundAssets = [
  { name: 'pickup-1', url: 'sfx/pickup-1-alt.mp3' },
  { name: 'pickup-2', url: 'sfx/pickup-2.mp3' },
  { name: 'success', url: 'sfx/success-1.mp3' },
  { name: 'gold-summary', url: 'sfx/gold-summary.mp3' },
  { name: 'die', url: 'sfx/die.mp3' },
  { name: 'walk', url: 'sfx/walk.mp3' },
  { name: 'button-click', url: 'sfx/button-click.mp3' },
  { name: 'ui-hover', url: 'sfx/ui-hover.mp3' }
];

export const initAudioSystem = async () => {
  if (audioContext) return;

  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    await Promise.all(
      soundAssets.map(async (asset) => {
        const response = await fetch(asset.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers.set(asset.name, audioBuffer);
      })
    );
    soundsLoaded = true;
  } catch (error) {
    console.error('Audio system failed to initialize:', error);
    soundsLoaded = false;
  }
};

const playSound = (soundName: string, volume: number = 1): { source: AudioBufferSourceNode; gainNode: GainNode } | null => {
  if (!soundsLoaded || !audioBuffers.has(soundName) || !audioContext) return null;

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers.get(soundName)!;

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  source.start(0);
  return { source, gainNode };
};

export const playWalkSound = (pitchRange: number = 200) => {
  const sound = playSound('walk', 0.5);
  if (sound) {
    sound.source.detune.value = Math.random() * 2 * pitchRange;
  }
};

export const playGoldPickupSound = (goldType: string) => {
  const soundKey = ['g7', 'g8', 'g9', 'g10'].includes(goldType) ? 'pickup-2' : 'pickup-1';
  playSound(soundKey, 0.7);
};

export const playSuccessSound = () => playSound('success', 1);
export const playDieSound = () => playSound('die', 0.8);
export const playButtonClickSound = () => playSound('button-click', 0.7);
export const playUIHoverSound = () => playSound('ui-hover', 0.7);

let goldSummarySound: { source: AudioBufferSourceNode; gainNode: GainNode } | null = null;
let goldSummaryFading = false;

export const playGoldSummarySound = () => {
  goldSummarySound = playSound('gold-summary', 0.5);
};

export const stopGoldSummarySound = () => {
  if (goldSummarySound && audioContext && !goldSummaryFading) {
    goldSummaryFading = true;
    const { source, gainNode } = goldSummarySound;
    const fadeTime = 0.3;

    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeTime);

    source.stop(audioContext.currentTime + fadeTime);

    setTimeout(() => {
      goldSummarySound = null;
      goldSummaryFading = false;
    }, fadeTime * 1000);
  }
};

export const setupAudioEventListeners = () => {
  document.addEventListener('pointerdown', (e) => {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('btn')) {
      playButtonClickSound();
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList.contains('btn')) {
      playButtonClickSound();
    }
  });
  document.addEventListener(
    'pointerenter',
    (e) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('btn')) {
        playUIHoverSound();
      }
    },
    true
  );
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('btn')) {
      playUIHoverSound();
    }
  });
};