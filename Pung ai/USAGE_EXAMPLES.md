# 📖 Usage Examples - Natural Language Commands

This guide shows you how to use the bot's natural language features!

---

## 🎭 Role Management Examples

### Assigning Roles

**You say:** `@BotName assign the staff role to slime`
**Bot does:** Finds user "slime" and gives them the staff role

**You say:** `@BotName give john moderator`
**Bot does:** Gives john the moderator role

**You say:** `@BotName make alice an admin`
**Bot does:** Assigns admin role to alice

### Removing Roles

**You say:** `@BotName remove the moderator role from bob`
**Bot does:** Removes moderator role from bob

**You say:** `@BotName take away vip from charlie`
**Bot does:** Removes VIP role from charlie

**You say:** `@BotName remove admin from dave`
**Bot does:** Removes admin role from dave

---

## 👥 Handling Multiple Users with Same Name

**Scenario:** Two users are named "alex"

**You say:** `@BotName assign staff to alex`

**Bot responds:**
```
🤔 Found multiple users named "alex":

1. alex#1234 (ID: 123456789)
2. alexthegreat#5678 (ID: 987654321)

Please be more specific or mention the user directly!
```

**You say:** `@BotName assign staff to alexthegreat`
**Bot does:** Now assigns the role to the correct user!

**Or mention directly:** `@BotName assign staff to @alex#1234`

---

## 🔨 Moderation Examples

### Banning Users

**You say:** `@BotName ban that spammer`
**Bot does:** Bans the mentioned/referenced user

**You say:** `@BotName ban @troublemaker for harassment`
**Bot does:** Bans the user with reason "harassment"

### Muting Users

**You say:** `@BotName mute him for 30 minutes`
**Bot does:** Mutes the mentioned user for 30 minutes

**You say:** `@BotName timeout @user for 2 hours`
**Bot does:** Times out the user for 2 hours (120 minutes)

**You say:** `@BotName mute them`
**Bot does:** Mutes for default duration (10 minutes)

### Warning Users

**You say:** `@BotName warn @user for spam`
**Bot does:** Issues a warning with reason "spam"

**You say:** `@BotName warn them about language`
**Bot does:** Warns the user about language

### Kicking Users

**You say:** `@BotName kick @user for breaking rules`
**Bot does:** Kicks the user with reason

**You say:** `@BotName kick that guy`
**Bot does:** Kicks the mentioned user

### Unbanning/Unmuting

**You say:** `@BotName unban @user`
**Bot does:** Unbans the user

**You say:** `@BotName unmute them`
**Bot does:** Removes timeout from user

**You say:** `@BotName remove warn from @user`
**Bot does:** Clears all warnings for that user

---

## 🛠️ Staff Features Examples

### Creating Polls:
**You say:** `@BotName create poll: What game should we play tonight?`
**Bot does:** Creates formatted poll with reaction buttons (✅ ❌ 🤷)

**You say:** `/poll: Best time for events?`
**Bot does:** Same - works with / prefix too!

### Announcements (Moderators):
**You say:** `@BotName announce Server maintenance tomorrow at 3pm EST`
**Bot does:** Posts professional announcement, deletes your command message

**You say:** `/announcement Important: New rules in #rules channel`
**Bot does:** Formats announcement with your username

### Channel Lock/Unlock (Moderators):
**You say:** `@BotName lock this channel`
**Bot does:** Restricts @everyone from sending messages

**You say:** `@BotName unlock this channel`
**Bot does:** Restores normal permissions

### User Info Lookup:
**You say:** `@BotName who is alex`
**Bot does:** Shows roles, join date, account age, etc.

**You say:** `/userinfo @john`
**Bot does:** Same but with mention

### Random Picker:
**You say:** `@BotName pick a random person`
**Bot does:** Picks random non-bot member

### Countdown:
**You say:** `@BotName countdown from 5`
**Bot does:** 5... 4... 3... 2... 1... GO!

### Server Info:
**You say:** `@BotName server info`
**Bot does:** Shows members, channels, roles, boost level, etc.

### Calculator:
**You say:** `@BotName calc 5 + 3 * 2`
**Bot does:** Shows result (11)

---

## 🎮 Fun Commands Examples

### Coinflip:
**You say:** `@BotName flip a coin`
**Bot does:** 🪙 **Heads**! (or Tails)

### Dice Roll:
**You say:** `@BotName roll dice`
**Bot does:** 🎲 You rolled a **4**!

---

## 💬 Regular Chat Examples

### Asking About Pung.io

**You say:** `@BotName what's the best skin in pung.io?`
**Bot responds:** "thanos skin is the goat fr, costs 5000 gold but worth every coin 💜"

**You say:** `@BotName which stat should I upgrade?`
**Bot responds:** "depends on playstyle tbh. balanced is usually good but if you go 1000 CRI you get guaranteed crits which is kinda nutty 🎯"

