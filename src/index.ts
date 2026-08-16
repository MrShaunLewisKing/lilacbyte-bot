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

// Character Art Outfits hosted on lilacbyte.xyz CDN
const CHARACTER_OUTFITS = [
  {
    name: 'Cozy Hoodie & Sweats',
    url: 'https://lilacbyte.xyz/character/1.jpg',
    desc: 'Oversized pastel pink hoodie with matching sweatpants and pink sneakers.'
  },
  {
    name: 'Off-Shoulder Knit & Skirt',
    url: 'https://lilacbyte.xyz/character/2.jpg',
    desc: 'Soft off-the-shoulder pink sweater, white pleated mini skirt, and thigh-high socks.'
  },
  {
    name: 'Pastel Bodysuit',
    url: 'https://lilacbyte.xyz/character/3.jpg',
    desc: 'Sleek form-fitting zip jumpsuit in signature sakura pink.'
  },
  {
    name: 'Chunky Turtleneck & Boots',
    url: 'https://lilacbyte.xyz/character/4.jpg',
    desc: 'Warm chunky cable-knit turtleneck sweater, pleated skirt, and glossy pink boots.'
  }
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

// Live Media Cache
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

// 1. RP Character Profile Card Builder
async function buildProfileResponse() {
  const media = await getLiveUserMedia();

  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setTitle(`${media.globalName} 🌸`)
    .setURL('https://lilacbyte.xyz')
    .setDescription(
      `*“Simplicity is the keynote of all true elegance.”*\n\n` +
      `╭── ✦ **Character Profile & Lore** ──╮\n` +
      `**Name** ﹕ Lilac (Lily / Lili)\n` +
      `**Age** ﹕ 22\n` +
      `**Gender** ﹕ Female (Femboy)\n` +
      `**Pronouns** ﹕ she / her\n` +
      `**Origin** ﹕ United Kingdom 🇬🇧\n` +
      `**Appearance** ﹕ Long wavy pastel-pink hair, soft pink eyes, cozy aesthetic\n` +
      `**Personality** ﹕ Sweet, gentle, creative, cozy, quiet\n` +
      `╰────────────────────────╯\n\n` +
      `╭── ✦ **Preferences & Traits** ──╮\n` +
      `**Likes** ﹕ Pastel pink, iced matcha latte, cute plushies, rainy days, lo-fi\n` +
      `**Dislikes** ﹕ Loud noises, cold bitter coffee, toxicity, drama, bugs\n` +
      `**Hobbies** ﹕ Cozy gaming, UI/UX design, illustration, web crafting\n` +
      `**Theme Song** ﹕ [Cruel Summer — Taylor Swift](https://music.youtube.com/watch?v=ic8j13piAhQ)\n` +
      `╰────────────────────────╯`
    )
    .setThumbnail(media.avatarURL)
    .setImage(media.bannerURL)
    .setFooter({
      text: 'Roleplay Character Card • lilacbyte.xyz',
      iconURL: media.avatarURL
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('outfit_0')
      .setLabel('Outfits & Gallery 🌸')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setLabel('Interactive Web Card 🌐')
      .setStyle(ButtonStyle.Link)
      .setURL('https://lilacbyte.xyz'),
    new ButtonBuilder()
      .setLabel('Theme Music 🎵')
      .setStyle(ButtonStyle.Link)
      .setURL('https://music.youtube.com/watch?v=ic8j13piAhQ')
  );

  return { embeds: [embed], components: [row] };
}

// 2. Character Outfit Gallery Builder (With named outfits & clean arrows)
async function buildOutfitResponse(index: number) {
  const media = await getLiveUserMedia();
  const total = CHARACTER_OUTFITS.length;
  const safeIndex = Math.max(0, Math.min(index, total - 1));
  const outfit = CHARACTER_OUTFITS[safeIndex];

  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setTitle(`Lilac — Outfit ${safeIndex + 1}/${total} ﹕ ${outfit.name} 🌸`)
    .setURL('https://lilacbyte.xyz')
    .setDescription(`> *${outfit.desc}*`)
    .setThumbnail(media.avatarURL)
    .setImage(outfit.url)
    .setFooter({
      text: `Look ${safeIndex + 1} of ${total} • Hosted on lilacbyte.xyz CDN`,
      iconURL: media.avatarURL
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`outfit_prev_${safeIndex - 1}`)
      .setLabel('⬅️ Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safeIndex === 0),
    new ButtonBuilder()
      .setCustomId('outfit_counter')
      .setLabel(`${safeIndex + 1} / ${total}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`outfit_next_${safeIndex + 1}`)
      .setLabel('Next ➡️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safeIndex === total - 1),
    new ButtonBuilder()
      .setCustomId('back_profile')
      .setLabel('RP Card 🌸')
      .setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row] };
}

// 3. Ping Embed Generator
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
      `• **Roleplay Card** ﹕ \`Active 🌸\`\n` +
      `• **CDN & Web** ﹕ [lilacbyte.xyz](https://lilacbyte.xyz)`
    )
    .setFooter({
      text: 'lilacbyte.xyz bot',
      iconURL: media.avatarURL
    });

  return { embeds: [embed] };
}

// Sync with website
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
    createSlash('profile', '🌸 View Lilac\'s official roleplay character card'),
    createSlash('outfits', '👗 View Lilac\'s full-body outfit gallery'),
    createSlash('ping', '🏓 Check bot latency and API health'),
    createSlash('music', '🎵 See the currently playing track on lilacbyte.xyz')
  ];

  try {
    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('⚡ Registered (/) commands for Guilds & DMs.');
  } catch (err) {
    console.warn('⚠️ Command registration notice:', (err as Error).message);
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`🌸 Logged in as ${c.user.tag}! Roleplay Character Engine Active.`);

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

  getLiveUserMedia();
  syncWithWebsite();
  setInterval(syncWithWebsite, 60000);
});

// Interaction Handler with Whitelist
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

    if (commandName === 'outfits') {
      const res = await buildOutfitResponse(0);
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
        .setTitle('🎵 Theme Music — Cruel Summer')
        .setDescription(
          `**Taylor Swift — Cruel Summer**\n` +
          `*Official character theme song playing on lilacbyte.xyz*\n\n` +
          `• **Playback** ﹕ Seamless Playlist Queue\n` +
          `• **Listen Live** ﹕ [lilacbyte.xyz](https://lilacbyte.xyz)`
        )
        .setThumbnail(media.avatarURL)
        .setImage(media.bannerURL)
        .setFooter({ text: 'lilacbyte.xyz', iconURL: media.avatarURL });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('Open Web Player 🌸')
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

    if (customId === 'outfit_0') {
      const res = await buildOutfitResponse(0);
      return btn.update(res);
    }

    if (customId.startsWith('outfit_prev_')) {
      const idx = parseInt(customId.replace('outfit_prev_', ''), 10);
      const res = await buildOutfitResponse(isNaN(idx) ? 0 : idx);
      return btn.update(res);
    }

    if (customId.startsWith('outfit_next_')) {
      const idx = parseInt(customId.replace('outfit_next_', ''), 10);
      const res = await buildOutfitResponse(isNaN(idx) ? 0 : idx);
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
