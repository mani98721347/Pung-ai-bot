# 🛠️ Staff Features Guide

Complete guide to all staff/moderator features available in the bot!

---

## 🎯 Natural Language - Talk Naturally!

**The bot understands natural language for ALL commands!** No need to memorize exact syntax.

### Examples:
```
✅ "tell me about pung.io"
✅ "show me the stats" 
✅ "create a poll about favorite games"
✅ "who is user alex"
✅ "flip a coin"
✅ "give me server info"
```

---

## 🎭 Role Management (Moderators Only)

### Assign Roles:
- `@Bot assign staff role to slime`
- `@Bot give john moderator`
- `@Bot make alice an admin`

### Remove Roles:
- `@Bot remove moderator from bob`
- `@Bot take away vip from charlie`
- `@Bot remove admin role from dave`

**Features:**
- ✅ Use actual usernames (no @ mentions required!)
- ✅ Case-insensitive matching
- ✅ Partial name matching
- ✅ Handles duplicate names by asking which user

---

## 🔨 Moderation (Moderators Only)

### Ban Users:
- `@Bot ban that spammer`
- `@Bot ban @user for harassment`

### Mute/Timeout:
- `@Bot mute him for 30 minutes`
- `@Bot timeout @user for 2 hours`

### Kick:
- `@Bot kick @user for breaking rules`
- `@Bot kick that guy`

### Warn:
- `@Bot warn @user for spam`
- `@Bot warn them about language`

### Unban/Unmute:
- `@Bot unban @user`
- `@Bot unmute them`

### Clear Warnings:
- `@Bot remove warn from @user`
- `@Bot clear warnings for @user`

---

## 📊 Staff Tools

### 1. **Poll Creation**
Create interactive polls with reactions

**Usage:**
```
@Bot create poll: What's your favorite game?
/poll: Best time for events?
```

**How it works:**
- Bot posts formatted poll
- Auto-adds ✅ ❌ 🤷 reactions
- Users react to vote

---

### 2. **Announcements** (Moderators Only)
Format and post clean announcements

**Usage:**
```
@Bot announce Server maintenance tomorrow at 3pm
/announcement Important update about rules
```

**Features:**
- Professional formatting
- Auto-includes your username
- Deletes command message (keeps channel clean)

---

### 3. **Channel Lock/Unlock** (Moderators Only)
Temporarily restrict channel access

**Lock:**
```
@Bot lock this channel
/lock
```

**Unlock:**
```
@Bot unlock this channel
/unlock
```

**What it does:**
- Prevents @everyone from sending messages
- Moderators can still send messages
- Useful during events or emergencies

---

### 4. **User Info Lookup**
Get detailed information about any user

**Usage:**
```
@Bot who is alex
@Bot userinfo @user
/userinfo slime
```

**Shows:**
- Display name & username
- User ID
- All roles
- Join date
- Account creation date
- Bot status

---

### 5. **Random Member Picker**
Pick a random (non-bot) member

**Usage:**
```
@Bot pick a random person
/pick
```

**Use cases:**
- Giveaways
- Random team assignments
- Fun challenges

---

### 6. **Server Information**
View detailed server stats

**Usage:**
```
@Bot server info
/serverinfo
```

**Shows:**
- Server name & owner
- Total members
- Channel count
- Role count
- Creation date
- Boost level & count

---

### 7. **Countdown Timer**
Visual countdown (1-10 seconds)

**Usage:**
```
@Bot countdown from 5
/countdown 3
```

**Perfect for:**
- Starting events
- Stream countdowns
- Game starts

---

## 📈 Analytics & Monitoring

### Server Summary:
```
@Bot give me a summary
/summary
```
Shows last hour's activity by channel

### Server Report:
```
@Bot server report
/report
```
Detailed analytics with top users

### Message Search:
```
@Bot search for spam
/search pung.io
```
Find recent messages with keyword

### User Messages:
```
@Bot messages from @user
/messages from @alex
```
See recent messages from specific user

---

## 🎮 Game & Fun Features

### 🪙 Coinflip:
```
@Bot flip a coin
/flip
```

### 🎲 Dice Roll:
```
@Bot roll dice
/roll
```

### 🧮 Calculator:
```
@Bot calc 5 + 3 * 2
/calculate 100 / 4
```

### 🎱 Magic 8-Ball:
```
@Bot 8ball will we win?
/8ball should I stream today?
```

### 😂 Joke:
```
@Bot tell me a joke
/joke
```

### 🔥 Roast:
```
@Bot roast @friend
/roast @user
```

### ⭐ Rate Anything:
```
@Bot rate pizza
/rate the thanos skin
```

### 🌈 Vibe Check:
```
@Bot vibe check
/vibe
```

### 💭 Wisdom:
```
@Bot give me wisdom
/wisdom
```

### 📖 Story:
```
@Bot tell me a story
/story
```

---

## 🎮 Pung.io Commands

All pung.io info works with natural language!

### Game Info:
```
@Bot tell me about pung.io
/pung
```

