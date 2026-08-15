import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('profile')
    .setDescription('🌸 View Lilac\'s official Carrd profile & intro card'),

  new SlashCommandBuilder()
    .setName('card')
    .setDescription('🌸 Display Lilac\'s interactive website card'),

  new SlashCommandBuilder()
    .setName('music')
    .setDescription('🎵 See the currently playing track on lilacbyte.xyz'),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Check bot latency and lilacbyte.xyz API health'),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('✨ View live connection telemetry between Railway and lilacbyte.xyz')
].map(command => command.toJSON());

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID || '1199007203768672297';

if (!token) {
  console.error('❌ DISCORD_TOKEN is missing in environment variables.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`🌸 Refreshing ${commands.length} application (/) commands...`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    ) as unknown[];

    console.log(`✅ Successfully registered ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
})();
