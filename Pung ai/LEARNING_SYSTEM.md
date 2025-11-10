# 🧠 Self-Learning Pung.io Knowledge System

## ✨ What is This?

The bot now **learns automatically** when users teach it about pung.io! It stores this knowledge and uses it to answer future questions.

---

## 🎯 How It Works

### 1. **Users Teach the Bot**
When anyone mentions pung.io information, the bot detects and stores it:

**Examples:**
```
User: "The Thanos skin costs 5000 gold"
Bot: ✅ Thanks! I learned about the thanos! I'll remember this for future questions! 📚

User: "Shadow Punch ability lets you teleport behind enemies"
Bot: Got it! Added shadow punch to my knowledge base! 🧠

User: "AGI stat increases your movement speed"
Bot: Nice! I'll remember this info about AGI! 💡
```

### 2. **Bot Uses Learned Knowledge**
When someone asks about pung.io, bot uses its learned knowledge:

**Example:**
```
User: "How much does the Thanos skin cost?"
Bot: "The Thanos skin costs 5000 gold! Worth every coin fr 💜"

User: "What does Shadow Punch do?"
Bot: "Shadow Punch lets you teleport behind enemies! Pretty OP ability tbh 🔥"
```

### 3. **Bot Asks When It Doesn't Know**
If asked about something it hasn't learned:

```
User: "What does the new Dragon skin look like?"
Bot: "I don't have enough data about that at the moment. Please tell me about it so I can give a better answer for future users! 🤔"

User: "The Dragon skin is red with flames and costs 7500 gold"
Bot: ✅ Thanks! I learned about the dragon! I'll remember this for future questions! 📚
```

---

## 📊 What Can Be Learned?

### 🎨 **Skins/Avatars**
- Names
- Prices/Costs
- Descriptions
- Special features

**Examples:**
```
✅ "Thanos skin costs 5000 gold"
✅ "The zombie skin is 3000 gold and has green effects"
✅ "VIP skins are the rarest and most expensive"
```

### ⚡ **Abilities/Skills**
- Names
- What they do
- How to use them
- Costs

**Examples:**
```
✅ "Shadow Punch lets you teleport"
✅ "Fire Ball ability costs 50 coins and deals AOE damage"
✅ "Shield ability blocks 200 damage"
```

### 📊 **Stats**
- What each stat does
- How they affect gameplay
- Best builds

**Examples:**
```
✅ "AGI increases movement speed"
✅ "CRI affects critical hit chance"
✅ "STR increases punch damage"
✅ "1000 CRI gives guaranteed crits"
```

### 💡 **Tips**
- Pro tips
- Strategies
- Best practices

**Examples:**
```
✅ "Always upgrade CRI first for better damage"
✅ "Save gold for the Thanos skin"
✅ "Movement is key to dodging punches"
```

### 📚 **General Knowledge**
- Game mechanics
- Updates
- Events
- Anything else!

**Examples:**
```
✅ "Ranked mode was added in the latest update"
✅ "The maximum level is 100"
✅ "Daily login gives you 50 gold"
```

---

## 🎮 Usage Examples

### Teaching About Skins:
```
You: "The Galaxy skin is 6000 gold and has a purple glow effect"
Bot: ✅ Thanks! I learned about the galaxy! I'll remember this for future questions! 📚

Later...
Someone: "How much is the Galaxy skin?"
Bot: "The Galaxy skin is 6000 gold and has a purple glow effect! 💜"
```

### Teaching About Abilities:
```
You: "Dash ability costs 100 coins and makes you move super fast for 3 seconds"
Bot: Got it! Added dash to my knowledge base! 🧠

Later...
Someone: "What does Dash do?"
Bot: "Dash makes you move super fast for 3 seconds! Costs 100 coins. Pretty useful for escaping tbh 🏃"
```

### Teaching About Stats:
```
You: "DEF stat reduces damage taken from enemies"
Bot: Nice! I'll remember this info about DEF! 💡

Later...
Someone: "Should I upgrade DEF?"
Bot: "DEF reduces damage taken from enemies! Good if you want to tank hits 💪"
```

### When Bot Doesn't Know:
```
Someone: "What's the new Ninja skin price?"
Bot: "I don't have enough data about that at the moment. Please tell me about it so I can give a better answer for future users! 🤔"

You: "The Ninja skin is 4500 gold with stealth effects"
Bot: ✅ Thanks! I learned about the ninja! I'll remember this for future questions! 📚

Later...
Someone: "Tell me about the Ninja skin"
Bot: "The Ninja skin is 4500 gold with stealth effects! 🥷"
```

---

## 🔧 Technical Details

### Storage:
- All knowledge stored in `data/memories.json`
- Organized by category (skins, abilities, stats, tips, general)
- Includes who taught it and when
- Persistent across bot restarts

