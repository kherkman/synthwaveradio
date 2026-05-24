function initSynthwaveRadio() {
    const ADJECTIVES = ["NIGHT", "NEON", "LASER", "MEMORY", "SYNTH", "DARK", "FUTURE", "DREAM", 
    "ELECTRIC", "SHADOW", "COSMIC", "RADIO", "VELVET", "CRYSTAL", 
    "PHANTOM", "ARCADE", "MIDNIGHT", "SOLAR", "STELLAR", "CYBER", 
    "MIDNIGHT", "BLAZING", "DISTANT", "GHOSTLY", "LIQUID", "MIRAGE", 
    "NEBULA", "OUTRUN", "RADIO", "SILENT", "THUNDER", "URBAN", "VOID", "WILD", "ZERO", 
    "ANALOG", "DIGITAL", "FROZEN", "HOT", "INFINITE", "JET", "KILLER", "LOST", "LUNAR", "MACHINE", 
    "MYSTIC", "NEON", "PHOENIX", "QUANTUM", "RETRO", "SHADOW", "TITAN", "ULTRA", "VINTAGE", "WAVE", "BACK TO THE", 
    "CYBER", "DARK", "ELECTRIC", "FUTURE", "GHOST", "HYPER", "LASER", "MIDNIGHT"
    ];

    const NOUNS = [ "DRIVE", "WAVE", "GRID", "CITY", "RUN", "HEART", "VOID", "SKY", "DREAMS", 
    "STORM", "PARADISE", "ROADS", "MINDS", "FIRE", "SOUL", "GHOST", "TURBO", 
    "VISION", "ECHO", "SHORE", "BLASTER", "CRUISER", "DANCER", "EMPIRE", "FIGHTER", "GUNNER", "HORIZON",
    "JOURNEY", "KILLER", "LASER", "MOTION", "NIGHTMARE", "ORBIT", "PULSE",
    "QUEST", "RACER", "SPECTRE", "THRUST", "UNIVERSE", "VIPER", "WARRIOR",
    "XENON", "YOUTH", "ZONE", "ADVENTURE", "BLADE", "COSMOS", "DYNAMO", "ENERGY", 
    "FALCON", "GALAXY", "HUNTER", "INFERNO", "JUNGLE", "KINGDOM", "LEGEND", 
    "MIRAGE", "NEXUS", "OBLIVION", "PHOENIX", "QUASAR", "REBEL", "SENTINEL", 
    "TITAN", "ULTIMATE", "VORTEX", "WAVEFORM", "XENON", "ZENITH"
    ];
    
    // Melodian generointityypit
    const MELODY_TYPES = [
        { name: "rythmic", weight: 60 },   // 60% todennäköisyys
        { name: "random", weight: 40 }     // 40% todennäköisyys
    ];

    // Rytmikuviot (kun tyyppi on "rythmic")
    const MELODY_RHYTHMS = {
        "driving":     [1, 0, 0, 1, 0, 0, 1, 0],
        "syncopated":  [1, 0, 1, 0, 0, 1, 0, 1],
        "straight":    [1, 1, 1, 1, 1, 1, 1, 1],
        "half_time":   [1, 0, 0, 0, 1, 0, 0, 0],
        "triplet_feel":[1, 0, 1, 0, 0, 1, 0, 1],
        "dotted":      [1, 0, 0, 1, 0, 0, 0, 1],
        "backbeat":    [0, 0, 1, 0, 0, 0, 1, 0],
        "minimal":     [1, 0, 0, 0, 1, 0, 0, 0],
        "rolling":     [1, 1, 0, 1, 1, 0, 1, 0],
        "offbeat":     [0, 1, 0, 1, 0, 1, 0, 1]
    };

    const SCALES = {
        "c-molli":  { tonic: 0, scale: [0, 2, 3, 5, 7, 8, 10], chordNames: ["Cm", "Ddim", "Eb", "Fm", "Gm", "Ab", "Bb"] },
        "c#-molli": { tonic: 1, scale: [1, 3, 4, 6, 8, 9, 11], chordNames: ["C#m", "D#dim", "E", "F#m", "G#m", "A", "B"] },
        "d-molli":  { tonic: 2, scale: [2, 4, 5, 7, 9, 10, 0], chordNames: ["Dm", "Edim", "F", "Gm", "Am", "Bb", "C"] },
        "e-molli":  { tonic: 4, scale: [4, 6, 7, 9, 11, 0, 2], chordNames: ["Em", "F#dim", "G", "Am", "Bm", "C", "D"] },
        "f-molli":  { tonic: 5, scale: [5, 7, 8, 10, 0, 1, 3], chordNames: ["Fm", "Gdim", "Ab", "Bbm", "Cm", "Db", "Eb"] },
        "f#-molli": { tonic: 6, scale: [6, 8, 9, 11, 1, 2, 4], chordNames: ["F#m", "G#dim", "A", "Bm", "C#m", "D", "E"] },
        "g-molli":  { tonic: 7, scale: [7, 9, 10, 0, 2, 3, 5], chordNames: ["Gm", "Adim", "Bb", "Cm", "Dm", "Eb", "F"] },
        "a-molli":  { tonic: 9, scale: [9, 11, 0, 2, 4, 5, 7], chordNames: ["Am", "Bdim", "C", "Dm", "Em", "F", "G"] },
        "b-molli":  { tonic: 11, scale: [11, 1, 2, 4, 6, 7, 9], chordNames: ["Bm", "C#dim", "D", "Em", "F#m", "G", "A"] }
    };
    
    const PROGRESSION_TYPES = [
        { template: [0, 5, 2, 6], desc: "i - VI - III - VII (Epic Midnight)" },
        { template: [0, 6, 5, 4], desc: "i - VII - VI - v (Retro Desolation)" },
        { template: [0, 3, 5, 6], desc: "i - iv - VI - VII (Lazer Horizon)" },
        { template: [0, 5, 6, 5], desc: "i - VI - VII - VI (Dreaming Void)" },
        { template: [0, 2, 3, 6], desc: "i - III - iv - VII (Neon Sunrise)" },
        { template: [5, 6, 0, 0], desc: "VI - VII - i - i (Hyperdrive Resolution)" },

        { template: [0, 4, 5, 6], desc: "i - v - VI - VII (Darkwave Pulse)" },
        { template: [3, 5, 0, 4], desc: "iv - VI - i - v (Shadow Dance)" },
        { template: [0, 5, 3, 6], desc: "i - VI - iv - VII (Midnight Drive)" },
        { template: [6, 5, 0, 2], desc: "VII - VI - i - III (Neon Twilight)" },
        { template: [0, 6, 3, 5], desc: "i - VII - iv - VI (Electric Dreams)" },

        // Tunnelmalliset
        { template: [0, 6, 5, 5], desc: "i - VII - VI - VI (Atmospheric)" },
        { template: [0, 3, 2, 5], desc: "i - iv - III - VI (Dream sequence)" },
        { template: [0, 0, 5, 5], desc: "i - i - VI - VI (Drone feel)" },
        { template: [0, 5, 0, 6], desc: "i - VI - i - VII" },

        // Energiset
        { template: [5, 6, 0, 4], desc: "VI - VII - i - v (Driving energy)" },
        { template: [0, 5, 4, 5], desc: "i - VI - v - VI (Pumping motion)" },

        // Pidemmät jaksot
        { template: [0, 5, 2, 6, 0, 5, 6, 5], desc: "i - VI - III - VII - i - VI - VII - VI (Extended journey)" }
    ];
    
    const INTRO_STYLES = [
        { name: "filter_fade_in", bars: 8, hasDrums: false, hasArp: true, hasBass: true, padVel: 45 },
        { name: "ambient_sunrise", bars: 8, hasDrums: false, hasArp: false, hasBass: false, padVel: 35 },
        { name: "pumping_drive", bars: 8, hasDrums: true, hasArp: true, hasBass: true, padVel: 55 },
        { name: "minimal_pulse", bars: 8, hasDrums: false, hasArp: true, hasBass: true, padVel: 40 },
        { name: "sixteenth_bass_start", bars: 8, hasDrums: false, hasArp: false, hasBass: true, padVel: 30, sixteenthBass: true }
    ];
    
    const BASS_PATTERNS = {
        "quarter": [1, 0, 0, 0],
        "eighth": [1, 0, 1, 0],
        "sixteenth": [1, 1, 1, 1],
        "sixteenth_sync": [1, 0, 1, 1],
        "driving": [1, 1, 0, 1]
    };

    // KICK DRUM PATTERNS (32-step patterns for 2 bars)
    const KICK_PATTERNS = {
        // 2-bar patterns (32 sixteenth notes)
        "sparse_quarter": [1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0],
        "driving_eighth": [1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,1,0,0,1,0],
        "syncopated": [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,1,0],
        "double_kick": [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,1,0, 0,0,0,0],
        "half_time": [1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0],
        "sixteenth_run": [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
        "breakbeat": [1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,1,0]
    };

    const RUN_PATTERNS = [
        { name: "ascending", notes: [0, 2, 4, 5, 7, 9, 11, 12], duration: 0.125 },
        { name: "descending", notes: [12, 10, 9, 7, 5, 4, 2, 0], duration: 0.125 },
        { name: "wave", notes: [0, 2, 4, 5, 7, 5, 4, 2, 0], duration: 0.125 }
    ];
    
    const BRIDGE_STYLES = ["retro_breakdown", "space_sweep", "arp_kick_build"];
    
    function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function getRandomFloat(min, max) { return min + Math.random() * (max - min); }
    
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

        // Lähetetään CC 7 (Volume) WAV-äänimoottorille globaalia tasonsäätöä varten
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

    function getRandomKickPattern() {
        const patternNames = Object.keys(KICK_PATTERNS);
        const patternName = getRandomItem(patternNames);
        return {
            name: patternName,
            pattern: KICK_PATTERNS[patternName]
        };
    }

    // Valitse tiettyjen kuvioiden välillä (esim. vain kaksi haluamaasi)
    function getSpecificKickPatterns() {
        const myPatterns = [
            { name: "sparse_quarter", pattern: [1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0] },
            { name: "driving_eighth", pattern: [1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,1,0,0,1,0] }
        ];
        return getRandomItem(myPatterns);
    }
    
    function getChordNotes(scaleInfo, chordRootOffset, octave) {
        const scale = scaleInfo.scale;
        const tonic = scaleInfo.tonic;
        const rootIndex = chordRootOffset % 7;
        const thirdIndex = (rootIndex + 2) % 7;
        const fifthIndex = (rootIndex + 4) % 7;
        return [
            tonic + scale[rootIndex] + (octave * 12),
            tonic + scale[thirdIndex] + (octave * 12),
            tonic + scale[fifthIndex] + (octave * 12)
        ];
    }

    /**
     * UNELMOIVAT SOINTUVOICINGIT
     */
    function getDreamyVoiceLedChord(scaleInfo, chordRootOffset, targetOctave, prevChordNotes) {
        const scale = scaleInfo.scale;
        const tonic = scaleInfo.tonic;
        
        const rIdx = chordRootOffset % 7;
        const tIdx = (rIdx + 2) % 7;
        const fIdx = (rIdx + 4) % 7;
        
        // VAIN KOLMISOINTU: perussävel, terssi, kvintti
        const rPitch = (tonic + scale[rIdx]) % 12;
        const tPitch = (tonic + scale[tIdx]) % 12;
        const fPitch = (tonic + scale[fIdx]) % 12;
        
        let notes = [rPitch, tPitch, fPitch].map(p => {
            let note = p + 60; // C5 = MIDI 60
            while (note < 60) note += 12;
            while (note > 83) note -= 12;
            return note;
        });
        
        notes.sort((a, b) => a - b);
        
        if (prevChordNotes && prevChordNotes.length === notes.length) {
            for (let i = 0; i < notes.length; i++) {
                let cand1 = notes[i];
                let cand2 = notes[i] - 12;
                let cand3 = notes[i] + 12;
                
                let target = prevChordNotes[i];
                let best = cand1;
                let minD = Math.abs(cand1 - target);
                
                if (cand2 >= 52 && Math.abs(cand2 - target) < minD) {
                    best = cand2;
                    minD = Math.abs(cand2 - target);
                }
                if (cand3 <= 92 && Math.abs(cand3 - target) < minD) {
                    best = cand3;
                    minD = Math.abs(cand3 - target);
                }
                notes[i] = best;
            }
            notes.sort((a, b) => a - b);
        }
        
        return notes;
    }
    
    // ========== MELODY GENERATOR WITH MOTIF REPETITION AND THIRDS/SIXTHS FOCUS ==========
    function generateMelody(scaleInfo, chordProg, totalBars, startBeat, sectionType, melodyType = "random", melodyRhythmName = "driving") {
        const ticksPerBeat = 480;
        const events = [];
        if (sectionType === "intro" || sectionType === "bridge") return events;

        const tonic = scaleInfo.tonic;
        const scaleOffsets = scaleInfo.scale;

        function getMidiFromScaleIndex(scaleIndex, oct) {
            const len = scaleOffsets.length;
            let normalizedIndex = scaleIndex % len;
            let octaveOffset = Math.floor(scaleIndex / len);
            if (normalizedIndex < 0) {
                normalizedIndex += len;
                octaveOffset -= 1;
            }
            return tonic + scaleOffsets[normalizedIndex] + (oct + octaveOffset) * 12;
        }

        // Luodaan 4 tahdin fraasi (motiivi) ja toistetaan sitä toistuvan rakenteen luomiseksi
        const phraseBars = 4;
        const numPhrases = Math.ceil(totalBars / phraseBars);
        const phraseEvents = [];
        const stepDurationBeats = 0.5;

        // Intervallit: terssit (+2/-2) ja kvintit (+4/-4), kvartit (+3/-3)
        const allowedSteps = [1, -1, 2, -2, 3, -3, 0];  

        if (melodyType === "rythmic") {
            const pattern = MELODY_RHYTHMS[melodyRhythmName] || MELODY_RHYTHMS["driving"];
            let currentScaleDegree = chordProg[0] || 0;
            
            for (let bar = 0; bar < phraseBars; bar++) {
                const activeSteps = [];
                for (let i = 0; i < pattern.length; i++) {
                    if (pattern[i] === 1) activeSteps.push(i);
                }
                
                for (let i = 0; i < activeSteps.length; i++) {

                    // Jätetään nuotti soittamatta 20 % todennäköisyydellä, mikä luo rytmiin tyhjän kohdan (tauon)
                    if (Math.random() < 0.20) {
                        continue;
                    }

                    const stepIdx = activeSteps[i];
                    const nextStepIdx = (i + 1 < activeSteps.length) ? activeSteps[i + 1] : pattern.length;
                    const durationBeats = (nextStepIdx - stepIdx) * stepDurationBeats;
                    
                    const stepBeatInBar = stepIdx * stepDurationBeats;
                    const relativeBeat = (bar * 4) + stepBeatInBar;
                    
                    const step = getRandomItem(allowedSteps);
                    currentScaleDegree += step;
                    if (currentScaleDegree < 0) currentScaleDegree += 7;
                    if (currentScaleDegree > 14) currentScaleDegree -= 7;
                    
                    // Synthwave-tyylinen oktaavivalinta: kertosäkeessä oktaavi 4, säkeistössä oktaavi 3-4
                    let baseOctave = 4; // Oletus oktaavi 4 (keskialue)
                    if (sectionType === "chorus" || sectionType === "chorus2") {
                        baseOctave = 4; // Kertosäkeessä pysytään oktaavilla 4 (ei liian korkealla)
                    } else if (sectionType === "verse" || sectionType === "verse2") {
                        baseOctave = Math.random() < 0.6 ? 4 : 3; // 60% oktaavi 4, 40% oktaavi 3
                    }
                    
                    let midiNote = getMidiFromScaleIndex(currentScaleDegree, baseOctave);

                    // Jos sävel ylittää ylärajan, madalletaan sitä oktaavi (12 sävelaskelta) kerrallaan
                    while (midiNote > 83) {
                        midiNote -= 12;
                    }
                    // Vastaavasti jos se alittaa alarajan, nostetaan sitä oktaavi kerrallaan
                    while (midiNote < 36) {
                        midiNote += 12;
                    }

                    const cappedNote = midiNote;
                    
                    let velocity = (sectionType === "chorus" || sectionType === "chorus2") ? 95 : 82;
                    velocity += getRandomInt(-5, 5);
                    
                    phraseEvents.push({
                        beatOffset: relativeBeat,
                        note: cappedNote,
                        velocity: velocity,
                        durationBeats: durationBeats
                    });
                }
            }
        } else {
            // Vapaampi motiivi, suosii edelleen samoja intervalleja (terssejä ja sekstejä)
            let currentScaleDegree = chordProg[0] || 0;
            let beat = 0;
            const maxBeats = phraseBars * 4; 
            
            while (beat < maxBeats) {
                // 1. PIDEMMÄT NUOTIT: Lisätty 4.0 ja 6.0 iskun pituudet valikoimaan
                let duration = getRandomItem([1.0, 1.5, 2.0, 3.0, 4.0, 6.0]);
                if (beat + duration > maxBeats) {
                    duration = maxBeats - beat;
                }
                
                // 2. TAUKO: 25 % todennäköisyys, että nuotin sijaan pidetäänkin tauko
                const isRest = Math.random() < 0.25;
                
                if (isRest) {
                    // Siirretään aikajanaa eteenpäin ilman, että luodaan nuottia
                    beat += duration;
                    continue;
                }
                
                const step = getRandomItem(allowedSteps);
                currentScaleDegree += step;

                // Korjattu relativeBeat-bugi käyttämään oikeaa 'beat'-muuttujaa:
                const chordIdx = Math.floor(beat / 4) % chordProg.length;
                const currentChordRoot = chordProg[chordIdx];
                currentScaleDegree = (currentChordRoot + (currentScaleDegree % 7)) % 7;
                
                const baseOctave = (sectionType === "chorus" || sectionType === "chorus2") ? 5 : 4;
                let midiNote = getMidiFromScaleIndex(currentScaleDegree, baseOctave);
                
                // Oktaavikorjaus (leikkauksen sijaan)
                while (midiNote > 83) midiNote -= 12;
                while (midiNote < 36) midiNote += 12;
                
                let velocity = (sectionType === "chorus" || sectionType === "chorus2") ? 95 : 82;
                velocity += getRandomInt(-5, 5);
                
                phraseEvents.push({
                    beatOffset: beat,
                    note: midiNote,
                    velocity: velocity,
                    durationBeats: duration
                });
                
                beat += duration;
            }
        }
        
        // Kopioidaan luotu fraasi motiivin tavoin toistetusti koko section pituudelle
        for (let p = 0; p < numPhrases; p++) {
            const phraseStartBeat = startBeat + (p * phraseBars * 4);
            phraseEvents.forEach(pe => {
                const absoluteBeat = phraseStartBeat + pe.beatOffset;
                const tick = absoluteBeat * ticksPerBeat;
                const durationTicks = pe.durationBeats * ticksPerBeat - 10;
                
                if (absoluteBeat < startBeat + totalBars * 4) {
                    events.push({
                        tick,
                        type: 'note',
                        channel: 4, // Melody Synth (Plays melody.wav now!)
                        note: pe.note,
                        velocity: pe.velocity,
                        duration: durationTicks
                    });
                }
            });
        }

        return events;
    }
    
    // ========== DYNAMIC SOLO LEAD SYNTH WITH RUNS, PITCH BEND, CC1 VIBRATO & CC11 CRESCENDO (Ch6) ==========
    function generateSolo(scaleInfo, chordProg, totalBars, startBeat) {
        const ticksPerBeat = 480;
        const events = [];
        const tonic = scaleInfo.tonic;
        const scaleOffsets = scaleInfo.scale;

        function getMidi(scaleIndex, oct) {
            const len = scaleOffsets.length;
            let norm = scaleIndex % len;
            let octOff = Math.floor(scaleIndex / len);
            if (norm < 0) { norm += len; octOff -= 1; }
            return tonic + scaleOffsets[norm] + (oct + octOff) * 12;
        }

        let beat = 0;
        const maxBeats = totalBars * 4;

        while (beat < maxBeats) {
            const chordIdx = Math.floor(beat / 4) % chordProg.length;
            const currentChordRoot = chordProg[chordIdx];

            const phraseType = getRandomItem(["long_bend", "fast_run", "rest"]);

            if (phraseType === "long_bend") {
                const durationBeats = getRandomItem([2.0, 3.0]);
                if (beat + durationBeats > maxBeats) break;

                const tick = (startBeat + beat) * ticksPerBeat;
                const durationTicks = durationBeats * ticksPerBeat - 10;

                const degree = getRandomItem([0, 2, 4, 6, 7]);
                const note = getMidi(currentChordRoot + degree, 5); 

                let targetNote = note; 
                while (targetNote > 83) {
                    targetNote -= 12;
                }
                while (targetNote < 36) {
                    targetNote += 12;
                }
                const cappedNote = targetNote;

                events.push({
                    tick,
                    type: 'note',
                    channel: 6, // Lead Solo (Plays lead.wav now!)
                    note: cappedNote,
                    velocity: 95,
                    duration: durationTicks
                });

                // Perinteinen Pitch bend (Vaikuttaa lead.wav soittoon!)
                events.push({ tick: tick, type: 'pitch', channel: 6, value: 8192 });
                events.push({ tick: tick + durationTicks * 0.15, type: 'pitch', channel: 6, value: 8192 });
                events.push({ tick: tick + durationTicks * 0.45, type: 'pitch', channel: 6, value: 9500 });
                events.push({ tick: tick + durationTicks * 0.75, type: 'pitch', channel: 6, value: 8192 });
                events.push({ tick: tick + durationTicks - 5, type: 'pitch', channel: 6, value: 8192 }); 

                // CC1 Vibrato modulaatiopyörällä soolon loppupuoliskolla
                events.push({ tick: tick, type: 'cc', channel: 6, controller: 1, value: 0 });
                events.push({ tick: tick + durationTicks * 0.5, type: 'cc', channel: 6, controller: 1, value: 0 });
                events.push({ tick: tick + durationTicks * 0.7, type: 'cc', channel: 6, controller: 1, value: 35 });
                events.push({ tick: tick + durationTicks * 0.85, type: 'cc', channel: 6, controller: 1, value: 90 });
                events.push({ tick: tick + durationTicks - 5, type: 'cc', channel: 6, controller: 1, value: 0 });

                // CC11 Crescendo -efekti dynaamisesti soolon aikana (aloitetaan tasolta 40, kasvaa arvoon 127)
                const steps = 8;
                for (let s = 0; s <= steps; s++) {
                    const stepTick = tick + Math.floor((s / steps) * durationTicks * 0.85);
                    const crescVal = 40 + Math.floor((s / steps) * 87);
                    events.push({ tick: stepTick, type: 'cc', channel: 6, controller: 11, value: crescVal });
                }
                events.push({ tick: tick + durationTicks - 5, type: 'cc', channel: 6, controller: 11, value: 127 });

                beat += durationBeats;

            } else if (phraseType === "fast_run") {
                const runBeats = 2.0;
                if (beat + runBeats > maxBeats) break;

                const startTick = (startBeat + beat) * ticksPerBeat;
                const direction = getRandomItem(["up", "down"]);
                
                for (let i = 0; i < 8; i++) {
                    const stepTick = startTick + (i * ticksPerBeat / 4);
                    const degreeOffset = direction === "up" ? i : (7 - i);
                    const note = getMidi(currentChordRoot + degreeOffset, 5);

                    let targetNote = note; 
                    while (targetNote > 83) {
                        targetNote -= 12;
                    }
                    while (targetNote < 36) {
                        targetNote += 12;
                    }
                    const cappedNote = targetNote;

                    events.push({
                        tick: stepTick,
                        type: 'note',
                        channel: 6, // Lead Solo (Plays lead.wav now!)
                        note: cappedNote,
                        velocity: 82,
                        duration: (ticksPerBeat / 4) - 5
                    });
                }
                events.push({ tick: startTick, type: 'pitch', channel: 6, value: 8192 });
                
                beat += runBeats;

            } else {
                beat += 1.0; 
            }
        }
        return events;
    }
    
    // ========== ARPEGGIATOR WITH DIVERSE PATTERNS, LOWER OCTAVES & SWING/SHUFFLE ==========
    function generateArpeggio(scaleInfo, chordRoot, baseOctave, bars, startTick, ticksPerBeat, style, swingAmount = 0) {
        const events = [];
        
        // Määritetään matalampi oktaavi useammin (40% oktaavi 3, 40% oktaavi 4, 20% oktaavi 5)
        const randVal = Math.random();
        const finalOctave = (randVal < 0.4) ? 3 : (randVal < 0.8) ? 4 : 5;

        const chordNotes = getChordNotes(scaleInfo, chordRoot, finalOctave);
        
        const r0 = chordNotes[0], t0 = chordNotes[1], f0 = chordNotes[2];
        const r1 = r0 + 12, t1 = t0 + 12, f1 = f0 + 12;
        const r2 = r1 + 12;

        let pattern = [];
        if (style === "cyber_chase") {
            pattern = [r0, f0, t1, r1, f1, r2, f1, r1];
        } else if (style === "space_bounce") {
            pattern = [r0, r1, t0, t1, f0, f1, t1, r1];
        } else if (style === "neon_pulse") {
            pattern = [r0, r0, t0, t0, f0, f0, t0, t0];
        } else if (style === "retro_sweep") {
            pattern = [r0, t0, f0, r1, t1, f1, r2, t1];
        } else if (style === "driving_octaves") {
            pattern = [r0, r0 + 12, r0, r0 + 12, t0, t0 + 12, f0, f0 + 12];
        } else {
            pattern = [r0, t0, f0, r1, t1, r1, f0, t0];
        }

        const noteDuration = (ticksPerBeat / 4) * 0.85;

        for (let bar = 0; bar < bars; bar++) {
            const barTick = startTick + (bar * 4 * ticksPerBeat);
            for (let sixteenth = 0; sixteenth < 16; sixteenth++) {
                const note = pattern[sixteenth % pattern.length];
                let tick = barTick + (sixteenth * ticksPerBeat / 4);
                
                // Swing/Shuffle -siirtymä parittomille 16-osanuoteille
                if (sixteenth % 2 === 1) {
                    tick += (ticksPerBeat / 4) * swingAmount;
                }
                
                const isStrongBeat = (sixteenth % 4 === 0);
                let velocity = isStrongBeat ? 64 : 48;
                velocity += getRandomInt(-5, 5);

                events.push({ 
                    tick, 
                    type: 'note', 
                    channel: 3, // Arpeggio Ch3
                    note: Math.min(127, Math.max(0, note)), 
                    velocity, 
                    duration: noteDuration 
                });
            }
        }
        return events;
    }
    
    // ========== CLEAN MELODIC FILL GENERATOR (Ch5) ==========
    function generateDynamicMelodicFill(scaleInfo, chordRoot, nextChordRoot, barMelody, startTick, ticksPerBeat) {
        const events = [];
        const fillStartTick = startTick + (ticksPerBeat * 3); 
        
        const currentChordNotes = getChordNotes(scaleInfo, chordRoot, 5); 
        const nextChordNotes = getChordNotes(scaleInfo, nextChordRoot, 5); 

        const styles = ["arpeggiated_run", "syncopated_triad", "suspension_resolve_clean"];
        const chosenStyle = getRandomItem(styles);

        if (chosenStyle === "arpeggiated_run") {
            const notes = [
                currentChordNotes[0],
                currentChordNotes[1],
                currentChordNotes[2],
                currentChordNotes[0] + 12
            ];
            for (let i = 0; i < 4; i++) {
                events.push({
                    tick: fillStartTick + (i * ticksPerBeat / 4),
                    type: 'note',
                    channel: 5,
                    note: notes[i],
                    velocity: 80,
                    duration: (ticksPerBeat / 4) - 10
                });
            }
        } else if (chosenStyle === "syncopated_stutter" || chosenStyle === "syncopated_triad") {
            events.push({
                tick: fillStartTick,
                type: 'note',
                channel: 5,
                note: currentChordNotes[1], 
                velocity: 82,
                duration: ticksPerBeat / 2 - 10
            });
            events.push({
                tick: fillStartTick + ticksPerBeat / 2,
                type: 'note',
                channel: 5,
                note: currentChordNotes[2], 
                velocity: 85,
                duration: ticksPerBeat / 2 - 10
            });
        } else if (chosenStyle === "suspension_resolve_clean") {
            events.push({
                tick: fillStartTick,
                type: 'note',
                channel: 5,
                note: currentChordNotes[2], 
                velocity: 80,
                duration: ticksPerBeat / 2 - 10
            });
            events.push({
                tick: fillStartTick + ticksPerBeat / 2,
                type: 'note',
                channel: 5,
                note: nextChordNotes[0], 
                velocity: 85,
                duration: ticksPerBeat / 2 - 10
            });
        }

        return events;
    }

    // ========== DYNAMIC DRUM FILL GENERATOR WITH DESCENDING TOMS ==========
    function addDynamicTomFill(events, startTick, ticksPerBeat, intensity) {
        const styles = ["simmons_cascade", "snare_build", "syncopated_stutter", "descending_toms"];
        const chosenStyle = getRandomItem(styles);

        if (chosenStyle === "descending_toms") {
            // Laskeva tom-filli (korkea -> matala) tahdin iskuilla ja väleillä
            events.push({ tick: startTick, type: 'note', channel: 9, note: 36, velocity: 100 * intensity, duration: ticksPerBeat });
            // High Tom
            events.push({ tick: startTick + ticksPerBeat, type: 'note', channel: 9, note: 50, velocity: 85 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: startTick + ticksPerBeat + ticksPerBeat / 2, type: 'note', channel: 9, note: 48, velocity: 85 * intensity, duration: ticksPerBeat / 4 });
            // Mid Tom
            events.push({ tick: startTick + ticksPerBeat * 2, type: 'note', channel: 9, note: 45, velocity: 90 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: startTick + ticksPerBeat * 2 + ticksPerBeat / 2, type: 'note', channel: 9, note: 43, velocity: 90 * intensity, duration: ticksPerBeat / 4 });
            // Floor Tom ja slammi
            events.push({ tick: startTick + ticksPerBeat * 3, type: 'note', channel: 9, note: 41, velocity: 95 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: startTick + ticksPerBeat * 3 + ticksPerBeat / 2, type: 'note', channel: 9, note: 38, velocity: 105 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: startTick + ticksPerBeat * 3 + ticksPerBeat / 2, type: 'note', channel: 9, note: 36, velocity: 110 * intensity, duration: ticksPerBeat / 4 });

        } else if (chosenStyle === "simmons_cascade") {
            events.push({ tick: startTick, type: 'note', channel: 9, note: 36, velocity: 95 * intensity, duration: ticksPerBeat / 2 });
            events.push({ tick: startTick + ticksPerBeat, type: 'note', channel: 9, note: 38, velocity: 90 * intensity, duration: ticksPerBeat / 2 });
            
            const t3 = startTick + ticksPerBeat * 2;
            events.push({ tick: t3, type: 'note', channel: 9, note: 50, velocity: 85 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: t3 + ticksPerBeat / 4, type: 'note', channel: 9, note: 50, velocity: 80 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: t3 + ticksPerBeat / 2, type: 'note', channel: 9, note: 48, velocity: 85 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: t3 + 3 * ticksPerBeat / 4, type: 'note', channel: 9, note: 48, velocity: 80 * intensity, duration: ticksPerBeat / 4 });
            
            const t4 = startTick + ticksPerBeat * 3;
            events.push({ tick: t4, type: 'note', channel: 9, note: 45, velocity: 90 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: t4 + ticksPerBeat / 4, type: 'note', channel: 9, note: 43, velocity: 90 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: t4 + ticksPerBeat / 2, type: 'note', channel: 9, note: 41, velocity: 95 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: t4 + 3 * ticksPerBeat / 4, type: 'note', channel: 9, note: 36, velocity: 100 * intensity, duration: ticksPerBeat / 8 });

        } else if (chosenStyle === "snare_build") {
            events.push({ tick: startTick, type: 'note', channel: 9, note: 36, velocity: 95 * intensity, duration: ticksPerBeat / 2 });
            events.push({ tick: startTick, type: 'note', channel: 9, note: 38, velocity: 60 * intensity, duration: ticksPerBeat / 2 });
            
            events.push({ tick: startTick + ticksPerBeat, type: 'note', channel: 9, note: 38, velocity: 70 * intensity, duration: ticksPerBeat / 2 });
            events.push({ tick: startTick + ticksPerBeat + ticksPerBeat / 2, type: 'note', channel: 9, note: 38, velocity: 75 * intensity, duration: ticksPerBeat / 2 });
            
            const t3 = startTick + ticksPerBeat * 2;
            for (let i = 0; i < 4; i++) {
                events.push({ tick: t3 + i * ticksPerBeat / 4, type: 'note', channel: 9, note: 38, velocity: (80 + i * 5) * intensity, duration: ticksPerBeat / 8 });
            }
            
            const t4 = startTick + ticksPerBeat * 3;
            events.push({ tick: t4, type: 'note', channel: 9, note: 50, velocity: 90 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: t4 + ticksPerBeat / 4, type: 'note', channel: 9, note: 48, velocity: 90 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: t4 + ticksPerBeat / 2, type: 'note', channel: 9, note: 38, velocity: 105 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: t4 + 3 * ticksPerBeat / 4, type: 'note', channel: 9, note: 36, velocity: 110 * intensity, duration: ticksPerBeat / 8 });

        } else if (chosenStyle === "syncopated_stutter") {
            events.push({ tick: startTick, type: 'note', channel: 9, note: 36, velocity: 100 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: startTick + ticksPerBeat / 2, type: 'note', channel: 9, note: 38, velocity: 95 * intensity, duration: ticksPerBeat / 4 });
            
            events.push({ tick: startTick + ticksPerBeat, type: 'note', channel: 9, note: 36, velocity: 100 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: startTick + ticksPerBeat * 1.5, type: 'note', channel: 9, note: 48, velocity: 90 * intensity, duration: ticksPerBeat / 4 });
            
            events.push({ tick: startTick + ticksPerBeat * 2, type: 'note', channel: 9, note: 45, velocity: 90 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: startTick + ticksPerBeat * 2.5, type: 'note', channel: 9, note: 41, velocity: 95 * intensity, duration: ticksPerBeat / 4 });
            
            events.push({ tick: startTick + ticksPerBeat * 3, type: 'note', channel: 9, note: 38, velocity: 100 * intensity, duration: ticksPerBeat / 4 });
            events.push({ tick: startTick + ticksPerBeat * 3.5, type: 'note', channel: 9, note: 36, velocity: 110 * intensity, duration: ticksPerBeat / 4 });
        }
    }
    
    // ========== DYNAMIC INTRO GENERATOR ==========
    function generateIntro(scaleInfo, chordRoot, introStyle, startTick, ticksPerBeat, arpStyle, drumsFirst, bassMode, swingAmount = 0) {
        const events = [];
        const chordNotes = getDreamyVoiceLedChord(scaleInfo, chordRoot, 4, null); 
        
        if (drumsFirst) {
            const halfBars = Math.floor(introStyle.bars / 2);
            for (let bar = 0; bar < introStyle.bars; bar++) {
                const barTick = startTick + bar * 4 * ticksPerBeat;
                events.push({ tick: barTick, type: 'note', channel: 9, note: 36, velocity: 85, duration: ticksPerBeat / 2 });
                events.push({ tick: barTick + ticksPerBeat * 2, type: 'note', channel: 9, note: 36, velocity: 85, duration: ticksPerBeat / 2 });
                events.push({ tick: barTick + ticksPerBeat, type: 'note', channel: 9, note: 38, velocity: 75, duration: ticksPerBeat / 2 });
                events.push({ tick: barTick + ticksPerBeat * 3, type: 'note', channel: 9, note: 38, velocity: 75, duration: ticksPerBeat / 2 });
                
                for (let h = 0; h < 8; h++) {
                    events.push({ tick: barTick + h * ticksPerBeat / 2, type: 'note', channel: 9, note: 42, velocity: 55, duration: ticksPerBeat / 8 });
                }
            }
            
            const activeBars = introStyle.bars - halfBars;
            const activeStartTick = startTick + (halfBars * 4 * ticksPerBeat);
            
            chordNotes.forEach(note => {
                events.push({ tick: activeStartTick, type: 'note', channel: 2, note, velocity: introStyle.padVel, duration: ticksPerBeat * activeBars * 4 });
            });
            
            if (introStyle.hasBass) {
                const bassNoteLow = chordNotes[0] - 12;
                const bassNoteHigh = chordNotes[0];
                if (introStyle.sixteenthBass) {
                    const totalSteps = activeBars * 16;
                    for (let i = 0; i < totalSteps; i++) {
                        const tick = activeStartTick + i * (ticksPerBeat / 4);
                        if (bassMode === "split") {
                            events.push({ tick: tick, type: 'note', channel: 10, note: bassNoteLow, velocity: 75, duration: ticksPerBeat / 6 });
                            events.push({ tick: tick, type: 'note', channel: 7, note: bassNoteHigh, velocity: 65, duration: ticksPerBeat / 6 });
                        } else {
                            events.push({ tick: tick, type: 'note', channel: 1, note: bassNoteLow, velocity: 70, duration: ticksPerBeat / 6 });
                        }
                    }
                } else {
                    for (let i = 0; i < activeBars * 4; i++) {
                        if (bassMode === "split") {
                            events.push({ tick: activeStartTick + i * ticksPerBeat, type: 'note', channel: 10, note: bassNoteLow, velocity: 70, duration: ticksPerBeat / 2 });
                            events.push({ tick: activeStartTick + i * ticksPerBeat, type: 'note', channel: 7, note: bassNoteHigh, velocity: 60, duration: ticksPerBeat / 2 });
                        } else {
                            events.push({ tick: activeStartTick + i * ticksPerBeat, type: 'note', channel: 1, note: bassNoteLow, velocity: 65, duration: ticksPerBeat / 2 });
                        }
                    }
                }
            }
            
            if (introStyle.hasArp) {
                const arpEvents = generateArpeggio(scaleInfo, chordRoot, 5, activeBars, activeStartTick, ticksPerBeat, arpStyle, swingAmount);
                events.push(...arpEvents);
            }
            
        } else {
            chordNotes.forEach(note => {
                events.push({ tick: startTick, type: 'note', channel: 2, note, velocity: introStyle.padVel, duration: ticksPerBeat * introStyle.bars * 4 });
            });
            
            if (introStyle.hasBass) {
                const bassNoteLow = chordNotes[0] - 12;
                const bassNoteHigh = chordNotes[0];
                if (introStyle.sixteenthBass) {
                    const totalSteps = introStyle.bars * 16;
                    for (let i = 0; i < totalSteps; i++) {
                        const tick = startTick + i * (ticksPerBeat / 4);
                        if (bassMode === "split") {
                            events.push({ tick: tick, type: 'note', channel: 10, note: bassNoteLow, velocity: 75, duration: ticksPerBeat / 6 });
                            events.push({ tick: tick, type: 'note', channel: 7, note: bassNoteHigh, velocity: 65, duration: ticksPerBeat / 6 });
                        } else {
                            events.push({ tick: tick, type: 'note', channel: 1, note: bassNoteLow, velocity: 70, duration: ticksPerBeat / 6 });
                        }
                    }
                } else {
                    for (let i = 0; i < introStyle.bars * 4; i++) {
                        if (bassMode === "split") {
                            events.push({ tick: startTick + i * ticksPerBeat, type: 'note', channel: 10, note: bassNoteLow, velocity: 70, duration: ticksPerBeat / 2 });
                            events.push({ tick: startTick + i * ticksPerBeat, type: 'note', channel: 7, note: bassNoteHigh, velocity: 60, duration: ticksPerBeat / 2 });
                        } else {
                            events.push({ tick: startTick + i * ticksPerBeat, type: 'note', channel: 1, note: bassNoteLow, velocity: 65, duration: ticksPerBeat / 2 });
                        }
                    }
                }
            }
            
            if (introStyle.hasArp) {
                const arpEvents = generateArpeggio(scaleInfo, chordRoot, 5, introStyle.bars, startTick, ticksPerBeat, arpStyle, swingAmount);
                events.push(...arpEvents);
            }

            if (introStyle.hasDrums) {
                const enableIntroFill = Math.random() < 0.8; 
                const drumBars = enableIntroFill ? (introStyle.bars - 1) : introStyle.bars;
                for (let bar = 0; bar < drumBars; bar++) {
                    const barTick = startTick + bar * 4 * ticksPerBeat;
                    events.push({ tick: barTick, type: 'note', channel: 9, note: 36, velocity: 50, duration: ticksPerBeat / 2 });
                }
                if (enableIntroFill) {
                    const lastBarTick = startTick + (introStyle.bars - 1) * 4 * ticksPerBeat;
                    addDynamicTomFill(events, lastBarTick, ticksPerBeat, 0.85);
                }
            }

            const enableIntroHats = Math.random() < 0.85; 
            if (enableIntroHats && introStyle.bars >= 6) {
                const startBarForHats = Math.floor(introStyle.bars / 2);
                for (let bar = startBarForHats; bar < introStyle.bars; bar++) {
                    const barTick = startTick + bar * 4 * ticksPerBeat;
                    for (let eighth = 0; eighth < 8; eighth++) {
                        events.push({
                            tick: barTick + eighth * ticksPerBeat / 2,
                            type: 'note',
                            channel: 9,
                            note: 42, 
                            velocity: 52 + (eighth % 2 === 0 ? 12 : 0),
                            duration: ticksPerBeat / 8
                        });
                    }
                }
            }
        }
        return events;
    }
    
    // ========== MAIN SONG GENERATION ENGINE ==========
    function generateFullSong() {
        const scaleKey = getRandomItem(Object.keys(SCALES));
        const scaleInfo = SCALES[scaleKey];
        const progType = getRandomItem(PROGRESSION_TYPES);
        
        const kickPattern = getRandomKickPattern();
        
        const chordProg = [];
        const chordNames = [];
        for (let i = 0; i < progType.template.length; i++) {
            let offset = progType.template[i % progType.template.length];
            offset = Math.min(Math.max(offset, 0), 6);
            chordProg.push(offset);
            chordNames.push(scaleInfo.chordNames[offset]);
        }
        
        const introStyle = getRandomItem(INTRO_STYLES);
        const bridgeStyle = getRandomItem(BRIDGE_STYLES);
        
        const structure = {
            intro: introStyle.bars,
            verse: getRandomInt(12, 16),
            chorus: getRandomInt(12, 16),
            verse2: getRandomInt(12, 16),
            chorus2: getRandomInt(12, 16),
            bridge: getRandomInt(8, 12),
            outro: getRandomInt(8, 12)
        };
        
        const tempo = getRandomInt(88, 112);
        currentBPM = tempo;
        const defaultBassPatternName = getRandomItem(Object.keys(BASS_PATTERNS));
        const runPattern = getRandomItem(RUN_PATTERNS);
        const arpStyle = getRandomItem(["classic_up_down", "cyber_chase", "space_bounce", "neon_pulse", "retro_sweep", "driving_octaves"]);
        
        const songHasClap = Math.random() < 0.6; 
        const drumsFirstIntro = Math.random() < 0.25; 
        const songHasStop = Math.random() < 0.35; 
        const fadeOutChorus = Math.random() < 0.4; 
        const bassMode = Math.random() < 0.45 ? "split" : "classic"; 

        // Swing/Shuffle-voimakkuus arpeggiota varten
        const swingAmount = getRandomItem([0, 0, 0.2, 0.33, 0.45]);

        // Valitaan melodian tyyppi painotuksen mukaan (Rhythmic 60% / Random 40%)
        const rollType = Math.random() * 100;
        let melodyType = "random";
        if (rollType < 60) {
            melodyType = "rythmic";
        }
        const melodyRhythmName = getRandomItem(Object.keys(MELODY_RHYTHMS));

        const ticksPerBeat = 480;
        let allEvents = [];
        
        const sections = [
            { name: "intro", bars: structure.intro, type: "intro", isIntro: true },
            { name: "verse", bars: structure.verse, type: "verse" },
            { name: "chorus", bars: structure.chorus, type: "chorus" },
            { name: "verse2", bars: structure.verse2, type: "verse" },
            { name: "chorus2", bars: structure.chorus2, type: "chorus" },
            { name: "bridge", bars: structure.bridge, type: "bridge" },
            { name: "outro", bars: structure.outro, type: "outro" }
        ];
        
        let currentBeat = 0;
        let prevChordNotes = null; 
        
        for (let s of sections) {
            let baseVol = 85;
            if (s.type === "chorus") baseVol = 120;
            else if (s.type === "verse") baseVol = 95;
            else if (s.type === "bridge") baseVol = 70;
            
            allEvents.push({ tick: currentBeat * ticksPerBeat, type: 'section', name: s.name });
            allEvents.push({ tick: currentBeat * ticksPerBeat, type: 'cc', channel: 4, controller: 11, value: baseVol });
            
            if (s.name === "intro" || s.name === "bridge") {
                const totalSectionTicks = s.bars * 4 * ticksPerBeat;
                const filterSteps = 16;
                for (let i = 0; i < filterSteps; i++) {
                    const tick = (currentBeat * ticksPerBeat) + Math.floor((i / filterSteps) * totalSectionTicks);
                    const ccVal = 35 + Math.floor((i / filterSteps) * 80);
                    allEvents.push({ tick, type: 'cc', channel: 2, controller: 74, value: ccVal });
                    allEvents.push({ tick, type: 'cc', channel: 3, controller: 74, value: ccVal });
                }
            } else {
                allEvents.push({ tick: currentBeat * ticksPerBeat, type: 'cc', channel: 2, controller: 74, value: 115 });
                allEvents.push({ tick: currentBeat * ticksPerBeat, type: 'cc', channel: 3, controller: 74, value: 115 });
            }

            // KOHINASWEEP (Ch11) kertosäettä edeltävillä jaksoilla (verse & verse2 loppuun)
            const isBeforeChorus = (s.name === "verse" || s.name === "verse2");
            if (isBeforeChorus) {
                const riserBars = 4;
                const riserStartBar = Math.max(0, s.bars - riserBars);
                const riserStartTick = (currentBeat + riserStartBar * 4) * ticksPerBeat;
                const riserDurationTicks = riserBars * 4 * ticksPerBeat;
                
                // Kohinan aktivoiva C4 nuotti dynaamisella suotimella
                allEvents.push({
                    tick: riserStartTick,
                    type: 'note',
                    channel: 11, // Kanava 11 kohinasweepille
                    note: 60,
                    velocity: 95,
                    duration: riserDurationTicks - 20
                });
                
                // Filtterin aukeaminen CC74 ja voimakkuuden kasvaminen CC11 kertosäettä kohden
                const steps = 32;
                for (let i = 0; i <= steps; i++) {
                    const stepTick = riserStartTick + Math.floor((i / steps) * riserDurationTicks);
                    const cutoffVal = 10 + Math.floor((i / steps) * 117);
                    const exprVal = 10 + Math.floor((i / steps) * 105);
                    
                    allEvents.push({ tick: stepTick, type: 'cc', channel: 11, controller: 74, value: cutoffVal });
                    allEvents.push({ tick: stepTick, type: 'cc', channel: 11, controller: 11, value: exprVal });
                }
            }

            let sectionMelody = [];
            const useChorusModelInOutro = (s.name === "outro" && fadeOutChorus);
            if (s.type !== "intro" && s.type !== "bridge" && (s.type !== "outro" || useChorusModelInOutro)) {
                sectionMelody = generateMelody(scaleInfo, chordProg, s.bars, currentBeat, useChorusModelInOutro ? "chorus" : s.type, melodyType, melodyRhythmName);
                allEvents.push(...sectionMelody);
            }

            let currentBassPattern = BASS_PATTERNS[defaultBassPatternName];
            if (s.type === "chorus" || useChorusModelInOutro) {
                currentBassPattern = BASS_PATTERNS["sixteenth"];
            } else if (s.type === "verse") {
                currentBassPattern = BASS_PATTERNS["eighth"];
            }

            for (let bar = 0; bar < s.bars; bar++) {
                const chordIdx = (currentBeat / 4 + bar) % chordProg.length;
                const nextChordIdx = (currentBeat / 4 + bar + 1) % chordProg.length;
                const chordRoot = chordProg[chordIdx];
                const nextChordRoot = chordProg[nextChordIdx];
                
                // SOINTUJEN DREAMY-ASETTELU (tersit, kvintit, septimit, nonit alueella 48-71)
                const chordNotes = getDreamyVoiceLedChord(scaleInfo, chordRoot, 4, prevChordNotes);
                prevChordNotes = chordNotes; 

                const startTick = (currentBeat + bar * 4) * ticksPerBeat;
                const barEndTick = startTick + 4 * ticksPerBeat;
                
                const barMelody = sectionMelody.filter(ev => ev.type === 'note' && ev.tick >= startTick && ev.tick < barEndTick);
                const isLastBarOfVerse = (s.name === "verse" || s.name === "verse2") && (bar === s.bars - 1);
                const applyStop = isLastBarOfVerse && songHasStop;
                const isArpKickPhase = (s.type === "bridge" && bridgeStyle === "arp_kick_build" && bar < 4);

                if (s.isIntro) {
                    const introEvents = generateIntro(scaleInfo, chordRoot, introStyle, startTick, ticksPerBeat, arpStyle, drumsFirstIntro, bassMode, swingAmount);
                    allEvents.push(...introEvents);
                } else if (s.type === "bridge") {
                    if (!isArpKickPhase) {
                        chordNotes.forEach(note => {
                            allEvents.push({ tick: startTick, type: 'note', channel: 2, note, velocity: 50, duration: ticksPerBeat * 3.8 });
                        });
                    }
                    
                    const bassNoteLow = chordNotes[0] - 12;
                    const bassNoteHigh = chordNotes[0];
                    let bassVel = 50;
                    if (bar >= 4) bassVel = 65;
                    if (bar >= 8) bassVel = 80;

                    if (!isArpKickPhase) {
                        if (bridgeStyle === "tension_builder" || bar >= 8) {
                            for (let eighth = 0; eighth < 8; eighth++) {
                                const bassTick = startTick + (eighth * ticksPerBeat / 2);
                                if (bassMode === "split") {
                                    allEvents.push({ tick: bassTick, type: 'note', channel: 7, note: bassNoteHigh, velocity: bassVel, duration: ticksPerBeat / 3 });
                                    allEvents.push({ tick: bassTick, type: 'note', channel: 10, note: bassNoteLow, velocity: bassVel, duration: ticksPerBeat / 3 });
                                } else {
                                    allEvents.push({ tick: bassTick, type: 'note', channel: 1, note: bassNoteLow, velocity: bassVel, duration: ticksPerBeat / 3 });
                                }
                            }
                        } else {
                            if (bassMode === "split") {
                                allEvents.push({ tick: startTick, type: 'note', channel: 7, note: bassNoteHigh, velocity: bassVel, duration: ticksPerBeat * 3.5 });
                                allEvents.push({ tick: startTick, type: 'note', channel: 10, note: bassNoteLow, velocity: bassVel, duration: ticksPerBeat * 3.5 });
                            } else {
                                allEvents.push({ tick: startTick, type: 'note', channel: 1, note: bassNoteLow, velocity: bassVel, duration: ticksPerBeat * 3.5 });
                            }
                        }
                    }

                    const arpEvents = generateArpeggio(scaleInfo, chordRoot, 5, 1, startTick, ticksPerBeat, arpStyle, swingAmount);
                    allEvents.push(...arpEvents);
                    
                    if (bar >= 4 && bar < 8 && !isArpKickPhase) {
                        for (let i = 0; i < 8; i++) {
                            allEvents.push({ tick: startTick + i * ticksPerBeat / 2, type: 'note', channel: 9, note: 42, velocity: 50, duration: ticksPerBeat / 8 });
                        }
                    }

                } else {
                    const breathingPattern = 0; // Aina legato
                    
                    // Suodinkäyrä CC74 jokaisen sointumuutoksen alussa (pyyhkäisy 40 -> 110)
                    const sweepSteps = 5;
                    for (let i = 0; i < sweepSteps; i++) {
                        const sweepTick = startTick + Math.floor((i / (sweepSteps - 1)) * 240);
                        const sweepVal = 40 + Math.floor((i / (sweepSteps - 1)) * 70);
                        allEvents.push({ tick: sweepTick, type: 'cc', channel: 2, controller: 74, value: sweepVal });
                    }

                    chordNotes.forEach(note => {
                        let vel = (s.type === "chorus" || useChorusModelInOutro) ? 82 : 64;
                        if (s.type === "outro") vel = 45;

                        if (applyStop) {
                            allEvents.push({ tick: startTick, type: 'note', channel: 2, note, velocity: vel, duration: ticksPerBeat * 0.8 });
                        } else if (breathingPattern === 0) {
                            // Perinteinen pitkä legato
                            allEvents.push({ tick: startTick, type: 'note', channel: 2, note, velocity: vel, duration: ticksPerBeat * 3.8 });
                        } else if (breathingPattern === 1) {
                            // Lyhyt staccato (breathe out)
                            allEvents.push({ tick: startTick, type: 'note', channel: 2, note, velocity: vel, duration: ticksPerBeat * 0.8 });
                        } else if (breathingPattern === 2) {
                            // Re-attack tahdin 3. iskulla (isku 1 soi 1.8 iskua, uusi isku tahdin 3. iskulla)
                            allEvents.push({ tick: startTick, type: 'note', channel: 2, note, velocity: vel, duration: ticksPerBeat * 1.8 });
                            allEvents.push({ tick: startTick + ticksPerBeat * 2, type: 'note', channel: 2, note, velocity: Math.floor(vel * 0.9), duration: ticksPerBeat * 1.8 });
                            
                            // Re-attack suodinsweep myös 3. iskulla
                            for (let i = 0; i < sweepSteps; i++) {
                                const sweepTick = startTick + ticksPerBeat * 2 + Math.floor((i / (sweepSteps - 1)) * 240);
                                const sweepVal = 50 + Math.floor((i / (sweepSteps - 1)) * 50);
                                allEvents.push({ tick: sweepTick, type: 'cc', channel: 2, controller: 74, value: sweepVal });
                            }
                        }
                    });
                    
                    const bassNoteLow = chordNotes[0] - 12; 
                    const bassNoteHigh = chordNotes[0];
                    
                    if (bassMode === "split") {
                        const subDuration = applyStop ? (ticksPerBeat * 0.8) : (ticksPerBeat * 3.8);
                        allEvents.push({ tick: startTick, type: 'note', channel: 10, note: bassNoteLow, velocity: 105, duration: subDuration });

                        for (let sixteenth = 0; sixteenth < 16; sixteenth++) {
                            if (applyStop && sixteenth >= 4) continue; 
                            const patternPos = Math.floor(sixteenth / 4);
                            if (currentBassPattern[patternPos % currentBassPattern.length] === 1) {
                                const bassTick = startTick + (sixteenth * ticksPerBeat / 4);
                                let bassVel = (s.type === "chorus" || useChorusModelInOutro) ? 95 : (s.type === "verse" ? 80 : 65);
                                const isOffbeat = (sixteenth % 2 === 1);
                                const activeBassNote = isOffbeat ? chordNotes[0] : bassNoteHigh;
                                allEvents.push({ tick: bassTick, type: 'note', channel: 7, note: activeBassNote, velocity: isOffbeat ? Math.floor(bassVel * 0.8) : bassVel, duration: ticksPerBeat / 6 });
                            }
                        }
                    } else {
                        for (let sixteenth = 0; sixteenth < 16; sixteenth++) {
                            if (applyStop && sixteenth >= 4) continue; 
                            const patternPos = Math.floor(sixteenth / 4);
                            if (currentBassPattern[patternPos % currentBassPattern.length] === 1) {
                                const bassTick = startTick + (sixteenth * ticksPerBeat / 4);
                                let bassVel = (s.type === "chorus" || useChorusModelInOutro) ? 100 : (s.type === "verse" ? 85 : 70);
                                const isOffbeat = (sixteenth % 2 === 1);
                                const activeBassNote = (isOffbeat && (s.type === "chorus" || useChorusModelInOutro)) ? bassNoteHigh : bassNoteLow;
                                allEvents.push({ tick: bassTick, type: 'note', channel: 1, note: activeBassNote, velocity: isOffbeat ? Math.floor(bassVel * 0.8) : bassVel, duration: ticksPerBeat / 6 });
                            }
                        }
                    }
                    
                    if (!applyStop) {
                        const arpEvents = generateArpeggio(scaleInfo, chordRoot, 5, 1, startTick, ticksPerBeat, arpStyle, swingAmount);
                        allEvents.push(...arpEvents);
                    } else {
                        const arpEvents = generateArpeggio(scaleInfo, chordRoot, 5, 1, startTick, ticksPerBeat, arpStyle, swingAmount);
                        const truncatedArps = arpEvents.filter(ev => ev.tick < startTick + ticksPerBeat);
                        allEvents.push(...truncatedArps);
                    }
                    
                    if ((s.type === "chorus" || useChorusModelInOutro) && bar % 2 === 1 && Math.random() < 0.35 && !applyStop) {
                        const fillEvents = generateDynamicMelodicFill(scaleInfo, chordRoot, nextChordRoot, barMelody, startTick, ticksPerBeat);
                        allEvents.push(...fillEvents);
                    }
                }
            }
            
            for (let bar = 0; bar < s.bars; bar++) {
                const startTick = (currentBeat + bar * 4) * ticksPerBeat;
                let intensity = (s.type === "chorus") ? 1.0 : (s.type === "verse" ? 0.75 : 0.5);
                if (s.type === "intro" && !introStyle.hasDrums) continue;
                if (s.type === "intro") intensity = 0.4;
                if (s.type === "outro") intensity = 0.35;
                
                const isLastBarOfSection = (bar === s.bars - 1);
                const transitionsToChorus = (s.name === "verse" || s.name === "verse2" || s.name === "bridge");
                const isLastBarOfVerse = (s.name === "verse" || s.name === "verse2") && (bar === s.bars - 1);
                const applyStop = isLastBarOfVerse && songHasStop;

                if (applyStop) {
                    allEvents.push({ tick: startTick, type: 'note', channel: 9, note: 36, velocity: 110, duration: ticksPerBeat / 2 });
                    continue;
                }

                const isArpKickPhase = (s.type === "bridge" && bridgeStyle === "arp_kick_build" && bar < 4);

                if (isArpKickPhase) {
                    allEvents.push({ tick: startTick, type: 'note', channel: 9, note: 36, velocity: 85, duration: ticksPerBeat / 2 });
                    allEvents.push({ tick: startTick + ticksPerBeat * 2, type: 'note', channel: 9, note: 36, velocity: 85, duration: ticksPerBeat / 2 });
                    continue;
                }

                if (transitionsToChorus && isLastBarOfSection) {
                    addDynamicTomFill(allEvents, startTick, ticksPerBeat, intensity);
                    continue;
                }

                if (s.type === "bridge") {
                    if (bar >= 8 && !isLastBarOfSection) {
                        allEvents.push({ tick: startTick, type: 'note', channel: 9, note: 36, velocity: 85, duration: ticksPerBeat / 2 });
                        allEvents.push({ tick: startTick + ticksPerBeat * 2, type: 'note', channel: 9, note: 36, velocity: 85, duration: ticksPerBeat / 2 });
                        allEvents.push({ tick: startTick + ticksPerBeat, type: 'note', channel: 9, note: 38, velocity: 55, duration: ticksPerBeat / 4 });
                        allEvents.push({ tick: startTick + ticksPerBeat * 3, type: 'note', channel: 9, note: 38, velocity: 65, duration: ticksPerBeat / 4 });
                    }
                } else {
                    // KICK logiikka
                    const pattern = kickPattern.pattern;
                    const stepsPerBar = 16;
                    const totalSteps = pattern.length;
                    
                    for (let step = 0; step < totalSteps; step++) {
                        if (pattern[step] === 1) {
                            const stepInBar = step % stepsPerBar;
                            const barOffset = Math.floor(step / stepsPerBar);
                            const stepTick = startTick + (barOffset * 4 * ticksPerBeat) + (stepInBar * ticksPerBeat / 4);
                            
                            let kickVel = 95 * intensity;
                            if (stepInBar === 0) kickVel = 105 * intensity;
                            if (stepInBar === 8) kickVel = 100 * intensity;
                            
                            allEvents.push({ 
                                tick: stepTick, 
                                type: 'note', 
                                channel: 9, 
                                note: 36, 
                                velocity: kickVel, 
                                duration: ticksPerBeat / 6 
                            });
                        }
                    }
                        
                    // Snare/clap 
                    if (!isLastBarOfSection) {
                        allEvents.push({ tick: startTick + ticksPerBeat, type: 'note', channel: 9, note: 38, velocity: 85 * intensity, duration: ticksPerBeat / 2 });
                        allEvents.push({ tick: startTick + ticksPerBeat * 3, type: 'note', channel: 9, note: 38, velocity: 85 * intensity, duration: ticksPerBeat / 2 });
                        if (songHasClap) {
                            allEvents.push({ tick: startTick + ticksPerBeat, type: 'note', channel: 9, note: 39, velocity: 80 * intensity, duration: ticksPerBeat / 2 });
                            allEvents.push({ tick: startTick + ticksPerBeat * 3, type: 'note', channel: 9, note: 39, velocity: 80 * intensity, duration: ticksPerBeat / 2 });
                        }
                    } else if (isLastBarOfSection) {
                        const fillTick = startTick + (ticksPerBeat * 3);
                        for (let f = 0; f < 4; f++) {
                            const subTick = fillTick + (f * ticksPerBeat / 4);
                            const rollVel = Math.floor((70 + (f * 15)) * intensity);
                            allEvents.push({ tick: subTick, type: 'note', channel: 9, note: 38, velocity: rollVel, duration: ticksPerBeat / 8 });
                        }
                    }
                }
                
                if (s.type !== "bridge") {
                    if (s.type === "chorus" || useChorusModelInOutro) {
                        // Kertsin 16-osahatturytmi + Avoin hattu 4. iskulla (indeksi 12)
                        for (let i = 0; i < 16; i++) {
                            const tickOffset = i * ticksPerBeat / 4;
                            if (i === 12) {
                                // Avoin hattu tahdin 4. iskulla (GM Note 46)
                                allEvents.push({ tick: startTick + tickOffset, type: 'note', channel: 9, note: 46, velocity: 85, duration: ticksPerBeat / 4 });
                            } else {
                                const isOffbeat = (i % 4 === 2);
                                const hatVel = isOffbeat ? 78 : 50;
                                allEvents.push({ tick: startTick + tickOffset, type: 'note', channel: 9, note: 42, velocity: hatVel, duration: ticksPerBeat / 8 });
                            }
                        }
                    } else if (s.type === "verse") {
                        for (let i = 0; i < 8; i++) {
                            allEvents.push({ tick: startTick + i * ticksPerBeat / 2, type: 'note', channel: 9, note: 42, velocity: 58, duration: ticksPerBeat / 8 });
                        }
                    }
                }
            }

            if (s.type === "bridge" || (s.type === "outro" && !fadeOutChorus)) {
                if (s.type === "outro" || bridgeStyle === "space_sweep" || bridgeStyle === "tension_builder") {
                    const soloEvents = generateSolo(scaleInfo, chordProg, s.bars, currentBeat);
                    allEvents.push(...soloEvents);
                }
            }
            
            if (s.name === "outro" && fadeOutChorus) {
                const outroStartTick = currentBeat * ticksPerBeat;
                const outroTotalTicks = s.bars * 4 * ticksPerBeat;
                const fadeSteps = 16;
                for (let i = 0; i < fadeSteps; i++) {
                    const stepTick = outroStartTick + Math.floor((i / fadeSteps) * outroTotalTicks);
                    const volVal = Math.floor((1.0 - (i / fadeSteps)) * 127);
                    const activeChannels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                    activeChannels.forEach(ch => {
                        allEvents.push({ tick: stepTick, type: 'cc', channel: ch, controller: 7, value: volVal });
                    });
                }
            }

            currentBeat += s.bars * 4;
        }

        // LOPPUUN JÄÄVÄ YKSITTÄINEN SOINTU, JOKA FADEAA ULOS
        const finalChordTick = currentBeat * ticksPerBeat;
        const finalChordNotes = getDreamyVoiceLedChord(scaleInfo, chordProg[0], 4, prevChordNotes); // palataan perussointuun
        
        finalChordNotes.forEach(note => {
            allEvents.push({
                tick: finalChordTick,
                type: 'note',
                channel: 2, // Ch2 Pad
                note: note,
                velocity: 80,
                duration: ticksPerBeat * 8 // Kestää 8 iskua
            });
        });
        
        // Kaunis loppufeidaus viimeiselle soinnulle Ch2
        const finalFadeSteps = 24;
        for (let i = 0; i <= finalFadeSteps; i++) {
            const stepTick = finalChordTick + Math.floor((i / finalFadeSteps) * ticksPerBeat * 8);
            const volVal = Math.floor((1.0 - (i / finalFadeSteps)) * 110);
            allEvents.push({
                tick: stepTick,
                type: 'cc',
                channel: 2,
                controller: 7,
                value: volVal
            });
        }

        const sidechainEvents = [];
        allEvents.forEach(ev => {
            if (ev.type === 'note' && ev.channel === 9 && ev.note === 36) {
                sidechainEvents.push({ tick: ev.tick, type: 'note', channel: 8, note: ev.note, velocity: ev.velocity, duration: ev.duration });
            }
        });
        allEvents.push(...sidechainEvents);
        allEvents.sort((a, b) => a.tick - b.tick);
        
        return {
            name: `${getRandomItem(ADJECTIVES)} ${getRandomItem(NOUNS)}`,
            frequency: getRandomFloat(87.5, 107.9).toFixed(1),
            bpm: tempo,
            swing: swingAmount,
            chords: chordNames.join(" | "),
            bassPattern: defaultBassPatternName,
            introType: introStyle.name,
            bridgeStyle: bridgeStyle,
            runPattern: runPattern.name,
            arpStyle: arpStyle,
            bassMode: bassMode,
            hasClap: songHasClap,
            drumsFirstIntro: drumsFirstIntro,
            songHasStop: songHasStop,
            fadeOutChorus: fadeOutChorus,
            melodyType: melodyType,
            melodyRhythm: melodyType === "rythmic" ? melodyRhythmName : "random",
            outroBars: structure.outro,
            events: allEvents
        };
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
            height = Math.min(100, Math.max(10, height + getRandomInt(-6, 6)));
            barAmplitudes[targetBar] = Math.max(barAmplitudes[targetBar], height);
        }
    }
    
    function sendMIDIEvent(event) {
        if (!event) return;

        // 1. Lasketaan skaalattu velocity
        let scaledVel = event.velocity;
        if (event.type === 'note') {
            scaledVel = getScaledVelocity(event.velocity, event.channel, event.note);
            triggerSpectrumBar(event.channel, event.note, scaledVel);
        }

        // 2. Välitetään tapahtuma WAV-äänimoottorille (sisältää myös Pitch Bendit ja CC-muutokset!)
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

        // 3. Note-Off -ajastukset ja aktiiviset nuotit AINA (riippumatta selectedOutput-tilasta)
        if (event.type === 'note') {
            activeNotes.push({ channel: event.channel, note: event.note });
            
            const currentBeatLenMs = (60000 / currentBPM);
            const noteOffTime = event.duration * currentBeatLenMs / 480;
            
            setTimeout(() => {
                // Lähetetään Note-Off selaimen äänimoottorille
                if (typeof window.onMIDIEvent === 'function') {
                    window.onMIDIEvent({
                        type: 'note',
                        channel: event.channel,
                        note: event.note,
                        velocity: 0
                    });
                }
                // Lähetetään Note-Off fyysiselle MIDI-ulostulolle
                if (selectedOutput) {
                    try { selectedOutput.send([0x80 + (event.channel - 1), event.note, 0]); } catch(e) {}
                }
                activeNotes = activeNotes.filter(n => !(n.channel === event.channel && n.note === event.note));
            }, noteOffTime);
        }

        // 4. Jos fyysistä MIDI-laitetta ei ole valittu, keskeytetään tässä (WAV jo käsitelty yllä!)
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

        // Arvotaan satunnaiset soundivariaatiot tälle kappaleelle
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
        
        // Reaaliaikainen toistotyökalu dynaamisella tempontunnistuksella ja Tape Wobble -efektillä
        function tickLoop() {
            if (!isPlaying) return;
            
            const now = performance.now();
            const deltaMs = now - lastTime;
            lastTime = now;
            
            let liveBPM = song.bpm;
            let tapeWobbleProgress = 0;
            
            // VINYL STOP & TAPE WOBBLE OUTROSA
            if (currentSectionName === 'outro') {
                const elapsedTicksInOutro = accumulatedTicks - outroStartTick;
                const outroTotalTicks = outroBars * 4 * 480;
                const progress = Math.min(1.0, Math.max(0, elapsedTicksInOutro / outroTotalTicks));
                
                // Tasaisesti hidastuva tempo ("Vinyl stop")
                liveBPM = song.bpm * (1.0 - progress * 0.45); 
                if (liveBPM < 10) liveBPM = 10; 
                
                tapeWobbleProgress = progress;
            }
            
            currentBPM = liveBPM; 
            
            // Konvertoidaan kulunut aika MIDI-tiksiksi muuttuvan tempon mukaan
            const deltaTicks = deltaMs * liveBPM / 125;
            accumulatedTicks += deltaTicks;
            
            // Tape Wobble: Lähetetään pitch-bending huojunta dynaamisesti
            if (selectedOutput && tapeWobbleProgress > 0) {
                const wobbleTime = now / 100;
                const wobbleVal = 8192 + Math.sin(wobbleTime) * 200 * tapeWobbleProgress;
                const lsb = Math.round(wobbleVal) & 0x7F;
                const msb = (Math.round(wobbleVal) >> 7) & 0x7F;
                [1, 2, 3, 4, 7, 10, 11].forEach(ch => {
                    try { selectedOutput.send([0xE0 + (ch - 1), lsb, msb]); } catch(e) {}
                });
            }
            
            // Laukaistaan kaikki kertyneelle ajalle kuuluvat tapahtumat
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
        
        // Pysäytetään kaikki aktiiviset nuotit selaimen WAV-äänimoottorista
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
        const nextSong = generateFullSong();
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
                document.getElementById('bpmDisplay').innerHTML = `BPM: ${currentSong.bpm} | Intro: ${currentSong.introType} | Melodia: ${melodyLabel} | ${swingLabel}`;
                
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
            const height = getRandomInt(45, 100); barAmplitudes[idx] = height;
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
    
    document.getElementById('playBtn').onclick = () => { if (!isScanning) { if (!currentSong) generateAndPlayNewSong(); else if (!isPlaying) playSong(currentSong); } };
    document.getElementById('stopBtn').onclick = () => { stopPlayback(); document.getElementById('status').innerHTML = "⏹️ TRANSMISSION PAUSED"; };
    document.getElementById('forwardBtn').onclick = () => { generateAndPlayNewSong(); };
    document.getElementById('exportMidiBtn').onclick = () => { if (currentSong) downloadMidi(currentSong); else alert("Luo biisi ensin!"); };
    
    initMIDI();
    setupDial('volDial', 0.8, (val) => { volumeValue = val; document.getElementById('volLabel').innerText = `VOLUME: ${Math.round(val * 100)}%`; sendVolumeCC(val); });
    setupDial('toneDial', 0.5, (val) => { toneValue = val; document.getElementById('toneLabel').innerText = `TONE: ${val < 0.35 ? "DEEP" : val > 0.75 ? "BRIGHT" : "MID"}`; });
}
