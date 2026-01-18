ALTER TABLE students ADD COLUMN year INTEGER;

UPDATE students 
SET year = enrollments.year 
FROM enrollments 
WHERE students.id = enrollments.student_id;