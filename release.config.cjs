const releaseBranches = ['master', 'main'];
const isReleaseBranch = releaseBranches.includes(process.env.GITHUB_REF_NAME);

module.exports = {
    branches: ['master', { name: 'develop', prerelease: 'beta' }],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        ...(isReleaseBranch
            ? [['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }]]
            : []),
        '@semantic-release/npm',
        '@semantic-release/github',
        ...(isReleaseBranch
            ? [
                  [
                      '@semantic-release/git',
                      {
                          assets: ['CHANGELOG.md'],
                          message:
                              'chore(release): release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
                      },
                  ],
              ]
            : []),
    ],
};
