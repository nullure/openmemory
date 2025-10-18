#!/usr/bin/env python3

import unittest
import sys
import os
import time
import subprocess
import signal
import requests
import threading
from typing import Optional, Dict, Any

# Add the SDK to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'sdk-py'))

from openmemory import OpenMemory, SECTORS

API_BASE_URL = 'http://localhost:8080'
TEST_TIMEOUT = 30

class TestOpenMemoryPythonSDK(unittest.TestCase):
    """Comprehensive test suite for OpenMemory Python SDK"""
    
    server_process: Optional[subprocess.Popen] = None
    client: Optional[OpenMemory] = None
    
    @classmethod
    def setUpClass(cls):
        """Start the OpenMemory server for testing"""
        print('Starting OpenMemory server for Python SDK testing...')
        
        backend_path = os.path.join(os.path.dirname(__file__), '..', '..', 'backend')
        
        try:
            cls.server_process = subprocess.Popen(
                ['npm', 'start'],
                cwd=backend_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=True
            )
            
            # Wait for server to start
            time.sleep(5)
            
            # Check if server is ready
            response = requests.get(f'{API_BASE_URL}/health', timeout=10)
            if response.status_code != 200:
                raise Exception(f'Server not ready: {response.status_code}')
                
            print('Server is ready for Python SDK testing')
            
            # Initialize SDK client
            cls.client = OpenMemory(base_url=API_BASE_URL)
            
        except Exception as e:
            print(f'Failed to start server or initialize client: {e}')
            cls.tearDownClass()
            raise
    
    @classmethod
    def tearDownClass(cls):
        """Stop the OpenMemory server"""
        if cls.server_process:
            print('Stopping OpenMemory server...')
            try:
                cls.server_process.terminate()
                cls.server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                cls.server_process.kill()
                cls.server_process.wait()
    
    def setUp(self):
        """Set up for each test"""
        time.sleep(0.1)  # Small delay between tests
    
    def test_sdk_initialization(self):
        """Test SDK initialization with different configurations"""
        # Default initialization
        default_client = OpenMemory()
        self.assertIsNotNone(default_client)
        
        # Custom configuration
        custom_client = OpenMemory(
            base_url='http://localhost:8080',
            auth_key='test-key'
        )
        self.assertIsNotNone(custom_client)
    
    def test_health_check(self):
        """Test server health check"""
        health = self.client.health_check()
        self.assertIn('status', health)
        self.assertEqual(health['status'], 'healthy')
    
    def test_add_memory(self):
        """Test adding a new memory"""
        content = 'This is a test memory from Python SDK'
        
        memory = self.client.add(content)
        
        self.assertIn('id', memory)
        self.assertEqual(memory['content'], content)
        self.assertIn('primary_sector', memory)
        self.assertIn('sectors', memory)
        self.assertIsInstance(memory['sectors'], list)
        self.assertIn('salience', memory)
        self.assertIsInstance(memory['salience'], (int, float))
        
        return memory['id']
    
    def test_add_memory_with_metadata(self):
        """Test adding memory with metadata"""
        content = 'Memory with metadata test'
        metadata = {'source': 'test', 'importance': 'high'}
        
        memory = self.client.add(content, metadata=metadata)
        
        self.assertEqual(memory['content'], content)
        self.assertIn('metadata', memory)
        for key, value in metadata.items():
            self.assertEqual(memory['metadata'][key], value)
    
    def test_get_memory(self):
        """Test retrieving a memory by ID"""
        # First add a memory
        memory_id = self.test_add_memory()
        
        # Then retrieve it
        retrieved = self.client.get_memory(memory_id)
        
        self.assertEqual(retrieved['id'], memory_id)
        self.assertIn('content', retrieved)
        self.assertIn('primary_sector', retrieved)
    
    def test_query_memories(self):
        """Test querying memories"""
        # Add a test memory first
        self.client.add('Python SDK query test memory')
        
        query = 'Python SDK test'
        results = self.client.query(query, k=5)
        
        self.assertIn('matches', results)
        self.assertIsInstance(results['matches'], list)
        self.assertGreater(len(results['matches']), 0)
        
        first_match = results['matches'][0]
        self.assertIn('id', first_match)
        self.assertIn('content', first_match)
        self.assertIn('score', first_match)
        self.assertIn('primary_sector', first_match)
        self.assertIsInstance(first_match['score'], (int, float))
    
    def test_query_with_graph_traversal(self):
        """Test querying with graph traversal"""
        results = self.client.query('test memory', k=3, use_graph=True)
        
        self.assertIn('matches', results)
        self.assertIsInstance(results['matches'], list)
        
        if results['matches']:
            first_match = results['matches'][0]
            self.assertIn('path', first_match)
            self.assertIsInstance(first_match['path'], list)
    
    def test_list_memories(self):
        """Test listing memories"""
        memories = self.client.list_memories(limit=10, offset=0)
        
        self.assertIn('items', memories)
        self.assertIsInstance(memories['items'], list)
        self.assertIn('total', memories)
        self.assertIsInstance(memories['total'], int)
    
    def test_delete_memory(self):
        """Test deleting a memory"""
        # Add a memory to delete
        memory = self.client.add('Memory to be deleted')
        memory_id = memory['id']
        
        # Delete it
        result = self.client.delete_memory(memory_id)
        self.assertTrue(result['success'])
        
        # Verify it's gone
        with self.assertRaises(Exception):
            self.client.get_memory(memory_id)
    
    def test_sector_operations(self):
        """Test sector-related operations"""
        # Add memories for different sectors
        test_memories = [
            ('I went to the coffee shop this morning', 'episodic'),
            ('Python is a programming language', 'semantic'),
            ('First install Python, then run pip install', 'procedural'),
            ('I feel excited about this new project!', 'emotional'),
            ('What is the meaning of all this work?', 'reflective')
        ]
        
        for content, expected_sector in test_memories:
            self.client.add(content)
        
        # Get sector information
        sectors_info = self.client.get_sectors()
        
        self.assertIn('sectors', sectors_info)
        self.assertIsInstance(sectors_info['sectors'], list)
        
        for sector in SECTORS:
            self.assertIn(sector, sectors_info['sectors'])
    
    def test_query_specific_sector(self):
        """Test querying a specific sector"""
        # Add a semantic memory
        self.client.add('Machine learning is a subset of artificial intelligence')
        
        results = self.client.query_sector('machine learning', 'semantic', k=3)
        
        self.assertIn('matches', results)
        self.assertIsInstance(results['matches'], list)
        
        # All results should be from semantic sector
        for match in results['matches']:
            self.assertIn('semantic', match['sectors'])
    
    def test_get_memories_by_sector(self):
        """Test getting memories by sector"""
        # Add an emotional memory
        self.client.add('I feel so happy and grateful today!')
        
        memories = self.client.get_by_sector('emotional', limit=5)
        
        self.assertIn('items', memories)
        self.assertIsInstance(memories['items'], list)
        
        # All memories should have emotional sector
        for memory in memories['items']:
            self.assertIn('emotional', memory['sectors'])
    
    def test_batch_operations(self):
        """Test batch memory operations"""
        contents = [
            'Batch test memory 1',
            'Batch test memory 2',
            'Batch test memory 3'
        ]
        
        memories = []
        for content in contents:
            memory = self.client.add(content)
            memories.append(memory)
        
        self.assertEqual(len(memories), 3)
        for i, memory in enumerate(memories):
            self.assertIn('id', memory)
            self.assertEqual(memory['content'], contents[i])
    
    def test_complex_queries(self):
        """Test complex queries with various parameters"""
        # Add test data
        self.client.add('Complex query test for semantic knowledge')
        
        results = self.client.query('complex test', k=10)
        
        self.assertIn('matches', results)
        self.assertIsInstance(results['matches'], list)
        self.assertLessEqual(len(results['matches']), 10)
    
    def test_memory_statistics(self):
        """Test memory statistics and sector distribution"""
        sectors_info = self.client.get_sectors()
        
        if 'stats' in sectors_info:
            self.assertIsInstance(sectors_info['stats'], list)
            for stat in sectors_info['stats']:
                self.assertIn('sector', stat)
                self.assertIn('count', stat)
                self.assertIsInstance(stat['count'], int)
    
    def test_error_handling(self):
        """Test error handling for various scenarios"""
        
        # Test invalid memory ID
        with self.assertRaises(Exception):
            self.client.get_memory('invalid-id')
        
        # Test empty query
        with self.assertRaises(Exception):
            self.client.query('')
        
        # Test invalid sector
        with self.assertRaises(Exception):
            self.client.query_sector('test', 'invalid-sector')
    
    def test_network_error_handling(self):
        """Test handling of network errors"""
        offline_client = OpenMemory(base_url='http://localhost:9999')
        
        with self.assertRaises(Exception):
            offline_client.health_check()
    
    def test_concurrent_operations(self):
        """Test concurrent memory operations"""
        import concurrent.futures
        
        def add_memory(i):
            return self.client.add(f'Concurrent test memory {i}')
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(add_memory, i) for i in range(5)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        self.assertEqual(len(results), 5)
        for memory in results:
            self.assertIn('id', memory)
            self.assertIn('content', memory)
    
    def test_large_content_handling(self):
        """Test handling of large content"""
        large_content = 'Large content test. ' + 'A' * 5000
        
        memory = self.client.add(large_content)
        self.assertEqual(memory['content'], large_content)
    
    def test_query_limits(self):
        """Test query result limits"""
        results = self.client.query('test', k=3)
        self.assertLessEqual(len(results['matches']), 3)
    
    def test_authentication_handling(self):
        """Test authentication handling"""
        # Test without authentication
        public_client = OpenMemory(base_url=API_BASE_URL)
        health = public_client.health_check()
        self.assertEqual(health['status'], 'healthy')
        
        # Test with authentication (should still work if auth is optional)
        auth_client = OpenMemory(
            base_url=API_BASE_URL,
            auth_key='test-auth-key'
        )
        health = auth_client.health_check()
        self.assertEqual(health['status'], 'healthy')
    
    def test_memory_salience_tracking(self):
        """Test memory salience and decay mechanisms"""
        memory = self.client.add('Salience test memory')
        
        self.assertIn('salience', memory)
        self.assertIsInstance(memory['salience'], (int, float))
        self.assertGreater(memory['salience'], 0)
        
        # Query the memory to potentially affect salience
        results = self.client.query('salience test', k=1)
        if results['matches']:
            retrieved = results['matches'][0]
            self.assertIn('salience', retrieved)
    
    def test_sector_classification_accuracy(self):
        """Test accuracy of automatic sector classification"""
        test_cases = [
            ('I had breakfast at 8 AM this morning', 'episodic'),
            ('The capital of France is Paris', 'semantic'),
            ('To bake a cake, first preheat the oven', 'procedural'),
            ('I feel so excited about the weekend!', 'emotional'),
            ('What is the purpose of our existence?', 'reflective')
        ]
        
        for content, expected_sector in test_cases:
            memory = self.client.add(content)
            # Note: Classification might not be 100% accurate, so we just check
            # that it's classified into one of the valid sectors
            self.assertIn(memory['primary_sector'], SECTORS)
            self.assertIn(expected_sector, memory['sectors'])


if __name__ == '__main__':
    # Configure test runner
    unittest.main(
        verbosity=2,
        failfast=False,
        buffer=True
    )