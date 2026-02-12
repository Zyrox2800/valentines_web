// ==================== DEBUG MODE ====================
const DEBUG = true;

let debugPanel = null;
let debugVisible = false;

function createDebugPanel() {
    if (!DEBUG) return;
    debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    document.body.appendChild(debugPanel);
    updateDebugPanel('Initialized');

    const btnContainer = document.createElement('div');
    btnContainer.style.marginTop = '10px';
    btnContainer.style.display = 'flex';
    btnContainer.style.flexWrap = 'wrap';
    btnContainer.style.gap = '5px';

    // 8 screens: Start, Quiz, Analyse, Pivot, Final, Victory, Date, Love
    const screens = ['Start', 'Quiz', 'Analyse', 'Pivot', 'Final', 'Victory', 'Date', 'Love'];
    screens.forEach((name, idx) => {
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.onclick = () => {
            playSound('click');
            showScreen(idx);
            updateDebugPanel(`Jumped to ${name}`);
        };
        btnContainer.appendChild(btn);
    });
    debugPanel.appendChild(btnContainer);
}

function updateDebugPanel(message) {
    if (!DEBUG || !debugPanel) return;
    debugPanel.innerHTML = `
        <strong>🐞 DEBUG MODE</strong><br>
        Screen: ${currentScreen} (${getScreenName(currentScreen)})<br>
        Question: ${currentQuestion + 1}/8<br>
        Last action: ${message}<br>
        <small>Press Ctrl+Shift+D to toggle</small>
    `;
    const btnContainer = document.createElement('div');
    btnContainer.style.marginTop = '10px';
    btnContainer.style.display = 'flex';
    btnContainer.style.flexWrap = 'wrap';
    btnContainer.style.gap = '5px';

    const screens = ['Start', 'Quiz', 'Analyse', 'Pivot', 'Final', 'Victory', 'Date', 'Love'];
    screens.forEach((name, idx) => {
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.onclick = () => {
            playSound('click');
            showScreen(idx);
            updateDebugPanel(`Jumped to ${name}`);
        };
        btnContainer.appendChild(btn);
    });
    debugPanel.appendChild(btnContainer);
}

function toggleDebugPanel() {
    if (!DEBUG || !debugPanel) return;
    debugVisible = !debugVisible;
    debugPanel.style.display = debugVisible ? 'block' : 'none';
}

function getScreenName(index) {
    const names = ['Start', 'Quiz', 'Analyse', 'Pivot', 'Final Ask', 'Victory', 'Date Planner', 'Love'];
    return names[index] || 'Unknown';
}

// ==================== DOM Elements ====================
const screens = document.querySelectorAll('.screen');
const startBtn = document.getElementById('start-btn');
const revealBtn = document.getElementById('reveal-btn');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const planDateBtn = document.getElementById('plan-date-btn');
const generateDateBtn = document.getElementById('generate-date-btn');
const proceedBtn = document.getElementById('proceed-btn');
const fullscreenWarning = document.getElementById('fullscreen-warning');
const mainContainer = document.querySelector('.container');

// ==================== Quiz State ====================
let currentScreen = 0;
let currentQuestion = 0;
let selectedOption = null;
let isAnimating = false;
let isAutoProgressing = false;
let babyPictures = [];
let dateSelections = { vibe: null, fuel: null, style: null };

// ==================== Initialize Baby Pictures ====================
for (let i = 1; i <= 8; i++) {
    babyPictures.push({
        src: `assets/baby${i}.jpeg`,
        caption: `Baby Bawin #${i}`
    });
}

