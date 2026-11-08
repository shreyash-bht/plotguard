CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100),
    email_id VARCHAR(255),
    password_hash TEXT,

    is_temp_user BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    CONSTRAINT chk_user_identity CHECK (
        (
            is_temp_user = TRUE
            AND username IS NOT NULL
            AND email_id IS NULL
            AND password_hash IS NULL
        )
        OR
        (
            is_temp_user = FALSE
            AND username IS NOT NULL
            AND email_id IS NOT NULL
            AND password_hash IS NOT NULL
        )
    )
);

-- Only registered users need unique usernames and emails.
CREATE UNIQUE INDEX uq_users_registered_username
    ON users(username)
    WHERE is_temp_user = FALSE;

CREATE UNIQUE INDEX uq_users_registered_email
    ON users(email_id)
    WHERE is_temp_user = FALSE;