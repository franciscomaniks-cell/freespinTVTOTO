// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startBatchProcess") {
        processQueue();
        sendResponse({ status: "batchStarted" });
    }
    return true;
});

async function processQueue() {
    let { txQueue, jutawanResults = [] } = await chrome.storage.local.get(['txQueue', 'jutawanResults']);

    if (!txQueue || txQueue.length === 0) {
        chrome.runtime.sendMessage({ action: "updateStatus", status: "🏁 Antrian Selesai." });
        return;
    }

    const task = txQueue.shift();
    chrome.runtime.sendMessage({ action: "updateStatus", status: `🔍 Mengecek: ${task.userId}...` });

    try {
        // Setup URL pencarian sesuai form HTML admin
        const searchParams = new URLSearchParams({
            userId: task.userId,
            startDate: task.startDate,
            endDate: task.endDate,
            transactionId: task.transactionId
        });

        const response = await fetch(`${task.urlAdmin}?${searchParams.toString()}`);
        const htmlText = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const rows = doc.querySelectorAll('.transaction-record-table tbody tr');
        
        let foundData = {
            userId: task.userId,
            transactionId: task.transactionId,
            betValue: "0",
            debetValue: "0",
            scatterTitle: "Data Tidak Ditemukan"
        };

        rows.forEach(row => {
            const rowTxId = row.querySelector('[data-changekey="keteranganId"]')?.innerText.trim();
            if (rowTxId === task.transactionId) {
                foundData.betValue = row.querySelector('[data-changekey="kredit"]')?.innerText.trim() || "0";
                foundData.debetValue = row.querySelector('[data-changekey="debet"]')?.innerText.trim() || "0";
                foundData.scatterTitle = row.querySelector('[data-changekey="keterangan"]')?.innerText.trim() || "Selesai";
            }
        });

        jutawanResults.push(foundData);
        await chrome.storage.local.set({ txQueue, jutawanResults });
        
        // Jeda 1 detik agar tidak spam server
        setTimeout(processQueue, 1000);

    } catch (error) {
        console.error("Error:", error);
        setTimeout(processQueue, 2000);
    }
}
