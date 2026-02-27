/**
 * Python generator for the Blockly game starter blocks.
 */

function exprToPython(block) {
  if (!block) return '0';

  if (block.type === 'math_number') return String(block.getFieldValue('NUM') ?? 0);
  if (block.type === 'variables_get') return String(block.getFieldValue('VAR') || 'player_var');

  if (block.type === 'math_arithmetic') {
    const op = block.getFieldValue('OP') || 'ADD';
    const operators = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', POWER: '**' };
    const left = exprToPython(block.getInputTargetBlock('A'));
    const right = exprToPython(block.getInputTargetBlock('B'));
    return `(${left} ${operators[op] || '+'} ${right})`;
  }

  return '0';
}

function stmtToPython(block, indent = '    ') {
  if (!block) return '';

  let line = '';
  switch (block.type) {
    case 'repeat_n_times': {
      const times = exprToPython(block.getInputTargetBlock('TIMES'));
      const inner = stmtToPython(block.getInputTargetBlock('DO'), `${indent}    `) || `${indent}    pass\n`;
      line = `${indent}for i in range(int(${times})):\n${inner}`;
      break;
    }
    case 'move_player_by': {
      const dx = exprToPython(block.getInputTargetBlock('DX'));
      const dy = exprToPython(block.getInputTargetBlock('DY'));
      line = `${indent}move_player_by(${dx}, ${dy})\n`;
      break;
    }
    case 'wait_seconds': {
      const sec = exprToPython(block.getInputTargetBlock('SECONDS'));
      line = `${indent}wait_seconds(${sec})\n`;
      break;
    }
    default:
      line = `${indent}# Unsupported block: ${block.type}\n`;
  }

  return line + stmtToPython(block.getNextBlock(), indent);
}

export function generatePython(workspace) {
  const root = workspace.getTopBlocks(true).find((block) => block.type === 'when_game_starts');
  const body = root ? stmtToPython(root.getInputTargetBlock('DO')) : '    pass\n';

  return [
    '# Generated Python',
    'def move_player_by(dx, dy):',
    '    # TODO: Hook into game runtime',
    '    pass',
    '',
    'def wait_seconds(seconds):',
    '    # TODO: Hook into game runtime',
    '    pass',
    '',
    'def game_start():',
    body || '    pass\n',
    '',
    "if __name__ == '__main__':",
    '    game_start()',
  ].join('\n');
}
