/**
 * WAV Playback Engine for Synthwave Radio
 * Features: Polyphonic Sampler Voices, Web Audio LFO (CC 1 Vibrato), Real-time Pitch Bend,
 * Sidechain Ducking, Warm Saturation, Lush Reverb, and Custom WAV Loading.
 */

(function() {
    let audioCtx = null;
    let audioEnabled = false;
    let audioBuffers = {};
    const activeVoices = []; // Keeps track of active instrumental voices
    const activeVoiceCounts = {}; // Track count of active voices per sample for UI glow

    // Map instrument and drum names to root folder WAV files
    const SAMPLE_FILES = {
        'arp': 'arp.wav',
        'bass': 'bass.wav',
        'chords': 'chords.wav',
        'fills': 'fills.wav',
        'lead': 'lead.wav',
        'melody': 'melody.wav',
        'mid-bass': 'mid-bass.wav',
        'sub-bass': 'sub-bass.wav',
        'sweep': 'sweep.wav',
        'kick': 'kick.wav',
        'snare': 'snare.wav',
        'closed-hat': 'hi-hat-closed.wav',
        'open-hat': 'hi-hat-open.wav',
        'tom1': 'tom1.wav',
        'tom2': 'tom2.wav',
        'tom3': 'tom3.wav',
        'clap': 'clap.wav'
    };

    // Initialize counts
    Object.keys(SAMPLE_FILES).forEach(key => activeVoiceCounts[key] = 0);

    // Routing Nodes
    let masterPreGain = null;
    let bassGainNode = null; 
    let saturationNode = null;
    let reverbNode = null;
    let reverbDryGain = null;
    let reverbWetGain = null;
    let limiterNode = null;

    // Helper to map MIDI channels and notes to sample names
    function getSampleName(channel, note) {
        if (channel === 1) return 'bass';
        if (channel === 2) return 'chords';
        if (channel === 3) return 'arp';
        if (channel === 4) return 'melody'; // Melody on Channel 4 (plays melody.wav)
        if (channel === 5) return 'fills';
        if (channel === 6) return 'lead';   // Lead Solo on Channel 6 (plays lead.wav)
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

        limiterNode = audioCtx.createDynamicsCompressor();
        limiterNode.threshold.setValueAtTime(-1.0, audioCtx.currentTime);
        limiterNode.knee.setValueAtTime(0.0, audioCtx.currentTime);
        limiterNode.ratio.setValueAtTime(20.0, audioCtx.currentTime);
        limiterNode.attack.setValueAtTime(0.001, audioCtx.currentTime);
        limiterNode.release.setValueAtTime(0.05, audioCtx.currentTime);

        // 2. Connect the Signal Chain
        bassGainNode.connect(masterPreGain);
        masterPreGain.connect(saturationNode);

        saturationNode.connect(reverbDryGain);
        saturationNode.connect(reverbNode);
        reverbNode.connect(reverbWetGain);

        reverbDryGain.connect(limiterNode);
        reverbWetGain.connect(limiterNode);
        limiterNode.connect(audioCtx.destination);

        // 3. Load Samples asynchronously
        updateStatus("Loading WAV audio engine...");
        const promises = Object.keys(SAMPLE_FILES).map(async (key) => {
            try {
                const response = await fetch(SAMPLE_FILES[key]);
                const arrayBuffer = await response.arrayBuffer();
                audioBuffers[key] = await audioCtx.decodeAudioData(arrayBuffer);
            } catch (err) {
                console.warn(`Failed to fetch default WAV: ${SAMPLE_FILES[key]}, slots awaiting custom upload.`);
            }
        });

        await Promise.all(promises);
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
            audioBuffers[sampleKey] = await audioCtx.decodeAudioData(arrayBuffer);
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

    /**
     * SamplerVoice: Versatile envelope-driven voice for all instruments.
     * Supports real-time Pitch Bend and LFO Modulation Vibrato (CC 1).
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

            // 2. Filter Node (Velocity sensitive)
            this.filterNode = ctx.createBiquadFilter();
            this.filterNode.type = "lowpass";
            const normVel = velocity / 127;
            const cutoffFreq = 450 + (normVel * normVel) * 19550;
            this.filterNode.frequency.setValueAtTime(cutoffFreq, ctx.currentTime);

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

            // Audio Routing
            this.srcNode.connect(this.filterNode);
            this.filterNode.connect(this.gainNode);
            this.gainNode.connect(destNode);

            this.lfo.start();
            incrementVoiceCount(sampleKey);

            this.start();
        }

        start() {
            const now = this.ctx.currentTime;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.linearRampToValueAtTime(this.velocity / 127, now + 0.025); // 25ms attack
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
            try { this.filterNode.disconnect(); } catch(e) {}
            try { this.lfoGain.disconnect(); } catch(e) {}
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

        const filterNode = audioCtx.createBiquadFilter();
        filterNode.type = "lowpass";
        const cutoffFreq = 800 + (normVel * normVel) * 19200;
        filterNode.frequency.setValueAtTime(cutoffFreq, audioCtx.currentTime);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(normVel, audioCtx.currentTime);

        srcNode.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(destNode);

        incrementVoiceCount(sampleKey);
        srcNode.start(audioCtx.currentTime);

        srcNode.onended = () => {
            decrementVoiceCount(sampleKey);
            gainNode.disconnect();
            filterNode.disconnect();
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

        const buffer = audioBuffers[sampleKey];
        if (!buffer) return;

        // Stop existing overlapping voice on same pitch on this channel
        activeVoices.forEach(voice => {
            if (voice.channel === channel && voice.midiNote === note) {
                voice.stop();
            }
        });

        const isBass = (channel === 1 || channel === 7 || channel === 10);
        const targetOutput = isBass ? bassGainNode : masterPreGain;

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
