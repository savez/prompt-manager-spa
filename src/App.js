// App component principale
import promptStore from './store/promptStore.js';
import SearchBar from './components/SearchBar.js';
import PromptForm from './components/PromptForm.js';
import PromptList from './components/PromptList.js';
import Toast from './components/Toast.js';

const { onMounted, computed } = Vue;

export default {
    name: 'App',
    components: {
        SearchBar,
        PromptForm,
        PromptList,
        Toast
    },
    setup() {
        const { state, actions, computed: storeComputed } = promptStore;

        // Inizializza app al mount
        onMounted(async () => {
            await actions.init();
        });

        // Computed properties
        const currentViewTitle = computed(() => {
            switch (state.currentView) {
                case 'form':
                    return 'Nuovo Prompt';
                case 'edit':
                    return 'Modifica Prompt';
                default:
                    return 'I miei Prompt';
            }
        });

        const showBackButton = computed(() => {
            return state.currentView !== 'list';
        });

        // Methods
        const handleFileImport = (event) => {
            const file = event.target.files[0];
            if (file) {
                actions.importData(file);
                event.target.value = ''; // Reset input
            }
        };

        return {
            // State
            state,
            
            // Computed
            currentViewTitle,
            showBackButton,
            filteredPrompts: storeComputed.filteredPrompts,
            categories: storeComputed.categories,
            
            // Actions
            setView: actions.setView,
            exportData: actions.exportData,
            handleFileImport,
            
            // Methods per componenti figli
            searchPrompts: actions.searchPrompts,
            setCategory: actions.setCategory,
            resetFilters: actions.resetFilters,
            addPrompt: actions.addPrompt,
            updatePrompt: actions.updatePrompt,
            deletePrompt: actions.deletePrompt,
            startEdit: actions.startEdit,
            cancelEdit: actions.cancelEdit
        };
    },
    template: `
        <div id="app">
            <!-- Toast Notifications -->
            <Toast 
                :show="state.toast.show"
                :message="state.toast.message"
                :type="state.toast.type"
                @close="state.toast.show = false"
            />

            <!-- Navbar -->
            <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
                <div class="container-fluid app-container">
                    <a class="navbar-brand" href="#">
                        <i class="bi bi-file-text-fill me-2"></i>
                        Prompt Manager
                    </a>
                    
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <div class="navbar-nav ms-auto">
                            <button 
                                v-if="showBackButton"
                                @click="setView('list')"
                                class="btn btn-outline-secondary me-2"
                            >
                                <i class="bi bi-arrow-left"></i> Indietro
                            </button>
                            
                            <button 
                                v-if="state.currentView === 'list'"
                                @click="setView('form')"
                                class="btn btn-primary-custom me-2"
                            >
                                <i class="bi bi-plus-circle"></i> Nuovo Prompt
                            </button>
                            
                            <div class="dropdown">
                                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button @click="exportData" class="dropdown-item">
                                            <i class="bi bi-download me-2"></i>Esporta Backup
                                        </button>
                                    </li>
                                    <li>
                                        <label class="dropdown-item" style="cursor: pointer;">
                                            <i class="bi bi-upload me-2"></i>Importa Backup
                                            <input 
                                                type="file" 
                                                accept=".json"
                                                @change="handleFileImport"
                                                style="display: none;"
                                            >
                                        </label>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <span class="dropdown-item-text text-muted">
                                            <small>Totale prompt: {{ state.prompts.length }}</small>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Main Content -->
            <main class="app-container py-4">
                <!-- Header con titolo e search -->
                <div class="row mb-4" v-if="state.currentView === 'list'">
                    <div class="col-12">
                        <h1 class="h3 mb-4">{{ currentViewTitle }}</h1>
                        
                        <!-- Search Bar e Filtri -->
                        <SearchBar
                            :searchQuery="state.searchQuery"
                            :selectedCategory="state.selectedCategory"
                            :selectedTags="state.selectedTags"
                            :categories="categories"
                            :allTags="state.prompts.flatMap(p => p.tags || [])"
                            @search="searchPrompts"
                            @setCategory="setCategory"
                            @resetFilters="resetFilters"
                        />
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="state.loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Caricamento...</span>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="state.error" class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    {{ state.error }}
                </div>

                <!-- Content Views -->
                <div v-else>
                    <!-- List View -->
                    <div v-if="state.currentView === 'list'">
                        <!-- Stats Cards -->
                        <div class="row mb-4" v-if="state.prompts.length > 0">
                            <div class="col-md-3 col-6 mb-3">
                                <div class="stats-card">
                                    <div class="stats-number">{{ state.stats.totale }}</div>
                                    <div class="stats-label">Prompt Totali</div>
                                </div>
                            </div>
                            <div class="col-md-3 col-6 mb-3">
                                <div class="stats-card">
                                    <div class="stats-number">{{ Object.keys(state.stats.perCategoria).length }}</div>
                                    <div class="stats-label">Categorie</div>
                                </div>
                            </div>
                            <div class="col-md-3 col-6 mb-3">
                                <div class="stats-card">
                                    <div class="stats-number">{{ Object.keys(state.stats.tagPiuUsati).length }}</div>
                                    <div class="stats-label">Tags Unici</div>
                                </div>
                            </div>
                            <div class="col-md-3 col-6 mb-3">
                                <div class="stats-card">
                                    <div class="stats-number">{{ filteredPrompts.length }}</div>
                                    <div class="stats-label">Risultati</div>
                                </div>
                            </div>
                        </div>

                        <!-- Prompt List -->
                        <PromptList
                            :prompts="filteredPrompts"
                            @edit="startEdit"
                            @delete="deletePrompt"
                        />
                    </div>

                    <!-- Form View (Nuovo Prompt) -->
                    <div v-else-if="state.currentView === 'form'">
                        <div class="row justify-content-center">
                            <div class="col-lg-8">
                                <div class="card">
                                    <div class="card-body">
                                        <h2 class="card-title h4 mb-4">Aggiungi Nuovo Prompt</h2>
                                        <PromptForm
                                            :categories="categories"
                                            :existingTags="state.prompts.flatMap(p => p.tags || [])"
                                            @submit="addPrompt"
                                            @cancel="setView('list')"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Edit View -->
                    <div v-else-if="state.currentView === 'edit' && state.editingPrompt">
                        <div class="row justify-content-center">
                            <div class="col-lg-8">
                                <div class="card">
                                    <div class="card-body">
                                        <h2 class="card-title h4 mb-4">Modifica Prompt</h2>
                                        <PromptForm
                                            :prompt="state.editingPrompt"
                                            :categories="categories"
                                            :existingTags="state.prompts.flatMap(p => p.tags || [])"
                                            @submit="(data) => updatePrompt(state.editingPrompt.id, data)"
                                            @cancel="cancelEdit"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `
};
