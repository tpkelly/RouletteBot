const { ActionRowBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType, ButtonBuilder, PermissionsBitField } = require('discord.js');
const common = require('./common.js');

/** Helper functions */

async function saveData(interaction, key, callback) {
  var data = {};
  data[key] = interaction.values[0];

  await callback(interaction, data[key]);
  
  await interaction.client.mongo.collection('config').findOneAndUpdate(
    { _id: interaction.guild.id },
    { $set: data },
    { upsert: true }
  );
}

const displayTextFrequency = {
  f: 'Fortnightly',
  m: 'Monthly',
  w: 'Weekly',
  u: 'Not Specified'
};

const displayTextMode = {
  post: 'Single Post',
  manual: 'Manual',
  thread: 'Private Threads',
  none: 'Not Specified' 
}

/** Roulette Channel */

async function channelPage(interaction, value) {
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id }) || {};
  var defaultChannel = value || doc.channel || interaction.channel.id;
 
  var embed = common.styledEmbed('Configuration', `Choose which channel should the roulettes be hosted in. Announcements and matches will be posted to this channel.

Currently running roulettes in: <#${defaultChannel}>`);
  
  var validChannels = interaction.guild.channels.cache.filter(x => x.isTextBased()).values();
  var dropdownRow = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setPlaceholder('Select roulette channel...').setCustomId('roulette-channel').setChannelTypes([ChannelType.GuildText]))//.setDefaultChannels([defaultChannel]));
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-channel-prev').setDisabled(true),
    new ButtonBuilder().setLabel('Next').setStyle('Primary').setCustomId('config-channel-next').setDisabled(!value));
  
  await interaction.editReply({ embeds: [embed], components: [dropdownRow, buttonRow] });
}

async function setChannel(interaction) {
  await saveData(interaction, 'channel', channelPage);
}

/** Roulette Frequency */

async function frequencyPage(interaction, value) {
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id }) || {};
  var defaultFrequency = value || doc.frequency || 'u';
 
  var embed = common.styledEmbed('Configuration', `How regularly should roulettes run?

Currently running roulettes: ${displayTextFrequency[defaultFrequency]}`);
  
  var dropdownRow = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setPlaceholder('Select roulette frequency...').setCustomId('roulette-frequency').addOptions(
    new StringSelectMenuOptionBuilder().setLabel('Weekly').setValue('w'),
    new StringSelectMenuOptionBuilder().setLabel('Fortnightly').setValue('f'),
    new StringSelectMenuOptionBuilder().setLabel('Monthly').setValue('m')
  ));
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-frequency-prev'),
    new ButtonBuilder().setLabel('Next').setStyle('Primary').setCustomId('config-frequency-next').setDisabled(defaultFrequency === 'u'));
  
  await interaction.editReply({ embeds: [embed], components: [dropdownRow, buttonRow] });
}

async function setFrequency(interaction) {
  await saveData(interaction, 'frequency', frequencyPage);
}

/** Roulette Mode */

async function modePage(interaction, value) {
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id }) || {};
  var defaultMode = value || doc.mode || 'none';
 
  var embed = common.styledEmbed('Configuration', `Choose from the following roulette modes:
- **Threads**: Roulette matches are created as private threads with the participants in each match. Organisation happens on the discord.
- **Single Post**: All the matches are created, and a single post is made listing out everybody's partners. It then becomes their responsibility to contact each other and organise to roleplay.
- **Manual**: No automatic scheduling of matches. The \`/generate\` slash-command gives back the same list as in 'Single Post' mode.

Current mode: ${displayTextMode[defaultMode]}`);
  
  var dropdownRow = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setPlaceholder('Select roulette mode...').setCustomId('roulette-mode').addOptions(
    new StringSelectMenuOptionBuilder().setLabel('Threads').setValue('thread'),
    new StringSelectMenuOptionBuilder().setLabel('Single Post').setValue('post'),
    new StringSelectMenuOptionBuilder().setLabel('Manual').setValue('manual')
  ));
  
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-mode-prev'),
    new ButtonBuilder().setLabel('Next').setStyle('Primary').setCustomId('config-mode-next').setDisabled(defaultMode === 'none'));
  
  await interaction.editReply({ embeds: [embed], components: [dropdownRow, buttonRow] });
}

async function setMode(interaction) {
  await saveData(interaction, 'mode', modePage);
}

/** Roulette Start Date */

async function datePage(interaction, value) {
  // Default to tomorrow at 9am
  var now = new Date();
  now.setUTCHours(9, 0, 0, 0);
  var minDate = 24*60*60 + (now.getTime() / 1000)

  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id }) || {};
  var defaultDate = Number(value) || Number(doc.date) || minDate;
 
  var embed = common.styledEmbed('Configuration', `Choose the date and time the next roulette will start at. This will be the point where participants are invited to sign up. Automatic matches will happen 2 days afterwards, Manual matches will happen when you run the \`/generate\` command.

The next roulette is currently scheduled for <t:${defaultDate}:f>`);

  // Cannot go below the next "X o'clock" from now
  now = new Date();
  var minimumDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours()+1, 0, 0, 0)).getTime()/1000;
  
  var dateButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('-1D').setStyle('Secondary').setCustomId(`config-date-set-D-${Math.max(minimumDate, defaultDate - 24*60*60)}`),
    new ButtonBuilder().setLabel('-1H').setStyle('Secondary').setCustomId(`config-date-set-H-${Math.max(minimumDate, defaultDate - 60*60)}`),
    new ButtonBuilder().setLabel('+1H').setStyle('Secondary').setCustomId(`config-date-set-H+${defaultDate + 60*60}`),
    new ButtonBuilder().setLabel('+1D').setStyle('Secondary').setCustomId(`config-date-set-D+${defaultDate + 24*60*60}`));
    
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-date-prev'),
    new ButtonBuilder().setLabel('Next').setStyle('Primary').setCustomId('config-date-next').setDisabled(minDate === defaultDate));
  
  await interaction.editReply({ embeds: [embed], components: [dateButtonRow, buttonRow] });
}