### Stats Breakdown:
```
@Bot show me the stats
/stats
```

### Skins/Avatars:
```
@Bot what skins are there
/skins
```

### Abilities:
```
@Bot explain abilities
/abilities
```

### Pro Tips:
```
@Bot give me tips
/tips
```

### Update Status:
```
@Bot when is next update
/update
```

---

## 🧠 Smart Features

### Auto Name Memory:
- Bot remembers every user's name automatically
- Works with usernames and nicknames
- No configuration needed

### User Memory:
- Bot learns what you tell it
- "my name is Alex" → Bot remembers
- "I like pizza" → Bot remembers

### Context Awareness:
- Understands conversation flow
- References previous messages
- Maintains personality across chats

### Fuzzy Matching:
- "alex" matches "alexthegreat"
- Case-insensitive
- Handles typos well

### Duplicate Handling:
If multiple users have same name:
```
🤔 Found multiple users named "alex":
1. alex#1234 (ID: 123456789)
2. alexthegreat#5678 (ID: 987654321)
Please be more specific!
```

---

## 💡 Pro Tips for Staff

### 1. **Use Natural Language**
The bot understands intent, not just commands:
- ❌ "/assign_role @user staff"
- ✅ "give john the staff role"

### 2. **No @ Mentions Required**
For role management, just use names:
- ❌ "assign staff to @john"
- ✅ "assign staff to john"

### 3. **Batch Operations**
Handle multiple tasks efficiently:
```
1. "lock this channel"
2. "announce Server maintenance starting"
3. "unlock this channel" (when done)
```

### 4. **Use Polls for Decisions**
Quick community feedback:
```
"create poll: Should we add a new channel?"
```

### 5. **Monitor with Analytics**
Regular checks keep server healthy:
```
/summary (quick check)
/report (detailed analysis)
```

### 6. **Clear Announcements**
Professional formatting automatically:
```
announce Important: Rule update in #rules
```

---

## 🔒 Permission Requirements

### Moderator Role:
- Role ID: `917191156528451605`
- Set in `config.env` as `MODERATOR_ROLE_ID`

### Bot Permissions Needed:
- ✅ Read Messages
- ✅ Send Messages
- ✅ Manage Messages (for announcements)
- ✅ Manage Roles (for role management)
- ✅ Moderate Members (for timeouts)
- ✅ Ban Members (for bans)
- ✅ Kick Members (for kicks)
- ✅ Manage Channels (for lock/unlock)
- ✅ Add Reactions (for polls)

---

## 🚀 Quick Start for New Staff

1. **Learn the basics:**
   - `@Bot what can you do`
   - Read the response carefully

2. **Try role management:**
   - `@Bot assign test-role to yourself`
   - `@Bot remove test-role from yourself`

3. **Test moderation:** (in test channel)
   - Practice warn/mute commands
   - Learn the syntax

4. **Use staff tools:**
   - Create a poll
   - Make an announcement
   - Lock/unlock a channel

5. **Explore features:**
   - Try all fun commands
   - Check server analytics
   - Look up user info

---

## 📝 Common Questions

**Q: Do I need to use exact command syntax?**
A: No! Just talk naturally. The bot understands intent.

**Q: Can I use nicknames?**
A: Yes! The bot remembers both usernames and server nicknames.

**Q: What if I make a typo?**
A: Bot has fuzzy matching and will usually understand.

**Q: Can regular users use these features?**
A: Moderation and staff tools require moderator role. Fun commands work for everyone.

**Q: How do I see all features?**
A: Ask: `@Bot what can you do`

**Q: Does it work in DMs?**
A: No, most features require a server context.

---

## 🎓 Advanced Tips

### Combine Features:
```
1. Create poll about event time
2. Announce winning time
3. Lock channel
4. Countdown from 5
5. Start event!
```

### Use Analytics:
```
1. Check /report weekly
2. Monitor active channels
3. Identify top contributors
4. Plan events accordingly
```

### Role Management:
```
1. Use natural language
2. Handle duplicates carefully
3. Verify before big changes
4. Keep role hierarchy in mind
```

---

## 🆘 Troubleshooting

### Bot doesn't respond:
- Check if bot is online
- Verify you mentioned it (@Bot)
- Try with / prefix

### Can't assign roles:
- Verify moderator role
- Check bot permissions
- Ensure bot's role is higher than target role

### Channel lock doesn't work:
- Check "Manage Channels" permission
- Verify moderator status

### User not found:
- User might not have sent messages yet
- Try @ mentioning them directly
- Check spelling

---

## 🎉 Have Fun!

The bot is designed to make server management easier AND more enjoyable. Experiment with features, find workflows that work for you, and don't hesitate to use natural language!

**Need help?** Just ask the bot: `@Bot what can you do`

---

*For hosting info, check [`FREE_HOSTING_GUIDE.md`](./FREE_HOSTING_GUIDE.md)*
*For usage examples, check [`USAGE_EXAMPLES.md`](./USAGE_EXAMPLES.md)*