// ==================== Quiz Questions (8 total) ====================
const questions = [
    {
        text: "What's my irrational fear?",
        options: ["Nothing!", "Snakes and spiders", "Heights", "Never being loved by someone I love"],
        correctIndex: 3,
        feedbackPerOption: [
            "We used to but we realised something.",
            "I like animals...",
            "Buddy. I am 6ft btw.",
            "Yes, good job...🙃"
        ]
    },
    {
        text: "What is my love language?",
        options: ["Love letters", "Being nice", "Gifts", "Physical touch"],
        correctIndex: 3,
        feedbackPerOption: [
            "No, we never got one before yk.",
            "Not a love language, its a gesture",
            "We love gifts, but not my love language.",
            "Yes. Touch me. 🫢"
        ]
    },
    {
        text: "What's my favourite word/phrase?",
        options: ["I love you", "Uhhhh...", "Interesting", "Literally"],
        correctIndex: 2,
        feedbackPerOption: [
            "No, but I don't mind you saying that 🙄",
            "We do say that but not a lot.",
            "Yeah its obvious. Interestinggg...",
            "Literally. I have never said that iml."
        ]
    },
    {
        text: "What do I like most about you?",
        options: ["Your incredible sense of style", "How smart you are", "Your emotional depth", "Your adventurous, fearless spirit"],
        correctIndex: 2,
        feedbackPerOption: [
            "We know youra fashionista, but not what we love most",
            "Seriously. 😔",
            "Yeah, your emotional depth is what drew me in.",
            "We love an adventure, but not the main event"
        ]
    },
    {
        text: "What kind of energy do I give off most?",
        options: ["Intellectual", "Crazy", "Nonchalance", "Inspiring"],
        correctIndex: 2,
        feedbackPerOption: [
            "Relatively I am not even smart. 🤔",
            "Your the only autistic one here. 🙄",
            "Yes. As you can see. 🦁",
            "Am I actually inspiring? 🥶"
        ]
    },
    {
        text: "What's the #1 way to cheer me up instantly?",
        options: ["Stories and jokes", "Call me", "Hugs and kisses", "Food and snacks"],
        correctIndex: 2,
        feedbackPerOption: [
            "Ngl they do help. But not my #1",
            "DON'T CALL ME. yet.",
            "We like physical touch. Idm hugs 😝",
            "Wow fatty. We still love food tho."
        ]
    },
    {
        text: "What do I value the most in a person?",
        options: ["Honesty", "Humor", "Loyalty", "Ambition"],
        correctIndex: 2,
        feedbackPerOption: [
            "Honesty is important...I think 🙃",
            "Humor is a huge plus, but there's something deeper.",
            "Loyalty means the world to me.",
            "Ambition is great, but not first."
        ]
    },
    {
        text: "What is something small that means a lot to me?",
        options: ["Quality Time", "Compliments", "Surprises", "Remembering Details"],
        correctIndex: 0,
        feedbackPerOption: [
            "Yes. Lets hang out. 🫢",
            "We can't take them yet...",
            "No..just say the surprise pls.",
            "Like ig its nice, but even I forget 😬"
        ]
    }
];

// ==================== FULL SCREEN UTILITIES ====================
function isFullScreen() {
    return !!(document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        window.innerHeight === screen.height);
}

function requestFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

// ==================== SCREEN RESET FUNCTIONS ====================
function resetPivotScreen() {
    const pivot1 = document.getElementById('pivot-1');
    const pivot2 = document.getElementById('pivot-2');
    const pivot3 = document.getElementById('pivot-3');
    if (pivot1) {
        pivot1.style.animation = 'none';
        pivot1.style.opacity = '0';
        pivot1.style.transform = 'translateY(20px)';
    }
    if (pivot2) {
        pivot2.style.animation = 'none';
        pivot2.style.opacity = '0';
        pivot2.style.transform = 'translateY(20px)';
    }
    if (pivot3) {
        pivot3.style.animation = 'none';
        pivot3.style.opacity = '0';
        pivot3.style.transform = 'translateY(20px)';
    }
    if (revealBtn) {
        revealBtn.style.opacity = '0';
        revealBtn.style.transform = 'translateY(20px)';
    }
    if (DEBUG) console.log('Pivot screen reset');
}

function resetFinalAskScreen() {
    const noButton = document.getElementById('no-btn');
    const yesButton = document.getElementById('yes-btn');
    const dialogue = document.getElementById('final-dialogue');
    
    if (noButton) {
        noButton.style.display = 'flex';
        noButton.innerHTML = `
            <div class="no-circle">
                <span id="no-text">No</span>
            </div>
        `;
    }
    if (yesButton) {
        yesButton.style.display = 'flex';
        const yesCircle = yesButton.querySelector('.yes-circle');
        if (yesCircle) yesCircle.style.transform = 'scale(1)';
    }
    if (dialogue) {
        dialogue.textContent = "I dare you to click 'No'";
        dialogue.style.display = 'block';
    }
    if (DEBUG) console.log('Final Ask screen reset');
}

