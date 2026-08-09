const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

// LOCAL_FS_MODE lets you run/test the admin panel against the files on disk
// instead of GitHub, so you don't need a token for local development.
const LOCAL_FS_MODE = process.env.LOCAL_FS_MODE === '1';
const LOCAL_ROOT = path.join(__dirname, '..', '..');

function getClient() {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

function repoParams() {
  return {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main'
  };
}

async function readFile(filePath) {
  if (LOCAL_FS_MODE) {
    const content = fs.readFileSync(path.join(LOCAL_ROOT, filePath), 'utf8');
    return { content, sha: null };
  }
  const octokit = getClient();
  const { owner, repo, branch } = repoParams();
  const res = await octokit.repos.getContent({ owner, repo, path: filePath, ref: branch });
  const content = Buffer.from(res.data.content, 'base64').toString('utf8');
  return { content, sha: res.data.sha };
}

async function writeFiles(files, message) {
  // files: [{ path, content }]. Commits each file; looks up its current sha first (required for updates).
  if (LOCAL_FS_MODE) {
    files.forEach(file => fs.writeFileSync(path.join(LOCAL_ROOT, file.path), file.content, 'utf8'));
    console.log('[LOCAL_FS_MODE] wrote', files.map(f => f.path).join(', '), '-', message);
    return;
  }

  const octokit = getClient();
  const { owner, repo, branch } = repoParams();

  for (const file of files) {
    let sha;
    try {
      const existing = await octokit.repos.getContent({ owner, repo, path: file.path, ref: branch });
      sha = existing.data.sha;
    } catch (err) {
      if (err.status !== 404) throw err;
    }
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      branch,
      path: file.path,
      message,
      content: Buffer.from(file.content, 'utf8').toString('base64'),
      sha
    });
  }
}

module.exports = { readFile, writeFiles };
