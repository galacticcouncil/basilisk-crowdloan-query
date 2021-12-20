set -e

docker compose down

rm -rf db src/generated src/types

npm run codegen

npm run typegen

npm run build

docker compose up db -d
sleep 5

npm run db:migrate
npm run processor:migrate