function resetVictoryScreen() {
    const confettiContainer = document.querySelector('.confetti');
    if (confettiContainer) confettiContainer.innerHTML = '';
    if (DEBUG) console.log('Victory screen reset');
}

function resetDatePlannerScreen() {
    dateSelections = { vibe: null, fuel: null, style: null };
    document.querySelectorAll('.planner-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    const resultDiv = document.getElementById('date-result');
    if (resultDiv) {
        resultDiv.classList.remove('show');
        resultDiv.innerHTML = '';
    }
    generateDateBtn.disabled = true;
    generateDateBtn.style.opacity = '0.5';
    if (DEBUG) console.log('Date Planner screen reset');
}

function resetLoveScreen() {
    const line1 = document.getElementById('love-line-1');
    const line2 = document.getElementById('love-line-2');
    const line3 = document.getElementById('love-line-3');
    const highlight = document.querySelector('.highlight-message');
    const wordI = document.getElementById('word-i');
    const wordLove = document.getElementById('word-love');
    const wordYou = document.getElementById('word-you');
    const signature = document.querySelector('.love-signature');
    const endNote = document.querySelector('.end-note');
    const finalHeart = document.querySelector('.final-heart');

    [line1, line2, line3, highlight, wordI, wordLove, wordYou, signature, endNote, finalHeart].forEach(el => {
        if (el) {
            el.style.animation = 'none';
            el.style.opacity = '0';
        }
    });
    if (finalHeart) finalHeart.style.animation = 'none';
    if (DEBUG) console.log('Love screen reset');
}

// ==================== SCREEN NAVIGATION ====================
function showScreen(index) {
    if (isAnimating) {
        if (DEBUG) console.log('showScreen blocked by animation');
        return;
    }

    if (DEBUG) console.log(`Switching to screen ${index} (${getScreenName(index)})`);
    updateDebugPanel(`Switching to ${getScreenName(index)}`);

    screens.forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });

    setTimeout(() => {
        const targetScreen = screens[index];
        targetScreen.style.display = 'flex';

        switch (index) {
            case 2: // Analyse
                break;
            case 3: // Pivot
                resetPivotScreen();
                currentQuestion = 0;
                break;
            case 4: // Final Ask
                resetFinalAskScreen();
                break;
            case 5: // Victory
                resetVictoryScreen();
                break;
            case 6: // Date Planner
                resetDatePlannerScreen();
                break;
            case 7: // Love
                resetLoveScreen();
                break;
        }

        setTimeout(() => {
            targetScreen.classList.add('active');
            currentScreen = index;

            switch (index) {
                case 0: // Start
                    break;
                case 1: // Quiz
                    currentQuestion = 0;
                    loadQuestion();
                    break;
                case 2: // Analyse
                    const analyseBtn = document.getElementById('analyse-btn');
                    if (analyseBtn) {
                        analyseBtn.onclick = () => {
                            playSound('click');
                            showScreen(3);
                        };
                    }
                    break;
                case 3: // Pivot
                    startPivotAnimation();
                    break;
                case 4: // Final Ask
                    initFinalAsk();
                    break;
                case 5: // Victory
                    createConfetti();
                    loadBabyCollage();
                    break;
                case 6: // Date Planner
                    initDatePlanner();
                    break;
                case 7: // Love
                    startLoveAnimation();
                    break;
            }
            updateDebugPanel(`Screen ${getScreenName(index)} ready`);
        }, 50);
    }, 50);
}

// ==================== QUIZ OPTIONS VISIBILITY ====================
function ensureOptionsVisible() {
    const optionsContainer = document.getElementById('options-container');
    if (optionsContainer) {
        optionsContainer.scrollTop = 0;
        if (optionsContainer.scrollHeight > optionsContainer.clientHeight) {
            optionsContainer.style.borderRight = '2px solid rgba(255, 77, 122, 0.3)';
        } else {
            optionsContainer.style.borderRight = 'none';
        }
    }
}

function handleResize() {
    ensureOptionsVisible();
    const container = document.querySelector('.container');
    const activeScreen = document.querySelector('.screen.active');
    if (container && activeScreen && activeScreen.offsetHeight > container.offsetHeight) {
        container.style.height = '95vh';
    }
}

