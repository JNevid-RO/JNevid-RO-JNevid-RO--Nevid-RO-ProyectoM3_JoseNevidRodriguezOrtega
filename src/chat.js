const STORAGE_KEY = "spa-chat-history";
let messages = [];

export function loadSessionMessages() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    messages = saved ? JSON.parse(saved) : [];
  } catch (error) {
    messages = [];
  }

  return messages;
}

export function saveSessionMessages() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function addMessage(text, sender) {
  if (!text) return;

  messages.push({
    text: text.toString(),
    sender,
    createdAt: new Date().toISOString()
  });

  saveSessionMessages();
}

export function getMessages() {
  return messages;
}

export function clearMessages() {
  messages = [];
  saveSessionMessages();
}
