import { REST, Routes, SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const createSlash = (name: string, description: string) =>
  new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.BotDM,
      InteractionContextType.PrivateChannel
    ])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall
    ])
    .toJSON();

const commands = [
  createSlash('profile', 'View Lilac\'s profile card & character art'),
  createSlash('character', 'View Lilac\'s character art gallery'),
  createSlash('ping', 'Check bot latency')
];

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID || '1538332097691910164';

if (!token) {
  console.error('❌ DISCORD_TOKEN is missing in environment variables.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`🌸 Refreshing ${commands.length} application (/) commands for client ${clientId}...`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    ) as unknown[];

    console.log(`✅ Successfully registered ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
})();
