import { defineGameBlocks } from './blocks.js';
import { generateJavaScript } from './generators/javascript.js';
import { generatePython } from './generators/python.js';
import { generateCpp } from './generators/cpp.js';

defineGameBlocks(Blockly);

const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  trashcan: true,
  renderer: 'zelos',
  grid: {
    spacing: 24,
    length: 3,
    colour: '#3f4760',
    snap: true,
  },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.95,
    maxScale: 2,
    minScale: 0.5,
    scaleSpeed: 1.1,
  },
  move: {
    drag: true,
    wheel: true,
    scrollbars: true,
  },
  theme: Blockly.Theme.defineTheme('blockGameDark', {
    name: 'blockGameDark',
    base: Blockly.Themes.Modern,
    componentStyles: {
      workspaceBackgroundColour: '#151b2c',
      toolboxBackgroundColour: '#202741',
      toolboxForegroundColour: '#f1f4ff',
      flyoutBackgroundColour: '#222b46',
      flyoutForegroundColour: '#f1f4ff',
      flyoutOpacity: 1,
      scrollbarColour: '#4f5b88',
      insertionMarkerColour: '#ffffff',
      insertionMarkerOpacity: 0.25,
      scrollbarOpacity: 0.4,
      cursorColour: '#d8e1ff',
    },
  }),
});

Blockly.Xml.domToWorkspace(
  Blockly.utils.xml.textToDom(`
    <xml xmlns="https://developers.google.com/blockly/xml">
      <block type="when_game_starts" x="20" y="20">
        <statement name="DO">
          <block type="repeat_n_times">
            <value name="TIMES">
              <shadow type="math_number"><field name="NUM">5</field></shadow>
            </value>
            <statement name="DO">
              <block type="move_player_by">
                <value name="DX">
                  <shadow type="math_number"><field name="NUM">20</field></shadow>
                </value>
                <value name="DY">
                  <shadow type="math_number"><field name="NUM">0</field></shadow>
                </value>
                <next>
                  <block type="wait_seconds">
                    <value name="SECONDS">
                      <shadow type="math_number"><field name="NUM">0.25</field></shadow>
                    </value>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </statement>
      </block>
    </xml>
  `),
  workspace,
);

const runBtn = document.getElementById('runBtn');
const viewCodeBtn = document.getElementById('viewCodeBtn');
const languageSelect = document.getElementById('languageSelect');
const codeOutput = document.getElementById('codeOutput');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const state = {
  playerX: 30,
  playerY: 120,
  size: 28,
};

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0d1222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#43a0ff';
  ctx.fillRect(state.playerX, state.playerY, state.size, state.size);

  ctx.fillStyle = '#dce4ff';
  ctx.font = '12px sans-serif';
  ctx.fillText('Player', state.playerX, state.playerY - 8);
}

function clampPlayerPosition() {
  state.playerX = Math.max(0, Math.min(canvas.width - state.size, state.playerX));
  state.playerY = Math.max(0, Math.min(canvas.height - state.size, state.playerY));
}

function movePlayerBy(dx, dy) {
  state.playerX += Number(dx);
  state.playerY += Number(dy);
  clampPlayerPosition();
  drawScene();
}

function waitSeconds(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.max(0, Number(seconds) * 1000));
  });
}

function getCodeByLanguage(language) {
  if (language === 'python') return generatePython(workspace);
  if (language === 'cpp') return generateCpp(workspace);
  return generateJavaScript(workspace);
}

async function runCode() {
  const generatedCode = generateJavaScript(workspace);
  codeOutput.hidden = false;
  codeOutput.textContent = generatedCode;

  state.playerX = 30;
  state.playerY = 120;
  drawScene();

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const execute = new AsyncFunction('movePlayerBy', 'waitSeconds', generatedCode);
    await execute(movePlayerBy, waitSeconds);
  } catch (error) {
    codeOutput.textContent += `\n\n[Runtime Error]\n${error.message}`;
  }
}

runBtn.addEventListener('click', runCode);

viewCodeBtn.addEventListener('click', () => {
  const code = getCodeByLanguage(languageSelect.value);
  codeOutput.hidden = false;
  codeOutput.textContent = code;
});

drawScene();
