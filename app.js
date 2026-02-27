const libraryEl = document.getElementById('blockLibrary');
const workspaceEl = document.getElementById('workspace');
const codeViewEl = document.getElementById('codeView');
const outputEl = document.getElementById('output');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const customBlockForm = document.getElementById('customBlockForm');
const tabs = [...document.querySelectorAll('.tab')];

class WasmRunner {
  async run(language, sourceCode) {
    return `WASM hook ready for ${language}:\n${sourceCode}`;
  }
}

const wasmRunner = new WasmRunner();

const blockTemplates = [
  {
    id: crypto.randomUUID(),
    label: 'print() message',
    runtime: "log('Hello from block');",
    lines: {
      python: "print('Hello from block')",
      cpp: 'std::cout << "Hello from block" << std::endl;',
      lua: "print('Hello from block')",
      rust: 'println!("Hello from block");'
    }
  },
  {
    id: crypto.randomUUID(),
    label: 'set score',
    runtime: 'state.score = 10; log(`score = ${state.score}`);',
    lines: {
      python: 'score = 10',
      cpp: 'int score = 10;',
      lua: 'score = 10',
      rust: 'let mut score = 10;'
    }
  },
  {
    id: crypto.randomUUID(),
    label: 'repeat 5 times',
    runtime: "for (let i = 0; i < 5; i++) log(`tick ${i}`);",
    lines: {
      python: 'for i in range(5):',
      cpp: 'for (int i = 0; i < 5; i++) { }',
      lua: 'for i=1,5 do end',
      rust: 'for i in 0..5 { }'
    }
  }
];

const workspace = [];
let currentLang = 'python';

function renderLibrary() {
  libraryEl.innerHTML = '';
  blockTemplates.forEach((block) => {
    const el = document.createElement('button');
    el.className = 'block';
    el.textContent = block.label;
    el.addEventListener('click', () => addToWorkspace(block));
    libraryEl.appendChild(el);
  });
}

function addToWorkspace(template) {
  const copy = structuredClone(template);
  copy.id = crypto.randomUUID();
  workspace.push(copy);
  renderWorkspace();
}

function removeFromWorkspace(id) {
  const index = workspace.findIndex((b) => b.id === id);
  if (index !== -1) {
    workspace.splice(index, 1);
    renderWorkspace();
  }
}

function renderWorkspace() {
  workspaceEl.innerHTML = '';

  workspace.forEach((block) => {
    const row = document.createElement('div');
    row.className = 'block workspace-block';

    const title = document.createElement('strong');
    title.textContent = block.label;

    const lineInput = document.createElement('input');
    lineInput.value = block.lines[currentLang] || '';
    lineInput.title = `Edit ${currentLang} line`;
    lineInput.addEventListener('input', (event) => {
      block.lines[currentLang] = event.target.value;
      renderCode();
    });

    const runtimeInput = document.createElement('input');
    runtimeInput.value = block.runtime;
    runtimeInput.title = 'Runtime behavior (JavaScript core)';
    runtimeInput.addEventListener('input', (event) => {
      block.runtime = event.target.value;
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'remove';
    removeBtn.addEventListener('click', () => removeFromWorkspace(block.id));

    row.append(title, lineInput, runtimeInput, removeBtn);
    workspaceEl.appendChild(row);
  });

  renderCode();
}

function renderCode() {
  const lines = ['# when green flag clicked'];
  workspace.forEach((block) => lines.push(block.lines[currentLang] || ''));
  codeViewEl.textContent = lines.join('\n');
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentLang = tab.dataset.lang;
    renderWorkspace();
  });
});

customBlockForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const byId = (id) => document.getElementById(id).value.trim();

  const block = {
    id: crypto.randomUUID(),
    label: byId('customLabel'),
    runtime: byId('customJs'),
    lines: {
      python: byId('customPy') || '# custom python line',
      cpp: byId('customCpp') || '// custom c++ line',
      lua: byId('customLua') || '-- custom lua line',
      rust: byId('customRust') || '// custom rust line'
    }
  };

  blockTemplates.push(block);
  customBlockForm.reset();
  renderLibrary();
});

runBtn.addEventListener('click', async () => {
  const logs = [];
  const state = {};
  const log = (message) => logs.push(String(message));

  for (const block of workspace) {
    try {
      Function('state', 'log', block.runtime)(state, log);
    } catch (error) {
      logs.push(`Runtime error in "${block.label}": ${error.message}`);
      break;
    }
  }

  const mappedCode = ['# when green flag clicked', ...workspace.map((b) => b.lines[currentLang] || '')].join('\n');
  const wasmStatus = await wasmRunner.run(currentLang, mappedCode);

  outputEl.textContent = `${logs.join('\n') || '(no runtime output)'}\n\n${wasmStatus}`;
});

clearBtn.addEventListener('click', () => {
  workspace.length = 0;
  renderWorkspace();
  outputEl.textContent = 'Program output will appear here.';
});

renderLibrary();
renderWorkspace();
