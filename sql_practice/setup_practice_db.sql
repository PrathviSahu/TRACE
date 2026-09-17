-- =================================================================
-- SQL PRACTICE DATABASE SETUP
-- Database Name: practice_sql_db
-- =================================================================

DROP DATABASE IF EXISTS practice_sql_db;
CREATE DATABASE practice_sql_db;
USE practice_sql_db;

-- -----------------------------------------------------------------
-- 1. Table: departments
-- -----------------------------------------------------------------
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    budget DECIMAL(12, 2) NOT NULL
);

-- -----------------------------------------------------------------
-- 2. Table: employees
-- -----------------------------------------------------------------
CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    hire_date DATE NOT NULL,
    department_id INT,
    manager_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------
-- 3. Table: customers
-- -----------------------------------------------------------------
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------
-- 4. Table: orders
-- -----------------------------------------------------------------
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    status ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------
-- 5. Table: order_items
-- -----------------------------------------------------------------
CREATE TABLE order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- =================================================================
-- INSERT SAMPLE DATA
-- =================================================================

-- Departments
INSERT INTO departments (department_id, department_name, location, budget) VALUES
(1, 'Engineering', 'San Francisco', 850000.00),
(2, 'Marketing', 'New York', 420000.00),
(3, 'Sales', 'Chicago', 500000.00),
(4, 'Human Resources', 'Austin', 210000.00),
(5, 'Product Management', 'San Francisco', 380000.00),
(6, 'Customer Support', 'Remote', 150000.00),
(7, 'Research & Development', 'Seattle', 950000.00); -- Dept without employees yet (for testing outer joins)

-- Employees
-- Note: inserting CEO first with manager_id NULL
INSERT INTO employees (employee_id, first_name, last_name, email, job_title, salary, hire_date, department_id, manager_id) VALUES
(1, 'Sarah', 'Connor', 'sarah.c@company.com', 'Chief Executive Officer', 240000.00, '2018-03-15', 5, NULL),
(2, 'Alex', 'Murphy', 'alex.m@company.com', 'VP of Engineering', 195000.00, '2019-01-10', 1, 1),
(3, 'Elena', 'Rostova', 'elena.r@company.com', 'Director of Marketing', 160000.00, '2019-06-20', 2, 1),
(4, 'Marcus', 'Vance', 'marcus.v@company.com', 'Director of Sales', 155000.00, '2020-02-01', 3, 1),
(5, 'Priya', 'Patel', 'priya.p@company.com', 'Staff Software Engineer', 165000.00, '2020-07-15', 1, 2),
(6, 'David', 'Kim', 'david.k@company.com', 'Senior Software Engineer', 142000.00, '2021-04-10', 1, 5),
(7, 'Maya', 'Lin', 'maya.l@company.com', 'Software Engineer', 115000.00, '2022-09-01', 1, 6),
(8, 'Liam', 'OConnor', 'liam.o@company.com', 'Junior Software Engineer', 85000.00, '2023-08-15', 1, 6),
(9, 'Chloe', 'Dubois', 'chloe.d@company.com', 'Content Marketing Lead', 98000.00, '2021-11-01', 2, 3),
(10, 'Ethan', 'Hunt', 'ethan.h@company.com', 'Growth Marketing Specialist', 82000.00, '2022-03-18', 2, 3),
(11, 'Zoe', 'Barnes', 'zoe.b@company.com', 'Enterprise Account Executive', 125000.00, '2021-01-12', 3, 4),
(12, 'James', 'Holden', 'james.h@company.com', 'Sales Development Rep', 68000.00, '2023-02-20', 3, 11),
(13, 'Amara', 'Okafor', 'amara.o@company.com', 'HR Generalist', 75000.00, '2022-05-14', 4, 1),
(14, 'Lucas', 'Scott', 'lucas.s@company.com', 'Technical Support Specialist', 62000.00, '2023-10-05', 6, 2),
(15, 'Noah', 'Taylor', 'noah.t@company.com', 'Contract Consultant', 110000.00, '2024-01-10', NULL, NULL); -- Employee with no department

-- Customers
INSERT INTO customers (customer_id, full_name, email, city, country, created_at) VALUES
(1, 'Alice Johnson', 'alice.j@gmail.com', 'New York', 'USA', '2023-01-15 10:20:00'),
(2, 'Bob Smith', 'bob.smith@yahoo.com', 'London', 'UK', '2023-02-10 14:15:00'),
(3, 'Carlos Mendez', 'carlos.m@hotmail.com', 'Madrid', 'Spain', '2023-03-05 09:40:00'),
(4, 'Deepa Rao', 'deepa.rao@outlook.com', 'Bengaluru', 'India', '2023-04-12 18:30:00'),
(5, 'Emily Davis', 'emily.d@gmail.com', 'Toronto', 'Canada', '2023-05-22 11:05:00'),
(6, 'Fumiko Sato', 'fumiko.s@gmail.com', 'Tokyo', 'Japan', '2023-06-18 16:50:00'),
(7, 'Gabriel Garcia', 'gabriel.g@gmail.com', 'Berlin', 'Germany', '2023-07-01 13:25:00'),
(8, 'Hannah Abbott', 'hannah.a@icloud.com', 'Sydney', 'Australia', '2023-08-14 08:10:00'),
(9, 'Ian Wright', 'ian.w@gmail.com', 'London', 'UK', '2023-09-09 15:45:00'),
(10, 'Jessica Taylor', 'jess.t@gmail.com', 'San Francisco', 'USA', '2023-10-30 19:15:00'),
(11, 'Klaus Mueller', 'klaus.m@web.de', 'Munich', 'Germany', '2024-01-05 12:00:00'); -- Customer with 0 orders

