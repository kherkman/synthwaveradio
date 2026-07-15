/**
 * WAV Playback Engine for Synthwave Radio - Optimized Version
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

    // Alustetaan oletusarvot globaalisti
    const wavDefaults = {};
    Object.keys(SAMPLE_FILES).forEach(key => {
        let defaultVol = 0.6;
        if (key === 'arp') {
            defaultVol = 1.0;
        } else if (key === 'closed-hat') {
            defaultVol = 0.6;
        } else if (DRUM_KEYS.includes(key)) {
            defaultVol = 0.8;
        } else if (key === 'chords') {
            defaultVol = 0.8;
        } else if (key === 'lead') {
            defaultVol = 0.6;
        } else if (key === 'melody') {
            defaultVol = 0.7;
        }
        wavDefaults[key] = { volume: defaultVol, pan: 0.0 };
    });
    window.wavDefaults = wavDefaults;

    if (!window.wavSettings) {
        window.wavSettings = {};
    }
    Object.keys(SAMPLE_FILES).forEach(key => {
        activeVoiceCounts[key] = 0;
        if (!window.wavSettings[key]) {
            window.wavSettings[key] = {
                volume: window.wavDefaults[key].volume,
                pan: window.wavDefaults[key].pan
            };
        }
    });

    // Pysyvät kanavakiskot tallennetaan tähän objektiin
    const channelBusses = {};

    // Routing Nodes
    let masterPreGain = null;
    let bassGainNode = null; 
    let saturationNode = null;
    let reverbNode = null;
    let reverbDryGain = null;
    let reverbWetGain = null;
    let limiterNode = null;

    let melodyLeadInputNode = null;
    let chordsInputNode = null;
    let masterHPFNode = null;
    let masterLPFNode = null;
    let masterDynamicEQ = null;

    // Luo pysyvän efektikiskon yhdelle kanavalle
    function createChannelBus(key) {
        const bus = {};
        bus.input = audioCtx.createGain();
        
        bus.hpf = audioCtx.createBiquadFilter();
        bus.hpf.type = "highpass";
        const filterDefaults = CHANNEL_FILTERS[key] || { hpf: 20, lpf: 20000 };
        bus.hpf.frequency.setValueAtTime(filterDefaults.hpf, audioCtx.currentTime);

        bus.lpf = audioCtx.createBiquadFilter();
        bus.lpf.type = "lowpass";
        bus.lpf.frequency.setValueAtTime(filterDefaults.lpf, audioCtx.currentTime);

        bus.panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
        if (bus.panner) {
            const initPan = window.wavSettings[key] ? window.wavSettings[key].pan : 0.0;
            bus.panner.pan.setValueAtTime(initPan, audioCtx.currentTime);
        }

        bus.gain = audioCtx.createGain();
        const userVol = window.wavSettings[key] ? window.wavSettings[key].volume : 0.8;
        bus.gain.gain.setValueAtTime(userVol, audioCtx.currentTime);

        // input -> hpf -> lpf -> panner -> gain
        bus.input.connect(bus.hpf);
        bus.hpf.connect(bus.lpf);
        if (bus.panner) {
            bus.lpf.connect(bus.panner);
            bus.panner.connect(bus.gain);
        } else {
            bus.lpf.connect(bus.gain);
        }

        // Reititys eteenpäin oikeaan aliryhmään
        const isBass = (key === 'bass' || key === 'mid-bass' || key === 'sub-bass');
        if (isBass) {
            bus.gain.connect(bassGainNode);
        } else if (key === 'melody' || key === 'lead') {
            bus.gain.connect(melodyLeadInputNode);
        } else if (key === 'chords') {
            bus.gain.connect(chordsInputNode);
        } else {
            bus.gain.connect(masterPreGain);
        }

        return bus;
    }

    window.resetWavSettings = function() {
        if (!window.wavDefaults) return;
        Object.keys(window.wavDefaults).forEach(key => {
            if (!window.wavSettings[key]) {
                window.wavSettings[key] = {};
            }
            window.wavSettings[key].volume = window.wavDefaults[key].volume;
            window.wavSettings[key].pan = window.wavDefaults[key].pan;

            const bus = channelBusses[key];
            if (bus && audioCtx) {
                bus.gain.gain.setTargetAtTime(window.wavDefaults[key].volume, audioCtx.currentTime, 0.02);
                if (bus.panner) {
                    bus.panner.pan.setTargetAtTime(window.wavDefaults[key].pan, audioCtx.currentTime, 0.02);
                }
            }
        });
    };

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

    function incrementVoiceCount(sampleKey) {
        if (!activeVoiceCounts[sampleKey]) activeVoiceCounts[sampleKey] = 0;
        activeVoiceCounts[sampleKey]++;
        const btn = document.getElementById(`wav-btn-${sampleKey}`);
        if (btn) btn.classList.add('wav-playing');
    }

    function decrementVoiceCount(sampleKey) {
        if (activeVoiceCounts[sampleKey] > 0) activeVoiceCounts[sampleKey]--;
        if (activeVoiceCounts[sampleKey] === 0) {
            const btn = document.getElementById(`wav-btn-${sampleKey}`);
            if (btn) btn.classList.remove('wav-playing');
        }
    }

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

    function createStereoWidener(ctx, delayTime) {
        const input = ctx.createGain();
        const splitter = ctx.createChannelSplitter(2);
        const merger = ctx.createChannelMerger(2);
        const delayL = ctx.createDelay();
        const delayR = ctx.createDelay();
        delayL.delayTime.setValueAtTime(0.0, ctx.currentTime);
        delayR.delayTime.setValueAtTime(delayTime, ctx.currentTime);
        input.connect(splitter);
        splitter.connect(delayL, 0);
        splitter.connect(delayR, 1);
        delayL.connect(merger, 0, 0);
        delayR.connect(merger, 0, 1);
        return { input, output: merger };
    }

    function createChorusEffect(ctx) {
        const input = ctx.createGain();
        const output = ctx.createGain();
        const dryGain = ctx.createGain();
        dryGain.gain.setValueAtTime(0.70, ctx.currentTime);
        const wetGain = ctx.createGain();
        wetGain.gain.setValueAtTime(0.30, ctx.currentTime);
        const delayNode = ctx.createDelay(0.1);
        delayNode.delayTime.setValueAtTime(0.025, ctx.currentTime);
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(1.2, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.002, ctx.currentTime);
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

    function createDelayEffect(ctx) {
        const input = ctx.createGain();
        const output = ctx.createGain();
        const delayNode = ctx.createDelay(1.0);
        delayNode.delayTime.setValueAtTime(0.350, ctx.currentTime);
        const feedbackGain = ctx.createGain();
        feedbackGain.gain.setValueAtTime(0.42, ctx.currentTime);
        const filterNode = ctx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2200, ctx.currentTime);
        input.connect(delayNode);
        delayNode.connect(filterNode);
        filterNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);
        const wetGain = ctx.createGain();
        wetGain.gain.setValueAtTime(0.30, ctx.currentTime);
        filterNode.connect(wetGain);
        wetGain.connect(output);
        const dryGain = ctx.createGain();
        dryGain.gain.setValueAtTime(1.0, ctx.currentTime);
        input.connect(dryGain);
        dryGain.connect(output);
        return { input, output };
    }

    function create3BandDynamicEQ(ctx) {
        const input = ctx.createGain();
        const output = ctx.createGain();
        const lowFilter = ctx.createBiquadFilter();
        lowFilter.type = 'lowpass';
        lowFilter.frequency.setValueAtTime(220, ctx.currentTime);
        lowFilter.Q.setValueAtTime(0.7, ctx.currentTime);
        const lowComp = ctx.createDynamicsCompressor();
        lowComp.threshold.setValueAtTime(-14, ctx.currentTime);
        lowComp.knee.setValueAtTime(6.0, ctx.currentTime);
        lowComp.ratio.setValueAtTime(3.0, ctx.currentTime);
        lowComp.attack.setValueAtTime(0.015, ctx.currentTime);
        lowComp.release.setValueAtTime(0.12, ctx.currentTime);
        const midLPF = ctx.createBiquadFilter();
        midLPF.type = 'lowpass';
        midLPF.frequency.setValueAtTime(3800, ctx.currentTime);
        const midHPF = ctx.createBiquadFilter();
        midHPF.type = 'highpass';
        midHPF.frequency.setValueAtTime(220, ctx.currentTime);
        const midComp = ctx.createDynamicsCompressor();
        midComp.threshold.setValueAtTime(-18, ctx.currentTime);
        midComp.knee.setValueAtTime(10.0, ctx.currentTime);
        midComp.ratio.setValueAtTime(2.0, ctx.currentTime);
        midComp.attack.setValueAtTime(0.025, ctx.currentTime);
        midComp.release.setValueAtTime(0.18, ctx.currentTime);
        const highFilter = ctx.createBiquadFilter();
        highFilter.type = 'highpass';
        highFilter.frequency.setValueAtTime(3800, ctx.currentTime);
        const highComp = ctx.createDynamicsCompressor();
        highComp.threshold.setValueAtTime(-16, ctx.currentTime);
        highComp.knee.setValueAtTime(8.0, ctx.currentTime);
        highComp.ratio.setValueAtTime(2.5, ctx.currentTime);
        highComp.attack.setValueAtTime(0.010, ctx.currentTime);
        highComp.release.setValueAtTime(0.15, ctx.currentTime);
        input.connect(lowFilter);
        lowFilter.connect(lowComp);
        lowComp.connect(output);
        input.connect(midLPF);
        midLPF.connect(midHPF);
        midHPF.connect(midComp);
        midComp.connect(output);
        input.connect(highFilter);
        highFilter.connect(highComp);
        highComp.connect(output);
        return { input, output };
    }

    async function initAudioEngine() {
        if (audioCtx) return;

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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

        masterHPFNode = audioCtx.createBiquadFilter();
        masterHPFNode.type = "highpass";
        masterHPFNode.frequency.setValueAtTime(30, audioCtx.currentTime);

        masterLPFNode = audioCtx.createBiquadFilter();
        masterLPFNode.type = "lowpass";
        masterLPFNode.frequency.setValueAtTime(16000, audioCtx.currentTime);

        masterDynamicEQ = create3BandDynamicEQ(audioCtx);

        limiterNode = audioCtx.createDynamicsCompressor();
        limiterNode.threshold.setValueAtTime(-1.0, audioCtx.currentTime);
        limiterNode.knee.setValueAtTime(0.0, audioCtx.currentTime);
        limiterNode.ratio.setValueAtTime(20.0, audioCtx.currentTime);
        limiterNode.attack.setValueAtTime(0.001, audioCtx.currentTime);
        limiterNode.release.setValueAtTime(0.05, audioCtx.currentTime);

        melodyLeadInputNode = audioCtx.createGain();
        const melodyLeadChorus = createChorusEffect(audioCtx);
        const melodyLeadDelay = createDelayEffect(audioCtx);
        melodyLeadInputNode.connect(melodyLeadChorus.input);
        melodyLeadChorus.output.connect(melodyLeadDelay.input);
        melodyLeadDelay.output.connect(masterPreGain);

        chordsInputNode = audioCtx.createGain();
        const chordsWidener = createStereoWidener(audioCtx, 0.022);
        chordsInputNode.connect(chordsWidener.input);
        chordsWidener.output.connect(masterPreGain);

        bassGainNode.connect(masterPreGain);
        masterPreGain.connect(saturationNode);
        saturationNode.connect(reverbDryGain);
        saturationNode.connect(reverbNode);
        reverbNode.connect(reverbWetGain);

        reverbDryGain.connect(masterHPFNode);
        reverbWetGain.connect(masterHPFNode);
        masterHPFNode.connect(masterLPFNode);
        masterLPFNode.connect(masterDynamicEQ.input);
        masterDynamicEQ.output.connect(limiterNode);
        limiterNode.connect(audioCtx.destination);

        // Alustetaan pysyvät kanavakiskot (Persistent Channel Busses)
        Object.keys(SAMPLE_FILES).forEach(key => {
            channelBusses[key] = createChannelBus(key);
        });

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
        window.selectRandomSongVariants();
        updateStatus("WAV audio engine ready");
    }

    function triggerSidechainDucking() {
        if (!audioCtx || !bassGainNode) return;
        const now = audioCtx.currentTime;
        bassGainNode.gain.cancelScheduledValues(now);
        bassGainNode.gain.setValueAtTime(bassGainNode.gain.value, now);
        bassGainNode.gain.linearRampToValueAtTime(0.12, now + 0.025); 
        bassGainNode.gain.exponentialRampToValueAtTime(1.0, now + 0.16); 
    }

    function updateStatus(text) {
        const el = document.getElementById('status');
        if (el) el.innerHTML = `⚡ ${text} ⚡`;
    }

    window.loadCustomWav = async function(sampleKey, file) {
        if (!audioCtx) {
            await initAudioEngine();
        }
        try {
            const arrayBuffer = await file.arrayBuffer();
            const decoded = await audioCtx.decodeAudioData(arrayBuffer);
            audioBuffers[sampleKey] = [decoded];
            activeSongBuffers[sampleKey] = decoded;
            updateStatus(`LOADED CUSTOM ${sampleKey.toUpperCase()}.WAV`);
            const btn = document.getElementById(`wav-btn-${sampleKey}`);
            if (btn) {
                btn.style.borderColor = 'var(--cyan)';
                setTimeout(() => { btn.style.borderColor = ''; }, 600);
            }
        } catch (err) {
            console.error(`Failed to load custom WAV for ${sampleKey}:`, err);
            alert(`Virhe näytettä ladattaessa.`);
        }
    };

    window.updateWavVolume = function(sampleKey, vol) {
        if (!window.wavSettings) window.wavSettings = {};
        window.wavSettings[sampleKey].volume = parseFloat(vol);
        const bus = channelBusses[sampleKey];
        if (bus && audioCtx) {
            bus.gain.gain.setTargetAtTime(parseFloat(vol), audioCtx.currentTime, 0.02);
        }
    };

    window.updateWavPan = function(sampleKey, pan) {
        if (!window.wavSettings) window.wavSettings = {};
        window.wavSettings[sampleKey].pan = parseFloat(pan);
        const bus = channelBusses[sampleKey];
        if (bus && bus.panner && audioCtx) {
            bus.panner.pan.setTargetAtTime(parseFloat(pan), audioCtx.currentTime, 0.02);
        }
    };

    /**
     * SamplerVoice: Optimized, uses persistent Channel Bus routing.
     */
    class SamplerVoice {
        constructor(ctx, buffer, midiNote, velocity, destBus, sampleKey, channel) {
            this.ctx = ctx;
            this.buffer = buffer;
            this.midiNote = midiNote;
            this.velocity = velocity;
            this.destBus = destBus; // persistent channelBusses[sampleKey]
            this.sampleKey = sampleKey;
            this.channel = channel;
            this.stopped = false;
            this.cleaned = false;

            this.baseDetune = (midiNote - 60) * 100;
            this.pitchBendCents = 0;

            // 1. Source Node
            this.srcNode = ctx.createBufferSource();
            this.srcNode.buffer = buffer;
            this.srcNode.detune.setValueAtTime(this.baseDetune, ctx.currentTime);

            // Moduloidaan lennossa pysyvän kiskon suodatinta herkemmin suoraan nuotin velocitystä
            const filterDefaults = CHANNEL_FILTERS[sampleKey] || { lpf: 20000 };
            const normVel = velocity / 127;
            const cutoffFreq = filterDefaults.lpf * (0.4 + 0.6 * normVel);
            destBus.lpf.frequency.setTargetAtTime(Math.min(20000, cutoffFreq), ctx.currentTime, 0.01);

            // 2. Kevyt LFO Modulaattori (Vibrato)
            this.lfo = ctx.createOscillator();
            this.lfo.frequency.setValueAtTime(6.0, ctx.currentTime);
            this.lfoGain = ctx.createGain();
            this.lfoGain.gain.setValueAtTime(0.0, ctx.currentTime);
            this.lfo.connect(this.lfoGain);
            this.lfoGain.connect(this.srcNode.detune);

            // 3. Nuottikohtainen vahvistus ADSR-vaippaa varten
            this.gainNode = ctx.createGain();
            this.gainNode.gain.setValueAtTime(0.001, ctx.currentTime);

            // Reititys: Source -> Nuottikohtainen gain -> Pysyvän kiskon sisääntulo
            this.srcNode.connect(this.gainNode);
            this.gainNode.connect(destBus.input);

            this.lfo.start();
            incrementVoiceCount(sampleKey);
            this.start();
        }

        start() {
            const now = this.ctx.currentTime;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(0.001, now);
            
            // Skaalataan velocity suoraan nuottikohtaisella tasolla (kiskon master-volume ohjaa lopputulosta)
            this.gainNode.gain.linearRampToValueAtTime(this.velocity / 127, now + 0.025); 
            this.srcNode.start(now);

            this.srcNode.onended = () => {
                this.cleanup();
            };
        }

        setPitchBend(pitchValue) {
            const bendRatio = (pitchValue - 8192) / 8192;
            this.pitchBendCents = bendRatio * 200;
            const now = this.ctx.currentTime;
            this.srcNode.detune.setTargetAtTime(this.baseDetune + this.pitchBendCents, now, 0.035);
        }

        setVibratoDepth(ccValue) {
            let maxCents = 45;
            if (this.sampleKey === 'chords') {
                maxCents = 10;
            }
            const depthCents = (ccValue / 127) * maxCents;
            const now = this.ctx.currentTime;
            this.lfoGain.gain.setTargetAtTime(depthCents, now, 0.035);
        }

        stop() {
            if (this.stopped) return;
            this.stopped = true;
            
            const now = this.ctx.currentTime;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
            this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.16); // 160ms release

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
            try { this.srcNode.disconnect(); } catch(e) {}
            try { this.lfoGain.disconnect(); } catch(e) {}
        }
    }

    function playOneShot(buffer, midiNote, velocity, sampleKey) {
        if (!audioCtx || !buffer) return;

        const srcNode = audioCtx.createBufferSource();
        srcNode.buffer = buffer;

        const playbackRate = Math.pow(2, (midiNote - 42) / 36); 
        srcNode.playbackRate.value = Math.max(0.5, Math.min(2.0, playbackRate));

        const normVel = velocity / 127;
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(normVel, audioCtx.currentTime);

        const bus = channelBusses[sampleKey];
        if (bus) {
            srcNode.connect(gainNode);
            gainNode.connect(bus.input);
        }

        incrementVoiceCount(sampleKey);
        srcNode.start(audioCtx.currentTime);

        srcNode.onended = () => {
            decrementVoiceCount(sampleKey);
            try { gainNode.disconnect(); } catch(e) {}
            try { srcNode.disconnect(); } catch(e) {}
        };
    }

    function handleWavNoteOn(channel, note, velocity) {
        if (!audioEnabled || !audioCtx) return;

        if ((channel === 9 && note === 36) || (channel === 8 && note === 36)) {
            triggerSidechainDucking();
        }

        if (channel === 8) return;

        const sampleKey = getSampleName(channel, note);
        if (!sampleKey) return;

        const buffer = activeSongBuffers[sampleKey];
        if (!buffer) return;

        activeVoices.forEach(voice => {
            if (voice.channel === channel && voice.midiNote === note) {
                voice.stop();
            }
        });

        if (channel === 9) {
            playOneShot(buffer, note, velocity, sampleKey);
        } else {
            const voice = new SamplerVoice(audioCtx, buffer, note, velocity, channelBusses[sampleKey], sampleKey, channel);
            activeVoices.push(voice);
        }
    }

    function handleWavNoteOff(channel, note) {
        if (!audioEnabled || !audioCtx) return;
        activeVoices.forEach(voice => {
            if (voice.channel === channel && voice.midiNote === note) {
                voice.stop();
            }
        });
    }

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
            if (event.controller === 7 && masterPreGain && audioCtx) {
                const scaledVol = (event.value / 127) * 0.75;
                masterPreGain.gain.setValueAtTime(scaledVol, audioCtx.currentTime);
            }
            activeVoices.forEach(voice => {
                if (voice.channel === channel) {
                    voice.setVibratoDepth(event.value);
                }
            });
        } else if (event.type === 'pitch') {
            const channel = event.channel;
            activeVoices.forEach(voice => {
                if (voice.channel === channel) {
                    voice.setPitchBend(event.value);
                }
            });
        }
    };

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