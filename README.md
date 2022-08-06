## Users Backend

<code>
    CREATE TABLE IF NOT EXISTS
        users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(128),
            email VARCHAR(128) UNIQUE NOT NULL,
            password VARCHAR(128),
            login_attempts INTEGER,
            blocked_date varchar(255),
            created_date TIMESTAMP,
            modified_date TIMESTAMP
        );
</code>
