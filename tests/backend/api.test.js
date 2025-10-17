const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
const { spawn } = require('child_process');
const path = require('path');

const API_BASE_URL = 'http://localhost:8080';
const TEST_TIMEOUT = 30000;

let serverProcess = null;

describe('OpenMemory Backend API Tests', () => {
  beforeAll(async () => {
    console.log('Starting OpenMemory server for testing...');
    
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

    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`Server not ready: ${response.status}`);
      }
      console.log('Server is ready for testing');
    } catch (error) {
      console.error('Failed to start server:', error);
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

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('healthy');
    });
  });

  describe('Memory Operations', () => {
    let testMemoryId;

    it('should add a new memory', async () => {
      const testContent = 'This is a test memory for backend API testing';
      
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: testContent }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('content', testContent);
      expect(data).toHaveProperty('primary_sector');
      expect(data).toHaveProperty('sectors');
      expect(Array.isArray(data.sectors)).toBe(true);
      
      testMemoryId = data.id;
    });

    it('should retrieve a memory by ID', async () => {
      if (!testMemoryId) {
        throw new Error('Test memory ID not available');
      }

      const response = await fetch(`${API_BASE_URL}/memory/${testMemoryId}`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('id', testMemoryId);
      expect(data).toHaveProperty('content');
    });

    it('should query memories', async () => {
      const query = 'test memory';
      
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, k: 5 }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('matches');
      expect(Array.isArray(data.matches)).toBe(true);
      expect(data.matches.length).toBeGreaterThan(0);
      
      const firstMatch = data.matches[0];
      expect(firstMatch).toHaveProperty('id');
      expect(firstMatch).toHaveProperty('content');
      expect(firstMatch).toHaveProperty('score');
      expect(firstMatch).toHaveProperty('primary_sector');
    });

    it('should list memories', async () => {
      const response = await fetch(`${API_BASE_URL}/memories?limit=10`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
      expect(data).toHaveProperty('total');
      expect(typeof data.total).toBe('number');
    });

    it('should delete a memory', async () => {
      if (!testMemoryId) {
        throw new Error('Test memory ID not available');
      }

      const response = await fetch(`${API_BASE_URL}/memory/${testMemoryId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
    });
  });

  describe('Sector Operations', () => {
    it('should get sector information', async () => {
      const response = await fetch(`${API_BASE_URL}/sectors`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('sectors');
      expect(Array.isArray(data.sectors)).toBe(true);
      expect(data.sectors).toContain('episodic');
      expect(data.sectors).toContain('semantic');
      expect(data.sectors).toContain('procedural');
      expect(data.sectors).toContain('emotional');
      expect(data.sectors).toContain('reflective');
    });

    it('should query specific sector', async () => {
      const addResponse = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Python is a programming language' }),
      });

      expect(addResponse.status).toBe(200);

      const queryResponse = await fetch(`${API_BASE_URL}/query/sector/semantic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'programming', k: 3 }),
      });

      expect(queryResponse.status).toBe(200);
      
      const data = await queryResponse.json();
      expect(data).toHaveProperty('matches');
      expect(Array.isArray(data.matches)).toBe(true);
    });

    it('should get memories by sector', async () => {
      const response = await fetch(`${API_BASE_URL}/sector/semantic?limit=5`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
    });
  });

  describe('HSG (Hybrid Sector Graph) Features', () => {
    it('should handle graph traversal queries', async () => {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: 'programming language', 
          k: 5, 
          use_graph: true 
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('matches');
      expect(Array.isArray(data.matches)).toBe(true);
      
      if (data.matches.length > 0) {
        const firstMatch = data.matches[0];
        expect(firstMatch).toHaveProperty('path');
        expect(Array.isArray(firstMatch.path)).toBe(true);
      }
    });

    it('should track memory salience', async () => {
      const addResponse = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Test salience tracking' }),
      });

      const memory = await addResponse.json();
      expect(memory).toHaveProperty('salience');
      expect(typeof memory.salience).toBe('number');
      expect(memory.salience).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid memory ID', async () => {
      const response = await fetch(`${API_BASE_URL}/memory/invalid-id`);
      expect(response.status).toBe(404);
    });

    it('should handle empty query', async () => {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: '', k: 5 }),
      });

      expect(response.status).toBe(400);
    });

    it('should handle invalid sector', async () => {
      const response = await fetch(`${API_BASE_URL}/query/sector/invalid-sector`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'test', k: 3 }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Performance and Limits', () => {
    it('should handle large content', async () => {
      const largeContent = 'A'.repeat(10000);
      
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: largeContent }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('content', largeContent);
    });

    it('should respect query limits', async () => {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'test', k: 3 }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.matches.length).toBeLessThanOrEqual(3);
    });
  });
});

module.exports = {};