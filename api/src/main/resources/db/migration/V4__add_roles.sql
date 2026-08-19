INSERT INTO roles (role_name, description)
VALUES 
    ('ROLE_ADMIN', 'Administrator'),
    ('ROLE_MODERATOR', 'Content Moderator'),
    ('ROLE_USER', 'User')
ON CONFLICT (role_name) DO NOTHING;
