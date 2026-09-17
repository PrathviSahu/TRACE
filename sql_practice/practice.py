#!/usr/bin/env python3
"""
Interactive SQL Query Runner
Runs SQL queries against your local practice database.
"""
import sqlite3
import sys

DB_PATH = "/Users/snehasahu/Desktop/TRACE/sql_practice/practice.db"

def run_query(query: str):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(query)
        
        if query.strip().upper().startswith(("SELECT", "WITH", "EXPLAIN", "PRAGMA")):
            rows = cursor.fetchall()
            headers = [desc[0] for desc in cursor.description] if cursor.description else []
            
            if not rows:
                print("\n[Result: 0 rows returned]\n")
                return
            
            # Format as simple table
            col_widths = [max(len(str(h)), max(len(str(row[i])) for row in rows)) for i, h in enumerate(headers)]
            header_str = " | ".join(f"{h:<{w}}" for h, w in zip(headers, col_widths))
            sep_str = "-+-".join("-" * w for w in col_widths)
            
            print("\n" + header_str)
            print(sep_str)
            for row in rows:
                print(" | ".join(f"{str(val):<{w}}" for val, w in zip(row, col_widths)))
            print(f"\n({len(rows)} row{'s' if len(rows) != 1 else ''})\n")
        else:
            conn.commit()
            print(f"\n[Executed successfully: {cursor.rowcount} row(s) affected]\n")
            
        conn.close()
    except Exception as e:
        print(f"\n[SQL Error]: {e}\n")

def main():
    print("=" * 60)
    print("🚀 Local SQL Practice Interactive Shell")
    print("Database: practice.db (departments, employees, customers, orders, order_items)")
    print("Type your SQL query and press Enter. Type 'exit' or 'quit' to quit.")
    print("=" * 60)
    
    while True:
        try:
            query = input("sql> ").strip()
            if not query:
                continue
            if query.lower() in ("exit", "quit", "q"):
                print("Bye!")
                break
            run_query(query)
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            break

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_query(" ".join(sys.argv[1:]))
    else:
        main()
