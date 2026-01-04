import { execFile } from 'node:child_process';

export function execPromise(file: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        execFile(file, args, { windowsHide: true }, (error, stdout, stderr) => {
            if (stdout?.trim()) {
                console.log('STDOUT: ', stdout);
            }

            if (stderr?.trim()) {
                console.error('STDERR', stderr);
            }

            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}