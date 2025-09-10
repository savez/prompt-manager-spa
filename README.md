# Prompt Manager SPA

Una Single Page Application per gestire e organizzare i tuoi prompt AI in modo efficiente.

## 🚀 Caratteristiche

- **Gestione Prompt**: Crea, modifica, elimina e organizza i tuoi prompt
- **Ricerca Avanzata**: Omnibox per ricerca globale in tempo reale
- **Categorizzazione**: Organizza per categorie AI (GPT, GEMINI, CLAUDE, PERPLEXITY, COPILOT)
- **Sistema di Tag**: Aggiungi tag personalizzati con auto-completamento
- **Copia Rapida**: Copia i prompt negli appunti con un click
- **Database Offline**: Utilizza IndexedDB per funzionare offline
- **Export/Import**: Backup e ripristino dei dati in formato JSON
- **Interfaccia Responsive**: Design moderno con Bootstrap 5

## 📋 Requisiti

- Browser moderno con supporto per:
  - ES6+ JavaScript
  - IndexedDB (con fallback su localStorage)
  - Clipboard API

## 🛠️ Installazione

1. Clona o scarica il progetto:
```bash
git clone [url-repository]
cd prompt-manager-spa
```

2. Installa le dipendenze di sviluppo (opzionale, solo per il server di sviluppo):
```bash
npm install
```

3. Avvia il server di sviluppo:
```bash
npm run dev
```

Oppure apri direttamente `index.html` nel browser (funziona anche offline).

## 📖 Utilizzo

### Aggiungere un Prompt

1. Clicca su "Nuovo Prompt"
2. Compila i campi:
   - **Prompt**: Il testo del tuo prompt (obbligatorio)
   - **Categoria**: Seleziona il servizio AI (obbligatorio)
   - **Tipologia**: Contesto d'uso (es. Sviluppo, Marketing)
   - **Tag**: Aggiungi tag separati da virgola
   - **Note**: Eventuali note aggiuntive

### Cercare Prompt

- Usa la barra di ricerca per cercare in tutti i campi
- Clicca su "Filtri" per filtrare per categoria o tag
- La ricerca è in tempo reale con debouncing

### Gestire i Prompt

- **Copia**: Clicca sul pulsante "Copia" per copiare negli appunti
- **Modifica**: Clicca su "Modifica" per aggiornare un prompt
- **Elimina**: Clicca su "Elimina" (con conferma)
- **Espandi**: Clicca sul testo per visualizzarlo completo

### Backup dei Dati

- **Esporta**: Menu → "Esporta Backup" per scaricare un JSON
- **Importa**: Menu → "Importa Backup" per caricare un backup

## 🏗️ Struttura del Progetto

```
prompt-manager-spa/
├── index.html              # Pagina principale
├── src/
│   ├── App.js             # Componente principale
│   ├── components/        # Componenti Vue
│   │   ├── PromptForm.js  # Form per prompt
│   │   ├── PromptList.js  # Lista prompt
│   │   ├── SearchBar.js   # Barra di ricerca
│   │   └── Toast.js       # Notifiche
│   ├── services/          # Servizi
│   │   ├── database.js    # Gestione IndexedDB
│   │   └── clipboard.js   # Gestione clipboard
│   ├── store/             # Stato globale
│   │   └── promptStore.js # Store Vue reattivo
│   └── assets/            # Risorse
│       └── style.css      # Stili personalizzati
└── README.md              # Questo file
```

## 🔧 Tecnologie Utilizzate

- **Vue 3**: Framework JavaScript reattivo
- **Bootstrap 5**: Framework CSS per UI responsive
- **IndexedDB**: Database browser per storage offline
- **Vanilla JavaScript**: ES6+ senza build tools

## 📝 Formato Dati

Ogni prompt è salvato con questa struttura:

```json
{
  "id": 1,
  "testo": "Il testo del prompt",
  "categoria": "GPT",
  "tags": ["sviluppo", "javascript"],
  "tipologia": "Programmazione",
  "note": "Note aggiuntive",
  "dataCreazione": "2025-02-12T10:00:00.000Z",
  "dataModifica": "2025-02-12T11:00:00.000Z"
}
```

## 🚀 Performance

- Ricerca con debouncing (300ms)
- Lazy loading dei prompt espansi
- IndexedDB per performance ottimali
- Nessuna dipendenza esterna pesante

## 🔐 Privacy

- Tutti i dati sono salvati localmente nel browser
- Nessun dato viene inviato a server esterni
- Export/Import completamente offline

## 🐛 Troubleshooting

### IndexedDB non disponibile
- L'app utilizzerà automaticamente localStorage come fallback

### Copia negli appunti non funziona
- Assicurati di usare HTTPS o localhost
- Alcuni browser richiedono permessi espliciti

### Dati persi
- Usa regolarmente la funzione Export per backup
- I dati sono legati al browser/profilo specifico

## 📄 Licenza

MIT License - Usa liberamente per progetti personali e commerciali.

## 👨‍💻 Autore

Sviluppato da Saverio Menin

---

Per suggerimenti o problemi, apri una issue nel repository.
