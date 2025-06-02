const setup = require('../setupModal.js');
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
  await interaction.deferUpdate();
 
  // Change pages on Setup command
  switch (interaction.customId) {
    case 'config-frequency-prev':
      await setup.channelPage(interaction);
      break;
      
    case 'config-channel-next':
    case 'config-date-prev':
      await setup.frequencyPage(interaction);
      break;

    case 'config-frequency-next':
    case 'config-time-prev':
      await setup.datePage(interaction);
      break;

    case 'config-date-next':
    case 'config-mode-prev':
      await setup.timePage(interaction);
      break;

    case 'config-time-next':
    case 'config-summary-prev':
      await setup.modePage(interaction);
      break;

    case 'config-mode-next':
      await setup.summaryPage(interaction);
      break;

    // Set setup data
    case 'roulette-channel':
      await setup.setChannel(interaction);
      break;

    case 'roulette-frequency':
      await setup.setFrequency(interaction);
      break;

    default: throw 'Unknown interaction'
  }
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