import { parseFile } from 'music-metadata';
import { inspect } from 'util';
import { readdirSync } from 'fs';
import path from 'path';


export async function testing() {
    let epic = ''
    let filedir = '/home/arsh/recordings'
    let files = readdirSync(filedir)

    for (let child of files) {
        let metadata = await parseFile(path.join(filedir, child));
        console.log(inspect(metadata, { showHidden: false, depth: null }))
    }
}