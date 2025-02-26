let htmlEditor, cssEditor, jsEditor;
let currentTab = 'html';

window.onload = function() {
    // Initialize editors
    htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), {
        mode: 'xml',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        tabSize: 2,
    });

    cssEditor = CodeMirror.fromTextArea(document.getElementById('cssEditor'), {
        mode: 'css',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        tabSize: 2,
    });

    jsEditor = CodeMirror.fromTextArea(document.getElementById('jsEditor'), {
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
        tabSize: 2,
        matchBrackets: true,
        indentUnit: 2,
        indentWithTabs: false,
        lint: true,
        gutters: ["CodeMirror-lint-markers"],
    });

    // Set initial content
    htmlEditor.setValue(`<!DOCTYPE html>\n<html>\n<head>\n    <title>My Web Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>`);
    cssEditor.setValue(`body {\n    margin: 0;\n    padding: 20px;\n    font-family: Arial, sans-serif;\n}`);
    jsEditor.setValue(`// Your JavaScript code here\nconsole.log('Hello from JavaScript!');`);

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const lang = tab.dataset.lang;
            switchEditor(lang);
        });
    });

    // File tree switching
    document.querySelectorAll('.file-tree .file').forEach(file => {
        file.addEventListener('click', () => {
            const fileName = file.textContent.trim().toLowerCase();
            let lang;
            if (fileName.includes('html')) lang = 'html';
            else if (fileName.includes('css')) lang = 'css';
            else if (fileName.includes('js')) lang = 'javascript';
            
            if (lang) switchEditor(lang);
        });
    });

    // Output tab switching
    document.querySelectorAll('.output-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const isConsole = tab.textContent.trim() === 'Console';
            switchOutputView(isConsole);
        });
    });

    // Update Run button handler
    document.getElementById('runBtn').addEventListener('click', () => {
        // Clear console
        document.getElementById('console').innerHTML = '';
        
        // Show "Running..." in console
        const consoleElement = document.getElementById('console');
        consoleElement.innerHTML = '<div class="console-message">Running...</div>';
        
        // Update preview with slight delay to show loading state
        setTimeout(() => {
            updatePreview();
            
            // Switch to console if there's any JavaScript code
            if (jsEditor.getValue().trim().length > 0) {
                switchOutputView(true);
            }
            
            // Add timestamp to console
            const timestamp = new Date().toLocaleTimeString();
            consoleElement.innerHTML += `<div class="console-message info">Code executed at ${timestamp}</div>`;
        }, 100);
    });

    // Initial setup
    loadFromLocalStorage();
    updatePreview();
    addPreviewControls();
};

function switchEditor(lang) {
    // Update tabs
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.lang === lang);
    });

    // Update editors
    document.querySelectorAll('.editor').forEach(e => e.classList.remove('active'));
    const containerId = `${lang}-container`;
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.add('active');
        // Refresh the appropriate editor
        requestAnimationFrame(() => {
            switch(lang) {
                case 'html':
                    htmlEditor.refresh();
                    break;
                case 'css':
                    cssEditor.refresh();
                    break;
                case 'javascript':
                    jsEditor.refresh();
                    break;
            }
        });
    }

    // Update file tree
    document.querySelectorAll('.file').forEach(f => {
        const fileName = f.textContent.trim().toLowerCase();
        let isActive = false;
        if (lang === 'html' && fileName.includes('html')) isActive = true;
        if (lang === 'css' && fileName.includes('css')) isActive = true;
        if (lang === 'javascript' && fileName.includes('js')) isActive = true;
        f.classList.toggle('active', isActive);
    });

    currentTab = lang;
}

// File management
const PROJECT_KEY = 'onecompiler_project';

function saveToLocalStorage() {
    const project = {
        html: htmlEditor.getValue(),
        css: cssEditor.getValue(),
        js: jsEditor.getValue(),
        lastModified: new Date().toISOString()
    };
    localStorage.setItem(PROJECT_KEY, JSON.stringify(project));
    showToast('Project saved successfully!');
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem(PROJECT_KEY);
    if (saved) {
        const project = JSON.parse(saved);
        htmlEditor.setValue(project.html);
        cssEditor.setValue(project.css);
        jsEditor.setValue(project.js);
        updatePreview();
    }
}

function createNewProject() {
    if (confirm('Create new project? Any unsaved changes will be lost.')) {
        htmlEditor.setValue(`<!DOCTYPE html>\n<html>\n<head>\n    <title>New Project</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>`);
        cssEditor.setValue(`body {\n    margin: 0;\n    padding: 20px;\n}`);
        jsEditor.setValue('// Your JavaScript code here');
        updatePreview();
        showToast('New project created!');
    }
}

