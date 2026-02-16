CREATE TYPE possible_positions AS ENUM ('attack', 'defense');
CREATE TYPE possible_teams AS ENUM ('white', 'black');
CREATE TYPE status AS ENUM ('waiting', 'active', 'ended');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    table_id INTEGER NOT NULL REFERENCES tables(id),
    points_white INTEGER NOT NULL DEFAULT 0,
    points_black INTEGER NOT NULL DEFAULT 0,
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
    position possible_positions NOT NULL,
    team possible_teams NOT NULL,

    -- player can't hold two positions at once
    CONSTRAINT unique_user_per_game UNIQUE (game_id, user_id),
    -- position/team is only taken by one person
    CONSTRAINT unique_position_per_game UNIQUE (game_id, position, team)
);

-- test data
INSERT INTO tables (name, location) VALUES
    ('Tisch 1', 'Ecke'),
    ('Tisch 2', 'Mitte'),
    ('Tisch 3', 'Fenster');