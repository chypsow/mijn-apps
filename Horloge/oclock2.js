
const p2 = document.getElementById("p2");
maakStreepjes();
function maakStreepjes() {
    //let hoek = 0;
    for(let i=0; i<30; i++) {
        const myDiv = document.createElement("div");
        myDiv.classList.add("streep");
        myDiv.style.transform = `rotate(${i*6}deg)`;
        p2.appendChild(myDiv);
        //hoek += 6;
    }
}
const modus = document.getElementsByName("mode");
const secondHand = document.getElementById('secondes');
const minuteHand = document.getElementById('minutes');
const hourHand = document.getElementById('heures');
const aiguilles = [secondHand,minuteHand,hourHand];
for(const element of modus) {
    element.onchange = function() {
        switch (element.value) {
            case 'standard' :
                /*for(const elt of aiguilles) {
                    elt.style.animation = '';
                }*/
                secondHand.style.transition = '';
                //updaten();
                break;
            case 'fluent' :
                /*for(const elt of aiguilles) {
                    elt.style.animation = '';
                }*/
                secondHand.style.transition = 'transition-timing-function: ease-in-out';
                secondHand.style.transition = 'transform 0.5s';
                //updaten();
                break;
            case 'extra-fluent' :
                clearInterval(t2);
                t2 = null;
                updateClockNeedle();
                for(const elt of aiguilles) {
                    elt.style.transition = '';
                }
                hourHand.style.animation = 'rot1 216000s linear infinite';
                minuteHand.style.animation = 'rot2 3600s linear infinite';
                secondHand.style.animation = 'rot3 60s linear infinite';

        }
    }
};

let t1 = null;
let t2 = null;
function updaten(){
    if((t1 === null || t2 === null) && modus[2].checked === false) {
        t1 = setInterval(updateClockNum, 1000);
        t2 = setInterval(updateClockNeedle, 1000);
        updateClockNum();
        updateClockNeedle();
    }
}

function pauzeren(){
    if(t1 !== null) {
        if (document.getElementById("start").innerText === "START") {
        document.getElementById("start").innerText = "RESUME";
        }
    }
    clearInterval(t1);
    clearInterval(t2);
    t1 = null;
    t2 = null;

    
}
function stoppen() {
    clearInterval(t1);
    clearInterval(t2);
    t1 = null;
    t2 = null;
    const secondHand = document.getElementById('secondes');
    const minuteHand = document.getElementById('minutes');
    const hourHand = document.getElementById('heures');
    secondHand.style.transform = 'rotate(-90deg)';
    minuteHand.style.transform = 'rotate(-90deg)';
    hourHand.style.transform = 'rotate(-90deg)';
    const clockElement = document.getElementById('numClock');
    clockElement.textContent = '00:00:00';
    if (document.getElementById("start").innerText === "RESUME") {
        document.getElementById("start").innerText = "START";
    }
}

function updateClockNum() {
const clockElement = document.getElementById('numClock');
const now = new Date();
const hoursNum = String(now.getHours()).padStart(2, '0');
const minutesNum = String(now.getMinutes()).padStart(2, '0');
const secondsNum = String(now.getSeconds()).padStart(2, '0');

clockElement.textContent = `${hoursNum}:${minutesNum}:${secondsNum}`;
}

function updateClockNeedle() {
    const now = new Date();

    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    // Calculate degrees for each needle
    const secondDeg = ((seconds / 60) * 360) - 90; // Offset by 90 degrees to start from 12 o'clock
    const minuteDeg = ((minutes / 60) * 360) + ((seconds / 60) * 6) - 90;
    const hourDeg = ((hours / 12) * 360) + ((minutes / 60) * 30) - 90;
    // Set the transform property to rotate the needles
    secondHand.style.transform = `rotate(${secondDeg}deg)`;
    minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    hourHand.style.transform = `rotate(${hourDeg}deg)`;
}