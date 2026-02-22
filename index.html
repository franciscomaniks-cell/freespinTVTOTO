let latestResults = [];

// Fungsi inisialisasi saat popup dibuka
chrome.storage.local.get(["jutawanResults", "adminUrl", "token", "executorName"], (res) => {
    if (res.jutawanResults) renderTable(res.jutawanResults);
    if (res.adminUrl) document.getElementById("adminUrl").value = res.adminUrl;
    if (res.token) document.getElementById("token").value = res.token;
    if (res.executorName) document.getElementById("executorName").value = res.executorName;
});

document.getElementById("startBtn").addEventListener("click", async () => {
    const adminUrl = document.getElementById("adminUrl").value.trim();
    const txDataRaw = document.getElementById("txData").value.trim();
    const startDate = document.getElementById("startDateInput").value;
    const endDate = document.getElementById("endDateInput").value;
    const status = document.getElementById("status");

    if (!txDataRaw || !adminUrl || !startDate || !endDate) {
        status.textContent = "⚠️ Lengkapi URL, Tanggal, dan Data Transaksi!";
        return;
    }

    const lines = txDataRaw.split('\n').filter(line => line.trim());
    const txQueue = lines.map(line => {
        const parts = line.split(/\s+/);
        return { 
            userId: parts[0], 
            transactionId: parts[1], 
            urlAdmin: adminUrl, 
            startDate, 
            endDate 
        };
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
        
        let statusLabel = "";
        let bgColor = "";

        // Logika Pengecekan Berdasarkan Angka
        if (win > 0 && bet > 0) {
            statusLabel = `✅ SESUAI (JP ${Math.floor(win/bet)}x)`;
            bgColor = "rgba(40, 167, 69, 0.25)"; 
        } else if (win > 0 && bet === 0) {
            statusLabel = "⚠️ WIN TANPA BET";
            bgColor = "rgba(255, 193, 7, 0.25)";
        } else {
            statusLabel = "❌ TIDAK SESUAI";
            bgColor = "rgba(220, 53, 69, 0.25)";
        }

        const row = document.createElement("tr");
        row.style.backgroundColor = bgColor;
        row.innerHTML = `
            <td>${item.userId}</td>
            <td>${item.transactionId}</td>
            <td>${item.betValue}</td>
            <td style="font-weight: bold;">${statusLabel}</td>
        `;
        tbody.appendChild(row);
    });
}

// Listener pesan dari background
chrome.runtime.onMessage.addListener(msg => {
    if (msg.action === "updateStatus") document.getElementById("status").textContent = msg.status;
});

// Listener perubahan storage untuk update tabel otomatis
chrome.storage.onChanged.addListener(changes => {
    if (changes.jutawanResults) renderTable(changes.jutawanResults.newValue);
});

// Fungsi Salin
document.getElementById("copyBtn").addEventListener("click", () => {
    if (latestResults.length === 0) return;
    const tsv = latestResults.map(i => `${i.userId}\t${i.transactionId}\t${i.betValue}\t${i.debetValue}`).join('\n');
    navigator.clipboard.writeText(tsv);
    document.getElementById("status").textContent = "📋 Data berhasil disalin!";
});

// Fungsi Hapus
document.getElementById("clearBtn").addEventListener("click", () => {
    chrome.storage.local.set({ jutawanResults: [], txQueue: [] }, () => {
        renderTable([]);
        document.getElementById("status").textContent = "🧹 Data dibersihkan.";
    });
});
