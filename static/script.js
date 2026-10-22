const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const fileInput = document.getElementById('image-input');
const attachButton = document.getElementById('attach-button');
const fileName = document.getElementById('file-name');
const sendButton = document.getElementById('send-button');
const messages = document.getElementById('chat-messages');

attachButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files.length ? `Đã chọn: ${fileInput.files[0].name}` : 'PNG, JPG hoặc WebP · tối đa 10 MB';
});

function resizeInput() {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 130)}px`;
}
input.addEventListener('input', resizeInput);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
form.addEventListener('submit', () => {
  sendButton.disabled = true;
  sendButton.querySelector('span').textContent = 'Đang quét';
});
if (messages) messages.scrollTop = messages.scrollHeight;
input.focus();