// ==================== QUIZ FUNCTIONS ====================
function loadQuestion() {
    isAnimating = false;
    selectedOption = null;

    const question = questions[currentQuestion];
    const questionTitle = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackContainer = document.querySelector('.feedback-container');

    questionTitle.classList.remove('hidden');
    optionsContainer.classList.remove('hidden');
    if (feedbackContainer) feedbackContainer.classList.remove('hidden');

    document.getElementById('baby-overlay').style.opacity = '0';

    questionTitle.textContent = question.text;
    document.getElementById('current-q').textContent = currentQuestion + 1;

    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.querySelector('.progress-fill').style.width = `${progress}%`;

    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.addEventListener('click', () => selectOption(index, button));
        optionsContainer.appendChild(button);
    });

    const feedbackBox = document.getElementById('feedback-box');
    if (feedbackBox) {
        feedbackBox.classList.remove('show');
        feedbackBox.style.opacity = '0';
    }

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.style.pointerEvents = 'auto';
        btn.classList.remove('selected', 'correct', 'wrong');
    });

    setTimeout(ensureOptionsVisible, 100);
    if (DEBUG) console.log(`Loaded question ${currentQuestion + 1}: ${question.text}`);
    updateDebugPanel(`Loaded Q${currentQuestion + 1}`);
}

function selectOption(index, button) {
    if (isAnimating || selectedOption !== null || isAutoProgressing) return;

    isAnimating = true;
    selectedOption = index;
    const question = questions[currentQuestion];
    const isCorrect = (index === question.correctIndex);

    if (DEBUG) console.log(`Selected option ${index + 1} - ${isCorrect ? 'CORRECT' : 'WRONG'}`);
    updateDebugPanel(`Selected ${index + 1} - ${isCorrect ? '✅' : '❌'}`);

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong');
        btn.style.pointerEvents = 'none';
    });

    if (isCorrect) {
        button.classList.add('correct');
        playSound('success');
        showCorrectSequence(index);
    } else {
        button.classList.add('wrong');
        playSound('click');
        showWrongFeedback(index);
    }
}

function showCorrectSequence(selectedIndex) {
    const question = questions[currentQuestion];
    const feedbackBox = document.getElementById('feedback-box');
    const feedbackText = document.getElementById('feedback-text');

    feedbackText.textContent = question.feedbackPerOption[selectedIndex];
    feedbackBox.classList.add('show');
    feedbackBox.style.opacity = '1';

    setTimeout(() => {
        showBabyPictureAnimation(selectedIndex);
    }, 2000);
}

function showWrongFeedback(selectedIndex) {
    const question = questions[currentQuestion];
    const feedbackBox = document.getElementById('feedback-box');
    const feedbackText = document.getElementById('feedback-text');

    feedbackText.textContent = question.feedbackPerOption[selectedIndex];
    feedbackBox.classList.add('show');
    feedbackBox.style.opacity = '1';

    setTimeout(() => {
        isAnimating = false;
        selectedOption = null;
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected', 'correct', 'wrong');
            btn.style.pointerEvents = 'auto';
        });
    }, 1500);
}

// ==================== BABY PICTURE ANIMATION ====================
function showBabyPictureAnimation(selectedIndex) {
    if (currentQuestion < babyPictures.length) {
        const babyPic = document.getElementById('baby-pic');
        const babyCaption = document.getElementById('baby-fly-caption');
        const babyOverlay = document.getElementById('baby-overlay');
        const babyFlyContent = document.querySelector('.baby-fly-content');

        const img = new Image();
        img.onload = () => {
            babyPic.src = babyPictures[currentQuestion].src;
            babyCaption.textContent = questions[currentQuestion].feedbackPerOption[selectedIndex];

            document.getElementById('question-text').classList.add('hidden');
            document.getElementById('options-container').classList.add('hidden');
            const feedbackContainer = document.querySelector('.feedback-container');
            if (feedbackContainer) feedbackContainer.classList.add('hidden');

            babyOverlay.style.opacity = '1';

            setTimeout(() => {
                babyFlyContent.classList.add('fly-in');

                setTimeout(() => {
                    babyCaption.classList.add('show');
                    if (DEBUG) console.log('Baby picture caption shown - resting 3 seconds');

                    setTimeout(() => {
                        babyFlyContent.classList.remove('fly-in');
                        babyFlyContent.classList.add('fly-out');
                        babyCaption.classList.remove('show');

                        setTimeout(() => {
                            babyOverlay.style.opacity = '0';
                            babyFlyContent.classList.remove('fly-out');
                            autoProgressToNextQuestion();
                        }, 1000);
                    }, 3000);
                }, 1500);
            }, 300);
        };

        img.onerror = () => {
            babyPic.src = '';
            babyCaption.textContent = questions[currentQuestion].feedbackPerOption[selectedIndex];

            document.getElementById('question-text').classList.add('hidden');
            document.getElementById('options-container').classList.add('hidden');
            if (feedbackContainer) feedbackContainer.classList.add('hidden');

            babyOverlay.style.opacity = '1';

            setTimeout(() => {
                babyFlyContent.classList.add('fly-in');
                setTimeout(() => {
                    babyCaption.classList.add('show');
                    setTimeout(() => {
                        babyFlyContent.classList.remove('fly-in');
                        babyFlyContent.classList.add('fly-out');
                        babyCaption.classList.remove('show');
                        setTimeout(() => {
                            babyOverlay.style.opacity = '0';
                            babyFlyContent.classList.remove('fly-out');
                            autoProgressToNextQuestion();
                        }, 1000);
                    }, 3000);
                }, 1500);
            }, 300);
        };

        img.src = babyPictures[currentQuestion].src;
    } else {
        setTimeout(() => {
            autoProgressToNextQuestion();
        }, 2000);
    }
}