async function setDate(interaction) {
  await saveData(interaction, 'date', datePage);
}

/** Roulette Notification Role */

async function rolePage(interaction, value) {
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id }) || {};
  var defaultRole = value || doc.notificationRole || '';
 
  var embed = common.styledEmbed('Configuration', `Choose which role to use to notify people about upcoming roulettes. This should be a self-assignable role to allow roleplayers to opt-in.
  
  Alternatively, you can have the Roulette Bot create a new role for you, but will need to allow members to self-assign it.

Current role: ${defaultRole ? '<@&' + defaultRole + '>' : 'Not specified'}`);
  
  var dropdownRow = new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setPlaceholder('Select notification role...').setCustomId('roulette-role'));
  
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-role-prev'),
    new ButtonBuilder().setLabel('Create Role').setStyle('Secondary').setCustomId('config-role-new'),
    new ButtonBuilder().setLabel('Next').setStyle('Primary').setCustomId('config-role-next').setDisabled(defaultRole === ''));
  
  await interaction.editReply({ embeds: [embed], components: [dropdownRow, buttonRow] });
}

async function setRole(interaction) {
  await saveData(interaction, 'notificationRole', rolePage);
}

async function newRole(interaction) {
  var newGuildRole = await interaction.guild.roles.create({ name: 'Roulette Notification', mentionable: true, reason: 'New role for roleplay roulettes' }).catch(console.error);
  interaction.values = [ newGuildRole.id ];
  await setRole(interaction);
}

/** Summary */

function boolIcon(value) {
  return value ? ':white_check_mark:' : ':x:';
}

async function info(interaction) {
  var doc = await interaction.client.mongo.collection('config').findOne({ _id: interaction.guild.id }) || {};

  if (!doc.channel) {
    return common.styledEmbed('Summary', 'This server has not yet been configured.\n\nRun the `/setup` command to begin.');
  }

  var targetChannel = await interaction.guild.channels.fetch(doc.channel);
  var me = await interaction.guild.members.fetchMe();
  var cPerms = targetChannel.permissionsFor(me)
  var sPerms = me.permissions;

  var notificationRole = await interaction.guild.roles.fetch(doc.notificationRole);

  var embed = common.styledEmbed('Summary', `### Designated Channel Permissions
- ${boolIcon(targetChannel.viewable)} Can view <#${doc.channel}>
- ${boolIcon(cPerms.has(PermissionsBitField.Flags.SendMessages))} Can send messages in channel
- ${boolIcon(cPerms.has(PermissionsBitField.Flags.CreatePrivateThreads))} Can create Private Threads
- ${boolIcon(cPerms.has(PermissionsBitField.Flags.SendMessagesInThreads))} Can send messages in Threads

### Server Permissions
- ${boolIcon(sPerms.has(PermissionsBitField.Flags.ManageRoles))} Can Manage Roles
- ${boolIcon(sPerms.has(PermissionsBitField.Flags.ManageThreads))} Can Manage Threads
- ${boolIcon(notificationRole.mentionable || sPerms.has(PermissionsBitField.Flags.MentionEveryone))} Can mention <@&${doc.notificationRole || interaction.guild.roles.everyone.id}>
`);
  
  embed.fields =   [
    { name: 'Role', value: `<@&${doc.notificationRole}>` },
    { name: 'Mode', value: `${displayTextMode[doc.mode]}` },
    { name: 'Frequency', value: `${displayTextFrequency[doc.frequency]}` },
    { name: 'Next Roulette', value: `<t:${doc.date}:f>` },
  ]

  return embed;
}

async function summaryPage(interaction) {
  var embed = await info(interaction);
  var buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Back').setStyle('Secondary').setCustomId('config-summary-prev'),
    new ButtonBuilder().setLabel('Finish').setStyle('Primary').setCustomId('config-finish'));
  
  await interaction.editReply({ embeds: [embed], components: [buttonRow] });
}

async function finish(interaction) {
  await interaction.editReply({ content:'Click below to dismiss', embeds: [], components: [] });
}

module.exports = {
  channelPage: channelPage,
  setChannel: setChannel,
  frequencyPage: frequencyPage,
  setFrequency: setFrequency,
  datePage: datePage,
  setDate: setDate,
  modePage: modePage,
  setMode: setMode,
  rolePage: rolePage,
  setRole: setRole,
  newRole: newRole,
  summaryPage: summaryPage,
  info: info,
  finish: finish
};