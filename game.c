#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>
#include <string.h>
#include <ctype.h>
#include <time.h>

// Var
#define MAX_USERS 500
#define MAX_NAME_LENGTH 50
#define MAX_WORD_LENGTH 20
#define MAX_WORDS 100
#define MAX_LETTERS 12
#define MIN_WORD_LENGTH 2
#define SAVE_FILE "frenchWordDreamUsers.dat"

// User structure
typedef struct {
    char name[MAX_NAME_LENGTH];
    char surname[MAX_NAME_LENGTH];
    int age;
    int level;
    int score;
} User;

// le3ba state structure
typedef struct {
    char letters[MAX_LETTERS];
    int letterCount;
    char foundWords[MAX_WORDS][MAX_WORD_LENGTH];
    int foundWordCount;
    int requiredWords;
    int minLength;
    int level;
    int selectedLetters[MAX_LETTERS];
    int selectedLetterCount;
} GameState;

// Glob variabl
User users[MAX_USERS];
int userCount = 0;
User* currentUser = NULL;
GameState gameState;

// French configuration
const char VOWELS[] = {'e', 'a', 'i', 'o', 'u', 'y'};
const int VOWEL_WEIGHTS[] = {8, 7, 6, 5, 3, 2};
const char CONSONANTS[] = {
    's', 'n', 't', 'r', 'l', 'd', 'c', 'm', 'p', 'g', 
    'b', 'v', 'h', 'f', 'q', 'j', 'x', 'z', 'ç', 'k', 'w'
};
const int CONSONANT_WEIGHTS[] = {
    8, 7, 7, 6, 6, 5, 5, 5, 4, 3, 
    3, 3, 2, 2, 1, 1, 1, 1, 1, 0, 0
};
const char* COMMON_ENDINGS[] = {
    "er", "ir", "re", "ez", "ent", "ant", "tion", 
    "ment", "age", "ois", "ais", "uit", "eur", "ien"
};
const int COMMON_ENDINGS_COUNT = 14;
const char* COMMON_PREFIXES[] = {
    "re", "de", "in", "en", "em", "con", "com", 
    "par", "sur", "sous", "entre", "trans", "anti"
};
const int COMMON_PREFIXES_COUNT = 13;

// Dictionary
const char* frenchDict[] = {
    "a", "age", "ai", "aie", "aient", "aies", "ait", "alors", "as", "au", 
// All existing french words iyellan gl fichier nni 
};
const int DICT_SIZE = sizeof(frenchDict) / sizeof(frenchDict[0]);

// Helper functions
char getRandomVowel() {
    int totalWeight = 0;
    for (int i = 0; i < sizeof(VOWEL_WEIGHTS)/sizeof(VOWEL_WEIGHTS[0]); i++) {
        totalWeight += VOWEL_WEIGHTS[i];
    }
    
    int random = rand() % totalWeight;
    int cumulative = 0;
    
    for (int i = 0; i < sizeof(VOWEL_WEIGHTS)/sizeof(VOWEL_WEIGHTS[0]); i++) {
        cumulative += VOWEL_WEIGHTS[i];
        if (random < cumulative) {
            return VOWELS[i];
        }
    }
    
    return 'e'; 
}

char getRandomConsonant() {
    int totalWeight = 0;
    for (int i = 0; i < sizeof(CONSONANT_WEIGHTS)/sizeof(CONSONANT_WEIGHTS[0]); i++) {
        totalWeight += CONSONANT_WEIGHTS[i];
    }
    
    int random = rand() % totalWeight;
    int cumulative = 0;
    
    for (int i = 0; i < sizeof(CONSONANT_WEIGHTS)/sizeof(CONSONANT_WEIGHTS[0]); i++) {
        cumulative += CONSONANT_WEIGHTS[i];
        if (random < cumulative) {
            return CONSONANTS[i];
        }
    }
    
    return 's'; 
}

