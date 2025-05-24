// fastmark
var params = new URLSearchParams(window.location.search);


function hexToRgba(hex, alpha = 1) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }
    if (hex.length !== 6) throw new Error('Invalid HEX color.');
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

async function imagejs(url, config) {
    let image = await IJS.Image.load(url);

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(await createImageBitmap(await fetch(url).then(r => r.blob())), 0, 0);

    if (config) {
        config = JSON.parse(config);
        if (config.artist) {
            if (config.style == "INV") {
                const text = config.artist + " - " + config.message;
                // Dynamically adjust font size based on text width and image width
                let fontSize = Math.round(image.height / 15);
                ctx.font = `${fontSize}px Arial`;
                let textWidth = ctx.measureText(text).width;
                const maxWidth = image.width * 0.8;
                while (textWidth > maxWidth && fontSize > 10) {
                    fontSize--;
                    ctx.font = `${fontSize}px Arial`;
                    textWidth = ctx.measureText(text).width;
                }
                ctx.font = `${fontSize}px Arial`;
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = hexToRgba(config.color, config.transparency);
                const lineHeight = fontSize * 1.2;
                const startY = Math.round(image.height / 10);
                const startX = Math.round(image.width / 20);
                var xm = true;
                const maxY = image.height - fontSize;

                for (let y = startY; y < maxY; y += lineHeight) {
                    if (xm) {
                        ctx.fillText(text, startX, y);
                        xm = false;
                    } else {
                        ctx.fillText(text, image.width - ctx.measureText(text).width - startX, y);
                        xm = true;
                    }
                }
                ctx.globalAlpha = 1.0;
            }
            else {
                const text = config.artist + " - " + config.message;
                // Dynamically adjust font size based on text width and image width
                let fontSize = Math.round(image.height / 25);
                ctx.font = `${fontSize}px Arial`;
                let textWidth = ctx.measureText(text).width;
                const maxWidth = image.width * 0.8;
                while (textWidth > maxWidth && fontSize > 10) {
                    fontSize--;
                    ctx.font = `${fontSize}px Arial`;
                    textWidth = ctx.measureText(text).width;
                }
                ctx.font = `${fontSize}px Arial`;
                ctx.globalAlpha = 1;
                ctx.fillStyle = hexToRgba(config.color, 0.6);
                const lineHeight = fontSize * 1.2;
                const startY = Math.round(image.height / 10);
                const startX = Math.round(image.width / 20);
                ctx.fillText(text, startX, startY);
            }
        }
    }

    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        window.location.replace(url);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }, 'image/png');

    document.body.removeChild(canvas);
}

document.body.addEventListener('drop', async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const blob = new Blob([await file.arrayBuffer()], { type: file.type });
            const url = URL.createObjectURL(blob);
            imagejs(url, localStorage.getItem('fastmark'));
        }
    }
});

document.body.addEventListener('dragover', (event) => {
    event.preventDefault();
});

document.body.addEventListener('keydown', (event) => {
    if (event.ctrlKey && !params.has('previewInfo')) {
        localStorage.removeItem('fastmark');
        window.location.href = 'setup.html';
    }
});

if (localStorage.getItem('fastmark') == null && !params.has('previewInfo')) {
    window.alert('Welcome! Let\'s set up your FastMark settings.');
    window.location.href = 'setup.html';
}
else if (params.has('previewInfo')) {
    document.querySelector(".gr").innerHTML = "<p>opening example...</p>";
    fetch("example.jpg").then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            imagejs(url, (atob(params.get('previewInfo'))));
        })
        .catch(error => {
            console.error('Error loading example image:', error);
            document.body.innerHTML = "<p>Error loading example image.</p>";
        });
}