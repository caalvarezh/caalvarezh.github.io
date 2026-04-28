/**
 * audio.js
 * Sistema de Audio 100% Offline via Web Audio API.
 */
class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }

    /**
     * Inicializa el AudioContext. 
     * Debe ser llamado post-interacción del usuario (políticas del navegador).
     */
    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API no soportada en este entorno.', e);
            this.enabled = false;
        }
    }

    playTone(frequency, type = 'sine', duration = 0.1, vol = 0.1) {
        if (!this.enabled || !this.ctx) return;
        
        // Resume si estaba suspendido (autoplay policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        // Envolvente de volumen muy simple para evitar "clics" de audio
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // --- Sonidos Específicos de la UI ---
    
    playClick() {
        // Tono corto y "limpio" para botones
        this.playTone(600, 'sine', 0.1, 0.1);
    }

    playToggle() {
        // Tono un poco mas agudo
        this.playTone(800, 'triangle', 0.1, 0.05);
    }

    playDragStart() {
        // Tono grave para dar peso al agarrar la masa
        this.playTone(200, 'square', 0.15, 0.05);
    }
    
    playRelease() {
        // Tono medio descendente simulado con un beep corto
        this.playTone(400, 'sine', 0.1, 0.05);
    }
}