**You say:** `/stats`
**Bot responds:** Full breakdown of all pung.io stats

### Getting Information

**You say:** `/help`
**Bot responds:** Complete command list with natural language examples

**You say:** `/summary`
**Bot responds:** Last hour's server activity summary

**You say:** `/search pung.io`
**Bot responds:** Recent messages containing "pung.io"

### Fun Interactions

**You say:** `@BotName tell me a joke`
**Bot responds:** A random AI-generated joke

**You say:** `@BotName roast @friend`
**Bot responds:** A playful, friendly roast

**You say:** `/8ball will I win my next pung.io match?`
**Bot responds:** "🎱 It is certain." (or random 8-ball response)

**You say:** `@BotName rate pizza`
**Bot responds:** "**7/10** - because it's good but not as good as the Thanos skin in pung.io 💜"

---

## 🌟 Smart Features in Action

### The Bot Remembers Your Name

**First message:** "hey bot, my name is alex"
**Bot:** "nice to meet you alex!"

**Later conversation:** `@BotName what's my name?`
**Bot:** "you're alex!"

### Context Awareness

**You say:** `@BotName how are you?`
**Bot:** "vibing honestly, hbu?"

**You say:** "pretty good, just won a match"
**Bot:** "ayy nice! pung.io W right there 🔥"

### Natural Emoji Usage

The bot uses emojis naturally, not excessively:
- ✅ "that's awesome!" 
- ❌ "that's 😃 awesome 🎉🎊🎈!!!"

### Different Moods

**Sometimes Helpful:**
"sure! let me explain how pung.io stats work..."

**Sometimes Funny:**
"lmao imagine not having the thanos skin 💀"

**Sometimes Real:**
"honestly, the grind in pung.io can be tough but it's worth it"

---

## 🚫 What Doesn't Work (Yet)

### ❌ Complex Multi-Step Commands
**Won't work:** "ban user1, kick user2, and warn user3"
**Instead do:** Three separate commands

### ❌ Conditional Logic
**Won't work:** "if user spams again, ban them"
**Instead:** React when it happens

### ❌ Scheduled Actions
**Won't work:** "remind me in 1 hour to check on user"
**Instead:** Set your own reminder

### ❌ Bulk Operations
**Won't work:** "assign staff to everyone in the channel"
**Instead:** Do individually or use Discord's built-in features

---

## 🎯 Tips for Best Results

### ✅ DO:
- Use clear, simple language
- Mention the bot with @BotName
- Specify the user name clearly
- Use @ mentions when there might be confusion
- Be specific about durations (30 minutes, 2 hours)
- Give reasons for moderation actions

### ❌ DON'T:
- Use super complex sentences
- Expect it to understand references without names
- Give multiple commands in one message
- Assume it knows who "him" or "that guy" is without @ mention

---

## 📋 Quick Reference Card

```
ROLE MANAGEMENT:
@Bot assign [role] to [user]
@Bot give [user] [role]
@Bot remove [role] from [user]

MODERATION:
@Bot ban [user] for [reason]
@Bot mute [user] for [duration]
@Bot kick [user]
@Bot warn [user] for [reason]
@Bot unban [user]
@Bot unmute [user]

INFORMATION:
/help - Command list
/summary - Activity summary
/pung - Pung.io info
/stats - Game stats

FUN:
/joke - Random joke
/roast @user - Roast someone
/8ball [question] - Magic 8-ball
/vibe - Vibe check
```

---

## 🤔 Common Questions

**Q: Do I need to use exact command syntax?**
A: No! Just talk naturally. "give alex staff" works the same as "assign the staff role to alex"

**Q: Can I use nicknames?**
A: Yes! The bot remembers both usernames and server nicknames.

**Q: What if there are multiple users with the same name?**
A: The bot will ask you to clarify by showing all matches with their user tags.

**Q: Do I need to @ mention users?**
A: Not for role management! Just use their name. For moderation, @ mentions are safer.

**Q: Can I use it in DMs?**
A: No, moderation and role management only work in servers.

**Q: Does it work with partial names?**
A: Yes! "alex" will match "alexthegreat" and "alex123"

**Q: Is there a cooldown?**
A: No cooldown for commands, but be reasonable to avoid rate limits.

---

## 🎮 Ready to Try?

1. **Start simple:** Try `/help` to see all commands
2. **Test role management:** `@Bot assign test-role to yourself`
3. **Chat naturally:** Just talk to the bot like a friend
4. **Have fun:** Try `/joke`, `/8ball`, or `/vibe`

**Remember:** The bot is here to help and make server management easier while being fun to interact with! 💙

---

*For hosting information, check out [`FREE_HOSTING_GUIDE.md`](./FREE_HOSTING_GUIDE.md)*
*For technical details, check out the main [`README.md`](./README.md)*
