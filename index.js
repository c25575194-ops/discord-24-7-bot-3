require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Web server started'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const guildId = process.env.GUILD_ID;
  const channelId = process.env.VOICE_CHANNEL_ID;

  try {
    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);

    if (!channel) {
      console.log('❌ ไม่พบห้องเสียง ตรวจสอบ ID อีกครั้ง');
      return;
    }

    joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    console.log('🎧 เข้าห้องเสียงเรียบร้อยแล้ว!');
  } catch (error) {
    console.error('⚠️ เกิดข้อผิดพลาดในการเข้าห้องเสียง:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
