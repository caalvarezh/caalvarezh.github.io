/**
 * i18n_data.js
 * Embebemos los datos de idioma para permitir que la simulación funcione
 * directamente desde el sistema de archivos (file://) sin errores de CORS.
 */

window.HOOKE_LOCALES = {
  "es": {
    "app_title": "Simulación: Ley de Hooke y MAS",
    "lang_es": "Español",
    "lang_en": "English",
    "lang_pt": "Português",
    "sim_title": "Área del Canvas de Simulación",
    "controls_title": "Controles",
    "mass": "Masa (m): {val} kg",
    "spring": "Constante del Resorte (k): {val} N/m",
    "damping": "Amortiguamiento (b): {val} kg/s",
    "btn_play": "▶︎ Iniciar",
    "btn_pause": "⏸ Pausar",
    "btn_reset": "↻ Reiniciar",
    "toggle_vectors": "Mostrar Vectores (F, v, a)",
    "modal_title": "Ayuda e Instrucciones",
    "modal_body": "<p>Bienvenido a la simulación del Sistema Masa-Resorte (Ley de Hooke).</p><ul><li><strong>Arrastrar:</strong> Usa el ratón o tacto para estirar o comprimir el resorte arrastrando la masa.</li><li><strong>Controles:</strong> Modifica la masa, constante de elasticidad y el amortiguamiento usando los deslizadores.</li><li><strong>Gráficos:</strong> Observa la evolución de la posición, velocidad y energías.</li></ul><p>Esta simulación utiliza el método de Euler-Cromer.</p>"
  },
  "en": {
    "app_title": "Simulation: Hooke's Law and SHM",
    "lang_es": "Español",
    "lang_en": "English",
    "lang_pt": "Português",
    "sim_title": "Simulation Canvas Area",
    "controls_title": "Controls",
    "mass": "Mass (m): {val} kg",
    "spring": "Spring Constant (k): {val} N/m",
    "damping": "Damping (b): {val} kg/s",
    "btn_play": "▶︎ Play",
    "btn_pause": "⏸ Pause",
    "btn_reset": "↻ Reset",
    "toggle_vectors": "Show Vectors (F, v, a)",
    "modal_title": "Help and Instructions",
    "modal_body": "<p>Welcome to the Mass-Spring System (Hooke's Law) simulation.</p><ul><li><strong>Drag:</strong> Use your mouse or touch to stretch or compress the spring by dragging the mass.</li><li><strong>Controls:</strong> Modify mass, spring constant, and damping using the sliders.</li><li><strong>Charts:</strong> Observe the evolution of position, velocity, and energies.</li></ul><p>This simulation uses the Euler-Cromer method.</p>"
  },
  "pt": {
    "app_title": "Simulação: Lei de Hooke e MHS",
    "lang_es": "Español",
    "lang_en": "English",
    "lang_pt": "Português",
    "sim_title": "Área do Canvas de Simulación",
    "controls_title": "Controles",
    "mass": "Massa (m): {val} kg",
    "spring": "Constante da Mola (k): {val} N/m",
    "damping": "Amortecimento (b): {val} kg/s",
    "btn_play": "▶︎ Iniciar",
    "btn_pause": "⏸ Pausar",
    "btn_reset": "↻ Reiniciar",
    "toggle_vectors": "Mostrar Vetores (F, v, a)",
    "modal_title": "Ajuda e Instruções",
    "modal_body": "<p>Bem-vindo à simulação do Sistema Masa-Mola (Lei de Hooke).</p><ul><li><strong>Arrastrar:</strong> Use o mouse ou o toque para esticar ou comprimir a mola arrastrando a massa.</li><li><strong>Controles:</strong> Modifique a massa, a constante elástica e o amortecimento usando os controles deslizantes.</li><li><strong>Gráficos:</strong> Observe a evolução da posição, velocidade e energias.</li></ul><p>Esta simulación utiliza o método de Euler-Cromer.</p>"
  }
};
