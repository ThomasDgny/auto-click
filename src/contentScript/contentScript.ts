console.log("👋 Content script loaded");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'startClicking') {
    console.log("🟢 Received 'startClicking' message");
    selectRandomLocation();
  }
});

function waitForSelector(selector: string, timeout = 10000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(`Timeout: ${selector} not found`);
      }
    }, 300);
  });
}

async function selectRandomLocation() {
  try {
    const dropdownArrow = await waitForSelector('.mat-select-arrow-wrapper') as HTMLElement;
    dropdownArrow.click();
    console.log("✅ Dropdown clicked");

    await new Promise(resolve => setTimeout(resolve, 500));

    const options = Array.from(document.querySelectorAll('.mat-option:not([aria-disabled="true"])')) as HTMLElement[];
    if (options.length === 0) {
      console.warn("⚠️ No options available");
      return;
    }

    const randomOption = options[Math.floor(Math.random() * options.length)];
    randomOption.click();
    console.log("✅ Location selected:", randomOption.innerText.trim());
  } catch (err) {
    console.error("❌ Failed to select location:", err);
  }
}