### Categories:
```json
{
  "pungKnowledge": {
    "skins": {
      "thanos": {
        "price": "5000 gold",
        "description": "thanos skin",
        "addedBy": "User#1234",
        "timestamp": "2024-11-10T..."
      }
    },
    "abilities": { ... },
    "stats": { ... },
    "tips": [ ... ],
    "general": { ... }
  }
}
```

### AI Detection:
- Uses Gemini AI to detect when users are teaching
- Extracts structured information automatically
- Stores in appropriate category
- Non-intrusive - silent fail if uncertain

---

## ⚙️ How to Teach the Bot

### Natural Language (Recommended):
Just talk normally! The bot detects teaching automatically:
```
✅ "The Thanos skin costs 5000 gold"
✅ "Shadow Punch lets you teleport"
✅ "AGI increases movement speed"
✅ "Pro tip: always save for expensive skins"
```

### What Gets Detected:
- Mentions of skins, abilities, stats
- Prices and costs
- Descriptions of what things do
- Tips and strategies
- General game info

### What Doesn't Get Detected:
- Questions ("What does X do?")
- Opinions ("I like X")
- General chat ("Nice game!")

---

## 💡 Best Practices

### 1. **Be Specific**
❌ "That skin is expensive"
✅ "The Thanos skin costs 5000 gold"

### 2. **Include Details**
❌ "Shadow Punch is good"
✅ "Shadow Punch lets you teleport behind enemies"

### 3. **Mention Prices**
❌ "The Galaxy skin is cool"
✅ "The Galaxy skin is 6000 gold"

### 4. **Share Tips**
```
✅ "Always upgrade CRI to 1000 for guaranteed crits"
✅ "Save gold for VIP skins, they're the best"
✅ "Movement is more important than damage early game"
```

### 5. **Update When Things Change**
If game updates, teach new info:
```
"The Thanos skin price was reduced to 4000 gold"
"New ability: Ice Blast freezes enemies for 2 seconds"
```

---

## 🎓 Community Benefits

### Builds Knowledge Base:
- Everyone teaches what they know
- Bot becomes smarter over time
- New players get instant answers

### Reduces Repeat Questions:
- Bot answers common questions automatically
- Community doesn't need to repeat answers
- Information is always available

### Keeps Info Current:
- Bot learns about new updates
- Community shares discoveries
- Knowledge stays fresh

---

## 🔍 Viewing Learned Knowledge

### Check What Bot Knows:
The bot includes learned knowledge in its responses automatically!

### Examples:
```
You: "What skins do you know about?"
Bot: "I know about: Thanos (5000 gold), Galaxy (6000 gold), Zombie (3000 gold), ..."

You: "Tell me what you know about abilities"
Bot: "I've learned about: Shadow Punch (teleport behind enemies), Dash (move super fast for 3 seconds), ..."
```

---

## 🚀 Getting Started

### As a Regular User:
1. Just chat normally about pung.io
2. Mention facts when you know them
3. Bot learns automatically
4. No special commands needed!

### As a Moderator:
1. Encourage community to share knowledge
2. Correct misinformation when needed
3. Share official update details
4. Help keep knowledge accurate

### For New Players:
1. Ask questions naturally
2. Bot will answer from learned knowledge
3. If bot doesn't know, someone will teach it
4. You'll get answers faster next time!

---

## 📋 Example Session

```
User1: "What's the best skin?"
Bot: "I don't have enough data about that at the moment. Please tell me about it so I can give a better answer for future users! 🤔"

User2: "The Thanos skin is the best imo, costs 5000 gold"
Bot: ✅ Thanks! I learned about the thanos! I'll remember this for future questions! 📚

User3: "How much is the Thanos skin?"
Bot: "The Thanos skin costs 5000 gold! Worth every coin fr 💜"

User4: "What does AGI do?"
Bot: "I don't have enough data about that at the moment. Please tell me about it so I can give a better answer for future users! 🤔"

User2: "AGI increases your movement speed"
Bot: Nice! I'll remember this info about AGI! 💡

User1: "Should I upgrade AGI?"
Bot: "AGI increases your movement speed! Good for dodging and chasing enemies 🏃"
```

---

## 🎉 Summary

### ✅ Bot Learns Automatically
- No commands needed
- Just share information
- Bot detects and stores it

### ✅ Uses Knowledge to Help
- Answers questions from learned info
- Shares with everyone
- Builds community knowledge base

### ✅ Asks When It Doesn't Know
- Admits knowledge gaps
- Asks users to teach it
- Gets smarter over time

### ✅ Benefits Everyone
- New players get instant answers
- Veterans don't repeat themselves
- Knowledge persists forever

---

**Your bot is now a self-improving pung.io encyclopedia! 🎮📚**

*Just chat naturally about pung.io and watch it learn!*
