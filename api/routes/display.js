//topic

const express = require('express');
const router = express.Router();


router.post("display", (req, res) => {
  const { heading, sender, receiver, datetime, fullText } = req.body;
 
  const safeHeading = heading || "No Heading";
  const safeText = fullText || "No Message";
  const safeSender = sender || "Unknown Sender";
  const safeReceiver = receiver || "Unknown Receiver";
  const safeDatetime = datetime || new Date().toLocaleString();
 
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>World Talk</title>
      <style>
        :root {
          --bg-color: #f9f9f9;
          --text-color: #000;
          --container-bg: #fff;
        }
        body.dark {
          --bg-color: #121212;
          --text-color: #f1f1f1;
          --container-bg: #1e1e1e;
        }
        body {
          background-color: var(--bg-color);
          color: var(--text-color);
          font-family: sans-serif;
          margin: 0;
          padding: 0;
          transition: background-color 0.3s, color 0.3s;
        }
        .appbar {
          background-color: var(--container-bg);
          color: white;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .appbar h1 {
          color: var(--text-color);
          margin: 0;
          font-size: 20px;
        }
        .actions {
          display: flex;
          gap: 10px;
        }
        .actions button {
          background: var(--container-bg);
          color: var(--text-color);
          border: 1px solid var(--text-color);
          border-radius: 20px;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        .actions button:hover {
          background: #e0e0e0;
          color: #000;
        }
        .container {
          max-width: 800px;
          margin: 30px auto;
          background: var(--container-bg);
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          white-space: pre-wrap;
        }
        h2 {
          text-align: center;
          margin-bottom: 10px;
        }
        .meta {
          font-size: 14px;
          color: gray;
          text-align: center;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
        }
        .copy-alert {
          position: fixed;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          background: #4caf50;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          display: none;
          font-size: 14px;
          z-index: 1000;
        }
      </style>
      <script src="https://unpkg.com/monaco-editor@latest/min/vs/loader.js"></script>
    </head>
    <body>
      <div class="appbar">
        <h1>WorldTalk</h1>
        <div class="actions">
          <button onclick="copyMessage()">📋 Copy</button>
          <button onclick="downloadMessage()">⬇️ Download</button>
          <button onclick="toggleTheme()">🌗 Theme</button>
          <button onclick="toggleEditor()" id="editBtn">✏️ Edit</button>
          <button onclick="shareMessage()">🔗 Share</button>
        </div>
      </div>
 
      <div class="copy-alert" id="copyAlert">Copied!</div>
 
      <div class="container">
        <h2 id="heading">${safeHeading}</h2>
        <div class="meta" id="details">From: ${safeSender} | To: ${safeReceiver} | Sent: ${safeDatetime}</div>
        <div class="message" id="output">${safeText
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</div>
        <div id="editorContainer" style="height: 300px; width: 100%; display: none; border: 1px solid gray; margin-top: 20px;"></div>
      </div>
 
      <script>
        function toggleTheme() {
          const isNowDark = document.body.classList.toggle('dark');
          if (window.monaco) {
            const newTheme = isNowDark ? 'custom-light' : 'custom-dark';
            monaco.editor.setTheme(newTheme);
          }
        }
 
        function copyMessage() {
          const message = document.getElementById('output').textContent;
          navigator.clipboard.writeText(message).then(() => {
            const alert = document.getElementById('copyAlert');
            alert.style.display = 'block';
            setTimeout(() => alert.style.display = 'none', 1500);
          });
        }
 
        function downloadMessage() {
          const message = document.getElementById('output').textContent;
          const blob = new Blob([message], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'message.txt';
          a.click();
          URL.revokeObjectURL(url);
        }
 
        function shareMessage() {
          const message = document.getElementById('output').textContent;
          const heading = document.getElementById('heading').textContent;
          const details = document.getElementById('details').textContent;
          const fullMessage = \`\${heading}\\n\${details}\\n\\n\${message}\`;
 
          if (navigator.share) {
            navigator.share({ title: heading, text: fullMessage })
              .catch(err => console.log('Share failed:', err));
          } else {
            alert('Sharing is not supported on this browser.');
          }
        }
 
        let editorInstance;
        let editorLoaded = false;
 
        function toggleEditor() {
          const output = document.getElementById('output');
          const container = document.getElementById('editorContainer');
          const btn = document.getElementById('editBtn');
 
          if (!editorLoaded) {
            require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
            require(['vs/editor/editor.main'], function () {
              monaco.editor.defineTheme('custom-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: { 'editor.background': '#1e1e1e' }
              });
              monaco.editor.defineTheme('custom-light', {
                base: 'vs',
                inherit: true,
                rules: [],
                colors: { 'editor.background': '#ffffff' }
              });
 
              const isDark = document.body.classList.contains('dark');
              const activeTheme = isDark ? 'custom-light' : 'custom-dark';
 
              editorInstance = monaco.editor.create(container, {
                value: output.innerText,
                language: 'markdown',
                theme: activeTheme,
                automaticLayout: true,
                wordWrap: 'on'
              });
 
              editorLoaded = true;
              output.style.display = 'none';
              container.style.display = 'block';
              btn.textContent = '💾 Save';
            });
          } else {
            if (container.style.display === 'none') {
              output.style.display = 'none';
              container.style.display = 'block';
              btn.textContent = '💾 Save';
            } else {
              output.textContent = editorInstance.getValue();
              container.style.display = 'none';
              output.style.display = 'block';
              btn.textContent = '✏️ Edit';
            }
          }
        }
      </script>
    </body>
    </html>
  `);
});



module.exports = router;