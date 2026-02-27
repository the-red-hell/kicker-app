export const createUser = async (client, username, email, passwordHash) => {
    const insertQuery = `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, created_at
  `;
    const result = await client.query(insertQuery, [
        username,
        email,
        passwordHash,
    ]);
    return result.rows[0];
};

export const findUserByUsername = async (client, username) => {
    const selectQuery = "SELECT * FROM users WHERE username = $1";
    const result = await client.query(selectQuery, [username]);
    return result.rows[0];
};

export const findUserById = async (client, id) => {
    const selectQuery =
        "SELECT id, username, email, created_at FROM users WHERE id = $1";
    const result = await client.query(selectQuery, [id]);
    return result.rows[0];
};

// TODO: update user, delete user, etc.
