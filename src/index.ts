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

const AUTHORIZED_USER_ID = '622858248587837481';

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

// In-memory cache for live user avatar and banner
let userMediaCache = {
  avatarURL: 'https://cdn.discordapp.com/avatars/622858248587837481/fe4a9783f89ee5f27539a78675f0bb2c.png?size=512',
  bannerURL: 'https://cdn.discordapp.com/banners/622858248587837481/059d31c98c90366335465ee69b8d1b39.png?size=1024',
  globalName: '♡₊˚ Lilac .ᐟ',
  lastFetched: 0
};

async function getLiveUserMedia() {
  const now = Date.now();
  if (now - userMediaCache.lastFetched < 180000) {
    return userMediaCache;
  }

  try {
    const user = await client.users.fetch(AUTHORIZED_USER_ID, { force: true });
    if (user) {
      userMediaCache = {
        avatarURL: user.displayAvatarURL({ size: 512, forceStatic: false }),
        bannerURL: user.bannerURL({ size: 1024, forceStatic: false }) || userMediaCache.bannerURL,
        globalName: user.globalName || user.username || '♡₊˚ Lilac .ᐟ',
        lastFetched: now
      };
      return userMediaCache;
    }
  } catch {}

  try {
    const res = await fetch(`https://japi.rest/discord/v1/user/${AUTHORIZED_USER_ID}`);
    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        userMediaCache = {
          avatarURL: json.data.avatarURL?.replace('size=128', 'size=512') || userMediaCache.avatarURL,
          bannerURL: json.data.bannerURL?.replace('size=600', 'size=1024') || userMediaCache.bannerURL,
          globalName: json.data.global_name || '♡₊˚ Lilac .ᐟ',
          lastFetched: now
        };
      }
    }
  } catch {}

  return userMediaCache;
}

