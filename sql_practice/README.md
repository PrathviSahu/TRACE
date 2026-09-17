# 🎓 SQL Practice Environment & Learning Kit

Welcome! Your complete local SQL learning environment is set up and ready to go.

---

## 📁 What's in this folder:

- **[`setup_practice_db.sql`](./setup_practice_db.sql)**: Complete SQL script that creates and populates the `practice_sql_db` database with 5 interconnected tables.
- **[`practice_exercises.sql`](./practice_exercises.sql)**: Curated SQL exercises from Beginner to Advanced with solutions and explanations.
- **[`practice.db`](./practice.db)**: An offline SQLite copy of the database ready for instant practice with zero configuration.
- **[`practice.py`](./practice.py)**: A mini interactive SQL shell to run queries right inside your terminal.

---

## 🗄️ Database Schema Overview

The practice database models a company with departments, employees, and an e-commerce store:

1. **`departments`**: `department_id`, `department_name`, `location`, `budget`
2. **`employees`**: `employee_id`, `first_name`, `last_name`, `email`, `job_title`, `salary`, `hire_date`, `department_id`, `manager_id`
3. **`customers`**: `customer_id`, `full_name`, `email`, `city`, `country`, `created_at`
4. **`orders`**: `order_id`, `customer_id`, `order_date`, `status`, `total_amount`
5. **`order_items`**: `item_id`, `order_id`, `product_name`, `category`, `unit_price`, `quantity`

---

## 🚀 Option A: Load into MySQL & MySQL Workbench

### Step 1: Import the Database into MySQL
In your terminal, run:
```bash
mysql -u root -p < /Users/snehasahu/Desktop/TRACE/sql_practice/setup_practice_db.sql
```
*(Enter your MySQL root password when prompted)*

### Step 2: Open MySQL Workbench
1. Launch **MySQL Workbench** from Applications (`Cmd + Space` -> MySQL Workbench).
2. Click on your **Local instance 3306** connection and enter your password.
3. In the query editor, open **[`practice_exercises.sql`](./practice_exercises.sql)** (`File` -> `Open SQL Script...`).
4. Highlight any query and click the ⚡ **Execute** icon (or press `Cmd + Enter`) to run it!

---

## ⚡ Option B: Instant Terminal Practice (Zero Setup / No Password)

If you just want to run queries immediately without entering passwords:

### Run Interactive Terminal Shell:
```bash
python3 /Users/snehasahu/Desktop/TRACE/sql_practice/practice.py
```
Then type any query:
```sql
sql> SELECT first_name, salary FROM employees WHERE salary > 100000;
```

### Or Run a One-Liner Query:
```bash
python3 /Users/snehasahu/Desktop/TRACE/sql_practice/practice.py "SELECT * FROM departments;"
```

---

## 🗺️ Learning Roadmap in `practice_exercises.sql`

| Level | Topic | Key Keywords |
|---|---|---|
| **Level 1** | Fundamentals & Filtering | `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `IN`, `LIKE` |
| **Level 2** | Aggregations & Grouping | `COUNT()`, `SUM()`, `AVG()`, `GROUP BY`, `HAVING` |
| **Level 3** | Table Relationships & Joins | `INNER JOIN`, `LEFT JOIN`, `SELF JOIN` |
| **Level 4** | Conditionals & Subqueries | `CASE WHEN`, Subqueries in `WHERE`/`FROM` |
| **Level 5** | Analytics & Advanced SQL | `WITH` (CTEs), `DENSE_RANK()`, Window Functions |
