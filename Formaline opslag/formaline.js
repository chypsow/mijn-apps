"use strict";
const xValues = [31, 32.5, 33.5, 35, 37, 40, 45, 50, 55];
const yValues = [0, 9.5, 14, 20.5, 27.5, 36.5, 49.5, 60.5, 69];
const xAs = 'Opslag temperatuur in °C';
const yAs = 'Gew.% concentratie';
grafiek(xValues, yValues, 'myChart', xAs, yAs);
grafiek(yValues, xValues, 'myChart2',yAs, xAs);
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const temp = 'Opslag temp. in °C :';
const conc = 'Gew.% Concentratie :';

let omgewisseld = false;
function switchen() {
    const minOfMax = document.getElementById("minOfMax");
    document.getElementById('inputValue').value = '';
    document.getElementById("output").innerText = '';
    if(omgewisseld === false) {
        inputText.innerText = temp;
        outputText.innerText = conc;
        minOfMax.innerText = "Maximum";
        omgewisseld = true;
        calculateOutput(yValues, xValues);
        document.getElementById('myChart').style.display = 'none';
        document.getElementById('myChart2').style.display = '';
    } else { 
        inputText.innerText = conc;
        outputText.innerText = temp;
        minOfMax.innerText = "Minimum";
        omgewisseld = false;
        calculateOutput(xValues, yValues);
        document.getElementById('myChart').style.display = '';
        document.getElementById('myChart2').style.display = 'none';
    }
}

document.getElementById("inputValue").oninput = function() {
    !omgewisseld ? calculateOutput(xValues, yValues) : calculateOutput(yValues, xValues);
}

function calculateOutput(xValues, yValues) {
    const inputValue = document.getElementById('inputValue').value;
    const output = document.getElementById("output");
    
    const fout = document.getElementById("fout");
    const range1 = 'Ingave buiten bereik [31-55]';
    const range2 = 'Ingave buiten bereik [0-69]';
    let outputValue;

    if(inputValue !== "") {
        // Eenvoudige lineaire interpolatie tussen punten
        for (let i = 0; i < xValues.length - 1; i++) {
            if (inputValue >= xValues[i] && inputValue <= xValues[i + 1]) {
                const slope = (yValues[i + 1] - yValues[i]) / (xValues[i + 1] - xValues[i]);
                outputValue = (yValues[i] + slope * (inputValue - xValues[i])).toFixed(2);
                break;
            }
        }
        if (outputValue === undefined) {
            output.innerText = '';
            fout.hidden = false;
            //minOfMax.innerText = '';
            inputText.innerText === conc ? fout.innerText = range1: fout.innerText = range2;
        } else {
            fout.hidden = true;
            if(omgewisseld === true) {
                output.innerText = `${outputValue} %`;
                //minOfMax.innerText = "Maximum";
            } else {
                output.innerText = `${outputValue} °C`;
                //minOfMax.innerText = "Minimum";
            }
        }
    } else {
        fout.hidden = true;
    }
}

const keuze = document.getElementById("keuzeBerekening");
const choice = document.getElementById("choice");
const huidig = document.getElementById("huidig");
const volume = document.getElementById("volume");
const meting = document.getElementById("meting");
const dichtheid = document.getElementById("densiteit");
const hoeveel = document.getElementById("hoeveel");
const resultaat = document.getElementById("resultaat");
let gewenst = document.getElementById("gewenst");

const metingen = [huidig, volume, meting];

let water = true;
keuze.onchange = function() {
    resultaat.innerText = '';
    if(water === true) {
        water = false;
        choice.innerHTML = `Toegevoegd water (ton): <input type="number" step="any" id="gewenst" oninput="Berekenen();">`;
        document.querySelector(".midden p").innerText = 'Berekende concentratie:';
        gewenst = document.getElementById("gewenst");
        
    } else {
        water = true;
        choice.innerHTML = `Gewenste concentratie (wt%): <input type="number" step="any" id="gewenst" oninput="Berekenen();">`;
        document.querySelector(".midden p").innerText = 'Toe te voegen water (ton):';
        gewenst = document.getElementById("gewenst");
        //mijnGegevens = document.querySelectorAll(".midden input[type=number]");
    }
}

for(const meet of metingen) {
    meet.oninput = function() {
        if( huidig.value !== "" && volume.value !== "" && meting.value !== "") {
            dichtheid.value = dichtheidBerekenen(huidig.value, meting.value);
            hoeveel.value = (volume.value * dichtheid.value / 1000).toFixed(2);
            Berekenen();
        } else {
            dichtheid.value = "";
            hoeveel.value = "";
            resultaat.innerText = '';
        }

    }
}
function Berekenen() {
    let allesIngevuld = true;
    for(const elt of metingen) {
        if(elt.value === "") {
            allesIngevuld = false;
            break;
        }
    }
    if(allesIngevuld === true && gewenst.value !== '') {
        if(water === true) {
            resultaat.innerText = (huidig.value * hoeveel.value/gewenst.value - hoeveel.value).toFixed(2) + ' ton';
        } else {
            resultaat.innerText = ((parseFloat(huidig.value) * parseFloat(hoeveel.value))/
            (parseFloat(hoeveel.value) + parseFloat(gewenst.value))).toFixed(2) + ' %';
        }
    } else {
        resultaat.innerText = '';
    }
}

function dichtheidBerekenen(conc, temp) {
    let density;
    const temp0 = 20;
    const afname = 0.6;
    const xAs = [0,10,20,30,40,50,60,70,80,90,100];
    const yAs = [998.2,1015,1035,1060,1085,1115,1145,1170,1200,1225,1250];
    for (let i = 0; i < xAs.length - 1; i++) {
        if (conc >= xAs[i] && conc <= xAs[i + 1]) {
            const slope = (yAs[i + 1] - yAs[i]) / (xAs[i + 1] - xAs[i]);
            density = (yAs[i] + slope * (conc - xAs[i]));
            break;
        }
    }
    if (temp >= temp0) {
        const deltaT = temp - temp0;
        return Math.round(density - deltaT*afname);
    } else {
        const deltaT = temp0 - temp;
        return Math.round(density + deltaT*afname);
    }
}

function grafiek(xValues, yValues, grafiek, xAs, yAs) {
    const myChart = document.getElementById(grafiek);
    let config = {
        type: 'line',
        data: {
        labels: xValues,
        datasets: [{
            label: xAs,
            data: yValues,
            borderColor: 'rgba(54, 116, 145, 0.9)',//'rgba(90, 190, 190, 1)',
            //backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            color: 'rgba(2, 9, 1, 0.8)'
        }]
        },
        options: {
            Responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    ticks: {
                            color: 'rgba(2, 9, 1, 0.8)'  // Kleur van de X-as labels
                        },
                    grid: {
                            color: 'rgba(20, 20, 20, 0.4)'
                        },
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: yAs,
                        color: 'rgba(2, 9, 1, 1)'
                    }
                },
                y: {
                    ticks: {
                            color: 'rgba(2, 9, 1, 0.8)'
                        },
                    grid: {
                            color: 'rgba(20, 20, 20, 0.4)'
                        }
                    /*title: {
                    display: true,
                    text: 'Max FDH wt% conc.',
                    color: 'rgba(2, 9, 1, 1)'*/
                    
                }
            }
        }
    }
    const mijnGrafiek = new Chart(myChart, config);
    mijnGrafiek.update();
}
