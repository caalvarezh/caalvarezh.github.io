const AppController = (function() {
    let canvas, ctx;
    let bgCanvas, bgCtx;
    let isRunning = false;
    let animId;
    let trail = [];
    let playedEasterEgg = false;

    function playClick() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); 
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.05);
        } catch(e) {}
    }

    function init() {
        canvas = document.getElementById('simulation-canvas');
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        
        loadPhysicsParams();
        bindUI();
        updateI18n();
        render();

        if(window.katex) {
            let eq = "\\begin{aligned}" +
                     "\\vec{F} &= G \\frac{m_1 m_2}{r^2} \\hat{r} \\\\[10pt]" +
                     "\\vec{a}_{\\text{nave}} &= - \\frac{G M_E}{|\\vec{r}_{E}|^3} \\vec{r}_{E} - \\frac{G M_L}{|\\vec{r}_{L}|^3} \\vec{r}_{L}" +
                     "\\end{aligned}";
            katex.render(eq, document.getElementById('math-container'), { displayMode: true });
            
            let eq_rk4 = "y_{n+1} = y_n + \\frac{\\Delta t}{6} (k_1 + 2k_2 + 2k_3 + k_4)";
            let el_rk4 = document.getElementById('math-rk4');
            if(el_rk4) katex.render(eq_rk4, el_rk4, { displayMode: true });
        }
    }

    function resize() {
        const wrapper = document.querySelector('.canvas-wrapper');
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
        
        // Cachear las estrellas de fondo para rendimiento masivo
        if(!bgCanvas) {
            bgCanvas = document.createElement('canvas');
            bgCtx = bgCanvas.getContext('2d');
        }
        bgCanvas.width = canvas.width;
        bgCanvas.height = canvas.height;
        
        bgCtx.fillStyle = "#0f172a";
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        for(let i=0; i<150; i++) {
            let sx = (Math.sin(i*999)*10000) % bgCanvas.width;
            let sy = (Math.cos(i*999)*10000) % bgCanvas.height;
            if (sx < 0) sx += bgCanvas.width;
            if (sy < 0) sy += bgCanvas.height;
            bgCtx.beginPath();
            bgCtx.arc(sx, sy, (i%3)*0.5 + 0.3, 0, 2*Math.PI);
            bgCtx.filter = "blur(1px)";
            if(i%5===0) { bgCtx.fillStyle = "rgba(100,200,255,0.8)"; } else { bgCtx.fillStyle = "rgba(255,255,255,0.6)"; }
            bgCtx.fill();
            bgCtx.filter = "none";
        }
    }
    
    function loadPhysicsParams() {
        let vel = parseFloat(document.getElementById('vel-slider').value) || 10.95;
        let angle = parseFloat(document.getElementById('country-select').value) || 60;
        let perigee = parseFloat(document.getElementById('perigee-slider').value) || 200;
        let offset_deg = parseFloat(document.getElementById('angle-slider').value) || 110.0;
        
        let dateStr = document.getElementById('datetime-input').value;
        let dateObj = new Date(dateStr);
        let baseDate = new Date("2026-04-01T22:35");
        let dt_ms = (dateObj.getTime() || baseDate.getTime()) - baseDate.getTime();
        
        // Convertir MS reales a Unidades de Tiempo de Simulación
        // 27.3 días = 918.5 unidades sim.
        const msToSimTime = 918.5 / (27.3 * 24 * 3600 * 1000);
        let t_offset = dt_ms * msToSimTime;

        PhysicsEngine.reset(vel, angle, perigee, offset_deg, t_offset);
    }

    function bindUI() {
        document.getElementById('btn-start').addEventListener('click', () => {
            playClick();
            if(!isRunning) {
                loadPhysicsParams();
                trail = [];
                playedEasterEgg = false;
                isRunning = true;
                document.getElementById('lbl-mission-status').innerText = LanguageStore.getText("missionStatus").replace("Pre-", "");
                loop();
            }
        });
        
        document.getElementById('btn-reset').addEventListener('click', () => {
            playClick();
            isRunning = false;
            cancelAnimationFrame(animId);
            loadPhysicsParams();
            trail = [];
            document.getElementById('lbl-mission-status').innerHTML = LanguageStore.getText("missionStatus");
            render();
        });

        const sliders = ['vel', 'perigee', 'angle'];
        sliders.forEach(s => {
            let el = document.getElementById(s + '-slider');
            let val = document.getElementById('val-' + s);
            el.addEventListener('input', (e) => {
                val.innerText = e.target.value;
                if(!isRunning) {
                    loadPhysicsParams();
                    render();
                }
            });
        });

        document.getElementById('country-select').addEventListener('change', () => {
            if(!isRunning) { loadPhysicsParams(); render(); }
        });

        document.getElementById('datetime-input').addEventListener('change', () => {
            if(!isRunning) { loadPhysicsParams(); render(); }
        });


        document.getElementById('btn-help-icon').addEventListener('click', () => {
            playClick();
            document.getElementById('help-modal').style.display = 'flex';
        });

        document.getElementById('modal-close').addEventListener('click', () => {
            playClick();
            document.getElementById('help-modal').style.display = 'none';
        });

        document.getElementById('lang-select').addEventListener('change', (e) => {
            LanguageStore.setLanguage(e.target.value);
            updateI18n();
            render(); 
        });
    }

    function updateI18n() {
        document.getElementById('header-title').innerHTML = LanguageStore.getText('simTitle');
        document.getElementById('lbl-success-traj').innerText = LanguageStore.getText('successTraj');
        document.getElementById('lbl-free-return').innerText = LanguageStore.getText('freeReturn');
        document.getElementById('lbl-mission-status').innerText = LanguageStore.getText('missionStatus');
        
        document.getElementById('lbl-launch-params').innerText = LanguageStore.getText('launchParams');
        document.getElementById('lbl-launch-date').innerText = LanguageStore.getText('launchDate');
        document.getElementById('lbl-launch-vel').innerText = LanguageStore.getText('launchVel');
        let locElem = document.getElementById('lbl-launch-location');
        if(locElem) locElem.innerText = LanguageStore.getText('launchLocation');
        document.getElementById('lbl-perigee').innerText = LanguageStore.getText('perigee');
        if(document.getElementById('lbl-injection-angle')) {
            document.getElementById('lbl-injection-angle').innerText = LanguageStore.getText('injectionAngle');
        }
        document.getElementById('btn-start').innerText = LanguageStore.getText('btnLaunch');
        document.getElementById('btn-reset').innerText = LanguageStore.getText('btnReset');
        
        document.getElementById('lbl-telemetry').innerText = LanguageStore.getText('telemetry');
        document.getElementById('lbl-moon-pos').innerText = LanguageStore.getText('moonPos');
        document.getElementById('lbl-success-check').innerText = LanguageStore.getText('successCheck');
        
        if(document.getElementById('lbl-hud-dist')) document.getElementById('lbl-hud-dist').innerText = LanguageStore.getText('hudDist');
        if(document.getElementById('lbl-hud-vel')) document.getElementById('lbl-hud-vel').innerText = LanguageStore.getText('hudVel');
        
        document.getElementById('modal-title-text').innerText = LanguageStore.getText('modalTitle');
        if(document.getElementById('help-sec-1')) {
            document.getElementById('help-sec-1').innerText = LanguageStore.getText('helpSec1');
            document.getElementById('help-text-1').innerHTML = LanguageStore.getText('helpText1');
            
            document.getElementById('help-sec-2').innerText = LanguageStore.getText('helpSec2');
            document.getElementById('help-cont-1').innerHTML = LanguageStore.getText('helpCont1');
            document.getElementById('help-cont-2').innerHTML = LanguageStore.getText('helpCont2');
            document.getElementById('help-cont-3').innerHTML = LanguageStore.getText('helpCont3');
            document.getElementById('help-cont-4').innerHTML = LanguageStore.getText('helpCont4');
            
            document.getElementById('help-sec-3').innerText = LanguageStore.getText('helpSec3');
            document.getElementById('help-text-3').innerHTML = LanguageStore.getText('helpText3');
            
            document.getElementById('help-sec-4').innerText = LanguageStore.getText('helpSec4');
            document.getElementById('help-rk4-1').innerHTML = LanguageStore.getText('helpRk4_1');
            document.getElementById('help-rk4-2').innerHTML = LanguageStore.getText('helpRk4_2');
        }
    }

    function drawGrid(cx, cy, scale) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        let step = 100 * scale;
        for(let x=cx%step; x<canvas.width; x+=step) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for(let y=cy%step; y<canvas.height; y+=step) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar el fondo cacheado (ahorra cientos de operaciones de CPU/GPU por frame)
        if(bgCanvas) {
            ctx.drawImage(bgCanvas, 0, 0);
        }

        let state = PhysicsEngine.getState();
        
        // HUD Updates (Real World Scale)
        // La distancia Tierra-Luna simulada es 600 unidades. Distancia real = ~384400 km.
        // Factor de escala = 384400 / 600 = 640.66 km por unidad.
        let distFromEarth = Math.sqrt(state.ship.x * state.ship.x + state.ship.y * state.ship.y);
        let dist_km = distFromEarth * (384400 / 600);
        let alt_km = dist_km - 6371; // Restar el radio real promedio de la Tierra
        if(alt_km < 0) alt_km = 0;
        
        let v_mag = Math.sqrt(state.ship.vx * state.ship.vx + state.ship.vy * state.ship.vy);
        // La velocidad en simulador está escalada por 1.463 respecto a km/s
        let vel_km_s = v_mag / 1.463; 
        
        const distEl = document.getElementById('hud-dist-val');
        const velEl = document.getElementById('hud-vel-val');
        if(distEl) distEl.innerText = alt_km.toLocaleString('en-US', {maximumFractionDigits: 0});
        if(velEl) velEl.innerText = vel_km_s.toFixed(2);

        let cx = canvas.width / 2; 
        let cy = canvas.height / 2;
        let scale = Math.min(canvas.width, canvas.height) / 1600;

        drawGrid(cx, cy, scale);

        if (isRunning) {
            trail.push({x: state.ship.x, y: state.ship.y});
            if(trail.length > 800) trail.shift();
        }
        
        if(trail.length > 0) {
            ctx.beginPath();
            for(let i=0; i<trail.length; i++) {
                let px = cx + trail[i].x * scale;
                let py = cy + trail[i].y * scale;
                if(i===0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = "rgba(96, 165, 250, 0.8)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        let ex = cx + state.earth.x * scale;
        let ey = cy + state.earth.y * scale;
        
        // Renderizado de la Tierra Más Claro y Especializado
        ctx.save();
        
        // Atmósfera externa (Glow)
        let glow = ctx.createRadialGradient(ex, ey, 60*scale, ex, ey, 70*scale);
        glow.addColorStop(0, "rgba(56, 189, 248, 0.4)");
        glow.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.beginPath();
        ctx.arc(ex, ey, 70 * scale, 0, 2*Math.PI);
        ctx.fillStyle = glow;
        ctx.fill();

        // Máscara del globo terrestre para que el océano y continentes no sobresalgan
        ctx.beginPath();
        ctx.arc(ex, ey, 60 * scale, 0, 2*Math.PI);
        ctx.clip();
        
        // Océano Base
        ctx.fillStyle = "#1e40af"; // Azul más profundo y nítido
        ctx.fill();

        // Trazado de masas continentales simplificadas (ESTÁTICAS PARA MAYOR RENDIMIENTO)
        ctx.translate(ex, ey);
        // Se quitó la rotación dependiente de state.time
        
        ctx.fillStyle = "#22c55e"; // Verde vibrante
        ctx.beginPath();
        // Generar continente principal 1 (América aprox)
        ctx.ellipse(-20*scale, -10*scale, 25*scale, 40*scale, 0.3, 0, 2*Math.PI);
        // Generar continente principal 2 (Eurasia aprox)
        ctx.ellipse(35*scale, -5*scale, 30*scale, 25*scale, -0.4, 0, 2*Math.PI);
        // África aprox
        ctx.ellipse(30*scale, 20*scale, 18*scale, 25*scale, -0.1, 0, 2*Math.PI);
        ctx.fill();
        
        ctx.translate(-ex, -ey);

        // Sombras esféricas para dar volumen 3D (iluminación solar estática asumiendo sol a la izquierda)
        let shadowGrad = ctx.createRadialGradient(ex-15*scale, ey-15*scale, 10*scale, ex, ey, 60*scale);
        shadowGrad.addColorStop(0.3, "rgba(255,255,255,0.1)");
        shadowGrad.addColorStop(0.8, "rgba(0,0,0,0.5)");
        shadowGrad.addColorStop(1, "rgba(0,0,0,0.9)");
        
        ctx.beginPath();
        ctx.arc(ex, ey, 60 * scale, 0, 2*Math.PI);
        ctx.fillStyle = shadowGrad;
        ctx.fill();
        
        ctx.restore();

        let mx = cx + state.moon.x * scale;
        let my = cy + state.moon.y * scale;
        ctx.beginPath();
        ctx.arc(mx, my, 20 * scale, 0, 2*Math.PI);
        let moonGrad = ctx.createRadialGradient(mx-5*scale, my-5*scale, 5*scale, mx, my, 20*scale);
        moonGrad.addColorStop(0, "#f8fafc");
        moonGrad.addColorStop(1, "#475569");
        ctx.fillStyle = moonGrad;
        ctx.fill();

        let sx = cx + state.ship.x * scale;
        let sy = cy + state.ship.y * scale;
        
        // Orion Capsule Sprite
        ctx.save();
        ctx.translate(sx, sy);
        // orient towards velocity
        if(state.ship.vx !== 0 || state.ship.vy !== 0) {
            ctx.rotate(Math.atan2(state.ship.vy, state.ship.vx));
        }
        
        ctx.beginPath(); // Service module
        ctx.rect(-10 * scale, -4 * scale, 8 * scale, 8 * scale);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
        
        ctx.beginPath(); // Solar panels
        ctx.rect(-8 * scale, -12 * scale, 4 * scale, 24 * scale);
        ctx.fillStyle = '#0284c7'; // blue
        ctx.fill();
        
        ctx.beginPath(); // Command module (cone)
        ctx.moveTo(8 * scale, 0);   
        ctx.lineTo(-2 * scale, -5 * scale);
        ctx.lineTo(-2 * scale, 5 * scale);
        ctx.closePath();
        ctx.fillStyle = '#cbd5e1';
        ctx.fill();
        
        ctx.restore();
        
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = Math.max(12, 14*scale) + "px 'Inter', sans-serif";
        ctx.fillText("Earth", ex - 20*scale, ey + 85*scale);
        ctx.fillText("Moon", mx - 20*scale, my + 40*scale);
        ctx.fillText("Artemis II", sx + 10, sy - 10);
    }

    function loop() {
        for(let i=0; i<15; i++) {
            PhysicsEngine.step();
        }
        
        let state = PhysicsEngine.getState();
        let distFromEarth = Math.sqrt(state.ship.x * state.ship.x + state.ship.y * state.ship.y);
        
        // Easter Egg: Escaping canvas bounds (dist > 1200, moon is at 600)
        if (distFromEarth > 1200 && !playedEasterEgg) {
            playedEasterEgg = true;
            try {
                let u = new SpeechSynthesisUtterance("¡Al infinito y más allá!");
                u.lang = "es-ES";
                u.pitch = 1.2;
                speechSynthesis.speak(u);
            } catch(e) {}
        }
        
        render();
        if(isRunning) {
            animId = requestAnimationFrame(loop);
        }
    }

    return { init: init };
})();

window.onload = AppController.init;
