sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Validação do padrão de commit (Conventional Commits)
npx --no-install commitlint --edit "$1"
