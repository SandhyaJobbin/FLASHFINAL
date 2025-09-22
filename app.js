// Game State Management
class GameState {
    constructor() {
        this.currentRound = 1;
        this.score = 0;
        this.lives = 3;
        this.currentImage = null;
        this.selectedObjects = [];
        this.gameData = null;
        this.isPlaying = false;
        this.isDemoMode = false;
        this.memorizationTimer = null;
        this.currentMode = 'game'; // 'game' or 'admin'
        this.correctSelections = 0;
        this.totalSelections = 0;
        this.usedImageIds = [];
    }

    reset() {
        this.currentRound = 1;
        this.score = 0;
        this.lives = 3;
        this.currentImage = null;
        this.selectedObjects = [];
        this.isPlaying = false;
        this.correctSelections = 0;
        this.totalSelections = 0;
        this.usedImageIds = [];
        if (this.memorizationTimer) {
            clearInterval(this.memorizationTimer);
            this.memorizationTimer = null;
        }
    }

    setDemoMode(isDemo) {
        this.isDemoMode = isDemo;
        if (isDemo) {
            this.lives = 1; // Demo has only one attempt
        }
    }
}

// Data Management
class DataManager {
    constructor() {
        this.storageKey = 'flashFiveFrenzyData';
        this.defaultData = null;
    }

    getDefaultGameData() {
        return {
            "demo_image": {
                "id": 0,
                "image_path": "image1.jpg",
                "description": "Office/Workspace Setup - Demo",
                "correct_objects": [
                    "Laptop with keyboard and trackpad",
                    "Smartphone with blank screen", 
                    "Silver pen",
                    "White cup filled with black coffee",
                    "Glass vase holding a bouquet of leaves"
                ],
                "incorrect_objects": [
                    "A sleek wireless mouse",
                    "A minimalist notebook or planner", 
                    "An LED desk lamp with an adjustable arm",
                    "A wooden organizer tray",
                    "A small potted succulent for a pop of living green"
                ]
            },
            "game_images": [
                {
                    "id": 1,
                    "image_path": "image2.jpg",
                    "description": "Emoji Collection",
                    "correct_objects": [
                        "😂 Face with Tears of Joy",
                        "😍 Smiling Face with Heart-Eyes",
                        "😜 Winking Face with Tongue", 
                        "😬 Grimacing Face",
                        "😵 Dizzy Face"
                    ],
                    "incorrect_objects": [
                        "🤣 Rolling on the Floor Laughing",
                        "😝 Squinting Face with Tongue",
                        "😁 Beaming Face with Smiling Eyes",
                        "😆 Grinning Squinting Face", 
                        "😉 Winking Face"
                    ]
                },
                {
                    "id": 2,
                    "image_path": "image3.jpg",
                    "description": "Fruit Collection",
                    "correct_objects": [
                        "Bananas",
                        "Green grapes",
                        "Red grapes", 
                        "Oranges",
                        "Watermelon"
                    ],
                    "incorrect_objects": [
                        "Lychee",
                        "Rambutan",
                        "Passion fruit",
                        "Guava",
                        "Persimmon"
                    ]
                },
                {
                    "id": 3,
                    "image_path": "image4.jpg",
                    "description": "Vehicle Collection",
                    "correct_objects": [
                        "Passenger sedans",
                        "Sport Utility Vehicles (SUVs)",
                        "Pickup trucks",
                        "Vans",
                        "Full-size SUV"
                    ],
                    "incorrect_objects": [
                        "Hatchbook",
                        "Convertible",
                        "Motorcycle or scooter",
                        "Bus",
                        "Semi-trailer truck"
                    ]
                },
                {
                    "id": 4,
                    "image_path": "image5.jpg",
                    "description": "Tech Gadgets Collection",
                    "correct_objects": [
                        "White over-ear headphones",
                        "Black DSLR camera",
                        "Small cylindrical Bluetooth speaker",
                        "White tablet with white wired earphones",
                        "Coiled white USB cable"
                    ],
                    "incorrect_objects": [
                        "Wireless earbuds with a charging case",
                        "Portable SSD drive",
                        "Stylus pen for touchscreen devices",
                        "Laptop computer",
                        "Compact foldable drone"
                    ]
                }
            ]
        };
    }

