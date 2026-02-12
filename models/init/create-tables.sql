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
    attack_white INTEGER REFERENCES users(id),
    attack_black INTEGER REFERENCES users(id),
    defense_white INTEGER REFERENCES users(id),
    defense_black INTEGER REFERENCES users(id),
    points_white INTEGER NOT NULL,
    points_black INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);