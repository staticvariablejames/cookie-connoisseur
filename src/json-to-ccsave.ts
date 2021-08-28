import { CCSave } from './ccsave';

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
    let str = process.stdin.read();
    if(!str) return;

    str = str.trim();

    let save = CCSave.fromObject(JSON.parse(str), console.error);

    console.log(CCSave.toStringSave(save));
});
