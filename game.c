#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

// Game Constants
#define MAX_USERS 500
#define MIN_WORD_LENGTH 2
#define MAX_NAME_LENGTH 50
#define MAX_WORD_LENGTH 20
#define MAX_LETTERS 12
#define MAX_FOUND_WORDS 100

// French language patterns
const char* COMMON_ENDINGS[] = {"er", "i", "r", "ez", "s", "e", "ais", "ait", "ant", "t", "ment", "a", "eur", "euse", "ù", "isme", "é", "able", "ible", "u", "if", "ive"};
const char* COMMON_PREFIXES[] = {"d", "e", "l", "en", "un", "re", "n", "c", "pre", "par", "s", "sous", "mal", "contre", "anti", "auto", "extra", "hyper", "inter", "mono"};
const char FRENCH_VOWELS[] = "aioue";

// User structure
typedef struct {
    char name[MAX_NAME_LENGTH];
    char surname[MAX_NAME_LENGTH];
    int age;
    int level;
    int score;
} User;

// Game state structure
typedef struct {
    char letters[MAX_LETTERS];
    int letterCount;
    char foundWords[MAX_FOUND_WORDS][MAX_WORD_LENGTH];
    int foundWordCount;
    int requiredWords;
    int minLength;
    int level;
    int selectedLetters[MAX_LETTERS];
    int selectedLetterCount;
} GameState;

// Global variables
User users[MAX_USERS];
int userCount = 0;
User* currentUser = NULL;
GameState gameState;

// Function prototypes
void initGame();
void loadUsers();
void saveUsers();
void handleLogin();
void handleRegister();
User* findUser(const char* name);
void showMainMenu();
void showProfile();
void startGame();
void generatePlayableLetters(int count);
void shuffleArray(char* array, int size);
void updateGameUI();
void toggleLetterSelection(int index);
void updateWordInput(char* wordInput);
void submitWord(const char* word);
bool isValidWord(const char* word, const char* letters, int letterCount);
bool isWordInDictionary(const char* word);
void completeLevel();
void saveAndQuit();
void quitGame();
void showMessage(const char* message, const char* type);

// Dictionary functions (would be implemented separately)
bool isWordInDictionary(const char* word) {
    // This would be replaced with actual dictionary lookup
    // For now, just return true for demonstration
    return true;
}

// Initialize the game
void initGame() {
    srand(time(NULL));
    loadUsers();
    memset(&gameState, 0, sizeof(GameState));
}

// Load users from file
void loadUsers() {
    // In a real implementation, this would load from a file
    userCount = 0;
}

// Save users to file
void saveUsers() {
    // In a real implementation, this would save to a file
}

// Handle login
void handleLogin() {
    char name[MAX_NAME_LENGTH];
    printf("Enter your name: ");
    fgets(name, MAX_NAME_LENGTH, stdin);
    name[strcspn(name, "\n")] = '\0'; // Remove newline

    currentUser = findUser(name);
    
    if (currentUser) {
        showMainMenu();
    } else {
        printf("New user detected. Please register.\n");
        handleRegister();
    }
}

// Handle registration
void handleRegister() {
    User newUser;
    memset(&newUser, 0, sizeof(User));
    
    printf("Enter your name: ");
    fgets(newUser.name, MAX_NAME_LENGTH, stdin);
    newUser.name[strcspn(newUser.name, "\n")] = '\0';
    
    printf("Enter your surname: ");
    fgets(newUser.surname, MAX_NAME_LENGTH, stdin);
    newUser.surname[strcspn(newUser.surname, "\n")] = '\0';
    
    printf("Enter your age: ");
    scanf("%d", &newUser.age);
    while(getchar() != '\n'); // Clear input buffer
    
    newUser.level = 1;
    newUser.score = 0;
    
    if (userCount < MAX_USERS) {
        users[userCount++] = newUser;
        currentUser = &users[userCount-1];
        saveUsers();
        showMainMenu();
    } else {
        printf("Maximum number of users reached!\n");
    }
}

// Find user by name
User* findUser(const char* name) {
    for (int i = 0; i < userCount; i++) {
        if (strcasecmp(users[i].name, name) == 0) {
            return &users[i];
        }
    }
    return NULL;
}

