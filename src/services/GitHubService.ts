import fetch from 'node-fetch';
import { Commit, GitHubCommit } from '../types/index.js';

interface GitHubServiceOptions {
  branch?: string;
  daysToFetch?: number;
  excludePatterns?: string[];
}

export class GitHubService {
  private token: string;
  private owner: string;
  private repo: string;
  private baseUrl: string;
  private branch: string;
  private daysToFetch: number;
  private excludePatterns: string[];

  constructor(owner: string, repo: string, options: GitHubServiceOptions = {}) {
    // Get token directly from environment for security
    this.token = process.env.GH_TOKEN || '';
    if (!this.token) {
      throw new Error('GH_TOKEN environment variable is required');
    }
    
    this.owner = owner;
    this.repo = repo;
    this.baseUrl = 'https://api.github.com';
    this.branch = options.branch || 'main';
    this.daysToFetch = options.daysToFetch || 7;
    this.excludePatterns = options.excludePatterns || [];
  }

  async fetchCommitsSinceLastWeek(): Promise<Commit[]> {
    const since = new Date();
    since.setDate(since.getDate() - this.daysToFetch);
    const sinceIso = since.toISOString();

    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/commits?sha=${this.branch}&since=${sinceIso}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json() as GitHubCommit[];
    const commits: Commit[] = data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url
    }));
    
    // Filter out commits that match exclude patterns
    return this.filterCommits(commits);
  }

  private filterCommits(commits: Commit[]): Commit[] {
    if (this.excludePatterns.length === 0) {
      return commits;
    }

    return commits.filter(commit => {
      const commitLower = commit.message.toLowerCase();
      return !this.excludePatterns.some(pattern => 
        commitLower.includes(pattern.toLowerCase())
      );
    });
  }

  async fetchCommitsByDateRange(startDate: Date, endDate: Date): Promise<Commit[]> {
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/commits?sha=${this.branch}&since=${startIso}&until=${endIso}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json() as GitHubCommit[];
    const commits: Commit[] = data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url
    }));
    
    // Filter out commits that match exclude patterns
    return this.filterCommits(commits);
  }
} 