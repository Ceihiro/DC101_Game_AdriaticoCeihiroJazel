// Game Data
const languageCards = [
    { id: 1, name: 'Python', icon: 'img/python.png', color: '#3776AB' },
    { id: 2, name: 'JavaScript', icon: 'img/javascript.png', color: '#F7DF1E' },
    { id: 3, name: 'Java', icon: 'img/java.png', color: '#007396' },
    { id: 4, name: 'C', icon: 'img/c.png', color: '#A8B9CC' },
    { id: 5, name: 'C++', icon: 'img/cpp.png', color: '#00599C' },
    { id: 6, name: 'C#', icon: 'img/csharp.png', color: '#239120' },
    { id: 7, name: 'PHP', icon: 'img/php.png', color: '#777BB4' },
    { id: 8, name: 'Swift', icon: 'img/swift.png', color: '#FA7343' }
];


// Game State
let cards = [], flippedCards = [], matchedCards = [];
let moves = 0, timer = 0, timerInterval = null, isPlaying = false;
let combo = 0, score = 0, canFlip = true;
let highScore = 0, bestTime = Infinity, maxCombo = 0;


// DOM Elements
const $ = id => document.getElementById(id); // shortcut for getElementById
const gameBoard = $('game-board');
const timerDisplay = $('timer');
const movesDisplay = $('moves');
const scoreDisplay = $('score');
const comboDisplay = $('combo');
const comboNotification = $('combo-notification');
const comboText = $('combo-text');
const winModal = $('win-modal');
const helpModal = $('help-modal');


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHighScores();
    initializeGame();
    setupEventListeners();
});

function setupEventListeners() {
    $('restart-btn').addEventListener('click', initializeGame);
    $('help-btn').addEventListener('click', () => helpModal.classList.remove('hidden'));
    $('close-help-btn').addEventListener('click', () => helpModal.classList.add('hidden'));
    $('start-game-btn').addEventListener('click', () => helpModal.classList.add('hidden'));
    $('reset-records-btn').addEventListener('click', resetHighScores);
    $('play-again-btn').addEventListener('click', () => {
        winModal.classList.add('hidden');
        initializeGame(); // start new game
    });
    helpModal.addEventListener('click', e => {
        if (e.target === helpModal) helpModal.classList.add('hidden'); // close when clicking outside
    });
}


// Game Initialization
function initializeGame() {
    flippedCards = [];
    matchedCards = [];
    moves = 0;
    timer = 0;
    combo = 0;
    score = 0;
    isPlaying = false;
    canFlip = true;

    if (timerInterval) {
        clearInterval(timerInterval); // stop existing timer
        timerInterval = null;
    }

    updateDisplays();
    createCards();
    renderCards();
}

function createCards() {
    cards = [];
    languageCards.forEach((lang, index) => {
        cards.push({ ...lang, uniqueId: index * 2, pairId: lang.id });
        cards.push({ ...lang, uniqueId: index * 2 + 1, pairId: lang.id });
    });
    shuffleArray(cards); // randomize card order
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
}

function renderCards() {
    gameBoard.innerHTML = '';
    cards.forEach(card => gameBoard.appendChild(createCardElement(card))); // add cards
}

function createCardElement(card) {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.dataset.uniqueId = card.uniqueId; // unique identifier
    btn.dataset.pairId = card.pairId;  // matching pair identifier

    btn.innerHTML = `
        <div class="card-inner">
            <div class="card-face card-back">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
            </div>
            <div class="card-face card-front" style="background-color: ${card.color}20; border-color: ${card.color}">
                <img src="${card.icon}" alt="${card.name}" class="card-icon">
                <div class="card-name">${card.name}</div>
            </div>
        </div>
    `;

    btn.addEventListener('click', () => handleCardClick(card, btn));
    return btn;
}


