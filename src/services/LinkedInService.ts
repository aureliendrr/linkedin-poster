import fetch from 'node-fetch';
import { LinkedInPostRequest, LinkedInPostResponse } from '../types/index.js';

export class LinkedInService {
  private personId: string;
  private accessToken: string | undefined;

  constructor(personId: string) {
    this.personId = personId;
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  }

  setCredentials(accessToken: string, personId: string): void {
    this.accessToken = accessToken;
    this.personId = personId;
  }

  async postContent(content: string, visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'): Promise<LinkedInPostResponse> {
    if (!this.accessToken) {
      throw new Error('LinkedIn access token not configured');
    }

    const postData: LinkedInPostRequest = {
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

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
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

    const result = await response.json() as any;
    return {
      id: result.id,
      message: 'Post published successfully'
    };
  }
} 