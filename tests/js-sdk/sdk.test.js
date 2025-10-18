const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
const fetch = require('node-fetch');
const { spawn } = require('child_process');
const path = require('path');

// Import the OpenMemory JS SDK
const OpenMemory = require('../../sdk-js/dist/index.js');

const API_BASE_URL = 'http://localhost:8080';
const TEST_TIMEOUT = 30000;

let serverProcess = null;
let client = null;

describe('OpenMemory JavaScript SDK Tests', () => {
  beforeAll(async () => {
    console.log('Starting OpenMemory server for JS SDK testing...');
    
    const backendPath = path.join(__dirname, '..', '..', 'backend');
    
    serverProcess = spawn('npm', ['start'], {
      cwd: backendPath,
      stdio: 'pipe',
      shell: true
    });

    if (serverProcess.stdout) {
      serverProcess.stdout.on('data', (data) => {
        console.log(`Server: ${data}`);
      });
    }

    if (serverProcess.stderr) {
      serverProcess.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
      });
    }

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`Server not ready: ${response.status}`);
      }
      console.log('Server is ready for JS SDK testing');
      
      // Initialize SDK client
      client = new OpenMemory({
        baseUrl: API_BASE_URL,
        authKey: process.env.AUTH_KEY
      });
      
    } catch (error) {
      console.error('Failed to start server or initialize client:', error);
      throw error;
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    if (serverProcess) {
      console.log('Stopping OpenMemory server...');
      serverProcess.kill('SIGTERM');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  });

  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  describe('SDK Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultClient = new OpenMemory();
      expect(defaultClient).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customClient = new OpenMemory({
        baseUrl: 'http://localhost:8080',
        authKey: 'test-key'
      });
      expect(customClient).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it('should check server health', async () => {
      const health = await client.healthCheck();
      expect(health).toHaveProperty('status');
      expect(health.status).toBe('healthy');
    });
  });

  describe('Memory Operations', () => {
    let testMemoryId;

    it('should add a new memory', async () => {
      const content = 'This is a test memory from JavaScript SDK';
      
      const memory = await client.add(content);
      
      expect(memory).toHaveProperty('id');
      expect(memory).toHaveProperty('content', content);
      expect(memory).toHaveProperty('primary_sector');
      expect(memory).toHaveProperty('sectors');
      expect(Array.isArray(memory.sectors)).toBe(true);
      expect(memory).toHaveProperty('salience');
      expect(typeof memory.salience).toBe('number');
      
      testMemoryId = memory.id;
    });

    it('should add memory with metadata', async () => {
      const content = 'Memory with metadata test';
      const metadata = { source: 'test', importance: 'high' };
      
      const memory = await client.add(content, metadata);
      
      expect(memory).toHaveProperty('content', content);
      expect(memory).toHaveProperty('metadata');
      expect(memory.metadata).toMatchObject(metadata);
    });

    it('should retrieve a memory by ID', async () => {
      if (!testMemoryId) {
        throw new Error('Test memory ID not available');
      }

      const memory = await client.getMemory(testMemoryId);
      
      expect(memory).toHaveProperty('id', testMemoryId);
      expect(memory).toHaveProperty('content');
      expect(memory).toHaveProperty('primary_sector');
    });

    it('should query memories', async () => {
      const query = 'JavaScript SDK test';
      
      const results = await client.query(query, { k: 5 });
      
      expect(results).toHaveProperty('matches');
      expect(Array.isArray(results.matches)).toBe(true);
      expect(results.matches.length).toBeGreaterThan(0);
      
      const firstMatch = results.matches[0];
      expect(firstMatch).toHaveProperty('id');
      expect(firstMatch).toHaveProperty('content');
      expect(firstMatch).toHaveProperty('score');
      expect(firstMatch).toHaveProperty('primary_sector');
      expect(typeof firstMatch.score).toBe('number');
    });

    it('should query with graph traversal', async () => {
      const results = await client.query('test memory', { 
        k: 3, 
        useGraph: true 
      });
      
      expect(results).toHaveProperty('matches');
      expect(Array.isArray(results.matches)).toBe(true);
      
      if (results.matches.length > 0) {
        const firstMatch = results.matches[0];
        expect(firstMatch).toHaveProperty('path');
        expect(Array.isArray(firstMatch.path)).toBe(true);
      }
    });

    it('should list memories', async () => {
      const memories = await client.listMemories({ limit: 10, offset: 0 });
      
      expect(memories).toHaveProperty('items');
      expect(Array.isArray(memories.items)).toBe(true);
      expect(memories).toHaveProperty('total');
      expect(typeof memories.total).toBe('number');
    });

    it('should delete a memory', async () => {
      if (!testMemoryId) {
        throw new Error('Test memory ID not available');
      }

      const result = await client.deleteMemory(testMemoryId);
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('Sector Operations', () => {
    beforeEach(async () => {
      // Add test memories for each sector
      await client.add('I went to the coffee shop this morning');  // episodic
      await client.add('JavaScript is a programming language');    // semantic
      await client.add('First install Node.js, then run npm install'); // procedural
      await client.add('I feel excited about this new project!');  // emotional
      await client.add('What is the meaning of all this work?');   // reflective
    });

    it('should get sector information', async () => {
      const sectors = await client.getSectors();
      
      expect(sectors).toHaveProperty('sectors');
      expect(Array.isArray(sectors.sectors)).toBe(true);
      expect(sectors.sectors).toContain('episodic');
      expect(sectors.sectors).toContain('semantic');
      expect(sectors.sectors).toContain('procedural');
      expect(sectors.sectors).toContain('emotional');
      expect(sectors.sectors).toContain('reflective');
    });

    it('should query specific sector', async () => {
      const results = await client.querySector('programming', 'semantic', { k: 3 });
      
      expect(results).toHaveProperty('matches');
      expect(Array.isArray(results.matches)).toBe(true);
      
      // All results should be from semantic sector
      results.matches.forEach(match => {
        expect(match.sectors).toContain('semantic');
      });
    });

    it('should get memories by sector', async () => {
      const memories = await client.getBySector('emotional', { limit: 5 });
      
      expect(memories).toHaveProperty('items');
      expect(Array.isArray(memories.items)).toBe(true);
      
      // All memories should have emotional sector
      memories.items.forEach(memory => {
        expect(memory.sectors).toContain('emotional');
      });
    });
  });

  describe('Advanced Features', () => {
    it('should handle batch operations', async () => {
      const contents = [
        'Batch test memory 1',
        'Batch test memory 2', 
        'Batch test memory 3'
      ];
      
      const memories = [];
      for (const content of contents) {
        const memory = await client.add(content);
        memories.push(memory);
      }
      
      expect(memories).toHaveLength(3);
      memories.forEach(memory => {
        expect(memory).toHaveProperty('id');
        expect(memory).toHaveProperty('content');
      });
    });

    it('should handle complex queries with filters', async () => {
      const results = await client.query('test', {
        k: 10,
        useGraph: true,
        sectors: ['semantic', 'procedural']
      });
      
      expect(results).toHaveProperty('matches');
      expect(Array.isArray(results.matches)).toBe(true);
    });

    it('should track memory statistics', async () => {
      const sectors = await client.getSectors();
      
      if (sectors.stats) {
        expect(Array.isArray(sectors.stats)).toBe(true);
        sectors.stats.forEach(stat => {
          expect(stat).toHaveProperty('sector');
          expect(stat).toHaveProperty('count');
          expect(typeof stat.count).toBe('number');
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const offlineClient = new OpenMemory({ 
        baseUrl: 'http://localhost:9999' // Non-existent server
      });
      
      await expect(offlineClient.healthCheck()).rejects.toThrow();
    });

    it('should handle invalid memory ID', async () => {
      await expect(client.getMemory('invalid-id')).rejects.toThrow();
    });

    it('should handle empty query', async () => {
      await expect(client.query('')).rejects.toThrow();
    });

    it('should handle invalid sector', async () => {
      await expect(
        client.querySector('test', 'invalid-sector')
      ).rejects.toThrow();
    });
  });

  describe('Configuration and Authentication', () => {
    it('should work without authentication', async () => {
      const publicClient = new OpenMemory({ baseUrl: API_BASE_URL });
      const health = await publicClient.healthCheck();
      expect(health.status).toBe('healthy');
    });

    it('should handle authentication if provided', async () => {
      const authClient = new OpenMemory({ 
        baseUrl: API_BASE_URL,
        authKey: 'test-auth-key'
      });
      
      // Should still work even if auth is not required
      const health = await authClient.healthCheck();
      expect(health.status).toBe('healthy');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle concurrent operations', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        client.add(`Concurrent test memory ${i}`)
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach((memory, index) => {
        expect(memory).toHaveProperty('content', `Concurrent test memory ${index}`);
      });
    });

    it('should handle large content', async () => {
      const largeContent = 'Large content test. ' + 'A'.repeat(5000);
      
      const memory = await client.add(largeContent);
      expect(memory).toHaveProperty('content', largeContent);
    });

    it('should respect query limits', async () => {
      const results = await client.query('test', { k: 3 });
      expect(results.matches.length).toBeLessThanOrEqual(3);
    });
  });
});

module.exports = {};