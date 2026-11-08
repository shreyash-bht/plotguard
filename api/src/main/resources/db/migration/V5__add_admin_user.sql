INSERT INTO users (
    username,
    email_id,
    password_hash,
    is_temp_user,
    status
)
VALUES (
    'admin',
    'admin@example.com',
    '{bcrypt}$2a$12$wFof9dcVJdgYXsX0UbZaC.2ddjQFGVe2tqje6oGBQdzvurN6xMg06',
    FALSE,
    'active'
)
ON CONFLICT (username) WHERE is_temp_user = FALSE
DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r
    ON r.role_name IN ('ROLE_ADMIN', 'ROLE_MODERATOR')
WHERE u.username = 'admin'
  AND u.is_temp_user = FALSE
ON CONFLICT (user_id, role_id) DO NOTHING;
