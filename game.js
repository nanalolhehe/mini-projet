// Game Constants
const MAX_USERS = 500;
const SAVE_KEY = "frenchWordDreamUsers";
const MIN_WORD_LENGTH = 2; 

// Game State
let users = [];
let userCount = 0;
let currentUser = null;
let gameState = {
    letters: [],
    foundWords: [],
    requiredWords: 3,
    minLength: 3,
    level: 1,
    selectedLetters: [] 
};

// DOM Elements
const screens = {
    login: document.getElementById('login-screen'),
    mainMenu: document.getElementById('main-menu'),
    profile: document.getElementById('profile-screen'),
    game: document.getElementById('game-screen')
};

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const playerNameInput = document.getElementById('player-name');
const loginBtn = document.getElementById('login-btn');
const loginMessage = document.getElementById('login-message');
const registerNameInput = document.getElementById('register-name');
const registerSurnameInput = document.getElementById('register-surname');
const registerAgeInput = document.getElementById('register-age');
const registerBtn = document.getElementById('register-btn');
const registerMessage = document.getElementById('register-message');
const welcomeNameSpan = document.getElementById('welcome-name');
const menuLevelSpan = document.getElementById('menu-level');
const menuScoreSpan = document.getElementById('menu-score');
const newGameBtn = document.getElementById('new-game-btn');
const resumeGameBtn = document.getElementById('resume-game-btn');
const profileBtn = document.getElementById('profile-btn');
const quitBtn = document.getElementById('quit-btn');
const profileNameSpan = document.getElementById('profile-name');
const profileAgeSpan = document.getElementById('profile-age');
const profileLevelSpan = document.getElementById('profile-level');
const profileScoreSpan = document.getElementById('profile-score');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const currentLevelSpan = document.getElementById('current-level');
const wordsFoundSpan = document.getElementById('words-found');
const wordsNeededSpan = document.getElementById('words-needed');
const minLengthSpan = document.getElementById('min-length');
const lettersContainer = document.getElementById('letters-container');
const wordInput = document.getElementById('word-input');
const submitWordBtn = document.getElementById('submit-word-btn');
const gameMessage = document.getElementById('game-message');
const wordList = document.getElementById('word-list');
const saveQuitBtn = document.getElementById('save-quit-btn');

// French language patterns
const COMMON_ENDINGS = ["er", "ir", "re", "ez", "ons", "ent", "ais", "ait", "ant", "tion", "ment", "age", "eur", "euse", "ù", "isme", "é", "able", "ible", "ure", "if", "ive"];
const COMMON_PREFIXES = ["de", "le", "la", "en", "un", "re", "in", "co", "pre", "par", "sur", "sous", "mal", "contre", "anti", "auto", "extra", "hyper", "inter", "mono"];
const FRENCH_VOWELS = "aeiou";

// Initialize the game
function init() {
    loadUsers();
    setupEventListeners();
    init3DBackground();
    createBubbles();
    showScreen('login');
}

// Initialize 3D background with sparkles
function init3DBackground() {
    const container = document.getElementById('threejs-bg');
    if (!container) return;

    // Clear any existing canvas
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create sparkle particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1500;
    
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);
    const sizeArray = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
        colorArray[i] = 0.8 + Math.random() * 0.2; // Pinkish colors
        if (i % 3 === 0) {
            sizeArray[i/3] = Math.random() * 0.2 + 0.05;
        }
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
        blending: THREE.AdditiveBlending
    });
    
    const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleMesh);

    camera.position.z = 3;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        particleMesh.rotation.x += 0.0003;
        particleMesh.rotation.y += 0.0005;
        
        renderer.render(scene, camera);
    }
    
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Create floating bubbles with improved visuals
function createBubbles() {
    const container = document.getElementById('bubble-container');
    if (!container) return;

    // Clear existing bubbles
    container.innerHTML = '';

    // Create bubbles with better distribution
    const bubbleCount = Math.floor(window.innerWidth / 50); // Adjust based on screen size
    const colors = [
        'rgba(255, 182, 230, 0.6)',
        'rgba(230, 182, 255, 0.6)',
        'rgba(182, 230, 255, 0.6)'
    ];

    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size between 30px and 150px
        const size = 30 + Math.random() * 120;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Random position with edge avoidance
        bubble.style.left = `${10 + Math.random() * 80}vw`;
        bubble.style.top = `${10 + Math.random() * 80}vh`;
        
        // Random color
        bubble.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Animation properties
        const duration = 15 + Math.random() * 30;
        const delay = -Math.random() * 30;
        bubble.style.animation = `floatBubble ${duration}s ${delay}s infinite ease-in-out`;
        
        // Random blur and opacity
        bubble.style.filter = `blur(${Math.random() * 3}px)`;
        bubble.style.opacity = 0.3 + Math.random() * 0.4;
        
        container.appendChild(bubble);
    }
}