// Show main menu
void showMainMenu() {
    if (!currentUser) {
        handleLogin();
        return;
    }
    
    printf("\n=== MAIN MENU ===\n");
    printf("Welcome, %s!\n", currentUser->name);
    printf("Level: %d  Score: %d\n", currentUser->level, currentUser->score);
    printf("1. New Game\n");
    printf("2. Resume Game\n");
    printf("3. Profile\n");
    printf("4. Quit\n");
    printf("Choice: ");
    
    int choice;
    scanf("%d", &choice);
    while(getchar() != '\n'); // Clear input buffer
    
    switch(choice) {
        case 1:
            currentUser->level = 1;
            currentUser->score = 0;
            startGame();
            break;
        case 2:
            startGame();
            break;
        case 3:
            showProfile();
            break;
        case 4:
            quitGame();
            break;
        default:
            printf("Invalid choice!\n");
            showMainMenu();
    }
}

// Show profile
void showProfile() {
    printf("\n=== PROFILE ===\n");
    printf("Name: %s %s\n", currentUser->name, currentUser->surname);
    printf("Age: %d\n", currentUser->age);
    printf("Level: %d\n", currentUser->level);
    printf("Score: %d\n", currentUser->score);
    printf("\nPress Enter to return to menu...");
    getchar();
    showMainMenu();
}

// Start game
void startGame() {
    gameState.level = currentUser->level;
    
    // Calculate game parameters based on level
    int letterCount = (12 < (5 + gameState.level / 2)) ? 12 : (5 + gameState.level / 2);
    gameState.requiredWords = (10 < (2 + gameState.level / 3)) ? 10 : (2 + gameState.level / 3);
    gameState.minLength = (MIN_WORD_LENGTH > (2 + gameState.level / 5)) ? MIN_WORD_LENGTH : (2 + gameState.level / 5);
    
    generatePlayableLetters(letterCount);
    gameState.foundWordCount = 0;
    gameState.selectedLetterCount = 0;
    
    updateGameUI();
}

// Generate letters that can form multiple valid words
void generatePlayableLetters(int count) {
    const char* vowels = FRENCH_VOWELS;
    const char* consonants = "bcdfghjklmnpqrstvwxzç";
    
    gameState.letterCount = 0;
    
    // Ensure at least 40% vowels
    int vowelCount = (2 > (int)(count * 0.4)) ? 2 : (int)(count * 0.4);
    int consonantCount = count - vowelCount;
    
    // Add vowels
    for (int i = 0; i < vowelCount; i++) {
        gameState.letters[gameState.letterCount++] = vowels[rand() % strlen(vowels)];
    }
    
    // Add consonants
    for (int i = 0; i < consonantCount; i++) {
        gameState.letters[gameState.letterCount++] = consonants[rand() % strlen(consonants)];
    }
    
    // Add one common prefix or ending (30% chance)
    if (rand() % 100 < 30) {
        const char* commonPart = (rand() % 2) ? 
            COMMON_PREFIXES[rand() % (sizeof(COMMON_PREFIXES)/sizeof(COMMON_PREFIXES[0]))] : 
            COMMON_ENDINGS[rand() % (sizeof(COMMON_ENDINGS)/sizeof(COMMON_ENDINGS[0]))];
        
        for (int i = 0; i < strlen(commonPart) && gameState.letterCount < count; i++) {
            gameState.letters[gameState.letterCount++] = commonPart[i];
        }
    }
    
    // Fill remaining slots if needed
    while (gameState.letterCount < count) {
        const char* charSet = (rand() % 2) ? vowels : consonants;
        gameState.letters[gameState.letterCount++] = charSet[rand() % strlen(charSet)];
    }
    
    // Shuffle the letters
    shuffleArray(gameState.letters, gameState.letterCount);
}

