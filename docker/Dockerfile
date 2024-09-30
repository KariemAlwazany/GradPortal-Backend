FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=new_password
COPY ./database_init.sql /nopdocker-entrypoint-initdb.d/
