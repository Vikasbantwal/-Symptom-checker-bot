const messagesEl = document.getElementById("messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const mapFrame = document.getElementById("mapFrame");
const suggestionsEl = document.getElementById("suggestions");

// Symptom → Hospital mapping (Mangalore only)
const hospitalMap = {
  "chest pain": { name: "Indiana Hospital & Heart Institute", address: "Pumpwell, Mangalore", lat: 12.8708, lng: 74.8565 },
  "heart attack": { name: "Indiana Hospital & Heart Institute", address: "Pumpwell, Mangalore", lat: 12.8708, lng: 74.8565 },
  "fever": { name: "KMC Hospital", address: "Ambedkar Circle, Mangalore", lat: 12.8792, lng: 74.8426 },
  "infection": { name: "KMC Hospital", address: "Ambedkar Circle, Mangalore", lat: 12.8792, lng: 74.8426 },
  "accident": { name: "AJ Hospital & Research Centre", address: "NH-66, Kuntikana, Mangalore", lat: 12.9141, lng: 74.8560 },
  "trauma": { name: "AJ Hospital & Research Centre", address: "NH-66, Kuntikana, Mangalore", lat: 12.9141, lng: 74.8560 },
  "cancer": { name: "Yenepoya Hospital", address: "Thokkottu, Deralakatte, Mangalore", lat: 12.8206, lng: 74.8570 },
  "tumor": { name: "Yenepoya Hospital", address: "Thokkottu, Deralakatte, Mangalore", lat: 12.8206, lng: 74.8570 },
  "surgery": { name: "Father Muller Medical College Hospital", address: "Kankanady, Mangalore", lat: 12.8531, lng: 74.8609 },
  "general": { name: "Father Muller Medical College Hospital", address: "Kankanady, Mangalore", lat: 12.8531, lng: 74.8609 }
};

const allSuggestions = Object.keys(hospitalMap);

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${sender}`;
  msg.innerText = `${sender === "user" ? "You" : "Bot"}: ${text}`;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";
  sendBtn.disabled = true;

  const typingEl = document.createElement("div");
  typingEl.className = "msg bot";
  typingEl.innerText = "Bot is thinking...";
  messagesEl.appendChild(typingEl);

  try {
    // 1) Get AI reply first
    const res = await fetch("http://localhost:5003/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    typingEl.remove();

    if (res.ok) {
      appendMessage("bot", data.reply);

      // 2) After AI reply, suggest hospital
      showHospital(text);
    } else {
      appendMessage("bot", "Error: " + data.error);
    }
  } catch (err) {
    typingEl.remove();
    appendMessage("bot", "⚠️ Could not reach server.");
  } finally {
    sendBtn.disabled = false;
  }
}

function showHospital(symptom) {
  const hospital = hospitalMap[symptom.toLowerCase()];
  if (hospital) {
    appendMessage("bot", `🏥 Suggested Hospital:\n${hospital.name}\n📍 ${hospital.address}`);
    mapFrame.style.display = "block";
    mapFrame.src = `https://www.google.com/maps?q=${hospital.lat},${hospital.lng}&z=15&output=embed`;
  } else {
    mapFrame.style.display = "none";
  }
}

function showSuggestions() {
  const query = userInput.value.toLowerCase();
  suggestionsEl.innerHTML = "";
  const filtered = allSuggestions.filter(item => item.includes(query));
  filtered.forEach(suggestion => {
    const btn = document.createElement("button");
    btn.innerText = suggestion;
    btn.addEventListener("click", () => {
      userInput.value = suggestion;
      suggestionsEl.innerHTML = "";
      sendMessage();
    });
    suggestionsEl.appendChild(btn);
  });
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("input", showSuggestions);
userInput.addEventListener("focus", showSuggestions);
userInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

// Show default suggestions on load
window.addEventListener("DOMContentLoaded", () => {
  allSuggestions.forEach(s => {
    const btn = document.createElement("button");
    btn.innerText = s;
    btn.addEventListener("click", () => {
      userInput.value = s;
      suggestionsEl.innerHTML = "";
      sendMessage();
    });
    suggestionsEl.appendChild(btn);
  });
});
