-- =================================================================
-- 🧠 SQL PRACTICE EXERCISES & ROADMAP
-- Database: practice_sql_db
-- =================================================================
-- Instructions:
-- Try to write the query yourself before looking at the solution!
-- Run each query individually in MySQL Workbench or terminal.
-- =================================================================

USE practice_sql_db;

-- -----------------------------------------------------------------
-- 🟢 LEVEL 1: BASIC QUERIES (SELECT, WHERE, ORDER BY, LIMIT)
-- -----------------------------------------------------------------

-- 1.1: Retrieve all employee names and their salaries
SELECT first_name, last_name, salary 
FROM employees;

-- 1.2: Find all employees in department 1 earning more than $100,000
SELECT first_name, last_name, salary, department_id
FROM employees
WHERE department_id = 1 AND salary > 100000;

-- 1.3: List the top 5 highest-paid employees in the company
SELECT first_name, last_name, job_title, salary
FROM employees
ORDER BY salary DESC
LIMIT 5;

-- 1.4: Find all customers who live in either 'USA' or 'UK'
SELECT full_name, city, country
FROM customers
WHERE country IN ('USA', 'UK');

-- 1.5: Find all products in order_items that contain the word "Monitor"
SELECT DISTINCT product_name, category, unit_price
FROM order_items
WHERE product_name LIKE '%Monitor%';


-- -----------------------------------------------------------------
-- 🟡 LEVEL 2: AGGREGATIONS & GROUPING (COUNT, SUM, AVG, GROUP BY, HAVING)
-- -----------------------------------------------------------------

-- 2.1: Count the total number of employees and average salary across the company
SELECT 
    COUNT(*) AS total_employees,
    ROUND(AVG(salary), 2) AS average_salary,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary
FROM employees;

-- 2.2: Find the average salary and employee count per department
SELECT 
    department_id,
    COUNT(*) AS employee_count,
    ROUND(AVG(salary), 2) AS avg_salary
FROM employees
WHERE department_id IS NOT NULL
GROUP BY department_id;

-- 2.3: Find departments with an average salary greater than $120,000 (using HAVING)
-- Note: WHERE filters rows before grouping; HAVING filters groups after aggregation!
SELECT 
    department_id,
    COUNT(*) AS employee_count,
    ROUND(AVG(salary), 2) AS avg_salary
FROM employees
WHERE department_id IS NOT NULL
GROUP BY department_id
HAVING AVG(salary) > 120000;

-- 2.4: Find the total revenue earned from each product category
SELECT 
    category,
    COUNT(*) AS items_sold_count,
    SUM(unit_price * quantity) AS total_revenue
FROM order_items
GROUP BY category
ORDER BY total_revenue DESC;


-- -----------------------------------------------------------------
-- 🟠 LEVEL 3: JOINS (INNER JOIN, LEFT JOIN, SELF JOIN)
-- -----------------------------------------------------------------

-- 3.1: (INNER JOIN) List each employee's name along with their department name and office location
SELECT 
    e.first_name,
    e.last_name,
    e.job_title,
    d.department_name,
    d.location
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;

-- 3.2: (LEFT JOIN) Show all departments and their employees
-- Notice: Departments with NO employees (like 'Research & Development') will still appear with NULL!
SELECT 
    d.department_name,
    d.location,
    e.first_name,
    e.last_name,
    e.job_title
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id;

-- 3.3: (LEFT JOIN) Find customers who have NEVER placed an order
SELECT 
    c.customer_id,
    c.full_name,
    c.email,
    c.city,
    c.country
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;

-- 3.4: (SELF JOIN) Show each employee and the name of their Manager
SELECT 
    e.first_name AS employee_name,
    e.job_title,
    COALESCE(m.first_name, 'None (CEO)') AS manager_name
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id;

-- 3.5: (3-Table JOIN) Show each customer's order history with product details
SELECT 
    c.full_name,
    o.order_id,
    o.order_date,
    oi.product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_total
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
ORDER BY o.order_date DESC;


-- -----------------------------------------------------------------
-- 🔵 LEVEL 4: CONDITIONAL LOGIC & SUBQUERIES
-- -----------------------------------------------------------------

-- 4.1: (CASE WHEN) Classify employee salary into 'Entry', 'Mid', 'Senior', and 'Executive' brackets
SELECT 
    first_name,
    last_name,
    job_title,
    salary,
    CASE 
        WHEN salary >= 180000 THEN 'Executive Tier'
        WHEN salary >= 130000 THEN 'Senior Tier'
        WHEN salary >= 80000  THEN 'Mid Tier'
        ELSE 'Entry Tier'
    END AS compensation_tier
FROM employees
ORDER BY salary DESC;

-- 4.2: (Subquery in WHERE) Find all employees earning above the company's average salary
SELECT 
    first_name,
    last_name,
    job_title,
    salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC;

-- 4.3: (Correlated Subquery) Find the highest-paid employee in each department
SELECT 
    e.first_name,
    e.last_name,
    e.department_id,
    e.salary
FROM employees e
WHERE e.salary = (
    SELECT MAX(sub.salary)
    FROM employees sub
    WHERE sub.department_id = e.department_id
);


-- -----------------------------------------------------------------
-- 🟣 LEVEL 5: ADVANCED ANALYTICAL QUERIES (CTEs & WINDOW FUNCTIONS)
-- -----------------------------------------------------------------

-- 5.1: (CTE - Common Table Expression) Calculate customer lifetime spend and filter VIP customers
WITH CustomerSpend AS (
    SELECT 
        c.customer_id,
        c.full_name,
        c.country,
        COUNT(o.order_id) AS total_orders,
        COALESCE(SUM(o.total_amount), 0) AS lifetime_value
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id, c.full_name, c.country
)
SELECT *
FROM CustomerSpend
WHERE lifetime_value > 500
ORDER BY lifetime_value DESC;

-- 5.2: (Window Function: DENSE_RANK) Rank employees by salary within each department
SELECT 
    e.first_name,
    e.last_name,
    d.department_name,
    e.salary,
    DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS salary_rank_in_dept
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;

-- 5.3: (Running Total) Calculate running total of order revenue by date
SELECT 
    order_id,
    order_date,
    total_amount,
    SUM(total_amount) OVER (ORDER BY order_date, order_id) AS cumulative_revenue
FROM orders
WHERE status != 'Cancelled';
