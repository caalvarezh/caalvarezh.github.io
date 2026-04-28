/**
 * render.js
 * Encargado de pintar el canvas y los mini-gráficos.
 */
class Renderer {
    constructor(state, physics) {
        this.state = state;
        this.physics = physics;
        
        this.canvas = document.getElementById('sim-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Referencia a Gráficos Simples con Canvas Nativo (No Chart.js) para cumplir 'zero frameworks'
        this.ctxPos = document.getElementById('chart-pos').getContext('2d');
        this.ctxVel = document.getElementById('chart-vel').getContext('2d');
        this.ctxEgy = document.getElementById('chart-energy').getContext('2d');
        
        // Parámetros Visuales
        this.originX = 100; // x-pixel de la pared (izquierda)
        this.originY = this.canvas.height / 2; // y-pixel del centro vertical
        this.equilibriumXPixels = 400; // Donde x = 0 (centro)
        
        // Dimensiones bloque masa
        this.massSize = 50; 
        
        // Colores y utilidades extraídas del CSS var root (simulado)
        this.colors = {
            mass: '#3f51b5',
            spring: '#9e9e9e',
            grid: '#e0e0e0',
            equilibrium: '#4caf50',
            f: '#f44336',
            v: '#2196f3',
            a: '#9c27b0',
            text: '#212121',
            bg: '#f5f5f6'
        };

        // ResizeObserver para Responsividad del Canvas
        this.resizeObserver = new ResizeObserver(entries => {
            const container = entries[0].contentRect;
            this.canvas.width = container.width;
            // Reposicionar el equilibrio visualmente
            this.equilibriumXPixels = this.canvas.width / 2;
        });
        this.resizeObserver.observe(this.canvas.parentElement);
        
        // Configurar RAF
        this.animationFrameId = null;

        // Cargar colores iniciales desde CSS
        this.updateThemeColors();
    }

    updateThemeColors() {
        const style = getComputedStyle(document.documentElement);
        this.colors.bg = style.getPropertyValue('--md-background').trim() || '#f5f5f6';
        this.colors.text = style.getPropertyValue('--md-on-surface').trim() || '#212121';
        this.colors.grid = style.getPropertyValue('--md-outline').trim() || '#e0e0e0';
        this.colors.spring = style.getPropertyValue('--color-spring').trim() || '#9e9e9e';
    }

    /**
     * Traduce una coordenada x de la física (metros) a px del canvas.
     */
    xToPx(xMetros) {
        return this.equilibriumXPixels + (xMetros * this.physics.scale);
    }
    
    /**
     * Traduce una coordenada x del canvas a la física (metros).
     */
    pxToX(xPixels) {
        return (xPixels - this.equilibriumXPixels) / this.physics.scale;
    }

    start() {
        if (!this.animationFrameId) {
            this.loop(performance.now());
        }
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    loop(timestamp) {
        // 1. Update Física
        this.physics.update(timestamp);
        
        // 2. Renderizar Simulación
        this.drawSim();
        
        // 3. Renderizar Gráficos (A una frecuencia reducida si es muy demandante, pero el DOM está simple)
        if (this.state.isPlaying || this.state.isDragging) {
            this.drawCharts();
        } else if (this.state.time === 0) { // Un redibujado de gráfico inicial
            this.drawCharts();
        }
        
        // Loop
        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
    }

    drawSim() {
        const { ctx, canvas, state } = this;
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Coordenadas actuales
        const massXpx = this.xToPx(state.x);
        
        // Dibujar Suelo (Mesa)
        ctx.beginPath();
        ctx.moveTo(0, this.originY + this.massSize / 2);
        ctx.lineTo(canvas.width, this.originY + this.massSize / 2);
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Pared Izquierda
        ctx.beginPath();
        ctx.moveTo(this.originX, this.originY - 50);
        ctx.lineTo(this.originX, this.originY + this.massSize / 2 + 10);
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 10;
        ctx.stroke();
        
        // Linea de Equilibrio
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(this.equilibriumXPixels, this.originY - 60);
        ctx.lineTo(this.equilibriumXPixels, this.originY + this.massSize / 2 + 10);
        ctx.strokeStyle = this.colors.equilibrium;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Texto de Equilibrio
        ctx.fillStyle = this.colors.equilibrium;
        ctx.font = '14px Arial';
        ctx.fillText('x = 0 m', this.equilibriumXPixels - 25, this.originY - 70);

        // Dibujar Resorte (Zig Zag)
        this.drawSpring(ctx, this.originX, this.originY, massXpx, this.originY);

        // Dibujar Masa
        this.drawMass(ctx, massXpx, this.originY, this.massSize);

        // Si la simulación está rodando y se piden vectores:
        if (state.showVectors) {
            this.drawVectors(ctx, massXpx, this.originY, state);
        }
        
        // Mostrar variables en text plano (arriba izq)
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 16px "Roboto", sans-serif';
        ctx.fillText(`x: ${state.x.toFixed(2)} m`, 15, 30);
        ctx.fillText(`v: ${state.v.toFixed(2)} m/s`, 15, 55);
        ctx.fillText(`t: ${state.time.toFixed(2)} s`, 15, 80);
    }

    drawSpring(ctx, startX, startY, endX, endY) {
        ctx.beginPath();
        ctx.strokeStyle = this.colors.spring;
        ctx.lineWidth = 3;
        
        const coils = 15;
        const coilWidth = (endX - startX) / coils;
        const radius = 20;

        ctx.moveTo(startX, startY);
        for (let i = 0; i < coils; i++) {
            const cx = startX + coilWidth * i;
            const dir = (i % 2 === 0) ? 1 : -1;
            ctx.lineTo(cx + coilWidth / 2, startY + (radius * dir));
            ctx.lineTo(cx + coilWidth, startY);
        }
        ctx.stroke();
    }

    drawMass(ctx, x, y, size) {
        ctx.fillStyle = this.colors.mass;
        // Un cuadrado simple visualmente claro
        // Las x, y es el centro de masa.
        const px = x - size / 2;
        const py = y - size / 2;
        
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(px, py, size, size, 5) : ctx.rect(px, py, size, size);
        ctx.fill();
        ctx.strokeStyle = '#283593';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Etiqueta 'm'
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`${this.state.mass.toFixed(1)}kg`, x - 20, y + 6);
    }

    drawVectors(ctx, px, py, state) {
        // Reducimos las magnitudes drásticas para q quepan en pantalla
        const scaleF = 20;
        const scaleV = 40;
        const scaleA = 20;

        const force = -(state.k * state.x) - (state.damping * state.v);
        const acceleration = force / state.mass;

        this.drawArrow(ctx, px, py - 30, px + force * scaleF, py - 30, this.colors.f, `F: ${force.toFixed(2)} N`);
        // Velocidad no se dibuja si estamos en drag, pq al arrastrar v es 0 (o manual).
        if (!state.isDragging) {
           this.drawArrow(ctx, px, py + 35, px + state.v * scaleV, py + 35, this.colors.v, `v: ${state.v.toFixed(2)} m/s`);
           this.drawArrow(ctx, px, py + 55, px + state.a * scaleA, py + 55, this.colors.a, `a: ${state.a.toFixed(2)} m/s²`);
        }
    }

    drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
        const headlen = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const dist = Math.hypot(toX - fromX, toY - fromY);
        
        if (dist < 2) return; // No dibujar flechas minúsculas
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = '14px Arial';
        // Ajustar texto
        ctx.fillText(label, toX + (fromX < toX ? 5 : -15), toY - 5);
    }

