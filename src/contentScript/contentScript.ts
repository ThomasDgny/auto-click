console.log("👋 Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'startClicking') {
    console.log("🟢 Received 'startClicking' message");
    runAutomationFlow();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'startTest') {
    console.log("🟢 Received 'startTest' message");
    selectFirstAvailableHour()
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


async function selectLatestDateInNextMonth() {
  try {
    console.log("📅 Moving to next month...");

    // Wait for the calendar and "Next Month" button
    await waitForSelector('.mat-calendar-body');
    const nextMonthBtn = await waitForSelector('.mat-calendar-next-button') as HTMLElement;

    // Click next month
    nextMonthBtn.click();
    console.log("➡️ Clicked next month");

    // Wait for spinner to disappear and calendar to update
    await waitForNoSpinner();
    await new Promise(res => setTimeout(res, 500)); // small buffer

    console.log("✅ Calendar updated, scanning for latest date...");

    const allCells = Array.from(document.querySelectorAll('.mat-calendar-body-cell')) as HTMLElement[];

    const available = allCells
      .filter(cell => !cell.hasAttribute('aria-disabled'))
      .map(cell => {
        const label = cell.getAttribute('aria-label');
        const date = label ? new Date(label) : null;
        return { el: cell, date };
      })
      .filter(entry => entry.date !== null)
      .sort((a, b) => b.date!.getTime() - a.date!.getTime()); // sort descending

    if (available.length === 0) {
      console.warn("⚠️ No valid dates found in next month.");
      return;
    }

    // Click the latest available date
    available[0].el.click();
    console.log("✅ Latest available date selected:", available[0].date!.toDateString());

  } catch (error) {
    console.error("❌ Failed to select date in next month:", error);
  }
}



async function selectFirstAvailableHour() {
  try {
    console.log("⏳ Waiting for available hours...");

    await waitForSelector('.tiles__link');

    // Wait until spinner disappears
    await waitForNoSpinner(); // ⏳

    const hourButtons = Array.from(document.querySelectorAll('.tiles__link')) as HTMLButtonElement[];

    if (hourButtons.length === 0) {
      console.warn("⚠️ No available hours found.");
      return;
    }

    simulateClick(hourButtons[0]);
    console.log("✅ Simulated click on time slot:", hourButtons[0].innerText.trim());

  } catch (error) {
    console.error("❌ Failed to select time slot:", error);
  }
}

function simulateClick(el: HTMLElement) {
  el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}




async function runAutomationFlow() {
  await selectLocationDropdown();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await selectVisaTypeDropdown();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await selectLatestDateInNextMonth();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await selectFirstAvailableHour();
  console.log("✅ Automation flow completed");
}
