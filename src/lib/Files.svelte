<script>

    import PouchDB from 'pouchdb'
    export let localDB;




    ///////////////////////
    //// FILE HANDLING ////
    ///////////////////////

    // the default location for recordings
    const folderPath = 'C:\\src\\recorder\\recordings'

    /*    window.fileManager.currentDirectory().then(currentDir => {
        console.log('Current Directory:', currentDir);
    });
    window.fileManager.folderContents(folderPath).then(contents => {
        console.log('Folder Contents:', contents);
    });*/

    // fetching the files takes time, so we have to wait (i.e. a promise)
    $: filesPromise = window.fileManager.folderContents(folderPath)

    // when the delete button for a file is pressed, it is moved to the recycle bin
    async function deleteFile(file) {
        await window.fileManager.deleteFile(folderPath + '\\' + file)
    }
</script>


<h1>Recordings</h1>

{#await filesPromise}
{:then files}
    <div class="file-list">
        {#each files as file}
            <div>{file.name}</div>
            <audio controls src={folderPath + '/' + file.name}/>
            <div>{file.size ? file.size : ""}</div>
            <div>{file.mtime ? file.mtime.toDateString() : ""}</div>
            <button on:click={deleteFile(file.name)}>Delete</button>
        {/each}
    </div>
{/await}

<style>
    :global(body) {
    background-color: #444;
    color: #ccc;
}
    .file-list {
        display: grid;
        grid-template-columns: 3fr 2fr 1fr 1fr 0.5fr;
        text-align: left
    }
</style>