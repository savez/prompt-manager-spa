// Componente PromptForm per creare/modificare prompt

const { ref, computed, watch, onMounted } = Vue;

export default {
    name: 'PromptForm',
    props: {
        prompt: {
            type: Object,
            default: null
        },
        categories: {
            type: Array,
            required: true
        },
        existingTags: {
            type: Array,
            default: () => []
        }
    },
    emits: ['submit', 'cancel'],
    setup(props, { emit }) {
        // Form data
        const formData = ref({
            testo: '',
            categoria: '',
            tags: '',
            tipologia: '',
            note: ''
        });

        // Validation errors
        const errors = ref({});

        // Tag suggestions
        const showTagSuggestions = ref(false);
        const tagInput = ref('');
        const selectedTags = ref([]);

        // Computed
        const isEditMode = computed(() => !!props.prompt);

        const filteredTagSuggestions = computed(() => {
            if (!tagInput.value) return [];
            
            const input = tagInput.value.toLowerCase();
            const uniqueTags = [...new Set(props.existingTags)];
            
            return uniqueTags
                .filter(tag => 
                    tag.toLowerCase().includes(input) && 
                    !selectedTags.value.includes(tag)
                )
                .slice(0, 5);
        });

        const isValid = computed(() => {
            return formData.value.testo.trim() && 
                   formData.value.categoria && 
                   Object.keys(errors.value).length === 0;
        });

        // Methods
        const validateField = (field) => {
            delete errors.value[field];

            switch (field) {
                case 'testo':
                    if (!formData.value.testo.trim()) {
                        errors.value.testo = 'Il prompt è obbligatorio';
                    }
                    break;
                case 'categoria':
                    if (!formData.value.categoria) {
                        errors.value.categoria = 'La categoria è obbligatoria';
                    }
                    break;
                case 'tags':
                    // Tags sono opzionali, ma validare formato se presenti
                    if (formData.value.tags) {
                        const tags = formData.value.tags.split(',').map(t => t.trim()).filter(t => t);
                        if (tags.some(tag => tag.length > 30)) {
                            errors.value.tags = 'I tag non possono superare i 30 caratteri';
                        }
                    }
                    break;
            }
        };

        const validateForm = () => {
            errors.value = {};
            ['testo', 'categoria'].forEach(field => validateField(field));
            return Object.keys(errors.value).length === 0;
        };

        const addTag = (tag) => {
            if (!selectedTags.value.includes(tag)) {
                selectedTags.value.push(tag);
                updateTagsString();
            }
            tagInput.value = '';
            showTagSuggestions.value = false;
        };

        const removeTag = (tag) => {
            const index = selectedTags.value.indexOf(tag);
            if (index > -1) {
                selectedTags.value.splice(index, 1);
                updateTagsString();
            }
        };

        const updateTagsString = () => {
            formData.value.tags = selectedTags.value.join(', ');
        };

        const handleTagInput = (event) => {
            const value = event.target.value;
            
            // Se l'utente preme virgola o invio, aggiungi il tag
            if (value.includes(',') || event.key === 'Enter') {
                event.preventDefault();
                const newTag = value.replace(',', '').trim();
                if (newTag && !selectedTags.value.includes(newTag)) {
                    addTag(newTag);
                }
                tagInput.value = '';
                return;
            }

            tagInput.value = value;
            showTagSuggestions.value = value.length > 0 && filteredTagSuggestions.value.length > 0;
        };

        const handleSubmit = async () => {
            if (!validateForm()) {
                return;
            }

            const submitData = {
                ...formData.value,
                tags: selectedTags.value.length > 0 ? selectedTags.value : 
                      formData.value.tags ? formData.value.tags.split(',').map(t => t.trim()).filter(t => t) : []
            };

            emit('submit', submitData);
        };

        const handleCancel = () => {
            emit('cancel');
        };

        const resetForm = () => {
            formData.value = {
                testo: '',
                categoria: '',
                tags: '',
                tipologia: '',
                note: ''
            };
            selectedTags.value = [];
            errors.value = {};
        };

        // Watch for prop changes (edit mode)
        watch(() => props.prompt, (newPrompt) => {
            if (newPrompt) {
                formData.value = {
                    testo: newPrompt.testo || '',
                    categoria: newPrompt.categoria || '',
                    tags: Array.isArray(newPrompt.tags) ? newPrompt.tags.join(', ') : newPrompt.tags || '',
                    tipologia: newPrompt.tipologia || '',
                    note: newPrompt.note || ''
                };
                selectedTags.value = Array.isArray(newPrompt.tags) ? [...newPrompt.tags] : 
                                    newPrompt.tags ? newPrompt.tags.split(',').map(t => t.trim()).filter(t => t) : [];
            }
        }, { immediate: true });

        return {
            formData,
            errors,
            isEditMode,
            isValid,
            showTagSuggestions,
            tagInput,
            selectedTags,
            filteredTagSuggestions,
            validateField,
            handleSubmit,
            handleCancel,
            handleTagInput,
            addTag,
            removeTag
        };
    },
    template: `
        <form @submit.prevent="handleSubmit">
            <!-- Campo Prompt -->
            <div class="mb-3">
                <label for="promptText" class="form-label">
                    Prompt <span class="text-danger">*</span>
                </label>
                <textarea
                    id="promptText"
                    v-model="formData.testo"
                    @blur="validateField('testo')"
                    class="form-control"
                    :class="{ 'is-invalid': errors.testo }"
                    rows="5"
                    placeholder="Inserisci il tuo prompt qui..."
                    required
                ></textarea>
                <div v-if="errors.testo" class="invalid-feedback">
                    {{ errors.testo }}
                </div>
            </div>

            <!-- Categoria -->
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="categoria" class="form-label">
                        Categoria AI <span class="text-danger">*</span>
                    </label>
                    <select
                        id="categoria"
                        v-model="formData.categoria"
                        @change="validateField('categoria')"
                        class="form-select"
                        :class="{ 'is-invalid': errors.categoria }"
                        required
                    >
                        <option value="">Seleziona categoria...</option>
                        <option v-for="cat in categories" :key="cat" :value="cat">
                            {{ cat }}
                        </option>
                    </select>
                    <div v-if="errors.categoria" class="invalid-feedback">
                        {{ errors.categoria }}
                    </div>
                </div>

                <!-- Tipologia -->
                <div class="col-md-6 mb-3">
                    <label for="tipologia" class="form-label">Tipologia/Contesto</label>
                    <input
                        type="text"
                        id="tipologia"
                        v-model="formData.tipologia"
                        class="form-control"
                        placeholder="es. Sviluppo, Marketing, Scrittura..."
                    >
                </div>
            </div>

            <!-- Tags -->
            <div class="mb-3">
                <label for="tags" class="form-label">Tags</label>
                <div class="position-relative">
                    <!-- Tag selezionati -->
                    <div v-if="selectedTags.length > 0" class="mb-2">
                        <span 
                            v-for="tag in selectedTags" 
                            :key="tag"
                            class="badge bg-primary me-2 mb-1"
                        >
                            {{ tag }}
                            <button 
                                type="button"
                                @click="removeTag(tag)"
                                class="btn-close btn-close-white ms-1"
                                style="font-size: 0.7rem;"
                            ></button>
                        </span>
                    </div>

                    <!-- Input tag -->
                    <input
                        type="text"
                        id="tags"
                        :value="tagInput"
                        @input="handleTagInput"
                        @keydown.enter.prevent="handleTagInput"
                        @focus="showTagSuggestions = tagInput.length > 0 && filteredTagSuggestions.length > 0"
                        @blur="setTimeout(() => showTagSuggestions = false, 200)"
                        class="form-control"
                        :class="{ 'is-invalid': errors.tags }"
                        placeholder="Aggiungi tag (premi Invio o virgola per confermare)..."
                    >

                    <!-- Suggerimenti tag -->
                    <div 
                        v-if="showTagSuggestions" 
                        class="position-absolute w-100 bg-white border rounded-bottom shadow-sm"
                        style="z-index: 1000; max-height: 200px; overflow-y: auto;"
                    >
                        <button
                            v-for="suggestion in filteredTagSuggestions"
                            :key="suggestion"
                            type="button"
                            @mousedown.prevent="addTag(suggestion)"
                            class="dropdown-item text-start w-100"
                        >
                            <i class="bi bi-tag me-2"></i>{{ suggestion }}
                        </button>
                    </div>

                    <div v-if="errors.tags" class="invalid-feedback">
                        {{ errors.tags }}
                    </div>
                    <small class="form-text text-muted">
                        Separa i tag con virgole o premi Invio dopo ogni tag
                    </small>
                </div>
            </div>

            <!-- Note -->
            <div class="mb-4">
                <label for="note" class="form-label">Note aggiuntive</label>
                <textarea
                    id="note"
                    v-model="formData.note"
                    class="form-control"
                    rows="3"
                    placeholder="Eventuali note o istruzioni d'uso..."
                ></textarea>
            </div>

            <!-- Buttons -->
            <div class="d-flex justify-content-end gap-2">
                <button 
                    type="button"
                    @click="handleCancel"
                    class="btn btn-outline-secondary"
                >
                    Annulla
                </button>
                <button 
                    type="submit"
                    :disabled="!isValid"
                    class="btn btn-primary-custom"
                >
                    <i :class="isEditMode ? 'bi-pencil' : 'bi-plus-circle'" class="me-2"></i>
                    {{ isEditMode ? 'Aggiorna' : 'Aggiungi' }} Prompt
                </button>
            </div>
        </form>
    `
};
