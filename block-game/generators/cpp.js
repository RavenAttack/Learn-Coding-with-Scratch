/**
 * C++ generator for the Blockly game starter blocks.
 */

function exprToCpp(block) {
  if (!block) return '0';

  if (block.type === 'math_number') return String(block.getFieldValue('NUM') ?? 0);
  if (block.type === 'variables_get') return String(block.getFieldValue('VAR') || 'playerVar');

  if (block.type === 'math_arithmetic') {
    const op = block.getFieldValue('OP') || 'ADD';
    const operators = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', POWER: '^' };
    const left = exprToCpp(block.getInputTargetBlock('A'));
    const right = exprToCpp(block.getInputTargetBlock('B'));
    return `(${left} ${operators[op] || '+'} ${right})`;
  }

  return '0';
}

function stmtToCpp(block, indent = '  ') {
  if (!block) return '';

  let line = '';
  switch (block.type) {
    case 'repeat_n_times': {
      const times = exprToCpp(block.getInputTargetBlock('TIMES'));
      const inner = stmtToCpp(block.getInputTargetBlock('DO'), `${indent}  `);
      line = `${indent}for (int i = 0; i < static_cast<int>(${times}); ++i) {\n${inner}${indent}}\n`;
      break;
    }
    case 'move_player_by': {
      const dx = exprToCpp(block.getInputTargetBlock('DX'));
      const dy = exprToCpp(block.getInputTargetBlock('DY'));
      line = `${indent}movePlayerBy(${dx}, ${dy});\n`;
      break;
    }
    case 'wait_seconds': {
      const sec = exprToCpp(block.getInputTargetBlock('SECONDS'));
      line = `${indent}waitSeconds(${sec});\n`;
      break;
    }
    default:
      line = `${indent}// Unsupported block: ${block.type}\n`;
  }

  return line + stmtToCpp(block.getNextBlock(), indent);
}

export function generateCpp(workspace) {
  const root = workspace.getTopBlocks(true).find((block) => block.type === 'when_game_starts');
  const body = root ? stmtToCpp(root.getInputTargetBlock('DO')) : '  // Add blocks to game_start\n';

  return [
    '// Generated C++',
    '#include <iostream>',
    '',
    'void movePlayerBy(double dx, double dy) {',
    '  // TODO: Hook into game runtime',
    '}',
    '',
    'void waitSeconds(double seconds) {',
    '  // TODO: Hook into game runtime',
    '}',
    '',
    'void game_start() {',
    body,
    '}',
    '',
    'int main() {',
    '  game_start();',
    '  return 0;',
    '}',
  ].join('\n');
}
