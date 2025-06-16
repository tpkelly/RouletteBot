const { Client, IntentsBitField } = require('discord.js');
const { MongoClient } = require('mongodb');

const client = new Client({
  intents: [IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.Guilds],
  partials: ['MESSAGE', 'CHANNEL']
});

const auth = require('../auth.json');
const common = require('../common.js');
const tasks = require('./rouletteTasks.js');

client.once('ready', async () => {
  console.log(`Roulette Timer task as ${client.user.tag} @ ${new Date().toLocaleString()}!`);
  try {
    var unixTimeSeconds = `${Math.floor(new Date().getTime() / 1000)}`;
    client.mongo = new MongoClient(auth.mongodb).db();
  
    // Handle initial announcement
    var setupResults = await client.mongo.collection('config').find({ date: { $lt: unixTimeSeconds }}).toArray();
    for (const config of setupResults) {
      try {
        await tasks.setup(client, config)
      } catch (err) {
        console.error(err);
      }
    }
  
    // Handle drawing matches
    var drawResults = await client.mongo.collection('config').find({ drawDate: { $lt: unixTimeSeconds }}).toArray();
    for (const config of drawResults) {
      try {
        if (config.mode == 'manual') {
          // Prevent this from re-triggering
          await client.mongo.collection('config').findOneAndUpdate(
            { _id: config._id },
            { $unset: { drawDate: '' } }
          );
          continue;
        }
        await tasks.draw(client, config)
      } catch (err) {
        console.error(err);
      }
    }
  } finally {
    client.destroy();
  }
});

client.login(auth.discord);