-- Orders
INSERT INTO orders (order_id, customer_id, order_date, status, total_amount) VALUES
(101, 1, '2024-01-15', 'Delivered', 1249.98),
(102, 2, '2024-01-18', 'Delivered', 320.50),
(103, 3, '2024-01-25', 'Delivered', 85.00),
(104, 1, '2024-02-02', 'Delivered', 450.00),
(105, 4, '2024-02-10', 'Shipped', 1899.99),
(106, 5, '2024-02-14', 'Delivered', 95.50),
(107, 6, '2024-02-20', 'Delivered', 670.00),
(108, 7, '2024-03-01', 'Cancelled', 240.00),
(109, 8, '2024-03-05', 'Delivered', 145.00),
(110, 9, '2024-03-12', 'Shipped', 890.00),
(111, 2, '2024-03-15', 'Pending', 75.00),
(112, 10, '2024-03-20', 'Delivered', 2150.00),
(113, 4, '2024-03-25', 'Pending', 110.00),
(114, 1, '2024-04-02', 'Shipped', 780.00);

-- Order Items
INSERT INTO order_items (item_id, order_id, product_name, category, unit_price, quantity) VALUES
(1, 101, 'Dell UltraSharp 27" 4K Monitor', 'Electronics', 599.99, 2),
(2, 101, 'Logitech MX Master 3S Mouse', 'Electronics', 49.99, 1),
(3, 102, 'Mechanical Keyboard (Cherry Brown)', 'Electronics', 140.00, 1),
(4, 102, 'Standing Desk Anti-fatigue Mat', 'Furniture', 40.50, 1),
(5, 102, 'Ergonomic Wrist Rest', 'Furniture', 20.00, 2),
(6, 103, 'Designing Data-Intensive Applications (Book)', 'Books', 45.00, 1),
(7, 103, 'Clean Code: A Handbook of Agile Craft (Book)', 'Books', 40.00, 1),
(8, 104, 'Noise-Cancelling Over-Ear Headphones', 'Electronics', 350.00, 1),
(9, 104, 'Braided USB-C Cable (Pack of 3)', 'Electronics', 25.00, 2),
(10, 105, 'MacBook Air M2 16GB 512GB', 'Electronics', 1299.99, 1),
(11, 105, 'Thunderbolt 4 Docking Station', 'Electronics', 299.99, 2),
(12, 106, 'Cotton Casual Hoodie (Navy, L)', 'Clothing', 55.50, 1),
(13, 106, 'Gym Training T-Shirt (Pack of 2)', 'Clothing', 40.00, 1),
(14, 107, 'Herman Miller Style Ergonomic Chair', 'Furniture', 670.00, 1),
(15, 108, 'Smart LED Desk Lamp', 'Electronics', 80.00, 3),
(16, 109, 'Wireless Charging Pad', 'Electronics', 35.00, 1),
(17, 109, 'Laptop Sleeve (Waterproof)', 'Accessories', 35.00, 1),
(18, 109, 'Microfiber Cleaning Kit', 'Accessories', 15.00, 1),
(19, 110, 'Sony Wireless Earbuds WF-1000XM5', 'Electronics', 290.00, 1),
(20, 110, 'iPad 10th Gen 64GB', 'Electronics', 449.00, 1),
(21, 110, 'iPad Folio Case', 'Accessories', 51.00, 1),
(22, 111, 'Reusable Glass Water Bottle', 'Accessories', 25.00, 3),
(23, 112, 'iPhone 15 Pro 256GB', 'Electronics', 1099.00, 1),
(24, 112, 'Apple Watch Series 9', 'Electronics', 429.00, 2),
(25, 112, 'MagSafe Battery Pack', 'Accessories', 99.00, 1),
(26, 113, 'System Design Interview – Alex Xu (Book)', 'Books', 40.00, 1),
(27, 113, 'Python Crash Course (Book)', 'Books', 35.00, 2),
(28, 114, 'Ultrawide Curved Gaming Monitor 34"', 'Electronics', 680.00, 1),
(29, 114, 'Monitor Desk Mount Arm', 'Furniture', 100.00, 1);

-- Verify row counts
SELECT 'departments' AS table_name, COUNT(*) AS total_rows FROM departments
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;
