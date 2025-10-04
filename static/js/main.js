let currentUser = null;
let currentWord = '';
let timer = 30;
let timerInterval = null;
let streak = 0;
let totalWords = 0;
let correctWords = 0;
let gameStartTime = Date.now();
let musicMuted = false;

const bgMusic = document.getElementById('bgMusic');
const muteBtn = document.getElementById('muteBtn');
const playMusicBtn = document.getElementById('playMusicBtn');
const volumeSlider = document.getElementById('volumeSlider');

muteBtn.addEventListener('click', () => {
    musicMuted = !musicMuted;
    bgMusic.muted = musicMuted;
    muteBtn.textContent = musicMuted ? '🔇 Music Off' : '🔊 Music On';
});

playMusicBtn.addEventListener('click', () => {
    bgMusic.play().catch(err => console.log('Audio play failed:', err));
});

volumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value;
});

function createBubbles() {
    const bubblesContainer = document.getElementById('bubbles');
    for (let i = 0; i < 18; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.width = `${30 + Math.random() * 60}px`;
        bubble.style.height = bubble.style.width;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        bubble.style.animationDuration = `${6 + Math.random() * 8}s`;
        bubblesContainer.appendChild(bubble);
    }
}

function createFallingLetters() {
    const lettersContainer = document.getElementById('letters');
    const letterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 24; i++) {
        const letter = document.createElement('div');
        letter.className = 'falling-letter';
        letter.textContent = letterSet[Math.floor(Math.random() * letterSet.length)];
        letter.style.left = `${Math.random() * 100}%`;
        letter.style.animationDuration = `${3 + Math.random() * 4}s`;
        letter.style.animationDelay = `${Math.random() * 4}s`;
        lettersContainer.appendChild(letter);
    }
}

createBubbles();
createFallingLetters();

document.getElementById('showSignup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('resetForm').style.display = 'none';
});

document.getElementById('showReset').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('resetForm').style.display = 'block';
});

document.getElementById('backToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('resetForm').style.display = 'none';
});

document.getElementById('backToLoginFromReset').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('resetForm').style.display = 'none';
});

function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${isError ? 'error' : 'success'}`;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 3000);
}

document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            showGameSection();
        } else {
            showMessage(data.error || 'Login failed', true);
        }
    } catch (err) {
        showMessage('Network error', true);
    }
});

document.getElementById('signupBtn').addEventListener('click', async () => {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            showGameSection();
        } else {
            showMessage(data.error || 'Signup failed', true);
        }
    } catch (err) {
        showMessage('Network error', true);
    }
});

document.getElementById('resetBtn').addEventListener('click', async () => {
    const email = document.getElementById('resetEmail').value;

    try {
        const response = await fetch('/api/auth/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('Password reset email sent!');
        } else {
            showMessage(data.error || 'Reset failed', true);
        }
    } catch (err) {
        showMessage('Network error', true);
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        showAuthSection();
    } catch (err) {
        console.error('Logout error:', err);
    }
});

function showGameSection() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
    loadNewWord();
    loadLeaderboard();
    loadUserStats();
}

function showAuthSection() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('gameSection').style.display = 'none';
    stopTimer();
}

async function loadNewWord() {
    try {
        const response = await fetch('/api/words/random');
        const data = await response.json();
        currentWord = data.word;

        document.getElementById('userInput').value = '';
        document.getElementById('status').textContent = '';
        document.getElementById('newWordBtn').disabled = true;
        document.getElementById('newWordBtn').textContent = '⏳ Submit first';

        timer = 30;
        gameStartTime = Date.now();
        updateTimer();
        startTimer();

        speakWord(currentWord);
    } catch (err) {
        console.error('Error loading word:', err);
    }
}

function speakWord(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        timer--;
        updateTimer();

        if (timer <= 0) {
            stopTimer();
            document.getElementById('status').textContent = `⏰ Time's up! The word was "${currentWord}".`;
            document.getElementById('newWordBtn').disabled = false;
            document.getElementById('newWordBtn').textContent = '🔊 New Word';
            streak = 0;
            document.getElementById('streak').textContent = streak;
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimer() {
    document.getElementById('timer').textContent = timer;
    document.getElementById('progressBar').style.width = `${(timer / 30) * 100}%`;
}

document.getElementById('newWordBtn').addEventListener('click', () => {
    loadNewWord();
});

document.getElementById('replayBtn').addEventListener('click', () => {
    speakWord(currentWord);
});