    // -- RENDERING BÁSICO DE CARTA PARA LA ENERGÍA Y POSICIÓN (Zero Deps) --
    drawCharts() {
        this.plotHistory(this.ctxPos, this.state.positionHistory, this.colors.f, 'Posición (x) [m]', this.state.x);
        this.plotHistory(this.ctxVel, this.state.velocityHistory, this.colors.v, 'Velocidad (v) [m/s]', this.state.v);
        this.plotEnergy(this.ctxEgy);
    }

    plotHistory(ctx, history, color, title, currentValue) {
        const c = ctx.canvas;
        ctx.clearRect(0, 0, c.width, c.height);
        
        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, c.width, c.height);

        // Márgenes para ejes
        const marginL = 40;
        const marginB = 25;
        const marginT = 25;
        const marginR = 10;
        const w = c.width - marginL - marginR;
        const h = c.height - marginT - marginB;

        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 14px Arial';
        const displayTitle = currentValue !== undefined ? `${title}: ${currentValue.toFixed(2)}` : title;
        ctx.fillText(displayTitle, 5, 20);
        
        if (history.length < 2) {
            // Dibujar ejes vacíos
            ctx.strokeStyle = this.colors.grid;
            ctx.beginPath();
            ctx.moveTo(marginL, marginT);
            ctx.lineTo(marginL, c.height - marginB);
            ctx.lineTo(c.width - marginR, c.height - marginB);
            ctx.stroke();
            return;
        }

