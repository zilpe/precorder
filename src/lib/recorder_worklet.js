import { interleave, AudioWriter, RingBuffer } from "ringbuf.js";

const exports = {};

class RecorderWorklet extends AudioWorkletProcessor {
    constructor(options) {
        super();
        // Staging buffer to interleave the audio data.
        this.interleaved = new Float32Array(128 * 2); // stereo
        const sab = options.processorOptions;
        this._audio_writer = new AudioWriter(new RingBuffer(sab, Float32Array));
    }

    process(inputs, _outputs, _parameters) {
        this.interleaved = new Float32Array(128 * 2);
        if (inputs[0]) {
            interleave(inputs[0], this.interleaved);
            if (this._audio_writer.enqueue(this.interleaved) !== 256) {
                console.log("underrun: the worker doesn't dequeue fast enough!");
                console.log(this._audio_writer.enqueue(this.interleaved))
            }
        }
        return true;
    }
}

registerProcessor("recorder-worklet", RecorderWorklet);