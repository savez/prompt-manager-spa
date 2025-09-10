// Componente PromptList per visualizzare i prompt

import clipboardService from '../services/clipboard.js';
import promptStore from '../store/promptStore.js';

const { ref, computed } = Vue;

export default {
    name: 'PromptList',
    props: {
        prompts: {
            type: Array,
            required: true
        }
    },
    emits: ['edit', 'delete'],
    setup(props, { emit }) {
        // State
        const copiedPromptId = ref(null);
        const expandedPrompts = ref(new Set());

        // Computed
        const isEmpty = computed(() => props.prompts.length === 0);

        // Methods
        const toggleExpand = (promptId) => {
            if (expandedPrompts.value.has(promptId)) {
                expandedPrompts.value.delete(promptId);
            } else {
                expandedPrompts.value.add(promptId);
            }
        };

        const isExpanded = (promptId) => {
            return expandedPrompts.value.has(promptId);
        };

        const copyPrompt = async (prompt) => {
            const result = await clipboardService.copyPromptText(prompt);
            
            if (result.success) {
                copiedPromptId.value = prompt.id;
                promptStore.actions.showToast(result.message, 'success');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copiedPromptId.value = null;
                }, 2000);
            } else {
                promptStore.actions.showToast(result.message, 'error');
            }
        };

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('it-IT', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const truncateText = (text, maxLength = 150) => {
            if (!text || text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        };

        const handleEdit = (prompt) => {
            emit('edit', prompt);
        };

        const handleDelete = (promptId) => {
            emit('delete', promptId);
        };

        return {
            copiedPromptId,
            isEmpty,
            toggleExpand,
            isExpanded,
            copyPrompt,
            formatDate,
            truncateText,
            handleEdit,
            handleDelete
        };
    },
    template: `
        <div class="prompt-list">
            <!-- Empty State -->
            <div v-if="isEmpty" class="empty-state">
                <i class="bi bi-file-earmark-text empty-state-icon"></i>
                <h5 class="text-muted">Nessun prompt trovato</h5>
                <p class="text-muted">
                    Inizia aggiungendo il tuo primo prompt cliccando sul pulsante "Nuovo Prompt"
                </p>
            </div>

            <!-- Prompt Cards -->
            <div v-else class="row">
                <div v-for="prompt in prompts" :key="prompt.id" class="col-12 mb-3">
                    <div class="card prompt-card">
                        <div class="card-body">
                            <!-- Header con categoria e data -->
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <span 
                                        class="category-badge"
                                        :class="'category-' + prompt.categoria"
                                    >
                                        {{ prompt.categoria }}
                                    </span>
                                    <span v-if="prompt.tipologia" class="text-muted ms-2">
                                        <small>{{ prompt.tipologia }}</small>
                                    </span>
                                </div>
                                <small class="text-muted">
                                    {{ formatDate(prompt.dataCreazione) }}
                                </small>
                            </div>

                            <!-- Testo del prompt -->
                            <div class="prompt-text mb-3" @click="toggleExpand(prompt.id)">
                                <div v-if="!isExpanded(prompt.id)">
                                    {{ truncateText(prompt.testo, 200) }}
                                    <span 
                                        v-if="prompt.testo && prompt.testo.length > 200" 
                                        class="text-primary ms-1"
                                        style="cursor: pointer;"
                                    >
                                        Mostra tutto
                                    </span>
                                </div>
                                <div v-else>
                                    {{ prompt.testo }}
                                    <span 
                                        class="text-primary ms-1"
                                        style="cursor: pointer;"
                                    >
                                        Mostra meno
                                    </span>
                                </div>
                            </div>

                            <!-- Tags -->
                            <div v-if="prompt.tags && prompt.tags.length > 0" class="mb-3">
                                <span 
                                    v-for="tag in prompt.tags" 
                                    :key="tag"
                                    class="badge bg-light text-secondary me-2"
                                >
                                    <i class="bi bi-tag-fill me-1"></i>{{ tag }}
                                </span>
                            </div>

                            <!-- Note -->
                            <div v-if="prompt.note" class="mb-3">
                                <small class="text-muted">
                                    <i class="bi bi-sticky me-1"></i>
                                    {{ prompt.note }}
                                </small>
                            </div>

                            <!-- Actions -->
                            <div class="d-flex justify-content-end gap-2">
                                <button
                                    @click="copyPrompt(prompt)"
                                    class="btn btn-sm btn-outline-primary btn-copy"
                                    :class="{ 'btn-success': copiedPromptId === prompt.id }"
                                >
                                    <i :class="copiedPromptId === prompt.id ? 
                                        'bi bi-check-lg' : 
                                        'bi bi-clipboard'">
                                    </i>
                                    {{ copiedPromptId === prompt.id ? 'Copiato!' : 'Copia' }}
                                </button>
                                
                                <button
                                    @click="handleEdit(prompt)"
                                    class="btn btn-sm btn-outline-secondary"
                                >
                                    <i class="bi bi-pencil"></i>
                                    Modifica
                                </button>
                                
                                <button
                                    @click="handleDelete(prompt.id)"
                                    class="btn btn-sm btn-outline-danger"
                                >
                                    <i class="bi bi-trash"></i>
                                    Elimina
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Load More (futuro) -->
            <!-- <div v-if="hasMore" class="text-center mt-4">
                <button class="btn btn-outline-primary">
                    Carica altri prompt
                </button>
            </div> -->
        </div>
    `
};
