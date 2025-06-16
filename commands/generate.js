const { PermissionsBitField, ApplicationCommandOptionType } = require('discord.js');
const tasks = require('../tasks/rouletteTasks.js');

module.exports = {
  name: 'generate',
  description: 'Manually draw the roulette matches',
  options: [{ type: ApplicationCommandOptionType.Boolean, name: "dry-run", description: "If true, will only do a dry-run of the draw, and will not remove roles from users. Defaults to false", required: false }],
  executeInteraction: async(interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      await interaction.editReply({ embeds: [common.styledEmbed('Configuration', 'Only users with Manage Server permissions can configure the roulette settings')]});
      return;
    }
    
    var dryRun = interaction.options.getBoolean('dry-run') ?? false;
    
    var config = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id }) || {};
    
    await tasks.draw(interaction.client, config, dryRun);
  }
};