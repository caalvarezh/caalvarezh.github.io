const PhysicsEngine = (function() {
    const G = 1;
    const MEarth = 10000;
    const MMoon = 123;
    const distEarthMoon = 600; 
    
    // Orbital mechanics constants for the Earth-Moon barycenter
    const omega = Math.sqrt(G * (MEarth + MMoon) / Math.pow(distEarthMoon, 3));
    const rEarth = distEarthMoon * (MMoon / (MEarth + MMoon));
    const rMoon = distEarthMoon * (MEarth / (MEarth + MMoon));

    let state = {
        time: 0,
        ship: { x: 80, y: 0, vx: 0, vy: 14.5 },
        moon: { x: distEarthMoon, y: 0 },
        earth: { x: 0, y: 0 }
    };

    let dt = 0.05;

    // Calcular posiciones de la Tierra y la Luna analíticamente (Rotación alrededor del baricentro)
    // Se establece el Baricentro en (rEarth, 0) para que la Tierra comience en (0,0) en t=0.
    function getBodyPositions(t) {
        return {
            earth: {
                x: rEarth - rEarth * Math.cos(omega * t),
                y: -rEarth * Math.sin(omega * t)
            },
            moon: {
                x: rEarth + rMoon * Math.cos(omega * t),
                y: rMoon * Math.sin(omega * t)
            }
        };
    }

    function getDerivatives(t, ship) {
        let bodies = getBodyPositions(t);
        
        let rE_x = ship.x - bodies.earth.x;
        let rE_y = ship.y - bodies.earth.y;
        let distE = Math.sqrt(rE_x*rE_x + rE_y*rE_y);
        if(distE < 20) distE = 20; // Límite para prevenir aceleraciones infinitas

        let rL_x = ship.x - bodies.moon.x;
        let rL_y = ship.y - bodies.moon.y;
        let distL = Math.sqrt(rL_x*rL_x + rL_y*rL_y);
        if(distL < 5) distL = 5;

        let ax = - (G * MEarth / Math.pow(distE, 3)) * rE_x - (G * MMoon / Math.pow(distL, 3)) * rL_x;
        let ay = - (G * MEarth / Math.pow(distE, 3)) * rE_y - (G * MMoon / Math.pow(distL, 3)) * rL_y;

        return {
            dx: ship.vx, 
            dy: ship.vy, 
            dvx: ax, 
            dvy: ay
        };
    }

    function stepRK4() {
        let bodies = getBodyPositions(state.time);
        
        let rE_x = state.ship.x - bodies.earth.x;
        let rE_y = state.ship.y - bodies.earth.y;
        let distEarth = Math.sqrt(rE_x*rE_x + rE_y*rE_y);

        // Detener nave si colisiona con la Tierra (amarizaje/choque)
        if(distEarth < 60 && state.time > 5) {
            // Para mantener a la nave sobre la tierra girando:
            // Igualamos la velocidad de la nave a la de la corteza de la Tierra girando o al propio centro.
            // Simplified: velocity zero relative to earth center
            let earth_vx = rEarth * omega * Math.sin(omega * state.time);
            let earth_vy = -rEarth * omega * Math.cos(omega * state.time);
            state.ship.vx = earth_vx;
            state.ship.vy = earth_vy;
        } else {
            let k1 = getDerivatives(state.time, state.ship);
            
            let ship2 = {
                x: state.ship.x + k1.dx * dt/2,
                y: state.ship.y + k1.dy * dt/2,
                vx: state.ship.vx + k1.dvx * dt/2,
                vy: state.ship.vy + k1.dvy * dt/2
            };
            let k2 = getDerivatives(state.time + dt/2, ship2);
            
            let ship3 = {
                x: state.ship.x + k2.dx * dt/2,
                y: state.ship.y + k2.dy * dt/2,
                vx: state.ship.vx + k2.dvx * dt/2,
                vy: state.ship.vy + k2.dvy * dt/2
            };
            let k3 = getDerivatives(state.time + dt/2, ship3);
            
            let ship4 = {
                x: state.ship.x + k3.dx * dt,
                y: state.ship.y + k3.dy * dt,
                vx: state.ship.vx + k3.dvx * dt,
                vy: state.ship.vy + k3.dvy * dt
            };
            let k4 = getDerivatives(state.time + dt, ship4);

            state.ship.x += (dt/6) * (k1.dx + 2*k2.dx + 2*k3.dx + k4.dx);
            state.ship.y += (dt/6) * (k1.dy + 2*k2.dy + 2*k3.dy + k4.dy);
            state.ship.vx += (dt/6) * (k1.dvx + 2*k2.dvx + 2*k3.dvx + k4.dvx);
            state.ship.vy += (dt/6) * (k1.dvy + 2*k2.dvy + 2*k3.dvy + k4.dvy);
        }

        state.time += dt;
        
        // Actualizar visual de la Tierra y la Luna
        let finalBodies = getBodyPositions(state.time);
        state.earth = finalBodies.earth;
        state.moon = finalBodies.moon;
    }

    return {
        step: function() { stepRK4(); },
        getState: function() { return state; },
        reset: function(vel, angle, perigee, offset_deg, t_offset = 0) {
            state.time = t_offset;
            let bodies = getBodyPositions(state.time);
            state.earth = bodies.earth;
            state.moon = bodies.moon;

            let r = 60 + (perigee / 20); 
            // 10.95 km/s requiere alcanzar la Luna a distancia 600.
            // Para llegar al radio 620 en el CR3BP 2D Engine, V_sim debe ser ~16.02.
            // Entonces 16.02 / 10.95 = 1.463.
            let v_sim = vel * 1.463; 
            
            // Fases lunares idóneas
            let moonLaunchRad = Math.atan2(bodies.moon.y, bodies.moon.x); 
            
            // Cálculo del encuentro en Apogeo:
            let rad = moonLaunchRad - (offset_deg * Math.PI / 180);
            
            // Posición inicial de la nave relativa a la Tierra
            state.ship.x = state.earth.x + r * Math.cos(rad);
            state.ship.y = state.earth.y + r * Math.sin(rad);
            
            // Velocidad de la Tierra
            let earth_vx = rEarth * omega * Math.sin(omega * state.time);
            let earth_vy = -rEarth * omega * Math.cos(omega * state.time);

            // Inyección translunar perfecta: el vector de velocidad va tangencial a la posición orbital de inyección.
            state.ship.vx = earth_vx - v_sim * Math.sin(rad);
            state.ship.vy = earth_vy + v_sim * Math.cos(rad);
        },
        setDt: function(newDt) { dt = parseFloat(newDt); }
    };
})();
