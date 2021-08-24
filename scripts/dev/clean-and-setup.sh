docker-compose down
rm -r db generated types

npm run codegen
npm run typegen

docker-compose up -d db
sleep 1

npm run db:create-migration initial
npm run db:migrate
npm run processor:migrate