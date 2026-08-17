INSERT INTO users (username, email_id, password_hash, status)
VALUES (
    'admin',
    'admin@example.com',
    '{bcrypt}$2a$12$wFof9dcVJdgYXsX0UbZaC.2ddjQFGVe2tqje6oGBQdzvurN6xMg06',
    'active'
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'ROLE_ADMIN'
WHERE u.username = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
