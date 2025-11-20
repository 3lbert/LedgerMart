document.addEventListener('DOMContentLoaded', () => {
    // --- Game State (mirroring your Python engine) ---
    const game = {
        day: 1,
        money: 1000,
        weather: 'Cerah',
        items: [
            { name: "Sampo", buyPrice: 5, sellPrice: 8, stock: 10, img: 'https://placehold.co/80x80/e7d5bf/6b5247?text=Shampoo' },
            { name: "Sabun Mandi", buyPrice: 3, sellPrice: 5, stock: 10, img: 'https://placehold.co/80x80/e7d5bf/6b5247?text=Soap' },
            { name: "Sikat Gigi", buyPrice: 2, sellPrice: 4, stock: 10, img: 'https://placehold.co/80x80/e7d5bf/6b5247?text=Toothbrush' },
            { name: "Snack", buyPrice: 4, sellPrice: 7, stock: 10, img: 'https://placehold.co/80x80/e7d5bf/6b5247?text=Snack' },
            { name: "Coklat", buyPrice: 6, sellPrice: 9, stock: 10, img: 'https://placehold.co/80x80/e7d5bf/6b5247?text=Chocolate' },
            { name: "Pasta Gigi", buyPrice: 3, sellPrice: 6, stock: 10, img: 'https://placehold.co/80x80/e7d5bf/6b5247?text=Toothpaste' },
            { name: "Air Mineral", buyPrice: 1, sellPrice: 2, stock: 10, img: 'https://placehold.co/80x80/e7d5bf/6b5247?text=Water' },
            { name: "Lampu", buyPrice: 10, sellPrice: 15, stock: 10, img: 'https://placehold.co/80x80/e7d5bf/6b5247?text=Lamp' },
            { name: "Sabun Cuci Piring", buyPrice: 4, sellPrice: 7, stock: 10, img: 'https://placehold.co/80x80/e7d5bf/6b5247?text=Dish+Soap' },
            { name: "Batu Baterai", buyPrice: 2, sellPrice: 4, stock: 10, img: 'https://placehold.co/80x80/e7d5bf/6b5247?text=Battery' }
        ],
        // Add game costs mirroring your Python code
        sewa: 50,
        listrik: 20
    };
    
    // --- DOM Elements ---
    const dayDisplay = document.getElementById('day-display-front');
    const moneyDisplay = document.getElementById('money-display');
    const weatherDisplay = document.getElementById('weather-display-front');
    const itemStandsContainer = document.getElementById('item-stands-container');
    const controlPanel = document.querySelector('.control-panel');
    const gameModal = document.getElementById('game-modal');
    const modalContent = document.getElementById('modal-content');
    const modalText = document.getElementById('modal-text');
    const modalCloseButton = document.getElementById('modal-close-button');
    const timerDisplay = document.getElementById('timer-display-front');
    const introScreen = document.getElementById('intro-screen');
    const startGameButton = document.getElementById('start-game-button');
    const tutorialButton = document.getElementById('tutorial-button');
    const gameContainer = document.querySelector('.game-container');
    const alienAlarm = document.getElementById('alien-alarm');
    const alienWarningOverlay = document.getElementById('alien-warning-overlay');
    const hintContainer = document.getElementById('hint-container');
    const alienCharacter = document.getElementById('alien');
    const thiefCharacter = document.getElementById('thief');
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const settingsCloseButton = document.getElementById('settings-close-button');
    const masterVolumeSlider = document.getElementById('master-volume-slider');
    const musicVolumeSlider = document.getElementById('music-volume-slider');
    const sfxVolumeSlider = document.getElementById('sfx-volume-slider');
    const muteButton = document.getElementById('mute-button');
    const backgroundMusic = document.getElementById('background-music');
    const uiClick = document.getElementById('ui-click');

    const customerPersonalities = {
        BARGAIN_HUNTER: { name: 'Bargain Hunter', moneyMultiplier: 0.7, impulse: 0.1 },
        AVERAGE_JOE: { name: 'Average Joe', moneyMultiplier: 1.0, impulse: 0.3 },
        BIG_SPENDER: { name: 'Big Spender', moneyMultiplier: 1.5, impulse: 0.6 }
    };

    let dayTimerInterval = null;
    let eventScheduled = null; // NEW: To hold the scheduled event for the day

    // Daily Report elements
    const viewLogbookButton = document.getElementById('view-logbook-button');
    const restockButton = document.getElementById('restock-button');
    const setPricesButton = document.getElementById('set-prices-button');
    const nextDayButton = document.getElementById('next-day-button');
    const dailyReportModal = document.getElementById('daily-report-modal');
    const dailyReportCloseButton = document.getElementById('daily-report-close-button');
    const prevReportPageButton = document.getElementById('prev-report-page-button');
    const nextReportPageButton = document.getElementById('next-report-page-button');
    const reportPageLeft = document.getElementById('report-page-left');
    const reportPageRight = document.getElementById('report-page-right');
    const endOfDayReportModal = document.getElementById('end-of-day-report-modal');
    const endOfDayReportContent = document.getElementById('end-of-day-report-content');
    const endOfDayReportCloseButton = document.getElementById('end-of-day-report-close-button');
    let dailyReports = [];
    let currentReportPage = 0;

    // --- Intro Screen Logic ---
    startGameButton.addEventListener('click', () => {
        introScreen.style.display = 'none';
        gameContainer.classList.remove('hidden');
        // Initial UI render and game start
        updateUI();
        manageCustomers();
        runDayTimer(35);
    });

    tutorialButton.addEventListener('click', () => {
        uiClick.play();
        showModal('Tutorial coming soon! This game is about managing a small shop (Toserba). Buy stock, set prices, and sell to customers to make a profit. Good luck!');
    });

    settingsButton.addEventListener('click', () => {
        uiClick.play();
        settingsModal.style.display = 'flex';
    });

    settingsCloseButton.addEventListener('click', () => {
        uiClick.play();
        settingsModal.style.display = 'none';
    });

    masterVolumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value;
        alienAlarm.volume = volume;
        backgroundMusic.volume = volume;
        uiClick.volume = volume;
    });

    musicVolumeSlider.addEventListener('input', (e) => {
        backgroundMusic.volume = e.target.value;
    });

    sfxVolumeSlider.addEventListener('input', (e) => {
        alienAlarm.volume = e.target.value;
        uiClick.volume = e.target.value;
    });

    muteButton.addEventListener('click', () => {
        const muted = backgroundMusic.muted;
        backgroundMusic.muted = !muted;
        alienAlarm.muted = !muted;
        uiClick.muted = !muted;
        muteButton.textContent = muted ? 'Mute' : 'Unmute';
    });

    hintContainer.addEventListener('click', () => {
        hintContainer.classList.toggle('show');
    });

    // --- Event Listeners for Daily Report ---
    viewLogbookButton.addEventListener('click', () => {
        renderDailyReports();
        dailyReportModal.style.display = 'flex';
    });

    dailyReportCloseButton.addEventListener('click', () => {
        dailyReportModal.style.display = 'none';
    });

    nextReportPageButton.addEventListener('click', () => {
        if (currentReportPage < Math.ceil(dailyReports.length / 2) - 1) {
            currentReportPage++;
            renderDailyReports();
        }
    });

    prevReportPageButton.addEventListener('click', () => {
        if (currentReportPage > 0) {
            currentReportPage--;
            renderDailyReports();
        }
    });

    restockButton.addEventListener('click', handleRestock);
    setPricesButton.addEventListener('click', handleSetPrices);
    nextDayButton.addEventListener('click', startNewDay);

    endOfDayReportCloseButton.addEventListener('click', () => {
        endOfDayReportModal.style.display = 'none';
        controlPanel.style.display = 'flex'; // Show management buttons
    });

    // --- Game Functions ---

    function showEndOfDayReport(report) {
        endOfDayReportContent.innerHTML = report;
        endOfDayReportModal.style.display = 'flex';
    }

    function addDailyReport(report) {
        dailyReports.push(report);
    }

    function renderDailyReports() {
        reportPageLeft.innerHTML = '';
        reportPageRight.innerHTML = '';

        const leftIndex = currentReportPage * 2;
        const rightIndex = leftIndex + 1;

        if (dailyReports[leftIndex]) {
            reportPageLeft.innerHTML = dailyReports[leftIndex];
        }

        if (dailyReports[rightIndex]) {
            reportPageRight.innerHTML = dailyReports[rightIndex];
        }

        prevReportPageButton.disabled = currentReportPage === 0;
        nextReportPageButton.disabled = currentReportPage >= Math.ceil(dailyReports.length / 2) - 1;
    }

    let lastDailyReport = '';

    let alienChance = 1.0; // 2.5%
    let thiefChance = 1.0;  // 20%

    // Helper to create a new alien DOM element
    function createAlien(id) {
        const alien = document.createElement('div');
        alien.className = 'character alien-special visible walking';
        alien.style.left = '2rem';
        alien.style.bottom = '33%';
        alien.style.top = '';
        alien.dataset.alienId = id;
        alien.dataset.hits = Math.floor(Math.random() * 3) + 1; // 1-3 hits
        alien.innerHTML = `<img src="https://placehold.co/200x250/00ff00/000000?text=Alien"><div class="hit-counter">${alien.dataset.hits}</div>`;
        return alien;
    }
    
    // Helper to create a new thief DOM element
    function createThief() {
        const thief = document.createElement('div');
        thief.className = 'character thief-special visible walking';
        thief.style.left = '2rem';
        thief.style.bottom = '33%';
        thief.style.top = '';
        thief.dataset.hits = Math.floor(Math.random() * 3) + 2; // 2-4 hits
        thief.innerHTML = `<img src="thief_run.png"><div class="hit-counter">${thief.dataset.hits}</div>`;
        return thief;
    }
    
    // Modified runDayTimer alien event logic
    function runDayTimer(duration) {
        let seconds = 0;
        const startOffset = 9 * 60;
        const endOffset = 21 * 60;
        timerDisplay.textContent = 'Time: 09:00';
        controlPanel.style.display = 'none';
    
        if (dayTimerInterval) clearInterval(dayTimerInterval);
    
        let alienEvent = null;
        let thiefEvent = null;
    
        if (Math.random() < alienChance) {
            alienEvent = { type: 'alien', time: Math.floor(Math.random() * (duration - 10)) + 5 };
        }
        if (Math.random() < thiefChance) {
            thiefEvent = { type: 'robber', time: Math.floor(Math.random() * (duration - 10)) + 5 };
        }
    
        const allCharacters = document.querySelectorAll('.character');
        allCharacters.forEach(c => c.classList.remove('visible'));
    
        const minutesPerSecond = (endOffset - startOffset) / duration;
    
        dayTimerInterval = setInterval(() => {
            seconds++;
    
            // --- Alien Event ---
            if (alienEvent && seconds === alienEvent.time) {
                alienAlarm.play();
                alienWarningOverlay.style.display = 'flex';
    
                setTimeout(() => {
                    alienWarningOverlay.style.display = 'none';
    
                    // Spawn multiple aliens at random positions (scattered)
                    const numAliens = Math.floor(Math.random() * 3) + 3; // 3-5 aliens
                    let thwartedAliens = 0;
                    let aliensToFinish = numAliens;
                    let alienEffects = 0;
    
                    for (let i = 0; i < numAliens; i++) {
                        const alien = createAlien(i);
    
                        // Random scattered position inside the shop (floor area)
                        const randomLeft = `${10 + Math.random() * 70}%`;
                        const randomBottom = `${5 + Math.random() * 20}%`;
                        alien.style.left = randomLeft;
                        alien.style.bottom = randomBottom;
                        alien.style.top = '';
    
                        document.body.appendChild(alien);
    
                        // Click to thwart
                        alien.addEventListener('click', () => {
                            let hits = parseInt(alien.dataset.hits, 10);
                            hits--;
                            alien.dataset.hits = hits;
                            alien.querySelector('.hit-counter').textContent = hits;
    
                            if (hits <= 0) {
                                alien.classList.remove('visible', 'walking');
                                alien.remove();
                                thwartedAliens++;
                                aliensToFinish--;
                                if (aliensToFinish === 0) {
                                    if (alienEffects > 0) {
                                        lastDailyReport += `<p>${alienEffects} alien(s) invaded your store!</p>`;
                                    }
                                }
                            }
                        });
    
                        // If not clicked after 2.5s, apply effect and remove
                        setTimeout(() => {
                            if (document.body.contains(alien)) {
                                alien.remove();
                                alienEffects++;
                                aliensToFinish--;
                                if (aliensToFinish === 0) {
                                    if (alienEffects > 0) {
                                        const attackResult = simulateAlienAttack(document.querySelectorAll('.character.visible').length);
                                        lastDailyReport += attackResult.report;
                                    }
                                }
                            }
                        }, 5500);
                    }
                    alienChance = 0.025;
                    updateEventChanceDisplay();
                }, 3000);
            }
    
            // --- Thief Event ---
            if (thiefEvent && seconds === thiefEvent.time) {
                const numThieves = Math.floor(Math.random() * 3) + 1; // 1-3 thieves
                for (let i = 0; i < numThieves; i++) {
                    const thief = createThief();
                    // Always start at the door
                    thief.style.left = '2rem';
                    thief.style.bottom = '33%';
                    thief.style.top = '';
                    document.body.appendChild(thief);
    
                    let thiefPrevented = false;
    
                    // Click to prevent theft
                    thief.addEventListener('click', () => {
                        let hits = parseInt(thief.dataset.hits, 10);
                        hits--;
                        thief.dataset.hits = hits;
                        thief.querySelector('.hit-counter').textContent = hits;
    
                        if (hits <= 0) {
                            thief.classList.remove('visible', 'walking');
                            thief.remove();
                            thiefPrevented = true;
                            lastDailyReport += `<p>🦹‍♂️ You caught a thief before they could steal!</p>`;
                        }
                    });
    
                    // Animate thief inside (slower than customers)
                    setTimeout(() => {
                        thief.style.bottom = '15%';
                        thief.style.left = '60%';
                        thief.classList.remove('walking');
                        // If not clicked after 3s, perform theft and remove
                        setTimeout(() => {
                            if (document.body.contains(thief) && !thiefPrevented) {
                                thief.remove();
                                // Thief steals items
                                const stolenItemIndex = Math.floor(Math.random() * game.items.length);
                                const stolenItem = game.items[stolenItemIndex];
                                if (stolenItem.stock > 0) {
                                    const stolenAmount = Math.min(stolenItem.stock, Math.floor(Math.random() * 3) + 1);
                                    stolenItem.stock -= stolenAmount;
                                    const robberReport = `<p>🚨 A thief broke in and stole ${stolenAmount} ${stolenItem.name}!</p>`;
                                    lastDailyReport += robberReport;
                                    showModal(robberReport, true);
                                }
                            }
                        }, 3000); // slower than customers
                    }, 1200);
                }
    
                thiefChance = 0.20;
                updateEventChanceDisplay();
            }
    
            // --- End of Day ---
            if (seconds >= duration) {
                clearInterval(dayTimerInterval);
                timerDisplay.textContent = 'Time: 21:00';
    
                // Animate all visible customers to leave before ending the day
                const visibleCustomers = document.querySelectorAll('.character.visible:not(.alien-special):not(.thief-special)');
                visibleCustomers.forEach(char => {
                    char.style.top = '';
                    char.style.left = '2rem';
                    char.style.bottom = '33%';
                    char.classList.add('walking');
                });
    
                setTimeout(() => {
                    visibleCustomers.forEach(char => {
                        char.classList.remove('visible', 'walking');
                        char.style.top = '';
                        char.style.left = '';
                        char.style.bottom = '';
                    });
                    simulateDay();
                }, 1200);
    
                return;
            }
    
            // --- Update Time Display ---
            const totalMinutes = startOffset + seconds * minutesPerSecond;
            const hrs = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
            const minsTens = Math.floor((totalMinutes % 60) / 10) * 10;
            const mins = minsTens.toString().padStart(2, '0');
            timerDisplay.textContent = `Time: ${hrs}:${mins}`;
    
            // --- Manage Customers ---
            if (seconds % 3 === 0) {
                manageCustomers();
            }
        }, 1000);
    }


    function manageCustomers() {
    const characters = document.querySelectorAll('.character:not(#alien):not(#thief)');
    const visibleCharacters = document.querySelectorAll('.character.visible:not(#alien):not(#thief)');
    const maxVisibleCustomers = 3;

    // --- Customer Leaving (modified for walk to door) ---
    if (visibleCharacters.length > 0 && Math.random() < 0.2) {
        const charToLeave = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)];

        hideThoughtBubble(charToLeave); // Hide bubble on leave

        // Animate to door position
        charToLeave.style.top = '';
        charToLeave.style.bottom = '';
        charToLeave.style.left = '2rem';
        charToLeave.style.bottom = '33%';
        charToLeave.classList.add('walking');
        // After animation, fade out
        setTimeout(() => {
            charToLeave.classList.remove('visible', 'walking', 'bargain-hunter', 'average-joe', 'big-spender');
            charToLeave.style.top = '';
            charToLeave.style.left = '';
            charToLeave.style.bottom = '';
        }, 1200); 
    }

    // --- Customer Appearing from the Door ---
    if (visibleCharacters.length < maxVisibleCustomers && Math.random() < 1.0) {
        const hiddenCharacters = Array.from(characters).filter(c => !c.classList.contains('visible'));
        if (hiddenCharacters.length > 0) {
            const charToAppear = hiddenCharacters[Math.floor(Math.random() * hiddenCharacters.length)];
            const personalityKey = Object.keys(customerPersonalities)[Math.floor(Math.random() * Object.keys(customerPersonalities).length)];
            const personality = customerPersonalities[personalityKey];

            // --- Thought Bubble Logic ---
            const desiredItem = game.items[Math.floor(Math.random() * game.items.length)];
            showThoughtBubble(charToAppear, desiredItem.name);
            
            charToAppear.classList.remove('bargain-hunter', 'average-joe', 'big-spender');
            charToAppear.classList.add(personalityKey.toLowerCase().replace('_', '-'));

            // Always reset position before showing
            charToAppear.style.top = '';
            charToAppear.style.bottom = '';
            charToAppear.style.left = '2rem';
            charToAppear.style.bottom = '33%';
            charToAppear.classList.add('visible', 'walking');

            setTimeout(() => {
                charToAppear.style.top = '';
                const targetBottoms = ['5%', '10%', '15%', '20%'];
                const targetLefts = ['10%', '35%', '75%', '50%'];
                const idx = Math.floor(Math.random() * targetBottoms.length);
                charToAppear.style.bottom = targetBottoms[idx];
                charToAppear.style.left = targetLefts[idx];
                charToAppear.classList.remove('walking');
            }, 900);
        }
    }

    // --- Customer Browsing (Walking Left/Right) ---
    document.querySelectorAll('.character.visible:not(#alien):not(#thief)').forEach(char => {
        if (Math.random() < 0.1) { // 10% chance to move
            const img = char.querySelector('img');
            const currentLeft = parseFloat(char.style.left) || 0;
            const newLeft = Math.random() * 70 + 10; // move inside area (10% to 80%)

            // Flip image based on direction
            if (newLeft > currentLeft) {
                img.classList.remove('flip'); // Moving right
            } else {
                img.classList.add('flip'); // Moving left
            }

            char.style.left = `${newLeft}%`;
        }
    });
}


    function simulateAlienAttack(currentCustomers) {
        let report = `<p>🛸 <strong>ALIEN INVASION!</strong> A group of aggressive aliens has descended upon your store!</p>`;
        const numAliens = Math.floor(Math.random() * 3) + 5; // 5 to 7 aliens

        // 1. Aliens steal items (immediate effect)
        const itemsToSteal = Math.min(game.items.length, numAliens);
        let totalStolenValue = 0;
        for (let i = 0; i < itemsToSteal; i++) {
            const itemIndex = Math.floor(Math.random() * game.items.length);
            const item = game.items[itemIndex];
            if (item.stock > 0) {
                const stolenAmount = Math.min(item.stock, Math.floor(Math.random() * 5) + 1);
                item.stock -= stolenAmount; // Direct modification
                totalStolenValue += stolenAmount * item.buyPrice;
                report += `<p>• The aliens ransacked the shelves, stealing ${stolenAmount} ${item.name}!</p>`;
            }
        }

        // 2. Aliens scare away customers (immediate effect)
        const customersScared = Math.min(currentCustomers, Math.floor(Math.random() * numAliens));
        if (customersScared > 0) {
            report += `<p>• In the chaos, ${customersScared} customers fled in terror!</p>`;
            // This is now just for the report, as customer count is dynamic
        }

        // 3. Aliens steal money (immediate effect)
        const moneyStolen = Math.floor(game.money * (Math.random() * 0.2 + 0.1)); // Steal 10-30% of money
        game.money -= moneyStolen; // Direct modification
        report += `<p>• They hacked your register and stole ${moneyStolen} from your profits!</p>`;

        // The function now directly modifies the game state.
        // The report is returned to be added to the daily log.
        return { report };
    }

    function triggerAlienWarning() {
    alienAlarm.play();
    alienWarningOverlay.style.display = 'flex';
    // Show alien character after alert
    setTimeout(() => {
        alienWarningOverlay.style.display = 'none';
        // Show alien character at the door
        alienCharacter.style.left = '2rem';
        alienCharacter.style.bottom = '33%';
        alienCharacter.style.top = '';
        alienCharacter.classList.add('visible', 'walking');
        // Move alien inside after short delay
        setTimeout(() => {
            alienCharacter.style.bottom = '15%';
            alienCharacter.style.left = '40%';
            alienCharacter.classList.remove('walking');
            // Hide alien after a few seconds
            setTimeout(() => {
                alienCharacter.classList.remove('visible');
                alienCharacter.style.left = '';
                alienCharacter.style.bottom = '';
                alienCharacter.style.top = '';
            }, 3000); // was 2000, now 3000ms
        }, 400);
    }, 3000); // Display warning for 3 seconds
}

    function showModal(message, isHTML = false, isDailyReport = false) {
        modalText.innerHTML = ''; // Clear previous content
        if (isHTML) {
            modalText.innerHTML = message;
        } else {
            modalText.textContent = message;
        }

        if (isDailyReport) {
            gameModal.classList.add('daily-report');
            modalCloseButton.style.display = 'none';
        } else {
            gameModal.classList.remove('daily-report');
            modalCloseButton.style.display = 'block';
        }
        gameModal.style.display = 'flex';
    }

    modalCloseButton.addEventListener('click', () => {
        gameModal.style.display = 'none';
        updateUI();
    });

    function updateEventChanceDisplay() {
    const alienChanceElem = document.getElementById('alien-chance-value');
    const thiefChanceElem = document.getElementById('thief-chance-value');
    if (alienChanceElem && thiefChanceElem) {
        alienChanceElem.textContent = `${(alienChance * 100).toFixed(1)}%`;
        thiefChanceElem.textContent = `${(thiefChance * 100).toFixed(1)}%`;
    }
}

