// Store reattivo per gestione stato prompt con Vue 3 Composition API
import dbService from '../services/database.js';

const { reactive, ref, computed } = Vue;

// Stato globale dell'applicazione
const state = reactive({
    prompts: [],
    loading: false,
    error: null,
    searchQuery: '',
    selectedCategory: '',
    selectedTags: [],
    editingPrompt: null,
    currentView: 'list', // 'list', 'form', 'edit'
    stats: {
        totale: 0,
        perCategoria: {},
        tagPiuUsati: {},
        perTipologia: {}
    },
    toast: {
        show: false,
        message: '',
        type: 'success' // 'success', 'error', 'info'
    }
});

// Categorie disponibili
const CATEGORIE = ['GPT', 'GEMINI', 'CLAUDE', 'PERPLEXITY', 'COPILOT'];

// Computed properties
const filteredPrompts = computed(() => {
    let result = state.prompts;

    // Filtra per query di ricerca
    if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        result = result.filter(prompt => {
            const searchableText = [
                prompt.testo || '',
                prompt.categoria || '',
                prompt.tipologia || '',
                prompt.note || '',
                (prompt.tags || []).join(' ')
            ].join(' ').toLowerCase();
            
            return searchableText.includes(query);
        });
    }

    // Filtra per categoria
    if (state.selectedCategory) {
        result = result.filter(p => p.categoria === state.selectedCategory);
    }

    // Filtra per tags selezionati
    if (state.selectedTags.length > 0) {
        result = result.filter(prompt => {
            if (!prompt.tags || !Array.isArray(prompt.tags)) return false;
            return state.selectedTags.some(tag => prompt.tags.includes(tag));
        });
    }

    return result;
});

// Ottieni tutti i tags unici
const allTags = computed(() => {
    const tags = new Set();
    state.prompts.forEach(prompt => {
        if (prompt.tags && Array.isArray(prompt.tags)) {
            prompt.tags.forEach(tag => tags.add(tag));
        }
    });
    return Array.from(tags).sort();
});

// Actions
const actions = {
    // Inizializza database e carica i dati
    async init() {
        state.loading = true;
        state.error = null;
        try {
            await dbService.init();
            await actions.loadPrompts();
            await actions.updateStats();
        } catch (error) {
            console.error('Errore inizializzazione:', error);
            state.error = 'Errore nell\'inizializzazione del database';
            actions.showToast('Errore nell\'inizializzazione del database', 'error');
        } finally {
            state.loading = false;
        }
    },

    // Carica tutti i prompt
    async loadPrompts() {
        state.loading = true;
        try {
            state.prompts = await dbService.getAllPrompts();
        } catch (error) {
            console.error('Errore caricamento prompt:', error);
            state.error = 'Errore nel caricamento dei prompt';
            actions.showToast('Errore nel caricamento dei prompt', 'error');
        } finally {
            state.loading = false;
        }
    },

    // Aggiungi nuovo prompt
    async addPrompt(promptData) {
        state.loading = true;
        state.error = null;
        try {
            const id = await dbService.addPrompt(promptData);
            await actions.loadPrompts();
            await actions.updateStats();
            actions.showToast('Prompt aggiunto con successo!', 'success');
            state.currentView = 'list';
            return id;
        } catch (error) {
            console.error('Errore aggiunta prompt:', error);
            state.error = 'Errore nell\'aggiunta del prompt';
            actions.showToast('Errore nell\'aggiunta del prompt', 'error');
            throw error;
        } finally {
            state.loading = false;
        }
    },

    // Aggiorna prompt esistente
    async updatePrompt(id, promptData) {
        state.loading = true;
        state.error = null;
        try {
            await dbService.updatePrompt(id, promptData);
            await actions.loadPrompts();
            await actions.updateStats();
            actions.showToast('Prompt aggiornato con successo!', 'success');
            state.currentView = 'list';
            state.editingPrompt = null;
        } catch (error) {
            console.error('Errore aggiornamento prompt:', error);
            state.error = 'Errore nell\'aggiornamento del prompt';
            actions.showToast('Errore nell\'aggiornamento del prompt', 'error');
            throw error;
        } finally {
            state.loading = false;
        }
    },

    // Elimina prompt
    async deletePrompt(id) {
        if (!confirm('Sei sicuro di voler eliminare questo prompt?')) {
            return;
        }

        state.loading = true;
        state.error = null;
        try {
            await dbService.deletePrompt(id);
            await actions.loadPrompts();
            await actions.updateStats();
            actions.showToast('Prompt eliminato con successo!', 'success');
        } catch (error) {
            console.error('Errore eliminazione prompt:', error);
            state.error = 'Errore nell\'eliminazione del prompt';
            actions.showToast('Errore nell\'eliminazione del prompt', 'error');
        } finally {
            state.loading = false;
        }
    },

    // Cerca prompt
    async searchPrompts(query) {
        state.searchQuery = query;
    },

    // Imposta filtro categoria
    setCategory(category) {
        state.selectedCategory = category;
    },

    // Toggle tag nei filtri
    toggleTag(tag) {
        const index = state.selectedTags.indexOf(tag);
        if (index > -1) {
            state.selectedTags.splice(index, 1);
        } else {
            state.selectedTags.push(tag);
        }
    },

    // Reset filtri
    resetFilters() {
        state.searchQuery = '';
        state.selectedCategory = '';
        state.selectedTags = [];
    },

    // Cambia vista corrente
    setView(view) {
        state.currentView = view;
        if (view !== 'edit') {
            state.editingPrompt = null;
        }
    },

    // Inizia modifica prompt
    startEdit(prompt) {
        state.editingPrompt = { ...prompt };
        state.currentView = 'edit';
    },

    // Annulla modifica
    cancelEdit() {
        state.editingPrompt = null;
        state.currentView = 'list';
    },

    // Aggiorna statistiche
    async updateStats() {
        try {
            state.stats = await dbService.getStats();
        } catch (error) {
            console.error('Errore aggiornamento statistiche:', error);
        }
    },

    // Esporta dati
    async exportData() {
        try {
            const jsonData = await dbService.exportData();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prompt-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            actions.showToast('Backup esportato con successo!', 'success');
        } catch (error) {
            console.error('Errore export:', error);
            actions.showToast('Errore nell\'esportazione dei dati', 'error');
        }
    },

    // Importa dati
    async importData(file) {
        try {
            const text = await file.text();
            const result = await dbService.importData(text);
            
            if (result.success) {
                await actions.loadPrompts();
                await actions.updateStats();
                actions.showToast(`Importati ${result.count} prompt con successo!`, 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Errore import:', error);
            actions.showToast('Errore nell\'importazione dei dati: ' + error.message, 'error');
        }
    },

    // Mostra toast notification
    showToast(message, type = 'success') {
        state.toast.message = message;
        state.toast.type = type;
        state.toast.show = true;
        
        // Auto-nascondi dopo 3 secondi
        setTimeout(() => {
            state.toast.show = false;
        }, 3000);
    },

    // Nascondi toast
    hideToast() {
        state.toast.show = false;
    }
};

// Store oggetto da esportare
const promptStore = {
    state,
    actions,
    computed: {
        filteredPrompts,
        allTags,
        categories: CATEGORIE
    }
};

export default promptStore;