// Show specific screen and hide others
function showScreen(screenName) {
    Object.keys(screens).forEach(key => {
        if (key === screenName) {
            screens[key].classList.add('active');
        } else {
            screens[key].classList.remove('active');
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Login/Register events
    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);
    
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    registerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') registerSurnameInput.focus();
    });
    
    registerSurnameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') registerAgeInput.focus();
    });
    
    registerAgeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
    
    // Main menu events
    newGameBtn.addEventListener('click', () => {
        if (!currentUser) return;
        currentUser.level = 1;
        currentUser.score = 0;
        startGame();
    });
    
    resumeGameBtn.addEventListener('click', () => {
        if (!currentUser) return;
        startGame();
    });
    
    profileBtn.addEventListener('click', showProfile);
    quitBtn.addEventListener('click', quitGame);
    
    // Profile events
    backToMenuBtn.addEventListener('click', showMainMenu);
    
    // Game events
    submitWordBtn.addEventListener('click', submitWord);
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitWord();
    });
    
    saveQuitBtn.addEventListener('click', saveAndQuit);
}

// Handle login
function handleLogin() {
    const name = playerNameInput.value.trim();
    
    if (!name) {
        showMessage(loginMessage, 'Please enter your name', 'error');
        return;
    }
    
    currentUser = findUser(name);
    
    if (currentUser) {
        showMainMenu();
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        registerNameInput.value = name;
        registerSurnameInput.focus();
    }
}

// Handle registration
function handleRegister() {
    const name = registerNameInput.value.trim();
    const surname = registerSurnameInput.value.trim();
    const age = parseInt(registerAgeInput.value);
    
    if (!name || !surname) {
        showMessage(registerMessage, 'Please enter your name and surname', 'error');
        return;
    }
    
    if (isNaN(age)) {
        showMessage(registerMessage, 'Please enter a valid age', 'error');
        return;
    }
    
    if (userCount >= MAX_USERS) {
        showMessage(registerMessage, 'Maximum number of users reached!', 'error');
        return;
    }
    
    const newUser = {
        name,
        surname,
        age,
        level: 1,
        score: 0
    };
    
    users.push(newUser);
    userCount++;
    currentUser = newUser;
    
    saveUsers();
    showMainMenu();
}

// Find user by name
function findUser(name) {
    return users.find(user => user.name.toLowerCase() === name.toLowerCase());
}

// Show main menu
function showMainMenu() {
    if (!currentUser) {
        showScreen('login');
        return;
    }
    
    welcomeNameSpan.textContent = currentUser.name;
    menuLevelSpan.textContent = currentUser.level;
    menuScoreSpan.textContent = currentUser.score;
    showScreen('mainMenu');
}

// Show profile
function showProfile() {
    if (!currentUser) {
        showScreen('login');
        return;
    }
    
    profileNameSpan.textContent = `${currentUser.name} ${currentUser.surname}`;
    profileAgeSpan.textContent = currentUser.age;
    profileLevelSpan.textContent = currentUser.level;
    profileScoreSpan.textContent = currentUser.score;
    showScreen('profile');
}

