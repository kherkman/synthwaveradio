// composer.js - Synthwave Composition Engine

// ── Sanastot ja tietorakenteet (Vocabularies & structures) ──────────────────────────
const ADJECTIVES = ["NIGHT", "NEON", "LASER", "MEMORY", "SYNTH", "DARK", "FUTURE", "DREAM", 
"ELECTRIC", "SHADOW", "COSMIC", "RADIO", "VELVET", "CRYSTAL", 
"PHANTOM", "ARCADE", "MIDNIGHT", "SOLAR", "STELLAR", "CYBER", 
"MIDNIGHT", "BLAZING", "DISTANT", "GHOSTLY", "LIQUID", "MIRAGE", "FM", "VINYL",
"NEBULA", "OUTRUN", "RADIO", "SILENT", "THUNDER", "URBAN", "VOID", "WILD", "ZERO", 
"ANALOG", "DIGITAL", "FROZEN", "HOT", "INFINITE", "JET", "KILLER", "LOST", "LUNAR", "MACHINE", 
"MYSTIC", "NEON", "PHOENIX", "QUANTUM", "RETRO", "SHADOW", "TITAN", "ULTRA", "VINTAGE", "WAVE", "BACK TO THE", 
"CYBER", "DARK", "ELECTRIC", "FUTURE", "GHOST", "HYPER", "LASER", "FUTURE", "SPACE", "DEEP SPACE","MIDNIGHT"
];

const NOUNS = [ "DRIVE", "WAVE", "GRID", "CITY", "RUN", "HEART", "VOID", "SKY", "DREAMS", 
"STORM", "PARADISE", "ROADS", "MINDS", "FIRE", "SOUL", "GHOST", "TURBO", 
"VISION", "ECHO", "SHORE", "BLASTER", "CRUISER", "DANCER", "EMPIRE", "FIGHTER", "GUNNER", "RUNNER", "HORIZON",
"JOURNEY", "KILLER", "LASER", "MOTION", "NIGHTMARE", "ORBIT", "PULSE", "CASSETTE",
"QUEST", "RACER", "SPECTRE", "THRUST", "UNIVERSE", "VIPER", "WARRIOR", 
"XENON", "YOUTH", "ZONE", "ADVENTURE", "BLADE", "COSMOS", "DYNAMO", "ENERGY", 
"FALCON", "GALAXY", "HUNTER", "INFERNO", "JUNGLE", "KINGDOM", "LEGEND", 
"MIRAGE", "NEXUS", "OBLIVION", "PHOENIX", "QUASAR", "REBEL", "SENTINEL", 
"TITAN", "ULTIMATE", "VORTEX", "WAVEFORM", "XENON", "STREETS", "LIGHTS", "ZENITH"
];

const MELODY_TYPES = [
    { name: "rythmic", weight: 60 },
    { name: "random", weight: 40 }
];

const MELODY_RHYTHMS = {
    "driving":     [1, 0, 0, 1, 0, 0, 1, 0],
    "driven":      [1, 0, 0, 1, 0, 0, 1, 1],
    "syncopated":  [1, 0, 1, 0, 0, 1, 0, 1],
    "longing":     [1, 0, 0, 0, 0, 1, 1, 1],
    "nightly":     [1, 1, 1, 1, 0, 0, 0, 0],
    "straight":    [1, 1, 1, 1, 1, 1, 1, 1],
    "half_time":   [1, 0, 0, 0, 1, 0, 0, 0],
    "triplet_feel":[1, 0, 1, 0, 0, 1, 0, 1],
    "dotted":      [1, 0, 0, 1, 0, 0, 0, 1],
    "backbeat":    [0, 0, 1, 0, 0, 0, 1, 0],
    "minimal":     [1, 0, 0, 0, 1, 0, 0, 0],
    "rolling":     [1, 1, 0, 1, 1, 0, 1, 0],
    "awaiting":    [0, 0, 0, 1, 1, 1, 1, 1],
    "pounding":    [1, 0, 1, 1, 0, 0, 1, 0],
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
    { template: [0, 6, 5, 5], desc: "i - VII - VI - VI (Atmospheric)" },
    { template: [0, 3, 2, 5], desc: "i - iv - III - VI (Dream sequence)" },
    { template: [0, 0, 5, 5], desc: "i - i - VI - VI (Drone feel)" },
    { template: [0, 5, 0, 6], desc: "i - VI - i - VII" },
    { template: [5, 6, 0, 4], desc: "VI - VII - i - v (Driving energy)" },
    { template: [0, 5, 4, 5], desc: "i - VI - v - VI (Pumping motion)" },
    { template: [0, 5, 6, 4], desc: "i - VI - VII - v (Stargazer waltz)" },
    { template: [0, 2, 5, 6], desc: "i - III - VI - VII (Cruiser's horizon)" },
    { template: [4, 5, 0, 6], desc: "v - VI - i - VII (Pulse from the past)" },
    { template: [0, 5, 3, 3], desc: "i - VI - iv - iv (Lucid dreamer)" },
    { template: [0, 6, 0, 5], desc: "i - VII - i - VI (Lost transmission)" },
    { template: [0, 5, 5, 6], desc: "i - VI - VI - VII (Reflection pool)" },
    { template: [0, 6, 6, 5], desc: "i - VII - VII - VI (Echoes of 1984)" },
    { template: [0, 5, 0, 0], desc: "i - VI - i - i (Midnight resolution)" },
    { template: [5, 5, 0, 6], desc: "VI - VI - i - VII (Before the sunrise)" },
    { template: [2, 5, 0, 6], desc: "III - VI - i - VII (Soft glow break)" },
    { template: [0, 0, 5, 6], desc: "i - i - VI - VII (Basic Three Up)" },
    { template: [0, 0, 6, 5], desc: "i - i - VII - VI (Basic Three Down)" },
    { template: [0, 6, 5, 5], desc: "i - VII - VI - VI (Basic Three Down Hold)" },
    { template: [0, 5, 6, 6], desc: "i - VII - VI - VI (Basic Three Down & Up Hold)" },
    { template: [0, 6, 5, 6], desc: "i - VII - VI - VII (Basic Three Down & Up)" },
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
    "driving": [1, 1, 0, 1],
    "trance": [0, 1, 1, 1],
    "backbeat": [0, 0, 1, 0]
};