function autoProgressToNextQuestion() {
    if (isAutoProgressing) return;
    isAutoProgressing = true;

    if (currentQuestion === questions.length - 1) {
        // Last question answered → go to Analyse screen (index 2)
        if (DEBUG) console.log('All questions answered. Moving to Analyse screen.');
        updateDebugPanel('All questions done → Analyse');
        isAnimating = false;
        isAutoProgressing = false;
        setTimeout(() => {
            showScreen(2);
        }, 500);
    } else {
        currentQuestion++;
        setTimeout(() => {
            isAutoProgressing = false;
            loadQuestion();
        }, 500);
    }
}

// ==================== PIVOT SCREEN ====================
function startPivotAnimation() {
    resetPivotScreen();

    const pivot1 = document.getElementById('pivot-1');
    const pivot2 = document.getElementById('pivot-2');
    const pivot3 = document.getElementById('pivot-3');

    void pivot1.offsetWidth;

    setTimeout(() => {
        pivot1.style.animation = 'fadeUp 0.8s forwards';
        setTimeout(() => {
            pivot2.style.animation = 'fadeUp 0.8s forwards';
            setTimeout(() => {
                pivot3.style.animation = 'fadeUp 0.8s forwards';
                setTimeout(() => {
                    if (revealBtn) {
                        revealBtn.style.opacity = '1';
                        revealBtn.style.transform = 'translateY(0)';
                    }
                }, 1000);
            }, 1500);
        }, 1500);
    }, 500);
}

