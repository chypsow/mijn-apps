"use strict";
/*const pt1 = document.getElementById("pt1");
const pt2 = document.getElementById("pt2");
const pt3 = document.getElementById("pt3");
function startAnimatie() {
    pt1.style.animation = "rot1 3600s linear infinite";
    pt2.style.animation = "rot2 216000s linear infinite";
    pt3.style.animation = "rot3 60s linear infinite";

}
function stopAnimatie() {
    pt1.style.animation = "";
    pt2.style.animation = "";
    pt3.style.animation = "";
}*/
function updateClock() {
    const now = new Date();
  
    const secondHand = document.getElementById('second-hand');
    const minuteHand = document.getElementById('minute-hand');
    const hourHand = document.getElementById('hour-hand');
  
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();
  
    // Calculate degrees for each hand
    const secondDeg = ((seconds / 60) * 360) + 90; // Offset by 90 degrees to start from 12 o'clock
    const minuteDeg = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
    const hourDeg = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;
  
    // Set the transform property to rotate the hands
    secondHand.style.transform = `rotate(${secondDeg}deg)`;
    minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    hourHand.style.transform = `rotate(${hourDeg}deg)`;
  }
  
  // Update the clock every second
  //setInterval(updateClock, 1000);
  updateClock(); // Initial call to display the time immediately