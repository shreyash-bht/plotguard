INSERT INTO roles (role_name, description)
VALUES 
    ('ROLE_USER', 'User'),
    ('ROLE_ADMIN', 'Administrator'),
    ('ROLE_MODERATOR', 'Content Moderator')
ON CONFLICT (role_name) DO NOTHING;
