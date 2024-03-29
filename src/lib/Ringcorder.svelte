<script>
  import { onMount } from "svelte";
  import { RingBuffer } from "ringbuf.js";

  let worker;
  var ac = new AudioContext;
  var micStream = null;
  var mic = null

  async function setupWorker(sab, sampleRate) {
    // The Web Worker can receive two commands:
    // - on "init", it starts periodically reading from the queue and
    //  accumulating audio data.
    // - on "stop", it takes all this accumulated audio data, converts to PCM16
    // instead of float32 and turns the stream into a WAV file, sending it back
    // to the main thread to offer it as download.

    worker = new Worker('/src/lib/wav_writer.js', { type: 'module' });
    console.log(worker)
    worker.postMessage({command: "init",
      sab: sab,
      channelCount: 2,
      sampleRate: sampleRate});

    worker.onmessage = function(e) {
      var a = document.createElement( 'a' );
      a.style.display = 'none';
      document.body.appendChild(a);
      const blob = new Blob([e.data], {type: 'audio/wav'});
      a.href = URL.createObjectURL( blob );
      a.download =  `audio-${(new Date()).toISOString().replace(/[^0-9]/g, "")}.wav`;
      a.click();
    }
  }

  async function setupWebAudio(ac, sab) {
    ac.resume();


    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: true,
        echoCancellation: false,
        latency: 0,
        noiseSuppression: false,
        volume: 1.5
      },
    });

    mic = ac.createMediaStreamSource(micStream)
    let recorderWorklet = new AudioWorkletNode(ac, "recorder-worklet", {processorOptions: sab});

    mic.connect(recorderWorklet)
  }


  onMount(() => {

    let startstop = document.getElementById('startstop')

    if (ac.audioWorklet === undefined) {
      alert("No AudioWorklet, try another browser.");
    } else {
      ac.audioWorklet.addModule('/src/lib/recorder_worklet.js').then(() => {
        startstop.disabled = false;
        startstop.onclick = function() {
          if (startstop.innerText == "Start") {
            // One second of stereo Float32 PCM ought to be plentiful.
            var sab = RingBuffer.getStorageForCapacity(ac.sampleRate * 2, Float32Array);

            setupWorker(sab, ac.sampleRate);
            setupWebAudio(ac, sab);

            startstop.innerText = "Stop";
          } else {
            worker.postMessage({"command": "stop"})
            ac.suspend();
            micStream.getTracks().forEach(track => track.stop());

            startstop.innerText = "Start";
          }
        }
      });
    }
  })




</script>

<button id="startstop">
  Start
</button>