// ==================== FINAL ASK - CLEAN BUTTONS + DIALOGUE ====================
function initFinalAsk() {
    let noClickCount = 0;
    const noButtonTexts = ["No", "No", "No", "No", "No"]; // stays "No"
    const hintTexts = [
        "I dare you to click 'No'",
        "Are you sure?",
        "Really?",
        "I know you want me.",
        "Try again",
        "Last chance...",
        "Please?"
    ];

    const yesBtnEl = document.getElementById('yes-btn');
    const noBtnEl = document.getElementById('no-btn');
    const dialogue = document.getElementById('final-dialogue');
    const noTextEl = document.getElementById('no-text');

    // Reset UI
    if (noTextEl) noTextEl.textContent = "No";
    if (dialogue) {
        dialogue.textContent = hintTexts[0];
        dialogue.style.display = 'block';
    }
    const yesCircle = yesBtnEl?.querySelector('.yes-circle');
    const noCircle = noBtnEl?.querySelector('.no-circle');
    if (yesCircle) yesCircle.style.transform = 'scale(1)';
    if (noCircle) noCircle.style.transform = 'scale(1)';
    yesBtnEl.style.display = 'flex';
    noBtnEl.style.display = 'flex';
    noBtnEl.disabled = false;

    // Remove old listeners
    const newYesBtn = yesBtnEl.cloneNode(true);
    const newNoBtn = noBtnEl.cloneNode(true);
    yesBtnEl.parentNode.replaceChild(newYesBtn, yesBtnEl);
    noBtnEl.parentNode.replaceChild(newNoBtn, noBtnEl);

    const currentYesBtn = document.getElementById('yes-btn');
    const currentNoBtn = document.getElementById('no-btn');

    // Yes button: immediate victory
    currentYesBtn.onclick = () => {
        playSound('success');
        if (DEBUG) console.log('YES clicked → Victory');
        updateDebugPanel('YES clicked → Victory');
        showScreen(5);
    };

    // No button click handler
    currentNoBtn.onclick = function () {
        if (noClickCount >= 5) return;

        playSound('click');
        noClickCount++;

        if (noClickCount < 5) {
            // Update No button text (remains "No")
            const noText = currentNoBtn.querySelector('#no-text');
            if (noText) noText.textContent = noButtonTexts[noClickCount];
            
            // Update dialogue box
            if (dialogue) dialogue.textContent = hintTexts[noClickCount];

            // Enlarge Yes, shrink No
            const yesCircle = currentYesBtn.querySelector('.yes-circle');
            const noCircle = currentNoBtn.querySelector('.no-circle');
            if (yesCircle) yesCircle.style.transform = `scale(${1 + noClickCount * 0.15})`;
            if (noCircle) noCircle.style.transform = `scale(${1 - noClickCount * 0.1})`;
        }

        if (noClickCount === 5) {
            // Transform No button into Yes
            currentNoBtn.innerHTML = `
                <div class="yes-circle">
                    <span>YES</span>
                </div>
            `;
            // Hide original Yes button
            currentYesBtn.style.display = 'none';
            // Update dialogue to final message
            if (dialogue) dialogue.textContent = hintTexts[6]; // "You said YES! 💝"

            // Transformed button acts as Yes
            currentNoBtn.onclick = () => {
                playSound('success');
                if (DEBUG) console.log('Transformed YES clicked → Victory');
                updateDebugPanel('Transformed YES → Victory');
                showScreen(5);
            };
        }
    };
}

// ==================== VICTORY SCREEN ====================
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    if (!confettiContainer) return;
    confettiContainer.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤';
        heart.style.position = 'absolute';
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.top = `${Math.random() * 100}%`;
        heart.style.fontSize = `${Math.random() * 30 + 20}px`;
        heart.style.color = ['#ff4d7a', '#ff6b9d', '#ff9ec0'][Math.floor(Math.random() * 3)];
        heart.style.opacity = '0.4';
        heart.style.animation = `pulse ${Math.random() * 2 + 1}s infinite`;
        heart.style.animationDelay = `${Math.random() * 1}s`;
        confettiContainer.appendChild(heart);
    }
    if (DEBUG) console.log('Confetti created');
}

function loadBabyCollage() {
    const collage = document.getElementById('baby-collage');
    if (!collage) return;
    collage.innerHTML = '';
    babyPictures.forEach(pic => {
        const img = document.createElement('img');
        img.src = pic.src;
        img.alt = "Baby Bawin";
        img.onerror = () => {
            img.style.opacity = '0.3';
            img.style.border = '3px dashed #ffd6e7';
        };
        collage.appendChild(img);
    });
    if (DEBUG) console.log('Baby collage loaded');
}

// ==================== DATE PLANNER ====================
function initDatePlanner() {
    dateSelections = { vibe: null, fuel: null, style: null };

    document.querySelectorAll('.planner-option').forEach(option => {
        option.classList.remove('selected');
        option.onclick = function () {
            const stepContainer = this.closest('.planner-step');
            const stepOptions = stepContainer.querySelectorAll('.planner-option');
            stepOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            const heading = stepContainer.querySelector('h3').innerText;
            const value = this.getAttribute('data-value');

            if (heading.includes('Vibe')) {
                dateSelections.vibe = value;
            } else if (heading.includes('Fuel')) {
                dateSelections.fuel = value;
            } else if (heading.includes('Style')) {
                dateSelections.style = value;
            }

            if (DEBUG) console.log('Date selection:', dateSelections);
            updateDebugPanel(`Date: ${value}`);
            checkDateSelections();
        };
    });

    generateDateBtn.onclick = generateDatePlan;
    checkDateSelections();
}

function checkDateSelections() {
    const allSelected = dateSelections.vibe && dateSelections.fuel && dateSelections.style;
    generateDateBtn.disabled = !allSelected;
    generateDateBtn.style.opacity = allSelected ? '1' : '0.5';
}

