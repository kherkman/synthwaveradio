/**
 * WAV Playback Engine for Synthwave Radio
 * Features: Polyphonic Sampler Voices, Web Audio LFO (CC 1 Vibrato), Real-time Pitch Bend,
 * Sidechain Ducking, Warm Saturation, Lush Reverb, and Custom WAV Loading with VOL/PAN.
 * Enhanced with channel-specific HPF/LPF, Master HPF/LPF, and dedicated Chorus + Delay for Melody & Lead.
 */

(function() {
    let audioCtx = null;
    let audioEnabled = false;
    let audioBuffers = {}; // Holds arrays of decoded AudioBuffers for each sample key
    let activeSongBuffers = {}; // Holds the single chosen AudioBuffer for the currently playing song
    const activeVoices = []; // Keeps track of active instrumental voices
    const activeVoiceCounts = {}; // Track count of active voices per sample for UI glow

    // Map instrument and drum names to root folder WAV files.
    const SAMPLE_FILES = {
        'arp': ['arp.wav', 'arp2.wav'],
        'bass': ['bass.wav', 'bass2.wav'],
        'chords': ['chords.wav', 'chords2.wav'],
        'fills': ['fills.wav'],
        'lead': ['lead.wav'],
        'melody': ['melody.wav', 'melody2.wav'],
        'mid-bass': ['mid-bass.wav'],
        'sub-bass': ['sub-bass.wav'],
        'sweep': ['sweep.wav'],
        'kick': ['kick.wav', 'kick2.wav'],
        'snare': ['snare.wav'],
        'closed-hat': ['hi-hat-closed.wav'],
        'open-hat': ['hi-hat-open.wav'],
        'tom1': ['tom1.wav'],
        'tom2': ['tom2.wav'],
        'tom3': ['tom3.wav'],
        'clap': ['clap.wav']
    };

    const DRUM_KEYS = ['kick', 'snare', 'clap', 'closed-hat', 'open-hat', 'tom1', 'tom2', 'tom3'];

    // Tailored channel filters to keep the mix clean and prevent frequency build-up
    const CHANNEL_FILTERS = {
        'bass': { hpf: 30, lpf: 800 },
        'sub-bass': { hpf: 20, lpf: 180 },
        'mid-bass': { hpf: 75, lpf: 1500 },
        'kick': { hpf: 30, lpf: 3500 },
        'snare': { hpf: 150, lpf: 10000 },
        'clap': { hpf: 180, lpf: 9000 },
        'closed-hat': { hpf: 350, lpf: 16000 },
        'open-hat': { hpf: 300, lpf: 16000 },
        'tom1': { hpf: 90, lpf: 7000 },
        'tom2': { hpf: 80, lpf: 6000 },
        'tom3': { hpf: 70, lpf: 5000 },
        'chords': { hpf: 150, lpf: 9000 },
        'arp': { hpf: 140, lpf: 11000 },
        'melody': { hpf: 130, lpf: 12000 },
        'lead': { hpf: 120, lpf: 12000 },
        'fills': { hpf: 140, lpf: 11000 },
        'sweep': { hpf: 100, lpf: 14000 }
    };

    // Initialize custom volume/pan settings if not already present globally
    if (!window.wavSettings) {
        window.wavSettings = {};
    }
    Object.keys(SAMPLE_FILES).forEach(key => {
        activeVoiceCounts[key] = 0;
        if (!window.wavSettings[key]) {
            // Apply customized default volumes as requested
            let defaultVol = DRUM_KEYS.includes(key) ? 0.8 : 0.6;
            if (key === 'melody' || key === 'lead') {
                defaultVol = 0.6; // Default 60%
            } else if (key === 'chords') {
                defaultVol = 0.9; // Default 90%
            }
            window.wavSettings[key] = { volume: defaultVol, pan: 0.0 };
        }
    });

    // Routing Nodes
    let masterPreGain = null;
    let bassGainNode = null; 
    let saturationNode = null;
    let reverbNode = null;
    let reverbDryGain = null;
    let reverbWetGain = null;
    let limiterNode = null;

    // Dedicated Effects Path Nodes for Melody & Lead
    let melodyLeadInputNode = null;
    let masterHPFNode = null;
    let masterLPFNode = null;

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
        
        if (channel === 9) { // Drums and Claps
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

    // Selects one random variant from the decoded options for each instrument to be used during the active song.
    window.selectRandomSongVariants = function() {
        Object.keys(SAMPLE_FILES).forEach(key => {
            const buffers = audioBuffers[key];
            if (buffers && buffers.length > 0) {
                const randomIndex = Math.floor(Math.random() * buffers.length);
                activeSongBuffers[key] = buffers[randomIndex];
            } else {
                activeSongBuffers[key] = null;
            }
        });
    };

    // UI Voice glowing activation helpers
    function incrementVoiceCount(sampleKey) {
        if (!activeVoiceCounts[sampleKey]) activeVoiceCounts[sampleKey] = 0;
        activeVoiceCounts[sampleKey]++;
        
        const btn = document.getElementById(`wav-btn-${sampleKey}`);
        if (btn) {
            btn.classList.add('wav-playing');
        }
    }

    function decrementVoiceCount(sampleKey) {
        if (activeVoiceCounts[sampleKey] > 0) {
            activeVoiceCounts[sampleKey]--;
        }
        if (activeVoiceCounts[sampleKey] === 0) {
            const btn = document.getElementById(`wav-btn-${sampleKey}`);
            if (btn) {
                btn.classList.remove('wav-playing');
            }
        }
    }

    // Generate Warm Saturation Curve
    function makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 20;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 15 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    // Generate Procedural Lush Impulse Response for Reverb
    function createReverbImpulseResponse(ctx, duration, decay) {
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
            const pct = i / length;
            const envelope = Math.pow(1 - pct, decay);
            left[i] = (Math.random() * 2 - 1) * envelope;
            right[i] = (Math.random() * 2 - 1) * envelope;
        }
        return impulse;
    }

    // Dynamic Stereo Chorus module for classic retro thickness and stereo widening
    function createChorusEffect(ctx) {
        const input = ctx.createGain();
        const output = ctx.createGain();
        
        const dryGain = ctx.createGain();
        dryGain.gain.setValueAtTime(0.70, ctx.currentTime); // Dry signaali
        
        const wetGain = ctx.createGain();
        wetGain.gain.setValueAtTime(0.30, ctx.currentTime); // Wet signaali
        
        const delayNode = ctx.createDelay(0.1);
        delayNode.delayTime.setValueAtTime(0.025, ctx.currentTime); // 25ms base delay
        
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(1.2, ctx.currentTime); // LFO rate 
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.002, ctx.currentTime); // modulation depth
        
        lfo.connect(lfoGain);
        lfoGain.connect(delayNode.delayTime);
        lfo.start();
        
        input.connect(dryGain);
        dryGain.connect(output);
        
        input.connect(delayNode);
        delayNode.connect(wetGain);
        wetGain.connect(output);
        
        return { input, output };
    }

    // Dynamic Feedback Delay module with warm analog-style repeats
    function createDelayEffect(ctx) {
        const input = ctx.createGain();
        const output = ctx.createGain();
        
        const delayNode = ctx.createDelay(1.0);
        delayNode.delayTime.setValueAtTime(0.350, ctx.currentTime); // 350ms delay time
        
        const feedbackGain = ctx.createGain();
        feedbackGain.gain.setValueAtTime(0.42, ctx.currentTime); // 42% feedback
        
        const filterNode = ctx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2200, ctx.currentTime); // Analog-style darker repeats
        
        input.connect(delayNode);
        delayNode.connect(filterNode);
        filterNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);
        
        const wetGain = ctx.createGain();
        wetGain.gain.setValueAtTime(0.30, ctx.currentTime); // Delay wet mix level
        filterNode.connect(wetGain);
        wetGain.connect(output);
        
        const dryGain = ctx.createGain();
        dryGain.gain.setValueAtTime(1.0, ctx.currentTime);
        input.connect(dryGain);
        dryGain.connect(output);
        
        return { input, output };
    }

    // Initialize Web Audio API and load samples
    async function initAudioEngine() {
        if (audioCtx) return;

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // 1. Setup Master Routing Nodes
        masterPreGain = audioCtx.createGain();
        masterPreGain.gain.setValueAtTime(0.75, audioCtx.currentTime);

        bassGainNode = audioCtx.createGain();
        bassGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);

        saturationNode = audioCtx.createWaveShaper();
        saturationNode.curve = makeDistortionCurve(15); 
        saturationNode.oversample = '4x';

        reverbNode = audioCtx.createConvolver();
        reverbNode.buffer = createReverbImpulseResponse(audioCtx, 2.5, 3.2); 

        reverbDryGain = audioCtx.createGain();
        reverbWetGain = audioCtx.createGain();
        reverbDryGain.gain.setValueAtTime(0.80, audioCtx.currentTime);
        reverbWetGain.gain.setValueAtTime(0.22, audioCtx.currentTime); 

        // Master HPF & LPF Filter Setup
        masterHPFNode = audioCtx.createBiquadFilter();
        masterHPFNode.type = "highpass";
        masterHPFNode.frequency.setValueAtTime(30, audioCtx.currentTime); // Cleans out master sub-mumble

        masterLPFNode = audioCtx.createBiquadFilter();
        masterLPFNode.type = "lowpass";
        masterLPFNode.frequency.setValueAtTime(16000, audioCtx.currentTime); // Warm vintage roll-off

        limiterNode = audioCtx.createDynamicsCompressor();
        limiterNode.threshold.setValueAtTime(-1.0, audioCtx.currentTime);
        limiterNode.knee.setValueAtTime(0.0, audioCtx.currentTime);
        limiterNode.ratio.setValueAtTime(20.0, audioCtx.currentTime);
        limiterNode.attack.setValueAtTime(0.001, audioCtx.currentTime);
        limiterNode.release.setValueAtTime(0.05, audioCtx.currentTime);

        // 2. Setup Dedicated Melody & Lead FX chain
        melodyLeadInputNode = audioCtx.createGain();
        const melodyLeadChorus = createChorusEffect(audioCtx);
        const melodyLeadDelay = createDelayEffect(audioCtx);

        melodyLeadInputNode.connect(melodyLeadChorus.input);
        melodyLeadChorus.output.connect(melodyLeadDelay.input);
        melodyLeadDelay.output.connect(masterPreGain);

        // 3. Connect Master Signal Chain
        bassGainNode.connect(masterPreGain);
        masterPreGain.connect(saturationNode);

        saturationNode.connect(reverbDryGain);
        saturationNode.connect(reverbNode);
        reverbNode.connect(reverbWetGain);

        // Connect both dry and wet master lines to master HPF/LPF
        reverbDryGain.connect(masterHPFNode);
        reverbWetGain.connect(masterHPFNode);

        masterHPFNode.connect(masterLPFNode);
        masterLPFNode.connect(limiterNode);
        limiterNode.connect(audioCtx.destination);

        // 4. Load Samples asynchronously
        updateStatus("Loading WAV audio engine...");
        const promises = Object.keys(SAMPLE_FILES).map(async (key) => {
            audioBuffers[key] = [];
            const files = SAMPLE_FILES[key];
            const filePromises = files.map(async (filePath) => {
                try {
                    const response = await fetch(filePath);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const arrayBuffer = await response.arrayBuffer();
                    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                    audioBuffers[key].push(decodedBuffer);
                } catch (err) {
                    console.warn(`Failed to fetch/decode default WAV: ${filePath}. Error: ${err.message}`);
                }
            });
            await Promise.all(filePromises);
        });

        await Promise.all(promises);

        // Select initial random variants once loaded
        window.selectRandomSongVariants();

        updateStatus("WAV audio engine ready");
    }

    // Pumping kick ducking sidechain envelope
    function triggerSidechainDucking() {
        if (!audioCtx || !bassGainNode) return;
        const now = audioCtx.currentTime;
        bassGainNode.gain.cancelScheduledValues(now);
        bassGainNode.gain.setValueAtTime(bassGainNode.gain.value, now);
        bassGainNode.gain.linearRampToValueAtTime(0.12, now + 0.025); 
        bassGainNode.gain.exponentialRampToValueAtTime(1.0, now + 0.16); 
    }

    // Helper to update status bar in HTML if present
    function updateStatus(text) {
        const el = document.getElementById('status');
        if (el) el.innerHTML = `⚡ ${text} ⚡`;
    }

    // Global custom WAV loader exporter
    window.loadCustomWav = async function(sampleKey, file) {
        if (!audioCtx) {
            await initAudioEngine();
        }
        try {
            const arrayBuffer = await file.arrayBuffer();
            const decoded = await audioCtx.decodeAudioData(arrayBuffer);
            
            // Overwrite the options list with the uploaded file to lock it as the only active buffer
            audioBuffers[sampleKey] = [decoded];
            activeSongBuffers[sampleKey] = decoded;
            
            updateStatus(`LOADED CUSTOM ${sampleKey.toUpperCase()}.WAV`);
            
            // Short neon flash to confirm upload
            const btn = document.getElementById(`wav-btn-${sampleKey}`);
            if (btn) {
                btn.style.borderColor = 'var(--cyan)';
                setTimeout(() => { btn.style.borderColor = ''; }, 600);
            }
        } catch (err) {
            console.error(`Failed to load custom WAV for ${sampleKey}:`, err);
            alert(`Virhe käsiteltäessä näytettä ${sampleKey}. Varmista, että tiedosto on korruptoimaton .wav-muotoinen äänitiedosto.`);
        }
    };

    // Real-time voice parameter updates mapped from micro-dials
    window.updateWavVolume = function(sampleKey, vol) {
        if (!window.wavSettings) window.wavSettings = {};
        if (!window.wavSettings[sampleKey]) {
            const defaultVol = DRUM_KEYS.includes(sampleKey) ? 0.8 : 0.6;
            window.wavSettings[sampleKey] = { volume: defaultVol, pan: 0.0 };
        }
        window.wavSettings[sampleKey].volume = parseFloat(vol);
        
        activeVoices.forEach(voice => {
            if (voice.sampleKey === sampleKey && !voice.stopped) {
                const now = voice.ctx.currentTime;
                const finalVol = (voice.velocity / 127) * parseFloat(vol);
                voice.gainNode.gain.cancelScheduledValues(now);
                voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
                voice.gainNode.gain.setTargetAtTime(finalVol, now, 0.03);
            }
        });
    };

    window.updateWavPan = function(sampleKey, pan) {
        if (!window.wavSettings) window.wavSettings = {};
        if (!window.wavSettings[sampleKey]) window.wavSettings[sampleKey] = { volume: 0.8, pan: 0.0 };
        window.wavSettings[sampleKey].pan = parseFloat(pan);

        activeVoices.forEach(voice => {
            if (voice.sampleKey === sampleKey && voice.pannerNode && !voice.stopped) {
                const now = voice.ctx.currentTime;
                voice.pannerNode.pan.setTargetAtTime(parseFloat(pan), now, 0.03);
            }
        });
    };

    /**
     * SamplerVoice: Versatile envelope-driven voice for all instruments.
     * Supports real-time Pitch Bend, LFO Modulation Vibrato (CC 1), Stereo Panning, and channel filters.
     */
    class SamplerVoice {
        constructor(ctx, buffer, midiNote, velocity, destNode, sampleKey, channel) {
            this.ctx = ctx;
            this.buffer = buffer;
            this.midiNote = midiNote;
            this.velocity = velocity;
            this.destNode = destNode;
            this.sampleKey = sampleKey;
            this.channel = channel;
            this.stopped = false;
            this.cleaned = false;

            // Pitch Shifting in cents relative to base C4 (MIDI 60)
            this.baseDetune = (midiNote - 60) * 100;
            this.pitchBendCents = 0;

            // 1. Source Node
            this.srcNode = ctx.createBufferSource();
            this.srcNode.buffer = buffer;
            this.srcNode.detune.setValueAtTime(this.baseDetune, ctx.currentTime);

            // 2. Channel-specific High-Pass and Low-Pass Filters in series
            this.hpfNode = ctx.createBiquadFilter();
            this.hpfNode.type = "highpass";
            this.lpfNode = ctx.createBiquadFilter();
            this.lpfNode.type = "lowpass";

            const filterDefaults = CHANNEL_FILTERS[sampleKey] || { hpf: 20, lpf: 20000 };
            this.hpfNode.frequency.setValueAtTime(filterDefaults.hpf, ctx.currentTime);

            // Apply expressive velocity tracking to LPF cutoff
            const normVel = velocity / 127;
            const cutoffFreq = filterDefaults.lpf * (0.4 + 0.6 * normVel);
            this.lpfNode.frequency.setValueAtTime(Math.min(20000, cutoffFreq), ctx.currentTime);

            // 3. Vibrato LFO Modulator (CC 1 Mod Wheel)
            this.lfo = ctx.createOscillator();
            this.lfo.frequency.setValueAtTime(6.0, ctx.currentTime); // 6 Hz vibrato
            this.lfoGain = ctx.createGain();
            this.lfoGain.gain.setValueAtTime(0.0, ctx.currentTime); 

            this.lfo.connect(this.lfoGain);
            this.lfoGain.connect(this.srcNode.detune);

            // 4. Volume Gain Node with soft ADSR envelope
            this.gainNode = ctx.createGain();
            this.gainNode.gain.setValueAtTime(0.001, ctx.currentTime);

            // 5. Stereo Panner Node
            this.pannerNode = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
            if (this.pannerNode) {
                const initPan = window.wavSettings[sampleKey] ? window.wavSettings[sampleKey].pan : 0.0;
                this.pannerNode.pan.setValueAtTime(initPan, ctx.currentTime);
            }

            // Audio Routing: Source -> HPF -> LPF -> Volume -> Pan -> Destination
            this.srcNode.connect(this.hpfNode);
            this.hpfNode.connect(this.lpfNode);
            this.lpfNode.connect(this.gainNode);
            
            if (this.pannerNode) {
                this.gainNode.connect(this.pannerNode);
                this.pannerNode.connect(destNode);
            } else {
                this.gainNode.connect(destNode);
            }

            this.lfo.start();
            incrementVoiceCount(sampleKey);

            this.start();
        }

        start() {
            const now = this.ctx.currentTime;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(0.001, now); // Anchor gain level to prevent clicks/glitches
            const defaultVol = DRUM_KEYS.includes(this.sampleKey) ? 0.8 : 0.6;
            const userVol = window.wavSettings[this.sampleKey] ? window.wavSettings[this.sampleKey].volume : defaultVol;
            this.gainNode.gain.linearRampToValueAtTime((this.velocity / 127) * userVol, now + 0.025); // 25ms attack
            this.srcNode.start(now);

            // Cleanup when buffer finishes playing naturally
            this.srcNode.onended = () => {
                this.cleanup();
            };
        }

        setPitchBend(pitchValue) {
            // MIDI pitch bend is 0..16383, center is 8192. Detune range ±2 semitones (±200 cents)
            const bendRatio = (pitchValue - 8192) / 8192;
            this.pitchBendCents = bendRatio * 200;
            
            const now = this.ctx.currentTime;
            this.srcNode.detune.setTargetAtTime(this.baseDetune + this.pitchBendCents, now, 0.035);
        }

        setVibratoDepth(ccValue) {
            // Map Mod Wheel 0..127 to 0..45 cents of pitch vibrato modulation depth
            const depthCents = (ccValue / 127) * 45;
            const now = this.ctx.currentTime;
            this.lfoGain.gain.setTargetAtTime(depthCents, now, 0.035);
        }

        stop() {
            if (this.stopped) return;
            this.stopped = true;
            
            const now = this.ctx.currentTime;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
            this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.16); // 160ms soft release

            setTimeout(() => {
                try { this.srcNode.stop(); } catch(e) {}
                try { this.lfo.stop(); } catch(e) {}
                this.cleanup();
            }, 200);
        }

        cleanup() {
            if (this.cleaned) return;
            this.cleaned = true;
            decrementVoiceCount(this.sampleKey);

            const idx = activeVoices.indexOf(this);
            if (idx > -1) activeVoices.splice(idx, 1);

            try { this.gainNode.disconnect(); } catch(e) {}
            try { this.hpfNode.disconnect(); } catch(e) {}
            try { this.lpfNode.disconnect(); } catch(e) {}
            try { this.lfoGain.disconnect(); } catch(e) {}
            try { if (this.pannerNode) this.pannerNode.disconnect(); } catch(e) {}
        }
    }

    // Play Single Drum One-Shot
    function playOneShot(buffer, midiNote, velocity, destNode, sampleKey) {
        if (!audioCtx || !buffer) return;

        const srcNode = audioCtx.createBufferSource();
        srcNode.buffer = buffer;

        // Drum pitch shifting (Hats and Toms slightly shifted based on note heights)
        const playbackRate = Math.pow(2, (midiNote - 42) / 36); 
        srcNode.playbackRate.value = Math.max(0.5, Math.min(2.0, playbackRate));

        const normVel = velocity / 127;
        const userVol = window.wavSettings[sampleKey] ? window.wavSettings[sampleKey].volume : 0.8;

        // Drum-specific clean filter series
        const hpfNode = audioCtx.createBiquadFilter();
        hpfNode.type = "highpass";
        const lpfNode = audioCtx.createBiquadFilter();
        lpfNode.type = "lowpass";

        const filterDefaults = CHANNEL_FILTERS[sampleKey] || { hpf: 20, lpf: 20000 };
        hpfNode.frequency.setValueAtTime(filterDefaults.hpf, audioCtx.currentTime);

        const cutoffFreq = filterDefaults.lpf * (0.6 + 0.4 * normVel);
        lpfNode.frequency.setValueAtTime(Math.min(20000, cutoffFreq), audioCtx.currentTime);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(normVel * userVol, audioCtx.currentTime);

        const pannerNode = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
        if (pannerNode) {
            const initPan = window.wavSettings[sampleKey] ? window.wavSettings[sampleKey].pan : 0.0;
            pannerNode.pan.setValueAtTime(initPan, audioCtx.currentTime);
        }

        // Routing: Source -> HPF -> LPF -> Volume -> Pan -> Destination
        srcNode.connect(hpfNode);
        hpfNode.connect(lpfNode);
        lpfNode.connect(gainNode);
        
        if (pannerNode) {
            gainNode.connect(pannerNode);
            pannerNode.connect(destNode);
        } else {
            gainNode.connect(destNode);
        }

        incrementVoiceCount(sampleKey);
        srcNode.start(audioCtx.currentTime);

        srcNode.onended = () => {
            decrementVoiceCount(sampleKey);
            try { gainNode.disconnect(); } catch(e) {}
            try { hpfNode.disconnect(); } catch(e) {}
            try { lpfNode.disconnect(); } catch(e) {}
            try { if (pannerNode) pannerNode.disconnect(); } catch(e) {}
        };
    }

    // Handle Note-On Event Interception
    function handleWavNoteOn(channel, note, velocity) {
        if (!audioEnabled || !audioCtx) return;

        // Trigger sidechain whenever Kick is played (Ch9 note 36 or sidechain Ch8 note 36)
        if ((channel === 9 && note === 36) || (channel === 8 && note === 36)) {
            triggerSidechainDucking();
        }

        // Avoid duplicating Ch8 kick triggers as audio voices
        if (channel === 8) return;

        const sampleKey = getSampleName(channel, note);
        if (!sampleKey) return;

        // Fetch the currently active buffer variant for the active song
        const buffer = activeSongBuffers[sampleKey];
        if (!buffer) return;

        // Stop existing overlapping voice on same pitch on this channel
        activeVoices.forEach(voice => {
            if (voice.channel === channel && voice.midiNote === note) {
                voice.stop();
            }
        });

        // Determine destination routing
        const isBass = (channel === 1 || channel === 7 || channel === 10);
        let targetOutput = masterPreGain;

        if (isBass) {
            targetOutput = bassGainNode;
        } else if (sampleKey === 'melody' || sampleKey === 'lead') {
            // Routaa Melody ja Lead omaan Chorus + Delay FX väyläänsä
            targetOutput = melodyLeadInputNode;
        }

        if (channel === 9) {
            // One-shot drum hit
            playOneShot(buffer, note, velocity, targetOutput, sampleKey);
        } else {
            // Sustained or expressive instrumental voice (Bass, Chords, Lead, Melody, Arp, Sweep)
            const voice = new SamplerVoice(audioCtx, buffer, note, velocity, targetOutput, sampleKey, channel);
            activeVoices.push(voice);
        }
    }

    // Handle Note-Off Event Interception
    function handleWavNoteOff(channel, note) {
        if (!audioEnabled || !audioCtx) return;
        
        activeVoices.forEach(voice => {
            if (voice.channel === channel && voice.midiNote === note) {
                voice.stop();
            }
        });
    }

    // Global MIDI Hook mapped directly from radio.js
    window.onMIDIEvent = function(event) {
        if (!event) return;

        if (event.type === 'note') {
            const channel = event.channel;
            const note = event.note;
            const velocity = event.velocity;

            if (velocity > 0) {
                handleWavNoteOn(channel, note, velocity);
            } else {
                handleWavNoteOff(channel, note);
            }
        } else if (event.type === 'cc') {
            const channel = event.channel;
            
            // CC 7: Global Volume pre-gain scaling
            if (event.controller === 7 && masterPreGain && audioCtx) {
                const scaledVol = (event.value / 127) * 0.75;
                masterPreGain.gain.setValueAtTime(scaledVol, audioCtx.currentTime);
            }
            
            // CC 1: Real-time Vibrato Depth scaling (on Lead solo Channel 6, etc.)
            activeVoices.forEach(voice => {
                if (voice.channel === channel) {
                    voice.setVibratoDepth(event.value);
                }
            });
        } else if (event.type === 'pitch') {
            const channel = event.channel;
            
            // Real-time Pitch Bend detune scaling
            activeVoices.forEach(voice => {
                if (voice.channel === channel) {
                    voice.setPitchBend(event.value);
                }
            });
        }
    };

    // UI Audio Toggle Button Logic
    window.addEventListener('DOMContentLoaded', () => {
        const audioBtn = document.createElement('button');
        audioBtn.id = 'audioToggleBtn';
        audioBtn.className = 'toggle-btn';
        audioBtn.style.right = '180px'; 
        audioBtn.innerText = 'AUDIO: OFF';
        document.body.appendChild(audioBtn);

        audioBtn.addEventListener('click', async () => {
            audioEnabled = !audioEnabled;
            if (audioEnabled) {
                audioBtn.innerText = 'AUDIO: ON';
                audioBtn.style.borderColor = 'var(--cyan)';
                audioBtn.style.color = 'var(--cyan)';
                audioBtn.style.textShadow = '0 0 5px var(--cyan)';
                
                if (!audioCtx) {
                    await initAudioEngine();
                } else if (audioCtx.state === 'suspended') {
                    await audioCtx.resume();
                }
            } else {
                audioBtn.innerText = 'AUDIO: OFF';
                audioBtn.style.borderColor = 'var(--magenta)';
                audioBtn.style.color = 'var(--magenta)';
                audioBtn.style.textShadow = '0 0 5px var(--magenta)';
                
                if (audioCtx && audioCtx.state === 'running') {
                    await audioCtx.suspend();
                }
                
                activeVoices.forEach(voice => voice.stop());
            }
        });
    });
})();
