CREATE OR REPLACE VIEW winning_teams_view AS
WITH game_scores AS (
    SELECT
        game_id,
        team,
        SUM(goals) as total_goals
    FROM game_players
    GROUP BY game_id, team
),
winning_teams AS (
    SELECT
        gs1.game_id,
        gs1.team as winning_team
    FROM game_scores gs1
    JOIN games g on gs1.game_id = g.id
    -- the following works because it's a cartesian product of all the game scores
    -- if gs1 wins, it will be 'kept', if gs2 wins, gs1 will be filtered out by the WHERE clause (but gs2 is kept since it is in the product)
    -- so in the end, always one team will remain, since the other will be filtered out
    LEFT JOIN game_scores gs2 ON gs1.game_id = gs2.game_id AND gs1.team != gs2.team
    WHERE g.status = 'ended' AND (gs2.total_goals IS NULL OR gs1.total_goals > gs2.total_goals)
)
SELECT * FROM winning_teams;