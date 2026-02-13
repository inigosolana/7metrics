const fs = require('fs');
const path = require('path');

async function run() {
    try {
        // Resolve path to Downloads folder from current dir (Desktop/7metrics)
        // .. -> Desktop, .. -> User, -> Downloads
        const file = path.join(__dirname, '..', '..', 'Downloads', 'Recorte1_legazpi.mp4');
        console.log('Target File:', file);

        if (!fs.existsSync(file)) {
            console.error('File not found at resolved path!');
            process.exit(1);
        }

        const stats = fs.statSync(file);
        console.log(`File size: ${stats.size} bytes`);

        // Create Blob from file buffer
        const buffer = fs.readFileSync(file);
        const blob = new Blob([buffer], { type: 'video/mp4' });

        const form = new FormData();
        form.append('file', blob, 'Recorte1_legazpi.mp4');

        console.log('Uploading to Ngrok...');
        const res = await fetch('https://euphoniously-unquilted-nichole.ngrok-free.dev/upload-match', {
            method: 'POST',
            body: form,
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log('Response:', text);

    } catch (e) {
        console.error('Upload Error:', e);
    }
}
run();
