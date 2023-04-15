import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js';

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

document.addEventListener('DOMContentLoaded', (event) => {
  // The rest of your code...
});

// Inventory data
const inventory = {
    // Add the inventory data as key-value pairs
    'Grau S': 2,
    'Grau M': 3,
    'Grau L': 3,
    'Grau XL': 2,
    'Weiss S': 4,
    'Weiss M': 5,
    'Weiss L': 5,
    'Weiss XL': 3,
    'Schwarz S': 5,
    'Schwarz M': 5,
    'Schwarz L': 5,
    'Schwarz XL': 2,
    'Blau Navy S': 2,
    'Blau Navy M': 4,
    'Blau Navy L': 4,
    'Blau Navy XL': 2,
    'Moosgrün S': 2,
    'Moosgrün M': 2,
    'Moosgrün L': 2,
    'Moosgrün XL': 1,
    'Laubgrün S': 1,
    'Laubgrün M': 2,
    'Laubgrün L': 1,
    'Laubgrün XL': 1,
    'Salbeigrün S': 1,
    'Salbeigrün M': 1,
    'Salbeigrün L': 1,
    'Salbeigrün XL': 1,
    'Mango S': 1,
    'Mango M': 2,
    'Mango L': 2,
    'Mango XL': 1,
    'Orange S': 2,
    'Orange M': 2,
    'Orange L': 2,
    'Orange XL': 1,
    'Rot S': 2,
    'Rot M': 2,
    'Rot L': 2,
    'Rot XL': 1,
    'Burgundy M': 1,
    'Burgundy L': 1,
    'Pink S': 1,
    'Pink M': 2,
    'Pink L': 2,
    'Pink XL': 1
  };
  
  // Initialize the dropdown list
  const modelSelect = document.getElementById("model");
  for (const model in inventory) {
    const option = document.createElement("option");
    option.value = model;
    option.text = `${model} (${inventory[model]})`;
    modelSelect.add(option);
  }
  
  // Update inventory table
  const inventoryTable = document.getElementById("inventory").getElementsByTagName("tbody")[0];
  for (const model in inventory) {
    const row = inventoryTable.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    cell1.textContent = model;
    cell2.textContent = inventory[model];
  }

  // Add an array to store order data
  const ordersRef = ref(db, "orders");
  let currentOrderNumber = 1;  
  
  // Handle form submission
  document.getElementById("order-form").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const model = modelSelect.value;
  
    // Update inventory
    inventory[model]--;
    if (inventory[model] === 0) {
      modelSelect.remove(modelSelect.selectedIndex); // Remove the sold-out option from the dropdown list
    }
  
    // Update dropdown and table
    modelSelect.options[modelSelect.selectedIndex].text = `${model} (${inventory[model]})`;
    for (const row of inventoryTable.rows) {
      if (row.cells[0].textContent === model) {
        row.cells[1].textContent = inventory[model];
        // Apply the 'sold-out' class when the item count reaches 0
    if (inventory[model] === 0) {
      row.classList.add("sold-out");
    }
        break;
      }
    }
  
// Save order data
const orderData = {
    orderNumber: currentOrderNumber,
    firstName: document.getElementById("first-name").value,
    lastName: document.getElementById("last-name").value,
    street: document.getElementById("street").value,
    number: document.getElementById("number").value,
    zip: document.getElementById("zip").value,
    city: document.getElementById("city").value,
    paid: document.getElementById("paid").checked,
    model: model,
    comment: document.getElementById("comment").value,
  };

  // Store the order in the orders array
  ordersRef.push(orderData);

  // Reset the form
  document.getElementById("order-form").reset();

  // Increment the current order number after each successful submission
  currentOrderNumber++;
});

// Function to download orders as CSV
async function downloadOrdersCSV() {
  const snapshot = await get(ordersRef);
  const orders = snapshot.val();
  const csvRows = [];
  const header = [
    "Order Nr.",
    "Vorname",
    "Nachname",
    "Strasse",
    "Nr",
    "PLZ",
    "Ort",
    "Bezahlt",
    "Modell",
    "Kommentar",
  ];
  csvRows.push(header.join(","));

  for (const orderKey in orders) {
    const order = orders[orderKey];
    const row = [
      order.orderNumber,
      order.firstName,
      order.lastName,
      order.street,
      order.number,
      order.zip,
      order.city,
      order.paid,
      order.model,
      order.comment,
    ];
    csvRows.push(row.join(","));
  }

  const csvString = csvRows.join("\r\n");
  const csvBlob = new Blob([csvString], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(csvBlob);

  link.setAttribute("href", url);
  link.setAttribute("download", "orders.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Add event listener to download button
document.getElementById('download-csv').addEventListener('click', downloadOrdersCSV);
