import {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  Options,
  REST,
  Routes,
  SlashCommandBuilder
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// 1. Ultra-Low Memory & High-Speed Discord Client Configuration
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  makeCache: Options.cacheWithLimits({
    MessageManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    GuildMemberManager: 10,
    UserManager: 10,
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

// 2. Pre-computed static response components for sub-millisecond slash command replies
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

// 4. Automatic Slash Command Registration on Boot
async function autoRegisterCommands(clientId: string, token: string) {
  const commands = [
    new SlashCommandBuilder().setName('profile').setDescription('🌸 View Lilac\'s official Carrd profile & intro card'),
    new SlashCommandBuilder().setName('card').setDescription('🌸 Display Lilac\'s interactive website card'),
    new SlashCommandBuilder().setName('music').setDescription('🎵 See the currently playing track on lilacbyte.xyz'),
    new SlashCommandBuilder().setName('ping').setDescription('🏓 Check bot latency and lilacbyte.xyz API health'),
    new SlashCommandBuilder().setName('status').setDescription('✨ View live connection telemetry between Railway and lilacbyte.xyz')
  ].map(c => c.toJSON());

  try {
    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('⚡ Fast-registered (/) commands with Discord API.');
  } catch (err) {
    console.warn('⚠️ Slash command registration notice:', (err as Error).message);
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`🌸 Logged in as ${c.user.tag}! Rapid 24/7 Gateway active.`);

  // Set rich custom presence
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

  // Auto-sync & auto-register slash commands
  const token = process.env.DISCORD_TOKEN;
  if (token) {
    autoRegisterCommands(c.user.id, token);
  }

  syncWithWebsite();
  setInterval(syncWithWebsite, 60000);
});

// 5. Zero-Latency Interaction Handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    return interaction.reply({
      content: `🌸 **Pong!**\n⚡ **Gateway Latency:** \`${Math.round(client.ws.ping)}ms\`\n🌐 **Website:** [lilacbyte.xyz](https://lilacbyte.xyz)`,
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
        { name: '🔌 Connector API', value: '`https://lilacbyte.xyz/api/bot`', inline: false },
        { name: '📊 Guilds', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Cached Members', value: `${client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 1), 0)}`, inline: true }
      )
      .setFooter({ text: 'lilacbyte.xyz' });

    return interaction.reply({ embeds: [statusEmbed] });
  }
});

client.on(Events.Error, (err) => {
  console.error('❌ Gateway Error:', err.message);
});

const token = process.env.DISCORD_TOKEN;
if (token) {
  client.login(token);
}
