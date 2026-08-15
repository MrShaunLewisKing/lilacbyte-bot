import {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences
  ]
});

const LILAC_API_URL = process.env.LILAC_API_URL || 'https://lilacbyte.xyz/api/bot';
const LILAC_BOT_SECRET = process.env.LILAC_BOT_SECRET || '';

// Sync bot stats with lilacbyte.xyz connector API
async function syncWithWebsite() {
  try {
    const payload = {
      guildCount: client.guilds.cache.size,
      userCount: client.users.cache.size,
      currentActivity: '🌸 lilacbyte.xyz • Cruel Summer',
      customStatus: 'lilacbyte.xyz connected'
    };

    const res = await fetch(LILAC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(LILAC_BOT_SECRET ? { Authorization: `Bearer ${LILAC_BOT_SECRET}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log('✅ Synced presence with lilacbyte.xyz');
    }
  } catch (err) {
    console.warn('⚠️ Could not sync with lilacbyte.xyz:', (err as Error).message);
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`🌸 Logged in as ${c.user.tag}! Connected 24/7 via Railway.`);

  // Set rich custom presence
  c.user.setPresence({
    activities: [
      {
        name: '🌸 lilacbyte.xyz',
        type: ActivityType.Custom,
        state: '🌸 lilacbyte.xyz • Taylor Swift'
      }
    ],
    status: 'online'
  });

  // Sync with website immediately and every 60s
  syncWithWebsite();
  setInterval(syncWithWebsite, 60000);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply({
      content: `🌸 **Pong!**\n⚡ **Bot Latency:** \`${latency}ms\`\n🌐 **API Gateway:** \`${Math.round(client.ws.ping)}ms\`\n🔗 **Website:** [lilacbyte.xyz](https://lilacbyte.xyz)`
    });
  }

  else if (commandName === 'profile' || commandName === 'card') {
    const embed = new EmbedBuilder()
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
      })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Visit lilacbyte.xyz 🌸')
        .setStyle(ButtonStyle.Link)
        .setURL('https://lilacbyte.xyz'),
      new ButtonBuilder()
        .setLabel('Listen to Playlist 🎵')
        .setStyle(ButtonStyle.Link)
        .setURL('https://music.youtube.com/watch?v=ic8j13piAhQ')
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }

  else if (commandName === 'music') {
    const embed = new EmbedBuilder()
      .setColor(0xf472b6)
      .setTitle('🎵 Currently Playing on lilacbyte.xyz')
      .setDescription('**Taylor Swift — Cruel Summer**\n*Continuous playlist streaming enabled with exact timestamp restoration.*')
      .setURL('https://music.youtube.com/watch?v=ic8j13piAhQ')
      .addFields(
        { name: '🔊 Audio Engine', value: 'Client-Side YouTube Iframe API', inline: true },
        { name: '🔁 Loop Mode', value: 'Infinite Playlist Queue', inline: true }
      )
      .setFooter({ text: 'lilacbyte.xyz' });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Open Music Player 🌸')
        .setStyle(ButtonStyle.Link)
        .setURL('https://lilacbyte.xyz')
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }

  else if (commandName === 'status') {
    const embed = new EmbedBuilder()
      .setColor(0x23a55a)
      .setTitle('✨ lilacbyte.xyz Telemetry & Status')
      .addFields(
        { name: '🤖 Bot Status', value: '🟢 Online 24/7 via Railway', inline: true },
        { name: '🌐 Frontend', value: 'Vercel Edge Network', inline: true },
        { name: '🔌 Connector API', value: '`https://lilacbyte.xyz/api/bot`', inline: false },
        { name: '📊 Guilds', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Cached Users', value: `${client.users.cache.size}`, inline: true }
      )
      .setFooter({ text: 'lilacbyte.xyz' });

    await interaction.reply({ embeds: [embed] });
  }
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.log('🌸 Tip: Set DISCORD_TOKEN in Railway environment variables to start the bot.');
} else {
  client.login(token);
}