// Game Logic
function handleCardClick(card, cardElement) {
    if (!isPlaying) startGame(); // start timer on first click

    if (!canFlip || flippedCards.length >= 2 ||
        flippedCards.includes(card.uniqueId) ||
        matchedCards.includes(card.uniqueId)) return;

    cardElement.classList.add('flipped');
    flippedCards.push(card.uniqueId);

    if (flippedCards.length === 2) {
        canFlip = false;
        moves++;
        updateDisplays();
        setTimeout(checkForMatch, 600);
    }
}

function checkForMatch() {
    const [firstId, secondId] = flippedCards;
    const firstCard = document.querySelector(`[data-unique-id="${firstId}"]`);
    const secondCard = document.querySelector(`[data-unique-id="${secondId}"]`);

    if (firstCard.dataset.pairId === secondCard.dataset.pairId) {
        handleMatch(firstCard, secondCard);
    } else {
        handleMismatch(firstCard, secondCard);
    }
}

function handleMatch(card1, card2) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedCards.push(parseInt(card1.dataset.uniqueId), parseInt(card2.dataset.uniqueId));

    combo++;
    score += 100 + (combo > 1 ? (combo - 1) * 50 : 0);

    if (combo > 1) showComboNotification();

    flippedCards = [];
    canFlip = true;
    updateDisplays();

    if (matchedCards.length === cards.length) {
        setTimeout(handleWin, 500);
    }
}

function handleMismatch(card1, card2) {
    combo = 0; // reset combo on mistake
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        flippedCards = [];
        canFlip = true;
        updateDisplays();
    }, 1000);
}

function startGame() {
    isPlaying = true;
    timerInterval = setInterval(() => {
        timer++;
        updateDisplays();
    }, 1000);
}

function handleWin() {
    isPlaying = false;
    clearInterval(timerInterval);
    updateHighScores();

    $('final-score').textContent = score;
    $('final-time').textContent = formatTime(timer);
    $('final-moves').textContent = moves;
    winModal.classList.remove('hidden');
}


// Display Updates
function updateDisplays() {
    timerDisplay.textContent = formatTime(timer);
    movesDisplay.textContent = moves;
    scoreDisplay.textContent = score;
    comboDisplay.textContent = combo > 0 ? `${combo}x` : '-';
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showComboNotification() {
    comboText.textContent = `${combo}x COMBO!`;
    comboNotification.classList.remove('hidden');
    setTimeout(() => comboNotification.classList.add('hidden'), 1000);
}


// High Scores
function loadHighScores() {
    highScore = parseInt(localStorage.getItem('codeMemoryHighScore')) || 0;
    bestTime = parseInt(localStorage.getItem('codeMemoryBestTime')) || Infinity;
    maxCombo = parseInt(localStorage.getItem('codeMemoryMaxCombo')) || 0;
    updateHighScoreDisplay();
}

function saveHighScores() {
    localStorage.setItem('codeMemoryHighScore', highScore);
    localStorage.setItem('codeMemoryBestTime', bestTime);
    localStorage.setItem('codeMemoryMaxCombo', maxCombo);
}

function updateHighScores() {
    let newRecord = false;

    if (score > highScore) {
        highScore = score;
        newRecord = true;
    }

    if (timer < bestTime) {
        bestTime = timer;
        newRecord = true;
    }

    if (combo > maxCombo) {
        maxCombo = combo;
        newRecord = true;
    }

    if (newRecord) {
        saveHighScores();
        updateHighScoreDisplay();
    }
}

function updateHighScoreDisplay() {
    $('high-score').textContent = highScore;
    $('best-time').textContent = bestTime === Infinity ? '--:--' : formatTime(bestTime);
    $('max-combo').textContent = maxCombo > 0 ? `${maxCombo}x` : '0x';
}

function resetHighScores() {
    if (confirm('Reset all records?')) {
        highScore = 0;
        bestTime = Infinity;
        maxCombo = 0;
        saveHighScores();
        updateHighScoreDisplay();
    }
}