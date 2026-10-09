const phrases = [
    "I love you", "Te amo", "Je t'aime", "Ich liebe dich", "Ti amo", 
    "Eu te amo", "Я тебя люблю", "愛してる", "사랑해", "我爱你", 
    "Seni seviyorum", "Σ' αγαπώ", "Kocham cię", "Ik hou van jou", 
    "Jag älskar dig", "Minä rakastan sinua", "Miluji tě", "Szeretlek", 
    "Te iubesc", "Aku cinta kamu", "Mahal kita", "Anh yêu em", "ฉันรักเธอ"
];

const container = document.getElementById('heart-container');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const music = document.getElementById('bg-music');

// Setup canvas context to measure text widths dynamically
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let placedBoxes = [];

function measureTextWidth(text, fontSize) {
    ctx.font = `bold ${fontSize}px sans-serif`;
    return ctx.measureText(text).width;
}

function checkCollision(box) {
    const padding = 2; // Keep at least 2px space between words
    for (let b of placedBoxes) {
        if (box.right + padding > b.left - padding && 
            box.left - padding < b.right + padding &&
            box.bottom + padding > b.top - padding && 
            box.top - padding < b.bottom + padding) {
            return true; // Overlap detected
        }
    }
    return false; // Safe to place
}

function getHeartPosition(t, scale) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x * scale, y: y * scale };
}

function createWord(x, y, centerX, centerY, text, delay, fontSize) {
    const textElement = document.createElement('div');
    textElement.className = 'love-text';
    textElement.textContent = text;
    textElement.style.left = `${centerX + x}px`;
    textElement.style.top = `${centerY + y}px`;
    textElement.style.animationDelay = `${delay}s`;
    textElement.style.fontSize = `${fontSize}px`;
    
    container.appendChild(textElement);
}

function createHeart() {
    placedBoxes = []; // Reset on each creation
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const scale = Math.min(window.innerWidth, window.innerHeight) / 45; 

    let globalDelay = 0;

    // 1. Draw Outline with collision detection
    const outlineSteps = 250; // finely sample points
    for (let i = 0; i < outlineSteps; i++) {
        const t = (i / outlineSteps) * Math.PI * 2;
        const pos = getHeartPosition(t, scale);
        
        const phrase = phrases[i % phrases.length];
        const fontSize = 15;
        
        const width = measureTextWidth(phrase, fontSize);
        const height = fontSize * 1.2; // Approximate height
        
        const box = {
            left: centerX + pos.x - width / 2,
            right: centerX + pos.x + width / 2,
            top: centerY + pos.y - height / 2,
            bottom: centerY + pos.y + height / 2
        };
        
        if (!checkCollision(box)) {
            placedBoxes.push(box);
            createWord(pos.x, pos.y, centerX, centerY, phrase, globalDelay, fontSize);
            globalDelay += 0.15; // Slowed down speed of outline drawing
        }
    }

    // 2. Fill the interior randomly without overlaps
    const fillAttempts = 3000; // Try placing a lot of points, keep those that fit
    for (let i = 0; i < fillAttempts; i++) {
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.85; // Stay mostly inside
        const pos = getHeartPosition(t, scale * r);
        
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const fontSize = Math.floor(Math.random() * 5 + 11); // 11px to 15px
        
        const width = measureTextWidth(phrase, fontSize);
        const height = fontSize * 1.2;
        
        const box = {
            left: centerX + pos.x - width / 2,
            right: centerX + pos.x + width / 2,
            top: centerY + pos.y - height / 2,
            bottom: centerY + pos.y + height / 2
        };
        
        if (!checkCollision(box)) {
            placedBoxes.push(box);
            // Slowed down the fill delay so it spreads out over a longer time
            const delay = globalDelay + Math.random() * 10;
            createWord(pos.x, pos.y, centerX, centerY, phrase, delay, fontSize);
        }
    }
}

// Start everything when button is clicked (to allow audio autoplay)
startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    music.volume = 0.5; // Set volume to 50%
    music.play();
    createHeart();
});

// Re-render on window resize if already started
window.addEventListener('resize', () => {
    if (startScreen.style.display === 'none') {
        container.innerHTML = '';
        createHeart();
    }
});
