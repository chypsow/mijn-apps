"use strict";
let atomicMasses = [];
let names = [];
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modal-overlay");
const sluiten = document.getElementById("sluiten");
const mm = document.getElementById("mm");
const details = document.getElementById("details");
const formule = document.getElementById("formule");

async function retrieveAtomicMasses()  {
    const response = await fetch("periodicSystem.json");
    if(response.ok) {
        const componenten = await response.json();
        for(const component of componenten) {
            atomicMasses[component.symbol] = component.atomic_mass;
        }
    }
};

async function retrieveNames() {
  try {
    const response = await fetch("./periodicSystem.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const componenten = await response.json();
    
    for (const component of componenten) {
      names[component.symbol] = component.name;
    }
  
  } catch (error) {
    console.error("Er is een fout opgetreden:", error.message);
  } 
};

function hideElements() {
  mm.textContent = '';
  details.style.display = 'none';
  document.querySelector(".short").style.display = 'none';
}

function reset() {
  formule.value = '';
  hideElements();
  formule.focus();
}

function formatFormula(event) {
  let value = event.target.value;
// Gebruik regex om de eerste letter, elke letter na een nummer en elke letter na een kleine letter in hoofdletters om te zetten
  value = value.replace(/(^[a-z]|(?<=\d)[a-z]|[a-z]{1}[a-z])/g, match => 
   match.length === 2 ? match[0].toLowerCase() + match[1].toUpperCase() : match.toUpperCase());
// Gebruik regex om te checken of elk element met 2 letters (een groot en een klein) bestaat in database anders splitsen in 2 elementen 
  value = value.replace(/([A-Z][a-z])/g, match => atomicMasses[match] ? match : match[0] + match[1].toUpperCase());
  //value = value.replace("o", "O");
  event.target.value = value;
  calculateMolecularMass(value);
}

function calculateMolecularMass(formula) {
  if(formula === "") {
    hideElements();
    return;
  }
  
  const elementRegex = /([A-Z][a-z]?)(\d*)/g;   ///([A-Za-z]{1,2})(\d*)/g;     ///
  let totalMass = 0;
  let match;
  let steps = []; 

  while ((match = elementRegex.exec(formula)) !== null) {

    let element = match[1];
    let cpt = parseInt(match[2] || "1");
    
    //element = formatElement(element);
    if (atomicMasses[element]) {
      totalMass += atomicMasses[element] * cpt;
      const existingStep = steps.find(s => s.name === element);
      if (existingStep) {
        existingStep.count += cpt;
      } else {  
        steps.push({name : element, count : cpt});
      }
    } else {
      if(formule.value.length > 1){
        //alert(`Element ${element} niet gevonden in database.`);
        hideElements();
        return;
      }
    }
  }
  
  if(totalMass === 0 && formule.value.length > 1) {
    alert(`Element niet gevonden in database`);
    hideElements();
  } else {
    totalMass === 0 ? mm.classList.add('rood') : mm.classList.remove('rood');
    mm.textContent = `Molecuulmassa = ${totalMass.toFixed(3)} u`;
    details.style.display = '';
    document.querySelector(".short").style.display = '';
  }

  formule.setAttribute('berekeningDetails', JSON.stringify(steps));
}

function openModal() {
  const steps = JSON.parse(formule.getAttribute('berekeningDetails'));
  const teTonenSteps = [];
  steps.forEach(verwerkt => {
    const elt = verwerkt.name;
    teTonenSteps.push(
      `${elt}-${names[elt]}: ${verwerkt.count} atom x ${atomicMasses[elt]} u = ${atomicMasses[elt] * verwerkt.count} u`
    )
  });
  // Voeg de berekeningsstappen toe aan de lijst in het modaal
  const detailsList = document.getElementById("calculation-details");
  detailsList.innerHTML = `<p style="font-family:'Georgia', serif; font-weight:Bold;">[${formule.value}]</p><br>`;
  teTonenSteps.forEach(step => {
      const li = document.createElement("li");
      li.textContent = step;
      detailsList.appendChild(li);
  });

  modalOverlay.style.display = 'block';
  setTimeout(() => {
    modalOverlay.classList.add('open');
  }, 10)
  modal.style.display = "block";
}

// Functie om het modaal te sluiten
function closeModal() {
  modalOverlay.classList.remove('open');
  setTimeout(() => {
      modalOverlay.style.display = 'none';
  }, 300);
  modal.style.display = "none";
}

//Modal verplaatsen

//const header = document.querySelector(".modal-header");
let isDragging = false;
let offsetX, offsetY;
// Start slepen bij muisklik op de header

function onMouseMove(e) {
    if (isDragging) {
        modal.style.left = `${e.clientX - offsetX}px`;
        modal.style.top = `${e.clientY - offsetY}px`;
    }
}
function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
}

document.addEventListener("keydown", function(event) {
  if (event.ctrlKey && event.key === "d") {  // Ctrl + S
      event.preventDefault();                 // Voorkomt dat de browser de standaard actie uitvoert
      openModal(formule.value);                        // Voer de actie uit
  }
});

modal.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - modal.offsetLeft;
  offsetY = e.clientY - modal.offsetTop;
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});
document.addEventListener('click', (event) => {
  if(modalOverlay.contains(event.target) && !modal.contains(event.target)) closeModal();
});

formule.addEventListener("input", formatFormula);
details.addEventListener('click', openModal);
sluiten.addEventListener('click', closeModal);

document.addEventListener('DOMContentLoaded', () => {
  retrieveAtomicMasses();
  retrieveNames();
});