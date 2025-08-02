import fetch from 'node-fetch';

export class LinkedInService {
  constructor(personId) {
    // Get access token directly from environment for security
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    if (!this.accessToken) {
      throw new Error('LINKEDIN_ACCESS_TOKEN environment variable is required');
    }
    
    this.personId = personId;
    this.baseUrl = 'https://api.linkedin.com/v2';
  }

  async postContent(content, visibility = 'PUBLIC') {
    if (!this.accessToken || !this.personId) {
      throw new Error('LinkedIn credentials not configured. Please set LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_ID in your .env file.');
    }

    const url = `${this.baseUrl}/ugcPosts`;
    
    const postData = {
      author: `urn:li:person:${this.personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LinkedIn API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  }

  async postWithMedia(content, mediaUrl, visibility = 'PUBLIC') {
    if (!this.accessToken || !this.personId) {
      throw new Error('LinkedIn credentials not configured.');
    }

    // First, register the media
    const mediaRegisterUrl = `${this.baseUrl}/assets?action=registerUpload`;
    const mediaRegisterData = {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: `urn:li:person:${this.personId}`,
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }
        ]
      }
    };

    const mediaRegisterResponse = await fetch(mediaRegisterUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(mediaRegisterData)
    });

    if (!mediaRegisterResponse.ok) {
      throw new Error(`LinkedIn media registration error: ${mediaRegisterResponse.statusText}`);
    }

    const mediaRegisterResult = await mediaRegisterResponse.json();
    
    // Then post with the media
    const url = `${this.baseUrl}/ugcPosts`;
    const postData = {
      author: `urn:li:person:${this.personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              description: {
                text: 'Media attachment'
              },
              media: mediaRegisterResult.value.asset,
              title: {
                text: 'Media title'
              }
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LinkedIn API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  }

  setCredentials(accessToken, personId) {
    this.accessToken = accessToken;
    this.personId = personId;
  }

  isConfigured() {
    return !!(this.accessToken && this.personId);
  }
} 