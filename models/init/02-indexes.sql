-- only one active game per table
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_game_per_table ON games (table_id) WHERE status = 'active';

-- faster retrieval of goals by game id
CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players (game_id, goals);