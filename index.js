import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(port, () => console.log(`✅ Web server running on port ${port}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ],
});

let targetChannelId = process.env.VOICE_CHANNEL_ID;
let targetGuildId = process.env.GUILD_ID;

const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play,
  },
});

// ฟังก์ชันเข้าห้องเสียง
function joinChannel() {
  try {
    const guild = client.guilds.cache.get(targetGuildId);
    const channel = guild.channels.cache.get(targetChannelId);
    if (!channel) return console.log("❌ ไม่พบห้องเสียง ตรวจสอบ VOICE_CHANNEL_ID อีกครั้ง");

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    connection.subscribe(player);
    console.log("🎧 เข้าห้องเสียงเรียบร้อยแล้ว:", channel.name);

    // ถ้าหลุดจากเสียง จะพยายามเชื่อมใหม่
    connection.on('disconnect', () => {
      console.log('⚠️ หลุดจากห้องเสียง กำลังเชื่อมใหม่...');
      setTimeout(joinChannel, 5000);
    });

  } catch (err) {
    console.error('❌ Error joining voice channel:', err);
  }
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  joinChannel();

  // ระบบตรวจทุก 10 นาที ว่ายังอยู่ไหม
  setInterval(() => {
    const guild = client.guilds.cache.get(targetGuildId);
    const connection = guild?.voiceAdapterCreator;
    if (!connection) {
      console.log("🔁 ไม่พบการเชื่อมต่อ กำลังเข้าห้องใหม่...");
      joinChannel();
    }
  }, 10 * 60 * 1000);
});

client.login(process.env.TOKEN);