// 1. Tidy, Aesthetic Roleplay Profile Card
async function buildProfileResponse() {
  const media = await getLiveUserMedia();

  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setTitle(`${media.globalName} 🌸`)
    .setURL('https://lilacbyte.xyz')
    .setDescription(
      `*“Simplicity is the keynote of all true elegance.”*\n\n` +
      `> **✦ Identity & Info**\n` +
      `• **Age** ﹕ \`22\`\n` +
      `• **From** ﹕ \`United Kingdom\`\n` +
      `• **Gender** ﹕ \`Female (Femboy)\`\n` +
      `• **Pronouns** ﹕ \`she / her\`\n` +
      `• **Aliases** ﹕ \`Lilac\`, \`Lily\`, \`Lili\`\n\n` +
      `> **✦ Preferences**\n` +
      `• **Likes** ﹕ Pastel Aesthetics, Iced Matcha, Cute Plushies, Rainy Days\n` +
      `• **Dislikes** ﹕ Loud Noises, Cold Coffee, Toxicity, Slow Internet\n` +
      `• **Hobbies** ﹕ Cozy Gaming, Digital Art & UI, Lo-Fi Beats, Web Crafting\n\n` +
      `> **✦ Media & Links**\n` +
      `• **Now Playing** ﹕ [Cruel Summer — Taylor Swift](https://music.youtube.com/watch?v=ic8j13piAhQ)\n` +
      `• **Interactive Card** ﹕ [lilacbyte.xyz](https://lilacbyte.xyz)`
    )
    .setThumbnail(media.avatarURL)
    .setImage(media.bannerURL)
    .setFooter({
      text: 'created with love by lilac. • lilacbyte.xyz',
      iconURL: media.avatarURL
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('char_0')
      .setLabel('Character Art 🌸')
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

// 2. Character Image Gallery (With clean arrows & direct back-to-profile)
async function buildCharacterResponse(index: number) {
  const media = await getLiveUserMedia();
  const total = CHARACTER_IMAGES.length;
  const safeIndex = Math.max(0, Math.min(index, total - 1));
  const imageUrl = CHARACTER_IMAGES[safeIndex];

  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setTitle(`${media.globalName} — Character Gallery (${safeIndex + 1}/${total}) 🌸`)
    .setURL('https://lilacbyte.xyz')
    .setDescription(`> Full-body character art render • **Look ${safeIndex + 1} of ${total}**`)
    .setThumbnail(media.avatarURL)
    .setImage(imageUrl)
    .setFooter({
      text: `Image ${safeIndex + 1} of ${total} • Hosted on lilacbyte.xyz CDN`,
      iconURL: media.avatarURL
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
      .setLabel('Profile Card 🌸')
      .setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row] };
}

// 3. Ping Embed Generator (With Live PFP in top-right thumbnail)
async function buildPingResponse(gatewayPing: number, latency: number) {
  const media = await getLiveUserMedia();

  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setTitle('🏓 Pong!')
    .setThumbnail(media.avatarURL)
    .setDescription(
      `> **✦ Bot Telemetry**\n` +
      `• **Bot Latency** ﹕ \`${latency}ms\`\n` +
      `• **Gateway Ping** ﹕ \`${Math.round(gatewayPing)}ms\`\n` +
      `• **Status** ﹕ \`Operational 🟢\`\n` +
      `• **CDN & Web** ﹕ [lilacbyte.xyz](https://lilacbyte.xyz)`
    )
    .setFooter({
      text: 'lilacbyte.xyz bot',
      iconURL: media.avatarURL
    });

  return { embeds: [embed] };
}

// Sync presence to website connector API
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

// Auto Register Slash Commands
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
    createSlash('profile', '🌸 View Lilac\'s official roleplay profile card & character gallery'),
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

  // Pre-fetch live user media
  getLiveUserMedia();

  syncWithWebsite();
  setInterval(syncWithWebsite, 60000);
});

// Interaction Handler with Whitelist & Roleplay Cards
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.user.id !== AUTHORIZED_USER_ID) {
    if (interaction.isRepliable()) {
      return interaction.reply({
        content: '🌸 Only Lilac (<@622858248587837481>) can interact with this bot right now.',
        ephemeral: true
      });
    }
    return;
  }

  // Slash Commands
  if (interaction.isChatInputCommand()) {
    const cmd = interaction as ChatInputCommandInteraction;
    const { commandName } = cmd;

    if (commandName === 'profile') {
      const res = await buildProfileResponse();
      return cmd.reply(res);
    }

    if (commandName === 'character') {
      const res = await buildCharacterResponse(0);
      return cmd.reply(res);
    }

    if (commandName === 'ping') {
      const sent = await cmd.reply({ content: '🏓 Pinging...', fetchReply: true });
      const latency = sent.createdTimestamp - cmd.createdTimestamp;
      const res = await buildPingResponse(client.ws.ping, latency);
      return cmd.editReply(res);
    }

    if (commandName === 'music') {
      const media = await getLiveUserMedia();
      const embed = new EmbedBuilder()
        .setColor(0xf472b6)
        .setTitle('🎵 Currently Playing on lilacbyte.xyz')
        .setDescription(
          `**Taylor Swift — Cruel Summer**\n` +
          `*Continuous playlist streaming enabled with exact timestamp restoration.*\n\n` +
          `• **Engine** ﹕ Client-Side YouTube Iframe\n` +
          `• **Mode** ﹕ Seamless Playlist Queue\n` +
          `• **Listen** ﹕ [Open Player](https://lilacbyte.xyz)`
        )
        .setThumbnail(media.avatarURL)
        .setImage(media.bannerURL)
        .setFooter({ text: 'lilacbyte.xyz', iconURL: media.avatarURL });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('Open Music Player 🌸')
          .setStyle(ButtonStyle.Link)
          .setURL('https://lilacbyte.xyz'),
        new ButtonBuilder()
          .setLabel('YouTube Music 🎵')
          .setStyle(ButtonStyle.Link)
          .setURL('https://music.youtube.com/watch?v=ic8j13piAhQ')
      );

      return cmd.reply({ embeds: [embed], components: [row] });
    }
  }

  // Button Interactions
  if (interaction.isButton()) {
    const btn = interaction as ButtonInteraction;
    const { customId } = btn;

    if (customId === 'char_0') {
      const res = await buildCharacterResponse(0);
      return btn.update(res);
    }

    if (customId.startsWith('char_prev_')) {
      const idx = parseInt(customId.replace('char_prev_', ''), 10);
      const res = await buildCharacterResponse(isNaN(idx) ? 0 : idx);
      return btn.update(res);
    }

    if (customId.startsWith('char_next_')) {
      const idx = parseInt(customId.replace('char_next_', ''), 10);
      const res = await buildCharacterResponse(isNaN(idx) ? 0 : idx);
      return btn.update(res);
    }

    if (customId === 'back_profile') {
      const res = await buildProfileResponse();
      return btn.update(res);
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

    const res = await buildProfileResponse();
    return message.reply(res);
  }
});

client.on(Events.Error, (err) => {
  console.error('❌ Gateway Error:', err.message);
});

const token = process.env.DISCORD_TOKEN;
if (token) {
  client.login(token);
}
