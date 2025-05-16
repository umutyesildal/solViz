# Conversations and Tags API Documentation

## Overview

This document describes the API endpoints for managing conversation threads, messages, and tags in the SolViz Studio application.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Conversation Endpoints

### List User's Conversation Threads

Get all conversation threads for the current authenticated user.

**Request:**
```
GET /conversations/
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 123,
    "thread_id": "thread_abc123",
    "title": "Solana Volume Analysis",
    "created_at": "2025-05-16T10:30:00Z",
    "last_activity_at": "2025-05-16T11:45:00Z",
    "messages": [
      {
        "id": 1,
        "thread_id": "thread_abc123",
        "role": "user",
        "content": "What was the transaction volume on Solana yesterday?",
        "created_at": "2025-05-16T10:30:00Z"
      },
      {
        "id": 2,
        "thread_id": "thread_abc123",
        "role": "assistant",
        "content": "Based on Flipside data, Solana had 35.2M transactions yesterday with a total volume of 12.4M SOL.",
        "created_at": "2025-05-16T10:30:15Z"
      }
    ]
  }
]
```

### Get a Specific Conversation Thread

Get details for a specific conversation thread.

**Request:**
```
GET /conversations/{thread_id}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 123,
  "thread_id": "thread_abc123",
  "title": "Solana Volume Analysis",
  "created_at": "2025-05-16T10:30:00Z",
  "last_activity_at": "2025-05-16T11:45:00Z"
}
```

### Create a Conversation Thread

Create a new conversation thread.

**Request:**
```
POST /conversations/
```

**Request Body:**
```json
{
  "thread_id": "thread_xyz789",
  "title": "NFT Market Analysis"
}
```

**Response:**
```json
{
  "id": 2,
  "user_id": 123,
  "thread_id": "thread_xyz789",
  "title": "NFT Market Analysis",
  "created_at": "2025-05-16T12:00:00Z",
  "last_activity_at": "2025-05-16T12:00:00Z"
}
```

### Update a Conversation Thread

Update an existing conversation thread (currently only the title can be updated).

**Request:**
```
PUT /conversations/{thread_id}
```

**Request Body:**
```json
{
  "title": "Updated Thread Title"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 123,
  "thread_id": "thread_abc123",
  "title": "Updated Thread Title",
  "created_at": "2025-05-16T10:30:00Z",
  "last_activity_at": "2025-05-16T12:15:00Z"
}
```

### Delete a Conversation Thread

Delete a conversation thread and all its messages.

**Request:**
```
DELETE /conversations/{thread_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Thread deleted successfully"
}
```

### Get Conversation Messages

Get all messages for a specific conversation thread.

**Request:**
```
GET /conversations/{thread_id}/messages
```

**Response:**
```json
[
  {
    "id": 1,
    "thread_id": "thread_abc123",
    "role": "user",
    "content": "What was the transaction volume on Solana yesterday?",
    "created_at": "2025-05-16T10:30:00Z"
  },
  {
    "id": 2,
    "thread_id": "thread_abc123",
    "role": "assistant",
    "content": "Based on Flipside data, Solana had 35.2M transactions yesterday with a total volume of 12.4M SOL.",
    "created_at": "2025-05-16T10:30:15Z"
  }
]
```

## Tag Endpoints

### List All Tags

Get all tags in the system.

**Request:**
```
GET /tags/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "solana"
  },
  {
    "id": 2,
    "name": "nft"
  },
  {
    "id": 3,
    "name": "defi"
  }
]
```

### Get a Specific Tag

Get details for a specific tag.

**Request:**
```
GET /tags/{tag_id}
```

**Response:**
```json
{
  "id": 1,
  "name": "solana"
}
```

### Create a Tag

Create a new tag.

**Request:**
```
POST /tags/
```

**Request Body:**
```json
{
  "name": "staking"
}
```

**Response:**
```json
{
  "id": 4,
  "name": "staking"
}
```

### Update a Tag

Update an existing tag.

**Request:**
```
PUT /tags/{tag_id}
```

**Request Body:**
```json
{
  "name": "staking-rewards"
}
```

**Response:**
```json
{
  "id": 4,
  "name": "staking-rewards"
}
```

### Delete a Tag

Delete a tag.

**Request:**
```
DELETE /tags/{tag_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

## Charts with Tags

The existing charts API has been enhanced to support filtering by tags and associating tags with charts.

### Filter Charts by Tag

Get charts filtered by a specific tag.

**Request:**
```
GET /charts/?tag=solana
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Solana Daily Transaction Volume",
    "description": "Chart showing daily transaction volume on Solana",
    "created_at": "2025-05-16T10:00:00Z",
    "user_id": 123,
    "is_public": true,
    "tags": [
      {
        "id": 1,
        "name": "solana"
      },
      {
        "id": 5,
        "name": "transactions"
      }
    ]
  }
]
```

### Create Chart with Tags

Create a new chart and associate it with tags.

**Request:**
```
POST /charts/
```

**Request Body:**
```json
{
  "title": "NFT Sales by Collection",
  "description": "Chart showing NFT sales by collection",
  "query": "SELECT collection_name, SUM(price) as total_sales FROM nft_sales GROUP BY collection_name ORDER BY total_sales DESC LIMIT 10",
  "natural_language_query": "Show me the top 10 NFT collections by sales volume",
  "provider": "flipside",
  "data": [...],
  "vega_spec": {...},
  "is_public": true,
  "tags": ["nft", "sales"]
}
```

**Response:**
```json
{
  "id": 2,
  "title": "NFT Sales by Collection",
  "description": "Chart showing NFT sales by collection",
  "created_at": "2025-05-16T14:00:00Z",
  "user_id": 123,
  "is_public": true,
  "tags": [
    {
      "id": 2,
      "name": "nft"
    },
    {
      "id": 6,
      "name": "sales"
    }
  ]
}
```

### Update Chart Tags

Update an existing chart and its associated tags.

**Request:**
```
PUT /charts/{chart_id}
```

**Request Body:**
```json
{
  "title": "Updated Chart Title",
  "tags": ["nft", "marketplace", "analysis"]
}
```

**Response:**
```json
{
  "id": 2,
  "title": "Updated Chart Title",
  "description": "Chart showing NFT sales by collection",
  "created_at": "2025-05-16T14:00:00Z",
  "updated_at": "2025-05-16T15:30:00Z",
  "user_id": 123,
  "is_public": true,
  "tags": [
    {
      "id": 2,
      "name": "nft"
    },
    {
      "id": 7,
      "name": "marketplace"
    },
    {
      "id": 8,
      "name": "analysis"
    }
  ]
}
```
