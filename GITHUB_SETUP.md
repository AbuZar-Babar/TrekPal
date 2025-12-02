# GitHub Setup Guide

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name your repository (e.g., `trekpal-travel-system`)
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Or if using SSH:
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: TrekPal Travel Management System"

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify

1. Go to your GitHub repository page
2. You should see all your files there
3. The README.md will be displayed on the repository homepage

## Future Updates

When you make changes and want to push:

```bash
# Stage changes
git add .

# Commit with a message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## Branching (Optional)

To work on features in separate branches:

```bash
# Create and switch to a new branch
git checkout -b feature-name

# Make your changes, then:
git add .
git commit -m "Add feature description"
git push -u origin feature-name

# To switch back to main:
git checkout main

# To merge a branch into main:
git merge feature-name
```

## Common Git Commands

```bash
# Check status
git status

# View commit history
git log

# View remote repositories
git remote -v

# Pull latest changes
git pull

# Discard local changes (⚠️ be careful!)
git checkout -- <file>
```

