/* ==========================================
   IP NEXUS - INTERACTIVE FUNCTIONALITY
   ========================================== */

// ==========================================
// NAVIGATION
// ==========================================

const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active link highlighting
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('.content-section, .hero');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ==========================================
// GAME FUNCTIONALITY
// ==========================================

const gameBtn = document.getElementById('gameBtn');
const gameSection = document.querySelector('.game-section');
const gameClose = document.getElementById('gameClose');
const gameCanvas = document.getElementById('gameCanvas');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameStart = document.getElementById('gameStart');
const gameOver = document.getElementById('gameOver');
const scoreElement = document.getElementById('score');
const threatsElement = document.getElementById('threats');
const statusElement = document.getElementById('status');
const finalScoreElement = document.getElementById('finalScore');

let gameActive = false;
let score = 0;
let threatsDestroyed = 0;
let virusInterval;
let virusSpeed = 2;
let spawnRate = 1500;

// Open game
gameBtn.addEventListener('click', () => {
    gameSection.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close game
gameClose.addEventListener('click', () => {
    gameSection.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetGame();
});

// Start game
startBtn.addEventListener('click', () => {
    startGame();
});

// Restart game
restartBtn.addEventListener('click', () => {
    resetGame();
    startGame();
});

function startGame() {
    gameActive = true;
    score = 0;
    threatsDestroyed = 0;
    virusSpeed = 2;
    spawnRate = 1500;
    
    gameStart.style.display = 'none';
    gameOver.classList.remove('active');
    statusElement.textContent = 'ACTIVE';
    statusElement.classList.add('status-active');
    statusElement.classList.remove('status-breach');
    
    updateScore();
    spawnVirus();
    
    // Increase difficulty over time
    setTimeout(() => {
        if (gameActive) {
            virusSpeed = 3;
            spawnRate = 1200;
        }
    }, 15000);
    
    setTimeout(() => {
        if (gameActive) {
            virusSpeed = 4;
            spawnRate = 1000;
        }
    }, 30000);
}

function spawnVirus() {
    if (!gameActive) return;
    
    const virus = document.createElement('div');
    virus.className = 'virus';
    
    // Random horizontal position
    const maxX = gameCanvas.clientWidth - 40;
    const randomX = Math.random() * maxX;
    virus.style.left = randomX + 'px';
    virus.style.top = '-40px';
    
    gameCanvas.appendChild(virus);
    
    // Virus click handler
    virus.addEventListener('click', () => {
        if (!gameActive) return;
        destroyVirus(virus);
    });
    
    // Move virus down
    moveVirus(virus);
    
    // Schedule next virus
    if (gameActive) {
        virusInterval = setTimeout(spawnVirus, spawnRate);
    }
}

function moveVirus(virus) {
    let position = -40;
    const maxPosition = gameCanvas.clientHeight;
    
    const moveInterval = setInterval(() => {
        if (!gameActive || !virus.parentNode) {
            clearInterval(moveInterval);
            return;
        }
        
        position += virusSpeed;
        virus.style.top = position + 'px';
        
        // Check if virus reached bottom
        if (position >= maxPosition) {
            clearInterval(moveInterval);
            endGame();
        }
    }, 30);
}

function destroyVirus(virus) {
    if (!virus.parentNode) return;
    
    virus.classList.add('virus-destroyed');
    threatsDestroyed++;
    score += 100;
    updateScore();
    
    // Create particle effect
    createParticles(virus);
    
    setTimeout(() => {
        if (virus.parentNode) {
            virus.remove();
        }
    }, 300);
}

function createParticles(virus) {
    const rect = virus.getBoundingClientRect();
    const canvasRect = gameCanvas.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = '#00ffcc';
        particle.style.borderRadius = '50%';
        particle.style.left = (rect.left - canvasRect.left + 20) + 'px';
        particle.style.top = (rect.top - canvasRect.top + 20) + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.boxShadow = '0 0 10px rgba(0, 255, 204, 0.8)';
        
        gameCanvas.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let px = rect.left - canvasRect.left + 20;
        let py = rect.top - canvasRect.top + 20;
        let opacity = 1;
        
        const particleInterval = setInterval(() => {
            px += vx;
            py += vy;
            opacity -= 0.05;
            
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = opacity;
            
            if (opacity <= 0) {
                clearInterval(particleInterval);
                particle.remove();
            }
        }, 30);
    }
}

function updateScore() {
    scoreElement.textContent = score;
    threatsElement.textContent = threatsDestroyed;
}

function endGame() {
    gameActive = false;
    clearTimeout(virusInterval);
    
    // Remove all viruses
    const viruses = document.querySelectorAll('.virus');
    viruses.forEach(virus => virus.remove());
    
    // Show game over
    statusElement.textContent = 'BREACH';
    statusElement.classList.remove('status-active');
    statusElement.classList.add('status-breach');
    finalScoreElement.textContent = score;
    gameOver.classList.add('active');
}

function resetGame() {
    gameActive = false;
    clearTimeout(virusInterval);
    
    // Remove all viruses and particles
    const viruses = document.querySelectorAll('.virus');
    viruses.forEach(virus => virus.remove());
    
    const particles = gameCanvas.querySelectorAll('div[style*="position: absolute"]');
    particles.forEach(particle => {
        if (!particle.classList.contains('game-start') && !particle.classList.contains('game-over')) {
            particle.remove();
        }
    });
    
    // Reset UI
    gameStart.style.display = 'block';
    gameOver.classList.remove('active');
    score = 0;
    threatsDestroyed = 0;
    updateScore();
}

// ==========================================
// CARD ANIMATIONS ON SCROLL
// ==========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
});

// ==========================================
// HERO PARALLAX EFFECT
// ==========================================

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ==========================================
// PREVENT BODY SCROLL WHEN GAME IS OPEN
// ==========================================

document.addEventListener('keydown', (e) => {
    if (gameSection.classList.contains('active') && e.key === 'Escape') {
        gameSection.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetGame();
    }
});

// ==========================================
// DYNAMIC BACKGROUND ORBS
// ==========================================

const glowOrbs = document.querySelectorAll('.glow-orb');

document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    glowOrbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        
        orb.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// ==========================================
// LOADING ANIMATION
// ==========================================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ==========================================
// CONSOLE EASTER EGG
// ==========================================

console.log('%c IP NEXUS ', 'background: linear-gradient(135deg, #00ffcc, #00d4ff); color: #0a0a0a; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 4px;');
console.log('%c Protecting Innovation in the Digital Age ', 'color: #00ffcc; font-size: 14px; font-weight: 600;');
console.log('%c Ready to defend your intellectual property? ', 'color: #b4b4b4; font-size: 12px;');