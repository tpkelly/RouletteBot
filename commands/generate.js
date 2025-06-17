const { PermissionsBitField } = require('discord.js');
const tasks = require('../tasks/rouletteTasks.js');

module.exports = {
  name: 'generate',
  description: 'Manually draw the roulette matches',
  ephemeral: true,
  executeInteraction: async(interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      await interaction.editReply({ embeds: [common.styledEmbed('Configuration', 'Only users with Manage Server permissions can configure the roulette settings')]});
      return;
    }
   
    var config = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id }) || {};
    
    var message = await tasks.draw(interaction.client, config);
    await interaction.editReply(message || 'Processed');
  }
};