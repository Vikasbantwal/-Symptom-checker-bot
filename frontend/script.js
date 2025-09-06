const messagesEl = document.getElementById("messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const suggestionsEl = document.getElementById("suggestions");

// Sample disease + symptom suggestions
const allSuggestions = [
  "Fever", "Cough", "Headache", "Sore throat", "Fatigue",
  "Cold", "Flu", "Asthma", "Diabetes", "High Blood Pressure",
  "Stomach Pain", "Chest Pain", "Back Pain", "Anxiety", "Depression"
];

// Append message to chat
function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${sender}`;
  msg.innerText = `${sender === "user" ? "You" : "Bot"}: ${text}`;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Send message
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";
  sendBtn.disabled = true;
  suggestionsEl.classList.add("hidden");

  const typingEl = document.createElement("div");
  typingEl.className = "msg bot";
  typingEl.innerText = "Bot is thinking...";
  messagesEl.appendChild(typingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const res = await fetch("http://localhost:5003/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    typingEl.remove();

    if (res.ok) {
      appendMessage("bot", data.reply);
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

// Show suggestions (default + filtered)
function showSuggestions() {
  const query = userInput.value.toLowerCase();
  suggestionsEl.innerHTML = "";

  let filtered = allSuggestions.filter(item =>
    item.toLowerCase().includes(query)
  );

  if (filtered.length === 0 && query.length > 0) {
    suggestionsEl.classList.add("hidden");
    return;
  }

  filtered.forEach(suggestion => {
    const btn = document.createElement("button");
    btn.innerText = suggestion;
    btn.addEventListener("click", () => {
      userInput.value = suggestion;
      suggestionsEl.classList.add("hidden");
      userInput.focus();
    });
    suggestionsEl.appendChild(btn);
  });

  suggestionsEl.classList.remove("hidden");
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("input", showSuggestions);
userInput.addEventListener("focus", showSuggestions); // show when focused
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Show default suggestions immediately on load
window.addEventListener("DOMContentLoaded", showSuggestions);
