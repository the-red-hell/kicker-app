
## Installation

- `brew install colima docker docker-compose git gh` (Alternativ kann auch anstelle der ersten 3, [Docker Desktop](https://www.docker.com/get-started/) installiert werden.)
- `gh auth login` -> jetzt so oft Enter drücken/Anweisungen befolgen, bis man auf GitHub landet und sich einloggen muss
- in einen Ordner wechseln, wo das Projekt sein soll
- `git clone https://github.com/the-red-hell/web-engineering-projekt.git`
- `cd web-engineering-projekt`
- `colima start`
- Eine Datei namens `.env` in den Ordner packen mit dem
- `docker-compose up --build --watch`
- jetzt auf http://localhost:8080 gehen
