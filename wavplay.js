/**
 * WAV Playback Engine for Synthwave Radio
 * Features: Multi-sampler, Web Audio DSP, Crossfade Looping, Sidechain Ducking,
 * Warm Saturation, Lush Procedural Reverb, and Brickwall Limiter.
 */

(function() {
    let audioCtx = null;
    let audioEnabled = false;
    let audioBuffers = {};
    const activeWavNotes = {}; // Keeps track of playing instances: "channel_note"

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

    // Routing Nodes
    let masterPreGain = null;
    let bassGainNode = null; // Dedicated gain node for bass channels to allow ducking
    let saturationNode = null;
    let reverbNode = null;
    let reverbDryGain = null;
    let reverbWetGain = null;
    let limiterNode = null;

    // Sustained channels that require crossfade looping
    const SUSTAINED_CHANNELS = [1, 2, 3, 4, 5, 6, 7, 10, 11];

    // Map MIDI channels and notes to sample names
    function getSampleName(channel, note) {
        if (channel === 1) return 'bass';
        if (channel === 2) return 'chords';
        if (channel === 3) return 'arp';
        if (channel === 4) return 'lead';
        if (channel === 5) return 'fills';
        if (channel === 6) return 'melody';
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

        // Dedicated Ducking/Sidechain node for Bass
        bassGainNode = audioCtx.createGain();
        bassGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);

        // Warm Saturation
        saturationNode = audioCtx.createWaveShaper();
        saturationNode.curve = makeDistortionCurve(15); // Classic warmth
        saturationNode.oversample = '4x';

        // Reverb System
        reverbNode = audioCtx.createConvolver();
        reverbNode.buffer = createReverbImpulseResponse(audioCtx, 2.5, 3.2); // Lush retro-space reverb

        reverbDryGain = audioCtx.createGain();
        reverbWetGain = audioCtx.createGain();
        reverbDryGain.gain.setValueAtTime(0.80, audioCtx.currentTime);
        reverbWetGain.gain.setValueAtTime(0.22, audioCtx.currentTime); // 22% wet mix

        // Brickwall Limiter to glue the sound and prevent clipping
        limiterNode = audioCtx.createDynamicsCompressor();
        limiterNode.threshold.setValueAtTime(-1.0, audioCtx.currentTime);
        limiterNode.knee.setValueAtTime(0.0, audioCtx.currentTime);
        limiterNode.ratio.setValueAtTime(20.0, audioCtx.currentTime);
        limiterNode.attack.setValueAtTime(0.001, audioCtx.currentTime);
        limiterNode.release.setValueAtTime(0.05, audioCtx.currentTime);

        // 2. Connect the Signal Chain
        bassGainNode.connect(masterPreGain);
        
        masterPreGain.connect(saturationNode);

        // Split dry/wet parallel reverb processing
        saturationNode.connect(reverbDryGain);
        saturationNode.connect(reverbNode);
        reverbNode.connect(reverbWetGain);

        // Combine into Master Limiter
        reverbDryGain.connect(limiterNode);
        reverbWetGain.connect(limiterNode);

        limiterNode.connect(audioCtx.destination);

        // 3. Load Samples into RAM asynchronously
        updateStatus("Loading WAV audio engine...");
        const promises = Object.keys(SAMPLE_FILES).map(async (key) => {
            try {
                const response = await fetch(SAMPLE_FILES[key]);
                const arrayBuffer = await response.arrayBuffer();
                audioBuffers[key] = await audioCtx.decodeAudioData(arrayBuffer);
            } catch (err) {
                console.error(`Failed to load WAV file: ${SAMPLE_FILES[key]}`, err);
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
        bassGainNode.gain.linearRampToValueAtTime(0.12, now + 0.025); // Fast compression down to -18dB
        bassGainNode.gain.exponentialRampToValueAtTime(1.0, now + 0.16); // Smooth return to normal level
    }

    // Helper to update status bar in HTML if present
    function updateStatus(text) {
        const el = document.getElementById('status');
        if (el) el.innerHTML = `⚡ ${text} ⚡`;
    }

    // Custom Scheduler Class for Sustained Seamless Crossfade Looping
    class LoopingNote {
        constructor(ctx, buffer, midiNote, velocity, destNode) {
            this.ctx = ctx;
            this.buffer = buffer;
            this.midiNote = midiNote;
            this.velocity = velocity;
            this.destNode = destNode;
            this.activeSources = [];
            this.stopped = false;
            
            // Pitch Shifting from base C4 (MIDI 60)
            this.playbackRate = Math.pow(2, (midiNote - 60) / 12);

            // Filter out high frequencies on soft velocities
            this.filterNode = ctx.createBiquadFilter();
            this.filterNode.type = "lowpass";
            const normVel = velocity / 127;
            const cutoffFreq = 350 + (normVel * normVel) * 19650; // Exponential lowpass feeling
            this.filterNode.frequency.setValueAtTime(cutoffFreq, ctx.currentTime);

            // Note Level Gain Node
            this.noteGainNode = ctx.createGain();
            this.noteGainNode.gain.setValueAtTime(normVel, ctx.currentTime);

            // Audio routing: NoteSource -> Filter -> NoteGain -> Destination Group
            this.filterNode.connect(this.noteGainNode);
            this.noteGainNode.connect(destNode);

            this.start();
        }

        start() {
            const now = this.ctx.currentTime;
            // Schedule the first segment: 0.0s to 1.4s
            this.scheduleSegment(now, 0.0, 1.4, true);
        }

        scheduleSegment(startTime, offset, duration, isInitial) {
            if (this.stopped) return;

            const srcNode = this.ctx.createBufferSource();
            srcNode.buffer = this.buffer;
            srcNode.playbackRate.value = this.playbackRate;

            const segmentGain = this.ctx.createGain();
            segmentGain.gain.setValueAtTime(0, startTime);

            srcNode.connect(segmentGain);
            segmentGain.connect(this.filterNode);

            this.activeSources.push({ src: srcNode, gain: segmentGain });

            // Scale timing markers according to playback rate (higher pitch = shorter file duration)
            const crossfadeDuration = 0.22; // 220ms crossfade overlap
            const scaledXfade = crossfadeDuration / this.playbackRate;
            const scaledDuration = duration / this.playbackRate;

            // Attack Fade In
            if (isInitial) {
                segmentGain.gain.linearRampToValueAtTime(1.0, startTime + 0.02);
            } else {
                segmentGain.gain.linearRampToValueAtTime(1.0, startTime + scaledXfade);
            }

            srcNode.start(startTime, offset);

            // Fade Out Scheduling
            const stopTime = startTime + scaledDuration;
            const fadeOutStartTime = stopTime - scaledXfade;

            segmentGain.gain.setValueAtTime(1.0, fadeOutStartTime);
            segmentGain.gain.linearRampToValueAtTime(0.0, stopTime);
            srcNode.stop(stopTime + 0.1);

            // Cleanup garbage collection
            setTimeout(() => {
                this.activeSources = this.activeSources.filter(item => item.src !== srcNode);
            }, (scaledDuration + 0.5) * 1000);

            // Schedule transition loop: Loop region starts at 0.4s and ends at 1.4s (Loop length = 1.0s)
            const nextSegmentStartTime = fadeOutStartTime;
            const delayMs = (fadeOutStartTime - this.ctx.currentTime) * 1000;

            if (delayMs > 0) {
                this.nextTimeout = setTimeout(() => {
                    this.scheduleSegment(this.ctx.currentTime, 0.4, 1.0, false);
                }, delayMs);
            } else {
                this.scheduleSegment(this.ctx.currentTime, 0.4, 1.0, false);
            }
        }

        stop() {
            this.stopped = true;
            clearTimeout(this.nextTimeout);
            const now = this.ctx.currentTime;

            // Soft release fadeout
            this.noteGainNode.gain.setValueAtTime(this.noteGainNode.gain.value, now);
            this.noteGainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            setTimeout(() => {
                this.activeSources.forEach(item => {
                    try { item.src.stop(); } catch(e) {}
                });
                this.noteGainNode.disconnect();
                this.filterNode.disconnect();
            }, 250);
        }
    }

    // Play Single Drum One-Shot
    function playOneShot(buffer, midiNote, velocity, destNode) {
        if (!audioCtx || !buffer) return;

        const srcNode = audioCtx.createBufferSource();
        srcNode.buffer = buffer;

        // Drum pitch adjustments (Hats and Toms slightly shifted based on note heights)
        const playbackRate = Math.pow(2, (midiNote - 42) / 36); // Slight standard shifting
        srcNode.playbackRate.value = Math.max(0.5, Math.min(2.0, playbackRate));

        const normVel = velocity / 127;

        // Apply dynamic velocity-sensitive high-cut
        const filterNode = audioCtx.createBiquadFilter();
        filterNode.type = "lowpass";
        const cutoffFreq = 800 + (normVel * normVel) * 19200;
        filterNode.frequency.setValueAtTime(cutoffFreq, audioCtx.currentTime);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(normVel, audioCtx.currentTime);

        srcNode.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(destNode);

        srcNode.start(audioCtx.currentTime);
    }

    // Handle Note-On Event Interception
    function handleWavNoteOn(channel, note, velocity) {
        if (!audioEnabled || !audioCtx) return;

        // Trigger sidechain whenever Kick is played (Ch9 note 36 or sidechain Ch8 note 36)
        if ((channel === 9 && note === 36) || (channel === 8 && note === 36)) {
            triggerSidechainDucking();
        }

        // Avoid duplicating Ch8 kick triggers as audio voices (purely used as control trigger)
        if (channel === 8) return;

        const sampleKey = getSampleName(channel, note);
        if (!sampleKey) return;

        const buffer = audioBuffers[sampleKey];
        if (!buffer) return;

        const activeKey = `${channel}_${note}`;

        // Stop existing overlapping voice on same pitch
        if (activeWavNotes[activeKey]) {
            try { activeWavNotes[activeKey].stop(); } catch(e) {}
            delete activeWavNotes[activeKey];
        }

        // Route bass elements to BassGainNode, everything else to masterPreGain
        const isBass = (channel === 1 || channel === 7 || channel === 10);
        const targetOutput = isBass ? bassGainNode : masterPreGain;

        if (SUSTAINED_CHANNELS.includes(channel)) {
            // Sustained looping note
            const loopingNote = new LoopingNote(audioCtx, buffer, note, velocity, targetOutput);
            activeWavNotes[activeKey] = loopingNote;
        } else {
            // One-shot drum hit
            playOneShot(buffer, note, velocity, targetOutput);
        }
    }

    // Handle Note-Off Event Interception
    function handleWavNoteOff(channel, note) {
        if (!audioEnabled || !audioCtx) return;
        
        const activeKey = `${channel}_${note}`;
        if (activeWavNotes[activeKey]) {
            try { activeWavNotes[activeKey].stop(); } catch(e) {}
            delete activeWavNotes[activeKey];
        }
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
            // Intercept Master Volume (CC 7) or Cutoff (CC 74) if desired
            if (event.controller === 7 && masterPreGain && audioCtx) {
                const scaledVol = (event.value / 127) * 0.75;
                masterPreGain.gain.setValueAtTime(scaledVol, audioCtx.currentTime);
            }
        }
    };

    // UI Audio Toggle Button Logic
    window.addEventListener('DOMContentLoaded', () => {
        const audioBtn = document.createElement('button');
        audioBtn.id = 'audioToggleBtn';
        audioBtn.className = 'toggle-btn';
        audioBtn.style.right = '180px'; // Places button nicely next to [ COLLAPSE ]
        audioBtn.innerText = 'AUDIO: OFF';
        document.body.appendChild(audioBtn);

        audioBtn.addEventListener('click', async () => {
            audioEnabled = !audioEnabled;
            if (audioEnabled) {
                audioBtn.innerText = 'AUDIO: ON';
                audioBtn.style.borderColor = 'var(--cyan)';
                audioBtn.style.color = 'var(--cyan)';
                audioBtn.style.textShadow = '0 0 5px var(--cyan)';
                
                // Resume Context or initialize RAM samples on first interaction
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
                
                // Suspend the audio context to stop calculations and sound immediately
                if (audioCtx && audioCtx.state === 'running') {
                    await audioCtx.suspend();
                }
                
                // Cleanup active notes array
                Object.keys(activeWavNotes).forEach(key => {
                    try { activeWavNotes[key].stop(); } catch(e) {}
                    delete activeWavNotes[key];
                });
            }
        });
    });
})();