function generateDatePlan() {
    const vibeMap = {
        cozy: "Cozy & Chatty: We'll find a quiet spot for deep conversations and connection.",
        active: "Active & Fun: An adventure day exploring new places or trying fun activities.",
        romantic: "Romantic & Classic: A traditional Valentine's date with all the special touches.",
        surprise: "Surprise Me: I'll plan something special based on what I know about you."
    };
    const fuelMap = {
        sweet: "Sweet Treats: We'll indulge in delicious desserts and chocolate.",
        savory: "Savory Bites: Burgers, fries, and your favourite comfort foods.",
        fancy: "Fancy Dinner: Dress up for a nice dinner at a great restaurant.",
        coffee: "Coffee & Chat: Start with coffee and see where the conversation takes us."
    };
    const styleMap = {
        you: "You Plan It: I'll handle all the details - just show up ready to have fun.",
        together: "We Plan Together: Let's collaborate on creating our perfect day.",
        go: "Go With the Flow: We'll start with one thing and follow our mood."
    };

    const planText = `
Our Perfect Valentine's Day 💘
━━━━━━━━━━━━━━━━━━━━━━
💕 The Vibe:
${vibeMap[dateSelections.vibe]}

🍽️ The Food:
${fuelMap[dateSelections.fuel]}

📅 The Style:
${styleMap[dateSelections.style]}

— Bawin and Onesha
    `.trim();

    const resultDiv = document.getElementById('date-result');
    resultDiv.innerHTML = `
        <h3>Our Perfect Valentine's Day</h3>
        <div class="plan-details">
            <div class="plan-item">
                <h4><i class="fas fa-heart"></i> The Vibe</h4>
                <p>${vibeMap[dateSelections.vibe]}</p>
            </div>
            <div class="plan-item">
                <h4><i class="fas fa-utensils"></i> The Food</h4>
                <p>${fuelMap[dateSelections.fuel]}</p>
            </div>
            <div class="plan-item">
                <h4><i class="fas fa-calendar"></i> The Style</h4>
                <p>${styleMap[dateSelections.style]}</p>
            </div>
        </div>
        <div class="copy-section">
            <button id="copy-plan-btn" class="copy-plan-btn">
                <i class="fas fa-copy"></i> Copy & Send to Bawin 💌
            </button>
            <span id="copy-confirmation" class="copy-confirmation">✓ Copied!</span>
        </div>
        <button id="final-love-btn" class="final-love-btn">
            <span>One Last Message...</span>
            <i class="fas fa-envelope"></i>
        </button>
    `;

    const copyBtn = document.getElementById('copy-plan-btn');
    const confirmation = document.getElementById('copy-confirmation');
    if (copyBtn) {
        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(planText);
                confirmation.classList.add('show');
                setTimeout(() => confirmation.classList.remove('show'), 2000);
                if (DEBUG) console.log('Date plan copied');
            } catch (err) {
                alert('Could not copy. Here is your plan:\n\n' + planText);
            }
        };
    }

    resultDiv.classList.add('show');
    playSound('success');
    if (DEBUG) console.log('Date plan generated');

    setTimeout(() => {
        const finalLoveBtn = document.getElementById('final-love-btn');
        if (finalLoveBtn) {
            finalLoveBtn.onclick = () => {
                playSound('success');
                showScreen(7);
            };
        }
    }, 300);
}

