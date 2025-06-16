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

// Fisher-Yates shuffle algorithm
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function generateMatches(guild, config) {
  return guild.members.fetch()
    .then(() => guild.roles.fetch(config.rouletteRole))
    .then(async rouletteRole => {
      if (rouletteRole.members.size < 2) {
        return [];
      }
      
      var matches = shuffleArray(Array.from(rouletteRole.members.keys()));
     
      return matches;
    });
}

async function notifyMatches(guild, config, matches) {
  var rouletteChannel = guild.channels.resolve(config.channel);
  switch (config.mode) {
    case 'post':
      await rouletteChannel.send(notifyPost.matches).catch(console.error);
      
    case 'manual':
      return notifyPost(matches);
      
    case 'thread':
      await notifyThreads(rouletteChannel, config, matches);
      break;
      
    default:
      throw `Unknown roulette mode: ${config.mode}`;
  }
}

function notifyPost(matches) {
  if (matches.length == 0) {
    return 'Not enough participants for a roulette';
  }

  var messagePost = `__Roulette Matches__

Welcome to another roulette draw! The rules are simple - at some point during the roulette period, talk with your partner to arrange a small one-on-one roleplay session. There is no set limit on duration, location, topics... Just do some small roleplay together!
`;
  
  // We have an odd number, so make the first pair a triple
  if (matches.length % 2 == 1) {
    messagePost += `<@${matches.pop()}> + <@${matches.pop()}> + <@${matches.pop()}>` + '\n'
  }
  
  while (matches.length > 0) {
    messagePost += `<@${matches.pop()}> + <@${matches.pop()}>` + '\n'
  }
  
  return messagePost;
}

async function notifyThreads(channel, config, matches) {
  if (matches.length == 0) {
    return;
  }

  // We have an odd number, so make the first pair a triple
  if (matches.length % 2 == 1) {
    await setupRouletteChannel(rouletteChannel, [matches.pop(), matches.pop(), matches.pop()], config);
  }
  
  while (matches.length > 0) {
    await setupRouletteChannel(rouletteChannel, [matches.pop(), matches.pop()], config);
  }
}

async function setupRouletteChannel(parentChannel, roleplayers, config) {
  await parentChannel.threads.create({
    name: 'Roleplay Roulette',
    type: ChannelType.PrivateThread,
    invitable: false
  }).then(async thread => {
    // Invite the matches together
    for (const player of roleplayers) {
      await thread.members.add(player);
      var member = await parentChannel.guild.members.fetch(player);
      await member.roles.remove(config.rouletteRole);
    }
    
    var embed = common.styledEmbed('Roleplay Roulette', 'Welcome to the Roleplay Roulette!\n\nThe aim of the roulette is to match people together and have them organise some roleplay together. It might be a small scene alone, or you might want to meet at one of the many venues to roleplay together there instead.\n\nIt is down to you both to decide when, where and how you want to roleplay. Maybe a fight scene? A small comfortable chat? A chance encounter? Old friends reuniting? Just make sure to do it before the next roulette! If you are stuck for ideas, try the `/rpdice` bot command for some suggestions.\n\n**And last of all, have fun!**');
    await thread.send({ content: `<@${roleplayers.join('> <@')}>`, embeds: [embed]});
  });
}

// If this is a dry run, then the matches will be printed but will not be announced. This is intended for manual matches only
async function draw(client, config) {
  var guild = await client.guilds.fetch(config._id);
  return await generateMatches(guild, config)
    .then(matches => notifyMatches(guild, config, matches))
    .catch(console.error);
}

module.exports = {
  setup: setup,
  draw: draw
}