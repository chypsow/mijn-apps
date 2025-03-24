"use strict";
const pmt = document.getElementById("pmt");
const rentevoet = document.getElementById("rente");
const periodeInJaar = document.getElementById("periodeJaar")
const interesten = document.getElementById("interesten");
const myInput = document.querySelectorAll("input[type=number]");
const myOutput = document.querySelectorAll("input[type=text]");
const tableHeader = document.getElementById("tableHeader");
const tableInhoud = document.getElementById("tableInhoud");
const myTable = document.querySelector("table");
const aflossingBtn = document.getElementById("aflossingstabel");
const datum = document.getElementById("startDatum");
const afdrukken = document.getElementById("afdrukken");
const leningOverzicht = document.getElementById("leningOverzicht");
const renteType = document.getElementById("renteType");

for(const inp of myInput) {
    inp.oninput = function() {
        berekenPmt();
        herberekenTabel();
    }
};

function berekenPmt() {
    const bedrag = document.getElementById("teLenenBedrag").value;
    const jkp = document.getElementById("jkp").value;
    const periode = document.getElementById("periode").value;
    if(bedrag !== "" && jkp !== "" && periode !== "") {
        aflossingBtn.style.display = '';
        const soort = renteType.value;
        
        const aflossing = maandAflossing(bedrag, jkp, periode, soort);
        pmt.value = Math.round(aflossing[0]*100)/100 + "   EUR";
        rentevoet.value = Math.round(aflossing[1]*1000000)/10000 + "   %";
        periodeInJaar.value = Math.round(periode/12*100)/100 + "   jaar";
        interesten.value = Math.round((aflossing[0] * periode - bedrag)*100)/100 + "   EUR";
    } else {
        for(const out of myOutput) {
            out.value = "";
        }
        aflossingBtn.style.display = 'none';
        afdrukken.style.visibility = "hidden";
        myTable.hidden = true;
    }
};

const maandAflossing = (b, j, p, rente) => {
    const i = (rente === "1" ? Math.pow(j/100 + 1, 1/12) - 1 : j/100/12);
    //console.log(`type rente: ${rente} \nmaandelijkse rente: ${i} \njkp:12= ${j/100/12}`);
    const k = 1 - Math.pow((1+i), -p);
    //console.log(`k = ${k}`);
    return [b * (i/k), i];
};

function herberekenTabel() {
    if(myTable.hidden === false) genereerAflossingstabel();
};

function genereerAflossingstabel() {
    tableInhoud.innerHTML = "";
    myTable.hidden = false;
    afdrukken.style.visibility = "visible";
    
    if(datum.value === "") {
        //const day = new Date().toLocaleString("nl-BE", { day: "2-digit" });
        //const month = new Date().toLocaleString("nl-BE", { month: "2-digit" });
        //const year = new Date().getFullYear();
        //datum.value = `${year}-${month}-${day}`;
        datum.valueAsDate = new Date();
    } else {
        datum.valueAsDate = datum.valueAsDate; 
    }
    const bedrag = document.getElementById("teLenenBedrag").value;
    const jkp = document.getElementById("jkp").value;
    const periode = document.getElementById("periode").value;
    const soort = renteType.value;
    const aflossing = maandAflossing(bedrag, jkp, periode, soort);
    const maand = aflossing[0];
    const rente = aflossing[1];
    let CumKap = 0;
    let CumInt = 0;
    let begin = bedrag;
    let myDate = datum.valueAsDate; //new Date(datum.value).toLocaleDateString(); // or myDate=datum.ValueAsDate
    for(let i = 1; i <= periode; i++) {
        const tr = tableInhoud.insertRow(); 
        const tdNo = tr.insertCell();
        tdNo.innerText = i;
        myDate.setMonth(myDate.getMonth() + 1);
        const tdDatum = tr.insertCell();
        tdDatum.innerText = new Date(myDate).toLocaleDateString();
        const tdBegin = tr.insertCell();
        if(i === 1) {
            tdBegin.innerText = begin ;
        } else {
            begin = begin - (maand - rente * begin)
            tdBegin.innerText = Math.round(begin * 100)/100;
        }
        const tdAflossing = tr.insertCell();
        tdAflossing.innerText = Math.round(maand*100)/100;
        const tdKapitaal = tr.insertCell();
        tdKapitaal.innerText = Math.round((maand - rente * begin)*100)/100; 
        const tdrente = tr.insertCell();
        tdrente.innerText = Math.round(rente * begin * 100)/100;
        const tdUitstaand = tr.insertCell();
        tdUitstaand.innerText = Math.round((begin - (maand - rente * begin))*100)/100;
        const tdCumInt = tr.insertCell();
        tdCumInt.innerText =Math.round((Number(tdrente.innerText) + CumInt)*100)/100;
        CumInt += rente * begin;
        const tdCumKap = tr.insertCell();
        tdCumKap.innerText = Math.round((Number(tdKapitaal.innerText) + CumKap)*100)/100;
        CumKap += maand - rente * begin;
        const tdCumAfl = tr.insertCell();
        tdCumAfl.innerText = Math.round(maand * i * 100)/100;
    }
    
};

renteType.addEventListener('change', () => {
    berekenPmt();   
    herberekenTabel();
});
datum.addEventListener('change', herberekenTabel);
aflossingBtn.addEventListener('click', genereerAflossingstabel);

function voorbereiden() {
    leningOverzicht.innerHTML = "";
    //leningOverzicht.hidden = false;
    const li1 = document.createElement("li");
    li1.innerText = "Maandelijkse aflossing: " + pmt.value;
    leningOverzicht.appendChild(li1);
    const li2 = document.createElement("li");
    li2.innerText = "JKP: " + document.getElementById("jkp").value + " %";
    leningOverzicht.appendChild(li2);
    const li3 = document.createElement("li");
    li3.innerText = "Periode: " + document.getElementById("periode").value + " maanden";
    leningOverzicht.appendChild(li3);
    const li4 = document.createElement("li");
    li4.innerText = "Totaal interesten: " + interesten.value;
    leningOverzicht.appendChild(li4);
};

function printData() {
    voorbereiden();
    window.print();
};

//
function transformTypedChar(charStr) {
	return charStr.includes(".") == true ? charStr.replace(".",",") : charStr;
}
function check(Sender,e){
  const key = e.which ? e.which : e.keyCode;
  if(key == 46){
     Sender.value += ',';
     return false;
  }
}

/*for(const out of myOutput) {
    out.onblur = function() {
        const bedrag = document.getElementById("teLenenBedrag").value;
        const jkp = document.getElementById("jkp").value;
        const periode = document.getElementById("periode").value;
        const aflossing = maandAflossing(bedrag, jkp, periode);
        pmt.value = Math.round(aflossing[0]*100)/100 + "   EUR";
        rentevoet.value = Math.round(aflossing[1]*1000000)/10000 + "   %";
        periodeInJaar.value = Math.round(periode/12*100)/100 + "   jaar";
        interesten.value = Math.round((aflossing[0] * periode - bedrag)*100)/100 + "   EUR";
    }
}*/



    