// ==================== FINAL LOVE MESSAGE ====================
function startLoveAnimation() {
    playSound('success');
    resetLoveScreen();

    const line1 = document.getElementById('love-line-1');
    const line2 = document.getElementById('love-line-2');
    const line3 = document.getElementById('love-line-3');
    const highlight = document.querySelector('.highlight-message');
    const wordI = document.getElementById('word-i');
    const wordLove = document.getElementById('word-love');
    const wordYou = document.getElementById('word-you');
    const signature = document.querySelector('.love-signature');
    const endNote = document.querySelector('.end-note');
    const finalHeart = document.querySelector('.final-heart');

    setTimeout(() => {
        if (line1) line1.style.animation = 'fadeUp 0.8s forwards';
        setTimeout(() => {
            if (line2) line2.style.animation = 'fadeUp 0.8s forwards';
            setTimeout(() => {
                if (line3) line3.style.animation = 'fadeUp 0.8s forwards';
                setTimeout(() => {
                    if (highlight) highlight.style.animation = 'fadeUp 0.8s forwards';
                    setTimeout(() => {
                        if (wordI) wordI.style.animation = 'wordReveal 1s forwards';
                        setTimeout(() => {
                            if (wordLove) wordLove.style.animation = 'wordReveal 1s forwards';
                            setTimeout(() => {
                                if (wordYou) wordYou.style.animation = 'wordReveal 1s forwards';
                                setTimeout(() => {
                                    if (signature) signature.style.animation = 'fadeIn 1s forwards';
                                    setTimeout(() => {
                                        if (endNote) endNote.style.animation = 'fadeIn 1s forwards';
                                        setTimeout(() => {
                                            if (finalHeart) finalHeart.style.animation = 'fadeIn 1s forwards, pulse 2s 0.5s infinite';
                                            if (DEBUG) console.log('Love message animation complete');
                                        }, 500);
                                    }, 500);
                                }, 1000);
                            }, 500);
                        }, 500);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 500);
}

// ==================== AUDIO ====================
function playSound(type) {
    try {
        const audio = document.getElementById(`${type}-sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.3;
            audio.play().catch(() => {});
        }
    } catch (e) {}
}

// ==================== EVENT LISTENERS ====================
function initEventListeners() {
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            playSound('click');
            fullscreenWarning.classList.remove('active');
            fullscreenWarning.style.display = 'none';
            mainContainer.style.display = 'flex';
            mainContainer.classList.add('active');
            showScreen(0);
        });
    }
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            playSound('click');
            showScreen(1);
        });
    }
    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            playSound('click');
            if (DEBUG) console.log('Reveal button clicked → Final Ask');
            updateDebugPanel('Reveal → Final Ask');
            showScreen(4);
        });
    }
    if (planDateBtn) {
        planDateBtn.addEventListener('click', () => {
            playSound('click');
            if (DEBUG) console.log('Plan Date button clicked → Date Planner');
            updateDebugPanel('Plan Date → Date Planner');
            showScreen(6);
        });
    }
}

// ==================== SCROLL PREVENTION ====================
function preventScroll(e) {
    if (e.type === 'keydown') {
        if ([32, 37, 38, 39, 40].includes(e.keyCode)) e.preventDefault();
    } else {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}

// ==================== FULLSCREEN CHANGE HANDLER ====================
function handleFullScreenChange() {
    if (isFullScreen()) {
        const proceedBtnText = document.querySelector('.proceed-btn span');
        if (proceedBtnText) {
            proceedBtnText.innerHTML = 'Perfect! Click to Begin <i class="fas fa-heart" style="margin-left: 8px;"></i>';
        }
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    fullscreenWarning.classList.add('active');
    fullscreenWarning.style.display = 'flex';
    mainContainer.style.display = 'none';

    initEventListeners();

    babyPictures.forEach(pic => {
        const img = new Image();
        img.src = pic.src;
    });

    // Set her name to ONESHA
    document.querySelectorAll('.her-name').forEach(el => {
        el.textContent = 'Onesha';
    });

    document.body.style.overflow = 'hidden';
    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('keydown', preventScroll);
    document.addEventListener('contextmenu', e => e.preventDefault());

    setTimeout(() => {
        if (isFullScreen()) {
            const proceedBtnText = document.querySelector('.proceed-btn span');
            if (proceedBtnText) {
                proceedBtnText.innerHTML = 'Perfect! Click to Begin <i class="fas fa-heart" style="margin-left: 8px;"></i>';
            }
        }
    }, 1000);

    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 500);

    createDebugPanel();

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            toggleDebugPanel();
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
        e.preventDefault();
        requestFullScreen();
        setTimeout(() => {
            if (isFullScreen()) {
                const proceedBtnText = document.querySelector('.proceed-btn span');
                if (proceedBtnText) {
                    proceedBtnText.innerHTML = 'Perfect! Click to Begin <i class="fas fa-heart" style="margin-left: 8px;"></i>';
                }
            }
        }, 500);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        requestFullScreen();
    }
});

document.addEventListener('fullscreenchange', handleFullScreenChange);
document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
document.addEventListener('mozfullscreenchange', handleFullScreenChange);
document.addEventListener('MSFullscreenChange', handleFullScreenChange);