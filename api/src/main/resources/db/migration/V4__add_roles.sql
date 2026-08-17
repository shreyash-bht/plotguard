INSERT INTO roles (role_name, description)
VALUES 
    ('ROLE_USER', 'User'),
    ('ROLE_ADMIN', 'Administrator')
ON CONFLICT (role_name) DO NOTHING;
