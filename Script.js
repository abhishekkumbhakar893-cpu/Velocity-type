const masterList = ["Velocity", "Cybernetic", "Quantum", "Nexus", "Algorithm", "Database", "Terminal", "Processor", "Encryption", "Firewall", "Protocol", "Bandwidth", "Interface", "Function", "Variable", "Compile", "Network", "Synergy", "Framework", "Infinite", "Galaxy", "Nebula", "Horizon", "Phantom", "Shadow", "Vector", "Matrix", "System", "Signal", "Binary"];

let wordPool = [];
let currentUser = null, generatedOTP = null;
let score = 0, time = 30, totalChars = 0, totalTyped = 0;
let gameInterval;

// --- AUDIO ENGINE ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(f, t, d) {
    if (!document.getElementById('sound-toggle').checked) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = t; osc.frequency.setValueAtTime(f, audioCtx.currentTime);
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + d);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + d);
}

// --- NAVIGATION ---
function navTo(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function togglePass(id) { const el = document.getElementById(id); el.type = el.type === "password" ? "text" : "password"; }

// --- AUTH & OTP ---
function showTerms() { if(!document.getElementById('reg-id').value) return alert("Enter ID"); document.getElementById('terms-modal').style.display='block'; }
function acceptTerms() {
    document.getElementById('terms-modal').style.display='none';
    generatedOTP = Math.floor(1000 + Math.random() * 9000);
    navTo('otp-screen');
    setTimeout(() => alert(`[SMS SIMULATOR] Your OTP is: ${generatedOTP}`), 800);
}
function verifyOTP() {
    if(document.getElementById('otp-input').value == generatedOTP) {
        const id = document.getElementById('reg-id').value;
        const name = document.getElementById('reg-name').value;
        const age = document.getElementById('reg-age').value;
        const pass = document.getElementById('reg-pass').value;
        localStorage.setItem(`user_${id}`, JSON.stringify({id, name, age, pass}));
        playSound(800, 'sine', 0.2);
        navTo('login-screen');
    } else { alert("Wrong OTP"); }
}

function handleLogin() {
    const id = document.getElementById('login-id').value;
    const pass = document.getElementById('login-pass').value;
    const user = JSON.parse(localStorage.getItem(`user_${id}`));
    if(user && user.pass === pass) {
        currentUser = user;
        document.getElementById('user-display').innerText = user.name.toUpperCase();
        navTo('menu-screen');
    } else { alert("Invalid Credentials"); }
}

// --- GAME LOGIC ---
function startGame() {
    score = 0; time = 30; totalChars = 0; totalTyped = 0;
    wordPool = [...masterList].sort(() => Math.random() - 0.5);
    navTo('game-screen');
    nextWord();
    document.getElementById('user-input').value = '';
    document.getElementById('user-input').focus();
    gameInterval = setInterval(updateTimer, 1000);
}

function nextWord() {
    if(wordPool.length === 0) wordPool = [...masterList].sort(() => Math.random() - 0.5);
    document.getElementById('word-display').innerText = wordPool.pop();
}

function updateTimer() {
    time--;
    document.getElementById('timer').innerText = time;
    let elapsed = (30 - time) / 60;
    document.getElementById('live-wpm').innerText = elapsed > 0 ? Math.round((totalChars / 5) / elapsed) : 0;
    if(time <= 0) endGame();
}

document.getElementById('user-input').addEventListener('input', (e) => {
    totalTyped++;
    const word = document.getElementById('word-display').innerText;
    if(e.target.value.toLowerCase() === word.toLowerCase()) {
        score++; totalChars += word.length;
        playSound(600, 'sine', 0.1);
        e.target.value = ''; nextWord();
    }
    document.getElementById('live-acc').innerText = Math.round((totalChars / totalTyped) * 100) || 100;
});

function endGame() {
    clearInterval(gameInterval);
    const wpm = Math.round((totalChars / 5) / 0.5);
    saveToLeaderboard(wpm, score);
    navTo('menu-screen');
    openLeaderboard();
}

// --- LEADERBOARD ---
function saveToLeaderboard(wpm, score) {
    let leaders = JSON.parse(localStorage.getItem('leaders')) || [];
    leaders.push({name: currentUser.name, wpm, score});
    leaders.sort((a,b) => b.wpm - a.wpm);
    localStorage.setItem('leaders', JSON.stringify(leaders.slice(0,8)));
}
function openLeaderboard() {
    const leaders = JSON.parse(localStorage.getItem('leaders')) || [];
    document.getElementById('leaderboard-body-full').innerHTML = leaders.map((u, i) => `
        <tr><td>#${i+1}</td><td>${u.name.toUpperCase()}</td><td>${u.wpm}</td><td>${u.score}</td></tr>
    `).join('');
    document.getElementById('leaderboard-modal').style.display = 'block';
}
function closeLeaderboard() { document.getElementById('leaderboard-modal').style.display = 'none'; }
function openForgotModal() { document.getElementById('forgot-modal').style.display = 'block'; }
function closeForgotModal() { document.getElementById('forgot-modal').style.display = 'none'; }
function recoverPass() {
    const id = document.getElementById('forgot-id').value;
    const u = JSON.parse(localStorage.getItem(`user_${id}`));
    document.getElementById('forgot-res').innerText = u ? `Password: ${u.pass}` : "Not Found";
}
