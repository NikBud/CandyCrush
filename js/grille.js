import Cookie from "./cookie.js";
import { create2DArray, handleEndOfTheGame } from "./utils.js";

let nbDeCookiesDifferents = 4

export default class Grille {
  cookieSelectionnes = [];
  /**
   * Constructeur de la grille
   * @param {number} l nombre de lignes
   * @param {number} c nombre de colonnes
   */
  constructor(l, c) {
    this.c = c;
    this.l = l;

    this.tabcookies = this.remplirTableauDeCookies();
    this.currentScore = 0;
    this.progressBarCounter = 0;
    this.currentLevel = 1;
    // this.levelMultiplier = [8, 6, 4, 2];
    this.levelMultiplier = [12, 10, 10, 10];
    this.matchedCookies = [];
  }

  /**
   * parcours la liste des divs de la grille et affiche les images des cookies
   * correspondant à chaque case. Au passage, à chaque image on va ajouter des
   * écouteurs de click et de drag'n'drop pour pouvoir interagir avec elles
   * et implémenter la logique du jeu.
   */
  showCookies(ignoreScore = false) {
    let caseDivs = document.querySelectorAll("#grille div");

    caseDivs.forEach((div, index) => {
      // on calcule la ligne et la colonne de la case
      // index est le numéro de la case dans la grille
      // on sait que chaque ligne contient this.c colonnes
      // er this.l lignes
      // on peut en déduire la ligne et la colonne
      // par exemple si on a 9 cases par ligne et qu'on 
      // est à l'index 4
      // on est sur la ligne 0 (car 4/9 = 0) et 
      // la colonne 4 (car 4%9 = 4)
      let ligne = Math.floor(index / this.l);
      let colonne = index % this.c;

      // on récupère le cookie correspondant à cette case
      let cookie = this.tabcookies[ligne][colonne];
      // on récupère l'image correspondante
      let img = cookie.htmlImage;

      img.onclick = () => {
        // test : si on a cliqué sur un cookie déjà sélectionné
        // on le désélectionne et on ne fait rien.
        if(cookie.isSelectionnee()) {
          cookie.deselectionnee();
          // on la retire du tableau des cookies sélectionnés
          this.cookieSelectionnes = [];
          return;
        }

        cookie.selectionnee();        

        let nbCookiesSelectionnes = this.cookieSelectionnes.length;
        switch (nbCookiesSelectionnes) {
          case 0:
            // On mémorise la cookie courante
            this.cookieSelectionnes.push(cookie);
            break;
          case 1:
            this.cookieSelectionnes.push(cookie);
            
            Cookie.swapCookies(this.cookieSelectionnes[0], this.cookieSelectionnes[1]);  
            
            this.detecterMatchDansGrille(ignoreScore);
            
            // dans tous les cas (swap ou pas) on vide le tableau
            this.cookieSelectionnes = [];
            break;
        }
      }

      // A FAIRE : ecouteur de drag'n'drop
      this.implementDragNDrop(img, div);

      // on affiche l'image dans le div pour la faire apparaitre à l'écran.
      div.appendChild(img);
    });
  }

  async startAnumationAndEliminateCookies(ignoreScore = false) {
    await this.eliminateCookie();
    this.updateCookiesColumn(ignoreScore);
  }

  implementDragNDrop(img, div) {
    img.ondragstart = (event) => {
      this.cookieSelectionnes = [];

      let cookieImage = event.target;
      let l = cookieImage.dataset.ligne;
      let c = cookieImage.dataset.colonne;
      let t = this.tabcookies[l][c].type;

      this.cookieSelectionnes.push(this.tabcookies[l][c]);
      console.log(this.cookieSelectionnes)
      console.log(`dragstart sur cookie : t = ${t} l = ${l} c = ${c}`); 
    }

    img.ondragover = (event) => {
      event.preventDefault();
    };

    img.ondragenter = () => {
      div.classList.add("grilleDragOver")
    }

    img.ondragleave = () => {
      div.classList.remove("grilleDragOver")
    }

    img.ondrop = (event) => {
      let cookieImage = event.target;
      let l = cookieImage.dataset.ligne;
      let c = cookieImage.dataset.colonne;
      this.cookieSelectionnes.push(this.tabcookies[l][c])
      div.classList.remove("grilleDragOver");

      Cookie.swapCookies(this.cookieSelectionnes[0], this.cookieSelectionnes[1]);  
          
      this.detecterMatchDansGrille();
      
      this.cookieSelectionnes = [];
    }
  }

