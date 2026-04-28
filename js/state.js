/**
 * state.js
 * Mantiene el estado global de la simulación del sistema masa-resorte.
 */
class SimulationState {
    constructor() {
        // Parámetros Físicos Configutables
        this.mass = 1.0;          // m (kg)
        this.k = 10.0;            // Constante del resorte (N/m)
        this.damping = 0.0;       // Amortiguamiento b (kg/s)
        
        // Variables de Estado Dinámico (Física)
        this.x = 0;               // Posición respecto al equilibrio (m)
        this.v = 0;               // Velocidad (m/s)
        this.a = 0;               // Aceleración (m/s^2)
        this.time = 0;            // Tiempo de simulación (s)
        
        // Energías
        this.kineticEnergy = 0;   // Joules
        this.potentialEnergy = 0; // Joules
        this.totalEnergy = 0;     // Joules
        
        // Valores Derivados Analíticos (Para UI)
        this.omega = Math.sqrt(this.k / this.mass);
        this.period = 2 * Math.PI / this.omega;

        // Propiedades de la Simulación y Motor de Render
        this.isPlaying = false;
        this.isDragging = false;
        this.showVectors = true;
        
        // Historial de datos (Para los gráficos, últimos N puntos)
        this.historyLength = 200;
        this.positionHistory = [];
        this.velocityHistory = [];
        this.energyHistory = {
            kinetic: [],
            potential: [],
            total: []
        };
    }

    /**
     * Actualiza los parámetros configurables y recalcula las propiedades derivadas
     */
    updateParameters(mass, k, damping) {
        if (mass) this.mass = parseFloat(mass);
        if (k) this.k = parseFloat(k);
        if (damping !== undefined) this.damping = parseFloat(damping);
        
        // Recalcular frecuencia angular y periodo
        this.omega = Math.sqrt(this.k / this.mass);
        this.period = (this.omega > 0) ? (2 * Math.PI / this.omega) : 0;
    }

    /**
     * Devuelve el estado a las condiciones iniciales exactas (guardando constantes)
     */
    reset() {
        this.x = 0;
        this.v = 0;
        this.a = 0;
        this.time = 0;
        
        this.positionHistory = [];
        this.velocityHistory = [];
        this.energyHistory = { kinetic: [], potential: [], total: [] };
        
        this.updateEnergies();
    }

    /**
     * Guarda el punto de estado actual en los historiales para graficar
     */
    recordHistory() {
        this.positionHistory.push({ t: this.time, y: this.x });
        this.velocityHistory.push({ t: this.time, y: this.v });
        
        this.energyHistory.kinetic.push({ t: this.time, y: this.kineticEnergy });
        this.energyHistory.potential.push({ t: this.time, y: this.potentialEnergy });
        this.energyHistory.total.push({ t: this.time, y: this.totalEnergy });

        // Mantener tamaño del buffer
        if (this.positionHistory.length > this.historyLength) {
            this.positionHistory.shift();
            this.velocityHistory.shift();
            this.energyHistory.kinetic.shift();
            this.energyHistory.potential.shift();
            this.energyHistory.total.shift();
        }
    }

    /**
     * Calcula y actualiza las energías actuales basadas en x, y v
     */
    updateEnergies() {
        this.kineticEnergy = 0.5 * this.mass * this.v * this.v;
        this.potentialEnergy = 0.5 * this.k * this.x * this.x;
        this.totalEnergy = this.kineticEnergy + this.potentialEnergy;
    }
}
