const MAX_MISTAKES = 10;
const GAME_TIME = 100;
const categoriesData = {
    inwards: {
        color: "#5b8c85",
        imgSrc: "../images/חחנון.gif",
        sentences: [
            "הדרך הנכונה לחנך בני אדם היא להוות להם דוגמא",
            "אינך יכול לשלוט באורך חייך אך באפשרותך לשלוט בעומקם",
            "ביקוש האמת הוא לבדו האמת"
        ]
    },
    goal: {
        color: "#e67e22",
        imgSrc: "../images/ככוכב.gif",
        sentences: [
            "אין קיצורי דרך למקומות שמשתלם להגיע אליהם",
            "אומץ לדעת שאולי לא תצליח ובכל זאת לנסות",
            "אחד הדברים החשובים בחיים ללמוד לומר לא",
            "פרטיות היא כח. את הלא ידוע אי אפשר להרוס",
            "אנשים גבוהים צומחים לעומק",
            "היום זה המחר שממנו דאגת אתמול"
        ]
    },
    sharp: {
        color: "#4a5568",
        imgSrc: "../images/קקורץ.gif",
        sentences: [
            "שתיקה היא אחת מהטענות שהכי קשה לסתור",
            "לא טוב לך במקום שאתה נמצא בו זוז למקום אחר אתה לא עץ",
            "כל אדם מת אבל לא כל אדם באמת חי",
            "החיים הם מה שקורה לך בזמן שאתה מתכנן תוכניות",
            "אל תהיה כה צנוע, אינך כה גדול",
            "לכל אדם יש ניצוץ גאונות אבל רק למעטים יש פתיל הצתה"
        ]
    },
    smile: {
        color: "#d4ac0d",
        imgSrc: "../images/צצוחק.gif",
        sentences: [
            "הרגע הזה שמישהו זר מדבר בטלפון ואתה מתחיל לתת לו עצות בלב",
            "אני כל כך חכם שלפעמים אני לא מבין מילה ממה שאני אומר",
            "יום שני זה מה שקורה כשלא עוצרים את יום ראשון בזמן",
            "מקש רווח לאנשים שנצמדים אליך באוטובוס",
            "אנשים שאומרים בוקר במקום בוקר טוב. מה אתם עושים עם כל הזמן שחסכתם?"   
        ]
    }
};

let score = 0;
let mistakes = 0;
let collectedCount = 0;
let timeLeft = GAME_TIME;
let gameInterval;
let spawnInterval;
let timerInterval;
let activeObjects = [];
let currentCategory = '';
let currentTargetSentence = "";
let targetWordsArray = [];
let collectedWordsSet = new Set();
let distractorWordsArray = [];

const gameArea = document.getElementById('game-area');

// יצירת מערכת השמע של הדפדפן
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'correct') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    } else if (type === 'wrong') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.35);
    } else if (type === 'win') {
        // צליל ניצחון - 3 תווים קופצים ושמחים במקום עלייה רציפה
        oscillator.type = 'sine'; // צליל רך ונעים יותר
        
        oscillator.frequency.setValueAtTime(523.25, now); // תו ראשון
        oscillator.frequency.setValueAtTime(659.25, now + 0.15); // תו שני קופץ
        oscillator.frequency.setValueAtTime(783.99, now + 0.3); // תו שלישי שממשיך להדהד
        
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.3); 
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2); // דעיכה נעימה
        
        oscillator.start(now);
        oscillator.stop(now + 1.25);
    } else if (type === 'gameover') {
        // הפסד - ירידה קצרה וברורה יותר (כמו צליל "אווו" של פסילה)
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 1);
        oscillator.start(now);
        oscillator.stop(now + 1.1);
    }
}

function getUserStats() {
    const currentUser = localStorage.getItem("currentUser") || "אורח";
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.username === currentUser);
    return user ? { wins: user.wins || 0, losses: user.losses || 0, username: currentUser } : { wins: 0, losses: 0, username: currentUser };
}

function recordGameResult(isWin) {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.username === currentUser);
    if (user) {
        if (isWin) {
            user.wins = (user.wins || 0) + 1;
        } else {
            user.losses = (user.losses || 0) + 1;
        }
        localStorage.setItem("users", JSON.stringify(users));
    }
}

