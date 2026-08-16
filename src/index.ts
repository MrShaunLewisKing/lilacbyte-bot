import path from 'path';
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
  ChatInputCommandInteraction,
  AttachmentBuilder
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const AUTHORIZED_USER_ID = '622858248587837481';
const TOTAL_CHARACTER_IMAGES = 4;

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

// 1. Clean Profile Card (No flower in title, aligned tidy spacing)
async function buildProfileResponse() {
  const media = await getLiveUserMedia();

  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setTitle(media.globalName)
    .setURL('https://lilacbyte.xyz')
    .setThumbnail(media.avatarURL)
    .setDescription(
      `• **Age** ﹕ 22\n` +
      `• **From** ﹕ United Kingdom\n` +
      `• **Gender** ﹕ Female (Femboy)\n` +
      `• **Pronouns** ﹕ she/her\n` +
      `• **Nicknames** ﹕ Lilac, Lily, Lili\n\n` +
      `• **Likes** ﹕ Pastels, matcha, plushies, lo-fi\n` +
      `• **Dislikes** ﹕ Loud noises, cold coffee, drama`
    )
    .setImage(media.bannerURL)
    .setFooter({
      text: 'lilacbyte.xyz',
      iconURL: media.avatarURL
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('char_0')
      .setLabel('Character 🌸')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setLabel('Website 🌐')
      .setStyle(ButtonStyle.Link)
      .setURL('https://lilacbyte.xyz')
  );

  return { embeds: [embed], components: [row], files: [] };
}

// 2. Full-Res Native Attachment Character Gallery
function buildCharacterResponse(index: number) {
  const safeIndex = Math.max(0, Math.min(index, TOTAL_CHARACTER_IMAGES - 1));
  const imageNumber = safeIndex + 1;
  const fileName = `character_${imageNumber}.jpg`;
  const filePath = path.resolve(process.cwd(), `assets/${fileName}`);

  const attachment = new AttachmentBuilder(filePath, { name: fileName });

  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setImage(`attachment://${fileName}`);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`char_prev_${safeIndex - 1}`)
      .setLabel('⬅️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safeIndex === 0),
    new ButtonBuilder()
      .setCustomId('char_counter')
      .setLabel(`${safeIndex + 1} / ${TOTAL_CHARACTER_IMAGES}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`char_next_${safeIndex + 1}`)
      .setLabel('➡️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safeIndex === TOTAL_CHARACTER_IMAGES - 1),
    new ButtonBuilder()
      .setCustomId('back_profile')
      .setLabel('Profile 🌸')
      .setStyle(ButtonStyle.Primary)
  );

  return { embeds: [embed], components: [row], files: [attachment] };
}

// 3. Simple Ping Embed
async function buildPingResponse(gatewayPing: number, latency: number) {
  const media = await getLiveUserMedia();

  const embed = new EmbedBuilder()
    .setColor(0xf472b6)
    .setTitle('🏓 Pong!')
    .setThumbnail(media.avatarURL)
    .setDescription(
      `• **Latency** ﹕ \`${latency}ms\`\n` +
      `• **Gateway** ﹕ \`${Math.round(gatewayPing)}ms\`\n` +
      `• **Website** ﹕ [lilacbyte.xyz](https://lilacbyte.xyz)`
    );

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
    createSlash('profile', 'View Lilac\'s profile card & character art'),
    createSlash('character', 'View Lilac\'s character art gallery'),
    createSlash('ping', 'Check bot latency')
  ];

  try {
    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('⚡ Registered clean (/) commands.');
  } catch (err) {
    console.warn('⚠️ Command registration notice:', (err as Error).message);
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`🌸 Logged in as ${c.user.tag}! Clean Profile Ready.`);

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

    if (commandName === 'character') {
      const res = buildCharacterResponse(0);
      return cmd.reply(res);
    }

    if (commandName === 'ping') {
      const sent = await cmd.reply({ content: '🏓 Pinging...', fetchReply: true });
      const latency = sent.createdTimestamp - cmd.createdTimestamp;
      const res = await buildPingResponse(client.ws.ping, latency);
      return cmd.editReply(res);
    }
  }

  // Button Interactions
  if (interaction.isButton()) {
    const btn = interaction as ButtonInteraction;
    const { customId } = btn;

    if (customId === 'char_0') {
      const res = buildCharacterResponse(0);
      return btn.update(res);
    }

    if (customId.startsWith('char_prev_')) {
      const idx = parseInt(customId.replace('char_prev_', ''), 10);
      const res = buildCharacterResponse(isNaN(idx) ? 0 : idx);
      return btn.update(res);
    }

    if (customId.startsWith('char_next_')) {
      const idx = parseInt(customId.replace('char_next_', ''), 10);
      const res = buildCharacterResponse(isNaN(idx) ? 0 : idx);
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
