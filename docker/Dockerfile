FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=12345678
COPY ./database_init.sql /docker-entrypoint-initdb.d/
