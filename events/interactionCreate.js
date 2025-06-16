const setup = require('../setupModal.js');
const common = require('../common.js');
const { Events } = require('discord.js');

function noSuchCommand(client, interaction) {
  interaction.editReply({ content: 'No such command', ephemeral: true })
    .catch(err => console.log(err));
}

async function commandInteraction(interaction, client) {
  var command = interaction.commandName;
  var response = '';
  var embed;

  if (!client.commands.has(command)) {
    noSuchCommand(client, interaction);
    return;
  }

  const clientCommand = client.commands.get(command);
  if (!clientCommand.executeInteraction) {
    noSuchCommand(client, interaction);
    return;
  }

  await interaction.deferReply({ ephemeral: clientCommand.ephemeral })

  // Execute command by name from the 'commands/{command.name}.js' file
  try {
    clientCommand.executeInteraction(interaction, client);
  } catch (ex) {
    console.error(ex);
    interaction.editReply(ex);
  }
}

async function componentInteraction(interaction, client) {
  if (interaction.customId === 'roulette-join') {
    await interaction.deferReply({ ephemeral: true });
    await common.register(interaction);
    return;
  }

  await interaction.deferUpdate();
  
  // Change pages on Setup command
  switch (interaction.customId) {
    case 'config-frequency-prev':
      await setup.channelPage(interaction);
      return;
      
    case 'config-channel-next':
    case 'config-mode-prev':
      await setup.frequencyPage(interaction);
      return;

    case 'config-frequency-next':
    case 'config-date-prev':
      await setup.modePage(interaction);
      return;

    case 'config-mode-next':
    case 'config-role-prev':
      await setup.datePage(interaction);
      return;

    case 'config-date-next':
    case 'config-summary-prev':
      await setup.rolePage(interaction);
      return;

    case 'config-role-next':
      await setup.summaryPage(interaction);
      return;
      
    case 'config-finish':
      await setup.finish(interaction);
      return;

    // Set setup data
    case 'roulette-channel':
      await setup.setChannel(interaction);
      return;

    case 'roulette-frequency':
      await setup.setFrequency(interaction);
      return;

    case 'roulette-mode':
      await setup.setMode(interaction);
      return;
      
    case 'roulette-role':
      await setup.setRole(interaction);
      return;
    
    case 'config-role-new':
      await setup.newRole(interaction);
      return;
  }
  
  if (interaction.customId.startsWith('config-date-set-')) {
    interaction.values = [ interaction.customId.substring(18) ];
    await setup.setDate(interaction);
    return;
  }

  throw `Unknown interaction: ${interaction.customId}`
}

module.exports = {
  name: Events.InteractionCreate,
  execute: async (client, args) => {
    let interaction = args[0]
    if (interaction.isCommand() || interaction.type === 2) {
      commandInteraction(interaction, client);
    }
    
    if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isChannelSelectMenu() || interaction.isUserSelectMenu() || interaction.isRoleSelectMenu() || interaction.isModalSubmit()) {
      componentInteraction(interaction, client);
    }
  }
}