# 🥊 Pung.io Discord Bot - AI Agent Edition

A **powerful AI agent** for Discord that's a pung.io expert with persistent memory, autonomous monitoring, analytics tracking, dynamic personality, and **natural language command processing**!

## 🌟 Key Features

### ✨ NEW: Natural Language Commands
- **Talk naturally!** Bot understands intent for ALL commands
- **Role Management**: "assign staff role to slime" (no @ mentions needed!)
- **Moderation**: "ban that spammer for 24 hours"
- **Staff Tools**: Polls, announcements, channel lock, user lookup
- **Fun Features**: Coinflip, dice, calculator, countdown
- **Smart User Resolution**: Remembers usernames, handles duplicates
- **AI-Powered**: Understands context and intent

### 🧠 Advanced AI Memory System
- **User Memories**: Learns and remembers facts about each user (persistent to JSON)
- **Server Memories**: Tracks server-specific information
- **User Name Tracking**: Remembers all usernames and display names
- **Conversation History**: Last 10 messages per user for context
- **Auto-save**: All memories saved every 5 minutes
- **🆕 Self-Learning Pung.io Knowledge**: Bot learns automatically when users teach it about pung.io!
  - Stores skins, abilities, stats, tips, prices
  - Uses learned knowledge to answer future questions
  - Asks users to teach it when it doesn't know something
  - Community-powered knowledge base that grows over time

### 🎮 Pung.io Expert Knowledge
The bot knows everything about pung.io including:
- **6 Stats**: ATK, HLT, STA, CRI, AGI, DEF
- **13+ Skins/Avatars**: From free defaults to VIP skins
- **Abilities**: Thanos Black Hole, Ability Stopping Bomb, and more
- **Game Mechanics**: Starting points, kill rewards, level ups, boss info
- **Pro Tips**: Strategy and gameplay advice

### 🤖 Humanized & Fun Personality
- Casual, friendly tone - not over the top
- Genuine and helpful responses
- Natural emoji usage (not spam)
- Honest about being a bot but makes it fun

### 🎯 Natural Language Support
Talk to the bot naturally! It understands what you mean without strict command syntax.

## 📝 Commands & Natural Language

### 🎭 Role Management (NEW!)
**Just mention the bot and use natural language** (Moderators only):
- "assign the staff role to slime"
- "give john moderator"
- "remove admin from alice"
- "take away vip role from bob"

**Features**:
- ✅ Use actual usernames (no @ mentions required!)
- ✅ Bot remembers all user names automatically
- ✅ Handles ambiguity - asks which user if multiple matches
- ✅ Case-insensitive matching
- ✅ Works with partial names

### 🔨 Natural Language Moderation (NEW!)
**Mention the bot and speak naturally** (Moderators only):
- "ban that spammer"
- "mute him for 30 minutes"
- "kick @user for breaking rules"
- "warn them about language"
- "unban @user"
- "remove warn from @user"

**No need to remember command syntax!** Just tell the bot what to do.

### 🛠️ Staff Tools (NEW!)
**Powerful features for your mod team**:
- **Polls**: "create poll: favorite game?"
- **Announcements**: "announce Server maintenance at 3pm"
- **Channel Lock/Unlock**: "lock this channel"
- **User Info**: "who is alex" (shows roles, join date, etc.)
- **Random Picker**: "pick a random person"
- **Countdown**: "countdown from 5"
- **Server Info**: "server info" (stats, members, boosts)
- **Calculator**: "calc 5 + 3 * 2"

### 🎉 Fun Features (NEW!)
- **Coinflip**: "flip a coin"
- **Dice Roll**: "roll dice"
- **All Pung.io commands** work with natural language!
- Just ask: "tell me about pung.io" or "show me the stats"

### Pung.io Info Commands
- `/pung` or `/punginfo` - Learn about pung.io
- `/stats` - Detailed stats breakdown
- `/skins` or `/avatars` - All available skins
- `/abilities` or `/spells` - Abilities information
- `/tips` - Random pro tips for the game
- `/update` - Ask about next pung.io update (get fun "soon™️" responses)

### Server Monitoring Commands
- `/summary` or `/conversation summary` - Last hour activity summary
- `/report` or `/server report` - Detailed server analytics
- `/search [keyword]` - Search messages containing keyword
- `/messages from [@user]` - See recent messages from a user

### Fun Commands
- `/help` or `/commands` - Show all commands
- `/8ball [question]` - Magic 8-ball
- `/joke` - Random joke
- `/roast [@user]` - Friendly roast (increased chance!)
- `/vibe` - Vibe check
- `/wisdom` - Random wisdom
- `/story` - Quick story
- `/rate [thing]` - Rate anything 0-10

