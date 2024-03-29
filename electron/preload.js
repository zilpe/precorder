const { contextBridge, ipcRenderer } = require('electron')

//DELETE IN PROD CODE
contextBridge.exposeInMainWorld(
    'api',
    {node: () => process.versions.node}
)



//////////////////////
// SAVING RECORDING //
//////////////////////
// Node.js code cannot be directly called from the renderer,
// so the necessary node APIs need to be called indirectly using preload.js
// This containerises the code, making it more secure.

contextBridge.exposeInMainWorld(
    // reference in renderer using 'recordingHandler'
    'recordingHandler',

    {
        // send blob to the Main node.js process
        // blobBuffer is the parameter
        saveAudioBlob: (blobBuffer, filename) => {
            ipcRenderer.send('saveBlob', blobBuffer, filename)
        },
        onSavedAudioResponse: (callback) => {
            // receive response from the Main process
            ipcRenderer.on('savedAudioResponse', (event, message) => {
                callback(message)
            })
        }
    }
)


//////////////////////
//// FILE MANAGER ////
//////////////////////




contextBridge.exposeInMainWorld('fileManager', {
    currentDirectory: async () => {
        return ipcRenderer.invoke('getCurrentDirectory');
    },
    folderContents: async (path) => {
        return ipcRenderer.invoke('getFolderContents', path);
    },
    deleteFile: async (file) => {
        return ipcRenderer.invoke('runDeleteFile', file);
    }
});
