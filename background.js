// background.js
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "startBatchProcess") processQueue();
});

async function processQueue() {
  let { txQueue, jutawanResults = [] } = await chrome.storage.local.get(['txQueue', 'jutawanResults']);
  if (!txQueue || txQueue.length === 0) return;

  const task = txQueue.shift();
  chrome.runtime.sendMessage({ action: "updateStatus", status: `Mengecek ${task.userId}...` });

  try {
    const resp = await fetch(`${task.adminUrl}?userId=${task.userId}&transactionId=${task.transactionId}&startDate=${task.startDate}&endDate=${task.endDate}`);
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Mencari baris yang ID transaksinya cocok
    const rows = doc.querySelectorAll('.transaction-record-table tbody tr');
    let found = { userId: task.userId, transactionId: task.transactionId, betValue: "0", debetValue: "0" };

    rows.forEach(row => {
      const idDiTabel = row.querySelector('[data-changekey="keteranganId"]')?.innerText.trim();
      if (idDiTabel === task.transactionId) {
        found.betValue = row.querySelector('[data-changekey="kredit"]')?.innerText.trim() || "0";
        found.debetValue = row.querySelector('[data-changekey="debet"]')?.innerText.trim() || "0";
      }
    });

    jutawanResults.push(found);
    await chrome.storage.local.set({ txQueue, jutawanResults });
    setTimeout(processQueue, 1000); // Jeda 1 detik
  } catch (e) {
    setTimeout(processQueue, 2000);
  }
}
