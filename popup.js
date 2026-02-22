// popup.js
let latestResults = [];

document.getElementById("startBtn").addEventListener("click", async () => {
    const adminUrl = document.getElementById("adminUrl").value.trim();
    const txDataRaw = document.getElementById("txData").value.trim();
    const token = document.getElementById("token").value.trim();
    const startDate = document.getElementById("startDateInput").value;
    const endDate = document.getElementById("endDateInput").value;
    const status = document.getElementById("status");

    if (!txDataRaw || !adminUrl || !startDate || !endDate) {
        status.textContent = "⚠️ Mohon lengkapi semua data.";
        return;
    }

    const lines = txDataRaw.split('\n').filter(line => line.trim());
    const txQueue = lines.map(line => {
        const [userId, transactionId] = line.split(/\s+/);
        return { userId, transactionId, adminUrl, startDate, endDate, token };
    });

    await chrome.storage.local.set({ txQueue, jutawanResults: [] });
    chrome.runtime.sendMessage({ action: "startBatchProcess" });
});

function renderTable(data) {
    const tbody = document.getElementById("resultBody");
    tbody.innerHTML = "";
    latestResults = data || [];

    if (latestResults.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4'>Belum ada data</td></tr>";
        return;
    }

    latestResults.forEach(item => {
        const win = parseFloat(item.debetValue.replace(/,/g, '')) || 0;
        const bet = parseFloat(item.betValue.replace(/,/g, '')) || 0;
        
        let resultStatus = "";
        let rowStyle = "";

        if (win > 0 && bet > 0) {
            resultStatus = `✅ SESUAI (JP ${Math.floor(win/bet)}x)`;
            rowStyle = "background-color: rgba(0, 255, 0, 0.2);";
        } else if (win > 0 && bet === 0) {
            resultStatus = "⚠️ WIN TANPA BET?";
            rowStyle = "background-color: rgba(255, 255, 0, 0.2);";
        } else {
            resultStatus = "❌ TIDAK SESUAI / ZONK";
            rowStyle = "background-color: rgba(255, 0, 0, 0.2);";
        }

        const row = document.createElement("tr");
        row.style = rowStyle;
        row.innerHTML = `
            <td>${item.userId}</td>
            <td>${item.transactionId}</td>
            <td>${item.betValue}</td>
            <td>${resultStatus}</td>
        `;
        tbody.appendChild(row);
    });
}

// Listeners
chrome.runtime.onMessage.addListener(msg => {
    if (msg.action === "updateStatus") document.getElementById("status").textContent = msg.status;
});

chrome.storage.onChanged.addListener(changes => {
    if (changes.jutawanResults) renderTable(changes.jutawanResults.newValue);
});

document.getElementById("copyBtn").addEventListener("click", () => {
    const tsv = latestResults.map(i => `${i.userId}\t${i.transactionId}\t${i.betValue}\t${i.debetValue}`).join('\n');
    navigator.clipboard.writeText(tsv);
    alert("Data berhasil disalin!");
});

document.getElementById("clearBtn").addEventListener("click", () => {
    chrome.storage.local.set({ jutawanResults: [], txQueue: [] }, () => renderTable([]));
});
