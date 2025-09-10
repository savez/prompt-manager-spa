// Servizio per gestire clipboard/copia negli appunti

class ClipboardService {
    // Copia testo negli appunti
    async copyToClipboard(text) {
        try {
            // Metodo moderno - Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return { success: true, message: 'Prompt copiato negli appunti!' };
            } else {
                // Fallback per browser più vecchi o contesti non sicuri
                return this.fallbackCopy(text);
            }
        } catch (error) {
            console.error('Errore durante la copia:', error);
            
            // Prova fallback se il metodo moderno fallisce
            try {
                return this.fallbackCopy(text);
            } catch (fallbackError) {
                return { 
                    success: false, 
                    message: 'Errore durante la copia negli appunti. Prova a selezionare e copiare manualmente.' 
                };
            }
        }
    }

    // Metodo fallback usando un textarea temporaneo
    fallbackCopy(text) {
        // Crea textarea temporaneo
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.style.opacity = '0';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }

        document.body.removeChild(textArea);

        if (success) {
            return { success: true, message: 'Prompt copiato negli appunti!' };
        } else {
            return { 
                success: false, 
                message: 'Impossibile copiare automaticamente. Usa Ctrl+C/Cmd+C dopo aver selezionato il testo.' 
            };
        }
    }

    // Verifica se la Clipboard API è disponibile
    isClipboardSupported() {
        return navigator.clipboard && window.isSecureContext;
    }

    // Copia con feedback visivo (richiede riferimento al toast store)
    async copyWithFeedback(text, showToast) {
        const result = await this.copyToClipboard(text);
        
        if (showToast) {
            showToast(result.message, result.success ? 'success' : 'error');
        }
        
        return result;
    }

    // Funzione helper per formattare prompt prima della copia
    formatPromptForCopy(prompt) {
        let formattedText = prompt.testo || '';
        
        // Opzionalmente aggiungi metadata come commento
        if (prompt.categoria || prompt.tipologia) {
            formattedText += '\n\n---\n';
            if (prompt.categoria) {
                formattedText += `Categoria: ${prompt.categoria}\n`;
            }
            if (prompt.tipologia) {
                formattedText += `Tipologia: ${prompt.tipologia}\n`;
            }
            if (prompt.tags && prompt.tags.length > 0) {
                formattedText += `Tags: ${prompt.tags.join(', ')}\n`;
            }
        }
        
        return formattedText;
    }

    // Copia solo il testo del prompt
    async copyPromptText(prompt) {
        return this.copyToClipboard(prompt.testo || '');
    }

    // Copia prompt con metadata
    async copyPromptWithMetadata(prompt) {
        const formattedText = this.formatPromptForCopy(prompt);
        return this.copyToClipboard(formattedText);
    }
}

// Esporta singleton
const clipboardService = new ClipboardService();
export default clipboardService;
