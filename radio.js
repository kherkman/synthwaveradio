function initSynthwaveRadio() {
    let midiAccess = null, selectedOutput = null, currentSong = null, isPlaying = false;
    let currentTimer = null, currentEventIndex = 0;
    let currentSectionName = "ready", outroStartTick = 0, outroBars = 8;
    let currentBPM = 100;
    let spectrumTimer = null;
    let isScanning = false;

    // Real-time visualizer energy values (12 channels)
    let barAmplitudes = new Array(12).fill(5);

    // Live controller variables (controlled by dragging)
    let volumeValue = 0.8; // 0.0 - 1.0 (80%)
    let toneValue = 0.5;   // 0.0 - 1.0 (Neutral center)

    // Keep track of active notes to prevent hanging notes
    let activeNotes = [];
    
    async function initMIDI() {
        try {
            midiAccess = await navigator.requestMIDIAccess();
            const select = document.getElementById('midiOutputSelect');
            select.innerHTML = '<option value="">-- select MIDI output --</option>';
            for (let output of midiAccess.outputs.values()) {
                select.innerHTML += `<option value="${output.id}">${output.name}</option>`;
            }
            select.onchange = () => {
                selectedOutput = select.value ? midiAccess.outputs.get(select.value) : null;
                if (selectedOutput) {
                    sendVolumeCC(volumeValue);
                }
            };
            document.getElementById('status').innerHTML = "🎛️ MIDI ready. Select output & PLAY";
        } catch(e) {
            document.getElementById('status').innerHTML = "⚠️ MIDI not supported";
        }
    }

    // Broadcast volume changes immediately to all active channels using MIDI CC 7
    function sendVolumeCC(val) {
        const ccVal = Math.min(127, Math.max(0, Math.round(val * 127)));

        if (typeof window.onMIDIEvent === 'function') {
            window.onMIDIEvent({
                type: 'cc',
                channel: 1, 
                controller: 7,
                value: ccVal
            });
        }

        if (!selectedOutput) return;
        const activeChannels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        activeChannels.forEach(ch => {
            try {
                selectedOutput.send([0xB0 + (ch - 1), 7, ccVal]);
            } catch(e) {}
        });
    }

    // Helper to map MIDI channels and notes to sample names
    function getSampleName(channel, note) {
        if (channel === 1) return 'bass';
        if (channel === 2) return 'chords';
        if (channel === 3) return 'arp';
        if (channel === 4) return 'melody'; 
        if (channel === 5) return 'fills';
        if (channel === 6) return 'lead';   
        if (channel === 7) return 'mid-bass';
        if (channel === 10) return 'sub-bass';
        if (channel === 11) return 'sweep';
        
        if (channel === 9) { 
            if (note === 36) return 'kick';
            if (note === 38) return 'snare';
            if (note === 39) return 'clap';
            if (note === 42) return 'closed-hat';
            if (note === 46) return 'open-hat';
            if (note === 50 || note === 48) return 'tom1';
            if (note === 45 || note === 43) return 'tom2';
            if (note === 41) return 'tom3';
        }
        return null;
    }

    function getScaledVelocity(originalVel, channel, note) {
        let scale = 1.0;
        const isBassElement = (channel === 1 || channel === 7 || channel === 10) || (channel === 9 && note === 36);
        if (isBassElement) {
            if (toneValue < 0.5) scale = 1.0 + (0.5 - toneValue) * 0.7;
            else scale = 1.0 - (toneValue - 0.5) * 1.6;
        } else {
            if (toneValue < 0.5) scale = 1.0 - (0.5 - toneValue) * 1.7;
            else scale = 1.0 + (toneValue - 0.5) * 0.7;
        }
        const finalVel = originalVel * volumeValue * scale;
        return Math.min(127, Math.max(1, Math.round(finalVel)));
    }

    function triggerSpectrumBar(channel, note, velocity) {
        if (typeof channel !== 'number' || typeof note !== 'number' || typeof velocity !== 'number') return;
        let targetBar = -1;
        if (channel === 9) { 
            if (note === 36) targetBar = 0; 
            else if (note === 38 || note === 39) targetBar = 3; 
            else if (note === 42 || note === 46) targetBar = 11; 
            else targetBar = (note < 45) ? 1 : 2;
        } else if (channel === 1 || channel === 7 || channel === 10) { 
            targetBar = (note < 48) ? 1 : 2;
        } else if (channel === 2) { 
            if (note < 54) targetBar = 4;
            else if (note < 64) targetBar = 5;
            else targetBar = 6;
        } else if (channel === 3) { 
            if (note < 60) targetBar = 5;
            else if (note < 72) targetBar = 6;
            else targetBar = 7;
        } else if (channel === 4 || channel === 5) { 
            if (note < 64) targetBar = 7;
            else if (note < 76) targetBar = 8;
            else targetBar = 9;
        } else if (channel === 6) { 
            if (note < 60) targetBar = 6;
            else if (note < 72) targetBar = 8;
            else if (note < 84) targetBar = 10;
            else targetBar = 11;
        } else if (channel === 11) {
            targetBar = 11;
        }
        if (targetBar >= 0 && targetBar < 12) {
            let height = 25 + (velocity / 127) * 75;
            height = Math.min(100, Math.max(10, height + window.getRandomInt(-6, 6)));
            barAmplitudes[targetBar] = Math.max(barAmplitudes[targetBar], height);
        }
    }
    
    function sendMIDIEvent(event) {
        if (!event) return;

        let scaledVel = event.velocity;
        if (event.type === 'note') {
            scaledVel = getScaledVelocity(event.velocity, event.channel, event.note);
            triggerSpectrumBar(event.channel, event.note, scaledVel);
        }

        if (typeof window.onMIDIEvent === 'function') {
            const wavEvent = event.type === 'note' ? { ...event, velocity: scaledVel } : event;
            window.onMIDIEvent(wavEvent);
        }

        if (event.type === 'section') {
            currentSectionName = event.name;
            document.getElementById('sectionDisplay').innerText = String(event.name).toUpperCase();
            if (event.name === 'outro') {
                outroStartTick = event.tick;
            }
            return;
        }

        if (event.type === 'note') {
            const noteId = Math.random().toString(36).substring(2, 11);
            
            const existingIndex = activeNotes.findIndex(n => n.channel === event.channel && n.note === event.note);
            if (existingIndex > -1) {
                const oldNote = activeNotes[existingIndex];
                if (typeof window.onMIDIEvent === 'function') {
                    window.onMIDIEvent({
                        type: 'note',
                        channel: oldNote.channel,
                        note: oldNote.note,
                        velocity: 0
                    });
                }
                if (selectedOutput) {
                    try { selectedOutput.send([0x80 + (oldNote.channel - 1), oldNote.note, 0]); } catch(e) {}
                }
                activeNotes.splice(existingIndex, 1);
            }

            if (event.channel === 2) {
                const notesToStop = activeNotes.filter(n => n.channel === 2 && n.tick < event.tick);
                notesToStop.forEach(oldNote => {
                    if (typeof window.onMIDIEvent === 'function') {
                        window.onMIDIEvent({
                            type: 'note',
                            channel: 2,
                            note: oldNote.note,
                            velocity: 0
                        });
                    }
                    if (selectedOutput) {
                        try { selectedOutput.send([0x80 + 1, oldNote.note, 0]); } catch(e) {}
                    }
                    const idx = activeNotes.findIndex(n => n.id === oldNote.id);
                    if (idx > -1) activeNotes.splice(idx, 1);
                });
            }

            activeNotes.push({ channel: event.channel, note: event.note, id: noteId, tick: event.tick });
            
            const currentBeatLenMs = (60000 / currentBPM);
            const noteOffTime = event.duration * currentBeatLenMs / 480;
            
            setTimeout(() => {
                const activeIndex = activeNotes.findIndex(n => n.id === noteId);
                if (activeIndex > -1) {
                    if (typeof window.onMIDIEvent === 'function') {
                        window.onMIDIEvent({
                            type: 'note',
                            channel: event.channel,
                            note: event.note,
                            velocity: 0
                        });
                    }
                    if (selectedOutput) {
                        try { selectedOutput.send([0x80 + (event.channel - 1), event.note, 0]); } catch(e) {}
                    }
                    activeNotes.splice(activeIndex, 1);
                }
            }, noteOffTime);
        }

        if (!selectedOutput) return;

        try {
            if (event.type === 'note') {
                selectedOutput.send([0x90 + (event.channel - 1), event.note, scaledVel]);
            } else if (event.type === 'cc') {
                selectedOutput.send([0xB0 + (event.channel - 1), event.controller, event.value]);
            } else if (event.type === 'pitch') {
                const lsb = event.value & 0x7F;
                const msb = (event.value >> 7) & 0x7F;
                selectedOutput.send([0xE0 + (event.channel - 1), lsb, msb]);
            }
        } catch(e) {}
    }
    
    function playSong(song) {
        if (!song || !song.events) return;
        if (currentTimer) clearTimeout(currentTimer);
        isPlaying = true;
        currentEventIndex = 0;

        if (typeof window.selectRandomSongVariants === 'function') {
            window.selectRandomSongVariants();
        }
        
        let lastTime = performance.now();
        let accumulatedTicks = 0;
        
        document.getElementById('leftWheel').classList.add('spinning');
        document.getElementById('rightWheel').classList.add('spinning');
        document.getElementById('stereoLed').classList.add('active');
        sendVolumeCC(volumeValue);
        
        currentSectionName = "intro";
        outroStartTick = 0;
        outroBars = song.outroBars || 8;
        
        function tickLoop() {
            if (!isPlaying) return;
            
            const now = performance.now();
            const deltaMs = now - lastTime;
            lastTime = now;
            
            let liveBPM = song.bpm;
            let tapeWobbleProgress = 0;
            
            if (currentSectionName === 'outro') {
                const elapsedTicksInOutro = accumulatedTicks - outroStartTick;
                const outroTotalTicks = outroBars * 4 * 480;
                const progress = Math.min(1.0, Math.max(0, elapsedTicksInOutro / outroTotalTicks));
                
                liveBPM = song.bpm * (1.0 - progress * 0.10); 
                if (liveBPM < 10) liveBPM = 10; 
                
                tapeWobbleProgress = progress;
            }
            
            currentBPM = liveBPM; 
            
            const deltaTicks = deltaMs * liveBPM / 125;
            accumulatedTicks += deltaTicks;
            
            if (selectedOutput && tapeWobbleProgress > 0) {
                const wobbleTime = now / 100;
                const wobbleVal = 8192 + Math.sin(wobbleTime) * 200 * tapeWobbleProgress;
                const lsb = Math.round(wobbleVal) & 0x7F;
                const msb = (Math.round(wobbleVal) >> 7) & 0x7F;
                [1, 2, 3, 4, 7, 10, 11].forEach(ch => {
                    try { selectedOutput.send([0xE0 + (ch - 1), lsb, msb]); } catch(e) {}
                });
            }
            
            while (currentEventIndex < song.events.length && song.events[currentEventIndex].tick <= accumulatedTicks) {
                const ev = song.events[currentEventIndex];
                if (ev) sendMIDIEvent(ev);
                currentEventIndex++;
            }
            
            if (currentEventIndex < song.events.length) {
                currentTimer = setTimeout(tickLoop, 15);
            } else {
                currentTimer = setTimeout(() => { if (isPlaying) generateAndPlayNewSong(); }, 1000);
            }
        }
        
        lastTime = performance.now();
        tickLoop();
    }
    
    function stopPlayback() {
        isPlaying = false;
        if (currentTimer) { clearTimeout(currentTimer); currentTimer = null; }
        document.getElementById('leftWheel').classList.remove('spinning');
        document.getElementById('rightWheel').classList.remove('spinning');
        document.getElementById('stereoLed').classList.remove('active');
        document.getElementById('sectionDisplay').innerText = "PAUSED";
        
        if (typeof window.onMIDIEvent === 'function') {
            activeNotes.forEach(n => {
                window.onMIDIEvent({
                    type: 'note',
                    channel: n.channel,
                    note: n.note,
                    velocity: 0
                });
            });
        }

        if (selectedOutput) {
            activeNotes.forEach(n => { try { selectedOutput.send([0x80 + (n.channel - 1), n.note, 0]); } catch(e) {} });
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(ch => {
                try {
                    selectedOutput.send([0xB0 + (ch - 1), 120, 0]);
                    selectedOutput.send([0xB0 + (ch - 1), 123, 0]);
                    selectedOutput.send([0xE0 + (ch - 1), 0, 64]);
                } catch(e) {}
            });
        }
        activeNotes = [];
    }
    
    async function generateAndPlayNewSong() {
        if (isScanning) return;
        isScanning = true;
        stopPlayback();
        const nextSong = window.generateFullSong();
        currentBPM = nextSong.bpm; // Asetetaan globaali tempo
        const freqEl = document.getElementById('frequency');
        freqEl.classList.add('tuning-glitch');
        document.getElementById('stereoLed').classList.remove('active');
        document.getElementById('status').innerHTML = "📟 ETSITÄÄN TAAJUUTTA... [TUNING]";
        document.getElementById('songTitle').innerText = "📻 SEARCHING... 📻";
        document.getElementById('chordsDisplay').innerHTML = "--- NOISE ---";
        document.getElementById('sectionDisplay').innerText = "TUNING";
        const startFreq = parseFloat(freqEl.innerText) || 87.5;
        const targetFreq = parseFloat(nextSong.frequency);
        const steps = 30; 
        let currentStep = 0;
        const scanTimer = setInterval(() => {
            currentStep++;
            const ratio = currentStep / steps;
            let currentDisplayFreq = startFreq + (targetFreq - startFreq) * ratio;
            if (currentStep < steps) currentDisplayFreq += (Math.random() * 0.8 - 0.4);
            freqEl.innerText = Math.min(107.9, Math.max(87.5, currentDisplayFreq)).toFixed(1) + " FM";
            simulateStaticSpectrum();
            if (currentStep >= steps) {
                clearInterval(scanTimer);
                freqEl.classList.remove('tuning-glitch');
                isScanning = false;
                currentSong = nextSong;
                freqEl.innerText = currentSong.frequency + " FM";
                document.getElementById('songTitle').innerText = currentSong.name;
                document.getElementById('cassetteLabel').innerText = currentSong.name;
                
                const melodyLabel = currentSong.melodyType === "rythmic" ? `Rytmi: ${currentSong.melodyRhythm}` : "Motiivi (Terssi/Seksti)";
                const swingLabel = currentSong.swing > 0 ? `Swing: ${Math.round(currentSong.swing * 100)}%` : "Straight";
                const chordLabel = currentSong.doubleChordDuration ? "Soinnut: 2x kesto" : "Soinnut: Normaali";
                document.getElementById('bpmDisplay').innerHTML = `BPM: ${currentSong.bpm} | Intro: ${currentSong.introType} | Melodia: ${melodyLabel} | ${swingLabel} | ${chordLabel}`;
                
                document.getElementById('chordsDisplay').innerHTML = currentSong.chords;
                document.getElementById('sectionDisplay').innerText = "INTRO";
                document.getElementById('status').innerHTML = `⚡ TRANSMISSION RESTORED • ${currentSong.name} ⚡`;
                playSong(currentSong);
            }
        }, 40);
    }

    function updateSpectrum() {
        document.querySelectorAll('.bar').forEach((bar, idx) => {
            if (barAmplitudes[idx] > 5) {
                barAmplitudes[idx] -= 8; if (barAmplitudes[idx] < 5) barAmplitudes[idx] = 5;
            }
            bar.style.height = barAmplitudes[idx] + '%';
        });
    }
    
    function simulateStaticSpectrum() {
        document.querySelectorAll('.bar').forEach((bar, idx) => {
            const height = window.getRandomInt(45, 100); barAmplitudes[idx] = height;
            bar.style.height = height + '%';
        });
    }
    
    setInterval(() => {
        if (isPlaying && !isScanning) updateSpectrum();
        else if (!isScanning) {
            document.querySelectorAll('.bar').forEach((bar, idx) => {
                if (barAmplitudes[idx] > 5) {
                    barAmplitudes[idx] -= 6; if (barAmplitudes[idx] < 5) barAmplitudes[idx] = 5;
                }
                bar.style.height = barAmplitudes[idx] + '%';
            });
        }
    }, 50);

    function setupDial(dialId, initialVal, onChange) {
        const dial = document.getElementById(dialId);
        let isDragging = false, startY = 0, startVal = initialVal, val = initialVal;
        function updateUI() { dial.style.transform = `rotate(${(30 + val * 300 + 180) % 360}deg)`; }
        updateUI();
        const onStart = (e) => { isDragging = true; startY = e.touches ? e.touches[0].clientY : e.clientY; startVal = val; e.preventDefault(); };
        const onMove = (e) => {
            if (!isDragging) return;
            const currentY = e.touches ? e.touches[0].clientY : e.clientY;
            val = Math.min(1.0, Math.max(0.0, startVal + (startY - currentY) * 0.004));
            updateUI(); onChange(val);
        };
        dial.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', () => isDragging = false);
        dial.addEventListener('touchstart', onStart, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', () => isDragging = false);
    }
    
    function downloadMidi(song) {
        if (!song) return;
        const ticksPerBeat = 480;
        const header = new Uint8Array([0x4D, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x01, 0x00, 0x0B, ticksPerBeat >> 8, ticksPerBeat & 0xFF]);
        let tracks = [];
        const trackNames = { 
            1: "Bass Classic", 2: "Chords (Voice-Led)", 3: "Arpeggio", 4: "Melody Synth", 
            5: "Consonant Runs", 6: "Lead Solo", 7: "Mid-Bass", 8: "Kick Sidechain", 
            9: "Drums & Claps", 10: "Sub-Bass", 11: "Noise FX Sweep" 
        };
        for (let ch = 1; ch <= 11; ch++) {
            let trackEvents = [];
            trackEvents.push({ delta: 0, type: 0xFF, subtype: 0x03, data: Array.from(new TextEncoder().encode(trackNames[ch])) });
            if (ch === 1) {
                const tempoMicro = 60000000 / song.bpm;
                trackEvents.push({ delta: 0, type: 0xFF, subtype: 0x51, data: [(tempoMicro >> 16) & 0xFF, (tempoMicro >> 8) & 0xFF, tempoMicro & 0xFF] });
            }
            for (let ev of song.events) {
                if (ev.channel !== ch || ev.type === 'section') continue;
                if (ev.type === 'note') {
                    trackEvents.push({ delta: ev.tick, type: 0x90, channel: ev.channel, note: ev.note, velocity: ev.velocity });
                    trackEvents.push({ delta: ev.tick + ev.duration, type: 0x80, channel: ev.channel, note: ev.note, velocity: 0 });
                } else if (ev.type === 'cc') {
                    trackEvents.push({ delta: ev.tick, type: 0xB0, channel: ev.channel, controller: ev.controller, value: ev.value });
                } else if (ev.type === 'pitch') {
                    trackEvents.push({ delta: ev.tick, type: 0xE0, channel: ev.channel, value: ev.value });
                }
            }
            trackEvents.sort((a, b) => a.delta - b.delta);
            trackEvents.push({ delta: trackEvents.length ? trackEvents[trackEvents.length-1].delta + 1 : 0, type: 0xFF, subtype: 0x2F, data: [] });
            let trackData = [], lastTick = 0;
            for (let ev of trackEvents) {
                let delta = ev.delta - lastTick; lastTick = ev.delta;
                let buffer = []; let v = delta;
                buffer.push(v & 0x7F); while (v >>= 7) buffer.unshift(0x80 | (v & 0x7F));
                if (ev.type === 0x90 || ev.type === 0x80) buffer.push(ev.type | (ev.channel - 1), ev.note, ev.velocity);
                else if (ev.type === 0xB0) buffer.push(0xB0 | (ev.channel - 1), ev.controller, ev.value);
                else if (ev.type === 0xE0) buffer.push(0xE0 | (ev.channel - 1), ev.value & 0x7F, (ev.value >> 7) & 0x7F);
                else if (ev.type === 0xFF) buffer.push(0xFF, ev.subtype, ev.data.length, ...ev.data);
                trackData.push(...buffer);
            }
            const tHeader = new Uint8Array([0x4D, 0x54, 0x72, 0x6B, trackData.length >> 24, (trackData.length >> 16) & 0xFF, (trackData.length >> 8) & 0xFF, trackData.length & 0xFF]);
            tracks.push(tHeader, new Uint8Array(trackData));
        }
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([header, ...tracks], { type: "audio/midi" }));
        a.download = `${song.name.replace(/ /g, "_")}.mid`; a.click();
    }

    // Space-näppäimen kuuntelija Play/Stop-toiminnolle
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault(); // Estetään sivun oletusarvoinen vieritys
            if (isPlaying) {
                document.getElementById('stopBtn').click();
            } else {
                document.getElementById('playBtn').click();
            }
        }
    });
    
    document.getElementById('playBtn').onclick = () => { if (!isScanning) { if (!currentSong) generateAndPlayNewSong(); else if (!isPlaying) playSong(currentSong); } };
    document.getElementById('stopBtn').onclick = () => { stopPlayback(); document.getElementById('status').innerHTML = "⏹️ TRANSMISSION PAUSED"; };
    document.getElementById('forwardBtn').onclick = () => { generateAndPlayNewSong(); };
    document.getElementById('exportMidiBtn').onclick = () => { if (currentSong) downloadMidi(currentSong); else alert("Luo biisi ensin!"); };
    
    initMIDI();
    setupDial('volDial', 0.8, (val) => { volumeValue = val; document.getElementById('volLabel').innerText = `VOLUME: ${Math.round(val * 100)}%`; sendVolumeCC(val); });
    setupDial('toneDial', 0.5, (val) => { toneValue = val; document.getElementById('toneLabel').innerText = `TONE: ${val < 0.35 ? "DEEP" : val > 0.75 ? "BRIGHT" : "MID"}`; });
}