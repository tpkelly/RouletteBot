const setup = require('../setupModal.js');

module.exports = {
  name: 'info',
  description: 'Display information about roulettes and the bot in this server',
  options: [],
  executeInteraction: async(interaction) => {
    var info = await setup.info(interaction).catch(err => console.error(err));
    await interaction.editReply({ embeds: [info] });
  }
};