
-- ============================================================
-- SEED DATA FOR NEW MODULES
-- ============================================================

-- Teachers
INSERT INTO teachers (user_id, full_name, email, phone, department, subjects_taught, hire_date, bio) VALUES
(2, 'Dr. John Smith',   'john.smith@school.edu',   '+1-555-0101', 'Mathematics', 'Calculus, Linear Algebra', '2018-08-15', 'PhD in Mathematics from MIT. Passionate about making math accessible to all students.'),
(NULL, 'Dr. Jane Doe',     'jane.doe@school.edu',     '+1-555-0102', 'Science',      'Physics, Thermodynamics',  '2019-01-10', 'Former research scientist with 10 years of industry experience.'),
(NULL, 'Dr. Robert Brown', 'robert.brown@school.edu', '+1-555-0103', 'Science',      'Chemistry, Biology',       '2017-09-01', 'Award-winning chemistry educator and curriculum designer.'),
(NULL, 'Dr. Sarah Green',  'sarah.green@school.edu',  '+1-555-0104', 'Humanities',   'English Literature, Writing', '2020-03-20', 'Published author and expert in Shakespearean studies.');

-- Attendance records (last 7 days for each enrolled student)
INSERT INTO attendance (student_id, course_id, `date`, status, marked_by) VALUES
-- Alice (student 1) in Math (course 1) and Chemistry (course 3)
(1, 1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', 1),
(1, 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', 1),
(1, 1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'late',    1),
(1, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'present', 1),
(1, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'present', 1),
(1, 3, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', 1),
(1, 3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'absent',  1),
(1, 3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'present', 1),
-- Bob (student 2) in Physics (course 2) and English (course 4)
(2, 2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', 1),
(2, 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'absent',  1),
(2, 2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'present', 1),
(2, 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'present', 1),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', 1),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', 1),
-- Carol (student 3) in Math and Physics
(3, 1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', 1),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', 1),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'present', 1),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'late',    1),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', 1),
-- Emma (student 5) in Math, Physics, English
(5, 1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', 1),
(5, 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', 1),
(5, 2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'present', 1),
(5, 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', 1),
(5, 4, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'absent',  1),
(5, 4, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'present', 1);

-- Announcements
INSERT INTO announcements (title, content, author_id, category, pinned, target_role) VALUES
('Welcome to the New School Year!',
 'We are excited to welcome all students and staff to the 2026–2027 academic year. Classes begin on September 2nd. Please check your timetables and ensure your enrollment is complete.',
 1, 'general', 1, 'all'),

('Mid-Term Exam Schedule Released',
 'The mid-term examination schedule has been finalized. Exams will run from October 14–18, 2026. Students are advised to review the full schedule on the academic portal and prepare accordingly. No make-up exams will be offered without documented medical excuse.',
 1, 'academic', 0, 'all'),

('Science Fair 2026 — Registration Open',
 'Registration for the Annual Science Fair is now open! Students in Classes A, B, and C are eligible to submit individual or group projects. Deadline for registration is October 5, 2026. Contact Dr. Brown in the Science Department for more details.',
 2, 'event', 0, 'all'),

('Staff Meeting — Department Heads',
 'All department heads are required to attend the monthly staff coordination meeting on Friday, September 28 at 3:00 PM in Conference Room B. Please bring your Q3 progress reports.',
 1, 'general', 0, 'teacher'),

('Library Hours Extended',
 'Starting this week, the school library will be open until 7:00 PM on weekdays to support students during exam preparation. Weekend hours remain 9:00 AM – 1:00 PM.',
 1, 'general', 0, 'all');
