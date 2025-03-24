// Various crucial imports to ensure discord.js runs smoothly with all of it's dependencies
import { Client, Events, GatewayIntentBits, REST, Routes, TextChannel } from 'discord.js';
import { config } from "dotenv";
config();


// Constants used in the bot to store various IDs and Tokens
const TOKEN = process.env.DISCORD_BOT_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const GUILD_ID = process.env.DISCORD_GUILD_ID!;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID!;


//This block describes what the bot will be listening for, aka: The server, server messages, and message content
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});


// Shuts down the bot when CTRL+C is pressed
process.on('SIGINT', async () => {
  console.log("SIGINT received (CTRL+C)");
  await informShutdown();
  process.exit(0);
});


// When the client is initially run a message is sent to the terminal, and the function 'informLaunch' is called
client.on(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  await informLaunch();
});


// The function 'informLaunch' fetches the channel ID, checks if it's a text channel, 
// and sends a message to that channel informing that the bot is up and running
async function informLaunch() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (channel && channel instanceof TextChannel) {
      await channel.send("⏰ Timebot is up and running!");
      console.log("Launch message sent.");
    } else {
      console.error("Channel is not a text channel or doesn't exist.");
    }
  } catch (err) {
    console.error("Error fetching/sending to channel:", err);
  }
}


// The function 'informShutdown' is exactly like 'informLaunc', but instead sends a message when the bot has been shut down
async function informShutdown() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (channel && channel instanceof TextChannel) {
      await channel.send("⏰ Timebot has stopped responding!");
      console.log("Launch message sent.");
    } else {
      console.error("Channel is not a text channel or doesn't exist.");
    }
  } catch (err) {
    console.error("Error fetching/sending to channel:", err);
  }
}


// This block decides which commands are capable of being called and describes them
const commands = [
  {
    name: 'time',
    description: 'Replies with time!',
  },
];


// This block ensure functionality of interactions(/) It checks if what is written is one of the commands, 
// and based off of what is written replies with a prewritten response. 
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    console.log(`Received interaction: ${interaction.commandName}`);

    if (interaction.commandName === 'time') {
      const currentDate = new Date(); 
      await interaction.reply(currentDate.toString());
      console.log("Responded with time");
    }
  } catch (err) {
    console.error("Error handling interaction:", err);
  }
});


// This block initially creates a "rest" client, and this is in order to communicate with discords API for command registration. 
// Further into the block the various commands are registered to the server via the server ID. At the bottom, the bot client connects to discord.
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Refreshing GUILD slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Slash commands registered instantly for this guild!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
  await client.login(TOKEN);
})();
