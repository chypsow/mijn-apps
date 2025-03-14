let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let incomeCat = JSON.parse(localStorage.getItem("incomeCat")) || [];
let expenseCat = JSON.parse(localStorage.getItem("expenseCat")) || [];
const category = document.getElementById("category");
const inkom = document.getElementById("inkom");
const expens = document.getElementById("expens");
let incomeSelected = false;

// Set up radio button event listeners
[inkom, expens].forEach(btn => {
    btn.addEventListener('change', () => {
        incomeSelected = inkom.checked;
        const addCat = document.getElementById("add");
        //!incomeSelected ? addCat.textContent = 'Nieuwe \'Uitgaven\' categorie toevoegen' : addCat.textContent = 'Nieuwe \'Inkomsten\' categorie toevoegen';
        addCat.textContent = "Add new category";
        updateCategory();
    });
});

updateCategory();
function updateCategory() {
    category.innerHTML = '';
    const categories = incomeSelected ? incomeCat : expenseCat;
    let categoryHTML = `<option>Selecteer...</option>`;
    categories.forEach(cat => {
        categoryHTML += `<option>${cat}</option>`;
    });
    category.innerHTML = categoryHTML;        
}
// Add a new category
function addCategory() {
    const newCat = document.getElementById("newCat").value.trim();
    if (newCat && ![...incomeCat, ...expenseCat].includes(newCat)) {
        const categoryList = incomeSelected ? incomeCat : expenseCat;
        categoryList.push(newCat);
        localStorage.setItem(incomeSelected ? "incomeCat" : "expenseCat", JSON.stringify(categoryList));
        updateCategory();
        showAddCategory();
    } else {
        document.getElementById("newCat").value = "";
        document.getElementById("newCat").focus();
    }
}
//modalOverlay.addEventListener('click', closeModal);
function showAddCategory() {
    const categoryList = incomeSelected ? incomeCat : expenseCat;
    const categoryType = incomeSelected ? "inkomsten" : "uitgaven";
    let msg = `<ul> Categoriëen: (${categoryType})<br><br>`;
    categoryList.forEach((cat, index) => {
        msg += `<li><a href="#" onclick="removeListItem(${index})"><i class="fa fa-minus-circle"></i></a> ${cat}</li>`;
    });
    msg += `<li>
                <a href="#" onclick="addCategory()"><i id="plus" class="fa fa-plus-circle"></i></a>
                <label class="newCat"><input type="text" id="newCat"></label>
            </li>
        </ul>`;
    toggleModal(true, msg);
    document.getElementById("newCat").focus();
}
function removeListItem(index) {
    const categoryList = incomeSelected ? incomeCat : expenseCat;
    categoryList.splice(index, 1);
    localStorage.setItem(incomeSelected ? "incomeCat" : "expenseCat", JSON.stringify(categoryList));
    updateCategory(); // Bijwerken van de categorieën in de select-lijst
    showAddCategory();
}
// Toggle modal visibility
const modalOverlay = document.getElementById("modal-overlay");
const modal = document.getElementById("modal");
const overlay = document.getElementById("overlay");
function toggleModal(show, message = "") {
    modalOverlay.style.display = show ? "block" : "none";
    modal.style.display = show ? "block" : "none";
    overlay.innerHTML = message;
}
// Overlay display function
function showError(fout) {
    toggleModal(true, `Foutmelding:<br><br>Voer een geldig(e) ${fout} in.`);
}

// Close modal function
function closeModal() {
    toggleModal(false);
}

function addTransaction() {
    const amount = parseFloat(document.getElementById("amount").value);
    const type = incomeSelected ? "Inkomsten" : "Uitgaven";
    const date = document.getElementById("date").value;

    if (!amount) {
        showError("bedrag");
        return;
    } else if (!date) {
        showError("datum");
        return;
    } else if (document.getElementById("category").value === "Selecteer...") {
        showError("categorie");
        return;
    }

    const transaction = { amount, category:category.value, type, date };
    transactions.push(transaction);

    localStorage.setItem("transactions", JSON.stringify(transactions));
    if(type === "Inkomsten") {
        updateTransactions();
        updateSummary();
    } else {
        updateAll();
    }
}
function removeTransaction(index) {
    const isIncome = transactions[index].type === "Inkomsten"
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    if(isIncome) {
        updateTransactions();
        updateSummary();
    } else {
        updateAll();
    }
}
function editBedrag(index) {
    const list = document.getElementById("transaction-list");
    const item = list.children[index];
    const bedragElement = item.querySelector(".bedrag");
    if (bedragElement) {
        bedragElement.remove();
    }
    const input = document.createElement("input");
    input.type = "number";
    input.id = "newEdit";
    input.classList.add('group');
    input.value = transactions[index].amount; // Set current amount as default value
    // Voeg blur-eventlistener toe
    const blurHandler = () => {
        updateNewBedarg(index);
    };
    input.addEventListener('blur', blurHandler);

    // Voeg keydown-eventlistener toe
    input.addEventListener('keydown', (event) => {
        if (event.key === "Enter") {
            input.removeEventListener('blur', blurHandler); // Verwijder blur-handler tijdelijk
            updateNewBedarg(index);
        }
    });

    item.appendChild(input);
    input.focus(); // Focus on the input for easier editing
}

