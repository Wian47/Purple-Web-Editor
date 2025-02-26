// Initialize the CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    lineNumbers: true,
    mode: "javascript",
    theme: "default",
    autoCloseBrackets: true,
    matchBrackets: true
  });
  
  // Handle theme switching
  document.getElementById("themeSwitcher").addEventListener("change", (event) => {
    const theme = event.target.value;
    editor.setOption("theme", theme);
  });
  
  // Handle language mode switching
  document.getElementById("modeSwitcher").addEventListener("change", (event) => {
    const mode = event.target.value;
    editor.setOption("mode", mode);
  });
  
  // Save the current code to localStorage
  document.getElementById("saveBtn").addEventListener("click", () => {
    const codeContent = editor.getValue();
    localStorage.setItem("savedCode", codeContent);
    alert("Code saved!");
  });
  
  // Load saved code on startup, if available
  window.addEventListener("load", () => {
    const savedCode = localStorage.getItem("savedCode");
    if (savedCode) {
      editor.setValue(savedCode);
    }
  });