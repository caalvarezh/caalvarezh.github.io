/**
 * main.js
 * Punto de entrada de la aplicación.
 */

// Inicialización de módulos e instancia de estado general
const state = new SimulationState();
const i18n = new I18nManager();
const physics = new PhysicsEngine(state);
const renderer = new Renderer(state, physics);
const inputManager = new InputManager(state, renderer, physics);
const audioManager = new AudioManager();

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializar Internacionalización
    const langSelector = document.getElementById('lang-selector');
    await i18n.loadLanguage(langSelector.value);

    // Listener para cambio de idioma
    langSelector.addEventListener('change', async (e) => {
        audioManager.init();
        audioManager.playClick();
        await i18n.loadLanguage(e.target.value);
        updateAllDynamicLabels(); // Refrescar textos compuestos (sliders)
    });

    // 2. Elementos del DOM base
    const massSlider = document.getElementById('mass-slider');
    const springSlider = document.getElementById('spring-slider');
    const dampingSlider = document.getElementById('damping-slider');
    const toggleVectors = document.getElementById('toggle-vectors');
    
    // UI Panels values display
    const valOmega = document.getElementById('val-omega');
    const valPeriod = document.getElementById('val-period');

    // 3. Sistema de Temas (Claro/Oscuro)
    const btnTheme = document.getElementById('btn-theme');
    const themeIconDark = document.getElementById('theme-icon-dark');
    const themeIconLight = document.getElementById('theme-icon-light');
    const root = document.documentElement;

    const updateThemeUI = (isDark) => {
        // En modo oscuro (isDark=true) se muestra el sol para volver al claro
        // En modo claro (isDark=false) se muestra la luna para ir al oscuro
        themeIconDark.style.display = isDark ? 'none' : 'block';
        themeIconLight.style.display = isDark ? 'block' : 'none';
        renderer.updateThemeColors();
    };

    // Inicializar UI de tema (Asumimos light-theme por defecto por el HTML)
    updateThemeUI(root.classList.contains('dark-theme'));

    btnTheme.addEventListener('click', () => {
        audioManager.init();
        audioManager.playClick();
        if (root.classList.contains('dark-theme')) {
            root.classList.remove('dark-theme');
            root.classList.add('light-theme');
            updateThemeUI(false);
        } else if (root.classList.contains('light-theme')) {
            root.classList.remove('light-theme');
            root.classList.add('dark-theme');
            updateThemeUI(true);
        } else {
            // Default based on system preference if no class is set
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                root.classList.add('light-theme');
                updateThemeUI(false);
            } else {
                root.classList.add('dark-theme');
                updateThemeUI(true);
            }
        }
    });

    // 4. Modales
    const modal = document.getElementById('help-modal');
    const btnHelp = document.getElementById('btn-help');
    const btnCloseModal = document.getElementById('btn-close-modal');

    btnHelp.addEventListener('click', () => {
        audioManager.init();
        audioManager.playClick();
        modal.removeAttribute('hidden');
        btnCloseModal.focus(); // Accesibilidad
    });

    const closeModal = () => {
        audioManager.playClick();
        modal.setAttribute('hidden', '');
    };
    btnCloseModal.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(); // Click outside
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
    });

    // 4. Actualización desde Sliders a Estado
    const updateStateFromUI = () => {
        state.updateParameters(
            massSlider.value,
            springSlider.value,
            dampingSlider.value
        );
        state.showVectors = toggleVectors.checked;
        
        // Actualizar UI - Labels compuestos y Ecuaciones
        updateAllDynamicLabels();
        valOmega.textContent = state.omega.toFixed(2);
        valPeriod.textContent = state.period.toFixed(2);
    };

    const updateAllDynamicLabels = () => {
        i18n.updateDynamicLabel('label-mass', massSlider.value);
        i18n.updateDynamicLabel('label-spring', springSlider.value);
        i18n.updateDynamicLabel('label-damping', dampingSlider.value);
    };

    // Attach listeners a controles
    massSlider.addEventListener('input', () => { audioManager.init(); updateStateFromUI(); });
    springSlider.addEventListener('input', () => { audioManager.init(); updateStateFromUI(); });
    dampingSlider.addEventListener('input', () => { audioManager.init(); updateStateFromUI(); });
    toggleVectors.addEventListener('change', () => {
        audioManager.init();
        audioManager.playToggle();
        state.showVectors = toggleVectors.checked;
    });

    // Call inicial
    updateStateFromUI();
    
    // Iniciar el Render loop
    renderer.start();
    
    // Play y Reset
    const btnPlay = document.getElementById('btn-play');
    const btnReset = document.getElementById('btn-reset');

    const updatePlayButtonUI = () => {
        if(state.isPlaying) {
            btnPlay.innerHTML = i18n.dictionary ? i18n.dictionary['btn_pause'] : '⏸ Pausar';
            btnPlay.classList.replace('btn-primary', 'btn-secondary');
        } else {
            btnPlay.innerHTML = i18n.dictionary ? i18n.dictionary['btn_play'] : '▶︎ Iniciar';
            btnPlay.classList.replace('btn-secondary', 'btn-primary');
        }
    };

    btnPlay.addEventListener('click', () => {
        audioManager.init();
        audioManager.playClick();
        if (state.isPlaying) {
            physics.pause();
        } else {
            physics.play();
        }
        updatePlayButtonUI();
    });

    btnReset.addEventListener('click', () => {
        audioManager.init();
        audioManager.playClick();
        physics.reset();
        updatePlayButtonUI();
        
        // Restore current sliders params after reset
        updateStateFromUI(); 
    });
    // Intercepción de Eventos de Drag para Audio
    const originalDown = inputManager.onPointerDown.bind(inputManager);
    inputManager.onPointerDown = (e) => {
        audioManager.init();
        const wasDragging = state.isDragging;
        originalDown(e);
        if(!wasDragging && state.isDragging) {
            audioManager.playDragStart();
        }
    };

    const originalUp = inputManager.onPointerUp.bind(inputManager);
    inputManager.onPointerUp = () => {
        const wasDragging = state.isDragging;
        originalUp();
        if(wasDragging && !state.isDragging) {
            audioManager.playRelease();
        }
    };
});
