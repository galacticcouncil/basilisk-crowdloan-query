set -e

docker compose down

rm -rf db src/generated src/types

yarn run codegen

yarn run typegen

yarn run build

docker compose up db -d
sleep 5

yarn run processor:migrate
yarn run processor:db:create-migration initial
yarn run processor:db:migrate