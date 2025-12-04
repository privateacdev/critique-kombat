/**
 * Audio Manager for Critique Kombat
 * Handles all game audio including music, SFX, and voice lines
 */

type AudioCategory = 'music' | 'sfx' | 'voice';

interface AudioInstance {
  audio: HTMLAudioElement;
  category: AudioCategory;
  volume: number;
}

class AudioManager {
  private instances: Map<string, AudioInstance> = new Map();
  private currentMusic: HTMLAudioElement | null = null;
  private masterVolume = 0.7;
  private musicVolume = 0.5;
  private sfxVolume = 0.8;
  private voiceVolume = 1.0;
  private muted = false;

  /**
   * Preload audio file
   */
  preload(key: string, path: string, category: AudioCategory = 'sfx', volume = 1.0) {
    if (this.instances.has(key)) return;

    const audio = new Audio(path);
    audio.preload = 'auto';
    audio.volume = this.calculateVolume(category, volume);

    this.instances.set(key, { audio, category, volume });
  }

  /**
   * Play audio by key
   */
  play(key: string, options: { loop?: boolean; volume?: number; restart?: boolean } = {}) {
    const instance = this.instances.get(key);
    if (!instance || this.muted) return;

    const { audio, category, volume: baseVolume } = instance;
    const { loop = false, volume = baseVolume, restart = false } = options;

    if (restart) {
      audio.currentTime = 0;
    }

    audio.loop = loop;
    audio.volume = this.calculateVolume(category, volume);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn(`Failed to play audio ${key}:`, error);
      });
    }
  }

  /**
   * Play music track (stops current music first)
   */
  playMusic(key: string, volume = 0.5) {
    this.stopMusic();

    const instance = this.instances.get(key);
    if (!instance || this.muted) return;

    instance.audio.loop = true;
    instance.audio.volume = this.calculateVolume('music', volume);

    const playPromise = instance.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn(`Failed to play music ${key}:`, error);
      });
    }

    this.currentMusic = instance.audio;
  }

  /**
   * Stop current music
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  /**
   * Stop specific audio
   */
  stop(key: string) {
    const instance = this.instances.get(key);
    if (instance) {
      instance.audio.pause();
      instance.audio.currentTime = 0;
    }
  }

  /**
   * Pause specific audio
   */
  pause(key: string) {
    const instance = this.instances.get(key);
    if (instance) {
      instance.audio.pause();
    }
  }

  /**
   * Resume specific audio
   */
  resume(key: string) {
    const instance = this.instances.get(key);
    if (instance && !this.muted) {
      instance.audio.play().catch((error) => {
        console.warn(`Failed to resume audio ${key}:`, error);
      });
    }
  }

  /**
   * Calculate effective volume based on category and master volume
   */
  private calculateVolume(category: AudioCategory, baseVolume: number): number {
    if (this.muted) return 0;

    let categoryVolume = 1.0;
    switch (category) {
      case 'music':
        categoryVolume = this.musicVolume;
        break;
      case 'sfx':
        categoryVolume = this.sfxVolume;
        break;
      case 'voice':
        categoryVolume = this.voiceVolume;
        break;
    }

    return Math.min(1.0, this.masterVolume * categoryVolume * baseVolume);
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Set music volume (0-1)
   */
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Set SFX volume (0-1)
   */
  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Set voice volume (0-1)
   */
  setVoiceVolume(volume: number) {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.muted = !this.muted;
    this.updateAllVolumes();
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean) {
    this.muted = muted;
    this.updateAllVolumes();
  }

  /**
   * Update volumes for all loaded audio
   */
  private updateAllVolumes() {
    this.instances.forEach((instance, key) => {
      instance.audio.volume = this.calculateVolume(instance.category, instance.volume);
    });
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(key: string): boolean {
    const instance = this.instances.get(key);
    if (!instance) return false;
    return !instance.audio.paused && instance.audio.currentTime > 0;
  }

  /**
   * Get audio duration
   */
  getDuration(key: string): number {
    const instance = this.instances.get(key);
    return instance?.audio.duration || 0;
  }

  /**
   * Set playback position
   */
  seek(key: string, time: number) {
    const instance = this.instances.get(key);
    if (instance) {
      instance.audio.currentTime = Math.max(0, Math.min(time, instance.audio.duration));
    }
  }

  /**
   * Clean up all audio resources
   */
  dispose() {
    this.stopMusic();
    this.instances.forEach((instance) => {
      instance.audio.pause();
      instance.audio.src = '';
    });
    this.instances.clear();
  }
}

// Create singleton instance
const audioManager = new AudioManager();

// Preload all game audio
export function initializeAudio() {
  // UI Sounds
  audioManager.preload('menuMove', '/assets/mkw_umk3_sounds/ui/mk3-01090.mp3', 'sfx', 0.6);
  audioManager.preload('menuConfirm', '/assets/mkw_umk3_sounds/ui/mk3-01085.mp3', 'sfx', 0.7);
  audioManager.preload('roundStart', '/assets/mkw_umk3_sounds/ui/mk3-01065.mp3', 'voice', 0.9);
  audioManager.preload('finishHim', '/assets/mkw_umk3_sounds/male/mk3-05000.mp3', 'voice', 1.0);

  // Combat SFX
  audioManager.preload('hitLight', '/assets/mkw_umk3_sounds/hitsounds/mk3-00190.mp3', 'sfx', 0.7);
  audioManager.preload('hitHeavy', '/assets/mkw_umk3_sounds/hitsounds/mk3-00345.mp3', 'sfx', 0.8);
  audioManager.preload('block', '/assets/mkw_umk3_sounds/hitsounds/mk3-00350.mp3', 'sfx', 0.7);
  audioManager.preload('projectile', '/assets/mkw_umk3_sounds/hitsounds/mk3-00150.mp3', 'sfx', 0.6);
  audioManager.preload('parry', '/assets/mkw_umk3_sounds/specialfx/mk3-00595.mp3', 'sfx', 0.8);
  audioManager.preload('spectacle', '/assets/mkw_umk3_sounds/ui/mk3-01115.mp3', 'sfx', 0.9);

  // Dan Forden voice lines
  audioManager.preload('toasty', '/assets/mkw_umk3_sounds/danforden/mk3-04215.mp3', 'voice', 0.9);
  audioManager.preload('excellent', '/assets/mkw_umk3_sounds/danforden/mk3-04240.mp3', 'voice', 0.9);
  audioManager.preload('outstanding', '/assets/mkw_umk3_sounds/danforden/mk3-04255.mp3', 'voice', 0.9);
  audioManager.preload('combo', '/assets/mkw_umk3_sounds/danforden/mk3-04245.mp3', 'voice', 0.9);

  // Character voice lines
  audioManager.preload('characterSelect', '/assets/mkw_umk3_sounds/ui/mk3-01100.mp3', 'voice', 0.8);

  // Arena music tracks (using long music cues for better background music)
  audioManager.preload('arenaMusic1', '/assets/mkw_umk3_sounds/longmusiccues/mk3-00018.mp3', 'music', 0.4);
  audioManager.preload('arenaMusic2', '/assets/mkw_umk3_sounds/longmusiccues/mk3-00021.mp3', 'music', 0.4);
  audioManager.preload('arenaMusic3', '/assets/mkw_umk3_sounds/longmusiccues/mk3-00022.mp3', 'music', 0.4);
  audioManager.preload('arenaMusic4', '/assets/mkw_umk3_sounds/longmusiccues/mk3-00025.mp3', 'music', 0.4);
  audioManager.preload('arenaMusic5', '/assets/mkw_umk3_sounds/longmusiccues/mk3-00026.mp3', 'music', 0.4);
  audioManager.preload('arenaMusic6', '/assets/mkw_umk3_sounds/longmusiccues/mk3-00010.mp3', 'music', 0.4);
  audioManager.preload('arenaMusic7', '/assets/mkw_umk3_sounds/longmusiccues/mk3-00014.mp3', 'music', 0.4);

  // Fatality sounds
  audioManager.preload('fatalityBegin', '/assets/mkw_umk3_sounds/male/mk3-05000.mp3', 'voice', 1.0);
  audioManager.preload('fatalityEnd', '/assets/mkw_umk3_sounds/shortmusiccues/mk3-00037.mp3', 'music', 0.8);

  // Long music cues for dramatic moments
  audioManager.preload('victory', '/assets/mkw_umk3_sounds/longmusiccues/mk3-00018.mp3', 'music', 0.6);
  audioManager.preload('gameover', '/assets/mkw_umk3_sounds/longmusiccues/mk3-00019.mp3', 'music', 0.6);

  console.log('🔊 Audio initialized');
}

export default audioManager;
