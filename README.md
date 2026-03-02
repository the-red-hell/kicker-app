## Installation

### Voraussetzungen

- Docker (alternativ Docker Desktop)
- Git

### Schritte

- in einen Ordner wechseln, wo das Projekt sein soll
- `git clone https://github.com/the-red-hell/kicker-app.git` oder das Projekt als ZIP herunterladen und entpacken
- `cd kicker-app`
- Docker-Engine starten (z.B. `colima start` oder Docker Desktop öffnen)
- Eine Datei namens `.env` in den Ordner packen mit dem Inhalt ähnlich der `.env.example` (`cp .env.example .env` und dann die Werte anpassen)
- `docker-compose up --build --watch`
- jetzt auf <http://localhost:8080> gehen