function downloadProject() {
    const zip = new JSZip();
    zip.file('index.html', htmlEditor.getValue());
    zip.file('styles.css', cssEditor.getValue());
    zip.file('script.js', jsEditor.getValue());
    
    zip.generateAsync({type: 'blob'}).then(content => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'project.zip';
        a.click();
        URL.revokeObjectURL(url);
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Event Listeners
document.querySelector('.new-btn').addEventListener('click', createNewProject);
document.querySelector('.save-btn').addEventListener('click', saveToLocalStorage);
document.querySelector('.download-btn').addEventListener('click', downloadProject);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 's':
                e.preventDefault();
                saveToLocalStorage();
                break;
            case 'n':
                e.preventDefault();
                createNewProject();
                break;
        }
    }
});

function updatePreview() {
    const preview = document.getElementById('preview').contentWindow.document;
    const html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();
    
    // Only clear console if we're not currently viewing it
    const isConsoleActive = document.querySelector('.output-tab.active').textContent.trim() === 'Console';
    if (!isConsoleActive) {
        document.getElementById('console').innerHTML = '';
    }
    
    preview.open();
    preview.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>
                    // Redirect console to our custom console
                    (function(){
                        const console = {
                            log: function(...args) {
                                window.parent.postMessage({
                                    type: 'console',
                                    method: 'log',
                                    args: args
                                }, '*');
                            },
                            error: function(...args) {
                                window.parent.postMessage({
                                    type: 'console',
                                    method: 'error',
                                    args: args
                                }, '*');
                            }
                        };
                        window.console = console;
                        
                        // Catch errors
                        window.onerror = function(msg, url, line) {
                            window.parent.postMessage({
                                type: 'console',
                                method: 'error',
                                args: [\`Error: \${msg} (line \${line})\`]
                            }, '*');
                            return true;
                        };
                    })();
                    
                    // User's JavaScript code
                    ${js}
                </script>
            </body>
        </html>
    `);
    preview.close();
}

// Add message listener for console messages
window.addEventListener('message', function(event) {
    if (event.data.type === 'console') {
        const consoleElement = document.getElementById('console');
        const message = event.data.args.join(' ');
        const isError = event.data.method === 'error';
        
        const messageElement = document.createElement('div');
        messageElement.className = `console-message ${isError ? 'error' : ''}`;
        messageElement.textContent = message;
        consoleElement.appendChild(messageElement);
        consoleElement.scrollTop = consoleElement.scrollHeight;
    }
});

// Add preview controls
function addPreviewControls() {
    const previewContainer = document.querySelector('.output-section');
    const controls = document.createElement('div');
    controls.className = 'preview-controls';
    controls.innerHTML = `
        <button class="preview-control" id="togglePreview" title="Toggle Preview">
            <i class="fas fa-eye"></i>
        </button>
        <button class="preview-control" id="openPreview" title="Open in New Tab">
            <i class="fas fa-external-link-alt"></i>
        </button>
    `;
    previewContainer.querySelector('.output-tabs').appendChild(controls);

    // Toggle preview
    document.getElementById('togglePreview').addEventListener('click', () => {
        const outputSection = document.querySelector('.output-section');
        const previewIcon = document.querySelector('#togglePreview i');
        
        if (outputSection.classList.contains('minimized')) {
            outputSection.classList.remove('minimized');
            previewIcon.className = 'fas fa-eye';
        } else {
            outputSection.classList.add('minimized');
            previewIcon.className = 'fas fa-eye-slash';
        }
    });

    // Open in new tab
    document.getElementById('openPreview').addEventListener('click', () => {
        const newTab = window.open('', '_blank');
        const html = htmlEditor.getValue();
        const css = cssEditor.getValue();
        const js = jsEditor.getValue();
        
        newTab.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>${js}<\/script>
                </body>
            </html>
        `);
        newTab.document.close();
    });
}

// Add this new function
function switchOutputView(showConsole) {
    // Update tab active states
    document.querySelectorAll('.output-tab').forEach(tab => {
        const isConsole = tab.textContent.trim() === 'Console';
        tab.classList.toggle('active', isConsole === showConsole);
    });

    // Toggle visibility
    const preview = document.getElementById('preview');
    const console = document.getElementById('console');
    
    preview.style.display = showConsole ? 'none' : 'block';
    console.style.display = showConsole ? 'block' : 'none';

    // If showing console, make sure the output section is not minimized
    if (showConsole) {
        document.querySelector('.output-section').classList.remove('minimized');
    }
}
