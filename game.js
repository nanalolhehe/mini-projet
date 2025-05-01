// Game state
const MAX_USERS = 500;
const SAVE_KEY = "frenchWordGameUsers";

let users = [];
let userCount = 0;
let currentUser = null;
let gameState = {
    letters: [],
    foundWords: [],
    requiredWords: 3,
    minLength: 3,
    level: 1
};

// DOM elements
const loginScreen = document.getElementById('login-screen');
const mainMenu = document.getElementById('main-menu');
const profileScreen = document.getElementById('profile-screen');
const gameScreen = document.getElementById('game-screen');

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

// Initialize the game
function init() {
    loadUsers();
    setupEventListeners();
    initParticles();
}

// Set up event listeners
function setupEventListeners() {
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
    
    newGameBtn.addEventListener('click', () => {
        currentUser.level = 1;
        currentUser.score = 0;
        startGame();
    });
    
    resumeGameBtn.addEventListener('click', startGame);
    profileBtn.addEventListener('click', showProfile);
    quitBtn.addEventListener('click', quitGame);
    
    backToMenuBtn.addEventListener('click', showMainMenu);
    
    submitWordBtn.addEventListener('click', submitWord);
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitWord();
    });
    
    saveQuitBtn.addEventListener('click', saveAndQuit);
}

// Initialize particles.js
function initParticles() {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#4cc9f0"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#4cc9f0",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
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
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
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
    
    if (isNaN(age) {
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
    hideAllScreens();
    mainMenu.classList.add('active');
    
    welcomeNameSpan.textContent = currentUser.name;
    menuLevelSpan.textContent = currentUser.level;
    menuScoreSpan.textContent = currentUser.score;
}

// Show profile
function showProfile() {
    hideAllScreens();
    profileScreen.classList.add('active');
    
    profileNameSpan.textContent = `${currentUser.name} ${currentUser.surname}`;
    profileAgeSpan.textContent = currentUser.age;
    profileLevelSpan.textContent = currentUser.level;
    profileScoreSpan.textContent = currentUser.score;
}

// Hide all screens
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Start game
function startGame() {
    hideAllScreens();
    gameScreen.classList.add('active');
    
    gameState.level = currentUser.level;
    gameState.letters = generateLetters(5 + gameState.level);
    gameState.requiredWords = 2 + Math.floor(gameState.level / 3);
    gameState.minLength = 3 + Math.floor(gameState.level / 5);
    gameState.foundWords = [];
    
    updateGameUI();
    wordInput.focus();
}

// Generate random letters
function generateLetters(count) {
    const frequent = "eaistnrulod";
    const other = "bcdfghjkmnpqvwxyz";
    let letters = [];
    
    for (let i = 0; i < count; i++) {
        if (i < count / 2) {
            letters.push(frequent[Math.floor(Math.random() * frequent.length)]);
        } else {
            letters.push(other[Math.floor(Math.random() * other.length)]);
        }
    }
    
    return letters;
}

// Update game UI
function updateGameUI() {
    currentLevelSpan.textContent = gameState.level;
    wordsFoundSpan.textContent = gameState.foundWords.length;
    wordsNeededSpan.textContent = gameState.requiredWords;
    minLengthSpan.textContent = gameState.minLength;
    
    lettersContainer.innerHTML = '';
    gameState.letters.forEach(letter => {
        const letterEl = document.createElement('div');
        letterEl.className = 'letter';
        letterEl.textContent = letter.toUpperCase();
        letterEl.style.animation = `float ${3 + Math.random() * 2}s infinite ease-in-out`;
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
    
    wordInput.value = '';
    gameMessage.classList.add('hidden');
}

// Submit word
function submitWord() {
    const word = wordInput.value.trim().toLowerCase();
    
    if (!word) return;
    
    if (word === '0') {
        saveAndQuit();
        return;
    }
    
    if (word === 'save') {
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
        if (index === -1) return false;
        availableLetters.splice(index, 1);
    }
    
    return true;
}

// Check if word is in dictionary (binary search)
function isWordInDictionary(word) {
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
        hideAllScreens();
        loginScreen.classList.add('active');
        
        // Reset login form
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
        playerNameInput.value = '';
        loginMessage.classList.add('hidden');
        registerMessage.classList.add('hidden');
    }
}

// Show message
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
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
