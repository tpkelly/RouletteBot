const { PermissionsBitField } = require('discord.js');
const common = require('../common.js');
const setup = require('../setupModal.js');

module.exports = {
  name: 'setup',
  description: 'Configure the roulette in this server',
  ephemeral: true,
  options: [
  ],
  executeInteraction: async(interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      await interaction.editReply({ embeds: [common.styledEmbed('Configuration', 'Only users with Manage Server permissions can configure the roulette settings')]});
      return;
    }
    
    await setup.channelPage(interaction);
  }
};