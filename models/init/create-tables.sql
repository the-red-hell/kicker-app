CREATE TYPE possible_positions AS ENUM ('attack-white', 'attack-black', 'defense-white', 'defense-black');
CREATE TYPE status AS ENUM ('waiting', 'active', 'finished');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    points_white INTEGER NOT NULL,
    points_black INTEGER NOT NULL,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    status status NOT NULL DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- M-N relationship between games and players
CREATE TABLE IF NOT EXISTS game_players (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    goals INTEGER DEFAULT 0,
    position possible_positions NOT NULL
);

CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- test data
INSERT INTO tables (name, location) VALUES
    ('Tisch 1', 'Ecke'),
    ('Tisch 2', 'Mitte'),
    ('Tisch 3', 'Fenster');