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
    "modal_title": "Manual del Sistema Masa-Resorte",
    "modal_body": "<div class='help-card' style='grid-column: 1 / 3;'><h3>1. Fenómeno Físico</h3><p>La <strong>Ley de Hooke</strong> establece que la fuerza restauradora que ejerce un resorte es directamente proporcional a su deformación, siempre y cuando no se supere su límite elástico. Al perturbar el sistema de su posición de equilibrio, se genera un <strong>Movimiento Armónico Simple (MAS)</strong>, el cual puede verse afectado por fuerzas no conservativas como el amortiguamiento.</p><div class='math-box'>$$F_s = -kx \\quad \\text{y} \\quad \\omega = \\sqrt{\\frac{k}{m}}$$</div></div><div class='help-card'><h3>2. Uso del Simulador</h3><ul style='padding-left: 20px; margin-top: 10px;'><li style='margin-bottom: 8px;'><strong>Interacción Directa:</strong> Haz clic y arrastra la masa con el ratón o la pantalla táctil para estirar o comprimir el resorte y definir la amplitud inicial.</li><li style='margin-bottom: 8px;'><strong>Parámetros Físicos:</strong> Utiliza los deslizadores para modificar la <em>Masa ($m$)</em>, la <em>Constante del Resorte ($k$)</em> y el <em>Amortiguamiento ($b$)</em>.</li><li><strong>Controles:</strong> Usa los botones <strong>PLAY</strong> y <strong>RESET</strong> para iniciar, pausar o reiniciar la simulación. Puedes activar o desactivar los vectores de fuerza y velocidad.</li></ul></div><div class='help-card'><h3>3. Análisis de Resultados</h3><ul style='padding-left: 20px; margin-top: 10px;'><li style='margin-bottom: 8px;'><strong>Gráficos en Tiempo Real:</strong> Observa la evolución temporal de la posición y la velocidad. Nota el desfase entre ambas ondas.</li><li style='margin-bottom: 8px;'><strong>Energía:</strong> Analiza cómo se transfiere la energía potencial elástica a cinética y viceversa. En ausencia de amortiguamiento, la energía mecánica total se conserva.</li><li><strong>Precisión:</strong> El simulador emplea el integrador de <em>Euler-Cromer</em>, que garantiza una excelente conservación de la energía a largo plazo para sistemas oscilatorios.</li></ul></div>"
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
    "modal_title": "Mass-Spring System Manual",
    "modal_body": "<div class='help-card' style='grid-column: 1 / 3;'><h3>1. Physical Phenomenon</h3><p><strong>Hooke's Law</strong> states that the restoring force exerted by a spring is directly proportional to its deformation, as long as its elastic limit is not exceeded. By disturbing the system from its equilibrium position, a <strong>Simple Harmonic Motion (SHM)</strong> is generated, which can be affected by non-conservative forces such as damping.</p><div class='math-box'>$$F_s = -kx \\quad \\text{and} \\quad \\omega = \\sqrt{\\frac{k}{m}}$$</div></div><div class='help-card'><h3>2. Using the Simulator</h3><ul style='padding-left: 20px; margin-top: 10px;'><li style='margin-bottom: 8px;'><strong>Direct Interaction:</strong> Click and drag the mass with the mouse or touch screen to stretch or compress the spring and set the initial amplitude.</li><li style='margin-bottom: 8px;'><strong>Physical Parameters:</strong> Use the sliders to modify the <em>Mass ($m$)</em>, the <em>Spring Constant ($k$)</em>, and the <em>Damping ($b$)</em>.</li><li><strong>Controls:</strong> Use the <strong>PLAY</strong> and <strong>RESET</strong> buttons to start, pause, or reset the simulation. You can toggle the force and velocity vectors.</li></ul></div><div class='help-card'><h3>3. Analysis of Results</h3><ul style='padding-left: 20px; margin-top: 10px;'><li style='margin-bottom: 8px;'><strong>Real-Time Charts:</strong> Observe the time evolution of position and velocity. Note the phase difference between both waves.</li><li style='margin-bottom: 8px;'><strong>Energy:</strong> Analyze how elastic potential energy is transferred to kinetic energy and vice versa. Without damping, total mechanical energy is conserved.</li><li><strong>Precision:</strong> The simulator uses the <em>Euler-Cromer</em> integrator, which guarantees excellent long-term energy conservation for oscillatory systems.</li></ul></div>"
  },
  "pt": {
    "app_title": "Simulação: Lei de Hooke e MHS",
    "lang_es": "Español",
    "lang_en": "English",
    "lang_pt": "Português",
    "sim_title": "Área do Canvas de Simulação",
    "controls_title": "Controles",
    "mass": "Massa (m): {val} kg",
    "spring": "Constante da Mola (k): {val} N/m",
    "damping": "Amortecimento (b): {val} kg/s",
    "btn_play": "▶︎ Iniciar",
    "btn_pause": "⏸ Pausar",
    "btn_reset": "↻ Reiniciar",
    "toggle_vectors": "Mostrar Vetores (F, v, a)",
    "modal_title": "Manual do Sistema Massa-Mola",
    "modal_body": "<div class='help-card' style='grid-column: 1 / 3;'><h3>1. Fenômeno Físico</h3><p>A <strong>Lei de Hooke</strong> estabelece que a força restauradora exercida por uma mola é diretamente proporcional à sua deformação, desde que o limite elástico não seja ultrapassado. Ao perturbar o sistema de sua posição de equilíbrio, gera-se um <strong>Movimento Harmônico Simples (MHS)</strong>, que pode ser afetado por forças não conservativas, como o amortecimento.</p><div class='math-box'>$$F_s = -kx \\quad \\text{e} \\quad \\omega = \\sqrt{\\frac{k}{m}}$$</div></div><div class='help-card'><h3>2. Uso do Simulador</h3><ul style='padding-left: 20px; margin-top: 10px;'><li style='margin-bottom: 8px;'><strong>Interação Direta:</strong> Clique e arraste a massa com o mouse ou tela sensível ao toque para esticar ou comprimir a mola e definir a amplitude inicial.</li><li style='margin-bottom: 8px;'><strong>Parâmetros Físicos:</strong> Use os controles deslizantes para modificar a <em>Massa ($m$)</em>, a <em>Constante da Mola ($k$)</em> e o <em>Amortecimento ($b$)</em>.</li><li><strong>Controles:</strong> Use os botões <strong>PLAY</strong> e <strong>RESET</strong> para iniciar, pausar ou reiniciar a simulação. Você pode ativar ou desativar os vetores de força e velocidade.</li></ul></div><div class='help-card'><h3>3. Análise de Resultados</h3><ul style='padding-left: 20px; margin-top: 10px;'><li style='margin-bottom: 8px;'><strong>Gráficos em Tempo Real:</strong> Observe a evolução temporal da posição e da velocidade. Note a diferença de fase entre as duas ondas.</li><li style='margin-bottom: 8px;'><strong>Energia:</strong> Analise como a energia potencial elástica é transferida para energia cinética e vice-versa. Na ausência de amortecimento, a energia mecânica total é conservada.</li><li><strong>Precisão:</strong> O simulador emprega o integrador <em>Euler-Cromer</em>, que garante uma excelente conservação de energia a longo prazo para sistemas oscilatórios.</li></ul></div>"
  }
};
