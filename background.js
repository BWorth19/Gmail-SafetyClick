chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'checkLinks') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      function: () => {
        alert('Links are being checked. This is a placeholder message.');
      }
    });
  }
});
