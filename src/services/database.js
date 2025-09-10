// Database service per gestire IndexedDB con fallback su localStorage

const DB_NAME = 'PromptManagerDB';
const DB_VERSION = 1;
const STORE_NAME = 'prompts';

class DatabaseService {
    constructor() {
        this.db = null;
        this.isIndexedDBSupported = 'indexedDB' in window;
    }

    // Inizializza il database
    async init() {
        if (this.isIndexedDBSupported) {
            return this.initIndexedDB();
        } else {
            console.warn('IndexedDB non supportato, utilizzo localStorage');
            return this.initLocalStorage();
        }
    }

    // Inizializza IndexedDB
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crea object store se non esiste
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Crea indici per ricerca efficiente
                    objectStore.createIndex('categoria', 'categoria', { unique: false });
                    objectStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                    objectStore.createIndex('dataCreazione', 'dataCreazione', { unique: false });
                    objectStore.createIndex('tipologia', 'tipologia', { unique: false });
                }
            };
        });
    }

    // Fallback: inizializza localStorage
    initLocalStorage() {
        const prompts = localStorage.getItem('prompts');
        if (!prompts) {
            localStorage.setItem('prompts', JSON.stringify([]));
        }
        return Promise.resolve();
    }

    // CREATE - Aggiunge un nuovo prompt
    async addPrompt(prompt) {
        // Aggiungi timestamp se non presente
        if (!prompt.dataCreazione) {
            prompt.dataCreazione = new Date().toISOString();
        }
        
        // Normalizza tags come array
        if (typeof prompt.tags === 'string') {
            prompt.tags = prompt.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        if (this.isIndexedDBSupported && this.db) {
            return this.addPromptIndexedDB(prompt);
        } else {
            return this.addPromptLocalStorage(prompt);
        }
    }

    addPromptIndexedDB(prompt) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.add(prompt);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    addPromptLocalStorage(prompt) {
        const prompts = JSON.parse(localStorage.getItem('prompts') || '[]');
        prompt.id = Date.now(); // Simula auto-increment
        prompts.push(prompt);
        localStorage.setItem('prompts', JSON.stringify(prompts));
        return Promise.resolve(prompt.id);
    }

    // READ - Ottieni tutti i prompt
    async getAllPrompts() {
        if (this.isIndexedDBSupported && this.db) {
            return this.getAllPromptsIndexedDB();
        } else {
            return this.getAllPromptsLocalStorage();
        }
    }

    getAllPromptsIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                const prompts = request.result.sort((a, b) => 
                    new Date(b.dataCreazione) - new Date(a.dataCreazione)
                );
                resolve(prompts);
            };
            request.onerror = () => reject(request.error);
        });
    }

    getAllPromptsLocalStorage() {
        const prompts = JSON.parse(localStorage.getItem('prompts') || '[]');
        return Promise.resolve(prompts.sort((a, b) => 
            new Date(b.dataCreazione) - new Date(a.dataCreazione)
        ));
    }

    // READ - Ottieni prompt per ID
    async getPromptById(id) {
        if (this.isIndexedDBSupported && this.db) {
            return this.getPromptByIdIndexedDB(id);
        } else {
            return this.getPromptByIdLocalStorage(id);
        }
    }

    getPromptByIdIndexedDB(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    getPromptByIdLocalStorage(id) {
        const prompts = JSON.parse(localStorage.getItem('prompts') || '[]');
        const prompt = prompts.find(p => p.id === id);
        return Promise.resolve(prompt);
    }

    // UPDATE - Aggiorna un prompt esistente
    async updatePrompt(id, updatedPrompt) {
        updatedPrompt.id = id;
        updatedPrompt.dataModifica = new Date().toISOString();
        
        // Normalizza tags come array
        if (typeof updatedPrompt.tags === 'string') {
            updatedPrompt.tags = updatedPrompt.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        if (this.isIndexedDBSupported && this.db) {
            return this.updatePromptIndexedDB(updatedPrompt);
        } else {
            return this.updatePromptLocalStorage(id, updatedPrompt);
        }
    }

    updatePromptIndexedDB(updatedPrompt) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.put(updatedPrompt);

            request.onsuccess = () => resolve(updatedPrompt);
            request.onerror = () => reject(request.error);
        });
    }

    updatePromptLocalStorage(id, updatedPrompt) {
        const prompts = JSON.parse(localStorage.getItem('prompts') || '[]');
        const index = prompts.findIndex(p => p.id === id);
        if (index !== -1) {
            prompts[index] = updatedPrompt;
            localStorage.setItem('prompts', JSON.stringify(prompts));
        }
        return Promise.resolve(updatedPrompt);
    }

    // DELETE - Elimina un prompt
    async deletePrompt(id) {
        if (this.isIndexedDBSupported && this.db) {
            return this.deletePromptIndexedDB(id);
        } else {
            return this.deletePromptLocalStorage(id);
        }
    }

    deletePromptIndexedDB(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    deletePromptLocalStorage(id) {
        const prompts = JSON.parse(localStorage.getItem('prompts') || '[]');
        const filtered = prompts.filter(p => p.id !== id);
        localStorage.setItem('prompts', JSON.stringify(filtered));
        return Promise.resolve();
    }

    // SEARCH - Cerca prompt per testo
    async searchPrompts(query) {
        const allPrompts = await this.getAllPrompts();
        
        if (!query || query.trim() === '') {
            return allPrompts;
        }

        const searchTerm = query.toLowerCase().trim();
        
        return allPrompts.filter(prompt => {
            // Cerca in tutti i campi testuali
            const searchableText = [
                prompt.testo || '',
                prompt.categoria || '',
                prompt.tipologia || '',
                prompt.note || '',
                (prompt.tags || []).join(' ')
            ].join(' ').toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
    }

    // Filtra per categoria
    async getPromptsByCategory(categoria) {
        const allPrompts = await this.getAllPrompts();
        return allPrompts.filter(p => p.categoria === categoria);
    }

    // Filtra per tag
    async getPromptsByTag(tag) {
        const allPrompts = await this.getAllPrompts();
        return allPrompts.filter(p => p.tags && p.tags.includes(tag));
    }

    // Export dei dati
    async exportData() {
        const prompts = await this.getAllPrompts();
        return JSON.stringify(prompts, null, 2);
    }

    // Import dei dati
    async importData(jsonData) {
        try {
            const prompts = JSON.parse(jsonData);
            
            if (!Array.isArray(prompts)) {
                throw new Error('Il formato dei dati non è valido');
            }

            // Elimina tutti i prompt esistenti
            const existingPrompts = await this.getAllPrompts();
            for (const prompt of existingPrompts) {
                await this.deletePrompt(prompt.id);
            }

            // Importa i nuovi prompt
            for (const prompt of prompts) {
                delete prompt.id; // Rimuovi ID per permettere auto-increment
                await this.addPrompt(prompt);
            }

            return { success: true, count: prompts.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Statistiche
    async getStats() {
        const prompts = await this.getAllPrompts();
        
        const stats = {
            totale: prompts.length,
            perCategoria: {},
            tagPiuUsati: {},
            perTipologia: {}
        };

        prompts.forEach(prompt => {
            // Conta per categoria
            if (prompt.categoria) {
                stats.perCategoria[prompt.categoria] = (stats.perCategoria[prompt.categoria] || 0) + 1;
            }

            // Conta tags
            if (prompt.tags && Array.isArray(prompt.tags)) {
                prompt.tags.forEach(tag => {
                    stats.tagPiuUsati[tag] = (stats.tagPiuUsati[tag] || 0) + 1;
                });
            }

            // Conta per tipologia
            if (prompt.tipologia) {
                stats.perTipologia[prompt.tipologia] = (stats.perTipologia[prompt.tipologia] || 0) + 1;
            }
        });

        // Ordina tags per frequenza
        stats.tagPiuUsati = Object.entries(stats.tagPiuUsati)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

        return stats;
    }
}

// Esporta singleton
const dbService = new DatabaseService();
export default dbService;
