import React, { useState } from "react";
import './popup.css';

const locations = [
  "Al. Jerozolimskie 28, 00-024 Warszawa",
  "pl. Bankowy 3/5 00-950 Warszawa",
  "ul. Marszałkowska 3/5, 00-624 Warszawa",
];

const Popup = () => {
  const [selectedLocation, setSelectedLocation] = useState("");

  const sendMessageToTab = async (message: object) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, message);
      console.log("📨 Message sent:", message);
    }
  };

  const handleStartClicking = () => {
    const locationToSend = selectedLocation || "RANDOM";
    sendMessageToTab({ type: "startClicking", location: locationToSend });
  };

  return (
    <div className="min-w-[270px] bg-white shadow-lg rounded-xl p-4">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Visa Auto Picker</h1>

      <label className="block text-gray-700 text-sm font-medium mb-1">
        Select location
      </label>
      <select
        className="w-full p-2 border border-gray-300 rounded mb-4 text-sm"
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
      >
        {locations.map((loc, idx) => (
          <option key={idx} value={loc}>
            {loc || "-- Pick a location --"}
          </option>
        ))}
      </select>

      <button
        onClick={handleStartClicking}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition"
      >
        Start Automation
      </button>
    </div>
  );
};

export default Popup;
