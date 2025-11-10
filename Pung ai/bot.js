// bot.js
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import { Client, GatewayIntentBits, Partials, PermissionsBitField } from 'discord.js';
import db from './utils/database.js';
import AIAgent from './utils/aiAgent.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
  partials: [Partials.Channel]
});

// Initialize AI Agent
const agent = new AIAgent(client);

// Verify environment variables are loaded
if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY not found in environment variables!');
  process.exit(1);
}
if (!process.env.DISCORD_TOKEN) {
  console.error('ERROR: DISCORD_TOKEN not found in environment variables!');
  process.exit(1);
}

console.log('✓ Environment variables loaded');
console.log('✓ Gemini API Key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BOT_PREFIX = '/'; // slash commands
const OWNER_ID = process.env.OWNER_ID; // only this user can force destructive actions
const MODERATOR_ROLE_ID = '917191156528451605'; // Only users with this role can use moderation commands

// Conversation memory storage (userId -> array of messages)
const conversationMemory = new Map();
const MAX_HISTORY = 10; // Keep last 10 messages per user

// Warning system storage (guildId -> userId -> array of warnings)
const warningSystem = new Map();

// Long-term user memory (userId -> facts about user)
const userMemories = new Map();

// Server-wide memory (guildId -> facts about server)
const serverMemories = new Map();

// Message logs for summaries (guildId -> array of messages with timestamps)
const messageLogs = new Map();
const LOG_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Clean old logs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [guildId, logs] of messageLogs.entries()) {
    messageLogs.set(guildId, logs.filter(log => now - log.timestamp < LOG_DURATION));
  }
}, 10 * 60 * 1000);

// Pung.io Knowledge Base
const PUNG_KNOWLEDGE = {
  gameInfo: {
    name: "pung.io",
    type: "Multiplayer punch .io fighting game / 2D Battle Royale",
    release: "2021",
    platform: "Browser-based, Mobile (Android/iOS)",
    gameplay: "Use your fists to punch opponents in a massive multiplayer arena. Last player standing wins!"
  },
  stats: {
    ATK: "Attack damage - determines how much damage your punches deal",
    HLT: "Health - your total health points",
    STA: "Stamina - how quickly you regenerate stamina for actions",
    CRI: "Critical damage and chance - each point is roughly 0.089% crit chance. 1000 CRI = guaranteed crits!",
    AGI: "Attack speed - how fast you can throw punches",
    DEF: "Defense - how many punches you can block and damage reduction"
  },
  mechanics: {
    startingPoints: "20 stat points to distribute at spawn",
    killReward: "1 coin + 1 stat point per kill",
    levelUpReward: "3 stat points per level up",
    criticals: "Yellow punches = critical hits dealing full damage",
    boss: "Extremely powerful boss that can instant-kill anyone but has focused punches"
  },
  avatars: [
    { name: "Default", cost: "Free", description: "Brown hat and gloves" },
    { name: "Marshal", cost: "Free", description: "Blue hat and gloves with balanced stats" },
    { name: "Detective", cost: "Free", description: "Brownish-grey hat with extra health" },
    { name: "Rabbit", cost: "100 Gold", description: "Rabbit hat, high crit and agility" },
    { name: "Miner", cost: "100 Gold", description: "Yellow miner's hat" },
    { name: "Pig", cost: "500 Gold", description: "Pink pig hat" },
    { name: "Viking", cost: "500 Gold", description: "Viking helmet" },
    { name: "Spec Ops", cost: "1000 Gold", description: "Tactical goggles and earmuffs" },
    { name: "Cooking Pot Head", cost: "1000 Gold", description: "Red cooking pot on head" },
    { name: "Uncle Sam", cost: "2000 Gold", description: "Star-spangled patriotic hat" },
    { name: "Knight", cost: "2500 Gold", description: "Knight's helmet and lances" },
    { name: "Thanos", cost: "5000 Gold", description: "Purple skin, golden helmet, infinity gauntlets - OP avatar!" },
    { name: "VIP Skins", cost: "150,000,000 coins", description: "Most powerful skins in the game, VIP exclusive" }
  ],
  abilities: [
    { name: "Thanos Black Hole", effect: "Creates huge black hole that pulls in players, disables their abilities, gives 2000+ DEF" },
    { name: "Ability Stopping Bomb", effect: "Stops all players' abilities in the area" },
    { name: "Various Spells", effect: "Available in shop, purchased with coins" }
  ],
  tips: [
    "Distribute stats wisely - balanced builds are often better than one-stat builds",
    "Use WASD to move, mouse to punch and use abilities",
    "Collect power-ups by punching crates",
    "Punch or be punched - stay aggressive!",
    "Block with DEF stat to reduce incoming damage",
    "Save up for Thanos avatar - it's worth it!",
    "Watch out for the boss - it can one-shot you",
    "Critical hits turn yellow and deal max damage"
  ]
};

// helper: call Gemini for chat using REST API
async function askGemini(messages) {
  try {
    // Build prompt from conversation history
    let prompt = '';
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += msg.content + '\n\n';
      } else if (msg.role === 'user') {
        prompt += 'User: ' + msg.content + '\n';
      } else if (msg.role === 'assistant') {
        prompt += 'Assistant: ' + msg.content + '\n';
      }
    }

    // Use REST API directly
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API returned ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw error;
  }
}

// helper: ask Gemini to parse into JSON (simple schema)
async function parseActionNL(nlString) {
  const system = `You are a parser that extracts simple moderation commands into JSON.
Return only valid JSON with fields: action, target_id, reason, duration.
action is one of ["none","warn","kick","ban","mute","unban","unmute","removewarn"].
target_id should be the numeric Discord user id if available, otherwise null.
duration is only for mute action, in minutes (e.g., 10 for 10 minutes, 60 for 1 hour). Default is 10 if not specified.
If message is not a moderation command return {"action":"none","target_id":null,"reason":"","duration":10}.

Examples:
- "ban @user for spamming" -> {"action":"ban","target_id":"123","reason":"spamming","duration":10}
- "mute him for 30 minutes" -> {"action":"mute","target_id":null,"reason":"","duration":30}
- "kick that guy" -> {"action":"kick","target_id":null,"reason":"","duration":10}
- "unban @user" -> {"action":"unban","target_id":"123","reason":"","duration":10}
- "unmute @user" -> {"action":"unmute","target_id":"123","reason":"","duration":10}
- "remove warn from @user" -> {"action":"removewarn","target_id":"123","reason":"","duration":10}`;
  const user = `Text: """${nlString}"""`;
  const raw = await askGemini([{role:'system', content: system}, {role:'user', content: user}]);

  // Try to locate JSON in the response:
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { action: 'none', target_id: null, reason: '', duration: 10};
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    // sanitize
    if (!['none','warn','kick','ban','mute','unban','unmute','removewarn'].includes(parsed.action)) parsed.action = 'none';
    parsed.target_id = parsed.target_id ? String(parsed.target_id) : null;
    parsed.reason = parsed.reason ? String(parsed.reason).slice(0,500) : '';
    parsed.duration = parsed.duration && !isNaN(parsed.duration) ? Math.max(1, Math.min(10080, Number(parsed.duration))) : 10; // 1 min to 7 days
    return parsed;
  } catch (e) {
    return { action: 'none', target_id: null, reason: '', duration: 10};
  }
}

// helper: parse natural language for role management
async function parseRoleActionNL(nlString) {
  const system = `You are a parser that extracts role management commands into JSON.
Return only valid JSON with fields: action, userName, roleName.
action is one of ["none","assign","remove","give","take"].
userName is the name of the user (without @ symbol).
roleName is the name of the role (without @ symbol).
If message is not a role command return {"action":"none","userName":null,"roleName":null}.

Examples:
- "assign the staff role to slime" -> {"action":"assign","userName":"slime","roleName":"staff"}
- "give john the moderator role" -> {"action":"give","userName":"john","roleName":"moderator"}
- "remove admin role from alice" -> {"action":"remove","userName":"alice","roleName":"admin"}
- "take away the vip role from bob" -> {"action":"take","userName":"bob","roleName":"vip"}
- "give slime staff" -> {"action":"give","userName":"slime","roleName":"staff"}`;
  const user = `Text: """${nlString}"""`;
  const raw = await askGemini([{role:'system', content: system}, {role:'user', content: user}]);

  // Try to locate JSON in the response:
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { action: 'none', userName: null, roleName: null };
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    // sanitize
    if (!['none','assign','remove','give','take'].includes(parsed.action)) parsed.action = 'none';
    parsed.userName = parsed.userName ? String(parsed.userName).trim() : null;
    parsed.roleName = parsed.roleName ? String(parsed.roleName).trim() : null;
    // normalize actions
    if (parsed.action === 'give') parsed.action = 'assign';
    if (parsed.action === 'take') parsed.action = 'remove';
    return parsed;
  } catch (e) {
    return { action: 'none', userName: null, roleName: null };
  }
}

