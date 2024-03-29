<!-- TODO
1. Recording user mic as normal recording app
	- add ipc logic
2. Uploading recordings to transcription service and storing in db
3. Settings page
4. Full text search of recordings
- Buffer recording
-->

<script>
	import PouchDB from 'pouchdb'
	import { initializeApp } from "firebase/app";
	import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
	import Recorder from './lib/Recorder.svelte'
	import Files from './lib/Files.svelte'
	import Ringcorder from './lib/Ringcorder.svelte'
	const nodeVersion = api.node();

	// Block storage constants
	let app = null
	let storage = null
	// Database constants
	let localDB = null
	let remoteDB = null

	/////////////////////////////////////////////////////////////

	function uuidv4() {
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		);
	}

	function uploadData(url) {
		console.log('response: ' + url)
		let doc = {
			"_id": uuidv4(),
			"name": uuidv4(),
			"transcription": "dummy data",
			// date added is automatically stored
		};

		localDB.put(doc).then(function (response) {
			console.log('write to database worked!')
		}).catch(function (err) {
			console.log(err);
		});
	}	


	function uploadFiles(file) {

		return new Promise((resolve, reject) => {
			// Create the file metadata
			const metadata = {
				contentType: 'audio/mpeg'
			};

			let storageRef = ref(storage, file.name);
			let uploadTask = uploadBytesResumable(storageRef, file, metadata);

			// Listen for state changes, errors, and completion of the upload.
			uploadTask.on('state_changed',
				(snapshot) => {
					// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
					const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					console.log('Upload is ' + progress + '% done');
					switch (snapshot.state) {
						case 'paused':
							console.log('Upload is paused');
							break;
						case 'running':
							console.log('Upload is running');
							break;
					}
				},
				(error) => {
					console.log(error)
				},
				() => {
					// Upload completed successfully, now fetch the download URL
					getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
						resolve(downloadURL);
					});
				}
			);
		});
	}


	function initCloud() {


			// Specify bucket URL to store the recordings
			const firebaseConfig = {
				storageBucket: 'gs://recorder-9cf03.appspot.com/'
			};

			// Creating the connection to the storage bucket
			app = initializeApp(firebaseConfig);
			storage = getStorage(app);


			localDB = new PouchDB('recordings');
			remoteDB = new PouchDB('http://admin:adminadmin@31.53.109.67:5984/recordings')

			// DEBUGGING INFO.
			localDB.info().then(function (info) {
				console.log('local info')
				console.log(info);
			})
			remoteDB.info().then(function (info) {
				console.log('remote info')
				console.log(info);
			})


			// Sync the local and remote databases together
			localDB.sync(remoteDB, {
				live: true
			}).on('change', function (change) {
				console.log('le epic: something changed: ', change)
			}).on('error', function (err) {
				console.log(err)
			}).on('complete', function (info) {
				console.log('replication finished')

				console.log(info)
			}).on('active', function() {
				console.log('replication is happening')
			});


	}

	///////////////////////////////////////////////////////////////////



	async function onSubmit(e) {
		const formData = new FormData(e.target);

		// create an array so that form inputs can be easily accessed
		const data = {};
		for (let field of formData) {
			const [key, value] = field;
			data[key] = value;
		}

		console.log(data)

		const recordingURL = await uploadFiles(data.audio)
		uploadData(recordingURL)

	}

	initCloud()
</script>

<div>
<!--	<h1>Recorder</h1>

	<p>
		Node version: {nodeVersion}
	</p>

	<form on:submit|preventDefault={onSubmit}>
		<input name="name" type="text"/>
		<input name="audio" type="file">
		<button type="submit">Submit</button>
	</form>-->

	<Recorder bind:localDB bind:remoteDB/>
	<Ringcorder/>
	<Files bind:localDB bind:remoteDB/>
</div>




