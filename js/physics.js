/**
 * physics.js
 * Implementa el motor de físicas de la simulación.
 */
class PhysicsEngine {
    constructor(state) {
        this.state = state;
        // Escala: 1 metro en la simulación = 100 píxeles
        this.scale = 100;
        
        // Variables de temporización
        this.lastTime = 0;
        this.maxDelta = 0.05; // Máximo paso de tiempo (50ms) en la simulación para evitar saltos locos (spiraling out of control)
    }

    /**
     * Integrador numérico
     * @param {number} t - Timestamp actual dado por requestAnimationFrame
     */
    update(t) {
        if (!this.state.isPlaying || this.state.isDragging) {
            this.lastTime = t;
            return;
        }

        // Si es el primer frame, no hacemos simulación, solo seteamos el tiempo
        if (this.lastTime === 0) {
            this.lastTime = t;
            return;
        }

        // Tiempo transcurrido en segundos
        let dt = (t - this.lastTime) / 1000;
        
        // Limitamos dt en caso de lag o cambio de pestaña
        if (dt > this.maxDelta) dt = this.maxDelta;
        
        // --- MÉTODO EULER-CROMER ---
        // 1. Calcular aceleración en función de posición y velocidad ACUTAL
        // F_resorte = -k * x
        // F_amortiguamiento = -b * v
        // a = (F_resorte + F_amortiguamiento) / m
        
        const forceSpring = -this.state.k * this.state.x;
        const forceDamping = -this.state.damping * this.state.v;
        const forceTotal = forceSpring + forceDamping;
        
        this.state.a = forceTotal / this.state.mass;
        
        // 2. Actualizar VELOCIDAD con la aceleración ACTUAL
        this.state.v += this.state.a * dt;
        
        // 3. Actualizar POSICIÓN con la velocidad NUEVA (Euler-Cromer)
        this.state.x += this.state.v * dt;
        
        // 4. Actualizar tiempo
        this.state.time += dt;

        // Limpiar pequeños errores de punto flotante si la energía es casi nula
        if (Math.abs(this.state.x) < 0.001 && Math.abs(this.state.v) < 0.001 && forceTotal < 0.001) {
            if(this.state.damping > 0) {
              this.state.x = 0;
              this.state.v = 0;
              this.state.a = 0;
            }
        }

        // Registrar y actualizar energías
        this.state.updateEnergies();
        
        // Registramos un punto a un rate manejable por el chart
        // (Asumimos que dt es aprox 0.016 para 60fps)
        // Guardamos historial cada frame para el chart contínuo.
        this.state.recordHistory();
        
        this.lastTime = t;
    }

    /**
     * Lanza la simulación (Reset timer)
     */
    play() {
        this.lastTime = performance.now();
        this.state.isPlaying = true;
    }

    pause() {
        this.state.isPlaying = false;
    }

    reset() {
        this.pause();
        this.lastTime = 0;
        this.state.reset();
    }
}
