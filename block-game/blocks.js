/**
 * Custom Blockly blocks for the game starter.
 */
export function defineGameBlocks(Blockly) {
  Blockly.Blocks.when_game_starts = {
    init() {
      this.appendDummyInput().appendField('when game starts');
      this.appendStatementInput('DO').setCheck(null).appendField('do');
      this.setColour(50);
      this.setTooltip('Entry point block for your game logic.');
      this.setHelpUrl('');
      this.setDeletable(false);
      this.setMovable(false);
      this.setNextStatement(false);
      this.setPreviousStatement(false);
    },
  };

  Blockly.Blocks.repeat_n_times = {
    init() {
      this.appendValueInput('TIMES').setCheck('Number').appendField('repeat');
      this.appendDummyInput().appendField('times');
      this.appendStatementInput('DO').setCheck(null).appendField('do');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Run the blocks inside this block N times.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks.move_player_by = {
    init() {
      this.appendValueInput('DX').setCheck('Number').appendField('move player by x');
      this.appendValueInput('DY').setCheck('Number').appendField('y');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Move the player square by x and y pixels.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks.wait_seconds = {
    init() {
      this.appendValueInput('SECONDS').setCheck('Number').appendField('wait seconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(25);
      this.setTooltip('Pause game logic for a number of seconds.');
      this.setHelpUrl('');
    },
  };
}
