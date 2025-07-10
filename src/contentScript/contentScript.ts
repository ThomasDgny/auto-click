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


function waitForNoSpinner(selector = '.spinner', timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const spinner = document.querySelector(selector);
      const isVisible = spinner && getComputedStyle(spinner).display !== 'none';
      if (!spinner || !isVisible) {
        resolve();
      } else if (Date.now() - start > timeout) {
        reject("⏳ Timeout: Spinner still present after 10s");
      } else {
        setTimeout(check, 200);
      }
    };

    check();
  });
}


async function selectClosestAvailableDate() {
  try {
    console.log("📅 Waiting for calendar to fully load...");

    // Wait until calendar container is visible
    await waitForSelector('.mat-calendar-body');

    // Wait until spinner disappears
    await waitForNoSpinner(); // ⏳

    console.log("✅ Calendar ready, scanning dates...");

    const allCells = Array.from(document.querySelectorAll('.mat-calendar-body-cell')) as HTMLElement[];
    console.log(`📦 Total calendar cells found: ${allCells.length}`);

    const available = allCells
      .filter(cell => !cell.hasAttribute('aria-disabled')) // ✅ Keep only available dates
      .map(cell => {
        const label = cell.getAttribute('aria-label');
        const date = label ? new Date(label) : null;
        return { el: cell, date };
      })
      .filter(entry => entry.date !== null)
      .sort((a, b) => a.date!.getTime() - b.date!.getTime());

    if (available.length === 0) {
      console.warn("⚠️ No valid dates found.");
      return;
    }

    available[0].el.click();
    console.log("✅ Closest available date selected:", available[0].date!.toDateString());

  } catch (error) {
    console.error("❌ Failed to select calendar date:", error);
  }
}







async function runAutomationFlow() {
    await selectLocationDropdown();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await selectVisaTypeDropdown();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await selectClosestAvailableDate();
}
