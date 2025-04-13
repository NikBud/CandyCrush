import Grille from "./grille.js"

// 1 On définit une sorte de "programme principal"
// le point d'entrée du code qui sera appelée dès que la
// page ET SES RESSOURCES sont chargées

window.onload = init;

let grille;

function init() {
  console.log("Page et ressources prêtes à l'emploi");
  // appelée quand la page et ses ressources sont prêtes.
  // On dit aussi que le DOM est ready (en fait un peu plus...)
  
  showTopScores();
  startGameListener()
}

function startGameListener() {
  document.getElementById("main").style.display = "none";
  let startBtn = document.querySelector("#helloPage button");
  startBtn.addEventListener("click", () => {
    document.getElementById("helloPage").style.display = "none";
    document.getElementById("main").style.display = "block";
    startGame();
  })
}

function startGame() {
  startTimer();
  grille = new Grille(9, 9);
  grille.saveScoreOnEachReload();
  grille.showCookies();
  grille.detecterMatchDansGrilleBeginning();
}

function startTimer() {
  let seconds = 0;
  let minutes = 0;
  let timerInterval;
  timerInterval = setInterval(() => {
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }
    
    let formattedTime = 
        (minutes < 10 ? "0" : "") + minutes + ":" + 
        (seconds < 10 ? "0" : "") + seconds;

    document.getElementById("time").textContent = `Time: ${formattedTime}`;
  }, 1000);
}

function showTopScores() {
  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  let scoreList = document.getElementById("scoreList");

  if (scores.length === 0) {
      scoreList.innerHTML = "<li>Pas encore de scores !</li>";
      return;
  }

  let medals = ["🥇", "🥈", "🥉", "🎖", "🏅"];
  let html = "";
  
  scores.forEach((entry, index) => {
      let medal = medals[index] || "🎖";
      html += `<li>${medal} ${entry.score} points <br> ⏳ ${entry.date}</li>`;
  });

  scoreList.innerHTML = html;
}
