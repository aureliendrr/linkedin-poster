import fetch from 'node-fetch';

export class GitHubService {
  constructor(owner, repo, options = {}) {
    // Get token directly from environment for security
    this.token = process.env.GH_TOKEN;
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

  async fetchCommitsSinceLastWeek() {
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

    const data = await response.json();
    const commits = data.map(commit => commit.commit.message);
    
    // Filter out commits that match exclude patterns
    return this.filterCommits(commits);
  }

  filterCommits(commits) {
    if (this.excludePatterns.length === 0) {
      return commits;
    }

    return commits.filter(commit => {
      const commitLower = commit.toLowerCase();
      return !this.excludePatterns.some(pattern => 
        commitLower.includes(pattern.toLowerCase())
      );
    });
  }

  async fetchCommitsByDateRange(startDate, endDate) {
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

    const data = await response.json();
    const commits = data.map(commit => commit.commit.message);
    
    // Filter out commits that match exclude patterns
    return this.filterCommits(commits);
  }
} 