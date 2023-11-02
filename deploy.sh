echo "Building"
npm run build

scp -r build/* hkasi1@sociomap:/var/www/CatMapper.org/js/[REDACTED]/

echo "Done!"
