"use strict";
const modus = document.getElementsByName("mode");
const needle = document.getElementById("secondes");
for(const element of modus) {
    element.onchange = function() {
        if(element.value === "fluent") {
            needle.style.transition = 'transition-timing-function: ease-in-out';
            needle.style.transition = 'transform 0.5s';
        } else {
            needle.style.transition = '';
        }
    }
};
let t1 = null;
let t2 = null;
function updaten(){
    if(t1 === null && t2 === null) {
        t1 = setInterval(updateClockNum, 1000);
        t2 = setInterval(updateClockNeedle, 1000);
        updateClockNum();
        updateClockNeedle();
    }
}

function pauzeren(){
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

    const secondHand = document.getElementById('secondes');
    const minuteHand = document.getElementById('minutes');
    const hourHand = document.getElementById('heures');
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