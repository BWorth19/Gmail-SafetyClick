chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'checkLinks') {
    const userId = getUserId(); // Implement getUserId() function
    const messageId = getMessageId(); // Implement getMessageId() function
    const hyperlinks = getHyperlinks(); // Implement getHyperlinks() function

    checkSafety(userId, messageId, hyperlinks);
  }
});

async function getUserId() {
  try {
    // Get the user's access token from Chrome storage
    const accessToken = await getAccessToken();

    // Make a request to the Gmail API to get the user's profile
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();

    if (data && data.emailAddress) {
      return data.emailAddress;
    } else {
      console.error('Failed to get user ID from Gmail API');
      return null;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

// Helper function to get access token from Chrome storage
async function getAccessToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['ya29.a0AfB_byAXdkL4-CzEaBXH-p_irXOS_xqF__Z98Gx151pdwGTjSKOJ3sxwCN4dg7MTOKqX346NgOrhuwILbeBZoh2_gqDKZJsrGKhvENzxiV7JHNTd0P3wMMFpv1jHp_ibdmllNlKxkWrimzhp_T2AXvhdl3ye9x9Xbt6caCgYKAUcSARASFQHGX2MiPD6xl9Je5FZaCpcvcn-2QQ0171'], (result) => {
      resolve(result.accessToken);
    });
  });
}

async function getMessageId() {
  try {
    // Retrieve the current active tab URL
    const tabUrl = await getCurrentTabUrl();

    // Extract the message ID from the URL
    const messageId = extractMessageId(tabUrl);

    if (messageId) {
      return messageId;
    } else {
      console.error('Failed to get message ID from current Gmail tab');
      return null;
    }
  } catch (error) {
    console.error('Error getting message ID:', error);
    return null;
  }
}

// Helper function to get the current active tab URL
async function getCurrentTabUrl() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].url);
    });
  });
}

// Helper function to extract message ID from Gmail URL
function extractMessageId(url) {
  // Example: https://mail.google.com/mail/u/0/#inbox/abc123def456
  const match = url.match(/#inbox\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

function extractHyperlinks() {
  try {
    // Find the email body element
    const emailBodyElement = document.querySelector('div[role="listitem"] div[dir="ltr"]');

    // Check if the email body element is found
    if (emailBodyElement) {
      // Extract hyperlinks from the email body
      const hyperlinks = Array.from(emailBodyElement.querySelectorAll('a')).map(link => link.href);
      return hyperlinks;
    } else {
      console.error('Failed to find the email body element in the current Gmail tab');
      return [];
    }
  } catch (error) {
    console.error('Error extracting hyperlinks:', error);
    return [];
  }
}

async function checkSafety(userId, messageId, hyperlinks) {
  try {
    const safeBrowsingApiKey = 'AIzaSyBDS45kOQ95o0SXnSp1foIytNYjLWxWgig';

    const results = await Promise.all(
      hyperlinks.map(async (link) => {
        const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${safeBrowsingApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client: {
              clientId: userId,
              clientVersion: '1.0.0',
            },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url: link }],
            },
          }),
        });

        const data = await response.json();

        return {
          link,
          safe: !data.matches || data.matches.length === 0,
        };
      })
    );

    // Handle the safety results
    handleSafetyResults(results);
  } catch (error) {
    console.error('Error checking link safety:', error);
  }
}

// Function to handle the safety results
function handleSafetyResults(results) {
  // Example: Display a notification for each unsafe link
  results.forEach((result) => {
    if (!result.safe) {
      const checkLinksResult = showUnsafeLinkNotification(result.link);
    }
    else
    {
        const checkLinksResult = alert("Link is safe!");
    }
    chrome.runtime.sendMessage({ action: 'checkLinksResult', result: checkLinksResult });
  });

  // Example: Update the extension's UI based on the results
  updateExtensionUI(results);
}

// Function to display a notification for an unsafe link
function showUnsafeLinkNotification(link) {
  // Implement your logic to display a notification to the user
  console.log(`Unsafe link detected: ${link}`);
}

// Function to update the extension's UI based on the safety results
function updateExtensionUI(results) {
  // Implement your logic to update the extension's UI
  console.log('Updating extension UI:', results);
}
