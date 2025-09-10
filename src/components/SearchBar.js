// Componente SearchBar con omnibox per ricerca

import promptStore from '../store/promptStore.js';

const { ref, computed, watch } = Vue;

export default {
    name: 'SearchBar',
    props: {
        searchQuery: {
            type: String,
            default: ''
        },
        selectedCategory: {
            type: String,
            default: ''
        },
        selectedTags: {
            type: Array,
            default: () => []
        },
        categories: {
            type: Array,
            required: true
        },
        allTags: {
            type: Array,
            default: () => []
        }
    },
    emits: ['search', 'setCategory', 'resetFilters'],
    setup(props, { emit }) {
        // Local state
        const localSearchQuery = ref(props.searchQuery);
        const showFilters = ref(false);
        let searchTimeout = null;

        // Computed
        const hasActiveFilters = computed(() => {
            return props.searchQuery || 
                   props.selectedCategory || 
                   props.selectedTags.length > 0;
        });

        const uniqueTags = computed(() => {
            return [...new Set(props.allTags)].sort();
        });

        // Methods
        const handleSearchInput = (event) => {
            const value = event.target.value;
            localSearchQuery.value = value;
            
            // Debounce search
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                emit('search', value);
            }, 300);
        };

        const clearSearch = () => {
            localSearchQuery.value = '';
            emit('search', '');
        };

        const setCategory = (category) => {
            emit('setCategory', category === props.selectedCategory ? '' : category);
        };

        const toggleTag = (tag) => {
            // Gestito nel parent component attraverso lo store
            const store = promptStore;
            store.actions.toggleTag(tag);
        };

        const resetAllFilters = () => {
            localSearchQuery.value = '';
            emit('resetFilters');
        };

        const toggleFilters = () => {
            showFilters.value = !showFilters.value;
        };

        // Watch for external changes to searchQuery
        watch(() => props.searchQuery, (newValue) => {
            if (newValue !== localSearchQuery.value) {
                localSearchQuery.value = newValue;
            }
        });

        return {
            localSearchQuery,
            showFilters,
            hasActiveFilters,
            uniqueTags,
            handleSearchInput,
            clearSearch,
            setCategory,
            toggleTag,
            resetAllFilters,
            toggleFilters
        };
    },
    template: `
        <div class="search-section mb-4">
            <!-- Omnibox Search -->
            <div class="search-container mb-3">
                <i class="bi bi-search search-icon"></i>
                <input
                    type="text"
                    :value="localSearchQuery"
                    @input="handleSearchInput"
                    class="form-control search-input"
                    placeholder="Cerca nei prompt, tag, note..."
                >
                <button
                    v-if="localSearchQuery"
                    @click="clearSearch"
                    class="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2 text-muted"
                    style="z-index: 10;"
                >
                    <i class="bi bi-x-circle"></i>
                </button>
            </div>

            <!-- Filter Toggle & Reset -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <button
                    @click="toggleFilters"
                    class="btn btn-sm btn-outline-secondary"
                >
                    <i class="bi bi-funnel me-1"></i>
                    Filtri 
                    <span v-if="hasActiveFilters" class="badge bg-primary ms-1">
                        {{ (selectedCategory ? 1 : 0) + selectedTags.length }}
                    </span>
                </button>
                
                <button
                    v-if="hasActiveFilters"
                    @click="resetAllFilters"
                    class="btn btn-sm btn-link text-danger"
                >
                    <i class="bi bi-x-circle me-1"></i>
                    Rimuovi filtri
                </button>
            </div>

            <!-- Filters Section -->
            <Transition name="slide">
                <div v-if="showFilters" class="filters-section border rounded p-3 bg-light">
                    <!-- Category Filter -->
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted mb-2">
                            <i class="bi bi-grid me-1"></i>Filtra per categoria
                        </label>
                        <div class="d-flex flex-wrap gap-2">
                            <button
                                v-for="category in categories"
                                :key="category"
                                @click="setCategory(category)"
                                class="btn btn-sm"
                                :class="selectedCategory === category ? 
                                    'btn-primary' : 
                                    'btn-outline-secondary'"
                            >
                                {{ category }}
                            </button>
                        </div>
                    </div>

                    <!-- Tags Filter -->
                    <div v-if="uniqueTags.length > 0">
                        <label class="form-label small fw-bold text-muted mb-2">
                            <i class="bi bi-tags me-1"></i>Filtra per tag
                        </label>
                        <div class="d-flex flex-wrap gap-2">
                            <span
                                v-for="tag in uniqueTags"
                                :key="tag"
                                @click="toggleTag(tag)"
                                class="tag-badge"
                                :class="{ 'active': selectedTags.includes(tag) }"
                                role="button"
                            >
                                {{ tag }}
                            </span>
                        </div>
                    </div>

                    <!-- Active Filters Summary -->
                    <div v-if="hasActiveFilters" class="mt-3 pt-3 border-top">
                        <small class="text-muted">
                            <strong>Filtri attivi:</strong>
                            <span v-if="searchQuery" class="ms-2">
                                Ricerca: "{{ searchQuery }}"
                            </span>
                            <span v-if="selectedCategory" class="ms-2">
                                | Categoria: {{ selectedCategory }}
                            </span>
                            <span v-if="selectedTags.length > 0" class="ms-2">
                                | Tags: {{ selectedTags.join(', ') }}
                            </span>
                        </small>
                    </div>
                </div>
            </Transition>
        </div>
    `
};