// Shuffle array
void shuffleArray(char* array, int size) {
    for (int i = size - 1; i > 0; i--) {
        int j = rand() % (i + 1);
        char temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// Update game UI
void updateGameUI() {
    printf("\n=== LEVEL %d ===\n", gameState.level);
    printf("Words found: %d/%d  Min length: %d\n", 
           gameState.foundWordCount, gameState.requiredWords, gameState.minLength);
    
    // Display letters
    printf("Letters: ");
    for (int i = 0; i < gameState.letterCount; i++) {
        printf("%c ", gameState.letters[i]);
    }
    printf("\n");
    
    // Display found words
    if (gameState.foundWordCount > 0) {
        printf("Found words:\n");
        for (int i = 0; i < gameState.foundWordCount; i++) {
            printf("- %s (+%d)\n", gameState.foundWords[i], 
                  (int)strlen(gameState.foundWords[i]) * gameState.level);
        }
    }
    
    // Get user input
    char word[MAX_WORD_LENGTH];
    printf("\nEnter a word (or '0' to save and quit): ");
    fgets(word, MAX_WORD_LENGTH, stdin);
    word[strcspn(word, "\n")] = '\0';
    
    if (strcmp(word, "0") == 0) {
        saveAndQuit();
    } else {
        submitWord(word);
    }
}

// Submit word
void submitWord(const char* word) {
    if (strlen(word) == 0) {
        showMessage("Please enter a word", "error");
        updateGameUI();
        return;
    }
    
    // Validate word
    if ((int)strlen(word) < gameState.minLength) {
        showMessage("Word too short!", "error");
        updateGameUI();
        return;
    }
    
    if (!isValidWord(word, gameState.letters, gameState.letterCount)) {
        showMessage("Invalid word! Can only use given letters.", "error");
        updateGameUI();
        return;
    }
    
    if (!isWordInDictionary(word)) {
        showMessage("Word not in dictionary!", "error");
        updateGameUI();
        return;
    }
    
    // Check if word already found
    for (int i = 0; i < gameState.foundWordCount; i++) {
        if (strcasecmp(gameState.foundWords[i], word) == 0) {
            showMessage("Word already found!", "error");
            updateGameUI();
            return;
        }
    }
    
    // Valid word
    strcpy(gameState.foundWords[gameState.foundWordCount++], word);
    currentUser->score += strlen(word) * gameState.level;
    
    char successMsg[100];
    snprintf(successMsg, sizeof(successMsg), "Valid word: %s (+%d points)", 
             word, (int)strlen(word) * gameState.level);
    showMessage(successMsg, "success");
    
    if (gameState.foundWordCount >= gameState.requiredWords) {
        completeLevel();
    } else {
        updateGameUI();
    }
}

// Check if word is valid (uses only given letters)
bool isValidWord(const char* word, const char* letters, int letterCount) {
    char availableLetters[MAX_LETTERS];
    memcpy(availableLetters, letters, letterCount);
    
    for (size_t i = 0; i < strlen(word); i++) {
        bool found = false;
        for (int j = 0; j < letterCount; j++) {
            if (tolower(word[i]) == tolower(availableLetters[j])) {
                availableLetters[j] = ' '; // Mark as used
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    
    return true;
}

// Complete current level
void completeLevel() {
    printf("\nLevel %d completed! Your score: %d\n", gameState.level, currentUser->score);
    
    currentUser->level++;
    saveUsers();
    
    printf("Continue to next level? (y/n): ");
    char choice;
    scanf(" %c", &choice);
    while(getchar() != '\n'); // Clear input buffer
    
    if (tolower(choice) == 'y') {
        startGame();
    } else {
        showMainMenu();
    }
}

// Save and quit game
void saveAndQuit() {
    saveUsers();
    showMainMenu();
}

// Quit game
void quitGame() {
    printf("Are you sure you want to quit? (y/n): ");
    char choice;
    scanf(" %c", &choice);
    while(getchar() != '\n'); // Clear input buffer
    
    if (tolower(choice) == 'y') {
        currentUser = NULL;
        printf("Goodbye!\n");
        exit(0);
    } else {
        showMainMenu();
    }
}

// Show message
void showMessage(const char* message, const char* type) {
    printf("[%s] %s\n", type, message);
}

// Main function
int main() {
    initGame();
    handleLogin();
    return 0;
}
