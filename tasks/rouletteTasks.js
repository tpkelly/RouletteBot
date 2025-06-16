const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const common = require('../common.js');

async function setup(client, config) {
  var guild = client.guilds.resolve(config._id);
  var rouletteChannel = guild.channels.resolve(config.channel);
  
  embed = common.styledEmbed('Roleplay Roulette', "It's that time again! If you want to enter into the next Roleplay Roulette, hit the button below to register.\n\nIf you've never seen the Roulette before, each time we pair up all our participants and encourage them to organise a small Roleplay scene between themselves - Whenever, wherever and however they want. As long as both of them are happy with it, anything goes!");
  var row = new ActionRowBuilder()
    .addComponents(new ButtonBuilder().setLabel('Register').setStyle('Primary').setCustomId('roulette-join'))

  await rouletteChannel.send({ content: `<@&${config.notificationRole}>`, embeds: [embed], components: [row] });
  
  var updateData = {}
  if (config.mode !== 'manual') {
    // Set draw date to 48 hours after annoucement
    updateData = { drawDate: `${Number(config.date) + 48*60*60}` };
  }
  
  switch (config.frequency) {
    case 'w': // Weekly
      updateData.date = `${Number(config.date) + 7*24*60*60}`
      break;
    case 'f': // Fortnightly
      updateData.date = `${Number(config.date) + 14*24*60*60}`
      break;
    case 'm': // Monthly
      var todayMillis = Number(config.date) * 1000;
      var todayDate = new Date(todayMillis);
      todayDate.setUTCMonth(todayDate.getUTCMonth()+1)
      updateData.date = `${Math.floor(todayDate.getTime() / 1000)}`
      break;
  }
  
  await client.mongo.collection('config').findOneAndUpdate(
    { _id: config._id },
    { $set: updateData }
  );
}

async function draw(client, config, dryRun) { // If this is a dry run, then the matches will be printed but will not be announced. This is intended for manual matches only
  

}

module.exports = {
  setup: setup,
  draw: draw
}