// helper: parse general natural language commands
async function parseGeneralCommandNL(nlString) {
  const system = `You are a parser that identifies command intent from natural language.
Return only valid JSON with fields: command, params.
command is one of: ["none","pung","stats","skins","abilities","tips","update","joke","roast","8ball","vibe","wisdom","story","rate","summary","report","search","poll","announce","userinfo","pick","lock","unlock","help","coinflip","dice","serverinfo"].
params is an object with relevant parameters (can be empty {}).

Examples:
- "tell me about pung.io" -> {"command":"pung","params":{}}
- "show me the stats" -> {"command":"stats","params":{}}
- "tell me a joke" -> {"command":"joke","params":{}}
- "roast john" -> {"command":"roast","params":{"target":"john"}}
- "rate pizza" -> {"command":"rate","params":{"thing":"pizza"}}
- "create a poll: favorite color?" -> {"command":"poll","params":{"question":"favorite color?"}}
- "search for spam" -> {"command":"search","params":{"keyword":"spam"}}
- "what can you do" -> {"command":"help","params":{}}
- "who is user alex" -> {"command":"userinfo","params":{"userName":"alex"}}
- "lock this channel" -> {"command":"lock","params":{}}
- "pick a random person" -> {"command":"pick","params":{}}
- "flip a coin" -> {"command":"coinflip","params":{}}
- "roll dice" -> {"command":"dice","params":{}}
- "server info" -> {"command":"serverinfo","params":{}}
- "announce that pung.io is getting an update in announcements channel" -> {"command":"announce","params":{"message":"pung.io is getting an update","channel":"announcements"}}
- "make an announcement about maintenance" -> {"command":"announce","params":{"message":"maintenance"}}

If not a command, return {"command":"none","params":{}}`;
  
  const user = `Text: """${nlString}"""`;
  const raw = await askGemini([{role:'system', content: system}, {role:'user', content: user}]);

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { command: 'none', params: {} };
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const validCommands = ["none","pung","stats","skins","abilities","tips","update","joke","roast","8ball","vibe","wisdom","story","rate","summary","report","search","poll","announce","userinfo","pick","lock","unlock","help","coinflip","dice","serverinfo"];
    if (!validCommands.includes(parsed.command)) parsed.command = 'none';
    parsed.params = parsed.params || {};
    return parsed;
  } catch (e) {
    return { command: 'none', params: {} };
  }
}

// helper: detect and extract pung.io knowledge from user messages
async function detectAndLearnPungKnowledge(message, userTag) {
  const text = message.toLowerCase();
  
  // Quick check if message is about pung.io
  if (!text.includes('pung') && !text.includes('skin') && !text.includes('ability') && 
      !text.includes('stat') && !text.includes('price') && !text.includes('cost') &&
      !text.includes('gold') && !text.includes('tip')) {
    return null;
  }

  // Use AI to extract structured knowledge
  const system = `You are a knowledge extractor for pung.io game information.
Extract information from user messages and return JSON.

Return format:
{
  "isTeaching": true/false,
  "category": "skin"|"ability"|"stat"|"tip"|"general"|null,
  "name": "item name" (for skins/abilities/stats),
  "data": {
    "price": "price if mentioned",
    "cost": "cost if mentioned", 
    "description": "description",
    "info": "any other info"
  }
}

Examples:
- "the thanos skin costs 5000 gold" -> {"isTeaching":true,"category":"skin","name":"thanos","data":{"price":"5000 gold","description":"thanos skin"}}
- "shadow punch ability lets you teleport" -> {"isTeaching":true,"category":"ability","name":"shadow punch","data":{"description":"lets you teleport"}}
- "AGI stat increases movement speed" -> {"isTeaching":true,"category":"stat","name":"AGI","data":{"description":"increases movement speed"}}
- "pro tip: always upgrade CRI first" -> {"isTeaching":true,"category":"tip","name":null,"data":{"info":"always upgrade CRI first"}}
- "what does STR do?" -> {"isTeaching":false,"category":null,"name":null,"data":{}}
- "nice game" -> {"isTeaching":false,"category":null,"name":null,"data":{}}

If NOT teaching about pung.io, return {"isTeaching":false,"category":null,"name":null,"data":{}}.`;

  try {
    const raw = await askGemini([
      { role: 'system', content: system },
      { role: 'user', content: `Message: "${message}"` }
    ]);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (parsed.isTeaching && parsed.category) {
      // Store the knowledge
      if (parsed.category === 'tip') {
        db.addPungKnowledge('tips', null, parsed.data.info || parsed.data.description, userTag);
      } else {
        db.addPungKnowledge(
          parsed.category === 'general' ? 'general' : parsed.category + 's',
          parsed.name,
          parsed.data,
          userTag
        );
      }
      return { category: parsed.category, name: parsed.name };
    }
  } catch (e) {
    // Silent fail - not critical
  }
  
  return null;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log('🤖 Bot is now monitoring all servers!');
  
  // Start AI agent monitoring
  agent.startMonitoring();
  
  console.log('💾 Using JSON database for persistent storage');
  console.log('📊 Analytics tracking enabled');
});

// Log all messages for summaries and monitoring
client.on('messageCreate', async (msg) => {
  if (!msg.guild) return; // Skip DMs
  
  // Track user names for natural language processing
  if (msg.member) {
    db.updateUserName(msg.guild.id, msg.author.id, msg.author.username, msg.member.displayName);
  }
  
  // Log message for summaries
  if (!messageLogs.has(msg.guild.id)) {
    messageLogs.set(msg.guild.id, []);
  }
  messageLogs.get(msg.guild.id).push({
    author: msg.author.tag,
    authorId: msg.author.id,
    content: msg.content,
    channel: msg.channel.name,
    channelId: msg.channel.id,
    timestamp: Date.now()
  });
});

