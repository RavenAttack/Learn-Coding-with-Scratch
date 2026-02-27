/**
 * Custom Blockly blocks with dynamic inputs and inline language-aware hints.
 */
const HINT_FIELD = 'CODE_HINT';
const HINT_INPUT = 'HINT_INPUT';
let activeHintLanguage = 'javascript';

function getNumericValuePreview(block, inputName, fallback = '0') {
  const target = block.getInputTargetBlock(inputName);
  if (!target) return fallback;

  if (target.type === 'math_number') {
    return String(target.getFieldValue('NUM') ?? fallback);
  }

  if (target.type === 'variables_get') {
    return String(target.getFieldValue('VAR') ?? 'varName');
  }

  if (target.type === 'math_arithmetic') {
    const left = getNumericValuePreview(target, 'A', '0');
    const right = getNumericValuePreview(target, 'B', '0');
    const op = target.getFieldValue('OP') || 'ADD';
    const map = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', POWER: '**' };
    return `(${left} ${map[op] || '+'} ${right})`;
  }

  return '...';
}

function hintPrefix(language) {
  if (language === 'python') return 'PY';
  if (language === 'cpp') return 'C++';
  return 'JS';
}

function setHint(block, text) {
  const field = block.getField(HINT_FIELD);
  if (field) field.setValue(`${hintPrefix(activeHintLanguage)}: ${text}`);
}

function addHintInput(block) {
  block
    .appendDummyInput(HINT_INPUT)
    .appendField(new Blockly.FieldLabelSerializable('', 'code-hint-field'), HINT_FIELD);
}

function makeLoopHint(times) {
  if (activeHintLanguage === 'python') return `for i in range(int(${times})): ...`;
  if (activeHintLanguage === 'cpp') {
    return `for (int i = 0; i < static_cast<int>(${times}); ++i) { ... }`;
  }
  return `for (let i = 0; i < ${times}; i++) { ... }`;
}

function makeMoveHint(dx, dy) {
  if (activeHintLanguage === 'python') return `move_player_by(${dx}, ${dy})`;
  return `movePlayerBy(${dx}, ${dy});`;
}

function makeWaitHint(seconds) {
  if (activeHintLanguage === 'python') return `wait_seconds(${seconds})`;
  if (activeHintLanguage === 'cpp') return `waitSeconds(${seconds});`;
  return `await waitSeconds(${seconds});`;
}

function makeStartHint() {
  if (activeHintLanguage === 'python') return 'def game_start(): ...';
  if (activeHintLanguage === 'cpp') return 'void game_start() { ... }';
  return '/* game starts */';
}

function attachHintUpdater(block, makeHint) {
  block.updateCodeHint = () => setHint(block, makeHint());
  block.setOnChange((event) => {
    if (
      !event ||
      !event.blockId ||
      event.blockId === block.id ||
      event.type === Blockly.Events.BLOCK_CHANGE ||
      event.type === Blockly.Events.BLOCK_MOVE ||
      event.type === Blockly.Events.BLOCK_CREATE
    ) {
      block.updateCodeHint();
    }
  });
  block.updateCodeHint();
}

export function setBlockHintLanguage(language) {
  activeHintLanguage = language || 'javascript';
}

export function refreshAllBlockHints(workspace) {
  workspace.getAllBlocks(false).forEach((block) => {
    if (typeof block.updateCodeHint === 'function') {
      block.updateCodeHint();
    }
  });
}

export function defineGameBlocks(Blockly) {
  Blockly.Blocks.when_game_starts = {
    init() {
      this.appendDummyInput().appendField('when game starts');
      this.appendStatementInput('DO').setCheck(null).appendField('do');
      addHintInput(this);
      this.setColour(50);
      this.setTooltip('Entry point block for your game logic.');
      this.setHelpUrl('');
      this.setDeletable(false);
      this.setMovable(false);
      this.setNextStatement(false);
      this.setPreviousStatement(false);

      attachHintUpdater(this, () => makeStartHint());
    },
  };

  Blockly.Blocks.repeat_n_times = {
    init() {
      this.appendValueInput('TIMES').setCheck('Number').appendField('repeat');
      this.appendDummyInput().appendField('times');
      this.appendStatementInput('DO').setCheck(null).appendField('do');
      addHintInput(this);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Run the blocks inside this block N times.');
      this.setHelpUrl('');

      attachHintUpdater(this, () => {
        const times = getNumericValuePreview(this, 'TIMES', '10');
        return makeLoopHint(times);
      });
    },
  };

  Blockly.Blocks.move_player_by = {
    init() {
      this.appendValueInput('DX').setCheck('Number').appendField('move player by x');
      this.appendValueInput('DY').setCheck('Number').appendField('y');
      addHintInput(this);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Move the player square by x and y pixels.');
      this.setHelpUrl('');

      attachHintUpdater(this, () => {
        const dx = getNumericValuePreview(this, 'DX', '10');
        const dy = getNumericValuePreview(this, 'DY', '0');
        return makeMoveHint(dx, dy);
      });
    },
  };

  Blockly.Blocks.wait_seconds = {
    init() {
      this.appendValueInput('SECONDS').setCheck('Number').appendField('wait seconds');
      addHintInput(this);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(25);
      this.setTooltip('Pause game logic for a number of seconds.');
      this.setHelpUrl('');

      attachHintUpdater(this, () => {
        const seconds = getNumericValuePreview(this, 'SECONDS', '1');
        return makeWaitHint(seconds);
      });
    },
  };
}