const KICK_PATTERNS = {
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


// ── Matemaattiset apufunktiot (Mathematical helper functions) ───────────────────
function getRandomItem(arr) { 
    return arr[Math.floor(Math.random() * arr.length)]; 
}

function getRandomInt(min, max) { 
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}

function getRandomFloat(min, max) { 
    return min + Math.random() * (max - min); 
}

function getRandomKickPattern() {
    const patternNames = Object.keys(KICK_PATTERNS);
    const patternName = getRandomItem(patternNames);
    return {
        name: patternName,
        pattern: KICK_PATTERNS[patternName]
    };
}

function getSpecificKickPatterns() {
    const myPatterns = [
        { name: "sparse_quarter", pattern: [1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0] },
        { name: "driving_eighth", pattern: [1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0, 1,0,0,1,0,0,1,0] }
    ];
    return getRandomItem(myPatterns);
}


// ── Sävellysalgoritmit (Compositional algorithms) ───────────────────────────────
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

// Apufunktio synth pop -bassomelodian sävelten hakuun (Sallii yläoktaavit dynaamisesti)
function getBassMelodyNote(scaleInfo, chordRootOffset, degreeType, octave) {
    const scale = scaleInfo.scale;
    const tonic = scaleInfo.tonic;
    const rootIndex = chordRootOffset % 7;
    
    // degreeType: 0 (root), 2 (third), 4 (fifth), 12 (root octave), 14 (third octave), 16 (fifth octave)
    const actualDegree = degreeType % 12;
    const extraOctave = Math.floor(degreeType / 12);
    
    const targetIndex = (rootIndex + actualDegree) % 7;
    let octaveOffset = Math.floor((rootIndex + actualDegree) / 7) + extraOctave;
    
    const pitchClass = (tonic + scale[targetIndex]) % 12;
    return pitchClass + ((octave + octaveOffset) * 12);
}

function getDreamyVoiceLedChord(scaleInfo, chordRootOffset, targetOctave, prevChordNotes) {
    const scale = scaleInfo.scale;
    const tonic = scaleInfo.tonic;
    
    const rIdx = chordRootOffset % 7;
    const tIdx = (rIdx + 2) % 7;
    const fIdx = (rIdx + 4) % 7;
    
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

// Generoi melodisen, 80-luvun synth pop -tyylisen bassokuvion
function generateMelodicBass(scaleInfo, chordProg, totalBars, startBeat, sectionType, doubleChordDuration) {
    const ticksPerBeat = 480;
    const events = [];
    
    // Mielenkiintoisempia, aitoja 80-luvun pop-bassorytmejä (oktaavihyppyjä ja melodisia kulkuja)
    const patterns = [
        {
            // Klassinen Italo Disco / Synthpop oktaavipumppu (Blue Monday -tyylinen vuorottelu)
            rhythm:  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            pitches: [0, 12, 0, 12, 2, 14, 2, 14, 4, 16, 4, 16, 2, 14, 2, 14]
        },
        {
            // Synkopoitu pop-kuvio (Duran Duran / Hall & Oates -vaikutteinen)
            rhythm:  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1],
            pitches: [0, 0, 0, 0, 2, 14, 0, 16, 0, 4, 0, 0, 12, 0, 12, 12]
        },
        {
            // Eteenpäin työntävä syntikkapulssi oktaaveilla (Vince Clarke / Yazoo -groove)
            rhythm:  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            pitches: [0, 0, 12, 12, 2, 2, 14, 14, 4, 4, 16, 16, 2, 2, 14, 14]
        },
        {
            // Laukkaava melodinen pop-basso (Giorgio Moroder / Italo)
            rhythm:  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
            pitches: [0, 0, 0, 12, 2, 0, 2, 14, 4, 0, 4, 16, 0, 0, 12, 0]
        },
        {
            // Melodinen pop-koukku ylösnousevalla linjalla (A-ha style)
            rhythm:  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            pitches: [0, 2, 4, 12, 14, 2, 0, 12, 0, 2, 4, 12, 14, 2, 0, 12]
        }
    ];
    
    const chosenPattern = getRandomItem(patterns);
    let baseVel = (sectionType === "chorus" || sectionType === "chorus2") ? 100 : (sectionType === "verse" ? 85 : 70);

    for (let bar = 0; bar < totalBars; bar++) {
        const barStartBeat = startBeat + (bar * 4);
        const barStartTick = barStartBeat * ticksPerBeat;
        
        const chordIdx = Math.floor(barStartBeat / (doubleChordDuration ? 8 : 4)) % chordProg.length;
        const chordRoot = chordProg[chordIdx];
        
        for (let sixteenth = 0; sixteenth < 16; sixteenth++) {
            if (chosenPattern.rhythm[sixteenth] === 1) {
                const tick = barStartTick + (sixteenth * ticksPerBeat / 4);
                const degreeType = chosenPattern.pitches[sixteenth];
                
                const midiNote = getBassMelodyNote(scaleInfo, chordRoot, degreeType, 2);
                const durationTicks = (ticksPerBeat / 4) * 0.85;
                
                events.push({
                    tick,
                    type: 'note',
                    channel: 1, 
                    note: midiNote,
                    velocity: baseVel + getRandomInt(-4, 4),
                    duration: durationTicks
                });
            }
        }
    }
    return events;
}

function generateMelody(scaleInfo, chordProg, totalBars, startBeat, sectionType, melodyType = "random", melodyRhythmName = "driving", doubleChordDuration = false) {
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

    const phraseBars = 4;
    const numPhrases = Math.ceil(totalBars / phraseBars);
    const phraseEvents = [];
    const stepDurationBeats = 0.5;

    const allowedSteps = [1, -1, 2, -2, 3, -3, -4, 0];  

    const roll = Math.random();
    const useSointuMotiivi = roll < 0.96;
    const isRhythmicFallback = !useSointuMotiivi && (roll < 0.98);

    if (useSointuMotiivi) {
        // Sävelet suhteessa sointuun: 8 (perus), 10 (sekunti), 11 (sus4), 12 (kvintti), 13 (augmented / ylitsevuotava), 14 (septimi)
        const allowedDegrees = [8, 10, 11, 12, 13, 14];
        const pattern = MELODY_RHYTHMS[melodyRhythmName] || MELODY_RHYTHMS["driving"];
        
        // Melodian rytmeistä nuotteja jää pois vain 1 % todennäköisyydellä
        const activePattern = pattern.map(step => (step === 1 && Math.random() < 0.01) ? 0 : step);

        // Tahti 1: A, Kysymys (arvotaan vapaasti rytmikuva ja sävelet)
        const pitchesQ = Array(8).fill(null);
        let runCounter = 0;
        let runStep = 1;
        let currentRunIdx = 0;

        for (let s = 0; s < 8; s++) {
            if (activePattern[s] === 1) {
                if (runCounter > 0) {
                    currentRunIdx = Math.max(0, Math.min(allowedDegrees.length - 1, currentRunIdx + runStep));
                    pitchesQ[s] = allowedDegrees[currentRunIdx];
                    runCounter--;
                } else if (Math.random() < 0.40) {
                    runCounter = 2;
                    runStep = Math.random() > 0.5 ? 1 : -1;
                    currentRunIdx = getRandomInt(0, allowedDegrees.length - 1);
                    pitchesQ[s] = allowedDegrees[currentRunIdx];
                } else {
                    pitchesQ[s] = getRandomItem(allowedDegrees);
                }
            }
        }

        const pitchesAns = Array(8).fill(null);
        for (let s = 0; s < 8; s++) {
            if (activePattern[s] === 1 && pitchesQ[s] !== null) {
                const idx = allowedDegrees.indexOf(pitchesQ[s]);
                const shift = Math.random() > 0.5 ? 1 : -1;
                const newIdx = Math.max(0, Math.min(allowedDegrees.length - 1, idx + shift));
                pitchesAns[s] = allowedDegrees[newIdx];
            }
        }

        const pitchesRep = pitchesQ.slice();

        const rhythmB = MELODY_RHYTHMS["minimal"] || [1, 0, 0, 0, 1, 0, 0, 0];
        const activeRhythmB = rhythmB.map(step => (step === 1 && Math.random() < 0.01) ? 0 : step);
        const pitchesB = Array(8).fill(null);
        
        let lastActiveIdx = -1;
        const activeIndicesB = [];
        for (let s = 0; s < 8; s++) {
            if (activeRhythmB[s] === 1) {
                activeIndicesB.push(s);
                lastActiveIdx = s;
            }
        }

        for (let s = 0; s < 8; s++) {
            if (activeRhythmB[s] === 1) {
                pitchesB[s] = getRandomItem(allowedDegrees);
            }
        }

        const isChorus = (sectionType === "chorus" || sectionType === "chorus2");
        const useChorusOctaveFifth = isChorus && (Math.random() < 0.30);

        if (useChorusOctaveFifth) {
            const activeIndicesQ = [];
            for (let s = 0; s < 8; s++) {
                if (activePattern[s] === 1) activeIndicesQ.push(s);
            }
            if (activeIndicesQ.length >= 2) {
                pitchesQ[activeIndicesQ[0]] = 15;
                pitchesQ[activeIndicesQ[1]] = 12;
                
                pitchesAns[activeIndicesQ[0]] = 14; 
                pitchesAns[activeIndicesQ[1]] = 11;
                pitchesRep[activeIndicesQ[0]] = 15;
                pitchesRep[activeIndicesQ[1]] = 12;
            }
            if (activeIndicesB.length >= 2) {
                pitchesB[activeIndicesB[activeIndicesB.length - 2]] = 15;
                pitchesB[activeIndicesB[activeIndicesB.length - 1]] = 12;
            }
        } else {
            const useEndRun = Math.random() < 0.30;
            if (useEndRun && activeIndicesB.length >= 3) {
                const len = activeIndicesB.length;
                pitchesB[activeIndicesB[len - 3]] = 15;
                pitchesB[activeIndicesB[len - 2]] = 13;
                pitchesB[activeIndicesB[len - 1]] = 12;
            }
        }

        if (lastActiveIdx !== -1 && !useChorusOctaveFifth && !(Math.random() < 0.30 && activeIndicesB.length >= 3)) {
            pitchesB[lastActiveIdx] = getRandomItem([8, 12, 15]);
        } else if (lastActiveIdx !== -1 && pitchesB[lastActiveIdx] === null) {
            pitchesB[lastActiveIdx] = getRandomItem([8, 12, 15]);
        }

        for (let barOfPhrase = 0; barOfPhrase < phraseBars; barOfPhrase++) {
            let rArr, pArr;
            if (barOfPhrase === 0) { rArr = activePattern; pArr = pitchesQ; }
            else if (barOfPhrase === 1) { rArr = activePattern; pArr = pitchesAns; }
            else if (barOfPhrase === 2) { rArr = activePattern; pArr = pitchesRep; }
            else { rArr = activeRhythmB; pArr = pitchesB; }

            for (let s = 0; s < 8; s++) {
                if (rArr[s] === 1 && pArr[s] !== null) {
                    let nextActiveStep = 8;
                    for (let next = s + 1; next < 8; next++) {
                        if (rArr[next] === 1) {
                            nextActiveStep = next;
                            break;
                        }
                    }
                    const durationBeats = (nextActiveStep - s) * stepDurationBeats;
                    const stepBeatInBar = s * stepDurationBeats;
                    const relativeBeat = (barOfPhrase * 4) + stepBeatInBar;

                    const absBeat = startBeat + relativeBeat;
                    const chordIdx = Math.floor(absBeat / (doubleChordDuration ? 8 : 4)) % chordProg.length;
                    const currentChordRoot = chordProg[chordIdx] || 0;

                    const degree = pArr[s];
                    let baseOctave = (sectionType === "chorus" || sectionType === "chorus2") ? 5 : 4;
                    
                    const noteOctave = (degree === 11) ? (baseOctave + 1) : baseOctave;
                    let midiNote = getMidiFromScaleIndex(currentChordRoot + (degree - 8), noteOctave);

                    while (midiNote > 84) midiNote -= 12;
                    while (midiNote < 48) midiNote += 12;

                    let velocity = (sectionType === "chorus" || sectionType === "chorus2") ? 95 : 82;
                    velocity += getRandomInt(-5, 5);

                    phraseEvents.push({
                        beatOffset: relativeBeat,
                        note: midiNote,
                        velocity: velocity,
                        durationBeats: durationBeats
                    });
                }
            }
        }
    } else {
        if (isRhythmicFallback) {
            let currentScaleDegree = chordProg[0] || 0;
            
            for (let bar = 0; bar < phraseBars; bar++) {
                const randomRhythmName = getRandomItem(Object.keys(MELODY_RHYTHMS));
                const pattern = MELODY_RHYTHMS[randomRhythmName] || MELODY_RHYTHMS["driving"];
                
                const activeSteps = [];
                for (let i = 0; i < pattern.length; i++) {
                    if (pattern[i] === 1) activeSteps.push(i);
                }
                
                for (let i = 0; i < activeSteps.length; i++) {
                    if (Math.random() < 0.01) {
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
                    
                    let baseOctave = 4;
                    if (sectionType === "chorus" || sectionType === "chorus2") {
                        baseOctave = 5;
                    } else if (sectionType === "verse" || sectionType === "verse2" || sectionType === "pre-chorus" || sectionType === "pre-chorus2") {
                        baseOctave = 4;
                    }
                    
                    let midiNote = getMidiFromScaleIndex(currentScaleDegree, baseOctave);

                    while (midiNote > 74) {
                        midiNote -= 12;
                    }
                    while (midiNote < 48) {
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
            let currentScaleDegree = chordProg[0] || 0;
            let beat = 0;
            const maxBeats = phraseBars * 4; 
            
            while (beat < maxBeats) {
                let duration = getRandomItem([1.0, 1.5, 2.0, 3.0, 4.0, 6.0]);
                if (beat + duration > maxBeats) {
                    duration = maxBeats - beat;
                }
                
                const isRest = Math.random() < 0.01;
                
                if (isRest) {
                    beat += duration;
                    continue;
                }
                
                const step = getRandomItem(allowedSteps);
                currentScaleDegree += step;

                const chordIdx = Math.floor(beat / (doubleChordDuration ? 8 : 4)) % chordProg.length;
                const currentChordRoot = chordProg[chordIdx];
                currentScaleDegree = (currentChordRoot + (currentScaleDegree % 7)) % 7;
                
                const baseOctave = (sectionType === "chorus" || sectionType === "chorus2") ? 5 : 4;
                let midiNote = getMidiFromScaleIndex(currentScaleDegree, baseOctave);
                
                while (midiNote > 74) midiNote -= 12;
                while (midiNote < 48) midiNote += 12;
                
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
    }
    
    const maxOffset = phraseEvents.length > 0 ? Math.max(...phraseEvents.map(e => e.beatOffset)) : -1;

    for (let p = 0; p < numPhrases; p++) {
        const phraseStartBeat = startBeat + (p * phraseBars * 4);
        phraseEvents.forEach(pe => {
            const absoluteBeat = phraseStartBeat + pe.beatOffset;
            const tick = absoluteBeat * ticksPerBeat;
            const durationTicks = pe.durationBeats * ticksPerBeat - 10;
            
            let note = pe.note;

            // Melodian parannus: Joka toinen kierto (phrase) päättyy ylemmäs, joka toinen alemmas
            if (pe.beatOffset === maxOffset && maxOffset !== -1) {
                if (p % 2 === 1) {
                    // Pariton kierto (1, 3...): Soitetaan loppunootissa oktaavia korkeampi lopetus
                    note += 12;
                } else {
                    // Parillinen kierto (0, 2...): Soitetaan alempi, vakaampi lopetus
                    note -= 12;
                }
                while (note > 84) note -= 12;
                while (note < 48) note += 12;
            }
            
            if (absoluteBeat < startBeat + totalBars * 4) {
                events.push({
                    tick,
                    type: 'note',
                    channel: 4, 
                    note: note,
                    velocity: pe.velocity,
                    duration: durationTicks
                });
            }
        });
    }

    return events;
}

function generateSolo(scaleInfo, chordProg, totalBars, startBeat, doubleChordDuration = false) {
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
    const divisor = doubleChordDuration ? 8 : 4;

    let motifNotes = null;

    while (beat < maxBeats) {
        const chordIdx = Math.floor(beat / divisor) % chordProg.length;
        const currentChordRoot = chordProg[chordIdx];

        const phraseType = getRandomItem(["lyrical_theme", "motif_sequence", "expressive_bend", "melodic_run", "rest"]);

        if (phraseType === "expressive_bend") {
            const durationBeats = getRandomItem([2.0, 3.0]);
            if (beat + durationBeats > maxBeats) break;

            const tick = (startBeat + beat) * ticksPerBeat;
            const durationTicks = durationBeats * ticksPerBeat - 10;

            const degree = getRandomItem([0, 2, 4]); 
            const note = getMidi(currentChordRoot + degree, 5); 

            let targetNote = note; 
            while (targetNote > 74) {
                targetNote -= 12;
            }
            while (targetNote < 48) {
                targetNote += 12;
            }
            const cappedNote = targetNote;

            events.push({
                tick,
                type: 'note',
                channel: 6, 
                note: cappedNote,
                velocity: 98,
                duration: durationTicks
            });

            const note1 = getMidi(currentChordRoot + degree, 5);
            const note2 = getMidi(currentChordRoot + degree + 1, 5);
            const semitonesUp = Math.min(2, Math.max(1, note2 - note1)); 

            const targetBend = 8192 + (semitonesUp * 4096);
            const cappedBend = Math.min(16383, targetBend);

            events.push({ tick: tick, type: 'pitch', channel: 6, value: 8192 });
            events.push({ tick: tick + durationTicks * 0.1, type: 'pitch', channel: 6, value: 8192 });
            events.push({ tick: tick + durationTicks * 0.35, type: 'pitch', channel: 6, value: cappedBend }); 
            events.push({ tick: tick + durationTicks * 0.65, type: 'pitch', channel: 6, value: cappedBend });  
            events.push({ tick: tick + durationTicks * 0.85, type: 'pitch', channel: 6, value: 8192 });  
            events.push({ tick: tick + durationTicks - 5, type: 'pitch', channel: 6, value: 8192 }); 

            events.push({ tick: tick, type: 'cc', channel: 6, controller: 1, value: 0 });
            events.push({ tick: tick + durationTicks * 0.4, type: 'cc', channel: 6, controller: 1, value: 15 });
            events.push({ tick: tick + durationTicks * 0.6, type: 'cc', channel: 6, controller: 1, value: 45 });
            events.push({ tick: tick + durationTicks * 0.8, type: 'cc', channel: 6, controller: 1, value: 85 });
            events.push({ tick: tick + durationTicks - 5, type: 'cc', channel: 6, controller: 1, value: 0 });

            const steps = 6;
            for (let s = 0; s <= steps; s++) {
                const stepTick = tick + Math.floor((s / steps) * durationTicks * 0.85);
                const crescVal = 50 + Math.floor((s / steps) * 77);
                events.push({ tick: stepTick, type: 'cc', channel: 6, controller: 11, value: crescVal });
            }
            events.push({ tick: tick + durationTicks - 5, type: 'cc', channel: 11, controller: 11, value: 127 });

            beat += durationBeats;

        } else if (phraseType === "lyrical_theme") {
            const durationBeats = 4.0;
            if (beat + durationBeats > maxBeats) break;

            const startTick = (startBeat + beat) * ticksPerBeat;
            const degrees = [0, 1, 2, 4]; 
            const rhythmPatterns = [
                [1.0, 1.0, 1.0, 1.0],
                [1.5, 0.5, 1.0, 1.0],
                [0.75, 0.75, 1.5, 1.0],
                [1.0, 0.5, 0.5, 2.0]
            ];
            const rhythm = getRandomItem(rhythmPatterns);
            
            let currentTick = startTick;
            for (let i = 0; i < 4; i++) {
                const note = getMidi(currentChordRoot + degrees[i], 5);
                let targetNote = note;
                while (targetNote > 74) targetNote -= 12;
                while (targetNote < 48) targetNote += 12;

                const noteDurTicks = rhythm[i] * ticksPerBeat - 10;
                events.push({
                    tick: currentTick,
                    type: 'note',
                    channel: 6,
                    note: targetNote,
                    velocity: 90 + getRandomInt(-4, 4),
                    duration: noteDurTicks
                });
                
                if (i === 3) {
                    events.push({ tick: currentTick, type: 'cc', channel: 6, controller: 1, value: 10 });
                    events.push({ tick: currentTick + noteDurTicks * 0.4, type: 'cc', channel: 6, controller: 1, value: 65 });
                    events.push({ tick: currentTick + noteDurTicks - 5, type: 'cc', channel: 6, controller: 1, value: 0 });
                }
                
                currentTick += rhythm[i] * ticksPerBeat;
            }
            beat += durationBeats;

        } else if (phraseType === "motif_sequence") {
            const durationBeats = 4.0;
            if (beat + durationBeats > maxBeats) break;

            const startTick = (startBeat + beat) * ticksPerBeat;
            
            if (!motifNotes) {
                motifNotes = [
                    getRandomItem([0, 2, 4]),
                    getRandomItem([1, 3, 5]),
                    getRandomItem([2, 4, 6])
                ];
            }
            
            const rhythm = [0.5, 0.5, 1.0]; 
            let currentTick = startTick;
            
            for (let repeat = 0; repeat < 2; repeat++) {
                for (let i = 0; i < 3; i++) {
                    const note = getMidi(currentChordRoot + motifNotes[i] + (repeat * 2), 5); 
                    let targetNote = note;
                    while (targetNote > 74) targetNote -= 12;
                    while (targetNote < 48) targetNote += 12;

                    events.push({
                        tick: currentTick,
                        type: 'note',
                        channel: 6,
                        note: targetNote,
                        velocity: 88,
                        duration: (rhythm[i] * ticksPerBeat) - 10
                    });
                    currentTick += rhythm[i] * ticksPerBeat;
                }
            }
            
            beat += durationBeats;

        } else if (phraseType === "melodic_run") {
            const runBeats = 2.0;
            if (beat + runBeats > maxBeats) break;

            const startTick = (startBeat + beat) * ticksPerBeat;
            
            const patternType = getRandomItem(["pentatonic_up", "wave_contour", "triad_skip"]);
            let scaleDegrees = [0, 1, 2, 4, 5, 6, 7, 9];
            
            if (patternType === "pentatonic_up") {
                scaleDegrees = [0, 2, 4, 7, 9, 11, 12, 14]; 
            } else if (patternType === "wave_contour") {
                scaleDegrees = [0, 2, 4, 2, 4, 7, 5, 4];   
            } else if (patternType === "triad_skip") {
                scaleDegrees = [0, 4, 2, 6, 4, 7, 9, 7];   
            }

            for (let i = 0; i < 8; i++) {
                const stepTick = startTick + (i * ticksPerBeat / 4);
                const note = getMidi(currentChordRoot + scaleDegrees[i], 5);

                let targetNote = note; 
                while (targetNote > 74) targetNote -= 12;
                while (targetNote < 48) targetNote += 12;

                const velocity = (i % 4 === 0) ? 92 : 78;

                events.push({
                    tick: stepTick,
                    type: 'note',
                    channel: 6, 
                    note: targetNote,
                    velocity: velocity + getRandomInt(-3, 3),
                    duration: (ticksPerBeat / 4) - 10
                });
            }
            
            events.push({ tick: startTick, type: 'pitch', channel: 6, value: 7800 });
            events.push({ tick: startTick + (ticksPerBeat / 4), type: 'pitch', channel: 6, value: 8192 });
            
            beat += runBeats;

        } else {
            beat += 1.0; 
        }
    }
    return events;
}

function generateArpeggio(scaleInfo, chordRoot, baseOctave, bars, startTick, ticksPerBeat, style, swingAmount = 0) {
    const events = [];
    
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
            
            if (sixteenth % 2 === 1) {
                tick += (ticksPerBeat / 4) * swingAmount;
            }
            
            const isStrongBeat = (sixteenth % 4 === 0);
            let velocity = isStrongBeat ? 64 : 48;
            velocity += getRandomInt(-5, 5);

            events.push({ 
                tick, 
                type: 'note', 
                channel: 3, 
                note: Math.min(127, Math.max(0, note)), 
                velocity, 
                duration: noteDuration 
            });
        }
    }
    return events;
}

function generateDynamicMelodicFill(scaleInfo, chordRoot, nextChordRoot, barMelody, startTick, ticksPerBeat) {
    const events = [];
    const fillStartTick = startTick + (ticksPerBeat * 3); 
    
    const currentChordNotes = getChordNotes(scaleInfo, chordRoot, 5); 
    const nextChordNotes = getChordNotes(scaleInfo, nextChordRoot, 5); 

    const styles = [
        "arpeggiated_run", 
        "syncopated_triad", 
        "suspension_resolve_clean",
        "retro_octave_jump",
        "miami_fifths",
        "pentatonic_cascade"
    ];
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
                velocity: 82,
                duration: (ticksPerBeat / 4) - 10
            });
        }
    } else if (chosenStyle === "syncopated_triad") {
        events.push({
            tick: fillStartTick,
            type: 'note',
            channel: 5,
            note: currentChordNotes[1], 
            velocity: 84,
            duration: ticksPerBeat / 2 - 10
        });
        events.push({
            tick: fillStartTick + ticksPerBeat / 2,
            type: 'note',
            channel: 5,
            note: currentChordNotes[2], 
            velocity: 88,
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
            velocity: 88,
            duration: ticksPerBeat / 2 - 10
        });
    } else if (chosenStyle === "retro_octave_jump") {
        const root = currentChordNotes[0];
        const octave = root + 12;
        const pattern = [root, octave, root, octave];
        
        for (let i = 0; i < 4; i++) {
            events.push({
                tick: fillStartTick + (i * ticksPerBeat / 4),
                type: 'note',
                channel: 5,
                note: pattern[i],
                velocity: i % 2 === 0 ? 88 : 78,
                duration: (ticksPerBeat / 4) - 15
            });
        }
    } else if (chosenStyle === "miami_fifths") {
        const root = currentChordNotes[0];
        const fifth = currentChordNotes[2];
        const octave = root + 12;
        const pattern = [root, fifth, octave, fifth];
        
        for (let i = 0; i < 4; i++) {
            events.push({
                tick: fillStartTick + (i * ticksPerBeat / 4),
                type: 'note',
                channel: 5,
                note: pattern[i],
                velocity: 90 - (i * 4), 
                duration: (ticksPerBeat / 4) - 10
            });
        }
    } else if (chosenStyle === "pentatonic_cascade") {
        const root = currentChordNotes[0];
        const pattern = [root + 12, root + 9, root + 7, root + 4]; 
        
        for (let i = 0; i < 4; i++) {
            events.push({
                tick: fillStartTick + (i * ticksPerBeat / 4),
                type: 'note',
                channel: 5,
                note: pattern[i],
                velocity: 85,
                duration: (ticksPerBeat / 4) - 10
            });
        }
    }

    return events;
}

function addDynamicTomFill(events, startTick, ticksPerBeat, intensity) {
    const styles = ["simmons_cascade", "snare_build", "syncopated_stutter", "descending_toms"];
    const chosenStyle = getRandomItem(styles);

    if (chosenStyle === "descending_toms") {
        events.push({ tick: startTick, type: 'note', channel: 9, note: 36, velocity: 100 * intensity, duration: ticksPerBeat });
        events.push({ tick: startTick + ticksPerBeat, type: 'note', channel: 9, note: 50, velocity: 85 * intensity, duration: ticksPerBeat / 4 });
        events.push({ tick: startTick + ticksPerBeat + ticksPerBeat / 2, type: 'note', channel: 9, note: 48, velocity: 85 * intensity, duration: ticksPerBeat / 4 });
        events.push({ tick: startTick + ticksPerBeat * 2, type: 'note', channel: 9, note: 45, velocity: 90 * intensity, duration: ticksPerBeat / 4 });
        events.push({ tick: startTick + ticksPerBeat * 2 + ticksPerBeat / 2, type: 'note', channel: 9, note: 43, velocity: 90 * intensity, duration: ticksPerBeat / 4 });
        events.push({ tick: startTick + ticksPerBeat * 3, type: 'note', channel: 9, note: 41, velocity: 95 * intensity, duration: ticksPerBeat / 4 });
        events.push({ tick: startTick + ticksPerBeat * 3 + ticksPerBeat / 2, type: 'note', channel: 9, note: 38, velocity: 105 * intensity, duration: ticksPerBeat / 4 });
        events.push({ tick: startTick + ticksPerBeat * 3 + ticksPerBeat / 2, type: 'note', channel: 9, note: 36, velocity: 110 * intensity, duration: ticksPerBeat / 8 });

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

function generateIntro(scaleInfo, chordProg, introStyle, startTick, ticksPerBeat, arpStyle, drumsFirst, bassMode, swingAmount = 0, doubleChordDuration = false) {
    const events = [];
    let prevChordNotes = null;
    
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
        
        for (let b = 0; b < activeBars; b++) {
            const barTick = activeStartTick + (b * 4 * ticksPerBeat);
            const chordIdx = Math.floor(b / (doubleChordDuration ? 2 : 1)) % chordProg.length;
            const chordRoot = chordProg[chordIdx];
            const chordNotes = getDreamyVoiceLedChord(scaleInfo, chordRoot, 4, prevChordNotes);
            prevChordNotes = chordNotes;

            chordNotes.forEach(note => {
                events.push({ tick: barTick, type: 'note', channel: 2, note, velocity: introStyle.padVel, duration: ticksPerBeat * 4 });
            });

            if (introStyle.hasBass) {
                const bassNoteLow = chordNotes[0] - 12;
                const bassNoteHigh = chordNotes[0];
                if (introStyle.sixteenthBass) {
                    for (let sixteenth = 0; sixteenth < 16; sixteenth++) {
                        const tick = barTick + sixteenth * (ticksPerBeat / 4);
                        if (bassMode === "split") {
                            events.push({ tick: tick, type: 'note', channel: 10, note: bassNoteLow, velocity: 75, duration: ticksPerBeat / 6 });
                            events.push({ tick: tick, type: 'note', channel: 7, note: bassNoteHigh, velocity: 65, duration: ticksPerBeat / 6 });
                        } else {
                            events.push({ tick: tick, type: 'note', channel: 1, note: bassNoteLow, velocity: 70, duration: ticksPerBeat / 6 });
                        }
                    }
                } else {
                    for (let beat = 0; beat < 4; beat++) {
                        const tick = barTick + beat * ticksPerBeat;
                        if (bassMode === "split") {
                            events.push({ tick: tick, type: 'note', channel: 10, note: bassNoteLow, velocity: 70, duration: ticksPerBeat / 2 });
                            events.push({ tick: tick, type: 'note', channel: 7, note: bassNoteHigh, velocity: 60, duration: ticksPerBeat / 2 });
                        } else {
                            events.push({ tick: tick, type: 'note', channel: 1, note: bassNoteLow, velocity: 65, duration: ticksPerBeat / 2 });
                        }
                    }
                }
            }

            if (introStyle.hasArp) {
                const arpEvents = generateArpeggio(scaleInfo, chordRoot, 5, 1, barTick, ticksPerBeat, arpStyle, swingAmount);
                events.push(...arpEvents);
            }
        }
        
    } else {
        for (let b = 0; b < introStyle.bars; b++) {
            const barTick = startTick + (b * 4 * ticksPerBeat);
            const chordIdx = Math.floor(b / (doubleChordDuration ? 2 : 1)) % chordProg.length;
            const chordRoot = chordProg[chordIdx];
            const chordNotes = getDreamyVoiceLedChord(scaleInfo, chordRoot, 4, prevChordNotes);
            prevChordNotes = chordNotes;

            chordNotes.forEach(note => {
                events.push({ tick: barTick, type: 'note', channel: 2, note, velocity: introStyle.padVel, duration: ticksPerBeat * 4 });
            });

            if (introStyle.hasBass) {
                const bassNoteLow = chordNotes[0] - 12;
                const bassNoteHigh = chordNotes[0];
                if (introStyle.sixteenthBass) {
                    for (let sixteenth = 0; sixteenth < 16; sixteenth++) {
                        const tick = barTick + sixteenth * (ticksPerBeat / 4);
                        if (bassMode === "split") {
                            events.push({ tick: tick, type: 'note', channel: 10, note: bassNoteLow, velocity: 75, duration: ticksPerBeat / 6 });
                            events.push({ tick: tick, type: 'note', channel: 7, note: bassNoteHigh, velocity: 65, duration: ticksPerBeat / 6 });
                        } else {
                            events.push({ tick: tick, type: 'note', channel: 1, note: bassNoteLow, velocity: 70, duration: ticksPerBeat / 6 });
                        }
                    }
                } else {
                    for (let beat = 0; beat < 4; beat++) {
                        const tick = barTick + beat * ticksPerBeat;
                        if (bassMode === "split") {
                            events.push({ tick: tick, type: 'note', channel: 10, note: bassNoteLow, velocity: 70, duration: ticksPerBeat / 2 });
                            events.push({ tick: tick, type: 'note', channel: 7, note: bassNoteHigh, velocity: 60, duration: ticksPerBeat / 2 });
                        } else {
                            events.push({ tick: tick, type: 'note', channel: 1, note: bassNoteLow, velocity: 65, duration: ticksPerBeat / 2 });
                        }
                    }
                }
            }

            if (introStyle.hasArp) {
                const arpEvents = generateArpeggio(scaleInfo, chordRoot, 5, 1, barTick, ticksPerBeat, arpStyle, swingAmount);
                events.push(...arpEvents);
            }

            if (introStyle.hasDrums) {
                const enableIntroFill = Math.random() < 0.8; 
                const drumBars = enableIntroFill ? (introStyle.bars - 1) : introStyle.bars;
                if (b < drumBars) {
                    events.push({ tick: barTick, type: 'note', channel: 9, note: 36, velocity: 50, duration: ticksPerBeat / 2 });
                }
                if (enableIntroFill && b === introStyle.bars - 1) {
                    addDynamicTomFill(events, barTick, ticksPerBeat, 0.85);
                }
            }

            const enableIntroHats = Math.random() < 0.85; 
            if (enableIntroHats && introStyle.bars >= 6) {
                const startBarForHats = Math.floor(introStyle.bars / 2);
                if (b >= startBarForHats) {
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
    }
    return events;
}

function generateFullSong() {
    const SONG_STRUCTURES = [
        {
            name: "CLASSIC",
            sections: [
                { name: "intro", type: "intro", isIntro: true },
                { name: "verse", type: "verse" },
                { name: "pre-chorus", type: "pre-chorus" },
                { name: "chorus", type: "chorus" },
                { name: "verse2", type: "verse" },
                { name: "pre-chorus2", type: "pre-chorus" },
                { name: "chorus2", type: "chorus" },
                { name: "bridge", type: "bridge" },
                { name: "chorus3", type: "chorus" },
                { name: "outro", type: "outro" }
            ],
            hasBridge: true,
            hasVerse2: true,
            hasChorus2: true,
            hasChorus3: true,
            hasPreChorus: true
        },
        {
            name: "SHORT",
            sections: [
                { name: "intro", type: "intro", isIntro: true },
                { name: "verse", type: "verse" },
                { name: "chorus", type: "chorus" },
                { name: "verse2", type: "verse" },
                { name: "chorus2", type: "chorus" },
                { name: "outro", type: "outro" }
            ],
            hasBridge: false,
            hasVerse2: true,
            hasChorus2: true,
            hasPreChorus: false
        },
        {
            name: "LONG",
            sections: [
                { name: "intro", type: "intro", isIntro: true },
                { name: "verse", type: "verse" },
                { name: "pre-chorus", type: "pre-chorus" },
                { name: "chorus", type: "chorus" },
                { name: "verse2", type: "verse" },
                { name: "pre-chorus2", type: "pre-chorus" },
                { name: "chorus2", type: "chorus" },
                { name: "bridge", type: "bridge" },
                { name: "verse3", type: "verse" },
                { name: "pre-chorus3", type: "pre-chorus" },
                { name: "chorus3", type: "chorus" },
                { name: "outro", type: "outro" }
            ],
            hasBridge: true,
            hasVerse2: true,
            hasChorus2: true,
            hasChorus3: true,
            hasPreChorus: true
        }
    ];

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
    
    // Tempon ylärajaa nostettu nopeampia 80-luvun synth-pop-biisejä varten, alin säilytetty
    const tempo = getRandomInt(88, 162);
    const defaultBassPatternName = getRandomItem(Object.keys(BASS_PATTERNS));
    const runPattern = getRandomItem(RUN_PATTERNS);
    const arpStyle = getRandomItem(["classic_up_down", "cyber_chase", "space_bounce", "neon_pulse", "retro_sweep", "driving_octaves"]);
    
    const songHasClap = Math.random() < 0.6; 
    const drumsFirstIntro = Math.random() < 0.25; 
    const songHasStop = Math.random() < 0.35; 
    const fadeOutChorus = Math.random() < 0.4; 
    const bassMode = Math.random() < 0.45 ? "split" : "classic"; 
    
    const doubleChordDuration = Math.random() < 0.35;

    const swingAmount = (Math.random() < 0.05) ? getRandomItem([0.2, 0.33, 0.45]) : 0;

    const rollType = Math.random() * 100;
    let melodyType = "random";
    if (rollType < 60) {
        melodyType = "rythmic";
    }
    const melodyRhythmName = getRandomItem(Object.keys(MELODY_RHYTHMS));

    const ticksPerBeat = 480;
    let allEvents = [];

    let savedVerseMelody = null;
    let savedChorusMelody = null;
    let savedPreChorusMelody = null;
    let savedVerseStartBeat = 0;
    let savedChorusStartBeat = 0;
    let savedPreChorusStartBeat = 0;
    
    // 50 % todennäköisyys melodiselle synth pop -bassokuviolle (perussävel, terssi, kvintti)
    const useSynthPopBass = Math.random() < 0.50;

    let savedVerseBass = null;
    let savedChorusBass = null;
    let savedPreChorusBass = null;
    let savedVerseBassStartBeat = 0;
    let savedChorusBassStartBeat = 0;
    let savedPreChorusBassStartBeat = 0;

    const selectedStructure = getRandomItem(SONG_STRUCTURES);
    const structureType = selectedStructure.name;

    const introStyle = getRandomItem(INTRO_STYLES);
    const bridgeStyle = getRandomItem(BRIDGE_STYLES);  
    const verseBars =  16;
    const chorusBars = 16;
    const preChorusBars = 8;
    const verse2Bars = selectedStructure.hasVerse2 ? 16 : 0;
    const chorus2Bars = selectedStructure.hasChorus2 ? 16 : 0;
    const preChorus2Bars = selectedStructure.hasVerse2 ? 8 : 0;
    const verse3Bars = selectedStructure.sections.some(s => s.name === "verse3") ? 16 : 0;
    const chorus3Bars = selectedStructure.sections.some(s => s.name === "chorus3") ? 16 : 0;
    const preChorus3Bars = selectedStructure.sections.some(s => s.name === "pre-chorus3") ? 8 : 0;
    const bridgeBars = selectedStructure.hasBridge ? getRandomInt(8, 12) : 0;
    const outroBars = getRandomInt(8, 12);

    const sections = [];
    for (let sectionDef of selectedStructure.sections) {
        let bars = 0;
        if (sectionDef.type === "intro") bars = introStyle.bars;
        else if (sectionDef.type === "verse") {
            if (sectionDef.name === "verse3") bars = verse3Bars;
            else if (sectionDef.name === "verse2") bars = verse2Bars;
            else bars = verseBars;
        }
        else if (sectionDef.type === "pre-chorus") {
            if (sectionDef.name === "pre-chorus3") bars = preChorus3Bars;
            else if (sectionDef.name === "pre-chorus2") bars = preChorus2Bars;
            else bars = preChorusBars;
        }
        else if (sectionDef.type === "chorus") {
            if (sectionDef.name === "chorus3") bars = chorus3Bars;
            else if (sectionDef.name === "chorus2") bars = chorus2Bars;
            else bars = chorusBars;
        }
        else if (sectionDef.type === "bridge") bars = bridgeBars;
        else if (sectionDef.type === "outro") bars = outroBars;
        
        if (bars > 0) {
            sections.push({
                name: sectionDef.name,
                bars: bars,
                type: sectionDef.type,
                isIntro: sectionDef.isIntro || false
            });
        }
    }

    const structure = {
        intro: introStyle.bars,
        verse: verseBars,
        preChorus: preChorusBars,
        chorus: chorusBars,
        verse2: verse2Bars,
        preChorus2: preChorus2Bars,
        chorus2: chorus2Bars,
        verse3: verse3Bars,
        preChorus3: preChorus3Bars,
        chorus3: chorus3Bars,
        bridge: bridgeBars,
        outro: outroBars,
        structureType: structureType
    };
    
    let currentBeat = 0;
    let prevChordNotes = null; 
    
    for (let s of sections) {
        let baseVol = 85;
        if (s.type === "chorus") baseVol = 120;
        else if (s.type === "verse") baseVol = 95;
        else if (s.type === "pre-chorus") baseVol = 80;
        else if (s.type === "bridge") baseVol = 70;
        
        allEvents.push({ tick: currentBeat * ticksPerBeat, type: 'section', name: s.name });
        allEvents.push({ tick: currentBeat * ticksPerBeat, type: 'cc', channel: 4, controller: 11, value: baseVol });
        
        if (s.name === "intro" || s.name === "bridge" || s.name === "pre-chorus" || s.name === "pre-chorus2" || s.name === "pre-chorus3") {
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

        const isBeforeChorus = (s.name === "pre-chorus" || s.name === "pre-chorus2" || s.name === "pre-chorus3");
        if (isBeforeChorus) {
            const riserBars = 4;
            const riserStartBar = Math.max(0, s.bars - riserBars);
            const riserStartTick = (currentBeat + riserStartBar * 4) * ticksPerBeat;
            const riserDurationTicks = riserBars * 4 * ticksPerBeat;
            
            allEvents.push({
                tick: riserStartTick,
                type: 'note',
                channel: 11,
                note: 60,
                velocity: 95,
                duration: riserDurationTicks - 20
            });
            
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
            
            if (s.type === "verse") {
                if (!savedVerseMelody) {
                    savedVerseMelody = generateMelody(scaleInfo, chordProg, s.bars, currentBeat, s.type, melodyType, melodyRhythmName, doubleChordDuration);
                    savedVerseStartBeat = currentBeat;
                    sectionMelody = savedVerseMelody;
                } else {
                    const beatDiff = currentBeat - savedVerseStartBeat;
                    const tickDiff = beatDiff * ticksPerBeat;
                    sectionMelody = savedVerseMelody.map(ev => ({
                        ...ev,
                        tick: ev.tick + tickDiff
                    }));
                }
            }
            
            else if (s.type === "pre-chorus") {
                if (!savedPreChorusMelody) {
                    savedPreChorusMelody = generateMelody(scaleInfo, chordProg, s.bars, currentBeat, s.type, melodyType, melodyRhythmName, doubleChordDuration);
                    savedPreChorusStartBeat = currentBeat;
                    sectionMelody = savedPreChorusMelody;
                } else {
                    const beatDiff = currentBeat - savedPreChorusStartBeat;
                    const tickDiff = beatDiff * ticksPerBeat;
                    sectionMelody = savedPreChorusMelody.map(ev => ({
                        ...ev,
                        tick: ev.tick + tickDiff
                    }));
                }
            }
            
            else if (s.type === "chorus") {
                if (!savedChorusMelody) {
                    savedChorusMelody = generateMelody(scaleInfo, chordProg, s.bars, currentBeat, useChorusModelInOutro ? "chorus" : s.type, melodyType, melodyRhythmName, doubleChordDuration);
                    savedChorusStartBeat = currentBeat;
                    sectionMelody = savedChorusMelody;
                } else {
                    const beatDiff = currentBeat - savedChorusStartBeat;
                    const tickDiff = beatDiff * ticksPerBeat;
                    sectionMelody = savedChorusMelody.map(ev => ({
                        ...ev,
                        tick: ev.tick + tickDiff
                    }));
                }
            }
            
            else {
                sectionMelody = generateMelody(scaleInfo, chordProg, s.bars, currentBeat, useChorusModelInOutro ? "chorus" : s.type, melodyType, melodyRhythmName, doubleChordDuration);
            }
            
            allEvents.push(...sectionMelody);
        }

        // Melodisen synth pop -bassokuvion generointi ja toistaminen vastaavissa laulurakenteissa
        let sectionBassEvents = [];
        const isMelodicSection = (s.type === "verse" || s.type === "pre-chorus" || s.type === "chorus") || (s.name === "outro" && fadeOutChorus);
        
        if (useSynthPopBass && isMelodicSection) {
            if (s.type === "verse") {
                if (!savedVerseBass) {
                    savedVerseBass = generateMelodicBass(scaleInfo, chordProg, s.bars, currentBeat, s.type, doubleChordDuration);
                    savedVerseBassStartBeat = currentBeat;
                    sectionBassEvents = savedVerseBass;
                } else {
                    const beatDiff = currentBeat - savedVerseBassStartBeat;
                    const tickDiff = beatDiff * ticksPerBeat;
                    sectionBassEvents = savedVerseBass.map(ev => ({
                        ...ev,
                        tick: ev.tick + tickDiff
                    }));
                }
            }
            else if (s.type === "pre-chorus") {
                if (!savedPreChorusBass) {
                    savedPreChorusBass = generateMelodicBass(scaleInfo, chordProg, s.bars, currentBeat, s.type, doubleChordDuration);
                    savedPreChorusBassStartBeat = currentBeat;
                    sectionBassEvents = savedPreChorusBass;
                } else {
                    const beatDiff = currentBeat - savedPreChorusBassStartBeat;
                    const tickDiff = beatDiff * ticksPerBeat;
                    sectionBassEvents = savedPreChorusBass.map(ev => ({
                        ...ev,
                        tick: ev.tick + tickDiff
                    }));
                }
            }
            else if (s.type === "chorus" || (s.name === "outro" && fadeOutChorus)) {
                if (!savedChorusBass) {
                    savedChorusBass = generateMelodicBass(scaleInfo, chordProg, s.bars, currentBeat, "chorus", doubleChordDuration);
                    savedChorusBassStartBeat = currentBeat;
                    sectionBassEvents = savedChorusBass;
                } else {
                    const beatDiff = currentBeat - savedChorusBassStartBeat;
                    const tickDiff = beatDiff * ticksPerBeat;
                    sectionBassEvents = savedChorusBass.map(ev => ({
                        ...ev,
                        tick: ev.tick + tickDiff
                    }));
                }
            }
            allEvents.push(...sectionBassEvents);
        }

        let currentBassPattern = BASS_PATTERNS[defaultBassPatternName];
        if (s.type === "chorus" || useChorusModelInOutro) {
            currentBassPattern = BASS_PATTERNS["sixteenth"];
        } else if (s.type === "verse") {
            currentBassPattern = BASS_PATTERNS["eighth"];
        } else if (s.type === "pre-chorus") {
            currentBassPattern = BASS_PATTERNS["driving"];
        }

        for (let bar = 0; bar < s.bars; bar++) {
            const chordIdx = Math.floor((currentBeat / 4 + bar) / (doubleChordDuration ? 2 : 1)) % chordProg.length;
            const nextChordIdx = Math.floor((currentBeat / 4 + bar + 1) / (doubleChordDuration ? 2 : 1)) % chordProg.length;
            const chordRoot = chordProg[chordIdx];
            const nextChordRoot = chordProg[nextChordIdx];
            
            const chordNotes = getDreamyVoiceLedChord(scaleInfo, chordRoot, 4, prevChordNotes);
            prevChordNotes = chordNotes;

            const startTick = (currentBeat + bar * 4) * ticksPerBeat;
            const barEndTick = startTick + 4 * ticksPerBeat;
            
            const barMelody = sectionMelody.filter(ev => ev.type === 'note' && ev.tick >= startTick && ev.tick < barEndTick);
            const isLastBarOfVerse = (s.name === "verse" || s.name === "verse2" || s.name === "verse3") && (bar === s.bars - 1);
            const applyStop = isLastBarOfVerse && songHasStop;
            const isArpKickPhase = (s.type === "bridge" && bridgeStyle === "arp_kick_build" && bar < 4);

            if (s.isIntro) {
                if (bar === 0) {
                    const introEvents = generateIntro(scaleInfo, chordProg, introStyle, startTick, ticksPerBeat, arpStyle, drumsFirstIntro, bassMode, swingAmount, doubleChordDuration);
                    allEvents.push(...introEvents);
                }
            }
            
            else if (s.type === "bridge") {
                if (!isArpKickPhase) {
                    chordNotes.forEach(note => {
                        allEvents.push({ tick: startTick, type: 'note', channel: 2, note, velocity: 50, duration: ticksPerBeat * 4.0 });
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
            }
            
            else {
                const sweepSteps = 5;
                for (let i = 0; i < sweepSteps; i++) {
                    const sweepTick = startTick + Math.floor((i / (sweepSteps - 1)) * 240);
                    const sweepVal = 40 + Math.floor((i / (sweepSteps - 1)) * 70);
                    allEvents.push({ tick: sweepTick, type: 'cc', channel: 2, controller: 74, value: sweepVal });
                }

                chordNotes.forEach(note => {
                    let vel = (s.type === "chorus" || useChorusModelInOutro) ? 82 : 64;
                    if (s.type === "outro") vel = 45;
                    if (s.type === "pre-chorus") vel = 55;

                    if (applyStop) {
                        allEvents.push({ tick: startTick, type: 'note', channel: 2, note, velocity: vel, duration: ticksPerBeat * 0.8 });
                    } else {
                        allEvents.push({ tick: startTick, type: 'note', channel: 2, note, velocity: vel, duration: ticksPerBeat * 4.0 });
                    }
                });
                
                // Ohitetaan standardi bassokuvio mikäli uusi synth pop -bassomelodia on päällä
                const skipStandardBass = useSynthPopBass && (s.type === "verse" || s.type === "pre-chorus" || s.type === "chorus");

                if (!skipStandardBass) {
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
            if (s.type === "pre-chorus") intensity = 0.65;
            if (s.type === "intro" && !introStyle.hasDrums) continue;
            if (s.type === "intro") intensity = 0.4;
            if (s.type === "outro") intensity = 0.35;
            
            const isLastBarOfSection = (bar === s.bars - 1);
            const transitionsToChorus = (s.name === "verse" || s.name === "verse2" || s.name === "verse3" || s.name === "bridge" || s.name === "pre-chorus" || s.name === "pre-chorus2" || s.name === "pre-chorus3");
            const isLastBarOfVerse = (s.name === "verse" || s.name === "verse2" || s.name === "verse3") && (bar === s.bars - 1);
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
            }
            
            else {
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
                    
                if (!isLastBarOfSection) {
                    allEvents.push({ tick: startTick + ticksPerBeat, type: 'note', channel: 9, note: 38, velocity: 85 * intensity, duration: ticksPerBeat / 2 });
                    allEvents.push({ tick: startTick + ticksPerBeat * 3, type: 'note', channel: 9, note: 38, velocity: 85 * intensity, duration: ticksPerBeat / 2 });
                    if (songHasClap) {
                        allEvents.push({ tick: startTick + ticksPerBeat, type: 'note', channel: 9, note: 39, velocity: 80 * intensity, duration: ticksPerBeat / 2 });
                        allEvents.push({ tick: startTick + ticksPerBeat * 3, type: 'note', channel: 9, note: 39, velocity: 80 * intensity, duration: ticksPerBeat / 2 });
                        
                        if ((bar % 4 === 1 || bar % 4 === 3) && Math.random() < 0.5) {
                            allEvents.push({ tick: startTick + ticksPerBeat * 3.5, type: 'note', channel: 9, note: 39, velocity: 85 * intensity, duration: ticksPerBeat / 4 });
                            allEvents.push({ tick: startTick + ticksPerBeat * 3.75, type: 'note', channel: 9, note: 39, velocity: 85 * intensity, duration: ticksPerBeat / 4 });
                        }
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
                    for (let i = 0; i < 16; i++) {
                        const tickOffset = i * ticksPerBeat / 4;
                        if (i === 12) {
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
                } else if (s.type === "pre-chorus") {
                    for (let i = 0; i < 8; i++) {
                        allEvents.push({ tick: startTick + i * ticksPerBeat / 2, type: 'note', channel: 9, note: 42, velocity: 62, duration: ticksPerBeat / 8 });
                    }
                }
            }
        }

        if (s.type === "bridge" || (s.type === "outro" && !fadeOutChorus)) {
            if (s.type === "outro" || bridgeStyle === "space_sweep" || bridgeStyle === "tension_builder") {
                const soloEvents = generateSolo(scaleInfo, chordProg, s.bars, currentBeat, doubleChordDuration);
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
    } // END of sections loop

    if (!fadeOutChorus) {
        const finalChordTick = currentBeat * ticksPerBeat;
        const finalChordNotes = getDreamyVoiceLedChord(scaleInfo, chordProg[0], 4, prevChordNotes); 
        
        finalChordNotes.forEach(note => {
            allEvents.push({
                tick: finalChordTick,
                type: 'note',
                channel: 2, 
                note: note,
                velocity: 80,
                duration: ticksPerBeat * 8 
            });
        });
        
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
        doubleChordDuration: doubleChordDuration,
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
        useSynthPopBass: useSynthPopBass,
        events: allEvents
    };
}

// Globaalit vientikomennot ikkunakontekstiin radio.js:ää varten
window.getRandomInt = getRandomInt;
window.generateFullSong = generateFullSong;
