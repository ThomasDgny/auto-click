import React from "react";
import './popup.css';

const Popup = () => {
  const handleClick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'startClicking' });
      console.log("📨 Message sent: startClicking");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-2 text-green-600">Auto Click</h1>
      <button
        onClick={handleClick}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        Select Random Location
      </button>
    </div>
  );
};

export default Popup;