document.getElementById('submitBtn').addEventListener('click', () => {
    checkAnswer();
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('userInput').value = '';
    document.getElementById('status').textContent = '';
});

document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

async function checkAnswer() {
    stopTimer();
    const userInput = document.getElementById('userInput').value.trim();
    const isCorrect = userInput.toLowerCase() === currentWord.toLowerCase();

    totalWords++;

    if (isCorrect) {
        correctWords++;
        streak++;
        document.getElementById('status').textContent = `✅ Correct! The word was "${currentWord}".`;
        document.getElementById('streak').textContent = streak;
        playSound('correct');

        if (streak % 5 === 0) {
            showConfetti();
        }

        await saveGameSession(streak);
    } else {
        const finalScore = streak;
        streak = 0;
        document.getElementById('status').textContent = `❌ Wrong! The word was "${currentWord}".`;
        document.getElementById('streak').textContent = streak;
        playSound('incorrect');

        if (finalScore > 0) {
            await saveGameSession(finalScore);
        }
    }

    document.getElementById('newWordBtn').disabled = false;
    document.getElementById('newWordBtn').textContent = '🔊 New Word';
    loadLeaderboard();
    loadUserStats();
}

function playSound(type) {
    const audio = new Audio(`/static/${type}.mp3`);
    audio.play();
}

async function saveGameSession(score) {
    if (!currentUser) return;

    const duration = Math.floor((Date.now() - gameStartTime) / 1000);
    const accuracy = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;

    try {
        await fetch('/api/game/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                score,
                words_completed: totalWords,
                accuracy,
                duration_seconds: duration
            })
        });
    } catch (err) {
        console.error('Error saving game:', err);
    }
}

async function loadLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();

        const leaderboardDiv = document.getElementById('leaderboard');
        if (data.length === 0) {
            leaderboardDiv.innerHTML = '<p style="text-align: center;">No scores yet. Be the first to play!</p>';
            return;
        }

        let html = '';
        const medals = ['🥇', '🥈', '🥉'];

        data.forEach((entry, index) => {
            const isCurrentUser = currentUser && currentUser.id === entry.user_id;
            const medal = index < 3 ? medals[index] : '';

            html += `
                <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                    <div>
                        <span class="leaderboard-rank">${medal} #${index + 1}</span>
                        <span class="leaderboard-username">${entry.username}</span>
                        ${isCurrentUser ? '<span style="background: #00ff85; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 10px;">You</span>' : ''}
                        <div style="font-size: 0.8rem; color: #00f0ff; margin-top: 5px;">
                            ${entry.total_games} games • ${entry.average_accuracy.toFixed(1)}% accuracy
                        </div>
                    </div>
                    <div>
                        <div class="leaderboard-score">${entry.best_score}</div>
                        <div style="font-size: 0.7rem; color: #00f0ff;">best streak</div>
                    </div>
                </div>
            `;
        });

        leaderboardDiv.innerHTML = html;
    } catch (err) {
        console.error('Error loading leaderboard:', err);
    }
}

async function loadUserStats() {
    if (!currentUser) return;

    try {
        const response = await fetch(`/api/stats/${currentUser.id}`);
        const data = await response.json();

        const statsDiv = document.getElementById('userStats');
        if (response.ok) {
            statsDiv.innerHTML = `
                <div class="stat-item">
                    <strong>Best Score:</strong> ${data.best_score || 0}
                </div>
                <div class="stat-item">
                    <strong>Best Streak:</strong> ${data.best_streak || 0}
                </div>
                <div class="stat-item">
                    <strong>Total Games:</strong> ${data.total_games || 0}
                </div>
                <div class="stat-item">
                    <strong>Total Words:</strong> ${data.total_words || 0}
                </div>
                <div class="stat-item">
                    <strong>Average Accuracy:</strong> ${(data.average_accuracy || 0).toFixed(1)}%
                </div>
            `;
        } else {
            statsDiv.innerHTML = '<p>No stats available yet. Start playing!</p>';
        }
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

function showConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#00f0ff', '#00ff85', '#ffd700', '#ff00ff'];

    for (let i = 0; i < 100; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pieces.forEach((p, index) => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);

            p.x += p.vx;
            p.y += p.vy;

            if (p.y > canvas.height) {
                pieces.splice(index, 1);
            }
        });

        if (pieces.length > 0) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

setInterval(loadLeaderboard, 30000);