        // Auto-scaling logic
        let minY = Infinity;
        let maxY = -Infinity;
        history.forEach(pt => {
            if (pt.y < minY) minY = pt.y;
            if (pt.y > maxY) maxY = pt.y;
        });

        // Add 10% padding
        const diff = maxY - minY;
        const padding = diff === 0 ? 1 : diff * 0.1;
        minY -= padding;
        maxY += padding;
        const range = maxY - minY;

        // Dibujar Ejes
        ctx.strokeStyle = this.colors.text;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(marginL, marginT);
        ctx.lineTo(marginL, c.height - marginB); // Eje Y
        ctx.lineTo(c.width - marginR, c.height - marginB); // Eje X
        ctx.stroke();

        // Etiquetas Y
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(maxY.toFixed(1), marginL - 5, marginT + 5);
        ctx.fillText(minY.toFixed(1), marginL - 5, c.height - marginB);
        ctx.textAlign = 'left';

        // Linea Centro (0) si está dento del rango
        if (minY < 0 && maxY > 0) {
            const normZero = (0 - minY) / range;
            const zeroY = (c.height - marginB) - (normZero * h);
            ctx.beginPath();
            ctx.setLineDash([2, 2]);
            ctx.moveTo(marginL, zeroY);
            ctx.lineTo(c.width - marginR, zeroY);
            ctx.strokeStyle = this.colors.grid;
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Dibujar Datos
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        history.forEach((point, i) => {
            const px = marginL + (i / this.state.historyLength) * w;
            const normY = (point.y - minY) / range;
            const py = (c.height - marginB) - (normY * h);
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        
        ctx.stroke();
    }

    plotEnergy(ctx) {
        const c = ctx.canvas;
        const hist = this.state.energyHistory;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, c.width, c.height);

        const marginL = 40;
        const marginB = 25;
        const marginT = 25;
        const marginR = 10;
        const w = c.width - marginL - marginR;
        const h = c.height - marginT - marginB;

        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Energías [J]: ${this.state.totalEnergy.toFixed(2)}`, 5, 20);

        if (hist.total.length < 2) {
            ctx.strokeStyle = this.colors.grid;
            ctx.beginPath();
            ctx.moveTo(marginL, marginT);
            ctx.lineTo(marginL, c.height - marginB);
            ctx.lineTo(c.width - marginR, c.height - marginB);
            ctx.stroke();
            return;
        }

        // Determinar max Y para la gráfica
        let maxE = 0.1;
        for (let pt of hist.total) { if(pt.y > maxE) maxE = pt.y; }
        maxE *= 1.2; // 20% margen

        // Ejes
        ctx.strokeStyle = this.colors.text;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(marginL, marginT);
        ctx.lineTo(marginL, c.height - marginB);
        ctx.lineTo(c.width - marginR, c.height - marginB);
        ctx.stroke();

        // Etiquetas Y
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(maxE.toFixed(1), marginL - 5, marginT + 5);
        ctx.fillText('0.0', marginL - 5, c.height - marginB);
        ctx.textAlign = 'left';

        const drawLine = (data, color) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            data.forEach((point, i) => {
                const px = marginL + (i / this.state.historyLength) * w;
                const py = (c.height - marginB) - ((point.y / maxE) * h);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            });
            ctx.stroke();
        };

        drawLine(hist.kinetic, this.colors.v);
        drawLine(hist.potential, this.colors.f);
        drawLine(hist.total, this.colors.equilibrium);

        // Leyenda
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = this.colors.v; ctx.fillText('K', c.width-45, 20);
        ctx.fillStyle = this.colors.f; ctx.fillText('U', c.width-30, 20);
        ctx.fillStyle = this.colors.equilibrium; ctx.fillText('T', c.width-15, 20);
    }
}
