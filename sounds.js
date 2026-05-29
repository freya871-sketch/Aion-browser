// AION Browser MMO - Sound Manager
const SoundManager = {
    // Audio context
    audioContext: null,
    
    // Master volume
    masterVolume: 0.7,
    
    // Sound enabled flags
    musicEnabled: true,
    soundEnabled: true,
    
    // Audio elements for HTML5 Audio fallback
    audioElements: {},
    
    // Sound cache
    soundCache: {},
    
    // Background music
    backgroundMusic: null,
    currentMusic: null,
    
    // Music tracks
    musicTracks: {
        // Day music
        day: {
            name: 'Day Theme',
            notes: [
                { note: 'C4', duration: 0.5, time: 0 },
                { note: 'E4', duration: 0.5, time: 0.5 },
                { note: 'G4', duration: 0.5, time: 1 },
                { note: 'C5', duration: 1, time: 1.5 },
                { note: 'E5', duration: 0.5, time: 2.5 },
                { note: 'D5', duration: 0.5, time: 3 },
                { note: 'E5', duration: 0.5, time: 3.5 },
                { note: 'F5', duration: 0.5, time: 4 },
                { note: 'G5', duration: 1, time: 4.5 }
            ],
            loop: true
        },
        
        // Night music
        night: {
            name: 'Night Theme',
            notes: [
                { note: 'A3', duration: 0.5, time: 0 },
                { note: 'C4', duration: 0.5, time: 0.5 },
                { note: 'E4', duration: 0.5, time: 1 },
                { note: 'A4', duration: 1, time: 1.5 },
                { note: 'G4', duration: 0.5, time: 2.5 },
                { note: 'F4', duration: 0.5, time: 3 },
                { note: 'G4', duration: 0.5, time: 3.5 },
                { note: 'A4', duration: 0.5, time: 4 },
                { note: 'B4', duration: 1, time: 4.5 }
            ],
            loop: true
        },
        
        // Dungeon music
        dungeon: {
            name: 'Dungeon Theme',
            notes: [
                { note: 'C2', duration: 0.5, time: 0 },
                { note: 'C3', duration: 0.5, time: 0.5 },
                { note: 'G2', duration: 0.5, time: 1 },
                { note: 'G3', duration: 0.5, time: 1.5 },
                { note: 'C3', duration: 0.5, time: 2 },
                { note: 'E3', duration: 0.5, time: 2.5 },
                { note: 'G3', duration: 0.5, time: 3 },
                { note: 'C4', duration: 1, time: 3.5 }
            ],
            loop: true
        },
        
        // Arena music
        arena: {
            name: 'Arena Theme',
            notes: [
                { note: 'E4', duration: 0.25, time: 0 },
                { note: 'F4', duration: 0.25, time: 0.25 },
                { note: 'G4', duration: 0.25, time: 0.5 },
                { note: 'A4', duration: 0.25, time: 0.75 },
                { note: 'B4', duration: 0.5, time: 1 },
                { note: 'A4', duration: 0.25, time: 1.5 },
                { note: 'G4', duration: 0.25, time: 1.75 },
                { note: 'F4', duration: 0.25, time: 2 },
                { note: 'E4', duration: 0.5, time: 2.25 }
            ],
            loop: true
        },
        
        // Boss music
        boss: {
            name: 'Boss Theme',
            notes: [
                { note: 'C2', duration: 1, time: 0 },
                { note: 'C3', duration: 0.5, time: 1 },
                { note: 'E3', duration: 0.5, time: 1.5 },
                { note: 'G3', duration: 0.5, time: 2 },
                { note: 'C4', duration: 1, time: 2.5 },
                { note: 'B3', duration: 0.5, time: 3.5 },
                { note: 'A3', duration: 0.5, time: 4 },
                { note: 'G3', duration: 1, time: 4.5 }
            ],
            loop: true
        }
    },
    
    // Sound effects
    soundEffects: {
        // Player sounds
        jump: { type: 'tone', freq: 440, duration: 0.1, wave: 'sine' },
        walk: { type: 'tone', freq: 220, duration: 0.05, wave: 'sine' },
        
        // Combat sounds
        attack: { type: 'tone', freq: 880, duration: 0.1, wave: 'sawtooth' },
        sword: { type: 'tone', freq: 660, duration: 0.2, wave: 'sawtooth' },
        magic: { type: 'tone', freq: 1320, duration: 0.3, wave: 'sine' },
        bow: { type: 'tone', freq: 1100, duration: 0.2, wave: 'sine' },
        
        // Damage sounds
        damage: { type: 'tone', freq: 200, duration: 0.3, wave: 'sawtooth' },
        critical: { type: 'tone', freq: 150, duration: 0.4, wave: 'sawtooth' },
        
        // Heal sounds
        heal: { type: 'tone', freq: 1000, duration: 0.3, wave: 'sine' },
        
        // Level up sound
        levelup: { 
            type: 'sequence',
            notes: [
                { freq: 523.25, duration: 0.2 },
                { freq: 659.25, duration: 0.2 },
                { freq: 783.99, duration: 0.3 },
                { freq: 1046.50, duration: 0.5 }
            ]
        },
        
        // Quest sounds
        questAccept: { type: 'tone', freq: 800, duration: 0.2, wave: 'sine' },
        questComplete: { 
            type: 'sequence',
            notes: [
                { freq: 523.25, duration: 0.2 },
                { freq: 659.25, duration: 0.2 },
                { freq: 783.99, duration: 0.4 }
            ]
        },
        
        // Death sound
        death: { type: 'tone', freq: 100, duration: 0.8, wave: 'sawtooth' },
        
        // Item sounds
        pickup: { type: 'tone', freq: 1200, duration: 0.1, wave: 'sine' },
        gold: { type: 'tone', freq: 1400, duration: 0.1, wave: 'sine' },
        
        // Mount sounds
        mount: { type: 'tone', freq: 300, duration: 0.3, wave: 'sine' },
        fly: { type: 'tone', freq: 400, duration: 0.5, wave: 'sine' },
        
        // Weather sounds
        rain: { type: 'noise', duration: 0.1, frequency: 500 },
        thunder: { type: 'tone', freq: 150, duration: 1, wave: 'sawtooth' },
        wind: { type: 'noise', duration: 0.5, frequency: 200 }
    },
    
    // Note frequencies (for Web Audio API)
    noteFrequencies: {
        'C2': 65.41,
        'C#2': 69.30,
        'D2': 73.42,
        'D#2': 77.78,
        'E2': 82.41,
        'F2': 87.31,
        'F#2': 92.50,
        'G2': 98.00,
        'G#2': 103.83,
        'A2': 110.00,
        'A#2': 116.54,
        'B2': 123.47,
        'C3': 130.81,
        'C#3': 138.59,
        'D3': 146.83,
        'D#3': 155.56,
        'E3': 164.81,
        'F3': 174.61,
        'F#3': 185.00,
        'G3': 196.00,
        'G#3': 207.65,
        'A3': 220.00,
        'A#3': 233.08,
        'B3': 246.94,
        'C4': 261.63,
        'C#4': 277.18,
        'D4': 293.66,
        'D#4': 311.13,
        'E4': 329.63,
        'F4': 349.23,
        'F#4': 369.99,
        'G4': 392.00,
        'G#4': 415.30,
        'A4': 440.00,
        'A#4': 466.16,
        'B4': 493.88,
        'C5': 523.25,
        'C#5': 554.37,
        'D5': 587.33,
        'D#5': 622.25,
        'E5': 659.25,
        'F5': 698.46,
        'F#5': 739.99,
        'G5': 783.99,
        'G#5': 830.61,
        'A5': 880.00,
        'A#5': 932.33,
        'B5': 987.77,
        'C6': 1046.50
    },
    
    // Initialize sound manager
    init() {
        // Try to create audio context
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Web Audio API supported');
        } catch (e) {
            console.log('Web Audio API not supported, falling back to HTML5 Audio');
            this.audioContext = null;
        }
        
        // Create audio elements for fallback
        this.createAudioElements();
        
        // Set volume
        this.setVolume(this.masterVolume);
    },
    
    // Create audio elements for HTML5 fallback
    createAudioElements() {
        const soundIds = [
            'jump', 'walk', 'attack', 'sword', 'magic', 'bow',
            'damage', 'critical', 'heal', 'levelup', 'questAccept',
            'questComplete', 'death', 'pickup', 'gold', 'mount', 'fly',
            'rain', 'thunder', 'wind'
        ];
        
        soundIds.forEach(id => {
            this.audioElements[id] = document.getElementById(`sound-${id}`) || 
                this.createAudioElement(id);
        });
        
        // Background music
        this.backgroundMusic = document.getElementById('background-music');
    },
    
    // Create an audio element
    createAudioElement(id) {
        const audio = document.createElement('audio');
        audio.id = `sound-${id}`;
        audio.preload = 'auto';
        document.body.appendChild(audio);
        return audio;
    },
    
    // Set master volume
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        // Update HTML5 audio elements
        for (const id in this.audioElements) {
            this.audioElements[id].volume = this.masterVolume * (this.soundEnabled ? 1 : 0);
        }
        
        // Update background music
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.masterVolume * (this.musicEnabled ? 1 : 0);
        }
    },
    
    // Enable/disable music
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.masterVolume * (enabled ? 1 : 0);
        }
        
        if (!enabled && this.currentMusic) {
            this.stopBackgroundMusic();
        }
    },
    
    // Enable/disable sound effects
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        
        for (const id in this.audioElements) {
            this.audioElements[id].volume = this.masterVolume * (enabled ? 1 : 0);
        }
    },
    
    // Play a sound effect
    playSound(name, options = {}) {
        if (!this.soundEnabled) return;
        
        const sound = this.soundEffects[name];
        if (!sound) {
            console.warn(`Sound effect '${name}' not found`);
            return;
        }
        
        if (sound.type === 'tone') {
            this.playTone(sound.freq, sound.duration, sound.wave, options);
        } else if (sound.type === 'sequence') {
            this.playSequence(sound.notes, options);
        } else if (sound.type === 'noise') {
            this.playNoise(sound.duration, sound.frequency, options);
        }
    },
    
    // Play a tone
    playTone(frequency, duration, type = 'sine', options = {}) {
        if (!this.audioContext) {
            // Fallback to HTML5 Audio if Web Audio API not supported
            this.playFallbackSound(frequency);
            return;
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        // Set volume with fade
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.5, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    },
    
    // Play a sequence of tones
    playSequence(notes, options = {}) {
        if (!this.audioContext) {
            // Fallback
            this.playFallbackSound(440);
            return;
        }
        
        const now = this.audioContext.currentTime;
        let time = now;
        
        for (const note of notes) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const freq = typeof note.freq === 'string' ? 
                this.noteFrequencies[note.freq] : note.freq;
            oscillator.type = note.wave || 'sine';
            oscillator.frequency.value = freq;
            
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.5, time + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, time + note.duration);
            
            oscillator.start(time);
            oscillator.stop(time + note.duration);
            
            time += note.duration;
        }
    },
    
    // Play noise
    playNoise(duration, frequency, options = {}) {
        if (!this.audioContext) {
            this.playFallbackSound(440);
            return;
        }
        
        // Simple noise using multiple oscillators with random frequencies
        const now = this.audioContext.currentTime;
        const endTime = now + duration;
        
        for (let i = 0; i < 10; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = frequency + (Math.random() - 0.5) * frequency * 0.2;
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, now + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, endTime);
            
            oscillator.start(now);
            oscillator.stop(endTime);
        }
    },
    
    // Play fallback sound (HTML5 Audio)
    playFallbackSound(frequency) {
        if (!this.soundEnabled) return;
        
        // Use a simple beep sound
        const audio = this.audioElements['attack'];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio playback failed:', e));
        }
    },
    
    // Play background music
    playBackgroundMusic(trackName, loop = true) {
        if (!this.musicEnabled || !this.backgroundMusic) return;
        
        // Stop current music
        this.stopBackgroundMusic();
        
        const track = this.musicTracks[trackName];
        if (!track) {
            console.warn(`Music track '${trackName}' not found`);
            return;
        }
        
        this.currentMusic = trackName;
        
        // Play the track
        if (this.audioContext) {
            this.playMusicTrack(track, loop);
        } else {
            // Fallback to HTML5 Audio
            // In a real implementation, you would load actual audio files
            console.log('Playing background music (HTML5 Audio fallback)');
        }
    },
    
    // Play a music track using Web Audio API
    playMusicTrack(track, loop) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        let time = now;
        
        const playNote = (note, delay) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const freq = this.noteFrequencies[note.note];
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            gainNode.gain.setValueAtTime(0, time + delay);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, time + delay + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, time + delay + note.duration - 0.05);
            
            oscillator.start(time + delay);
            oscillator.stop(time + delay + note.duration);
        };
        
        // Play all notes in the track
        for (const note of track.notes) {
            playNote(note, note.time * 1000);
        }
        
        // Loop if needed
        if (loop) {
            const trackDuration = Math.max(...track.notes.map(n => n.time + n.duration)) * 1000;
            this.backgroundMusicLoop = setTimeout(() => {
                this.playMusicTrack(track, loop);
            }, trackDuration);
        }
    },
    
    // Stop background music
    stopBackgroundMusic() {
        if (this.backgroundMusicLoop) {
            clearTimeout(this.backgroundMusicLoop);
            this.backgroundMusicLoop = null;
        }
        
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
        
        this.currentMusic = null;
    },
    
    // Change music based on time of day
    updateMusicForTimeOfDay(timeOfDay) {
        if (timeOfDay === 'day') {
            this.playBackgroundMusic('day');
        } else if (timeOfDay === 'night') {
            this.playBackgroundMusic('night');
        } else if (timeOfDay === 'dungeon') {
            this.playBackgroundMusic('dungeon');
        } else if (timeOfDay === 'arena') {
            this.playBackgroundMusic('arena');
        } else if (timeOfDay === 'boss') {
            this.playBackgroundMusic('boss');
        }
    },
    
    // Play weather sound
    playWeatherSound(weatherType) {
        if (!this.soundEnabled) return;
        
        switch (weatherType) {
            case 'rain':
                this.playSound('rain');
                break;
            case 'thunder':
                this.playSound('thunder');
                break;
            case 'wind':
                this.playSound('wind');
                break;
            default:
                // Stop weather sound
                break;
        }
    },
    
    // Play ambient sound
    playAmbientSound(type) {
        if (!this.soundEnabled) return;
        
        switch (type) {
            case 'forest':
                // Forest ambient sound
                this.playTone(220, 0.5, 'sine');
                setTimeout(() => this.playTone(261.63, 0.5, 'sine'), 100);
                setTimeout(() => this.playTone(329.63, 0.5, 'sine'), 200);
                break;
            case 'cave':
                // Cave ambient sound
                this.playNoise(0.5, 100);
                break;
            case 'city':
                // City ambient sound
                this.playTone(440, 0.2, 'sawtooth');
                setTimeout(() => this.playTone(550, 0.2, 'sawtooth'), 100);
                break;
        }
    },
    
    // Play combat sound based on class
    playAttackSound(classType) {
        switch (classType) {
            case 'warrior':
                this.playSound('sword');
                break;
            case 'mage':
                this.playSound('magic');
                break;
            case 'archer':
                this.playSound('bow');
                break;
            default:
                this.playSound('attack');
        }
    },
    
    // Play ability sound
    playAbilitySound(classType, ability) {
        switch (classType) {
            case 'warrior':
                switch (ability) {
                    case 'skill1': this.playSound('sword'); break;
                    case 'skill2': this.playTone(200, 0.3, 'sawtooth'); break;
                    case 'skill3': this.playTone(150, 0.5, 'sawtooth'); break;
                    default: this.playSound('attack');
                }
                break;
            case 'mage':
                switch (ability) {
                    case 'skill1': this.playSound('magic'); break;
                    case 'skill2': this.playTone(1000, 0.3, 'sine'); break;
                    case 'skill3': this.playTone(1500, 0.4, 'sine'); break;
                    default: this.playSound('magic');
                }
                break;
            case 'archer':
                switch (ability) {
                    case 'skill1': this.playSound('bow'); break;
                    case 'skill2': this.playTone(800, 0.2, 'sine'); break;
                    case 'skill3': this.playTone(1200, 0.3, 'sine'); break;
                    default: this.playSound('bow');
                }
                break;
        }
    },
    
    // Clean up
    cleanup() {
        this.stopBackgroundMusic();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}
