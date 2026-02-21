name: pr/review-required
on:
  pull_request:
    types: [opened, reopened, synchronize, edited, ready_for_review]
    branches: [main]

jobs:
  review-required:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: read
    steps:
      - name: Exigir pelo menos 1 aprovação
        uses: actions/github-script@v7
        with:
          script: |
            const pr = context.payload.pull_request;
            if (!pr || pr.draft) return; // não exige em rascunho
            const { owner, repo } = context.repo;
            const number = pr.number;
            const reviews = await github.rest.pulls.listReviews({ owner, repo, pull_number: number });
            const approved = reviews.data.some(r => r.state === 'APPROVED');
            if (!approved) {
              core.setFailed('É necessário pelo menos 1 review APROVADO antes do merge.');
            }