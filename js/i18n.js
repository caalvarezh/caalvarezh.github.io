/**
 * i18n.js
 * Módulo para la Internacionalización. Utiliza datos de i18n_data.js.
 */

class I18nManager {
    constructor() {
        this.currentLang = 'es';
        this.dictionary = null;
        this.elementsToTranslate = [
            { id: 'app-title', key: 'app_title' },
            { id: 'sim-title', key: 'sim_title' },
            { id: 'controls-title', key: 'controls_title' },
            { id: 'btn-play', key: 'btn_play', isHTML: true },
            { id: 'btn-reset', key: 'btn_reset', isHTML: true },
            { id: 'label-vectors', key: 'toggle_vectors' },
            { id: 'modal-title', key: 'modal_title' },
            { id: 'modal-body-content', key: 'modal_body', isHTML: true }
        ];

        // Mapeo especial para los labels dinámicos
        this.dynamicLabels = {
            'label-mass': { key: 'mass', valId: 'val-mass' },
            'label-spring': { key: 'spring', valId: 'val-spring' },
            'label-damping': { key: 'damping', valId: 'val-damping' }
        };
    }

    /**
     * Carga el idioma desde el objeto global window.HOOKE_LOCALES
     */
    async loadLanguage(lang) {
        if (window.HOOKE_LOCALES && window.HOOKE_LOCALES[lang]) {
            this.dictionary = window.HOOKE_LOCALES[lang];
            this.currentLang = lang;
            this.applyTranslations();
        } else {
            console.error('Idioma no encontrado en HOOKE_LOCALES:', lang);
        }
    }

    /**
     * Aplica el diccionario actual al DOM
     */
    applyTranslations() {
        if (!this.dictionary) return;

        // Elementos estáticos
        this.elementsToTranslate.forEach(({ id, key, isHTML }) => {
            const el = document.getElementById(id);
            if (el && this.dictionary[key]) {
                if (isHTML) {
                    el.innerHTML = this.dictionary[key];
                } else {
                    el.textContent = this.dictionary[key];
                }
            }
        });

        // Actualizar opciones del select (traducción a sí mismo)
        const langSelect = document.getElementById('lang-selector');
        if (langSelect) {
            Array.from(langSelect.options).forEach(opt => {
                const dictKey = `lang_${opt.value}`;
                if (this.dictionary[dictKey]) {
                    opt.textContent = this.dictionary[dictKey];
                }
            });
        }
    }

    /**
     * Los labels de los sliders contienen el valor envuelto en un span. 
     * Este método reconstruye el string insertando el span dinámico para no perder la referencia.
     */
    updateDynamicLabel(labelId, currentValue) {
        const el = document.getElementById(labelId);
        if (!el || !this.dictionary) return;

        const maps = this.dynamicLabels[labelId];
        if (!maps || !this.dictionary[maps.key]) return;

        // El JSON tiene algo como "Masa (m): {val} kg"
        const templateStr = this.dictionary[maps.key];
        
        // Reemplazamos {val} por el SPAN conteniendo el valor. 
        // Generamos innerHTML porque incrustamos el <span id="...">...</span>
        const spanHtml = `<span id="${maps.valId}">${currentValue}</span>`;
        el.innerHTML = templateStr.replace('{val}', spanHtml);
    }
}
