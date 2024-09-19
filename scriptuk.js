// Ajoute un événement de clic sur le bouton 'checkButton' pour exécuter la fonction 'checkNumbers'
document.getElementById('checkButton').addEventListener('click', checkNumbers);

function checkNumbers() {
    // Récupérer les numéros entrés par l'utilisateur et les convertir en entiers
    let enteredNumbers = [
        parseInt(document.getElementById('num1').value, 10),
        parseInt(document.getElementById('num2').value, 10),
        parseInt(document.getElementById('num3').value, 10),
        parseInt(document.getElementById('num4').value, 10),
        parseInt(document.getElementById('num5').value, 10),
        parseInt(document.getElementById('num6').value, 10)
    ].filter(n => Number.isInteger(n) && n >= 1 && n <= 59); // Supprime les valeurs non valides

    // Vérifie que l'utilisateur a bien entré 6 numéros
    if (enteredNumbers.length !== 6) {
        alert("Please enter 6 distinct numbers between 1 and 59.");
        return;
    }

    // Vérifie s'il y a des doublons parmi les numéros entrés
    let uniqueNumbers = [...new Set(enteredNumbers)];
    if (uniqueNumbers.length !== enteredNumbers.length) {
        alert("Please enter separate numbers.");
        return;
    }

    // Charge le fichier CSV contenant les résultats du loto
    fetch('resultsuk.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error("Error loading: " + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            let rows = data.split('\n').slice(1);
            let found = false;
            let matches = [];
            let totalMatches = 0;  // Ajoute un compteur pour les correspondances totales

            rows.forEach(row => {
                let cols = row.split(',');
                if (cols.length < 11) {
                    console.error("Invalid line: ", row);
                    return;
                }

                let [drawDate, drawMonth, drawYear, drawNumber, ...drawNumbers] = cols;
                drawNumbers = drawNumbers.slice(0, 6).map(Number);
                let compNumber = Number(cols[10]);

                let commonNumbers = enteredNumbers.filter(n => drawNumbers.includes(n));

                if (commonNumbers.length >= 3) {
                    totalMatches += 1;  // Incrémente le nombre total de correspondances
                    matches.push({
                        drawDate,
                        drawMonth,
                        drawYear,
                        drawNumber,
                        drawNumbers,
                        compNumber,
                        commonNumbers
                    });
                }
            });

            if (!found) {
                displayMatches(matches, totalMatches);
            }
        })
        .catch(error => {
            console.error("Error loading: ", error);
            alert("Error loading: " + error.message);
        });
}

function displayMatches(matches, totalMatches) {
    let resultsDiv = document.getElementById('results');
    let totalMatchesDiv = document.getElementById('totalMatches');
    resultsDiv.innerHTML = '';
    totalMatchesDiv.innerHTML = '';

    if (matches.length === 0) {
        resultsDiv.innerHTML = "No matches found.";
        totalMatchesDiv.innerHTML = "Totalx : 0";
        return;
    }

    totalMatchesDiv.innerHTML = `Total : ${totalMatches}`;

    matches.forEach(({ drawDate, drawMonth, drawYear, drawNumber, drawNumbers, compNumber, commonNumbers }) => {
        let resultLine = document.createElement('div');
        resultLine.classList.add('result-line');

        let dateColumn = document.createElement('div');
        dateColumn.classList.add('date');
        dateColumn.textContent = `${drawDate} ${drawMonth} ${drawYear}`;
        resultLine.appendChild(dateColumn);

        let tirageColumn = document.createElement('div');
        tirageColumn.classList.add('Tirage');
        tirageColumn.textContent = `Draw number ${drawNumber}`;
        resultLine.appendChild(tirageColumn);

        drawNumbers.forEach(num => {
            let numSpan = document.createElement('span');
            numSpan.classList.add('num');
            numSpan.textContent = num;

            if (commonNumbers.includes(num)) {
                if (commonNumbers.length === 3) {
                    numSpan.classList.add('match-3');
                } else if (commonNumbers.length === 4) {
                    numSpan.classList.add('match-4');
                } else if (commonNumbers.length === 5) {
                    numSpan.classList.add('match-5');
                } else if (commonNumbers.length === 6) {
                    numSpan.classList.add('match-6');
                }
            }

            resultLine.appendChild(numSpan);
        });

        let compSpan = document.createElement('span');
        compSpan.classList.add('comp');
        compSpan.textContent = `C ${compNumber}`;
        resultLine.appendChild(compSpan);

        let matchInfo = document.createElement('div');
        matchInfo.classList.add('info');
        matchInfo.textContent = `${commonNumbers.length} winning numbers.`;
        resultLine.appendChild(matchInfo);

        resultsDiv.appendChild(resultLine);
    });
}