    loadGameData() {
        try {
            // Try to load from local storage first
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.defaultData = data;
                return data;
            }

            // Use default data
            const defaultData = this.getDefaultGameData();
            
            // Save to local storage for future use
            this.saveGameData(defaultData);
            this.defaultData = defaultData;
            return defaultData;
        } catch (error) {
            console.error('Error loading game data:', error);
            // Return minimal fallback data
            return this.getDefaultGameData();
        }
    }

    saveGameData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }

    exportData() {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flash-five-frenzy-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        }
        return false;
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.saveGameData(data);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}

// UI Management
class UIManager {
    constructor(gameState, dataManager) {
        this.gameState = gameState;
        this.dataManager = dataManager;
        this.elements = {};
    }

    init() {
        this.bindElements();
        this.bindEvents();
    }

    bindElements() {
        // Game elements
        this.elements.modeToggle = document.getElementById('modeToggle');
        this.elements.gameContainer = document.getElementById('gameContainer');
        this.elements.adminContainer = document.getElementById('adminContainer');
        this.elements.gameStatus = document.getElementById('gameStatus');
        this.elements.currentRound = document.getElementById('currentRound');
        this.elements.currentScore = document.getElementById('currentScore');
        this.elements.currentLives = document.getElementById('currentLives');
        
        // Game phases
        this.elements.welcomePhase = document.getElementById('welcomePhase');
        this.elements.demoIndicator = document.getElementById('demoIndicator');
        this.elements.memorizationPhase = document.getElementById('memorizationPhase');
        this.elements.testingPhase = document.getElementById('testingPhase');
        this.elements.resultsPhase = document.getElementById('resultsPhase');
        this.elements.gameOverPhase = document.getElementById('gameOverPhase');
        
        // Game phase elements
        this.elements.tryDemoBtn = document.getElementById('tryDemoBtn');
        this.elements.startGameBtn = document.getElementById('startGameBtn');
        this.elements.memorizationImage = document.getElementById('memorizationImage');
        this.elements.memorizationTimer = document.getElementById('memorizationTimer');
        this.elements.imageLoadingOverlay = document.getElementById('imageLoadingOverlay');
        this.elements.imageDescription = document.getElementById('imageDescription');
        this.elements.objectsGrid = document.getElementById('objectsGrid');
        this.elements.selectionCount = document.getElementById('selectionCount');
        this.elements.submitAnswers = document.getElementById('submitAnswers');
        this.elements.nextRoundBtn = document.getElementById('nextRoundBtn');
        this.elements.playAgainBtn = document.getElementById('playAgainBtn');
        this.elements.startRealGameBtn = document.getElementById('startRealGameBtn');
        this.elements.restartGameBtn = document.getElementById('restartGameBtn');
        
        // Results elements
        this.elements.resultsTitle = document.getElementById('resultsTitle');
        this.elements.resultsScore = document.getElementById('resultsScore');
        this.elements.resultsFeedback = document.getElementById('resultsFeedback');
        this.elements.finalScore = document.getElementById('finalScore');
        this.elements.roundsCompleted = document.getElementById('roundsCompleted');
        this.elements.finalAccuracy = document.getElementById('finalAccuracy');
        
        // Admin elements
        this.elements.adminTabs = document.getElementById('adminTabs');
        this.elements.tabContent = document.getElementById('tabContent');
        this.elements.exportDataBtn = document.getElementById('exportDataBtn');
        this.elements.importDataBtn = document.getElementById('importDataBtn');
        this.elements.importFileInput = document.getElementById('importFileInput');
        this.elements.resetAllBtn = document.getElementById('resetAllBtn');
        
        // Modal elements
        this.elements.confirmModal = document.getElementById('confirmModal');
        this.elements.confirmModalOverlay = document.getElementById('confirmModalOverlay');
        this.elements.confirmModalTitle = document.getElementById('confirmModalTitle');
        this.elements.confirmModalMessage = document.getElementById('confirmModalMessage');
        this.elements.confirmModalCancel = document.getElementById('confirmModalCancel');
        this.elements.confirmModalConfirm = document.getElementById('confirmModalConfirm');
        
        // Toast container
        this.elements.toastContainer = document.getElementById('toastContainer');
    }

