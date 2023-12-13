# to be run after creating the catmapperjs docker container
docker exec -it catmapperjs bash 'ln -s /js/build /usr/share/nginx/html/js'