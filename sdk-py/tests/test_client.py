"""Basic tests for OpenMemory Python SDK."""

import unittest
from unittest.mock import patch, Mock
import json
from openmemory import OpenMemory


class TestOpenMemory(unittest.TestCase):
    """Test cases for OpenMemory client."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = OpenMemory(
            base_url="http://test.example.com",
            api_key="test-key"
        )

    def test_initialization(self):
        """Test client initialization."""
        # Test with defaults
        client = OpenMemory()
        self.assertEqual(client.u, "http://localhost:8080")
        self.assertEqual(client.k, "")

        # Test with custom values
        client = OpenMemory(
            base_url="https://api.example.com/",
            api_key="custom-key"
        )
        self.assertEqual(client.u, "https://api.example.com")
        self.assertEqual(client.k, "custom-key")

    @patch('urllib.request.urlopen')
    def test_add_memory(self, mock_urlopen):
        """Test adding a memory."""
        # Mock successful response
        mock_response = Mock()
        mock_response.read.return_value = json.dumps({
            "id": "test-memory-id",
            "sector": "semantic"
        }).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        result = self.client.add("Test memory content")

        self.assertEqual(result["id"], "test-memory-id")
        self.assertEqual(result["sector"], "semantic")

    @patch('urllib.request.urlopen')
    def test_add_memory_with_options(self, mock_urlopen):
        """Test adding a memory with options."""
        mock_response = Mock()
        mock_response.read.return_value = json.dumps({
            "id": "test-id-2",
            "sector": "emotional"
        }).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        result = self.client.add(
            "I feel happy",
            tags=["emotion", "positive"],
            metadata={"source": "user"},
            salience=0.8
        )

        self.assertEqual(result["sector"], "emotional")

    @patch('urllib.request.urlopen')
    def test_query_memories(self, mock_urlopen):
        """Test querying memories."""
        mock_response = Mock()
        mock_response.read.return_value = json.dumps({
            "query": "test query",
            "matches": [
                {
                    "id": "mem1",
                    "content": "Memory 1",
                    "score": 0.9,
                    "sector": "semantic",
                    "salience": 0.7
                },
                {
                    "id": "mem2", 
                    "content": "Memory 2",
                    "score": 0.8,
                    "sector": "episodic",
                    "salience": 0.6
                }
            ]
        }).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        result = self.client.query("test query", k=5)

        self.assertEqual(result["query"], "test query")
        self.assertEqual(len(result["matches"]), 2)
        self.assertEqual(result["matches"][0]["score"], 0.9)

    @patch('urllib.request.urlopen')
    def test_reinforce_memory(self, mock_urlopen):
        """Test reinforcing a memory."""
        mock_response = Mock()
        mock_response.read.return_value = json.dumps({"ok": True}).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        result = self.client.reinforce("test-id", boost=0.3)

        self.assertTrue(result["ok"])

    @patch('urllib.request.urlopen')
    def test_get_all_memories(self, mock_urlopen):
        """Test getting all memories."""
        mock_response = Mock()
        mock_response.read.return_value = json.dumps({
            "items": [
                {
                    "id": "mem1",
                    "content": "Memory 1",
                    "sector": "semantic",
                    "salience": 0.7,
                    "created_at": 1634567890000,
                    "tags": ["tag1"],
                    "metadata": {}
                }
            ]
        }).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        result = self.client.all(limit=50, offset=0)

        self.assertIn("items", result)
        self.assertEqual(len(result["items"]), 1)
        self.assertEqual(result["items"][0]["id"], "mem1")

    @patch('urllib.request.urlopen')
    def test_delete_memory(self, mock_urlopen):
        """Test deleting a memory."""
        mock_response = Mock()
        mock_response.read.return_value = json.dumps({"ok": True}).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        result = self.client.delete("test-id")

        self.assertTrue(result["ok"])

    def test_url_construction(self):
        """Test URL construction with different base URLs."""
        # Test with trailing slash
        client1 = OpenMemory(base_url="http://localhost:8080/")
        self.assertEqual(client1.u, "http://localhost:8080")

        # Test without trailing slash
        client2 = OpenMemory(base_url="http://localhost:8080")
        self.assertEqual(client2.u, "http://localhost:8080")

    def test_request_preparation(self):
        """Test internal request preparation."""
        # Test with API key
        client_with_key = OpenMemory(api_key="test-key")
        
        # Test basic client setup
        self.assertIsNotNone(client_with_key.k)
        self.assertEqual(client_with_key.k, "test-key")

        # Test without API key
        client_no_key = OpenMemory()
        self.assertEqual(client_no_key.k, "")


class TestMemoryOperations(unittest.TestCase):
    """Test memory operation edge cases."""

    def setUp(self):
        self.client = OpenMemory()

    def test_add_empty_content(self):
        """Test behavior with empty content."""
        # This would typically be handled by the server
        # but we can test client-side validation if added
        pass

    def test_query_empty_string(self):
        """Test behavior with empty query."""
        # This would typically be handled by the server
        pass

    def test_invalid_memory_id(self):
        """Test operations with invalid memory IDs."""
        # This would return appropriate errors from server
        pass


if __name__ == '__main__':
    unittest.main()