    bindEvents() {
        // Mode toggle
        if (this.elements.modeToggle) {
            this.elements.modeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMode();
            });
        }
        
        // Game events
        if (this.elements.tryDemoBtn) {
            this.elements.tryDemoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startDemo();
            });
        }
        
        if (this.elements.startGameBtn) {
            this.elements.startGameBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startGame();
            });
        }
        
        if (this.elements.startRealGameBtn) {
            this.elements.startRealGameBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startGame();
            });
        }
        
        if (this.elements.submitAnswers) {
            this.elements.submitAnswers.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.submitAnswers();
            });
        }
        
        if (this.elements.nextRoundBtn) {
            this.elements.nextRoundBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextRound();
            });
        }
        
        if (this.elements.playAgainBtn) {
            this.elements.playAgainBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.restartGame();
            });
        }
        
        if (this.elements.restartGameBtn) {
            this.elements.restartGameBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.restartGame();
            });
        }
        
        // Admin events
        if (this.elements.exportDataBtn) {
            this.elements.exportDataBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.exportData();
            });
        }
        
        if (this.elements.importDataBtn) {
            this.elements.importDataBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.importData();
            });
        }
        
        if (this.elements.importFileInput) {
            this.elements.importFileInput.addEventListener('change', (e) => this.handleFileImport(e));
        }
        
        if (this.elements.resetAllBtn) {
            this.elements.resetAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.resetAllData();
            });
        }
        
        // Modal events
        if (this.elements.confirmModalOverlay) {
            this.elements.confirmModalOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideModal();
            });
        }
        
        if (this.elements.confirmModalCancel) {
            this.elements.confirmModalCancel.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideModal();
            });
        }
    }

    toggleMode() {
        if (this.gameState.currentMode === 'game') {
            this.gameState.currentMode = 'admin';
            this.elements.gameContainer.classList.add('hidden');
            this.elements.adminContainer.classList.remove('hidden');
            this.elements.modeToggle.querySelector('.toggle-text').textContent = 'Game Mode';
            this.setupAdminPanel();
        } else {
            this.gameState.currentMode = 'game';
            this.elements.gameContainer.classList.remove('hidden');
            this.elements.adminContainer.classList.add('hidden');
            this.elements.modeToggle.querySelector('.toggle-text').textContent = 'Admin Panel';
        }
    }

    updateGameStatus() {
        if (this.elements.currentRound) this.elements.currentRound.textContent = this.gameState.currentRound;
        if (this.elements.currentScore) this.elements.currentScore.textContent = this.gameState.score;
        if (this.elements.currentLives) this.elements.currentLives.textContent = this.gameState.lives;
    }

    showPhase(phase) {
        // Hide all phases
        document.querySelectorAll('.game-phase').forEach(p => p.classList.add('hidden'));
        this.elements.demoIndicator.classList.add('hidden');
        
        // Show appropriate status and indicator
        if (phase === 'welcome') {
            this.elements.gameStatus.classList.add('hidden');
        } else {
            this.elements.gameStatus.classList.remove('hidden');
            if (this.gameState.isDemoMode) {
                this.elements.demoIndicator.classList.remove('hidden');
            }
        }
        
        // Show target phase
        const phaseElement = this.elements[phase + 'Phase'];
        if (phaseElement) {
            phaseElement.classList.remove('hidden');
        }
    }

    startDemo() {
        console.log('Starting demo...');
        this.gameState.reset();
        this.gameState.setDemoMode(true);
        this.gameState.isPlaying = true;
        this.updateGameStatus();
        this.startMemorizationPhase();
    }

    startGame() {
        console.log('Starting game...');
        this.gameState.reset();
        this.gameState.setDemoMode(false);
        this.gameState.isPlaying = true;
        this.updateGameStatus();
        this.startMemorizationPhase();
    }


