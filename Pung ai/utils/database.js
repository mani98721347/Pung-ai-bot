// Database utility for JSON-based storage
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.files = {
      memories: path.join(DATA_DIR, 'memories.json'),
      analytics: path.join(DATA_DIR, 'analytics.json'),
      community: path.join(DATA_DIR, 'community.json')
    };
    this.cache = {};
    this.loadAll();
    
    // Auto-save every 5 minutes
    setInterval(() => this.saveAll(), 5 * 60 * 1000);
  }

  loadAll() {
    for (const [key, filepath] of Object.entries(this.files)) {
      try {
        if (fs.existsSync(filepath)) {
          const data = fs.readFileSync(filepath, 'utf8');
          this.cache[key] = JSON.parse(data);
        } else {
          this.cache[key] = this.getDefaultData(key);
          this.save(key);
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
        this.cache[key] = this.getDefaultData(key);
      }
    }
    console.log('✅ Database loaded successfully');
  }

  getDefaultData(key) {
    const defaults = {
      memories: {
        userMemories: {},
        serverMemories: {},
        userNames: {}, // Maps guildId -> { username/nickname -> [userIds] }
        pungKnowledge: {
          skins: {},      // { skinName: { price, description, addedBy, timestamp } }
          abilities: {},  // { abilityName: { description, addedBy, timestamp } }
          stats: {},      // { statName: { description, addedBy, timestamp } }
          tips: [],       // [{ tip, addedBy, timestamp }]
          general: {}     // { topic: { info, addedBy, timestamp } }
        }
      },
      analytics: {
        dailyStats: {},
        userActivity: {},
        channelStats: {}
      },
      community: {
        games: {},
        events: [],
        customCommands: {},
        autoResponses: []
      }
    };
    return defaults[key] || {};
  }

  save(key) {
    try {
      fs.writeFileSync(this.files[key], JSON.stringify(this.cache[key], null, 2));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  saveAll() {
    for (const key of Object.keys(this.files)) {
      this.save(key);
    }
    console.log('💾 All data saved');
  }

  // User Memories
  getUserMemory(userId) {
    if (!this.cache.memories.userMemories[userId]) {
      this.cache.memories.userMemories[userId] = [];
    }
    return this.cache.memories.userMemories[userId];
  }

  addUserMemory(userId, memory) {
    const memories = this.getUserMemory(userId);
    memories.push(memory);
    if (memories.length > 20) memories.shift();
    this.save('memories');
  }

  // Server Memories
  getServerMemory(guildId) {
    if (!this.cache.memories.serverMemories[guildId]) {
      this.cache.memories.serverMemories[guildId] = [];
    }
    return this.cache.memories.serverMemories[guildId];
  }

  addServerMemory(guildId, memory) {
    const memories = this.getServerMemory(guildId);
    memories.push(memory);
    if (memories.length > 50) memories.shift();
    this.save('memories');
  }

  // Analytics
  trackMessage(guildId, userId, channelId) {
    const today = new Date().toISOString().split('T')[0];
    
    // Daily stats
    if (!this.cache.analytics.dailyStats[today]) {
      this.cache.analytics.dailyStats[today] = { messages: 0, users: new Set() };
    }
    this.cache.analytics.dailyStats[today].messages++;
    
    // User activity
    if (!this.cache.analytics.userActivity[userId]) {
      this.cache.analytics.userActivity[userId] = { total: 0, lastSeen: null };
    }
    this.cache.analytics.userActivity[userId].total++;
    this.cache.analytics.userActivity[userId].lastSeen = new Date().toISOString();
    
    // Channel stats
    if (!this.cache.analytics.channelStats[channelId]) {
      this.cache.analytics.channelStats[channelId] = 0;
    }
    this.cache.analytics.channelStats[channelId]++;
  }

  // Community Data
  getCommunityData() {
    return this.cache.community;
  }

  addGame(gameId, gameData) {
    this.cache.community.games[gameId] = gameData;
    this.save('community');
  }

  addEvent(event) {
    this.cache.community.events.push(event);
    this.save('community');
  }

  addCustomCommand(name, response) {
    this.cache.community.customCommands[name] = response;
    this.save('community');
  }

  getCustomCommand(name) {
    return this.cache.community.customCommands[name];
  }

  // User Name Mapping - for natural language user references
  updateUserName(guildId, userId, username, displayName) {
    if (!this.cache.memories.userNames) {
      this.cache.memories.userNames = {};
    }
    if (!this.cache.memories.userNames[guildId]) {
      this.cache.memories.userNames[guildId] = {};
    }
    
    const guildNames = this.cache.memories.userNames[guildId];
    
    // Store by username (lowercase for case-insensitive matching)
    const usernameLower = username.toLowerCase();
    if (!guildNames[usernameLower]) {
      guildNames[usernameLower] = [];
    }
    if (!guildNames[usernameLower].includes(userId)) {
      guildNames[usernameLower].push(userId);
    }
    
    // Store by display name if different
    if (displayName && displayName !== username) {
      const displayLower = displayName.toLowerCase();
      if (!guildNames[displayLower]) {
        guildNames[displayLower] = [];
      }
      if (!guildNames[displayLower].includes(userId)) {
        guildNames[displayLower].push(userId);
      }
    }
    
    this.save('memories');
  }

  findUsersByName(guildId, name) {
    if (!this.cache.memories.userNames || !this.cache.memories.userNames[guildId]) {
      return [];
    }
    
    const nameLower = name.toLowerCase();
    const guildNames = this.cache.memories.userNames[guildId];
    
    // Exact match
    if (guildNames[nameLower]) {
      return guildNames[nameLower];
    }
    
    // Partial match
    const matches = [];
    for (const [storedName, userIds] of Object.entries(guildNames)) {
      if (storedName.includes(nameLower) || nameLower.includes(storedName)) {
        matches.push(...userIds);
      }
    }
    
    return [...new Set(matches)]; // Remove duplicates
  }

  // Pung.io Knowledge Management
  addPungKnowledge(category, key, data, addedBy) {
    if (!this.cache.memories.pungKnowledge) {
      this.cache.memories.pungKnowledge = {
        skins: {},
        abilities: {},
        stats: {},
        tips: [],
        general: {}
      };
    }

    const knowledge = this.cache.memories.pungKnowledge;
    const timestamp = new Date().toISOString();

    if (category === 'tips') {
      // Tips are stored as array
      knowledge.tips.push({
        tip: data,
        addedBy,
        timestamp
      });
    } else if (['skins', 'abilities', 'stats', 'general'].includes(category)) {
      // Other categories are objects
      const keyLower = key.toLowerCase();
      knowledge[category][keyLower] = {
        ...data,
        addedBy,
        timestamp
      };
    }

    this.save('memories');
    console.log(`📚 LEARNED: ${category} - ${key || data} (by ${addedBy})`);
  }

  getPungKnowledge(category, key = null) {
    if (!this.cache.memories.pungKnowledge) {
      return null;
    }

    const knowledge = this.cache.memories.pungKnowledge;

    if (!knowledge[category]) {
      return null;
    }

    if (key) {
      const keyLower = key.toLowerCase();
      return knowledge[category][keyLower] || null;
    }

    return knowledge[category];
  }

  searchPungKnowledge(query) {
    if (!this.cache.memories.pungKnowledge) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const results = [];
    const knowledge = this.cache.memories.pungKnowledge;

    // Search skins
    for (const [name, data] of Object.entries(knowledge.skins || {})) {
      if (name.includes(queryLower) || (data.description && data.description.toLowerCase().includes(queryLower))) {
        results.push({ category: 'skin', name, ...data });
      }
    }

    // Search abilities
    for (const [name, data] of Object.entries(knowledge.abilities || {})) {
      if (name.includes(queryLower) || (data.description && data.description.toLowerCase().includes(queryLower))) {
        results.push({ category: 'ability', name, ...data });
      }
    }

    // Search stats
    for (const [name, data] of Object.entries(knowledge.stats || {})) {
      if (name.includes(queryLower) || (data.description && data.description.toLowerCase().includes(queryLower))) {
        results.push({ category: 'stat', name, ...data });
      }
    }

    // Search general knowledge
    for (const [topic, data] of Object.entries(knowledge.general || {})) {
      if (topic.includes(queryLower) || (data.info && data.info.toLowerCase().includes(queryLower))) {
        results.push({ category: 'general', topic, ...data });
      }
    }

    // Search tips
    for (const tipData of knowledge.tips || []) {
      if (tipData.tip.toLowerCase().includes(queryLower)) {
        results.push({ category: 'tip', ...tipData });
      }
    }

    return results;
  }

  getAllPungKnowledge() {
    if (!this.cache.memories.pungKnowledge) {
      return {
        skins: {},
        abilities: {},
        stats: {},
        tips: [],
        general: {}
      };
    }
    return this.cache.memories.pungKnowledge;
  }
}

export default new Database();
