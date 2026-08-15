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
  ApplicationIntegrationType,
  ButtonInteraction,
  ChatInputCommandInteraction
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// Whitelisted User ID (Only Lilac can interact)
const AUTHORIZED_USER_ID = '622858248587837481';
const LILAC_AVATAR_URL = 'https://cdn.discordapp.com/avatars/622858248587837481/a_ca1e23ad2e95a12269c6ba7d1000bb7d.png?size=512';

// Hosted Character CDN Images on lilacbyte.xyz
const CHARACTER_IMAGES = [
  'https://lilacbyte.xyz/character/1.jpg',
  'https://lilacbyte.xyz/character/2.jpg',
  'https://lilacbyte.xyz/character/3.jpg',
  'https://lilacbyte.xyz/character/4.jpg'
];

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
  })
});

const LILAC_API_URL = process.env.LILAC_API_URL || 'https://lilacbyte.xyz/api/bot';
const LILAC_BOT_SECRET = process.env.LILAC_BOT_SECRET || '';

// 1. Profile Embed Generator (With PFP in top-right thumbnail)
function buildProfileResponse() {
  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setTitle('♡₊˚ Lilac .ᐟ 🌸')
    .setURL('https://lilacbyte.xyz')
    .setDescription('Personal intro card & digital space.')
    .setThumbnail(LILAC_AVATAR_URL)
    .addFields(
      { name: '🎂 Age', value: '22', inline: true },
      { name: '📍 From', value: 'United Kingdom', inline: true },
      { name: '🌸 Gender', value: 'Female (Femboy)', inline: true },
      { name: '🏷️ Pronouns', value: 'she/her', inline: true },
      { name: '✨ Nicknames', value: 'Lilac, Lily, Lili', inline: true },
      { name: '🎵 Now Playing', value: 'Cruel Summer by Taylor Swift', inline: false }
    )
    .setFooter({
      text: 'created with love by lilac. • lilacbyte.xyz',
      iconURL: LILAC_AVATAR_URL
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('char_0')
      .setLabel('Character 🌸')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setLabel('Website 🌐')
      .setStyle(ButtonStyle.Link)
      .setURL('https://lilacbyte.xyz'),
    new ButtonBuilder()
      .setLabel('Music 🎵')
      .setStyle(ButtonStyle.Link)
      .setURL('https://music.youtube.com/watch?v=ic8j13piAhQ')
  );

  return { embeds: [embed], components: [row] };
}

// 2. Character Image Gallery Builder (With prev/next arrows)
function buildCharacterResponse(index: number) {
  const total = CHARACTER_IMAGES.length;
  const safeIndex = Math.max(0, Math.min(index, total - 1));
  const imageUrl = CHARACTER_IMAGES[safeIndex];

  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setTitle(`Lilac — Character Art (${safeIndex + 1}/${total}) 🌸`)
    .setURL('https://lilacbyte.xyz')
    .setThumbnail(LILAC_AVATAR_URL)
    .setImage(imageUrl)
    .setFooter({
      text: `Image ${safeIndex + 1} of ${total} • Hosted on lilacbyte.xyz CDN`,
      iconURL: LILAC_AVATAR_URL
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`char_prev_${safeIndex - 1}`)
      .setLabel('⬅️ Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safeIndex === 0),
    new ButtonBuilder()
      .setCustomId('char_counter')
      .setLabel(`${safeIndex + 1} / ${total}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`char_next_${safeIndex + 1}`)
      .setLabel('Next ➡️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safeIndex === total - 1),
    new ButtonBuilder()
      .setCustomId('back_profile')
      .setLabel('Profile 🌸')
      .setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row] };
}

// 3. Ping Embed Generator (With PFP in top-right thumbnail)
function buildPingResponse(gatewayPing: number, latency: number) {
  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setTitle('🏓 Pong!')
    .setThumbnail(LILAC_AVATAR_URL)
    .addFields(
      { name: '⚡ Bot Latency', value: `\`${latency}ms\``, inline: true },
      { name: '🌐 Gateway Ping', value: `\`${Math.round(gatewayPing)}ms\``, inline: true },
      { name: '🌸 Status', value: 'Operational', inline: true },
      { name: '🔗 Website', value: '[lilacbyte.xyz](https://lilacbyte.xyz)', inline: false }
    )
    .setFooter({
      text: 'lilacbyte.xyz bot',
      iconURL: LILAC_AVATAR_URL
    });

  return { embeds: [embed] };
}

// Fast non-blocking website sync
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

// Auto Slash Command Registration
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
    createSlash('profile', '🌸 View Lilac\'s official profile & character art'),
    createSlash('character', '🖼️ View Lilac\'s full-body character art gallery'),
    createSlash('ping', '🏓 Check bot latency and API health'),
    createSlash('music', '🎵 See the currently playing track on lilacbyte.xyz')
  ];

  try {
    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('⚡ Registered (/) commands.');
  } catch (err) {
    console.warn('⚠️ Command registration notice:', (err as Error).message);
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`🌸 Logged in as ${c.user.tag}! Ready for Lilac (${AUTHORIZED_USER_ID}).`);

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

// Interaction Handler with User Whitelist Check
client.on(Events.InteractionCreate, async (interaction) => {
  // Check authorization: only user 622858248587837481 can interact
  if (interaction.user.id !== AUTHORIZED_USER_ID) {
    if (interaction.isRepliable()) {
      return interaction.reply({
        content: '🌸 Only Lilac (<@622858248587837481>) can interact with this bot right now.',
        ephemeral: true
      });
    }
    return;
  }

  // Handle Slash Commands
  if (interaction.isChatInputCommand()) {
    const cmd = interaction as ChatInputCommandInteraction;
    const { commandName } = cmd;

    if (commandName === 'profile') {
      return cmd.reply(buildProfileResponse());
    }

    if (commandName === 'character') {
      return cmd.reply(buildCharacterResponse(0));
    }

    if (commandName === 'ping') {
      const sent = await cmd.reply({ content: '🏓 Pinging...', fetchReply: true });
      const latency = sent.createdTimestamp - cmd.createdTimestamp;
      return cmd.editReply(buildPingResponse(client.ws.ping, latency));
    }

    if (commandName === 'music') {
      const embed = new EmbedBuilder()
        .setColor(0xf472b6)
        .setTitle('🎵 Currently Playing on lilacbyte.xyz')
        .setDescription('**Taylor Swift — Cruel Summer**\n*Continuous playlist streaming enabled with exact timestamp restoration.*')
        .setThumbnail(LILAC_AVATAR_URL)
        .setURL('https://music.youtube.com/watch?v=ic8j13piAhQ')
        .setFooter({ text: 'lilacbyte.xyz' });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('Open Music Player 🌸')
          .setStyle(ButtonStyle.Link)
          .setURL('https://lilacbyte.xyz')
      );

      return cmd.reply({ embeds: [embed], components: [row] });
    }
  }

  // Handle Button Clicks (Character Gallery & Back to Profile)
  if (interaction.isButton()) {
    const btn = interaction as ButtonInteraction;
    const { customId } = btn;

    if (customId === 'char_0') {
      return btn.update(buildCharacterResponse(0));
    }

    if (customId.startsWith('char_prev_')) {
      const idx = parseInt(customId.replace('char_prev_', ''), 10);
      return btn.update(buildCharacterResponse(isNaN(idx) ? 0 : idx));
    }

    if (customId.startsWith('char_next_')) {
      const idx = parseInt(customId.replace('char_next_', ''), 10);
      return btn.update(buildCharacterResponse(isNaN(idx) ? 0 : idx));
    }

    if (customId === 'back_profile') {
      return btn.update(buildProfileResponse());
    }
  }
});

// DM Auto-Responder (Only for Lilac)
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (!message.guild) {
    if (message.author.id !== AUTHORIZED_USER_ID) {
      return message.reply({
        content: '🌸 Only Lilac can message this bot right now.'
      });
    }

    return message.reply(buildProfileResponse());
  }
});

client.on(Events.Error, (err) => {
  console.error('❌ Gateway Error:', err.message);
});

const token = process.env.DISCORD_TOKEN;
if (token) {
  client.login(token);
}
