---
title: Authentication Examples
description: Examples of authenticating with the API using different programming languages and methods.
sidebar_position: 1
---

# Authentication Examples

This page provides examples of how to authenticate with our API in various programming languages.

## API Key Authentication

The simplest way to authenticate is using an API key in the request header.

### JavaScript

```javascript
const fetch = require('node-fetch');

async function fetchData() {
  const response = await fetch('https://api.example.com/v1/resources', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
}

fetchData().catch(console.error);
```

### Python

```python
import requests

def fetch_data():
    headers = {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(
        'https://api.example.com/v1/resources',
        headers=headers
    )
    
    response.raise_for_status()  # Raise exception for 4XX/5XX responses
    return response.json()

try:
    data = fetch_data()
    print(data)
except requests.exceptions.RequestException as e:
    print(f"Error fetching data: {e}")
```

### Ruby

```ruby
require 'net/http'
require 'uri'
require 'json'

def fetch_data
  uri = URI('https://api.example.com/v1/resources')
  request = Net::HTTP::Get.new(uri)
  request['Authorization'] = 'Bearer YOUR_API_KEY'
  request['Content-Type'] = 'application/json'
  
  response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
    http.request(request)
  end
  
  JSON.parse(response.body)
end

begin
  data = fetch_data
  puts data
rescue StandardError => e
  puts "Error fetching data: #{e.message}"
end
```

### Go

```go
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func fetchData() (map[string]interface{}, error) {
	req, err := http.NewRequest("GET", "https://api.example.com/v1/resources", nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	
	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	
	return result, nil
}

func main() {
	data, err := fetchData()
	if err != nil {
		fmt.Printf("Error fetching data: %v\n", err)
		return
	}
	
	fmt.Printf("%+v\n", data)
}
```

## OAuth 2.0 Authentication

For services that require OAuth 2.0 authentication, use the following examples.

### JavaScript

```javascript
const axios = require('axios');

async function getAccessToken() {
  const response = await axios.post('https://auth.example.com/oauth/token', {
    grant_type: 'client_credentials',
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    audience: 'https://api.example.com'
  });
  
  return response.data.access_token;
}

async function fetchDataWithOAuth() {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get('https://api.example.com/v1/resources', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchDataWithOAuth();
```

### Python

```python
import requests

def get_access_token():
    payload = {
        'grant_type': 'client_credentials',
        'client_id': 'YOUR_CLIENT_ID',
        'client_secret': 'YOUR_CLIENT_SECRET',
        'audience': 'https://api.example.com'
    }
    
    response = requests.post(
        'https://auth.example.com/oauth/token',
        json=payload
    )
    
    response.raise_for_status()
    return response.json()['access_token']

def fetch_data_with_oauth():
    try:
        token = get_access_token()
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(
            'https://api.example.com/v1/resources',
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

data = fetch_data_with_oauth()
if data:
    print(data)
```

## Using Environment Variables

For security best practices, it's recommended to use environment variables for storing sensitive credentials.

### JavaScript (Node.js)

```javascript
// First, install dotenv: npm install dotenv
require('dotenv').config();

const axios = require('axios');

async function fetchData() {
  try {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error('API_KEY environment variable is not set');
    }
    
    const response = await axios.get('https://api.example.com/v1/resources', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchData();
```

### Python

```python
import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def fetch_data():
    api_key = os.getenv('API_KEY')
    
    if not api_key:
        raise ValueError('API_KEY environment variable is not set')
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(
        'https://api.example.com/v1/resources',
        headers=headers
    )
    
    response.raise_for_status()
    return response.json()

try:
    data = fetch_data()
    print(data)
except Exception as e:
    print(f"Error: {e}")
```

## Handling Authentication Errors

Always implement proper error handling for authentication issues.

### JavaScript

```javascript
async function fetchWithErrorHandling() {
  try {
    const response = await fetch('https://api.example.com/v1/resources', {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      console.error('Authentication failed: Invalid or expired API key');
      // Implement retry logic or prompt for new credentials
      return;
    }
    
    if (response.status === 403) {
      console.error('Authorization failed: Insufficient permissions');
      return;
    }
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Network error:', error.message);
  }
}

fetchWithErrorHandling();
```

## Best Practices

1. **Never hardcode API keys or secrets** in your application code
2. **Use environment variables** or secure credential storage
3. **Implement proper error handling** for authentication failures
4. **Set up automatic token refresh** for OAuth implementations
5. **Use HTTPS** for all API communications
6. **Implement rate limiting handling** to avoid lockouts
7. **Follow the principle of least privilege** when requesting permissions 