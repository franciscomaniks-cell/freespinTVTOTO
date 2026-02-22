// popup.js
let results = [];

// Load data tersimpan
chrome.storage.local.get(["jutawanResults", "adminUrl"], (res) => {
  if (res.adminUrl) document.getElementById("adminUrl").value = res.adminUrl;
  if (res.jutawanResults) renderTable(res.jutawanResults);
});

document.getElementById("startBtn").addEventListener("click", async () => {
  const adminUrl = document.getElementById("adminUrl").value.trim();
  const txDataRaw = document.getElementById("txData").value.trim();
  const startDate = document.getElementById("startDateInput").value;
  const endDate = document.getElementById("endDateInput").value;

  if (!txDataRaw || !adminUrl) return alert("Isi URL dan Data Transaksi!");

  const lines = txDataRaw.split('\n').filter(l => l.trim());
  const txQueue = lines.map(line => {
    const parts = line.split(/\s+/);
    return { userId: parts[0], transactionId: parts[1], adminUrl, startDate, endDate };
  });

  await chrome.storage.local.set({ txQueue, jutawanResults: [] });
  chrome.runtime.sendMessage({ action: "startBatchProcess" });
});

function renderTable(data) {
  const tbody = document.getElementById("resultBody");
  tbody.innerHTML = "";
  results = data || [];

  results.forEach(item => {
    const win = parseFloat(item.debetValue.replace(/,/g, '')) || 0;
    const bet = parseFloat(item.betValue.replace(/,/g, '')) || 0;
    
    let statusText = "❌ TIDAK SESUAI";
    let color = "rgba(255,0,0,0.2)";

    if (win > 0 && bet > 0) {
      statusText = `✅ JP ${Math.floor(win/bet)}x`;
      color = "rgba(0,255,0,0.2)";
    }

    const row = `<tr style="background:${color}">
      <td>${item.userId}</td>
      <td>${item.transactionId}</td>
      <td>${item.betValue}</td>
      <td>${statusText}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

chrome.runtime.onMessage.addListener(msg => {
  if (msg.action === "updateStatus") document.getElementById("status").textContent = msg.status;
});

chrome.storage.onChanged.addListener(changes => {
  if (changes.jutawanResults) renderTable(changes.jutawanResults.newValue);
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const tsv = results.map(i => `${i.userId}\t${i.transactionId}\t${i.betValue}\t${i.debetValue}`).join('\n');
  navigator.clipboard.writeText(tsv);
  alert("Data disalin!");
});

document.getElementById("clearBtn").addEventListener("click", () => {
  chrome.storage.local.set({ jutawanResults: [], txQueue: [] }, () => renderTable([]));
});
