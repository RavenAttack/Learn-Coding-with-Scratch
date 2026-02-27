/**
 * JavaScript generator setup for custom blocks.
 */
export function registerJavaScriptGenerators(Blockly) {
  const generator = Blockly.JavaScript;

  generator.forBlock.when_game_starts = function (block, gen) {
    const body = gen.statementToCode(block, 'DO');
    return `// when game starts\n${body}`;
  };

  generator.forBlock.repeat_n_times = function (block, gen) {
    const times = gen.valueToCode(block, 'TIMES', gen.ORDER_NONE) || '0';
    const body = gen.statementToCode(block, 'DO');
    return `for (let count = 0; count < ${times}; count++) {\n${body}}\n`;
  };

  generator.forBlock.move_player_by = function (block, gen) {
    const dx = gen.valueToCode(block, 'DX', gen.ORDER_NONE) || '0';
    const dy = gen.valueToCode(block, 'DY', gen.ORDER_NONE) || '0';
    return `movePlayerBy(${dx}, ${dy});\n`;
  };

  generator.forBlock.wait_seconds = function (block, gen) {
    const seconds = gen.valueToCode(block, 'SECONDS', gen.ORDER_NONE) || '0';
    return `await waitSeconds(${seconds});\n`;
  };

  return generator;
}

export function generateJavaScript(workspace, generator) {
  return generator.workspaceToCode(workspace);
}
