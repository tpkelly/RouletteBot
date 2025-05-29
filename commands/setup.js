const { ApplicationCommandOptionType, PermissionsBitField, ChannelType } = require('discord.js');
const common = require('../common.js');

module.exports = {
  name: 'setup',
  description: 'Configure the roulette in this server',
  ephemeral: true,
  options: [
    { type: ApplicationCommandOptionType.Channel, name: "channel", description: "The channel roulettes will be organised in", required: true, channel_types: [ChannelType.GuildText] },
    //{ type: ApplicationCommandOptionType.Integer, name: "hour", description: "The time of day to start roulettes, from a 24-hour clock (0-23)", required: true },
    //{ type: ApplicationCommandOptionType.Integer, name: "offset", description: "The timezone offset you use (i.e. 1 means UTC+1, -3 means UTC-3)", required: true },
  ],
  executeInteraction: async(interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      interaction.editReply({ embeds: [common.styledEmbed('Configuration', 'Only users with Manage Server permissions can configure the roulette settings')]});
      return;
    }
    
    var channel = interaction.options.getChannel('channel');
    var hour = interaction.options.getBoolean('hour') ?? 9;
    
    await interaction.client.mongo.collection('config').findOneAndReplace(
      { _id: interaction.guild.id },
      { channel: channel.id },
      { upsert: true }
    );
    
    var embed = common.styledEmbed('Configuration', `Configured to use <#${channel.id}>`);
    
    interaction.editReply({ embeds: [embed] });
  }
};