// Start game
function startGame() {
    if (!currentUser) {
        showScreen('login');
        return;
    }
    
    gameState.level = currentUser.level;
    
    // Calculate game parameters based on level
    const letterCount = Math.min(12, 5 + Math.floor(gameState.level / 2));
    gameState.requiredWords = Math.min(10, 2 + Math.floor(gameState.level / 3));
    gameState.minLength = Math.max(MIN_WORD_LENGTH, 2 + Math.floor(gameState.level / 5));
    
    gameState.letters = generatePlayableLetters(letterCount);
    gameState.foundWords = [];
    gameState.selectedLetters = [];
    
    updateGameUI();
    wordInput.focus();
    showScreen('game');
}

// Generate letters that can form multiple valid words
function generatePlayableLetters(count) {
    const vowels = FRENCH_VOWELS;
    const consonants = "bcdfghjklmnpqrstvwxzç";
    let letters = [];
    
    // Ensure at least 40% vowels
    const vowelCount = Math.max(2, Math.ceil(count * 0.4));
    const consonantCount = count - vowelCount;
    
    // Add vowels
    for (let i = 0; i < vowelCount; i++) {
        letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
    }
    
    // Add consonants
    for (let i = 0; i < consonantCount; i++) {
        letters.push(consonants[Math.floor(Math.random() * consonants.length)]);
    }
    
    // Add one common prefix or ending (30% chance)
    if (Math.random() < 0.3) {
        const commonPart = Math.random() > 0.5 
            ? COMMON_PREFIXES[Math.floor(Math.random() * COMMON_PREFIXES.length)]
            : COMMON_ENDINGS[Math.floor(Math.random() * COMMON_ENDINGS.length)];
        
        for (let i = 0; i < commonPart.length && letters.length < count; i++) {
            letters.push(commonPart[i]);
        }
    }
    
    // Fill remaining slots if needed
    while (letters.length < count) {
        const charSet = Math.random() > 0.5 ? vowels : consonants;
        letters.push(charSet[Math.floor(Math.random() * charSet.length)]);
    }
    
    // Shuffle the letters
    return shuffleArray(letters);
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Update game UI
function updateGameUI() {
    if (!currentUser) return;
    
    currentLevelSpan.textContent = gameState.level;
    wordsFoundSpan.textContent = gameState.foundWords.length;
    wordsNeededSpan.textContent = gameState.requiredWords;
    minLengthSpan.textContent = gameState.minLength;
    
    lettersContainer.innerHTML = '';
    gameState.letters.forEach((letter, index) => {
        const letterEl = document.createElement('div');
        letterEl.className = 'letter';
        letterEl.textContent = letter.toUpperCase();
        letterEl.dataset.index = index;
        letterEl.style.animationDuration = `${4 + Math.random() * 3}s`;
        
        if (gameState.selectedLetters.includes(index)) {
            letterEl.classList.add('selected');
        }
        
        letterEl.addEventListener('click', () => {
            toggleLetterSelection(index);
        });
        
        lettersContainer.appendChild(letterEl);
    });
    
    wordList.innerHTML = '';
    gameState.foundWords.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <span>${word}</span>
            <span class="word-score">+${word.length * gameState.level}</span>
        `;
        wordList.appendChild(wordItem);
    });
    
    updateWordInput();
    gameMessage.classList.add('hidden');
}

// Toggle letter selection
function toggleLetterSelection(index) {
    const letterIndex = gameState.selectedLetters.indexOf(index);
    
    if (letterIndex === -1) {
        gameState.selectedLetters.push(index);
    } else {
        gameState.selectedLetters.splice(letterIndex, 1);
    }
    
    updateWordInput();
    updateGameUI();
}

// Update word input based on selected letters
function updateWordInput() {
    const word = gameState.selectedLetters
        .map(index => gameState.letters[index])
        .join('');
    
    wordInput.value = word;
}

// Submit word
function submitWord() {
    const word = wordInput.value.trim().toLowerCase();
    
    if (!word) {
        showMessage(gameMessage, 'Please enter a word', 'error');
        return;
    }
    
    if (word === '0' || word === 'save') {
        saveAndQuit();
        return;
    }
    
    // Validate word
    if (word.length < gameState.minLength) {
        showMessage(gameMessage, `Word too short! Needs at least ${gameState.minLength} letters.`, 'error');
        return;
    }
    
    if (!isValidWord(word, gameState.letters)) {
        showMessage(gameMessage, 'Invalid word! Can only use given letters.', 'error');
        return;
    }
    
    if (!isWordInDictionary(word)) {
        showMessage(gameMessage, 'Word not in dictionary!', 'error');
        return;
    }
    
    if (gameState.foundWords.includes(word)) {
        showMessage(gameMessage, 'Word already found!', 'error');
        return;
    }
    
    // Valid word
    gameState.foundWords.push(word);
    currentUser.score += word.length * gameState.level;
    
    showMessage(gameMessage, `Valid word: ${word} (+${word.length * gameState.level} points)`, 'success');
    
    // Reset selection
    gameState.selectedLetters = [];
    
    if (gameState.foundWords.length >= gameState.requiredWords) {
        setTimeout(completeLevel, 1000);
    } else {
        updateGameUI();
    }
}

// Check if word is valid (uses only given letters)
function isValidWord(word, letters) {
    const availableLetters = [...letters];
    
    for (const char of word) {
        const index = availableLetters.indexOf(char);
        if (index === -1) {
            const upperIndex = availableLetters.indexOf(char.toUpperCase());
            if (upperIndex === -1) return false;
            availableLetters.splice(upperIndex, 1);
        } else {
            availableLetters.splice(index, 1);
        }
    }
    
    return true;
}

// Check if word is in dictionary (binary search)
function isWordInDictionary(word) {
    // First check if it's a very short word (2 letters)
    if (word.length === 2) {
        const commonTwoLetterWords = ["de", "le", "la", "en", "un", "à", "et", "ou", "si", "il", "du", "au", "ce", "ça"];
        return commonTwoLetterWords.includes(word);
    }
    
    // Then check the full dictionary
    let left = 0;
    let right = frenchDict.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const cmp = word.localeCompare(frenchDict[mid]);
        
        if (cmp === 0) return true;
        if (cmp < 0) right = mid - 1;
        else left = mid + 1;
    }
    
    return false;
}

// Complete current level
function completeLevel() {
    showMessage(gameMessage, `Level ${gameState.level} completed! Your score: ${currentUser.score}`, 'success');
    
    currentUser.level++;
    saveUsers();
    
    setTimeout(() => {
        if (confirm(`Level ${gameState.level} completed! Continue to next level?`)) {
            startGame();
        } else {
            showMainMenu();
        }
    }, 1000);
}

// Save and quit game
function saveAndQuit() {
    saveUsers();
    showMainMenu();
}

// Quit game
function quitGame() {
    if (confirm('Are you sure you want to quit?')) {
        currentUser = null;
        showScreen('login');
        
        // Reset login form
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        playerNameInput.value = '';
        loginMessage.classList.add('hidden');
        registerMessage.classList.add('hidden');
    }
}

// Show message
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `dream-message ${type}`;
    element.classList.remove('hidden');
    
    if (type !== 'error') {
        setTimeout(() => {
            element.classList.add('hidden');
        }, 3000);
    }
}

// Load users from localStorage
function loadUsers() {
    const savedUsers = localStorage.getItem(SAVE_KEY);
    if (savedUsers) {
        users = JSON.parse(savedUsers);
        userCount = users.length;
    }
}

// Save users to localStorage
function saveUsers() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(users));
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle window resize
window.addEventListener('resize', () => {
    createBubbles(); // Recreate bubbles on resize for proper positioning
});
