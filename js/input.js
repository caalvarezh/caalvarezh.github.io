/**
 * input.js
 * Maneja los eventos de ratón/táctiles para el Canvas.
 */
class InputManager {
    constructor(state, renderer, physics) {
        this.state = state;
        this.renderer = renderer;
        this.physics = physics;
        this.canvas = this.renderer.canvas;

        this.isPointerDown = false;
        
        // Listeners
        this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e));
        
        // Window listeners for releasing outside
        window.addEventListener('mouseup', () => this.onPointerUp());
        
        // Touch support (mobile/tablets)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onPointerDown(touch);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onPointerMove(touch);
        }, { passive: false });

        window.addEventListener('touchend', () => this.onPointerUp());
    }

    /**
     * Obtiene coordenada local de X en el canvas
     */
    getMousePos(evt) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    onPointerDown(e) {
        const pos = this.getMousePos(e);
        
        // Comprobar si hicimos click EN LA MASA
        // renderer.xToPx nos da el x central. Size es renderer.massSize
        const massPx = this.renderer.xToPx(this.state.x);
        const massPy = this.renderer.originY; // El centro Y de la masa es el el mismo eje horizontal
        const halfS = this.renderer.massSize / 2;
        
        // Hitbox ampliado (+10px)
        if (pos.x >= massPx - halfS - 10 && pos.x <= massPx + halfS + 10 &&
            pos.y >= massPy - halfS - 10 && pos.y <= massPy + halfS + 10) {
            
            this.isPointerDown = true;
            this.state.isDragging = true;
            // Detenemos físicas al agarrar la caja para que no tire mientras la arrastramos
            this.state.v = 0; 
            this.state.a = 0;

            // Cambiar cursor
            this.canvas.style.cursor = 'grabbing';
            
            // Audio de Grab sería útil acá (Fase 5)
        }
    }

    onPointerMove(e) {
        // Efecto hover (cambio de cursor si pasamos por encima de la masa)
        if (!this.isPointerDown) {
             const pos = this.getMousePos(e);
             const massPx = this.renderer.xToPx(this.state.x);
             const massPy = this.renderer.originY;
             const halfS = this.renderer.massSize / 2;
             if (pos.x >= massPx - halfS && pos.x <= massPx + halfS &&
                 pos.y >= massPy - halfS && pos.y <= massPy + halfS) {
                 this.canvas.style.cursor = 'grab';
             } else {
                 this.canvas.style.cursor = 'default';
             }
             return;
        }

        // Si estamos arrastrando:
        const pos = this.getMousePos(e);
        
        // Traducimos el PX de x otra vez a m (metros)
        let newXMetros = this.renderer.pxToX(pos.x);
        
        // Limits del resorte (no cruzar la pared, limite -1 max x)
        if (newXMetros < -0.9) newXMetros = -0.9; 
        
        this.state.x = newXMetros;
        this.state.updateEnergies(); // Energias cambian visualmente (Potencial)
    }

    onPointerUp() {
        if (this.isPointerDown) {
            this.isPointerDown = false;
            this.state.isDragging = false;
            this.canvas.style.cursor = 'default';
            
            // Si el motor no está "Play", lo iniciamos automáticamente si saltamos el resorte (ux)
            if (!this.state.isPlaying) {
                // Evento sintético o directo para arrancar simulacion
                document.getElementById('btn-play').click();
            }
        }
    }
}