void shuffleArray(char* array, int size) {
    for (int i = size - 1; i > 0; i--) {
        int j = rand() % (i + 1);
        char temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// Game functions
void loadUsers() {
    FILE* file = fopen(SAVE_FILE, "rb");
    if (file) {
        fread(&userCount, sizeof(int), 1, file);
        fread(users, sizeof(User), userCount, file);
        fclose(file);
    }
}

void saveUsers() {
    FILE* file = fopen(SAVE_FILE, "wb");
    if (file) {
        fwrite(&userCount, sizeof(int), 1, file);
        fwrite(users, sizeof(User), userCount, file);
        fclose(file);
    }
}

User* findUser(const char* name) {
    for (int i = 0; i < userCount; i++) {
        if (strcasecmp(users[i].name, name) == 0) {
            return &users[i];
        }
    }
    return NULL;
}

void showMainMenu() {
    if (!currentUser) return;
    
    printf("\n=== MAIN MENU ===\n");
    printf("Welcome, %s!\n", currentUser->name);
    printf("Level: %d\n", currentUser->level);
    printf("Score: %d\n", currentUser->score);
    printf("\n1. New Game\n2. Resume Game\n3. Profile\n4. Quit\n");
}

void showProfile() {
    if (!currentUser) return;
    
    printf("\n=== PROFILE ===\n");
    printf("Name: %s %s\n", currentUser->name, currentUser->surname);
    printf("Age: %d\n", currentUser->age);
    printf("Level: %d\n", currentUser->level);
    printf("Score: %d\n", currentUser->score);
    printf("\nPress Enter to return to menu...");
    getchar(); getchar();
}

void generatePlayableLetters(int count) {
    
    memset(gameState.letters, 0, sizeof(gameState.letters));
    gameState.letterCount = 0;
    
    // Calculate 
    int vowelCount = (count * 0.35) + 0.5; // Round 
    if (vowelCount < 2) vowelCount = 2;
    int consonantCount = count - vowelCount;
    
    // Add vowels
    for (int i = 0; i < vowelCount; i++) {
        gameState.letters[gameState.letterCount++] = getRandomVowel();
    }
    
    // Add consonants
    for (int i = 0; i < consonantCount; i++) {
        gameState.letters[gameState.letterCount++] = getRandomConsonant();
    }
    
    // common prefix or ending
    if (rand() % 3 == 0) {
        const char* commonPart;
        if (rand() % 2 == 0) {
            commonPart = COMMON_PREFIXES[rand() % COMMON_PREFIXES_COUNT];
        } else {
            commonPart = COMMON_ENDINGS[rand() % COMMON_ENDINGS_COUNT];
        }
        
        int partLen = strlen(commonPart);
        for (int i = 0; i < partLen && gameState.letterCount < count; i++) {
            gameState.letters[gameState.letterCount++] = commonPart[i];
        }
    }
    
    // Fill remaining slots 
    while (gameState.letterCount < count) {
        if (rand() % 2 == 0) {
            gameState.letters[gameState.letterCount++] = getRandomVowel();
        } else {
            gameState.letters[gameState.letterCount++] = getRandomConsonant();
        }
    }
    
    // khlet letters
    shuffleArray(gameState.letters, gameState.letterCount);
}

void updateGameUI() {
    printf("\n=== LEVEL %d ===\n", gameState.level);
    printf("Words found: %d/%d\n", gameState.foundWordCount, gameState.requiredWords);
    printf("Minimum word length: %d\n", gameState.minLength);
    printf("Letters: ");
    
    for (int i = 0; i < gameState.letterCount; i++) {
        int selected = 0;
        for (int j = 0; j < gameState.selectedLetterCount; j++) {
            if (gameState.selectedLetters[j] == i) {
                selected = 1;
                break;
            }
        }
        
        if (selected) {
            printf("[%c] ", toupper(gameState.letters[i]));
        } else {
            printf("%c ", toupper(gameState.letters[i]));
        }
    }
    
    printf("\nFound words:\n");
    for (int i = 0; i < gameState.foundWordCount; i++) {
        printf("- %s (+%d)\n", gameState.foundWords[i], 
              (int)strlen(gameState.foundWords[i]) * gameState.level);
    }
    
    // Show current word 
    if (gameState.selectedLetterCount > 0) {
        printf("\nCurrent word: ");
        for (int i = 0; i < gameState.selectedLetterCount; i++) {
            int index = gameState.selectedLetters[i];
            printf("%c", gameState.letters[index]);
        }
        printf("\n");
    }
}

int isValidWord(const char* word, const char* letters) {
    int letterCounts[26] = {0};
    
    // Count available letters
    for (int i = 0; letters[i]; i++) {
        char c = tolower(letters[i]);
        if (c >= 'a' && c <= 'z') {
            letterCounts[c - 'a']++;
        }
    }
    
    // Check letters iyellan gl word nni
    for (int i = 0; word[i]; i++) {
        char c = tolower(word[i]);
        if (c < 'a' || c > 'z') return 0;
        
        if (letterCounts[c - 'a'] <= 0) {
            return 0;
        }
        letterCounts[c - 'a']--;
    }
    
    return 1;
}

int isWordInDictionary(const char* word) {
    // Check common two-letter mots
    if (strlen(word) == 2) {
        const char* commonTwoLetterWords[] = {"de", "le", "la", "en", "un", "à", "et", "ou", "si", "il", "du", "au", "ce", "ça"};
        for (int i = 0; i < sizeof(commonTwoLetterWords)/sizeof(commonTwoLetterWords[0]); i++) {
            if (strcasecmp(word, commonTwoLetterWords[i]) == 0) {
                return 1;
            }
        }
        return 0;
    }
    
    // search g dictionary  Binary
    int left = 0;
    int right = DICT_SIZE - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        int cmp = strcasecmp(word, frenchDict[mid]);
        
        if (cmp == 0) return 1;
        if (cmp < 0) right = mid - 1;
        else left = mid + 1;
    }
    
    return 0;
}

void toggleLetterSelection(int index) {
    // Check ma already selected
    for (int i = 0; i < gameState.selectedLetterCount; i++) {
        if (gameState.selectedLetters[i] == index) {
            // Remove from selection
            for (int j = i; j < gameState.selectedLetterCount - 1; j++) {
                gameState.selectedLetters[j] = gameState.selectedLetters[j + 1];
            }
            gameState.selectedLetterCount--;
            return;
        }
    }
    
    // Add to selection if not already there
    if (gameState.selectedLetterCount < MAX_LETTERS) {
        gameState.selectedLetters[gameState.selectedLetterCount++] = index;
    }
}

void submitWord() {
    // Build the word from selected letters
    char word[MAX_WORD_LENGTH + 1] = {0};
    for (int i = 0; i < gameState.selectedLetterCount; i++) {
        int index = gameState.selectedLetters[i];
        word[i] = gameState.letters[index];
    }
    word[gameState.selectedLetterCount] = '\0';
    
    if (strlen(word) == 0) {
        printf("Please select letters to form a word!\n");
        return;
    }
    
    if (strcmp(word, "0") == 0 || strcasecmp(word, "save") == 0) {
        saveAndQuit();
        return;
    }
    
    // Validate word
    if (strlen(word) < gameState.minLength) {
        printf("Word too short! Needs at least %d letters.\n", gameState.minLength);
        return;
    }
    
    if (!isValidWord(word, gameState.letters)) {
        printf("Invalid word! Can only use given letters.\n");
        return;
    }
    
    if (!isWordInDictionary(word)) {
        printf("Word not in dictionary!\n");
        return;
    }
    
    // Check if word already found
    for (int i = 0; i < gameState.foundWordCount; i++) {
        if (strcasecmp(word, gameState.foundWords[i]) == 0) {
            printf("Word already found!\n");
            return;
        }
    }
    
    // Valid word
    strcpy(gameState.foundWords[gameState.foundWordCount], word);
    gameState.foundWordCount++;
    currentUser->score += strlen(word) * gameState.level;
    
    printf("Valid word: %s (+%d points)\n", word, (int)strlen(word) * gameState.level);
    
    // Reset selc
    gameState.selectedLetterCount = 0;
    
    if (gameState.foundWordCount >= gameState.requiredWords) {
        completeLevel();
    }
}

void completeLevel() {
    printf("\nLevel %d completed! Your score: %d\n", gameState.level, currentUser->score);
    
    currentUser->level++;
    saveUsers();
    
    printf("Press Enter to continue to next level or Q to quit...");
    char input[10];
    fgets(input, sizeof(input), stdin);
    
    if (tolower(input[0]) != 'q') {
        startGame();
    } else {
        showMainMenu();
    }
}

void saveAndQuit() {
    saveUsers();
    printf("Game saved.\n");
    showMainMenu();
}

void startGame() {
    if (!currentUser) return;
    
    // Initialize state
    memset(&gameState, 0, sizeof(gameState));
    gameState.level = currentUser->level;
    
    // Calculate game parameters based on level!!!!!!!!!!!!!!!!!!
    gameState.letterCount = (5 + gameState.level / 2);
    if (gameState.letterCount > MAX_LETTERS) gameState.letterCount = MAX_LETTERS;
    
    gameState.requiredWords = 2 + gameState.level / 3;
    if (gameState.requiredWords > 10) gameState.requiredWords = 10;
    
    gameState.minLength = 2 + gameState.level / 5;
    if (gameState.minLength < MIN_WORD_LENGTH) gameState.minLength = MIN_WORD_LENGTH;
    
    generatePlayableLetters(gameState.letterCount);
    
    //  loop
    while (gameState.foundWordCount < gameState.requiredWords) {
        updateGameUI();
        
        printf("\nOptions:\n");
        printf("1. Select letters (enter letter numbers separated by spaces)\n");
        printf("2. Submit word\n");
        printf("3. Save and quit\n");
        printf("Enter your choice: ");
        
        int choice;
        scanf("%d", &choice);
        while (getchar() != '\n'); // Clear anda ttilin inputs
        
        switch (choice) {
            case 1: {
                printf("Enter letter numbers (1-%d) separated by spaces: ", gameState.letterCount);
                char input[100];
                fgets(input, sizeof(input), stdin);
                
                // Reset selection
                gameState.selectedLetterCount = 0;
                
                // Parse input
                char* token = strtok(input, " ");
                while (token != NULL) {
                    int index = atoi(token) - 1;
                    if (index >= 0 && index < gameState.letterCount) {
                        toggleLetterSelection(index);
                    }
                    token = strtok(NULL, " ");
                }
                break;
            }
            case 2:
                submitWord();
                break;
            case 3:
                saveAndQuit();
                return;
            default:
                printf("Invalid choice!\n");
        }
    }
}

void handleLogin() {
    char name[MAX_NAME_LENGTH];
    printf("Enter your name: ");
    fgets(name, sizeof(name), stdin);
    name[strcspn(name, "\n")] = '\0'; 
    
    if (strlen(name) == 0) {
        printf("Please enter your name!\n");
        return;
    }
    
    currentUser = findUser(name);
    
    if (currentUser) {
        showMainMenu();
    } else {
        printf("New user detected. Please register.\n");
        
        User newUser;
        strcpy(newUser.name, name);
        
        printf("Enter your surname: ");
        fgets(newUser.surname, sizeof(newUser.surname), stdin);
        newUser.surname[strcspn(newUser.surname, "\n")] = '\0';
        
        printf("Enter your age: ");
        char ageStr[10];
        fgets(ageStr, sizeof(ageStr), stdin);
        newUser.age = atoi(ageStr);
        
        if (userCount >= MAX_USERS) {
            printf("Maximum number of users reached!\n");
            return;
        }
        
        newUser.level = 1;
        newUser.score = 0;
        
        users[userCount++] = newUser;
        currentUser = &users[userCount - 1];
        
        saveUsers();
        showMainMenu();
    }
}

void quitGame() {
    printf("Are you sure you want to quit? (y/n): ");
    char choice;
    scanf(" %c", &choice);
    
    if (tolower(choice) == 'y') {
        currentUser = NULL;
        printf("Goodbye!\n");
    } else {
        showMainMenu();
    }
}

void mainMenuHandler() {
    while (1) {
        showMainMenu();
        
        printf("Enter your choice: ");
        int choice;
        scanf("%d", &choice);
        while (getchar() != '\n'); 
        
        switch (choice) {
            case 1:
                // New game - reset koullech hacha isem d l'age
                currentUser->level = 1;
                currentUser->score = 0;
                startGame();
                break;
            case 2:
                // Resume 
                startGame();
                break;
            case 3:
                showProfile();
                break;
            case 4:
                quitGame();
                return;
            default:
                printf("Invalid choice!\n");
        }
    }
}

int main() {
    srand(time(NULL));
    loadUsers();
    
    printf("=== French Word Dream ===\n");
    
    while (1) {
        handleLogin();
        if (currentUser) {
            mainMenuHandler();
        }
    }
    
    return 0;
}