  remplirTableauDeCookies() {
    let tab = create2DArray(9);

    // remplir
    for (let l = 0; l < this.l; l++) {
      for (let c = 0; c < this.c; c++) {

        // on génère un nombre aléatoire entre 0 et nbDeCookiesDifferents-1
        const type = Math.floor(Math.random() * nbDeCookiesDifferents);
        tab[l][c] = new Cookie(type, l, c);
      }
    }

    return tab;
  }

  detecterMatchDansGrille(ignoreScore = false) {
    this.matchedCookies = [];

    for (let l = 0; l < this.l; l++) {
        for (let c = 0; c < this.c; c++) {
            let cookie = this.tabcookies[l][c];
            this.detecterMatch3Lignes(cookie);
            this.detecterMatch3Colonnes(cookie);
        }
    }

    if (this.matchedCookies.length > 0) {
        if (!ignoreScore) {
          let isNewLevel = this.updateScore();
          if (isNewLevel) {
            return;
          }
        }
        this.startAnumationAndEliminateCookies(ignoreScore);
    }
    else{
      Cookie.swapCookies(this.cookieSelectionnes[1], this.cookieSelectionnes[0]); 
    }
  }

  detecterMatch3Lignes(cookie) {
    let mainType = cookie.type;
    let mainLine = cookie.ligne;
    let mainColumn = cookie.colonne;

    let cookiesList = [this.tabcookies[mainLine][mainColumn]];

    // Check right
    let col = mainColumn + 1;
    while (col < this.c && this.tabcookies[mainLine][col].type === mainType) {
        cookiesList.push(this.tabcookies[mainLine][col]);
        col++;
    }

    // Check left
    col = mainColumn - 1;
    while (col >= 0 && this.tabcookies[mainLine][col].type === mainType) {
      cookiesList.push(this.tabcookies[mainLine][col]);
      col--;
    }

    // If found 3 or more one after another
    if (cookiesList.length >= 3) {
      console.log(cookiesList);
      cookiesList.forEach(newCookie => {
        if (!this.containsCookie(newCookie)) {
            this.matchedCookies.push(newCookie);
        }
      });
    }
  }

  detecterMatch3Colonnes(cookie) {
    let mainType = cookie.type;
    let mainLine = cookie.ligne;
    let mainColumn = cookie.colonne;

    let cookiesList = [this.tabcookies[mainLine][mainColumn]];

    // Check right
    let line = mainLine + 1;
    while (line < this.c && this.tabcookies[line][mainColumn].type === mainType) {
        cookiesList.push(this.tabcookies[line][mainColumn]);
        line++;
    }

    // Check left
    line = mainLine - 1;
    while (line >= 0 && this.tabcookies[line][mainColumn].type === mainType) {
      cookiesList.push(this.tabcookies[line][mainColumn]);
      line--;
    }

    // If found 3 or more one after another
    if (cookiesList.length >= 3) {
      console.log(cookiesList);
      cookiesList.forEach(newCookie => {
        if (!this.containsCookie(newCookie)) {
            this.matchedCookies.push(newCookie);
        }
      });
    }
  }

  async eliminateCookie() {
    await Promise.all(this.matchedCookies.map(cookie => {
        return new Promise(resolve => {
            let img = cookie.htmlImage;

            img.style.transition = "transform 0.4s ease-in-out, opacity 0.4s ease-in-out";
            img.style.transform = "scale(0.5)";
            img.style.opacity = "0";

            setTimeout(() => {
                let newType = Math.floor(Math.random() * nbDeCookiesDifferents);
                let newImgSrc = Cookie.urlsImagesNormales[newType];
                
                cookie.type = newType;
                img.src = newImgSrc;

                img.style.transform = "scale(1)";
                img.style.opacity = "1";
                resolve();
            }, 400);
        });
    }));
  }