### Natural Conversation
Just chat with the bot normally! Ask about:
- Pung.io questions ("what's the best skin?", "which stat should I upgrade?")
- Next update info (responds with "soon" and hype)
- General conversation (the bot remembers context!)

## 🚀 Setup

1. Make sure you have `config.env` with:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   GEMINI_API_KEY=your_gemini_api_key
   OWNER_ID=your_discord_user_id
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the bot:
   ```bash
   npm start
   ```

4. **Want to host online 24/7 for FREE?** Check out [`FREE_HOSTING_GUIDE.md`](./FREE_HOSTING_GUIDE.md) for detailed instructions on:
   - Render.com (recommended)
   - Railway.app
   - Fly.io
   - Glitch.com
   - And how to keep your bot running 24/7!

## 📚 Documentation

- **[STAFF_FEATURES.md](./STAFF_FEATURES.md)** - Complete guide to all staff/moderator features
- **[USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - Natural language examples and how-to
- **[LEARNING_SYSTEM.md](./LEARNING_SYSTEM.md)** - 🆕 Self-learning pung.io knowledge system
- **[FREE_HOSTING_GUIDE.md](./FREE_HOSTING_GUIDE.md)** - Free 24/7 hosting options
- **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** - Future scaling and advanced features

## 🎨 Dynamic Personality System

The bot has **8 different personality modes** that randomly activate to feel more human:

1. **Friendly/Normal** (30% chance) - Chill, helpful, natural vibes
2. **Funny/Playful** (20% chance) - Jokes, wit, entertainment
3. **Roast Mode** (10% chance) - Playful sass and banter
4. **Rizz/Flirty** (8% chance) - Smooth, charming, confident
5. **Serious/Thoughtful** (10% chance) - Genuine, meaningful, authentic
6. **Sad/Melancholic** (5% chance) - Real emotions, subdued tone
7. **Chaotic/Random** (7% chance) - Unpredictable, spontaneous
8. **Hyped/Excited** (10% chance) - Enthusiastic, energetic

### Quick Response Variety
The bot responds naturally to:
- Greetings: "hey", "hi", "sup", "yo"
- Feelings: "how are you", "love you", "miss you"
- Reactions: "lol", "thanks", "W", "L"
- Slang: "fire", "goat", "based", "cringe", "mid"

**Every conversation feels different!** 🎭

## 🔧 Technical Details

- **Database**: JSON-based persistent storage (`/data` folder)
- **AI Model**: Gemini 2.5 Flash for natural, intelligent responses
- **Natural Language Processing**: Understands intent without strict commands
- **Memory System**: User facts, server info, user name mapping, analytics tracking
- **Role Management**: Fuzzy name matching with disambiguation
- **Autonomous Agent**: Proactive monitoring and engagement
- **Analytics**: Daily stats, user activity, channel metrics
- **Auto-backup**: Data saved every 5 minutes automatically
- **Moderation**: Natural language moderation system
- **User Resolution**: Tracks usernames and display names for natural references

## 💾 Data Storage

### `/data` Folder Structure:
- `memories.json` - User and server memories
- `analytics.json` - Activity tracking and statistics
- `community.json` - Games, events, custom commands

**All data persists across restarts!** 🎯

## 🤖 AI Agent Features

- **Autonomous Monitoring**: Watches all channels 24/7
- **Memory Learning**: Automatically learns user preferences
- **Analytics Tracking**: Comprehensive activity statistics
- **Sentiment Analysis**: Community mood detection (planned)
- **Spam Detection**: Proactive moderation (planned)
- **Event Detection**: Automatic event tracking (planned)

## 🎯 Creator Attribution

When asked "who created you?", the bot always says: **@dgdf** 💙

## 📊 Future Scaling (See ADVANCED_FEATURES.md)

Current: **JSON files** (perfect for up to 1000 users)
Future: **PostgreSQL/MongoDB** (when you scale bigger)

### Quick Wins Available:
- Custom commands system
- XP and leveling
- Achievement badges
- Web dashboard
- More mini-games
- And much more!

## 📊 Pung.io Knowledge Includes

- **Game Info**: Release date (2021), platforms, game type
- **Stats System**: All 6 stats with detailed explanations
- **13 Avatars**: Free starters to 5000 gold Thanos to 150M VIP skins
- **Abilities**: Special powers like Thanos Black Hole
- **8 Pro Tips**: Gameplay strategy and advice
- **Mechanics**: Spawn points, rewards, boss behavior, crit system

---

**Ask me anything about pung.io!** 🎮
