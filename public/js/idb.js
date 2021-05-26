let db;
const request = indexedDB.open("budget_manager", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_entry", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    uploadEntries();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  // open a new transaction with the database with read & write permission
  const transaction = db.transaction(["new_entry"], "readwrite");
  // access the budgetObjectStore in indexedDB where the record will go
  const budgetEntryObjectStore = transaction.objectStore("new_entry");
  // add the record
  budgetEntryObjectStore.add(record);
}

function uploadEntries() {
  const NetworkStatusEl = document.getElementById("network-status");

  // open a transaction on the pending db
  const transaction = db.transaction(["new_entry"], "readwrite");
  // access your pending object store
  const budgetEntryObjectStore = transaction.objectStore("new_entry");
  // get all records from store and set to a variable
  const getAll = budgetEntryObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["new_entry"], "readwrite");
          const budgetEntryObjectStore = transaction.objectStore("new_entry");
          // clear all items in your store
          budgetEntryObjectStore.clear();
        })
        .catch((err) => {
          // set reference to redirect back here
          console.log(err);
        });
    }
  };
}

// Set the status button to "offline" - uploadEntries
// does the opposite when we go online.

function showOfflineStatus() {
  const NetworkStatusEl = document.getElementById("network-status");
  NetworkStatusEl.textContent = "OFFLINE";
  NetworkStatusEl.className = "offline";
}

// listen for online connection
window.addEventListener("online", uploadEntries);
window.addEventListener("offline", showOfflineStatus);
