name: CI
on:
  pull_request:
    branches: [main]

jobs:
  commitlint-pr-title:
    name: commitlint/pr-title
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            chore
            refactor
            docs
            perf
            test
            ci
            build
          requireScope: false

  lint-build:
    name: ci/lint-build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run build
      - run: npm test --if-present