function validateEdited(index) {
    const list = document.getElementById("transaction-list");
    const item = list.children[index];
    const newEdit = document.getElementById("newEdit");
    if (newEdit && newEdit.parentNode === item) {
        newEdit.remove();
    }
    const bedragElement = document.createElement("span");
    const sign = transactions[index].type === "Inkomsten" ? '+' : '-';
    //bedragElement.href = "#";
    bedragElement.className = "bedrag";
    bedragElement.classList.add(transactions[index].type === "Inkomsten" ? "positief" : "negatief");
    bedragElement.title = "Bedrag aanpassen";
    bedragElement.innerText = `${sign}${transactions[index].amount} €`;

    // Attach event listener to the bedrag element
    bedragElement.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        editBedrag(index);
    });

    // Append .bedrag to the item and item to the list
    item.appendChild(bedragElement);
}

function updateNewBedarg(index) {
    const newEdit = document.getElementById("newEdit");
    const nieuweWaarde = parseFloat(newEdit.value);
    if (nieuweWaarde !== "" && !isNaN(nieuweWaarde) && nieuweWaarde > 0 && transactions[index].amount !== nieuweWaarde) {
       transactions[index].amount = nieuweWaarde;
        localStorage.setItem("transactions", JSON.stringify(transactions));
        validateEdited(index);
        updateSummary();
        if(transactions[index].type === "Uitgaven") {
        updateExpenseChart();
        }
    } else {
        validateEdited(index);
    }
}

updateAll();
function updateAll() {
    updateTransactions();
    updateSummary();
    updateExpenseChart();
}

function updateTransactions() {
    const list = document.getElementById("transaction-list");
    list.innerHTML = "";
    transactions.forEach((transaction, index) => {
        const item = document.createElement("li");

        let sign = transaction.type === "Inkomsten" ? "+" : "-";
        item.classList.add(transaction.type === "Inkomsten" ? "positief" : "negatief");

        item.innerHTML = `
                <i class="fa fa-minus-circle" onclick="removeTransaction(${index})"></i>
                ${transaction.date} &nbsp;&nbsp;&nbsp; ${transaction.category} :&nbsp;&nbsp;&nbsp;
        `;
        // Create the .bedrag element separately
        const bedragElement = document.createElement("span");
        bedragElement.className = "bedrag";
        bedragElement.classList.add(transaction.type === "Inkomsten" ? "positief" : "negatief");
        bedragElement.title = "Bedrag aanpassen";
        bedragElement.innerText = `${sign}${transaction.amount} €`;

        // Attach event listener to the bedrag element
        bedragElement.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            editBedrag(index);
        });

        // Append .bedrag to the item and item to the list
        item.appendChild(bedragElement);
        list.appendChild(item);
    });
}
function updateSummary() {
    const summary = transactions.reduce((acc, transaction) => {
        if (transaction.type === "Inkomsten") {
            acc.income += transaction.amount;
        } else {
            acc.expense += transaction.amount;
        }
        return acc;
    }, { income: 0, expense: 0 });

    document.getElementById("summary").innerHTML = 
        `<p style="color: greenyellow;">Totale Inkomsten: ${summary.income.toFixed(0)} €</p><p style="color: #ee7b7b;">
        Totale Uitgaven: ${summary.expense.toFixed(0)} €</p><hr style="border-color: gray; margin-top: 1em;"><p style="font-weight: Bold; font-size: 1.5em;">Netto: ${(summary.income - summary.expense).toFixed(0)} €</p>`;
}
function updateExpenseChart() {
    // Filter alleen uitgaven en groepeer op categorie
    const expenseData = transactions
        .filter(transaction => transaction.type === "Uitgaven")
        .reduce((acc, transaction) => {
            acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
            return acc;
        }, {});

    // Zet de data om in twee arrays: labels en waarden
    const categories = Object.keys(expenseData);
    const amounts = Object.values(expenseData);

    // Maak of update de Chart.js-grafiek
    let myChart = document.getElementById("expenseChart");

    // Verwijder de bestaande grafiek als deze er al is (handig bij updates)
    if (window.myChart) {
        window.myChart.destroy();
    }

    // Creëer de nieuwe grafiek
    //window.myChart = new Chart(myChart, {
    let config = {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Uitgaven per Categorie',
                data: amounts,
                backgroundColor: [
                    'red', '#26A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40','#ea00ff','#2718f5','#66380c'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    grid: {
                        color: '#9999' // Kleur van de verticale gridlijnen
                    },
                    ticks: {
                        color: '#ffffff' // Kleur van de labels op de x-as
                    }
                },
                y: {
                    grid: {
                        color: '#9999' // Kleur van de horizontale gridlijnen
                    },
                    ticks: {
                        color: '#ffffff' // Kleur van de labels op de y-as
                    }
                }
            },
            plugins: {
                legend: {
                    position: '',
                    labels: {
                        color: '#ffffff' // Kleur voor de legenda-labels
                    }
                },
                tooltip: {
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    backgroundColor: '#333'
                }
            }
            /*plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: €${context.raw.toFixed(2)}`;
                        }
                    },
                    titleColor: '#ffffff',  // Kleur voor de tooltip titel
                    bodyColor: '#ffffff',   // Kleur voor de tooltip inhoud
                    backgroundColor: '#333', // Achtergrondkleur voor de tooltip
                }
            }*/
        }
    }
    window.myChart = new Chart(myChart, config);
}