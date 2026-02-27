/**
 * Lightweight JavaScript generator for custom Blockly game blocks.
 * This avoids relying on optional Blockly language generator bundles.
 */

function expressionToJavaScript(block) {
  if (!block) return '0';

  if (block.type === 'math_number') {
    return String(block.getFieldValue('NUM') ?? 0);
  }

  if (block.type === 'variables_get') {
    return String(block.getFieldValue('VAR') || 'playerVar');
  }

  if (block.type === 'math_arithmetic') {
    const op = block.getFieldValue('OP') || 'ADD';
    const operators = {
      ADD: '+',
      MINUS: '-',
      MULTIPLY: '*',
      DIVIDE: '/',
      POWER: '**',
    };
    const left = expressionToJavaScript(block.getInputTargetBlock('A'));
    const right = expressionToJavaScript(block.getInputTargetBlock('B'));
    return `(${left} ${operators[op] || '+'} ${right})`;
  }

  return '0';
}

function statementToJavaScript(block, indent = '  ') {
  if (!block) return '';

  let line = '';
  switch (block.type) {
    case 'repeat_n_times': {
      const times = expressionToJavaScript(block.getInputTargetBlock('TIMES'));
      const inner = statementToJavaScript(block.getInputTargetBlock('DO'), `${indent}  `);
      line = `${indent}for (let i = 0; i < ${times}; i++) {\n${inner}${indent}}\n`;
      break;
    }
    case 'move_player_by': {
      const dx = expressionToJavaScript(block.getInputTargetBlock('DX'));
      const dy = expressionToJavaScript(block.getInputTargetBlock('DY'));
      line = `${indent}movePlayerBy(${dx}, ${dy});\n`;
      break;
    }
    case 'wait_seconds': {
      const seconds = expressionToJavaScript(block.getInputTargetBlock('SECONDS'));
      line = `${indent}await waitSeconds(${seconds});\n`;
      break;
    }
    default:
      line = `${indent}// Unsupported block: ${block.type}\n`;
  }

  return line + statementToJavaScript(block.getNextBlock(), indent);
}

export function generateJavaScript(workspace) {
  const root = workspace.getTopBlocks(true).find((block) => block.type === 'when_game_starts');
  if (!root) return '// Add a "when game starts" block to generate code.\n';

  const body = statementToJavaScript(root.getInputTargetBlock('DO'));
  return `// Generated JavaScript\n${body}`;
}
