"use strict";
const tableContainer = document.getElementById('day-table-container');
const titlesContainer = document.getElementById('titles-container');
const cb = document.getElementById("cb");
let currentColumns = 1;
const maxColumns = 4; 
const ctx = document.getElementById('grafiek');
let chart;

datumInvullen();
generateTable();

/*cb.onchange = function() {
    if(this.checked === true) {
        document.getElementById("updateChart").disabled = true;
    } else {
        document.getElementById("updateChart").disabled = false;
    }
    //generateTable();
}*/


document.getElementById("chartType").onchange = () => {updateGrafiek();};


//autoFill();

function datumInvullen() {
    const startDate = document.getElementById("start-date");
    const endDate = document.getElementById("end-date");

    // Set the start date to today
    const today = new Date();
    startDate.valueAsDate = today;

    // Create a new date for 7 days later
    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() + 12);
    endDate.valueAsDate = endDateObj;
}

// Function om kolom toe te voegen
function kolomToevoegen() {
    if (currentColumns < maxColumns) {
        currentColumns++;
        const row1 = document.getElementById("row1");
        const newCell1 = document.createElement("th");
        newCell1.textContent = `Titel ${currentColumns}`;
        row1.appendChild(newCell1);
        const row2 = document.getElementById("row2");
        const newCell2 = document.createElement("td");
        newCell2.innerHTML = `<input type="text" class="data-table" id="titel-${currentColumns}">`;
        newCell2.firstElementChild.value = (document.getElementById('titel-1').value) + `-${currentColumns-1}`;
        row2.appendChild(newCell2);

        // Toon de verwijderknop als er meer dan 1 kolom is
        document.getElementById("delete").hidden = false;
    } else {
        alert("Maximum aantal kolommen bereikt!");
    }
}

// Function om kolom te verwijderen
function kolomVerwijderen() {
    if (currentColumns > 1) {
        const row1 = document.getElementById("row1");
        const row2 = document.getElementById("row2");
        row1.removeChild(row1.lastChild);
        row2.removeChild(row2.lastChild);
        currentColumns--;

        // Verberg de verwijderknop als er nog maar 1 kolom over is
        if (currentColumns === 1) {
            document.getElementById("delete").hidden = true;
        }
    }
}

function autoFill() {
    const dateLabels = JSON.parse(tableContainer.getAttribute('data-datelabels'));  // Haal de datumlabels op
    const kolomTitels = JSON.parse(kolommen.getAttribute('data-kolomTitels'));
    kolomTitels.forEach((titel) => {
        dateLabels.forEach((_, index) => {
            document.getElementById(`${titel}-${index}`).value = Math.floor(Math.random() * 100);
        });
    });
    generateChart();
}
function clearData() {
    const dateLabels = JSON.parse(tableContainer.getAttribute('data-datelabels'));  // Haal de datumlabels op
    const kolomTitels = JSON.parse(kolommen.getAttribute('data-kolomTitels'));
    kolomTitels.forEach((titel) => {
        dateLabels.forEach((_, index) => {
            document.getElementById(`${titel}-${index}`).value = '';
        });
    });
}

// Functie om de tabel te genereren
function generateTable() {
    //const autoF = document.getElementById("autoF");
    //const clear = document.getElementById("clear");
    const startDate = new Date(document.getElementById("start-date").value);
    const endDate = new Date(document.getElementById("end-date").value);
    
    
    // Controleer of beide datums correct zijn ingevuld
    if (isNaN(startDate) || isNaN(endDate)) {
        alert("Vul alstublieft geldige start- en einddatums in.");
        return;
    }

    // Controleer of de titels zijn ingevuld
    let doorgaan = true;
    const titels = document.querySelectorAll("#row2 input");
    const kolomTitels = [];
    for(let i = 0; i < currentColumns; i++) {
        if(titels[i].value === "") {
            alert("Vul alstublieft de kolomm(en) in.");
            doorgaan = false;
            break;
        } else {
            kolomTitels.push(titels[i].value);
        }
    }
    // Check for uniqueness using a Set
    const uniqueTitles = new Set(kolomTitels);
    if (uniqueTitles.size !== kolomTitels.length) {
        alert("De kolommen mogen niet dezelfde titel hebben!");
        return;
    }

    if(doorgaan === false) {
        return;
    }
    //kolomTitels.shift;
    //alert("Walid Atti");
    // if(autoF.style.display === 'none') {
    //     autoF.style.display = '';
    //     clear.style.display = '';
    // }   
    // Genereer een reeks dagen tussen start- en einddatum
    const dateLabels = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
        dateLabels.push(currentDate.toLocaleDateString());  // Voeg de datum toe //.toLocaleDateString().split('T')[0]
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Maak een tabel met invoervelden
    
    tableContainer.innerHTML = '';  // Reset de tabel

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Datum</th>
    `;
    for(let i = 0; i < currentColumns ; i++) {
        tableHTML += `
                    <th>${titels[i].value}</th>
                
    `;
    }
    tableHTML += `
                </tr>
            </thead>
            <tbody>
    `;

    dateLabels.forEach((x, y) => {
        tableHTML += `
            <tr>
                <td>${x}</td>`
        for(let i = 0; i < currentColumns ; i++) {
            if(cb.checked === true) {
                //To get a random number between 50 and 100:
                //const min = 50;
                //const max = 100;
                //const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                // Output a random integer between 50 and 100

            tableHTML += `
            
                <td><input type="number" class="data-table" id="${kolomTitels[i]}-${y}" value="${Math.floor(Math.random() * (20*(4-i) + 1)) - 10*(4-i)}"></td>
            `;
            } else {
                tableHTML += `
                <td><input type="number" class="data-table" id="${kolomTitels[i]}-${y}" value=""></td>
            `;
            }
        }
        tableHTML += `
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    // Voeg de tabel toe aan de container
    tableContainer.innerHTML = tableHTML;

    // Bewaar de datumlabels in een verborgen input (voor later gebruik in de grafiek)
    tableContainer.setAttribute('data-datelabels', JSON.stringify(dateLabels));
    titlesContainer.setAttribute('data-titlescontainer', JSON.stringify(kolomTitels));

    generateChart(dateLabels, kolomTitels);
}

// Functie om de grafiek te genereren

function generateChart(dateLabels, kolomTitels) {
    const chartType = document.getElementById("chartType").value;
    if(chart !== undefined) {
        chart.destroy();
    }
    const kleur = ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgbA(255, 165, 0, 1)'];
    let config = {
        type: chartType,
        data: {
            labels: dateLabels,
            datasets: []
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        //text: 'Datum (dagen)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        //text: 'Aantal werken'
                    },
                    beginAtZero: true
                }
            }
        }
    };
    kolomTitels.forEach((titel, y) => {
        let dataKolommen = [];
        dateLabels.forEach((_, index) => {
            dataKolommen.push(document.getElementById(`${titel}-${index}`).value);
        });
        config.data.datasets.push({
            label : titel,
            data: dataKolommen,
            borderColor: kleur[y],
            backgroundColor: kleur[y],
            fill: false
        });
    });
    chart = new Chart(ctx, config);
}
function updateGrafiek() {
    const dateLabels = JSON.parse(tableContainer.getAttribute('data-datelabels'));  // Haal de datumlabels op
    const kolomTitels = JSON.parse(titlesContainer.getAttribute('data-titlescontainer'));
    generateChart(dateLabels, kolomTitels);
}