# 🎵 Metronomo Poliritmico Avanzato

Un metronomo poliritmico professionale e completamente web-based, progettato per musicisti, insegnanti e studenti che necessitano di un tool flessibile per la pratica ritmica complessa.

> **Autore:** Marco Bozzo  
> **Versione:** 1.0  
> **Licenza:** MIT

---

## ✨ Caratteristiche Principali

- **🎼 Battute Multiple & Sequenze** — Crea sequenze di battute con metri diversi, suddivisioni variabili e controlli di ripetizione (fino a 10 volte o loop infinito).
- **🔊 Accenti Personalizzabili** — Per ogni suddivisione puoi impostare: *Normale*, *Accento* o *Muto* con un semplice click.
- **🎚️ Preset di Metro** — 4/4, 2/4, 3/4, 6/8, 7/8, 12/8 e metro personalizzato fino a 64/64.
- **⏱️ Agogica Automatica** — Visualizzazione del tempo musicale (Grave, Largo, Adagio, Andante, Moderato, Allegro, Presto, Prestissimo) in base al BPM.
- **🏋️ Tempo Trainer** — Incremento automatico del BPM dopo un numero configurabile di battute (perfetto per esercizi di accelerazione graduale).
- **👆 Tap Tempo** — Calcola il BPM toccando a tempo sul pulsante dedicato.
- **🔔 Campioni Audio** — Scegli tra suoni sintetizzati (Sinusoidale, Triangolare, Quadrata) o percussivi (Woodblock, Cowbell, Rimshot).
- **🔊 Volume Master Interattivo** — Knob draggabile per il controllo del volume generale.
- **⏳ Countdown Iniziale** — 4 battiti di preparazione prima dell'avvio effettivo.
- **💾 Persistenza Dati** — Le impostazioni, le battute e gli accenti vengono salvati automaticamente nel `localStorage` del browser.
- **⌨️ Scorciatoie da Tastiera** — Controlla il metronomo senza usare il mouse.
- **📱 Responsive Design** — Interfaccia ottimizzata per desktop, tablet e smartphone.

---

## 🚀 Utilizzo

1. **Apri il file** `Metronomo_Poliritmico.html` in qualsiasi browser moderno (Chrome, Firefox, Edge, Safari).
2. **Nessuna installazione richiesta** — Funziona interamente nel browser.
3. Consenti l'accesso all'audio se richiesto dal browser.

### Avvio Rapido

1. Imposta il BPM desiderato (20–300) tramite il campo numerico, lo slider o il *Tap Tempo*.
2. Configura le battute nella sezione *Sequenza Battute*.
3. Clicca sui pallini nel visualizzatore per impostare accenti o note mute.
4. Premi **AVVIA** (o la barra spaziatrice) per iniziare.

---

## 🎛️ Interfaccia

### Sezione BPM
- **Campo numerico** — Inserisci il BPM manualmente o trascina verso l'alto/basso per regolare.
- **Slider** — Regolazione rapida del tempo.
- **Pulsanti ±1 / ±5** — Modifica fine del BPM.
- **Tap Tempo** — Tocca ripetutamente per calcolare il BPM.
- **Etichetta Agogica** — Mostra il tempo musicale corrente (es. *Allegro*, *Andante*).

### Visualizzatore
- **Pallini attivi** — Indicano la suddivisione corrente in tempo reale.
- **Gruppi di battuta** — I pallini sono raggruppati per battuta per una lettura immediata.
- **Stati colore:**
  - 🔘 **Grigio** — Nota normale
  - 🟠 **Arancione** — Accento
  - 🔴 **Rosso** — Muto (silenziata)

### Sequenza Battute
- Aggiungi, duplica, sposta o elimina battute.
- Ogni battuta supporta:
  - **Metro:** preset comuni o personalizzato
  - **Suddivisione:** Quarti, Crome, Terzine, Quartine, Quintine, Sestine
  - **Ripetizioni:** da 1 a 10, o loop infinito

### Pannello Impostazioni
- **Countdown iniziale** — Attiva/disattiva i 4 battiti di preparazione.
- **Tempo Trainer** — Incrementa automaticamente il BPM ogni N battute.
- **Suono suddivisioni** — Seleziona la forma d'onda o il campione percussivo.
- **Volume metronomo** — Mix indipendente per il suono del click.

---

## ⌨️ Scorciatoie da Tastiera

| Tasto | Azione |
|-------|--------|
| `Spazio` | Avvia / Ferma il metronomo |
| `↑` | Aumenta BPM di 1 |
| `↓` | Diminuisce BPM di 1 |
| `Shift + ↑` | Aumenta BPM di 5 |
| `Shift + ↓` | Diminuisce BPM di 5 |
| `Frecce` (sul knob volume) | Regola volume master |

> *Le scorciatoie sono disattivate quando un campo di input è attivo.*

---

## 🛠️ Tecnologie

- **HTML5** — Struttura semantica e accessibile
- **CSS3** — Design moderno con variabili CSS, backdrop-filter, animazioni fluide
- **Vanilla JavaScript** — Nessuna dipendenza esterna; Web Audio API per la generazione audio
- **Web Audio API** — Sintesi audio in tempo reale (oscillatori, noise buffer, gain nodes)
- **LocalStorage API** — Persistenza delle preferenze utente

---

## 📂 Struttura del Progetto

```
.
├── Metronomo_Poliritmico.html   # Applicazione completa (single-file)
└── README.md                    # Documentazione
```

> L'intera applicazione è contenuta in un unico file HTML per massima portabilità: basta aprirlo in un browser.

---

## 🎓 Casi d'Uso

- **Studio individuale** — Pratica con tempi complessi e cambi di metro.
- **Lezioni di musica** — Visualizzazione chiara del ritmo per gli studenti.
- **Poliritmi** — Combina battute con suddivisioni diverse (es. 4/4 crome + 4/4 quartine).
- **Allenamento velocità** — Il Tempo Trainer aumenta gradualmente il BPM.
- **Prove di gruppo** — Sequenze di battute per brani con cambi di tempo.

---

## 🐛 Bug e Suggerimenti

Se trovi un bug o hai un'idea per migliorare il metronomo, sentiti libero di aprire una *issue* o di contattare l'autore.

---

## 👤 Autore

**Marco Bozzo**

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza **MIT**.  
Sei libero di usarlo, modificarlo e distribuirlo, citando l'autore originale.

---

> *"La precisione ritmica è la base della musica. Questo metronomo è pensato per chi vuole andare oltre il 4/4."* — Marco Bozzo
