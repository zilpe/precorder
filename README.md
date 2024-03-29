# Retrospective Audio Recorder - A-Level Project

A desktop app which continuously records audio in the background using a circular queue to minimise memory usage. 

### Key features:
* Cloud syncing of recordings, including automatic uploads and downloads of files and metadata. 
* Transcription of recordings using Microsoft Azure's service
* Hands-free access to capture recordings using an audible keyword.
* A modern user interface that is simple to use, responsive and accessible.
### Technologies used
* Electron.js (user interface and backend)
* Svelte.js (web framework)
* Firebase (for file storage)
* CouchDB (for database and replication of metadata)
* TensorFlow (for CNN model)
* Librosa (for realtime audio processing)
# Running locally
Clone the repository, enter the directory, then after running `npm install`, run
### `npm run dev`
(Node.js  needs to be installed)