startMemorizationPhase() {
    // Get current image based on mode
    if (this.gameState.isDemoMode) {
        this.gameState.currentImage = this.gameState.gameData.demo_image;
    } else {
        const images = this.gameState.gameData.game_images;
        // If all images have been shown, end the game
        if (this.gameState.currentRound > images.length) {
            this.showGameOver();
            return;
        }
        // Show images in order based on currentRound
        this.gameState.currentImage = images[this.gameState.currentRound - 1];
    }

    this.showPhase('memorization');

    // Update description
    const modeText = this.gameState.isDemoMode ? 'demo' : 'game';
    if (this.elements.imageDescription) {
        this.elements.imageDescription.textContent =
            `Study the ${this.gameState.currentImage.description} carefully. (${modeText} mode)`;
    }

    // Show loading overlay
    if (this.elements.imageLoadingOverlay) {
        this.elements.imageLoadingOverlay.classList.remove('hidden');
    }

    // Load image with fallback
    this.loadGameImage();
}


    loadGameImage() {
        const imagePath = this.gameState.currentImage.image_path;
        
        // Create new image element to test loading
        const img = new Image();
        
        img.onload = () => {
            if (this.elements.memorizationImage) {
                this.elements.memorizationImage.src = imagePath;
            }
            if (this.elements.imageLoadingOverlay) {
                this.elements.imageLoadingOverlay.classList.add('hidden');
            }
            this.startTimer();
        };
        
        img.onerror = () => {
            // Fallback to placeholder
            const placeholderSvg = this.createPlaceholderImage(this.gameState.currentImage.description);
            if (this.elements.memorizationImage) {
                this.elements.memorizationImage.src = placeholderSvg;
            }
            if (this.elements.imageLoadingOverlay) {
                this.elements.imageLoadingOverlay.classList.add('hidden');
            }
            this.showToast(`Image ${imagePath} not found. Using placeholder.`, 'warning');
            this.startTimer();
        };
        
        img.src = imagePath;
    }

    createPlaceholderImage(description) {
        const svg = `
            <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
                <rect x="50" y="50" width="500" height="300" fill="#e0e0e0" stroke="#ccc" stroke-width="2" rx="10"/>
                <text x="300" y="180" font-family="Arial, sans-serif" font-size="18" fill="#666" text-anchor="middle">${description}</text>
                <text x="300" y="220" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle">Image placeholder - Add real image to images/folder</text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    startTimer() {
        let timeLeft = 10;
        if (this.elements.memorizationTimer) {
            this.elements.memorizationTimer.textContent = timeLeft;
        }
        
        this.gameState.memorizationTimer = setInterval(() => {
            timeLeft--;
            if (this.elements.memorizationTimer) {
                this.elements.memorizationTimer.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.gameState.memorizationTimer);
                this.startTestingPhase();
            }
        }, 1000);
    }

    startTestingPhase() {
        this.showPhase('testing');
        this.gameState.selectedObjects = [];
        this.generateObjectGrid();
        this.updateSelectionCount();
    }

    generateObjectGrid() {
        // Combine correct and incorrect objects
        const allObjects = [
            ...this.gameState.currentImage.correct_objects,
            ...this.gameState.currentImage.incorrect_objects
        ];
        
        // Shuffle the objects
        const shuffledObjects = this.shuffleArray([...allObjects]);
        
        // Clear grid
        if (this.elements.objectsGrid) {
            this.elements.objectsGrid.innerHTML = '';
        
            // Create object cards
            shuffledObjects.forEach((object, index) => {
                const card = document.createElement('div');
                card.className = 'object-card';
                card.dataset.object = object;
                card.innerHTML = `<div class="object-text">${object}</div>`;
                
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectObject(card, object);
                });
                
                this.elements.objectsGrid.appendChild(card);
            });
        }
    }

    selectObject(card, object) {
        if (card.classList.contains('selected')) {
            // Deselect
            card.classList.remove('selected');
            this.gameState.selectedObjects = this.gameState.selectedObjects.filter(obj => obj !== object);
        } else {
            // Select (if not at limit)
            if (this.gameState.selectedObjects.length < 5) {
                card.classList.add('selected');
                this.gameState.selectedObjects.push(object);
            } else {
                this.showToast('You can only select 5 objects!', 'warning');
                return;
            }
        }
        
        this.updateSelectionCount();
        if (this.elements.submitAnswers) {
            this.elements.submitAnswers.disabled = this.gameState.selectedObjects.length !== 5;
        }
    }

    updateSelectionCount() {
        if (this.elements.selectionCount) {
            this.elements.selectionCount.textContent = this.gameState.selectedObjects.length;
        }
    }

    submitAnswers() {
        const correctObjects = this.gameState.currentImage.correct_objects;
        const results = {
            correct: [],
            incorrect: [],
            missed: []
        };
        
        // Check selected objects
        this.gameState.selectedObjects.forEach(obj => {
            if (correctObjects.includes(obj)) {
                results.correct.push(obj);
            } else {
                results.incorrect.push(obj);
            }
        });
        
        // Find missed objects
        correctObjects.forEach(obj => {
            if (!this.gameState.selectedObjects.includes(obj)) {
                results.missed.push(obj);
            }
        });
        
        // Update statistics
        this.gameState.correctSelections += results.correct.length;
        this.gameState.totalSelections += this.gameState.selectedObjects.length;
        
        // Show visual feedback on cards
        document.querySelectorAll('.object-card').forEach(card => {
            const obj = card.dataset.object;
            if (results.correct.includes(obj)) {
                card.classList.add('correct');
            } else if (results.incorrect.includes(obj)) {
                card.classList.add('incorrect');
            }
        });
        
        // Calculate score and show results after delay
        setTimeout(() => {
            this.showResults(results);
        }, 2000);
    }

    showResults(results) {
        const correctCount = results.correct.length;
        const roundScore = correctCount * 2;
        if (!this.gameState.isDemoMode) {
    this.gameState.score += roundScore;
}
        
        this.showPhase('results');
        
        // Update results display
        if (correctCount === 5) {
            if (this.elements.resultsTitle) {
                this.elements.resultsTitle.textContent = this.gameState.isDemoMode ? 'Demo Complete! 🎉' : 'Perfect Round! 🎉';
                this.elements.resultsTitle.style.color = 'var(--color-success)';
            }
        } else if (correctCount >= 3) {
            if (this.elements.resultsTitle) {
                this.elements.resultsTitle.textContent = 'Good Job! 👍';
                this.elements.resultsTitle.style.color = 'var(--color-warning)';
            }
        } else {
            if (this.elements.resultsTitle) {
                this.elements.resultsTitle.textContent = 'Keep Trying! 💪';
                this.elements.resultsTitle.style.color = 'var(--color-error)';
            }
            if (!this.gameState.isDemoMode) {
                this.gameState.lives--;
            }
        }
        
        if (this.elements.resultsScore) {
            this.elements.resultsScore.textContent = `Score: +${roundScore}`;
        }
        
        // Generate feedback
        this.generateResultsFeedback(results);
        
        // Update game status
        this.updateGameStatus();
        
        // Show appropriate buttons based on mode and game state
        if (this.gameState.isDemoMode) {
            if (this.elements.nextRoundBtn) this.elements.nextRoundBtn.classList.add('hidden');
            if (this.elements.playAgainBtn) this.elements.playAgainBtn.classList.add('hidden');
            if (this.elements.startRealGameBtn) this.elements.startRealGameBtn.classList.remove('hidden');
        } else if (this.gameState.lives <= 0) {
            if (this.elements.nextRoundBtn) this.elements.nextRoundBtn.classList.add('hidden');
            if (this.elements.playAgainBtn) this.elements.playAgainBtn.classList.remove('hidden');
            if (this.elements.startRealGameBtn) this.elements.startRealGameBtn.classList.add('hidden');
            setTimeout(() => this.showGameOver(), 3000);
        } else {
            if (this.elements.nextRoundBtn) this.elements.nextRoundBtn.classList.remove('hidden');
            if (this.elements.playAgainBtn) this.elements.playAgainBtn.classList.add('hidden');
            if (this.elements.startRealGameBtn) this.elements.startRealGameBtn.classList.add('hidden');
        }
    }

    generateResultsFeedback(results) {
        let feedbackHTML = `
            <div class="feedback-section">
                <h4>✅ Correct Selections (${results.correct.length}/5)</h4>
                <ul class="feedback-list">
                    ${results.correct.map(obj => `<li>• ${obj}</li>`).join('')}
                </ul>
            </div>
        `;
        
        if (results.incorrect.length > 0) {
            feedbackHTML += `
                <div class="feedback-section">
                    <h4>❌ Incorrect Selections (${results.incorrect.length})</h4>
                    <ul class="feedback-list">
                        ${results.incorrect.map(obj => `<li>• ${obj}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (results.missed.length > 0) {
            feedbackHTML += `
                <div class="feedback-section">
                    <h4>👀 You Missed These Objects</h4>
                    <ul class="feedback-list">
                        ${results.missed.map(obj => `<li>• ${obj}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (this.gameState.isDemoMode) {
            feedbackHTML += `
                <div class="feedback-section">
                    <h4>🎯 Ready for the Real Challenge?</h4>
                    <p style="color: var(--color-text-secondary); margin: 0;">
                        Now you know how to play! Try the real game with different image categories 
                        and progressive difficulty. Can you beat your high score?
                    </p>
                </div>
            `;
        }
        
        if (this.elements.resultsFeedback) {
            this.elements.resultsFeedback.innerHTML = feedbackHTML;
        }
    }

    nextRound() {
        this.gameState.currentRound++;
        this.updateGameStatus();
        this.startMemorizationPhase();
    }

    restartGame() {
        this.gameState.reset();
        this.updateGameStatus();
        this.showPhase('welcome');
    }

    showGameOver() {
        this.showPhase('gameOver');
        
        const accuracy = this.gameState.totalSelections > 0 ? 
            Math.round((this.gameState.correctSelections / this.gameState.totalSelections) * 100) : 0;
        
        if (this.elements.finalScore) this.elements.finalScore.textContent = this.gameState.score;
        if (this.elements.roundsCompleted) this.elements.roundsCompleted.textContent = this.gameState.currentRound - 1;
        if (this.elements.finalAccuracy) this.elements.finalAccuracy.textContent = accuracy + '%';
    }

    // Admin Panel Methods
    setupAdminPanel() {
        const data = this.gameState.gameData;
        if (!data) return;
        
        // Create tabs for demo + all game images
        const allImages = [data.demo_image, ...data.game_images];
        this.generateAdminTabs(allImages);
        this.generateTabContent(allImages);
    }

    generateAdminTabs(images) {
        if (this.elements.adminTabs) {
            this.elements.adminTabs.innerHTML = images.map((image, index) => 
                `<button class="tab-button ${index === 0 ? 'active' : ''}" data-tab="${image.id}">
                    ${image.id === 0 ? 'Demo: ' : ''}${image.description}
                </button>`
            ).join('');
            
            // Bind tab events
            this.elements.adminTabs.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.target.classList.contains('tab-button')) {
                    this.switchTab(e.target.dataset.tab);
                }
            });
        }
    }

    generateTabContent(images) {
        if (this.elements.tabContent) {
            this.elements.tabContent.innerHTML = images.map((image, index) => 
                `<div class="tab-panel ${index === 0 ? 'active' : ''}" data-panel="${image.id}">
                    ${this.generateCategoryPanel(image)}
                </div>`
            ).join('');
            
            // Bind upload events
            this.bindUploadEvents();
        }
    }

    generateCategoryPanel(image) {
        const isDemo = image.id === 0;
        return `
            <div class="category-header">
                <h3 class="category-title">${isDemo ? 'Demo: ' : ''}${image.description}</h3>
                <p class="category-description">
                    ${isDemo ? 'Demo image (image1.jpg) - Used for teaching gameplay' : `Game image (${image.image_path}) - Used in main game rounds`}
                </p>
            </div>
            
            <div class="image-upload-section" data-category="${image.id}">
                <div class="upload-area">
                    <div class="upload-placeholder">
                        📁 Drop an image here or click to browse
                    </div>
                    <input type="file" class="file-input form-control" accept="image/*" data-category="${image.id}">
                    ${image.uploaded_image ? `<img src="${image.uploaded_image}" alt="Preview" class="image-preview">` : ''}
                </div>
            </div>
            
            <div class="objects-management">
                <div class="objects-section">
                    <h4>✅ Correct Objects</h4>
                    <ul class="objects-list">
                        ${image.correct_objects.map((obj, idx) => 
                            `<li class="object-item">
                                <span class="object-text">${obj}</span>
                                <button class="edit-object-btn" data-category="${image.id}" data-type="correct" data-index="${idx}">Edit</button>
                            </li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="objects-section">
                    <h4>❌ Incorrect Objects</h4>
                    <ul class="objects-list">
                        ${image.incorrect_objects.map((obj, idx) => 
                            `<li class="object-item">
                                <span class="object-text">${obj}</span>
                                <button class="edit-object-btn" data-category="${image.id}" data-type="incorrect" data-index="${idx}">Edit</button>
                            </li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    switchTab(tabId) {
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeTab) activeTab.classList.add('active');
        
        // Update active panel
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        const activePanel = document.querySelector(`[data-panel="${tabId}"]`);
        if (activePanel) activePanel.classList.add('active');
    }

    bindUploadEvents() {
        // File input changes
        document.querySelectorAll('.file-input').forEach(input => {
            input.addEventListener('change', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleImageUpload(e);
            });
        });
        
        // Upload section clicks
        document.querySelectorAll('.image-upload-section').forEach(section => {
            section.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const fileInput = section.querySelector('.file-input');
                if (fileInput) {
                    fileInput.click();
                }
            });
        });
        
        // Edit object buttons
        document.querySelectorAll('.edit-object-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.editObject(e);
            });
        });
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        const categoryId = e.target.dataset.category;
        if (file) {
            this.processImageFile(file, categoryId);
        }
    }

    processImageFile(file, categoryId) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.updateImageForCategory(categoryId, imageData);
            this.showToast('Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    updateImageForCategory(categoryId, imageData) {
        const isDemo = categoryId == 0;
        let category;
        
        if (isDemo) {
            category = this.gameState.gameData.demo_image;
        } else {
            category = this.gameState.gameData.game_images.find(img => img.id == categoryId);
        }
        
        if (category) {
            category.uploaded_image = imageData;
            this.dataManager.saveGameData(this.gameState.gameData);
            
            // Update preview
            const panel = document.querySelector(`[data-panel="${categoryId}"]`);
            if (panel) {
                const uploadSection = panel.querySelector('.image-upload-section');
                let preview = uploadSection.querySelector('.image-preview');
                
                if (!preview) {
                    preview = document.createElement('img');
                    preview.className = 'image-preview';
                    preview.alt = 'Preview';
                    uploadSection.querySelector('.upload-area').appendChild(preview);
                }
                
                preview.src = imageData;
            }
        }
    }

    editObject(e) {
        const btn = e.target;
        const categoryId = btn.dataset.category;
        const type = btn.dataset.type;
        const index = parseInt(btn.dataset.index);
        
        const isDemo = categoryId == 0;
        let category;
        
        if (isDemo) {
            category = this.gameState.gameData.demo_image;
        } else {
            category = this.gameState.gameData.game_images.find(img => img.id == categoryId);
        }
        
        const currentText = category[type + '_objects'][index];
        
        const newText = prompt(`Edit ${type} object:`, currentText);
        if (newText && newText.trim() && newText !== currentText) {
            category[type + '_objects'][index] = newText.trim();
            this.dataManager.saveGameData(this.gameState.gameData);
            
            // Update display
            btn.parentElement.querySelector('.object-text').textContent = newText.trim();
            this.showToast('Object updated successfully!', 'success');
        }
    }

    exportData() {
        if (this.dataManager.exportData()) {
            this.showToast('Data exported successfully!', 'success');
        } else {
            this.showToast('Failed to export data', 'error');
        }
    }

    importData() {
        if (this.elements.importFileInput) {
            this.elements.importFileInput.click();
        }
    }

    handleFileImport(e) {
        const file = e.target.files[0];
        if (file) {
            this.dataManager.importData(file)
                .then(data => {
                    this.gameState.gameData = data;
                    this.showToast('Data imported successfully!', 'success');
                    this.setupAdminPanel(); // Refresh admin panel
                })
                .catch(error => {
                    this.showToast('Failed to import data: ' + error.message, 'error');
                });
        }
    }

    resetAllData() {
        this.showModal(
            'Reset All Data',
            'This will reset all images and objects to default values. This action cannot be undone.',
            () => {
                localStorage.removeItem(this.dataManager.storageKey);
                const data = this.dataManager.loadGameData();
                this.gameState.gameData = data;
                this.setupAdminPanel();
                this.showToast('All data has been reset to defaults', 'success');
            }
        );
    }

    showModal(title, message, confirmCallback) {
        if (this.elements.confirmModalTitle) this.elements.confirmModalTitle.textContent = title;
        if (this.elements.confirmModalMessage) this.elements.confirmModalMessage.textContent = message;
        if (this.elements.confirmModal) this.elements.confirmModal.classList.remove('hidden');
        
        // Set up confirm callback
        if (this.elements.confirmModalConfirm) {
            this.elements.confirmModalConfirm.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                confirmCallback();
                this.hideModal();
            };
        }
    }

    hideModal() {
        if (this.elements.confirmModal) {
            this.elements.confirmModal.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        if (!this.elements.toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Show animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Initialize Application
class FlashFiveFrenzyApp {
    constructor() {
        this.gameState = new GameState();
        this.dataManager = new DataManager();
        this.uiManager = new UIManager(this.gameState, this.dataManager);
        this.init();
    }

    init() {
        try {
            // Load game data
            const data = this.dataManager.loadGameData();
            this.gameState.gameData = data;
            
            // Initialize UI
            this.uiManager.init();
            this.uiManager.updateGameStatus();
            
            console.log('Flash Five Frenzy initialized successfully!');
            console.log('Demo image:', data.demo_image.image_path);
            console.log('Game images:', data.game_images.map(img => img.image_path));
        } catch (error) {
            console.error('Failed to initialize application:', error);
            if (this.uiManager && this.uiManager.showToast) {
                this.uiManager.showToast('Failed to load game data', 'error');
            }
        }
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FlashFiveFrenzyApp();
});
