<script>
    import { onMount } from "svelte";


    //ASYNC FUNCTION
    onMount(async () => {


        const stopButton = document.getElementById('stop');
        const startButton = document.getElementById('start')

        let mediaRecorder;
        let stream;


        startButton.addEventListener('click', async function() {
            let recordedChunks = [];

            // gain microphone access, then call the recording function
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            const options = {mimeType: 'audio/webm'};
            mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.start();


            mediaRecorder.addEventListener('dataavailable', function(e) {
                if (e.data.size > 0) recordedChunks.push(e.data);
            });

            mediaRecorder.addEventListener('stop', function() {
                const blobby = new Blob(recordedChunks, { type: 'audio/webm' })
                console.log(blobby)
                console.log(blobby.type)

                const reader = new FileReader();
                reader.onload = function(e) {
                    const srcUrl = e.target.result;
                    const player = document.getElementById("player")
                    player.src = srcUrl;
                };
                reader.readAsDataURL(blobby);

                saveFile(blobby)

            });
        });


        stopButton.addEventListener('click', function() {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
        });

    })

    async function saveFile(blobby) {

        let filename = crypto.randomUUID()

        console.warn('saving file')
        blobby.arrayBuffer().then(arrayBuffer => {
            const buffer = new Uint8Array(arrayBuffer)
            window.recordingHandler.saveAudioBlob(buffer, filename)
        })
    }

    window.recordingHandler.onSavedAudioResponse((message) => {
        if (message === 'success') {
            console.log('Audio saved successfully!');
        } else {
            console.error('Error saving audio.');
        }
    });


</script>

<button id="start">Start</button>
<button id="stop">Stop</button>
<audio id="player" controls></audio>

