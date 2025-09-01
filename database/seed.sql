USE `mdva`;

INSERT INTO users (full_name, email, password, role, status, leave_balance, salary, created_at, updated_at)
VALUES
('Admin MDVA', 'admin@mdva.local', MD5('password'), 'admin', 1, 30, 15000000, NOW(), NOW()),
('HRD MDVA', 'hrd@mdva.local', MD5('password'), 'hrd', 1, 20, 10000000, NOW(), NOW()),
('User One', 'user1@mdva.local', MD5('password'), 'user', 1, 12, 8000000, NOW(), NOW()),
('Suspended User', 'suspended@mdva.local', MD5('password'), 'user', 2, 0, 0, NOW(), NOW()),
('Inactive User', 'inactive@mdva.local', MD5('password'), 'user', 0, 0, 0, NOW(), NOW());

INSERT INTO events (title, description, image, start_date, end_date, status, created_at, updated_at)
VALUES
('Welcome Fair', 'Company welcome event', NULL, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 0, NOW(), NOW()),
('Past Event', 'Old event should still be fetchable by id', NULL, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 20 DAY), 0, NOW(), NOW()),
('Inactive Event', 'Should not appear in dashboard list', NULL, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, NOW(), NOW());

INSERT INTO inventory (name, description, quantity, unit, status, created_at, updated_at)
VALUES
('Laptop Dell', 'Dell Latitude 7420', 10, 'unit', 0, NOW(), NOW()),
('Monitor 24"', 'IPS 1080p', 15, 'unit', 0, NOW(), NOW()),
('HDMI Cable', '2m HDMI 2.0', 50, 'pcs', 0, NOW(), NOW());

INSERT INTO notifications (user_id, message, status, created_at, updated_at)
VALUES
(3, 'Your leave request has been received', 0, NOW(), NOW()),
(3, 'Inventory request approved', 1, NOW(), NOW());


