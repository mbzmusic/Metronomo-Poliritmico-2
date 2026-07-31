// ... (Tutto il codice JavaScript rimane invariato)
  let audioCtx = null;
  let masterGainNode = null;
  let isPlaying = false;
  
  // BPM PREDEFINITO FISSO A 120
  let bpm = 120;
  let masterVolume = 0.5;

  let inCountdown = false;
  let countdownBeat = 0;
  const COUNTDOWN_TOTAL = 4;

  let currentMeasureIndex = 0;
  let currentSubBeat = 0;
  let currentBeat = 0;
  let currentSubBeatInBeat = 0;
  let totalCompletedMeasures = 0;
  let measureRepeatCounter = 0;

  let nextNoteTime = 0.0;
  const lookahead = 25.0;
  const scheduleAheadTime = 0.1;
  let timerID = null;
  let activeSubPopup = null;

  let measures = [
    { beats: 4, sub: 2, beatSubs: [2,2,2,2], repeat: 1, accents: [], isCustom: false },
    { beats: 4, sub: 4, beatSubs: [4,4,4,4], repeat: 1, accents: [], isCustom: false }
  ];

  let targetCustomIndex = null;

  const bpmSlider = document.getElementById('bpmSlider');
  const bpmVal = document.getElementById('bpmVal');
  const agogicaLabel = document.getElementById('agogicaLabel');
  const playBtn = document.getElementById('playBtn');
  const dotsContainer = document.getElementById('dotsContainer');
  const currentMeasureBadge = document.getElementById('currentMeasureBadge');
  const movementDisplay = document.getElementById('movementDisplay');
  const measuresContainer = document.getElementById('measuresContainer');
  const addMeasureBtn = document.getElementById('addMeasureBtn');
  const resetAccentsBtn = document.getElementById('resetAccentsBtn');
  const resetSequenceBtn = document.getElementById('resetSequenceBtn');
  const countdownToggle = document.getElementById('countdownToggle');

  const trainerToggle = document.getElementById('trainerToggle');
  const trainerConfigRow = document.getElementById('trainerConfigRow');
  const trainerBpmInc = document.getElementById('trainerBpmInc');
  const trainerBarsInc = document.getElementById('trainerBarsInc');

  const masterKnob = document.getElementById('masterKnob');
  const knobIndicator = document.getElementById('knobIndicator');
  const masterValueText = document.getElementById('masterValueText');
  const valCircle = document.getElementById('valCircle');

  const metroVolInput = document.getElementById('metroVol');
  const soundWaveSelect = document.getElementById('soundWaveSelect');
  const tapTempoBtn = document.getElementById('tapTempoBtn');

  const customModal = document.getElementById('customModal');
  const customBeatsInput = document.getElementById('customBeatsInput');
  const customSubInput = document.getElementById('customSubInput');
  const customModalCancel = document.getElementById('customModalCancel');
  const customModalSave = document.getElementById('customModalSave');

  function loadPersistedData() {
    try {
      const savedMeasures = localStorage.getItem('metronome_measures_v5');
      if (savedMeasures) {
        const parsed = JSON.parse(savedMeasures);
        if (Array.isArray(parsed) && parsed.length > 0) {
          measures = parsed.map(m => {
            if (!m.beatSubs && m.sub) {
              m.beatSubs = new Array(m.beats || 4).fill(m.sub);
            }
            return {
              ...m,
              repeat: m.repeat === undefined ? 1 : m.repeat,
              beatSubs: m.beatSubs || new Array(m.beats || 4).fill(m.sub || 2)
            };
          });
        }
      }
      if (measures.length < 2) {
        measures.push({ beats: 4, sub: 4, beatSubs: [4,4,4,4], repeat: 1, accents: [], isCustom: false });
      }

      // IL BPM PARTE SEMPRE DA 120 DEFAULT
      bpm = 120;
      
      const savedVol = localStorage.getItem('metronome_vol_v4');
      if (savedVol) masterVolume = parseFloat(savedVol);
      const savedSound = localStorage.getItem('metronome_sound_v4');
      if (savedSound) soundWaveSelect.value = savedSound;
    } catch (e) {
      console.error('Errore nel caricamento dei dati', e);
      bpm = 120;
    }
  }

  function savePersistedData() {
    try {
      localStorage.setItem('metronome_measures_v5', JSON.stringify(measures));
      localStorage.setItem('metronome_vol_v4', masterVolume);
      localStorage.setItem('metronome_sound_v4', soundWaveSelect.value);
    } catch (e) {
      console.error('Errore nel salvataggio', e);
    }
  }

  loadPersistedData();

  function getAgogica(val) {
    if (val < 40) return "Grave";
    if (val < 60) return "Largo";
    if (val < 66) return "Larghetto";
    if (val < 76) return "Adagio";
    if (val < 108) return "Andante";
    if (val < 120) return "Moderato";
    if (val < 168) return "Allegro";
    if (val < 200) return "Presto";
    return "Prestissimo";
  }

  function updateMasterKnobUI(vol) {
    masterVolume = Math.min(1, Math.max(0, vol));
    const angle = -135 + (masterVolume * 270);
    knobIndicator.style.transform = `rotate(${angle}deg)`;
    masterValueText.innerText = `${Math.round(masterVolume * 100)}%`;

    const maxArcLength = 63.61;
    if (masterVolume <= 0.005) {
      valCircle.style.strokeDasharray = `0, 84.82`;
      valCircle.style.opacity = '0';
    } else {
      valCircle.style.strokeDasharray = `${masterVolume * maxArcLength}, 84.82`;
      valCircle.style.opacity = '1';
    }

    masterKnob.setAttribute('aria-valuenow', Math.round(masterVolume * 100));
    if (masterGainNode) masterGainNode.gain.value = masterVolume;
    savePersistedData();
  }

  let isDraggingKnob = false, startY = 0, startVol = 0.5;
  masterKnob.addEventListener('mousedown', (e) => {
    isDraggingKnob = true; startY = e.clientY; startVol = masterVolume;
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDraggingKnob) return;
    updateMasterKnobUI(startVol + ((startY - e.clientY) / 150));
  });
  window.addEventListener('mouseup', () => isDraggingKnob = false);

  masterKnob.addEventListener('touchstart', (e) => {
    isDraggingKnob = true; startY = e.touches[0].clientY; startVol = masterVolume;
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchmove', (e) => {
    if (!isDraggingKnob) return;
    updateMasterKnobUI(startVol + ((startY - e.touches[0].clientY) / 150));
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', () => isDraggingKnob = false);

  masterKnob.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowRight') {
      e.preventDefault(); updateMasterKnobUI(masterVolume + 0.05);
    } else if (e.code === 'ArrowDown' || e.code === 'ArrowLeft') {
      e.preventDefault(); updateMasterKnobUI(masterVolume - 0.05);
    }
  });

  function setupDragToAdjust(inputElem, onUpdate) {
    let isDragging = false;
    let startY = 0;
    let startVal = 0;

    inputElem.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startVal = parseFloat(inputElem.value) || 0;
      document.body.style.cursor = 'ns-resize';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaY = startY - e.clientY;
      const step = parseInt(inputElem.step, 10) || 1;
      const sensitivity = 5;
      let newVal = startVal + Math.round(deltaY / sensitivity) * step;

      const min = inputElem.min !== "" ? parseFloat(inputElem.min) : -Infinity;
      const max = inputElem.max !== "" ? parseFloat(inputElem.max) : Infinity;
      newVal = Math.min(max, Math.max(min, newVal));

      inputElem.value = newVal;
      if (onUpdate) onUpdate(newVal);
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'default';
      }
    });
  }

  setupDragToAdjust(bpmVal, (val) => setValidBpm(val));
  setupDragToAdjust(customBeatsInput);
  setupDragToAdjust(customSubInput);
  setupDragToAdjust(trainerBpmInc);
  setupDragToAdjust(trainerBarsInc);

  function setValidBpm(val) {
    let parsed = parseInt(val, 10);
    if (isNaN(parsed)) parsed = 120;
    bpm = Math.min(300, Math.max(20, parsed));
    bpmVal.value = bpm;
    bpmSlider.value = bpm;
    agogicaLabel.innerText = getAgogica(bpm);
  }

  bpmSlider.addEventListener('input', (e) => setValidBpm(e.target.value));
  bpmVal.addEventListener('change', (e) => setValidBpm(e.target.value));

  document.getElementById('bpmPlus1').addEventListener('click', () => setValidBpm(bpm + 1));
  document.getElementById('bpmMinus1').addEventListener('click', () => setValidBpm(bpm - 1));
  document.getElementById('bpmPlus5').addEventListener('click', () => setValidBpm(bpm + 5));
  document.getElementById('bpmMinus5').addEventListener('click', () => setValidBpm(bpm - 5));

  let tapTimes = [];
  tapTempoBtn.addEventListener('click', () => {
    const now = performance.now();
    if (tapTimes.length && now - tapTimes[tapTimes.length - 1] > 2000) tapTimes = [];
    tapTimes.push(now);
    if (tapTimes.length > 6) tapTimes.shift();

    if (tapTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimes.length; i++) intervals.push(tapTimes[i] - tapTimes[i - 1]);
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setValidBpm(Math.round(60000 / avgMs));
    }

    tapTempoBtn.classList.add('tapped');
    setTimeout(() => tapTempoBtn.classList.remove('tapped'), 100);
  });

  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement.tagName;
    if (activeTag === 'INPUT' || activeTag === 'SELECT' || document.activeElement === masterKnob) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayback();
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      setValidBpm(bpm + (e.shiftKey ? 5 : 1));
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      setValidBpm(bpm - (e.shiftKey ? 5 : 1));
    }
  });

  trainerToggle.addEventListener('change', () => {
    trainerConfigRow.style.opacity = trainerToggle.checked ? "1" : "0.5";
  });

  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGainNode = audioCtx.createGain();
      masterGainNode.connect(audioCtx.destination);
    }
    masterGainNode.gain.value = masterVolume;
  }

  function selectMeasure(index) {
    currentMeasureIndex = index;
    measureRepeatCounter = 0;
    renderMeasuresList();
    renderDots(currentMeasureIndex, -1, -1);
  }

  function renderMeasuresList() {
    measuresContainer.innerHTML = '';
    
    measures.forEach((m, index) => {
      const isFirst = index === 0;
      const isLast = index === measures.length - 1;
      const isOnly = measures.length === 1;

      const row = document.createElement('div');
      row.className = `measure-row ${index === currentMeasureIndex ? 'current' : ''}`;
      
      row.onclick = (e) => {
        if (['SELECT', 'BUTTON', 'svg', 'path', 'line', 'rect'].includes(e.target.tagName)) return;
        if (isPlaying) return;
        selectMeasure(index);
      };

      const repeatOptions = [1,2,3,4,5,6,7,8,9,10].map(r => `<option value="${r}" ${m.repeat === r ? 'selected' : ''}>×${r}</option>`).join('') + `<option value="inf" ${m.repeat === 'inf' ? 'selected' : ''}>Loop</option>`;
      const customLabel = m.isCustom ? `${m.beats}/${m.sub}` : 'Custom...';

      row.innerHTML = `
        <div class="measure-left">
          <div class="measure-number">${index + 1}</div>
          
          <select class="measure-select preset" onchange="handlePresetSelect(${index}, this.value)" onclick="handlePresetClick(${index}, this)" aria-label="Metro">
            <option value="4/4" ${!m.isCustom && m.beats === 4 && m.sub !== 3 ? 'selected' : ''}>4/4</option>
            <option value="2/4" ${!m.isCustom && m.beats === 2 && m.sub !== 3 ? 'selected' : ''}>2/4</option>
            <option value="3/4" ${!m.isCustom && m.beats === 3 && m.sub !== 3 ? 'selected' : ''}>3/4</option>
            <option value="6/8" ${!m.isCustom && m.beats === 2 && m.sub === 3 ? 'selected' : ''}>6/8</option>
            <option value="7/8" ${!m.isCustom && m.beats === 7 && m.sub === 2 ? 'selected' : ''}>7/8</option>
            <option value="12/8" ${!m.isCustom && m.beats === 4 && m.sub === 3 ? 'selected' : ''}>12/8</option>
            <option value="custom" ${m.isCustom ? 'selected' : ''}>${customLabel}</option>
          </select>

          ${m.isCustom ? `
            <button type="button" class="icon-btn edit-btn" onclick="openCustomModal(${index})" title="Modifica Metro Custom">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
          ` : ''}

          <select class="measure-select subdivision" onchange="updateMeasure(${index}, 'sub', this.value)" aria-label="Suddivisione">
            <option value="1" ${m.sub === 1 ? 'selected' : ''}>Quarti</option>
            <option value="2" ${m.sub === 2 ? 'selected' : ''}>Crome</option>
            <option value="3" ${m.sub === 3 ? 'selected' : ''}>Terzine</option>
            <option value="4" ${m.sub === 4 ? 'selected' : ''}>Quartine</option>
            <option value="5" ${m.sub === 5 ? 'selected' : ''}>Quintine</option>
            <option value="6" ${m.sub === 6 ? 'selected' : ''}>Sestine</option>
          </select>

          <select class="measure-select repeat" onchange="updateMeasure(${index}, 'repeat', this.value)" aria-label="Ripetizioni">
            ${repeatOptions}
          </select>
        </div>

        <div class="measure-right">
          <button type="button" class="icon-btn ${isFirst ? 'disabled' : ''}" 
            ${isFirst ? 'disabled' : ''} onclick="moveMeasureOrder(${index}, -1)">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
          
          <button type="button" class="icon-btn ${isLast ? 'disabled' : ''}" 
            ${isLast ? 'disabled' : ''} onclick="moveMeasureOrder(${index}, 1)">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </button>
          
          <button type="button" class="icon-btn" onclick="resetSingleMeasureAccents(${index})" title="Reset Accenti">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          
          <button type="button" class="icon-btn active-action" onclick="duplicateMeasure(${index})" title="Duplica">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          
          <button type="button" class="icon-btn ${isOnly ? 'disabled' : ''}" 
            ${isOnly ? 'disabled' : ''} onclick="removeMeasure(${index}, event)" title="Elimina">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;
      
      measuresContainer.appendChild(row);
    });
    
    savePersistedData();
  }

  window.handlePresetSelect = function(index, value) {
    if (value === 'custom') {
      openCustomModal(index);
    } else {
      updateMeasure(index, 'preset', value);
    }
  };

  window.handlePresetClick = function(index, selectElem) {
    if (selectElem.value === 'custom' && measures[index].isCustom) {
      openCustomModal(index);
    }
  };

  function openCustomModal(index) {
    targetCustomIndex = index;
    const m = measures[index];
    customBeatsInput.value = m.beats || 5;
    customSubInput.value = m.sub || 4;
    customModal.classList.add('active');
    
    setTimeout(() => {
      customBeatsInput.focus();
      customBeatsInput.select();
    }, 100);
  }

  function closeCustomModal() {
    customModal.classList.remove('active');
    targetCustomIndex = null;
  }

  customModalCancel.addEventListener('click', () => {
    closeCustomModal();
    renderMeasuresList();
  });

  customModalSave.addEventListener('click', () => {
    if (targetCustomIndex !== null) {
      const b = parseInt(customBeatsInput.value, 10);
      const s = parseInt(customSubInput.value, 10);
      if (!isNaN(b) && b > 0 && b <= 64 && !isNaN(s) && s > 0 && s <= 64) {
        measures[targetCustomIndex].beats = b;
        measures[targetCustomIndex].sub = s;
        measures[targetCustomIndex].isCustom = true;
        measures[targetCustomIndex].beatSubs = new Array(b).fill(s);

        const totalSubs = b * s;
        if (!measures[targetCustomIndex].accents) measures[targetCustomIndex].accents = [];
        if (measures[targetCustomIndex].accents.length > totalSubs) {
          measures[targetCustomIndex].accents = measures[targetCustomIndex].accents.slice(0, totalSubs);
        } else {
          while (measures[targetCustomIndex].accents.length < totalSubs) measures[targetCustomIndex].accents.push(0);
        }
      }
    }
    closeCustomModal();
    renderMeasuresList();
    if (!isPlaying) renderDots(currentMeasureIndex, -1, -1);
  });

  window.resetSingleMeasureAccents = function(index) {
    const m = measures[index];
    const totalSubs = m.beatSubs.reduce((a, b) => a + b, 0);
    m.accents = new Array(totalSubs).fill(0);
    if (!isPlaying) renderDots(currentMeasureIndex, -1, -1);
    savePersistedData();
  };

  window.updateMeasure = function(index, key, value) {
    if (key === 'preset') {
      measures[index].isCustom = false;
      const parts = value.split('/');
      measures[index].beats = parseInt(parts[0], 10);
      measures[index].sub = parts[1] === '8' ? 2 : 1;
      if (value === '6/8') { measures[index].beats = 2; measures[index].sub = 3; }
      if (value === '7/8') { measures[index].beats = 7; measures[index].sub = 2; }
      if (value === '12/8') { measures[index].beats = 4; measures[index].sub = 3; }
      measures[index].beatSubs = new Array(measures[index].beats).fill(measures[index].sub);
    } else if (key === 'sub') {
      measures[index].sub = parseInt(value, 10);
      measures[index].beatSubs = new Array(measures[index].beats).fill(parseInt(value, 10));
    } else if (key === 'repeat') {
      measures[index].repeat = value === 'inf' ? 'inf' : parseInt(value, 10);
    } else {
      measures[index][key] = parseInt(value, 10);
    }
    
    const totalSubs = measures[index].beatSubs.reduce((a, b) => a + b, 0);
    if (!measures[index].accents) measures[index].accents = [];
    if (measures[index].accents.length > totalSubs) {
      measures[index].accents = measures[index].accents.slice(0, totalSubs);
    } else {
      while (measures[index].accents.length < totalSubs) measures[index].accents.push(0);
    }

    renderMeasuresList();
    if (!isPlaying) renderDots(currentMeasureIndex, -1, -1);
  };

  window.duplicateMeasure = function(index) {
    if (isPlaying) return;
    const target = measures[index];
    measures.splice(index + 1, 0, {
      beats: target.beats,
      sub: target.sub,
      beatSubs: [...(target.beatSubs || new Array(target.beats).fill(target.sub || 2))],
      repeat: target.repeat || 1,
      accents: [...target.accents],
      isCustom: target.isCustom || false
    });
    renderMeasuresList();
    renderDots(currentMeasureIndex, -1, -1);
  };

  window.moveMeasureOrder = function(index, direction) {
    if (isPlaying) return;
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= measures.length) return;
    const item = measures.splice(index, 1)[0];
    measures.splice(newIdx, 0, item);
    currentMeasureIndex = newIdx;
    renderMeasuresList();
    renderDots(currentMeasureIndex, -1, -1);
  };

  addMeasureBtn.addEventListener('click', () => {
    if (isPlaying) return;
    const last = measures[measures.length - 1] || { beats: 4, sub: 2, beatSubs: [2,2,2,2], repeat: 1, isCustom: false };
    measures.push({ 
      beats: last.beats, 
      sub: last.sub, 
      beatSubs: [...(last.beatSubs || new Array(last.beats).fill(last.sub || 2))],
      repeat: 1, 
      accents: [], 
      isCustom: last.isCustom 
    });
    renderMeasuresList();
    selectMeasure(measures.length - 1);
  });

  window.removeMeasure = function(index, event) {
    if (event) event.stopPropagation();
    if (isPlaying) return;
    if (measures.length <= 1) return;
    measures.splice(index, 1);
    if (currentMeasureIndex >= measures.length) currentMeasureIndex = measures.length - 1;
    renderMeasuresList();
    renderDots(currentMeasureIndex, -1, -1);
  };

  resetAccentsBtn.addEventListener('click', () => {
    measures.forEach(m => {
      const totalSubs = m.beatSubs.reduce((a, b) => a + b, 0);
      m.accents = new Array(totalSubs).fill(0);
    });
    if (!isPlaying) renderDots(currentMeasureIndex, -1, -1);
    savePersistedData();
  });

  resetSequenceBtn.addEventListener('click', () => {
    if (isPlaying) return;
    measures = [
      { beats: 4, sub: 2, beatSubs: [2,2,2,2], repeat: 1, accents: [], isCustom: false },
      { beats: 4, sub: 4, beatSubs: [4,4,4,4], repeat: 1, accents: [], isCustom: false }
    ];
    currentMeasureIndex = 0;
    measureRepeatCounter = 0;
    renderMeasuresList();
    renderDots(0, -1, -1);
    savePersistedData();
  });

  function closeBeatSubPopup() {
    if (activeSubPopup) {
      activeSubPopup.remove();
      activeSubPopup = null;
    }
  }

  function showBeatSubPopup(beatNumberElem, measureIndex, beatIndex) {
    closeBeatSubPopup();
    
    const popup = document.createElement('div');
    popup.className = 'beat-sub-popup';
    
    const m = measures[measureIndex];
    const currentSub = m.beatSubs[beatIndex];
    
    const subNames = ['','Quarti','Crome','Terzine','Quartine','Quintine','Sestine','Settime'];
    
    for (let i = 1; i <= 7; i++) {
      const opt = document.createElement('div');
      opt.className = 'sub-popup-option' + (i === currentSub ? ' selected' : '');
      opt.textContent = subNames[i];
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        updateBeatSubdivision(measureIndex, beatIndex, i);
        renderDots(measureIndex, -1, -1);
        closeBeatSubPopup();
      });
      popup.appendChild(opt);
    }
    
    beatNumberElem.appendChild(popup);
    activeSubPopup = popup;
    
    requestAnimation