  updateCookiesColumn(ignoreScore = false){
    let maxLine = 0;
    let columns = Array(this.matchedCookies.map(cookie => cookie.colonne));
    let columnsToUpdate = Array.from(new Set(columns[0]));

    this.matchedCookies.forEach(cookie => {
      cookie.eliminationCandidate = true;
    })

    columnsToUpdate.forEach(column => {
      let matchedCookiesForColumn = this.matchedCookies.filter(c => c.colonne == column);
      maxLine = 0
      matchedCookiesForColumn.forEach((cookie) => {
        if (cookie.ligne > maxLine){
          maxLine = cookie.ligne;
        }
      })
      
      // let currentLineToReplace = maxLine - matchedCookiesForColumn.length;
      let currentLineToReplace = maxLine;
      while(currentLineToReplace >= 0 && this.tabcookies[currentLineToReplace][column].eliminationCandidate){
        currentLineToReplace--;
      }
      while(maxLine >= 0 && currentLineToReplace >= 0){
        if (this.tabcookies[currentLineToReplace][column].eliminationCandidate){
          currentLineToReplace--;
          continue;
        }

        Cookie.swapCookiesDistanceMoreThanOne(this.tabcookies[maxLine][column], this.tabcookies[currentLineToReplace][column]);
  
        maxLine--;
        currentLineToReplace--;
      }

      // ?. Maybe make with all column ???
      while(maxLine >= 0){
        this.tabcookies[maxLine][column].eliminationCandidate = false;
        maxLine--;
      }
    })

    this.matchedCookies = [];
    this.detecterMatchDansGrille(ignoreScore);
  }

  updateScore() {
    this.currentScore += this.matchedCookies.length;
    this.progressBarCounter += this.matchedCookies.length;
    let scoreDiv = document.getElementById("score");
    scoreDiv.textContent = `Score: ${this.currentScore}`;
    return this.updateProgressBar();
  }

  updateProgressBar() {
    let progressBar = document.getElementById("progress");
    let futureBarWidth = this.progressBarCounter * this.levelMultiplier[this.currentLevel - 1];

    if(futureBarWidth >= 800){
      progressBar.style.width = "800px";

      progressBar.style.width = 0 + "px";

      nbDeCookiesDifferents++;

      let caseDivs = document.querySelectorAll("#grille div");
      caseDivs.forEach(div => {
        div.innerHTML = "";
      });

      this.updateCurrentLevel();
      handleEndOfTheGame(this.currentLevel);
      this.tabcookies = this.remplirTableauDeCookies();
      this.showCookies(true);
      this.startAnumationAndEliminateCookies(true);
      this.progressBarCounter = 0;
      return true;
    }
    else{
      progressBar.style.width = futureBarWidth + "px";
      return false;
    }
  }

  saveScoreOnEachReload() {
    window.addEventListener("beforeunload", () => {
      let scores = JSON.parse(localStorage.getItem("scores")) || [];
      let now = new Date();

      let reloadTime = now.toLocaleString("fr-FR", { 
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
      
      let newScore = {
        score: this.currentScore,
        date: reloadTime
      }

      scores.push(newScore);

      scores.sort((a, b) => b.score - a.score);

      scores = scores.slice(0,5);

      localStorage.setItem("scores", JSON.stringify(scores));
    })
  }

  containsCookie(cookie){
    return this.matchedCookies.some(cks => 
      cks.ligne === cookie.ligne && cks.colonne === cookie.colonne);
  }

  updateCurrentLevel(){
    let levelDiv = document.getElementById("levelDiv");
    this.currentLevel++;
    levelDiv.innerText = `Current level: ${this.currentLevel}`;
  }

}
