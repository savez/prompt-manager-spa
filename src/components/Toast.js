// Componente Toast per notifiche

const { computed } = Vue;

export default {
    name: 'Toast',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: 'success',
            validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
        }
    },
    emits: ['close'],
    setup(props, { emit }) {
        const toastClasses = computed(() => {
            return [
                'toast',
                'show',
                `toast-${props.type}`
            ];
        });

        const iconClass = computed(() => {
            switch (props.type) {
                case 'success':
                    return 'bi-check-circle-fill';
                case 'error':
                    return 'bi-x-circle-fill';
                case 'warning':
                    return 'bi-exclamation-triangle-fill';
                default:
                    return 'bi-info-circle-fill';
            }
        });

        const close = () => {
            emit('close');
        };

        return {
            toastClasses,
            iconClass,
            close
        };
    },
    template: `
        <Transition name="slide">
            <div v-if="show" class="toast-container">
                <div :class="toastClasses" role="alert">
                    <div class="d-flex align-items-center">
                        <i :class="[iconClass, 'me-2']"></i>
                        <div class="toast-body">
                            {{ message }}
                        </div>
                        <button 
                            type="button" 
                            class="btn-close btn-close-white ms-auto me-2"
                            @click="close"
                        ></button>
                    </div>
                </div>
            </div>
        </Transition>
    `
};
