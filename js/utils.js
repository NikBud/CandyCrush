export { create2DArray, handleEndOfTheGame };

/** En JavaScript on ne peut pas déclarer directement de tableau à n dimensions
   en précisant toutes les dimensions. tab [4][4] n'est pas possible par exemple.
   On déclare en général un tableau à une dimension de taille varialbe (ci-dessous 
   let arr = []) puis ensuite pour chacune des lignes du tableau, on lui affecte un autre
   tableau (arr[i] = [] ci-dessous) */

function create2DArray(rows) {
  let arr = [];

  for (let i = 0; i < rows; i++) {
    arr[i] = [];
  }

  return arr;
}

function handleEndOfTheGame(currentLevel) {
  if (currentLevel == 5){
    setTimeout(() => {
      let main = document.getElementById("main");
      let endPage = document.getElementById("endGameDiv");
      let restartBtn = document.getElementById("restartGame");

      main.style.display = "none";
      endPage.style.display = "block";
      restartBtn.addEventListener("click", () => {
        location.reload();
      });
    }, 300);
  }
}

