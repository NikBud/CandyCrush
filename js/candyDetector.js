

export default class CandyDetector {
    constructor() {
        
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
              this.updateScore();
            }
            this.startAnumationAndEliminateCookies(ignoreScore);
        }
      }
}