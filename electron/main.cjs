// Modules to control application life and create native browser window
const { log } = require('console')
const crypto = require('crypto');
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs');
let {  readdir, stat, readlink } = require("fs/promises")
const os = require('os');
const trash = require("trash")

///////////////////////////////////////////////////////////////////////////
//////////////////////////// DEFAULT CODE /////////////////////////////////
///////////////////////////////////////////////////////////////////////////

if (require('electron-squirrel-startup')) app.quit();

const isDevEnvironment = process.env.DEV_ENV === 'true'

// enable live reload for electron in dev mode
if (isDevEnvironment) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

let mainWindow;

const createWindow = () => {
    
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1800,
        height: 1000,
        nodeIntegrationInWorker: true,
        nodeIntegration: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false
        }
    })

    // define how electron will load the app
    if (isDevEnvironment) {

        // if your vite app is running on a different port, change it here
        mainWindow.loadURL('http://localhost:5173/');

        // Open the DevTools.
        mainWindow.webContents.on("did-frame-finish-load", () => {
            mainWindow.webContents.openDevTools();
        });

        log('Electron running in dev mode: 🧪')

    } else {
        
        // when not in dev mode, load the build file instead
        mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));

        log('Electron running in prod mode: 🚀')
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') app.quit()
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// import('./testing.mjs').then(format => {
//     console.log('le epic')
//     format.testing();
// });


app.whenReady().then(() => {
})

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


//////////////////////
// SAVING RECORDING //
//////////////////////

ipcMain.on('saveBlob', (event, blobBuffer, filename) => {
    console.log('Saving process started')

    // The location to store the recordings
    const filePath = path.join('./recordings/' + filename + '.wav')

    // Save the recording
    // blobBuffer is the parameter, and there is a callback
    fs.writeFile(filePath, blobBuffer, (err) => {
        // if the callback isn't empty, display an error
        if (err) {
            console.error('Failed to save audio: ', err)
            event.reply('savedAudioResponse', 'error')//
        // otherwise, it's a success
        } else {
            console.log('Audio saved successfully!')
            event.reply('savedAudioResponse', 'success')
        }
    })
})






//////////////////////
//// FILE MANAGER ////
//////////////////////

let fileInfo = async (basePath, entry) => {
    let {name} = entry
    let fullPath = path.join(basePath, name)
    let fileStat

    // Check if file is missing/corrupted link
    try {
        fileStat = await stat(fullPath)
    } catch {
        return {
            name,
            type: "broken",
        }
    }

    let {size, mtime} = fileStat
    return {
        name,
        size,
        mtime
    }
}


ipcMain.handle('getCurrentDirectory', async (event) => {
    return process.cwd();
});

ipcMain.handle('getFolderContents', async (event, path) => {
    try {
        //reading the directory using fs/promises (built into node.js)
        let items = await fs.promises.readdir(path, {withFileTypes: true})

        // creates a new array with extra details for every item
        return await Promise.all(items.map(entry => fileInfo(path, entry)))
    } catch (error) {
        console.error('Error reading folder contents:', error)
        throw error;
    }
})


ipcMain.handle('runDeleteFile', async (event, file) => {
    try {
        await trash(file);
        console.log('deleted ' + file)
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
})




