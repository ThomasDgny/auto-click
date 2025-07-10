console.log("👋 Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'startClicking') {
    console.log("🟢 Received 'startClicking' message");
    runAutomationFlow();
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

async function selectLocationDropdown() {
  try {
    const arrow = await waitForSelector('.mat-select-arrow-wrapper') as HTMLElement;
    arrow.click();
    console.log("✅ Location dropdown opened");

    await new Promise(resolve => setTimeout(resolve, 500));

    const options = Array.from(document.querySelectorAll('.mat-option:not([aria-disabled="true"])')) as HTMLElement[];
    const validOptions = options.filter(opt => opt.innerText.trim() !== '-');

    if (validOptions.length === 0) {
      console.warn("⚠️ No valid locations");
      return;
    }

    const randomOption = validOptions[Math.floor(Math.random() * validOptions.length)];
    randomOption.click();
    console.log("✅ Location selected:", randomOption.innerText.trim());
  } catch (err) {
    console.error("❌ Failed in selectLocationDropdown:", err);
  }
}

async function selectVisaTypeDropdown() {
  try {
    // Get all select dropdown arrows (usually two: location + visa type)
    const arrows = Array.from(document.querySelectorAll('.mat-select-arrow-wrapper')) as HTMLElement[];

    if (arrows.length < 2) {
      throw new Error("Visa type dropdown arrow not found");
    }

    const visaArrow = arrows[1]; // second dropdown
    visaArrow.click();
    console.log("✅ Visa type dropdown opened");

    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter valid visa options (exclude "-")
    const options = Array.from(document.querySelectorAll('.mat-option:not([aria-disabled="true"])')) as HTMLElement[];
    const validOptions = options.filter(opt => opt.innerText.trim() !== '-');

    if (validOptions.length === 0) {
      console.warn("⚠️ No valid visa types");
      return;
    }

    validOptions[0].click();
    console.log("✅ Visa type selected:", validOptions[0].innerText.trim());
  } catch (err) {
    console.error("❌ Failed in selectVisaTypeDropdown:", err);
  }
}


async function runAutomationFlow() {
  await selectLocationDropdown();
  await new Promise(resolve => setTimeout(resolve, 1000)); // wait before next dropdown
  await selectVisaTypeDropdown();
}
