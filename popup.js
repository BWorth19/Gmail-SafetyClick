document.addEventListener('DOMContentLoaded', function() {
  // Function to handle the checkLinks result in the popup
  function handleCheckLinksResult(result) {
    // Replace this with your actual code to handle the result
    console.log('Received checkLinks result in popup:', result);
    // Update the popup UI or take other actions based on the result
  }

  // Add an event listener to handle messages from the content script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Check if the message is coming from your content script and has the expected action
    if (sender.tab && request.action === 'checkLinksResult') {
      // Handle the results received from the content script
      const result = request.result;
      handleCheckLinksResult(result);
    }
  });

  // Function to send a message to the content script to initiate link checking
  function requestCheckLinks() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'checkLinks' });
    });
  }

  // Add an event listener to the button click to initiate link checking
  document.getElementById('checkLinksBtn').addEventListener('click', function() {
    // Request link checking when the button is clicked
    requestCheckLinks();
  });
});


