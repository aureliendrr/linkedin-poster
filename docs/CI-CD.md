# CI/CD Setup

This project uses GitHub Actions to automate testing and publishing.

## 🚀 Workflows

### 1. Test and Validate (`test.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull Request to `main`

**Actions:**
- Tests on Node.js 16, 18, and 20
- Linting and type checking
- Build validation
- **Independent workflow** - runs separately

### 2. Publish to NPM (`publish.yml`)

**Triggers:**
- Push to `main`
- Creation of `v*` tags (e.g., `v1.0.0`)

**Actions:**
- **Runs tests first** (linting, type checking, build)
- **Only publishes if tests pass**
- Publishes to npm
- Creates GitHub release (if tag)

## 🔧 Configuration

### 1. NPM Token

To publish to npm, you need to configure an NPM token:

1. **Create NPM token:**
   ```bash
   npm login
   npm token create --read-only
   ```

2. **Add token to GitHub:**
   - Go to your GitHub repo
   - Settings → Secrets and variables → Actions
   - "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: your npm token

### 2. Package.json Configuration

The `package.json` must be properly configured:

```json
{
  "name": "linkedin-poster",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist/**/*",
    "templates/**/*",
    "README.md"
  ],
  "scripts": {
    "build": "tsc",
    "test": "npm run lint && npm run type-check && npm run build",
    "prepublishOnly": "npm run build"
  }
}
```

## 📦 Publishing

### Automatic Publishing

1. **Push to main:** Automatic publishing (only if tests pass)
2. **Tag version:** Publishing + GitHub release (only if tests pass)

### Create New Version

```bash
# 1. Update version
npm version patch  # or minor, major

# 2. Push with tag
git push --follow-tags
```

### Manual Publishing

```bash
npm publish
```

## 🔍 Monitoring

### Check Actions

1. Go to your GitHub repo
2. "Actions" tab
3. Verify workflows pass

### Publishing Logs

Publishing logs are available in:
- GitHub Actions → Publish to NPM
- npm registry (your package)

## 🛠️ Troubleshooting

### Common Errors

1. **Invalid NPM token:**
   - Verify `NPM_TOKEN` is configured
   - Regenerate token if needed

2. **Build fails:**
   - Check TypeScript errors
   - Test locally: `npm run build`

3. **Tests fail:**
   - Check linting errors
   - Test locally: `npm test`

### Local Debug

```bash
# Complete test
npm test

# Build only
npm run build

# Type checking
npm run type-check
```

## 📋 Pre-publishing Checklist

- [ ] Tests pass locally
- [ ] Build works
- [ ] Version updated in `package.json`
- [ ] Changelog updated
- [ ] README updated
- [ ] NPM token configured

## 🎯 Best Practices

1. **Always test before pushing**
2. **Use conventional commits**
3. **Create tags for releases**
4. **Check Actions after each push**
5. **Keep dependencies updated**

## 🔒 Security

### Token Security

- **NPM_TOKEN**: Used for publishing to npm registry
- **GITHUB_TOKEN**: Automatically provided by GitHub Actions
- Never commit tokens to version control

### Publishing Security

- Only publishes if tests pass
- Validates build output
- Checks for required files
- Uses secure token authentication 