// Update UI function: add call to updateEventChanceDisplay
function updateUI() {
    dayDisplay.textContent = "";
    const img = document.createElement("img");
    img.src = "Calendar.png";
    img.alt = "icon";
    img.style.width = "30px";
    img.style.height = "30px";
    img.style.verticalAlign = "middle";
    dayDisplay.appendChild(img);
    dayDisplay.appendChild(document.createTextNode(` Day: ${game.day}`));
    moneyDisplay.textContent = `Money: ${game.money}`;
    weatherDisplay.textContent = `${game.weather}`;
    itemStandsContainer.innerHTML = '';
    game.items.forEach(item => {
        const stand = document.createElement('div');
        stand.className = 'item-stand relative bg-[#a1887f] rounded-lg cursor-pointer';
        stand.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="item mt-2">
            <div class="quantity">${item.stock}</div>
            <div class="text-sm font-semibold text-white mt-1">${item.name}</div>
            <div class="text-xs text-white opacity-80">Sell: ${item.sellPrice}</div>
        `;
        itemStandsContainer.appendChild(stand);
        stand.addEventListener('click', () => {
            showModal(`You selected ${item.name} with a stock of ${item.stock}.`);
        });
    });
    updateEventChanceDisplay(); // <-- Add this line
}

function showThoughtBubble(character, text) {
    const bubble = character.querySelector('.thought-bubble');
    if (bubble) {
        bubble.textContent = text;
        bubble.classList.add('visible');
    }
}

function hideThoughtBubble(character) {
    const bubble = character.querySelector('.thought-bubble');
    if (bubble) {
        bubble.classList.remove('visible');
    }
}

    function simulateDay() {
        let dailyReport = `<h3>--- Day ${game.day} ---</h3>`;
        dailyReport += `<p>Weather: ${game.weather}</p>`;
        dailyReport += lastDailyReport; // Add events that happened during the day
        lastDailyReport = ''; // Reset for the next day

        let numCustomers = Math.floor(Math.random() * 6) + 3;

        let totalSales = 0;
        let totalCost = 0;

        const salesTracker = new Map();
        game.items.forEach(item => salesTracker.set(item.name, {sold: 0, customers: 0}));

        const personalityTracker = {
            BARGAIN_HUNTER: { count: 0, sales: 0, items: new Map(), expensive: new Set() },
            AVERAGE_JOE: { count: 0, sales: 0, items: new Map(), expensive: new Set() },
            BIG_SPENDER: { count: 0, sales: 0, items: new Map(), expensive: new Set() },
        };

        for (let i = 0; i < numCustomers; i++) {
            const personalityKey = Object.keys(customerPersonalities)[Math.floor(Math.random() * Object.keys(customerPersonalities).length)];
            const personality = customerPersonalities[personalityKey];
            const customerMoney = generateCustomerMoney(game.day, personality);

            personalityTracker[personalityKey].count++;

            const availableItems = game.items.filter(item => item.stock > 0);
            if (availableItems.length === 0) {
                break;
            }

            let desiredItem = null;
            if (game.weather === 'Hujan') {
                const rainyDayItems = availableItems.filter(item => ['Snack', 'Lampu', 'Batu Baterai'].includes(item.name));
                if (rainyDayItems.length > 0) {
                    desiredItem = rainyDayItems[Math.floor(Math.random() * rainyDayItems.length)];
                }
            }

            if (!desiredItem) {
                desiredItem = availableItems[Math.floor(Math.random() * availableItems.length)];
            }

            salesTracker.get(desiredItem.name).customers++;

            if (willBuy(desiredItem.sellPrice, customerMoney, personality)) {
                const quantity = Math.floor(Math.random() * Math.min(3, desiredItem.stock)) + 1;
                if (desiredItem.stock >= quantity) {
                    desiredItem.stock -= quantity;
                    const salesValue = desiredItem.sellPrice * quantity;
                    totalSales += salesValue;
                    totalCost += desiredItem.buyPrice * quantity;
                    salesTracker.get(desiredItem.name).sold++;
                    personalityTracker[personalityKey].sales += salesValue;
                    
                    const currentQty = personalityTracker[personalityKey].items.get(desiredItem.name) || 0;
                    personalityTracker[personalityKey].items.set(desiredItem.name, currentQty + quantity);
                }
            } else {
                personalityTracker[personalityKey].expensive.add(desiredItem.name);
            }
        }

        const profit = totalSales - totalCost - (game.sewa + game.listrik);
        game.money += profit;

        // --- Build The Report --- //
        dailyReport += `
            <hr class="my-2">
            <p><strong>Total Customers:</strong> ${numCustomers}</p>
            <p><strong>Total Sales:</strong> ${totalSales}</p>
            <p><strong>Net Profit:</strong> ${profit}</p>
            <p><strong>New Money:</strong> ${game.money}</p>
        `;

        dailyReport += `<h3>--- Transaction Summary ---</h3>`;
        Object.keys(personalityTracker).forEach(key => {
            const data = personalityTracker[key];
            const name = customerPersonalities[key].name;
            if (data.items.size > 0) {
                let itemsBought = Array.from(data.items.entries()).map(([item, qty]) => `${item} (x${qty})`).join(', ');
                dailyReport += `<p>• <strong>${name}s purchased:</strong> ${itemsBought}.</p>`;
            }
            if (data.expensive.size > 0) {
                let itemsSkipped = Array.from(data.expensive).join(', ');
                dailyReport += `<p>• <strong>${name}s found these items too expensive:</strong> ${itemsSkipped}.</p>`;
            }
        });

        dailyReport += `<h3>--- Customer Breakdown ---</h3>`;
        Object.keys(personalityTracker).forEach(key => {
            const data = personalityTracker[key];
            const name = customerPersonalities[key].name;
            dailyReport += `<p>• ${name}s: ${data.count} (Total Sales: ${data.sales})</p>`;
        });

        dailyReport += `<h3>--- Market Demand ---</h3>`;
        let suggestions = false;
        salesTracker.forEach((stats, itemName) => {
            if (stats.customers > 0) {
                const demandRatio = stats.sold / stats.customers;
                const item = game.items.find(i => i.name === itemName);
                let newPrice = item.sellPrice;
                if (demandRatio < 0.3) { // low demand
                    newPrice *= 0.9;
                    dailyReport += `<p>• Demand for ${itemName} was low. Consider lowering the price from ${item.sellPrice} to ${Math.round(newPrice)}.</p>`;
                    suggestions = true;
                } else if (demandRatio > 0.8) { // high demand
                    newPrice *= 1.1;
                    dailyReport += `<p>• Demand for ${itemName} was high! Consider raising the price from ${item.sellPrice} to ${Math.round(newPrice)}.</p>`;
                    suggestions = true;
                }
            }
        });
        if (!suggestions) {
            dailyReport += `<p>Market prices seem stable.</p>`;
        }


        dailyReport += `<h3>--- Daily Price Update ---</h3>`;
        let hasUpdate = false;
        game.items.forEach(item => {
            const increase = Math.floor(Math.random() * 2) + 1;
            if (Math.random() < 0.2) {
                item.buyPrice += increase;
                dailyReport += `<p>• Buy price for ${item.name} increased to ${item.buyPrice}.</p>`;
                hasUpdate = true;
            }
        });
        if (!hasUpdate) {
            dailyReport += `<p>No significant price changes today.</p>`;
        }

        addDailyReport(dailyReport);
        showEndOfDayReport(dailyReport);
        // showModal(`Day ${game.day} has ended. You can now manage your store or start the next day.`, false);
        // controlPanel.style.display = 'flex';
    }

    function generateCustomerMoney(level, personality) {
        const base = 50 + level * 10; // customers get richer over time
        const variation = Math.random() * (1.3 - 0.7) + 0.7; // random factor 70–130%
        return Math.round(base * variation * personality.moneyMultiplier);
    }

    function willBuy(price, money, personality) {
        const affordability = money / price;
        // if they can afford easily (1.5x price), likely to buy
        // borderline cases have smaller chance
        if (affordability >= 1.5) {
            return true;
        } else if (affordability >= 1.0) {
            return Math.random() < (personality.impulse + 0.4); // Higher impulse = higher chance
        } else {
            return Math.random() < personality.impulse; // Impulse buy for expensive items
        }
    }

    function startNewDay() {
    game.day++;
    game.weather = Math.random() > 0.5 ? 'Cerah' : 'Hujan';
    gameModal.style.display = 'none';
    controlPanel.style.display = 'none';
    updateUI();
    manageCustomers();
    // Increase event chances by 10% each new day
    alienChance += 0.10;
    thiefChance += 0.10;
    updateEventChanceDisplay(); // <-- Add this line
    runDayTimer(35);
}

    function handleRestock() {
        let restockMessage = `<h3>--- Restock Phase ---</h3><p>Current Money: ${game.money}</p><p>Select an item to restock. Prices:</p>`;
        game.items.forEach(item => {
            restockMessage += `
                <div class="flex justify-between items-center my-2 p-2 rounded-lg bg-gray-100">
                    <span>${item.name} (Stock: ${item.stock}, Buy: ${item.buyPrice})</span>
                    <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-full"
                        onclick="restockItem('${item.name}')">Buy 1</button>
                </div>
            `;
        });
        showModal(restockMessage, true);
    }

    window.restockItem = (itemName) => {
        const item = game.items.find(i => i.name === itemName);
        if (item && game.money >= item.buyPrice) {
            item.stock++;
            game.money -= item.buyPrice;
            handleRestock();
        } else {
            alert(`Not enough money to buy ${item.name}.`);
        }
    }

    function handleSetPrices() {
        let pricesMessage = `<h3>--- Set Prices Phase ---</h3><p>Adjust your prices:</p>`;
        game.items.forEach(item => {
            pricesMessage += `
                <div class="flex justify-between items-center my-2 p-2 rounded-lg bg-gray-100">
                    <span>${item.name} (Buy: ${item.buyPrice}, Current Sell: ${item.sellPrice})</span>
                    <input type="number" id="price-input-${item.name}" value="${item.sellPrice}"
                        class="w-20 text-right border rounded-lg px-2">
                </div>
            `;
        });
        pricesMessage += `
            <div class="mt-4 text-center">
                <button id="save-prices-btn" class="control-button bg-green-500 hover:bg-green-600">Save Prices</button>
            </div>`;
        showModal(pricesMessage, true);

        document.getElementById('save-prices-btn').addEventListener('click', () => {
            game.items.forEach(item => {
                const inputElement = document.getElementById(`price-input-${item.name}`);
                if (inputElement) {
                    const newPrice = parseInt(inputElement.value);
                    if (!isNaN(newPrice) && newPrice >= 0) {
                        item.sellPrice = newPrice;
                    }
                }
            });
            alert("Prices have been updated!");
            handleSetPrices();
        });
    }
});