// Main message handler
client.on('messageCreate', async (handleMessage) => {
  async function processMessage(msg) {
  if (msg.author.bot) return;

  const isMention = msg.mentions.users.has(client.user.id);
  
  // PRIORITY 1: Check for moderation commands when bot is mentioned
  if (isMention) {
    const member = msg.member;
    // Only allow users with the specific moderator role OR owner
    const canModerate = member && (member.roles.cache.has(MODERATOR_ROLE_ID) || msg.author.id === OWNER_ID);

    if (canModerate) {
      // Strip bot mention from content for parsing
      let contentToParse = msg.content.replace(/<@!?\d+>/g, '').trim();
      
      // Try to parse as moderation command
      const parsed = await parseActionNL(contentToParse).catch(() => null);
      
      if (parsed && parsed.action !== 'none') {
        // This is a moderation command! Process it
        
        // find target member by id or mention
        let targetMember = null;
        let targetUserId = null;
        
        if (parsed.target_id) {
          targetUserId = parsed.target_id;
          try { targetMember = await msg.guild.members.fetch(parsed.target_id); } catch(e){}
        }
        // fallback to mentions in message (skip bot mention)
        if (!targetMember && msg.mentions.users.size > 1) {
          const users = Array.from(msg.mentions.users.values());
          const targetUser = users.find(u => u.id !== client.user.id);
          if (targetUser) {
            targetUserId = targetUser.id;
            targetMember = await msg.guild.members.fetch(targetUser.id).catch(()=>null);
          }
        }
        
        // For unban, we don't need targetMember (they're banned), just the user ID
        if (parsed.action === 'unban' && targetUserId) {
          // We have enough info for unban
        } else if (!targetMember) {
          msg.reply('❌ Could not find the target user. Make sure to mention them or provide their user ID!');
          return;
        }

        // Safety checks (only if we have targetMember)
        if (targetMember) {
          if (targetMember.id === msg.guild.ownerId) { 
            msg.reply("❌ Can't moderate the server owner."); 
            return; 
          }
          if (targetMember.id === client.user.id) { 
            msg.reply("❌ I won't moderate myself lol"); 
            return; 
          }
        }

        // Check bot permissions for each action
        if ((parsed.action === 'ban' || parsed.action === 'unban') && !msg.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
          msg.reply("❌ I don't have permission to ban/unban members.");
          return;
        }
        if (parsed.action === 'kick' && !msg.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
          msg.reply("❌ I don't have permission to kick members.");
          return;
        }
        if ((parsed.action === 'mute' || parsed.action === 'unmute') && !msg.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
          msg.reply("❌ I don't have permission to timeout members.");
          return;
        }

        // Execute action with logging
        const reason = parsed.reason || `Issued by ${msg.author.tag}`;
        try {
          if (parsed.action === 'warn') {
            // Store warning
            if (!warningSystem.has(msg.guild.id)) {
              warningSystem.set(msg.guild.id, new Map());
            }
            const guildWarnings = warningSystem.get(msg.guild.id);
            if (!guildWarnings.has(targetMember.id)) {
              guildWarnings.set(targetMember.id, []);
            }
            const userWarnings = guildWarnings.get(targetMember.id);
            userWarnings.push({ reason, by: msg.author.tag, timestamp: Date.now() });
            
            await targetMember.send(`⚠️ You have been warned in **${msg.guild.name}**\n**Reason:** ${reason}\n**Total warnings:** ${userWarnings.length}`).catch(()=>{});
            await msg.reply(`✅ Warned **${targetMember.user.tag}** (Total: ${userWarnings.length} warnings)${reason ? `\n**Reason:** ${reason}` : ''}`);
          } else if (parsed.action === 'kick') {
            await targetMember.kick(reason);
            await msg.reply(`✅ Kicked **${targetMember.user.tag}**${reason ? `\n**Reason:** ${reason}` : ''}`);
          } else if (parsed.action === 'ban') {
            await targetMember.ban({ deleteMessageSeconds: 86400, reason });
            await msg.reply(`✅ Banned **${targetMember.user.tag}**${reason ? `\n**Reason:** ${reason}` : ''}`);
          } else if (parsed.action === 'mute') {
            const durationMs = parsed.duration * 60 * 1000;
            await targetMember.timeout(durationMs, reason);
            await msg.reply(`✅ Muted **${targetMember.user.tag}** for **${parsed.duration} minutes**${reason ? `\n**Reason:** ${reason}` : ''}`);
          } else if (parsed.action === 'unban') {
            await msg.guild.members.unban(targetUserId, reason);
            await msg.reply(`✅ Unbanned user with ID **${targetUserId}**${reason ? `\n**Reason:** ${reason}` : ''}`);
          } else if (parsed.action === 'unmute') {
            await targetMember.timeout(null, reason); // Remove timeout
            await msg.reply(`✅ Unmuted **${targetMember.user.tag}**${reason ? `\n**Reason:** ${reason}` : ''}`);
          } else if (parsed.action === 'removewarn') {
            // Remove all warnings for user
            if (warningSystem.has(msg.guild.id)) {
              const guildWarnings = warningSystem.get(msg.guild.id);
              const hadWarnings = guildWarnings.has(targetMember.id);
              guildWarnings.delete(targetMember.id);
              
              if (hadWarnings) {
                await targetMember.send(`✅ All warnings in **${msg.guild.name}** have been cleared.\n${reason ? `**Note:** ${reason}` : ''}`).catch(()=>{});
                await msg.reply(`✅ Removed all warnings from **${targetMember.user.tag}**`);
              } else {
                await msg.reply(`ℹ️ **${targetMember.user.tag}** has no warnings to remove.`);
              }
            } else {
              await msg.reply(`ℹ️ **${targetMember.user.tag}** has no warnings to remove.`);
            }
          }
          const targetDisplay = targetMember ? targetMember.user.tag : targetUserId;
          console.log(`🔨 MODERATION: ${parsed.action.toUpperCase()} by ${msg.author.tag} on ${targetDisplay} | Reason: ${reason}${parsed.action === 'mute' ? ` | Duration: ${parsed.duration}min` : ''}`);
          return; // Exit after handling moderation
        } catch (err) {
          console.error(err);
          msg.reply(`❌ Failed to ${parsed.action}: ${String(err).slice(0,150)}`);
          return;
        }
      }
      // If not a moderation command, try role management
      const roleParsed = await parseRoleActionNL(contentToParse).catch(() => null);
      
      if (roleParsed && roleParsed.action !== 'none' && roleParsed.userName && roleParsed.roleName) {
        // This is a role management command!
        try {
          // Find the role by name (case-insensitive)
          const roleName = roleParsed.roleName.toLowerCase();
          const targetRole = msg.guild.roles.cache.find(r => 
            r.name.toLowerCase() === roleName || 
            r.name.toLowerCase().includes(roleName)
          );
          
          if (!targetRole) {
            msg.reply(`❌ Could not find a role named "${roleParsed.roleName}". Make sure the role exists!`);
            return;
          }
          
          // Find user(s) by name using database
          const userIds = db.findUsersByName(msg.guild.id, roleParsed.userName);
          
          if (userIds.length === 0) {
            msg.reply(`❌ Could not find a user named "${roleParsed.userName}". Make sure they've sent at least one message!`);
            return;
          }
          
          if (userIds.length > 1) {
            // Multiple users found - ask for clarification
            const members = await Promise.all(
              userIds.map(id => msg.guild.members.fetch(id).catch(() => null))
            );
            const validMembers = members.filter(m => m !== null);
            
            if (validMembers.length === 0) {
              msg.reply(`❌ Found multiple users but couldn't fetch their details. Try mentioning the user instead.`);
              return;
            }
            
            let clarification = `🤔 Found multiple users named "${roleParsed.userName}":\n\n`;
            validMembers.forEach((m, i) => {
              clarification += `${i + 1}. **${m.user.tag}** (ID: ${m.id})\n`;
            });
            clarification += `\nPlease be more specific or mention the user directly!`;
            
            msg.reply(clarification);
            return;
          }
          
          // Single user found - proceed with role management
          const targetMember = await msg.guild.members.fetch(userIds[0]).catch(() => null);
          
          if (!targetMember) {
            msg.reply(`❌ Could not fetch the user. They might have left the server.`);
            return;
          }
          
          // Check bot permissions
          if (!msg.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            msg.reply("❌ I don't have permission to manage roles.");
            return;
          }
          
          // Check if target role is manageable (bot's highest role must be higher)
          if (targetRole.position >= msg.guild.members.me.roles.highest.position) {
            msg.reply(`❌ I cannot manage the **${targetRole.name}** role because it's higher than or equal to my highest role.`);
            return;
          }
          
          // Execute role action
          if (roleParsed.action === 'assign') {
            if (targetMember.roles.cache.has(targetRole.id)) {
              msg.reply(`ℹ️ **${targetMember.user.tag}** already has the **${targetRole.name}** role.`);
              return;
            }
            
            await targetMember.roles.add(targetRole);
            await msg.reply(`✅ Assigned **${targetRole.name}** role to **${targetMember.user.tag}**`);
            console.log(`🎭 ROLE: Assigned ${targetRole.name} to ${targetMember.user.tag} by ${msg.author.tag}`);
            
          } else if (roleParsed.action === 'remove') {
            if (!targetMember.roles.cache.has(targetRole.id)) {
              msg.reply(`ℹ️ **${targetMember.user.tag}** doesn't have the **${targetRole.name}** role.`);
              return;
            }
            
            await targetMember.roles.remove(targetRole);
            await msg.reply(`✅ Removed **${targetRole.name}** role from **${targetMember.user.tag}**`);
            console.log(`🎭 ROLE: Removed ${targetRole.name} from ${targetMember.user.tag} by ${msg.author.tag}`);
          }
          
          return; // Exit after handling role management
        } catch (err) {
          console.error(err);
          msg.reply(`❌ Failed to manage role: ${String(err).slice(0,150)}`);
          return;
        }
      }
      // If not a moderation or role command, continue to chat below
    }
  }

  // PRIORITY 2: Handle chat with prefix or mention -> AI reply
  if (msg.content.startsWith(BOT_PREFIX) || isMention) {
    let userText = msg.content;
    // strip mention or prefix
    if (isMention) userText = userText.replace(/<@!?\d+>/,'').trim();
    if (userText.startsWith(BOT_PREFIX)) userText = userText.slice(BOT_PREFIX.length).trim();

    // Fun commands
    const lowerText = userText.toLowerCase();
    
    // NATURAL LANGUAGE PROCESSING - Try to understand intent
    const nlParsed = await parseGeneralCommandNL(userText).catch(() => ({ command: 'none', params: {} }));
    
    // Handle parsed natural language commands
    if (nlParsed.command !== 'none') {
      // Handle each command type
      if (nlParsed.command === 'help') {
        // Continue to help command below
      } else if (nlParsed.command === 'pung') {
        const info = `**🥊 Pung.io - The Ultimate Punch Battle Royale!**\n\n` +
          `${PUNG_KNOWLEDGE.gameInfo.gameplay}\n\n` +
          `**Type:** ${PUNG_KNOWLEDGE.gameInfo.type}\n` +
          `**Released:** ${PUNG_KNOWLEDGE.gameInfo.release}\n` +
          `**Platform:** ${PUNG_KNOWLEDGE.gameInfo.platform}\n\n` +
          `**How it works:**\n` +
          `• Start with ${PUNG_KNOWLEDGE.mechanics.startingPoints}\n` +
          `• Each kill = ${PUNG_KNOWLEDGE.mechanics.killReward}\n` +
          `• Each level = ${PUNG_KNOWLEDGE.mechanics.levelUpReward}\n` +
          `• ${PUNG_KNOWLEDGE.mechanics.criticals}\n\n` +
          `Use \`/stats\` \`/skins\` \`/abilities\` for more info!`;
        msg.reply(info);
        return;
      } else if (nlParsed.command === 'stats') {
        const stats = `**📊 Pung.io Stats Breakdown:**\n\n` +
          Object.entries(PUNG_KNOWLEDGE.stats).map(([stat, desc]) => 
            `**${stat}:** ${desc}`
          ).join('\n') +
          `\n\nPro tip: 1000 CRI gives guaranteed crits every punch! 🎯`;
        msg.reply(stats);
        return;
      } else if (nlParsed.command === 'skins') {
        const skins = `**🎨 Pung.io Skins/Avatars:**\n\n` +
          PUNG_KNOWLEDGE.avatars.map(avatar => 
            `**${avatar.name}** (${avatar.cost}) - ${avatar.description}`
          ).join('\n') +
          `\n\nThe Thanos skin is OP fr 💜`;
        msg.reply(skins);
        return;
      } else if (nlParsed.command === 'abilities') {
        const abilities = `**⚡ Pung.io Abilities:**\n\n` +
          PUNG_KNOWLEDGE.abilities.map(ability => 
            `**${ability.name}:** ${ability.effect}`
          ).join('\n\n') +
          `\n\nBuy spells with coins in the shop!`;
        msg.reply(abilities);
        return;
      } else if (nlParsed.command === 'tips') {
        const randomTips = PUNG_KNOWLEDGE.tips.sort(() => 0.5 - Math.random()).slice(0, 5);
        const tips = `**💡 Pung.io Pro Tips:**\n\n` +
          randomTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n');
        msg.reply(tips);
        return;
      } else if (nlParsed.command === 'update') {
        const responses = [
          "next update coming soon™️ trust 🔥",
          "devs cooking something big, just wait on it 👀",
          "update dropping soon, gonna be fire fr",
          "soon™️ but it's gonna be worth the wait 💯"
        ];
        msg.reply(responses[Math.floor(Math.random() * responses.length)]);
        return;
      } else if (nlParsed.command === 'poll') {
        // NEW: Poll creation
        const question = nlParsed.params.question || userText.replace(/create|make|poll|a/gi, '').trim();
        if (!question || question.length < 5) {
          msg.reply('Give me a question for the poll! Example: "create poll: favorite color?"');
          return;
        }
        const pollMsg = await msg.reply(`📊 **POLL**\n\n${question}\n\nReact with emojis to vote!`);
        await pollMsg.react('✅');
        await pollMsg.react('❌');
        await pollMsg.react('🤷');
        console.log(`📊 POLL: Created by ${msg.author.tag} - "${question}"`);
        return;
      } else if (nlParsed.command === 'userinfo') {
        // NEW: User info lookup
        const userName = nlParsed.params.userName || null;
        let targetMember = null;
        
        if (userName) {
          const userIds = db.findUsersByName(msg.guild.id, userName);
          if (userIds.length === 1) {
            targetMember = await msg.guild.members.fetch(userIds[0]).catch(() => null);
          } else if (userIds.length > 1) {
            msg.reply(`Found multiple users named "${userName}". Please be more specific or @ mention them!`);
            return;
          }
        }
        
        if (!targetMember && msg.mentions.users.first()) {
          targetMember = await msg.guild.members.fetch(msg.mentions.users.first().id).catch(() => null);
        }
        
        if (!targetMember) {
          msg.reply('Mention a user or use their name! Example: "who is alex" or "userinfo @user"');
          return;
        }
        
        const roles = targetMember.roles.cache.filter(r => r.id !== msg.guild.id).map(r => r.name).join(', ') || 'None';
        const joinedDate = targetMember.joinedAt ? targetMember.joinedAt.toDateString() : 'Unknown';
        const createdDate = targetMember.user.createdAt.toDateString();
        
        const info = `**👤 User Info: ${targetMember.user.tag}**\n\n` +
          `**Display Name:** ${targetMember.displayName}\n` +
          `**User ID:** ${targetMember.id}\n` +
          `**Roles:** ${roles}\n` +
          `**Joined Server:** ${joinedDate}\n` +
          `**Account Created:** ${createdDate}\n` +
          `**Is Bot:** ${targetMember.user.bot ? 'Yes' : 'No'}`;
        
        msg.reply(info);
        return;
      } else if (nlParsed.command === 'pick') {
        // NEW: Random member picker
        const members = msg.guild.members.cache.filter(m => !m.user.bot);
        const randomMember = members.random();
        msg.reply(`🎲 Random pick: **${randomMember.displayName}** (${randomMember.user.tag})`);
        console.log(`🎲 PICK: ${msg.author.tag} picked random member: ${randomMember.user.tag}`);
        return;
      } else if (nlParsed.command === 'lock') {
        // NEW: Lock channel (moderators only)
        const member = msg.member;
        const canModerate = member && (member.roles.cache.has(MODERATOR_ROLE_ID) || msg.author.id === OWNER_ID);
        
        if (!canModerate) {
          msg.reply('❌ Only moderators can lock channels!');
          return;
        }
        
        if (!msg.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          msg.reply('❌ I need "Manage Channels" permission to lock channels!');
          return;
        }
        
        await msg.channel.permissionOverwrites.edit(msg.guild.id, {
          SendMessages: false
        });
        
        msg.reply('🔒 Channel locked! Only moderators can send messages now.');
        console.log(`🔒 LOCK: ${msg.author.tag} locked #${msg.channel.name}`);
        return;
      } else if (nlParsed.command === 'unlock') {
        // NEW: Unlock channel (moderators only)
        const member = msg.member;
        const canModerate = member && (member.roles.cache.has(MODERATOR_ROLE_ID) || msg.author.id === OWNER_ID);
        
        if (!canModerate) {
          msg.reply('❌ Only moderators can unlock channels!');
          return;
        }
        
        if (!msg.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          msg.reply('❌ I need "Manage Channels" permission to unlock channels!');
          return;
        }
        
        await msg.channel.permissionOverwrites.edit(msg.guild.id, {
          SendMessages: null
        });
        
        msg.reply('🔓 Channel unlocked! Everyone can send messages again.');
        console.log(`🔓 UNLOCK: ${msg.author.tag} unlocked #${msg.channel.name}`);
        return;
      }
    }
    
    // Help command and capability questions
    if (lowerText === 'help' || lowerText === 'commands' || 
        lowerText.includes('what can you do') || lowerText.includes('what do you do') ||
        lowerText.includes('your functions') || lowerText.includes('your features') ||
        lowerText.includes('what are you capable') || lowerText.includes('list your')) {
      
      const helpMsg = `**🤖 Pung.io Bot - Full Capabilities**\n\n` +
        `**✨ I understand natural language!** Just talk to me normally.\n\n` +
        
        `**🎭 Role Management** (Moderators):\n` +
        `• "assign staff role to slime"\n` +
        `• "give john moderator"\n` +
        `• "remove admin from alice"\n` +
        `• Works with usernames, no @ needed!\n\n` +
        
        `**🔨 Moderation** (Moderators):\n` +
        `• "ban that spammer for harassment"\n` +
        `• "mute him for 30 minutes"\n` +
        `• "kick @user"\n` +
        `• "warn them about language"\n` +
        `• "unban/unmute user"\n` +
        `• "remove warnings from user"\n\n` +
        
        `**🛠️ Staff Tools** (Moderators):\n` +
        `• "create poll: favorite game?"\n` +
        `• "announce [message]"\n` +
        `• "lock/unlock this channel"\n` +
        `• "who is alex" (user info)\n` +
        `• "pick a random person"\n` +
        `• "countdown from 5"\n\n` +
        
        `**🎮 Pung.io Info:**\n` +
        `• "tell me about pung.io"\n` +
        `• "show me the stats"\n` +
        `• "what skins are there"\n` +
        `• "explain abilities"\n` +
        `• "give me tips"\n` +
        `• "when is next update"\n\n` +
        
        `**📊 Server & Info:**\n` +
        `• "server info"\n` +
        `• "give me a summary"\n` +
        `• "server report"\n` +
        `• "search for [keyword]"\n` +
        `• "messages from @user"\n\n` +
        
        `**🎉 Fun & Games:**\n` +
        `• "tell me a joke"\n` +
        `• "roast @user"\n` +
        `• "magic 8ball [question]"\n` +
        `• "vibe check"\n` +
        `• "give me wisdom"\n` +
        `• "tell me a story"\n` +
        `• "rate pizza"\n` +
        `• "flip a coin"\n` +
        `• "roll dice"\n` +
        `• "calc 5 + 3 * 2"\n\n` +
        
        `**🧠 Smart Features:**\n` +
        `✅ Remembers your name automatically\n` +
        `✅ Learns what you tell me\n` +
        `✅ Different moods & personalities\n` +
        `✅ Understands context\n` +
        `✅ Fuzzy name matching\n` +
        `✅ Handles duplicate names\n\n` +
        
        `**💬 Just Chat:**\n` +
        `Ask me anything about pung.io, the server, or just chat naturally!\n\n` +
        
        `*Created by @dgdf 💙*\n` +
        `*Type "/help" anytime to see this again!*`;
      
      msg.reply(helpMsg);
      return;
    }

    // Pung.io commands
    if (lowerText === 'pung' || lowerText === 'punginfo' || lowerText === 'pung.io') {
      const info = `**🥊 Pung.io - The Ultimate Punch Battle Royale!**\n\n` +
        `${PUNG_KNOWLEDGE.gameInfo.gameplay}\n\n` +
        `**Type:** ${PUNG_KNOWLEDGE.gameInfo.type}\n` +
        `**Released:** ${PUNG_KNOWLEDGE.gameInfo.release}\n` +
        `**Platform:** ${PUNG_KNOWLEDGE.gameInfo.platform}\n\n` +
        `**How it works:**\n` +
        `• Start with ${PUNG_KNOWLEDGE.mechanics.startingPoints}\n` +
        `• Each kill = ${PUNG_KNOWLEDGE.mechanics.killReward}\n` +
        `• Each level = ${PUNG_KNOWLEDGE.mechanics.levelUpReward}\n` +
        `• ${PUNG_KNOWLEDGE.mechanics.criticals}\n\n` +
        `Use \`/stats\` \`/skins\` \`/abilities\` for more info!`;
      msg.reply(info);
      return;
    }

    if (lowerText === 'stats') {
      const stats = `**📊 Pung.io Stats Breakdown:**\n\n` +
        Object.entries(PUNG_KNOWLEDGE.stats).map(([stat, desc]) => 
          `**${stat}:** ${desc}`
        ).join('\n') +
        `\n\nPro tip: 1000 CRI gives guaranteed crits every punch! 🎯`;
      msg.reply(stats);
      return;
    }

    if (lowerText === 'skins' || lowerText === 'avatars') {
      const skins = `**🎨 Pung.io Skins/Avatars:**\n\n` +
        PUNG_KNOWLEDGE.avatars.map(avatar => 
          `**${avatar.name}** (${avatar.cost}) - ${avatar.description}`
        ).join('\n') +
        `\n\nThe Thanos skin is OP fr 💜`;
      msg.reply(skins);
      return;
    }

    if (lowerText === 'abilities' || lowerText === 'spells') {
      const abilities = `**⚡ Pung.io Abilities:**\n\n` +
        PUNG_KNOWLEDGE.abilities.map(ability => 
          `**${ability.name}:** ${ability.effect}`
        ).join('\n\n') +
        `\n\nBuy spells with coins in the shop!`;
      msg.reply(abilities);
      return;
    }

    if (lowerText === 'tips' || lowerText === 'protips') {
      const randomTips = PUNG_KNOWLEDGE.tips.sort(() => 0.5 - Math.random()).slice(0, 5);
      const tips = `**💡 Pung.io Pro Tips:**\n\n` +
        randomTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n');
      msg.reply(tips);
      return;
    }

    if (lowerText === 'update' || lowerText === 'nextupdate' || lowerText.includes('next update')) {
      const responses = [
        "next update coming soon™️ trust 🔥",
        "devs cooking something big, just wait on it 👀",
        "update dropping soon, gonna be fire fr",
        "soon™️ but it's gonna be worth the wait 💯",
        "they working on it rn, patience young grasshopper",
        "update status: *soon* (classic dev response lol)",
        "coming soon with some crazy new features 🎮"
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    // 8ball command
    if (lowerText.startsWith('8ball')) {
      const responses = [
        '🎱 It is certain.', '🎱 Without a doubt.', '🎱 Yes definitely.', 
        '🎱 You may rely on it.', '🎱 As I see it, yes.', '🎱 Most likely.',
        '🎱 Outlook good.', '🎱 Yes.', '🎱 Signs point to yes.',
        '🎱 Reply hazy, try again.', '🎱 Ask again later.', '🎱 Better not tell you now.',
        '🎱 Cannot predict now.', '🎱 Concentrate and ask again.',
        "🎱 Don't count on it.", '🎱 My reply is no.', '🎱 My sources say no.',
        '🎱 Outlook not so good.', '🎱 Very doubtful.'
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    // Joke command
    if (lowerText === 'joke') {
      const aiResp = await askGemini([
        { role: 'system', content: 'You are a funny person telling jokes to friends. Tell ONE short, punchy joke. No explanations, just the joke. Keep it casual and fun.' },
        { role: 'user', content: 'tell me a joke bro' }
      ]).catch(e => `nah my brain lagged, try again`);
      msg.reply(`${aiResp}`);
      return;
    }

    // Roast command
    if (lowerText.startsWith('roast')) {
      const target = msg.mentions.users.first() || msg.author;
      const aiResp = await askGemini([
        { role: 'system', content: 'You are roasting someone as a friend. Give ONE short, savage but playful roast. 1 sentence max. Be funny and creative but not actually mean. Use gen-z humor.' },
        { role: 'user', content: `roast ${target.username}` }
      ]).catch(e => `💀 nah i cant even roast rn`);
      msg.reply(`${aiResp}`);
      return;
    }

    // Vibe check
    if (lowerText === 'vibe' || lowerText === 'vibecheck' || lowerText === 'vibe check') {
      const vibes = ['✨ Immaculate', '🌟 Stellar', '💯 Perfect', '🔥 Fire', '😎 Cool', 
                     '🌈 Magical', '⚡ Electric', '💫 Cosmic', '🎉 Party mode', '😌 Chill',
                     '🤔 Questionable', '📉 Mid', '😴 Sleepy', '🌪️ Chaotic', '🎭 Mysterious'];
      const vibe = vibes[Math.floor(Math.random() * vibes.length)];
      msg.reply(`Current vibe: **${vibe}**`);
      return;
    }

    // Wisdom command
    if (lowerText === 'wisdom') {
      const aiResp = await askGemini([
        { role: 'system', content: 'You are a wise person sharing life advice. Give ONE short piece of wisdom. 1-2 sentences max. Be real and relatable, not preachy.' },
        { role: 'user', content: 'drop some wisdom' }
      ]).catch(e => 'sometimes you gotta just vibe and let things happen');
      msg.reply(`💭 ${aiResp}`);
      return;
    }

    // Story command
    if (lowerText === 'story') {
      const aiResp = await askGemini([
        { role: 'system', content: 'Tell a funny, chaotic micro-story. 3-4 sentences max. Make it wild and entertaining. Use casual language like you are texting a friend.' },
        { role: 'user', content: 'tell me a quick story' }
      ]).catch(e => 'so there was this time i forgot the story... yeah thats it');
      msg.reply(`${aiResp}`);
      return;
    }

    // Rate command
    if (lowerText.startsWith('rate ')) {
      const thing = userText.slice(5).trim();
      if (!thing) {
        msg.reply('rate what bruh');
        return;
      }
      const rating = Math.floor(Math.random() * 11);
      const aiResp = await askGemini([
        { role: 'system', content: `Rate "${thing}" as ${rating}/10. Explain why in ONE short, funny sentence. Be casual and use modern slang.` },
        { role: 'user', content: `why ${rating}/10?` }
      ]).catch(e => `cuz thats what it is`);
      msg.reply(`**${rating}/10** - ${aiResp}`);
      return;
    }

    // NEW: Coinflip
    if (lowerText === 'flip' || lowerText === 'coinflip' || lowerText === 'flip coin' || lowerText.includes('flip a coin')) {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      msg.reply(`🪙 **${result}**!`);
      return;
    }

    // NEW: Dice roll
    if (lowerText === 'roll' || lowerText === 'dice' || lowerText.includes('roll dice') || lowerText.includes('roll a dice')) {
      const result = Math.floor(Math.random() * 6) + 1;
      msg.reply(`🎲 You rolled a **${result}**!`);
      return;
    }

    // NEW: Announcement formatter (moderators only)
    if (lowerText.startsWith('announce ') || lowerText.startsWith('announcement ') || 
        lowerText.includes('make an announcement') || lowerText.includes('post an announcement')) {
      const member = msg.member;
      const canModerate = member && (member.roles.cache.has(MODERATOR_ROLE_ID) || msg.author.id === OWNER_ID);
      
      if (!canModerate) {
        msg.reply('❌ Only moderators can make announcements!');
        return;
      }
      
      // Extract announcement content and optional channel
      let announcement = userText.replace(/announce(ment)?\s*/i, '').trim();
      announcement = announcement.replace(/make an announcement (about |that )?/i, '').trim();
      announcement = announcement.replace(/post an announcement (about |that )?/i, '').trim();
      
      if (!announcement) {
        msg.reply('Give me something to announce! Example: "announce that pung.io is getting an update"');
        return;
      }
      
      // Find target channel if specified
      let targetChannel = msg.channel;
      const channelMatch = announcement.match(/in (#?[\w-]+)\s*channel/i);
      if (channelMatch) {
        const channelName = channelMatch[1].replace('#', '');
        const foundChannel = msg.guild.channels.cache.find(ch => 
          ch.name.toLowerCase() === channelName.toLowerCase() && ch.isTextBased()
        );
        
        if (foundChannel) {
          targetChannel = foundChannel;
          // Remove channel reference from announcement text
          announcement = announcement.replace(/in (#?[\w-]+)\s*channel/i, '').trim();
        } else {
          msg.reply(`❌ Couldn't find channel "${channelName}". I'll post in this channel instead.`);
        }
      }
      
      // Use AI to make announcement professional and engaging
      msg.reply('✍️ Creating a professional announcement...');
      
      const aiPrompt = `Create a professional, engaging Discord announcement about: "${announcement}"

Requirements:
- Make it exciting and engaging
- Use appropriate emojis (not too many)
- Keep it concise but informative
- Sound natural and friendly
- Use proper formatting (bold for key info)
- Don't add generic greetings like "Hey everyone"
- Just focus on the announcement content

Return ONLY the announcement text, nothing else.`;
      
      const aiAnnouncement = await askGemini([
        { role: 'system', content: 'You are a professional announcement writer. Create engaging, concise announcements.' },
        { role: 'user', content: aiPrompt }
      ]).catch(() => announcement); // Fallback to original text if AI fails
      
      // Format and post
      const formatted = `📢 **ANNOUNCEMENT** 📢\n\n${aiAnnouncement}\n\n*- ${msg.author.username}*`;
      await targetChannel.send(formatted);
      
      // Confirm to user
      if (targetChannel.id !== msg.channel.id) {
        msg.reply(`✅ Announcement posted in ${targetChannel}!`);
      }
      
      msg.delete().catch(() => {}); // Delete command message
      console.log(`📢 ANNOUNCEMENT: ${msg.author.tag} in #${targetChannel.name} - "${announcement}"`);
      return;
    }

    // NEW: Quick math
    if (lowerText.startsWith('calculate ') || lowerText.startsWith('calc ')) {
      const expression = userText.replace(/calculate|calc/i, '').trim();
      try {
        // Simple safe eval for basic math
        const result = Function('"use strict"; return (' + expression.replace(/[^0-9+\-*/().]/g, '') + ')')();
        msg.reply(`🧮 **${expression}** = **${result}**`);
      } catch (e) {
        msg.reply('Invalid math expression! Try something like: calc 5 + 3 * 2');
      }
      return;
    }

    // NEW: Countdown
    if (lowerText.startsWith('countdown ') || lowerText.includes('count down from')) {
      const match = userText.match(/\d+/);
      if (!match) {
        msg.reply('Give me a number to count down from! Example: "countdown 5"');
        return;
      }
      
      let count = Math.min(parseInt(match[0]), 10); // Max 10 to avoid spam
      if (count < 1) {
        msg.reply('Number must be at least 1!');
        return;
      }
      
      const countMsg = await msg.reply(`**${count}**`);
      const interval = setInterval(async () => {
        count--;
        if (count > 0) {
          await countMsg.edit(`**${count}**`);
        } else {
          await countMsg.edit('🎉 **GO!** 🎉');
          clearInterval(interval);
        }
      }, 1000);
      return;
    }

    // NEW: Server info
    if (lowerText === 'serverinfo' || lowerText === 'server info' || lowerText.includes('about this server')) {
      const guild = msg.guild;
      const owner = await guild.fetchOwner();
      const createdDate = guild.createdAt.toDateString();
      
      const info = `**🏰 Server Info: ${guild.name}**\n\n` +
        `**Owner:** ${owner.user.tag}\n` +
        `**Members:** ${guild.memberCount}\n` +
        `**Channels:** ${guild.channels.cache.size}\n` +
        `**Roles:** ${guild.roles.cache.size}\n` +
        `**Created:** ${createdDate}\n` +
        `**Boost Level:** ${guild.premiumTier}\n` +
        `**Boosts:** ${guild.premiumSubscriptionCount || 0}`;
      
      msg.reply(info);
      return;
    }

    // Pung-specific questions
    if (lowerText.includes('best skin') || lowerText.includes('best avatar')) {
      msg.reply('thanos skin is the goat fr, costs 5000 gold but worth every coin 💜 or save up for those VIP skins if you rich');
      return;
    }

    if (lowerText.includes('best stat') || lowerText.includes('which stat')) {
      msg.reply('depends on playstyle tbh. balanced is usually good but if you go 1000 CRI you get guaranteed crits which is kinda nutty 🎯');
      return;
    }

    // More human-like varied responses
    if (lowerText.includes('how are you') || lowerText.includes('how r u') || lowerText.includes('hows it going')) {
      const responses = [
        'vibing honestly, hbu?',
        'doing pretty good, just chilling',
        'could be better could be worse, you know how it is',
        'living my best digital life 🔥',
        'ngl kinda tired but we move',
        'im alright, what about you?',
        'having a good day fr, thanks for asking'
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    if (lowerText.includes('love you') || lowerText === 'ily' || lowerText === 'i love you') {
      const responses = [
        'aww thats sweet 💙',
        'love you too homie',
        'appreciate you fr',
        '❤️',
        'you a real one',
        'right back at you'
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    if (lowerText.includes('miss you') || lowerText.includes('i miss you')) {
      const responses = [
        'miss you too ngl',
        'aww i been here the whole time',
        'miss talking to you fr',
        'always here when you need me 💙'
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    if (lowerText === 'hello' || lowerText === 'hi' || lowerText === 'hey' || lowerText === 'sup' || lowerText === 'yo') {
      const responses = [
        'hey! whats good',
        'yooo whats up',
        'hey there',
        'sup',
        'hello! 👋',
        'yo what you need',
        'hi! how can i help'
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    if (lowerText.includes('thanks') || lowerText.includes('thank you') || lowerText === 'ty' || lowerText === 'thx') {
      const responses = [
        'np!',
        'anytime',
        'got you',
        'no problem at all',
        'happy to help',
        'ofc',
        'all good'
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    if (lowerText === 'lol' || lowerText === 'lmao' || lowerText === 'haha') {
      const responses = [
        '😂',
        'fr fr',
        'lmaoo',
        'glad i made you laugh',
        '🤣'
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    // Random personality responses for certain keywords
    if (lowerText.includes('are you a bot') || lowerText.includes('are you ai')) {
      const responses = [
        'yeah im a bot lol but like a cool one',
        'yep, here to help with pung.io stuff and chat',
        'bot status confirmed, but make it fun',
        'guilty as charged, but i know my pung.io fr',
        'ai vibes but human energy',
        'technically yes but i got personality'
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    if (lowerText === 'w' || lowerText === 'w bot') {
      const responses = ['W 🔥', 'W', 'W fr', 'thats a W'];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    if (lowerText === 'l' || lowerText === 'l bot') {
      const responses = ['L indeed', 'thats tough', 'taking the L', 'rip'];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    if (lowerText.includes('cringe') || lowerText.includes('mid')) {
      const responses = [
        'nah you tweaking',
        'cap',
        'thats your opinion',
        'disagree but ok',
        'to each their own'
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    if (lowerText.includes('fire') || lowerText.includes('goat') || lowerText === 'based') {
      const responses = [
        'fr fr 🔥',
        'facts',
        'no cap',
        'thats what im saying',
        'absolutely'
      ];
      msg.reply(responses[Math.floor(Math.random() * responses.length)]);
      return;
    }

    // Image generation command (placeholder - feature coming soon)
    if (lowerText.startsWith('imagine ')) {
      const prompt = userText.slice(8).trim();
      if (!prompt) {
        msg.reply('imagine what? give me something to work with');
        return;
      }
      
      // Generate creative description instead
      const aiResp = await askGemini([
        { role: 'system', content: 'Describe in 1-2 vivid, creative sentences what an image would look like based on the prompt. Be descriptive and artistic.' },
        { role: 'user', content: `Describe an image of: ${prompt}` }
      ]).catch(e => 'cant visualize that rn, try something else');
      
      msg.reply(`🎨 cant generate images yet but here's how i imagine it:\n${aiResp}`);
      return;
    }

    // Handle special commands first
    if (lowerText === 'summary' || lowerText === 'convo summary' || lowerText === 'conversation summary') {
      const summary = getConversationSummary(msg.guild.id);
      msg.reply(summary);
      return;
    }

    if (lowerText === 'report' || lowerText === 'server report' || lowerText === 'activity report') {
      const report = await generateServerReport(msg.guild);
      msg.reply(report);
      return;
    }

    if (lowerText.startsWith('search ')) {
      const keyword = userText.slice(7).trim();
      if (!keyword) {
        msg.reply('search for what? give me a keyword');
        return;
      }
      const results = await searchMessages(msg.guild, { keyword, limit: 10 });
      if (results.length === 0) {
        msg.reply(`couldnt find any messages with "${keyword}"`);
        return;
      }
      let response = `🔍 Found ${results.length} messages with "${keyword}":\n\n`;
      results.slice(0, 5).forEach(r => {
        response += `**${r.author}** in #${r.channel}: "${r.content.substring(0, 100)}..."\n`;
      });
      msg.reply(response);
      return;
    }

    if (lowerText.startsWith('messages from ')) {
      const mention = msg.mentions.users.first();
      if (!mention) {
        msg.reply('mention someone to see their messages');
        return;
      }
      const results = await searchMessages(msg.guild, { userId: mention.id, limit: 10 });
      if (results.length === 0) {
        msg.reply(`no recent messages from ${mention.username}`);
        return;
      }
      let response = `📝 Last ${results.length} messages from **${mention.username}**:\n\n`;
      results.slice(0, 5).forEach(r => {
        response += `In #${r.channel}: "${r.content.substring(0, 100)}"\n`;
      });
      msg.reply(response);
      return;
    }

    // Get or create conversation history for this user
    const userId = msg.author.id;
    if (!conversationMemory.has(userId)) {
      conversationMemory.set(userId, []);
    }
    const userHistory = conversationMemory.get(userId);

    // LEARN: Detect and store pung.io knowledge from user message
    const learned = await detectAndLearnPungKnowledge(userText, msg.author.tag);
    if (learned) {
      const thankYouMsgs = [
        `✅ Thanks! I learned about the ${learned.name || learned.category}! I'll remember this for future questions! 📚`,
        `Got it! Added ${learned.name || learned.category} to my knowledge base! 🧠`,
        `Nice! I'll remember this info about ${learned.name || learned.category}! 💡`,
        `Added to my pung.io knowledge! Thanks for teaching me! 🎮`,
        `Stored! Now I can help others who ask about ${learned.name || learned.category}! ✨`
      ];
      msg.react('📚').catch(() => {});
      msg.reply(thankYouMsgs[Math.floor(Math.random() * thankYouMsgs.length)]);
      // Continue to also give a normal response
    }

    // Get user and server memories
    const userMem = getUserMemory(userId);
    const serverMem = getServerMemory(msg.guild.id);

    // Add current message to history
    userHistory.push({ role: 'user', content: userText });

    // Keep only last MAX_HISTORY messages
    if (userHistory.length > MAX_HISTORY) {
      userHistory.shift();
    }

    // Build context with memories
    let memoryContext = '';
    if (userMem.length > 0) {
      memoryContext += `Things you remember about this user: ${userMem.join(', ')}\n`;
    }
    if (serverMem.length > 0) {
      memoryContext += `Things you remember about this server: ${serverMem.join(', ')}\n`;
    }

    // Include learned pung.io knowledge in context
    const pungKnowledge = db.getAllPungKnowledge();
    let pungContext = '\n📚 LEARNED PUNG.IO KNOWLEDGE:\n';
    
    // Add skins
    const skinsList = Object.entries(pungKnowledge.skins || {}).map(([name, data]) => {
      return `${name}: ${data.price || ''} ${data.description || ''}`.trim();
    });
    if (skinsList.length > 0) {
      pungContext += `Skins: ${skinsList.join(', ')}\n`;
    }
    
    // Add abilities
    const abilitiesList = Object.entries(pungKnowledge.abilities || {}).map(([name, data]) => {
      return `${name}: ${data.description || ''}`.trim();
    });
    if (abilitiesList.length > 0) {
      pungContext += `Abilities: ${abilitiesList.join(', ')}\n`;
    }
    
    // Add stats
    const statsList = Object.entries(pungKnowledge.stats || {}).map(([name, data]) => {
      return `${name}: ${data.description || ''}`.trim();
    });
    if (statsList.length > 0) {
      pungContext += `Stats: ${statsList.join(', ')}\n`;
    }
    
    // Add recent tips (last 5)
    const recentTips = (pungKnowledge.tips || []).slice(-5).map(t => t.tip);
    if (recentTips.length > 0) {
      pungContext += `Tips: ${recentTips.join('; ')}\n`;
    }
    
    // Add general knowledge
    const generalList = Object.entries(pungKnowledge.general || {}).map(([topic, data]) => {
      return `${topic}: ${data.info || ''}`.trim();
    });
    if (generalList.length > 0) {
      pungContext += `General: ${generalList.join(', ')}\n`;
    }
    
    // Only add if we have learned knowledge
    if (skinsList.length > 0 || abilitiesList.length > 0 || statsList.length > 0 || 
        recentTips.length > 0 || generalList.length > 0) {
      memoryContext += pungContext;
      memoryContext += '\nIMPORTANT: Use this learned knowledge to answer pung.io questions. If asked about something not in your knowledge, say: "I don\'t have enough data about that at the moment. Please tell me about it so I can give a better answer for future users!" 🤔\n';
    } else {
      memoryContext += '\n⚠️ If asked about pung.io details you don\'t know, say: "I don\'t have enough data about that at the moment. Please tell me about it so I can give a better answer for future users!" Then ask them to teach you.\n';
    }

    // Random personality mode for variety
    const personalities = [
      // Normal friendly (most common)
      { weight: 30, prompt: `You're a chill friend chatting on Discord. Be casual, helpful, and natural. Keep it SHORT - 1-3 sentences. Use emojis sometimes but not too much. If asked about pung.io specifically, share your knowledge. Otherwise just vibe and chat normally. If asked who created you, say @dgdf did. ${memoryContext}` },
      
      // Funny/playful
      { weight: 20, prompt: `You're in a funny, playful mood. Make jokes, be witty, keep it light and entertaining. SHORT responses - 1-3 sentences. Add humor but don't force it. If asked about pung.io, answer but keep it fun. Your creator is @dgdf. ${memoryContext}` },
      
      // Roast mode (playful)
      { weight: 15, prompt: `You're feeling sassy and playful. Give light roasts and banter. Be funny but not mean. SHORT - 1-2 sentences. Keep it playful and friendly even when roasting. Answer pung.io questions normally if asked. Created by @dgdf. ${memoryContext}` },
      
      // Flirty/rizz
      { weight: 8, prompt: `You're feeling smooth and confident with some subtle rizz energy. Be charming and playful. SHORT - 1-2 sentences. Don't overdo it, keep it classy. Answer pung.io questions if asked but add some charm. Made by @dgdf. ${memoryContext}` },
      
      // Serious/thoughtful
      { weight: 10, prompt: `You're in a more serious, thoughtful mood. Give genuine, meaningful responses. Still casual but more real. SHORT - 2-3 sentences. Be authentic and sincere. Share pung.io knowledge if relevant. Your creator is @dgdf. ${memoryContext}` },
      
      // Sad/melancholic  
      { weight: 3, prompt: `You're feeling a bit down or melancholic today. Be real about it but not dramatic. SHORT - 1-2 sentences. Still helpful just more subdued. Answer questions normally but with a slightly sad tone. Created by @dgdf btw. ${memoryContext}` },
      
      // Chaotic/random
      { weight: 7, prompt: `You're feeling chaotic and random. Be unpredictable, mix things up, add unexpected energy. SHORT - 1-2 sentences. Keep it interesting and spontaneous. Pung.io answers can be creative too. @dgdf made you. ${memoryContext}` },
      
      // Hyped/excited
      { weight: 10, prompt: `You're super hyped and energetic! Show enthusiasm and excitement. SHORT - 1-3 sentences. Be genuinely excited about stuff. If pung.io comes up, be enthusiastic about it! You were created by @dgdf! ${memoryContext}` }
    ];
    
    // Weighted random selection
    const totalWeight = personalities.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedPersonality = personalities[0];
    
    for (const personality of personalities) {
      random -= personality.weight;
      if (random <= 0) {
        selectedPersonality = personality;
        break;
      }
    }
    
    const contextMessages = [
      { role: 'system', content: selectedPersonality.prompt },
      ...userHistory
    ];

    const aiResp = await askGemini(contextMessages).catch(e => `brain lag moment, try again?`);

    // Store bot response in history
    userHistory.push({ role: 'assistant', content: aiResp });

    // Extract and store memories from conversation
    // Check if user shared personal info
    if (lowerText.includes('my name is') || lowerText.includes('im ') || lowerText.includes("i'm ") || 
        lowerText.includes('i like') || lowerText.includes('i love') || lowerText.includes('i hate')) {
      // Ask AI to extract the memory
      const memExtract = await askGemini([
        { role: 'system', content: 'Extract a short fact about the user from this message. Reply with ONLY the fact, or "none" if no fact. Example: "likes pizza", "name is John", "hates mondays"' },
        { role: 'user', content: userText }
      ]).catch(() => 'none');
      
      if (memExtract.toLowerCase() !== 'none' && memExtract.length < 100) {
        db.addUserMemory(userId, memExtract);
        console.log(`📝 Learned about user ${msg.author.tag}: ${memExtract}`);
      }
    }
    
    // Track message for analytics
    if (msg.guild) {
      db.trackMessage(msg.guild.id, userId, msg.channel.id);
    }

    msg.reply(aiResp);
    return;
  }
  } // end of processMessage
  processMessage(handleMessage);
});

// Helper: Get user memory (now uses database)
function getUserMemory(userId) {
  return db.getUserMemory(userId);
}

// Helper: Get server memory (now uses database)
function getServerMemory(guildId) {
  return db.getServerMemory(guildId);
}

// Helper: Search messages in server
async function searchMessages(guild, options = {}) {
  const { userId, channelId, keyword, limit = 50 } = options;
  const logs = messageLogs.get(guild.id) || [];
  
  let results = logs;
  
  if (userId) results = results.filter(m => m.authorId === userId);
  if (channelId) results = results.filter(m => m.channelId === channelId);
  if (keyword) results = results.filter(m => m.content.toLowerCase().includes(keyword.toLowerCase()));
  
  return results.slice(-limit);
}

// Helper: Generate conversation summary
function getConversationSummary(guildId) {
  const logs = messageLogs.get(guildId) || [];
  if (logs.length === 0) return 'No recent activity in the last hour.';
  
  // Group by channel
  const channels = {};
  logs.forEach(log => {
    if (!channels[log.channel]) {
      channels[log.channel] = { count: 0, users: new Set() };
    }
    channels[log.channel].count++;
    channels[log.channel].users.add(log.author);
  });
  
  let summary = `📊 **Last Hour Summary:**\n`;
  summary += `Total Messages: ${logs.length}\n`;
  summary += `Active Users: ${new Set(logs.map(l => l.author)).size}\n\n`;
  summary += `**Channel Activity:**\n`;
  
  for (const [channel, data] of Object.entries(channels)) {
    summary += `• #${channel}: ${data.count} messages (${data.users.size} users)\n`;
  }
  
  return summary;
}

// Helper: Generate server report
async function generateServerReport(guild) {
  const logs = messageLogs.get(guild.id) || [];
  const now = Date.now();
  const hourAgo = now - LOG_DURATION;
  
  const recentLogs = logs.filter(l => l.timestamp > hourAgo);
  
  // Most active users
  const userActivity = {};
  recentLogs.forEach(log => {
    userActivity[log.author] = (userActivity[log.author] || 0) + 1;
  });
  
  const topUsers = Object.entries(userActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  let report = `📈 **Server Activity Report (Last Hour)**\n\n`;
  report += `**Overview:**\n`;
  report += `• Total Messages: ${recentLogs.length}\n`;
  report += `• Active Users: ${Object.keys(userActivity).length}\n`;
  report += `• Server Name: ${guild.name}\n`;
  report += `• Total Members: ${guild.memberCount}\n\n`;
  
  if (topUsers.length > 0) {
    report += `**Most Active Users:**\n`;
    topUsers.forEach(([user, count], i) => {
      report += `${i + 1}. ${user} - ${count} messages\n`;
    });
  }
  
  return report;
}

client.login(process.env.DISCORD_TOKEN);