function showScreen(screenId) {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showMenu() {
    showScreen('menu-screen');
}

function playAgain() {
    showScreen('menu-screen');
}

function goToLobby() {
    window.location.href = 'lobby.html';
}

function startGame(category) {
    // שחרור חסימת האודיו בעקבות לחיצת המשתמש
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    currentCategory = category;
    score = 0;
    mistakes = 0;
    collectedCount = 0;
    timeLeft = GAME_TIME;
    activeObjects = [];
    collectedWordsSet.clear();
    
    gameArea.innerHTML = '<div id="basket">מגנט השראה</div>'; 
    setupPools();
    
    let uniqueTargetWords = new Set(targetWordsArray).size;
    document.getElementById('score-display').innerText = score;
    document.getElementById('progress-display').innerText = `${collectedCount}/${uniqueTargetWords}`;
    document.getElementById('mistakes-display').innerText = mistakes + "/" + MAX_MISTAKES;

    let catColor = categoriesData[category].color;
    document.getElementById('secret-mission').style.borderColor = catColor;
    document.getElementById('secret-mission').style.color = catColor;
    document.getElementById('basket').style.borderTopColor = catColor;
    document.getElementById('timer-bar').style.backgroundColor = catColor;

    showScreen('game-screen');
    
    gameArea.removeEventListener('mousemove', handleMove);
    gameArea.removeEventListener('touchmove', handleMove);
    gameArea.addEventListener('mousemove', handleMove);
    gameArea.addEventListener('touchmove', handleMove, {passive: false});

    gameInterval = setInterval(updateGame, 1000 / 60); 
    spawnInterval = setInterval(spawnObject, 250); 
    timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    timeLeft -= 0.1;
    let percent = (timeLeft / GAME_TIME) * 100;
    if (percent < 0) percent = 0;
    document.getElementById('timer-bar').style.width = percent + '%';

    if (timeLeft <= 0) {
        endGame(false);
    }
}

function setupPools() {
    let sentences = categoriesData[currentCategory].sentences;
    currentTargetSentence = sentences[Math.floor(Math.random() * sentences.length)];
    targetWordsArray = currentTargetSentence.split(" ").filter(w => w.trim() !== "");
    
    let uniqueWordsMap = new Map();
    for (let cat in categoriesData) {
        categoriesData[cat].sentences.forEach(sentence => {
            let words = sentence.split(" ").filter(w => w.trim() !== "");
            words.forEach(w => {
                if (w.length > 1 && !uniqueWordsMap.has(w)) {
                    uniqueWordsMap.set(w, categoriesData[cat].color);
                }
            });
        });
    }
    
    distractorWordsArray = Array.from(uniqueWordsMap, ([text, color]) => ({text, color}));

    const slotsContainer = document.getElementById('sentence-slots');
    slotsContainer.innerHTML = '';
    targetWordsArray.forEach((word, index) => {
        let slot = document.createElement('div');
        slot.classList.add('word-slot');
        slot.id = 'slot-' + index;
        slotsContainer.appendChild(slot);
    });
}

function handleMove(e) {
    e.preventDefault();
    let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    let areaRect = gameArea.getBoundingClientRect();
    let xPos = clientX - areaRect.left;
    
    const basket = document.getElementById('basket');
    if (!basket) return;
    
    let basketHalfWidth = basket.offsetWidth / 2;
    if (xPos < basketHalfWidth) xPos = basketHalfWidth;
    if (xPos > areaRect.width - basketHalfWidth) xPos = areaRect.width - basketHalfWidth;
    
    basket.style.left = xPos + 'px';
}

function spawnObject() {
    let isEmoji = Math.random() < 0.15;
    let el = document.createElement('div');
    el.classList.add('falling-object');
    
    let isTarget = false;
    let textValue = '';

    if (isEmoji) {
        el.classList.add('falling-emoji');
        let img = document.createElement('img');
        if (Math.random() < 0.4) {
            isTarget = true;
            img.src = categoriesData[currentCategory].imgSrc;
            el.style.borderColor = categoriesData[currentCategory].color;
        } else {
            let otherCats = Object.keys(categoriesData).filter(c => c !== currentCategory);
            let randomCat = otherCats[Math.floor(Math.random() * otherCats.length)];
            img.src = categoriesData[randomCat].imgSrc;
            el.style.borderColor = categoriesData[randomCat].color;
        }
        el.appendChild(img);
    } else {
        el.classList.add('falling-word');
        let uncollected = targetWordsArray.filter(w => !collectedWordsSet.has(w));
        let chosenWordObj;
        
        if (uncollected.length > 0 && Math.random() < 0.4) {
            let targetText = uncollected[Math.floor(Math.random() * uncollected.length)];
            chosenWordObj = { text: targetText, color: categoriesData[currentCategory].color };
        } else {
            chosenWordObj = distractorWordsArray[Math.floor(Math.random() * distractorWordsArray.length)];
        }
        
        textValue = chosenWordObj.text;
        isTarget = targetWordsArray.includes(textValue);
        
        el.innerText = textValue;
        el.style.color = chosenWordObj.color; 
    }

    gameArea.appendChild(el);
    let randomX = Math.random() * (gameArea.offsetWidth - 80) + 40;
    
    activeObjects.push({
        el: el,
        x: randomX,
        y: -60,
        speed: 2.5 + Math.random() * 2.5, 
        isTarget: isTarget,
        text: textValue,
        isEmoji: isEmoji
    });

    el.style.left = randomX + 'px';
    el.style.top = '-60px';
}

function updateGame() {
    let basket = document.getElementById('basket');
    if (!basket) return;
    
    let basketRect = basket.getBoundingClientRect();
    let areaRect = gameArea.getBoundingClientRect();
    let uniqueTargetWords = new Set(targetWordsArray).size;

    for (let i = activeObjects.length - 1; i >= 0; i--) {
        let obj = activeObjects[i];
        obj.y += obj.speed;
        obj.el.style.top = obj.y + 'px';

        let objRect = obj.el.getBoundingClientRect();

        if (objRect.bottom >= basketRect.top + 5 && 
            objRect.top <= basketRect.bottom &&
            objRect.right >= basketRect.left && 
            objRect.left <= basketRect.right) {
            
            let isAlreadyCollected = !obj.isEmoji && obj.text && targetWordsArray.includes(obj.text) && collectedWordsSet.has(obj.text);

            if (obj.isTarget) {
                if (!isAlreadyCollected) {
                    playTone('correct');
                    score += obj.isEmoji ? 15 : 10; 
                    flashBasket('basket-correct');
                    
                    if (!obj.isEmoji && obj.text) {
                        collectedWordsSet.add(obj.text);
                        collectedCount = collectedWordsSet.size;
                        document.getElementById('progress-display').innerText = `${collectedCount}/${uniqueTargetWords}`;
                        
                        targetWordsArray.forEach((w, idx) => {
                            if (w === obj.text) {
                                let slot = document.getElementById('slot-' + idx);
                                if (slot) {
                                    slot.innerText = w;
                                    slot.style.color = categoriesData[currentCategory].color;
                                    slot.style.borderBottomColor = categoriesData[currentCategory].color;
                                }
                            }
                        });
                        
                        if (collectedCount >= uniqueTargetWords) {
                            endGame(true);
                            return;
                        }
                    }
                }
            } else {
                playTone('wrong');
                mistakes++;
                flashBasket('basket-wrong');
                document.getElementById('mistakes-display').innerText = mistakes + "/" + MAX_MISTAKES;
                
                if (mistakes >= MAX_MISTAKES) {
                    endGame(false); 
                    return;
                }
            }
            
            document.getElementById('score-display').innerText = score;
            obj.el.remove();
            activeObjects.splice(i, 1);
        } 
        else if (objRect.top > areaRect.bottom) {
            obj.el.remove();
            activeObjects.splice(i, 1);
        }
    }
}

function flashBasket(className) {
    let basket = document.getElementById('basket');
    if(basket) {
        basket.classList.add(className);
        setTimeout(() => { basket.classList.remove(className); }, 200);
    }
}

function endGame(isWin) {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    
    recordGameResult(isWin);
    let stats = getUserStats();
    
    let endTitle = document.getElementById('end-title');
    let endMessage = document.getElementById('end-message');
    
    if (isWin) {
        playTone('win');
        endTitle.innerText = "כל הכבוד, ניצחת!";
        endTitle.style.color = "var(--success)";
        endMessage.innerText = `תפסת את כל מילות המשפט הסודי:\n"${currentTargetSentence}"`;
    } else {
        playTone('gameover');
        endTitle.innerText = "המשחק הסתיים!";
        endTitle.style.color = "var(--danger)";
        
        let reasonText = "";
        if (mistakes >= MAX_MISTAKES) {
            reasonText = `צברת ${MAX_MISTAKES} פסילות!`;
        } else if (timeLeft <= 0) {
            reasonText = "הזמן אזל!";
        } else {
            reasonText = "נפסלת.";
        }

        endMessage.innerText = `${reasonText}\n\nהמשפט שהיה עליך לאסוף הוא:\n"${currentTargetSentence}"`;
    }
    
    document.getElementById('final-score').innerText = `ניקוד סופי: ${score}`;
    document.getElementById('user-stats-display').innerText = `משתמש: ${stats.username} | נצחונות: ${stats.wins} | כשלונות: ${stats.losses}`;
    
    showScreen('end-screen');
}