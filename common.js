const { WebhookClient } = require('discord.js');

function styledEmbed(title, description, colour) {
  return {
      title: title,
      description: description,
      color: colour || 0xde153a,
      footer: {
        //iconURL: 'https://cdn.discordapp.com/attachments/1154346363061030974/1156663427595522094/Funky_little_icon_you_got_there.png',
        text: 'Roulette'
      }
    }
}

function sendHook(hookId, hookToken, messageData) {
  var hook = new WebhookClient({ id: hookId, token: hookToken });
  setTimeout(() => hook.destroy(), 10000);
  return hook.send(messageData).catch(err => console.error(err));
}

async function register(interaction) {
  var config = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id }) || {};
  
  if (!config) {
    return;
  }
  
  // Create a roulette role if none already exists  
  if (!config.rouletteRole) {
    var newGuildRole = await interaction.guild.roles.create({ name: 'Roulette Entry', reason: 'New role for roleplay roulettes' }).catch(console.error);

    await interaction.client.mongo.collection('config').findOneAndUpdate(
      { _id: interaction.guild.id },
      { $set: { rouletteRole: newGuildRole.id } }
    );

    config.rouletteRole = newGuildRole.id;
  }
  
  // Check if they already have the role
  if (interaction.member.roles.cache.some(role => role.id == config.rouletteRole)) {
    interaction.editReply({ embeds: [styledEmbed('Roleplay Roulette', ':warning: You are already registered for the next Roleplay Roulette')]});
    return;
  }
  
  interaction.member.roles.add(config.rouletteRole, 'Signed up for Roleplay Roulette');
  interaction.editReply({ embeds: [styledEmbed('Roleplay Roulette', 'You have been registered for the next Roleplay Roulette')]});
}

module.exports = {
  styledEmbed: styledEmbed,
  sendHook: sendHook,
  register: register
};