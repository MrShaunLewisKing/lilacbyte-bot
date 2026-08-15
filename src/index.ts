import {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  Options,
  REST,
  Routes,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// 1. Client Configuration with DM support & Partials
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User
  ],
  makeCache: Options.cacheWithLimits({
    MessageManager: 10,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    GuildMemberManager: 10,
    UserManager: 20,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    StageInstanceManager: 0,
    VoiceStateManager: 0,
    GuildScheduledEventManager: 0,
    AutoModerationRuleManager: 0
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: {
      interval: 300,
      lifetime: 60
    }
  }
});

const LILAC_API_URL = process.env.LILAC_API_URL || 'https://lilacbyte.xyz/api/bot';
const LILAC_BOT_SECRET = process.env.LILAC_BOT_SECRET || '';

// 2. Pre-computed static response components
const profileEmbed = new EmbedBuilder()
  .setColor(0xf472b6)
  .setTitle('♡₊˚ Lilac .ᐟ 🌸')
  .setURL('https://lilacbyte.xyz')
  .setDescription('Welcome to Lilac\'s official Carrd-style interactive space!')
  .setThumbnail('https://cdn.discordapp.com/avatars/622858248587837481/a_ca1e23ad2e95a12269c6ba7d1000bb7d.png?size=512')
  .addFields(
    { name: '🎂 Age', value: '22', inline: true },
    { name: '📍 Location', value: 'United Kingdom', inline: true },
    { name: '🌸 Gender', value: 'Female (Femboy)', inline: true },
    { name: '🏷️ Pronouns', value: 'she/her', inline: true },
    { name: '✨ Nicknames', value: 'Lilac, Lily, Lili', inline: true },
    { name: '🎵 Now Playing', value: 'Cruel Summer by Taylor Swift', inline: false }
  )
  .setFooter({
    text: 'created with love by lilac. • lilacbyte.xyz',
    iconURL: 'https://cdn.discordapp.com/avatars/622858248587837481/a_ca1e23ad2e95a12269c6ba7d1000bb7d.png?size=128'
  });

const profileButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setLabel('Visit lilacbyte.xyz 🌸')
    .setStyle(ButtonStyle.Link)
    .setURL('https://lilacbyte.xyz'),
  new ButtonBuilder()
    .setLabel('Listen to Playlist 🎵')
    .setStyle(ButtonStyle.Link)
    .setURL('https://music.youtube.com/watch?v=ic8j13piAhQ')
);

const musicEmbed = new EmbedBuilder()
  .setColor(0xf472b6)
  .setTitle('🎵 Currently Playing on lilacbyte.xyz')
  .setDescription('**Taylor Swift — Cruel Summer**\n*Continuous playlist streaming enabled with exact timestamp restoration.*')
  .setURL('https://music.youtube.com/watch?v=ic8j13piAhQ')
  .addFields(
    { name: '🔊 Audio Engine', value: 'Client-Side YouTube Iframe API', inline: true },
    { name: '🔁 Loop Mode', value: 'Infinite Playlist Queue', inline: true }
  )
  .setFooter({ text: 'lilacbyte.xyz' });

const musicButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setLabel('Open Music Player 🌸')
    .setStyle(ButtonStyle.Link)
    .setURL('https://lilacbyte.xyz')
);

// 3. Fast non-blocking website telemetry sync
async function syncWithWebsite() {
  try {
    const payload = {
      guildCount: client.guilds.cache.size,
      userCount: client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 1), 0),
      currentActivity: '🌸 lilacbyte.xyz • Cruel Summer',
      customStatus: 'lilacbyte.xyz connected'
    };

    await fetch(LILAC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(LILAC_BOT_SECRET ? { Authorization: `Bearer ${LILAC_BOT_SECRET}` } : {})
      },
      body: JSON.stringify(payload)
    });
  } catch {}
}

// 4. Register slash commands enabled in Guilds, DMs, and User-Installed Contexts
async function autoRegisterCommands(clientId: string, token: string) {
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
    createSlash('profile', '🌸 View Lilac\'s official Carrd profile & intro card'),
    createSlash('card', '🌸 Display Lilac\'s interactive website card'),
    createSlash('music', '🎵 See the currently playing track on lilacbyte.xyz'),
    createSlash('ping', '🏓 Check bot latency and lilacbyte.xyz API health'),
    createSlash('status', '✨ View live connection telemetry between Railway and lilacbyte.xyz')
  ];

  try {
    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('⚡ Registered (/) commands for Guilds, DMs & User Installs.');
  } catch (err) {
    console.warn('⚠️ Slash command registration notice:', (err as Error).message);
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`🌸 Logged in as ${c.user.tag}! Rapid 24/7 Gateway active (Guilds & DMs).`);

  c.user.setPresence({
    activities: [
      {
        name: '🌸 lilacbyte.xyz',
        type: ActivityType.Custom,
        state: '🌸 lilacbyte.xyz • Cruel Summer'
      }
    ],
    status: 'online'
  });

  const token = process.env.DISCORD_TOKEN;
  if (token) {
    autoRegisterCommands(c.user.id, token);
  }

  syncWithWebsite();
  setInterval(syncWithWebsite, 60000);
});

// 5. Slash Interaction Handler (Handles both Guild & DM interactions)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const isDM = !interaction.inGuild();

  if (commandName === 'ping') {
    return interaction.reply({
      content: `🌸 **Pong!**\n⚡ **Gateway Latency:** \`${Math.round(client.ws.ping)}ms\`\n📍 **Context:** ${isDM ? 'Direct Message (DM) 💌' : 'Server Guild 🏰'}\n🌐 **Website:** [lilacbyte.xyz](https://lilacbyte.xyz)`,
      ephemeral: false
    });
  }

  if (commandName === 'profile' || commandName === 'card') {
    return interaction.reply({
      embeds: [profileEmbed],
      components: [profileButtons]
    });
  }

  if (commandName === 'music') {
    return interaction.reply({
      embeds: [musicEmbed],
      components: [musicButtons]
    });
  }

  if (commandName === 'status') {
    const statusEmbed = new EmbedBuilder()
      .setColor(0x23a55a)
      .setTitle('✨ lilacbyte.xyz Telemetry & Status')
      .addFields(
        { name: '🤖 Bot Status', value: '🟢 Online 24/7 via Railway', inline: true },
        { name: '🌐 Frontend', value: 'Vercel Edge Network', inline: true },
        { name: '⚡ Gateway Ping', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
        { name: '💌 DM Commands', value: '✅ Supported Anywhere', inline: true },
        { name: '🔌 Connector API', value: '`https://lilacbyte.xyz/api/bot`', inline: false },
        { name: '📊 Guilds', value: `${client.guilds.cache.size}`, inline: true }
      )
      .setFooter({ text: 'lilacbyte.xyz' });

    return interaction.reply({ embeds: [statusEmbed] });
  }
});

// 6. Direct Message Auto-Responder (When users send a direct text message to the bot)
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // If received in DMs
  if (!message.guild) {
    try {
      await message.reply({
        content: `Hi **${message.author.username}**! 🌸 I'm Lilac's official assistant bot.\n\nYou can use slash commands like </profile:0> or </music:0> right here in DMs!`,
        embeds: [profileEmbed],
        components: [profileButtons]
      });
    } catch {}
  }
});

client.on(Events.Error, (err) => {
  console.error('❌ Gateway Error:', err.message);
});

const token = process.env.DISCORD_TOKEN;
if (token) {
  client.login(token);
}
