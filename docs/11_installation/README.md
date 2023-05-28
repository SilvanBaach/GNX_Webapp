
# Installation

## Voraussetzungen
 - Docker
 - Docker-Compose
 - Postgres

## Docker Umgebung vorbereiten
Folgende Pfade müssen in der Dockerumgebung erstellt werden:
 - ./caddy/data
 - ./caddy/config
 - ./caddy/logs
 - ./genetix/filestorage/root

1. Den Inhalt der Datei create_db.sql in der Postgres Umgebung ausführen.
1. Die .env.example Datei in .env umbenennen und die Variablen an die eigene Umgebung anpassen.
1. Die docker-compose.yml Datei anpassen, falls die Standardports nicht verwendet werden sollen oder die Pfade abweichen.
1. Das Caddyfile in den Ordner ./caddy/config kopieren und an die eigene Umgebung anpassen.
1. Die Dockerumgebung starten: `docker-compose up -d`