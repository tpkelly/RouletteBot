const { ActionRowBuilder, ChannelSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType, ButtonBuilder } = require('discord.js');
const common = require('./common.js');

/** Roulette Channel */

async function channelPage(interaction) {
  var defaultChannel = interaction.channel.id;
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id });

  if (doc) {
    defaultChannel = doc.channel;
  }
 
  var embed = common.styledEmbed('Configuration', `Currently running roulettes in: <#${defaultChannel}>`);
  
  var validChannels = interaction.guild.channels.cache.filter(x => x.isTextBased()).values();
  var dropdownRow = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setPlaceholder('Select roulette channel...').setCustomId('roulette-channel').setChannelTypes([ChannelType.GuildText]))//.setDefaultChannels([defaultChannel]));
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-channel-prev').setDisabled(true),
    new ButtonBuilder().setLabel('Next').setStyle('Primary').setCustomId('config-channel-next').setDisabled(!doc.channel));
  
  await interaction.editReply({ embeds: [embed], components: [dropdownRow, buttonRow] });
}

async function setChannel(interaction) {
  await interaction.client.mongo.collection('config').findOneAndUpdate(
    { _id: interaction.guild.id },
    { $set: { channel: interaction.values[0] } },
    { upsert: true }
  );
  await channelPage(interaction);
}

/** Roulette Frequency */

async function frequencyPage(interaction) {
  var defaultFrequency = 'm';
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id });

  if (doc) {
    defaultFrequency = doc.frequency;
  }
 
  var fullFreq;
  switch (defaultFrequency) {
    case 'w': fullFreq = 'Weekly'; break;
    case 'f': fullFreq = 'Fortnightly'; break;
    case 'm': fullFreq = 'Monthly'; break;
    default:  fullFreq = 'Not Configured'; break;
  }
  
  var embed = common.styledEmbed('Configuration', `Currently running roulettes: ${fullFreq}`);
  
  var dropdownRow = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setPlaceholder('Select roulette frequency...').setCustomId('roulette-frequency').addOptions(
    new StringSelectMenuOptionBuilder().setLabel('Weekly').setValue('w'),
    new StringSelectMenuOptionBuilder().setLabel('Fortnightly').setValue('f'),
    new StringSelectMenuOptionBuilder().setLabel('Monthly').setValue('m')
  ));
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-frequency-prev'),
    new ButtonBuilder().setLabel('Next').setStyle('Primary').setCustomId('config-frequency-next').setDisabled(!doc.frequency));
  
  await interaction.editReply({ embeds: [embed], components: [dropdownRow, buttonRow] });
}

async function setFrequency(interaction) {
  await interaction.client.mongo.collection('config').findOneAndUpdate(
    { _id: interaction.guild.id },
    { $set: { frequency: interaction.values[0] } },
    { upsert: true }
  );
  await frequencyPage(interaction);
}

/** Roulette Start Date */

async function datePage(interaction) {
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id });

  if (doc) {
  }
 
  var embed = common.styledEmbed('Configuration', "Date page");
  
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-date-prev'),
    new ButtonBuilder().setLabel('Next').setStyle('Primary').setCustomId('config-date-next'));
  
  await interaction.editReply({ embeds: [embed], components: [buttonRow] });
}

/** Roulette Start Time */

async function timePage(interaction) {
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id });

  if (doc) {
  }
 
  var embed = common.styledEmbed('Configuration', "Time page");
  
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-time-prev'),
    new ButtonBuilder().setLabel('Next').setStyle('Primary').setCustomId('config-time-next'));
  
  await interaction.editReply({ embeds: [embed], components: [buttonRow] });
}

/** Roulette Mode */

async function modePage(interaction) {
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id });

  if (doc) {
  }
 
  var embed = common.styledEmbed('Configuration', "Mode page");
  
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-mode-prev'),
    new ButtonBuilder().setLabel('Next').setStyle('Primary').setCustomId('config-mode-next'));
  
  await interaction.editReply({ embeds: [embed], components: [buttonRow] });
}

/** Summary */

async function summaryPage(interaction) {
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id });

  if (doc) {
  }
 
  var embed = common.styledEmbed('Configuration', "Summary page");
  
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-summary-prev'),
    new ButtonBuilder().setLabel('Finish').setStyle('Primary').setCustomId('config-finish'));
  
  await interaction.editReply({ embeds: [embed], components: [buttonRow] });
}

module.exports = {
  channelPage: channelPage,
  setChannel: setChannel,
  frequencyPage: frequencyPage,
  setFrequency: setFrequency,
  datePage: datePage,
  timePage: timePage,
  modePage: modePage,
  summaryPage: summaryPage
};