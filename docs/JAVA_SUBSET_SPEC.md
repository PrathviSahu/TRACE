# TRACE Java Subset v1 Specification

## Overview

TRACE features a purpose-built, client-side tree-walking interpreter designed to execute algorithmic code (such as LeetCode, HackerRank, and Codeforces problems) step-by-step while emitting granular execution snapshots for real-time visualization.

To maintain deterministic execution, defensive safety, and instant feedback, TRACE defines an explicit language boundary: **TRACE Java Language Subset v1**.

---

## 1. Supported Features

### A. Primitive Types & Literals
- **Numeric**: `int`, `long`, `double`, `float`
- **Boolean**: `boolean` (`true`, `false`)
- **Textual**: `char`, `String`
- **Null**: `null` literal and null references

### B. Operators & Expressions
- **Arithmetic**: `+`, `-`, `*`, `/`, `%`
- **Unary**: `+`, `-`, `!`, `~`, `++`, `--` (prefix and postfix)
- **Comparisons**: `==`, `!=`, `<`, `<=`, `>`, `>=`
- **Logical (Short-Circuiting)**: `&&`, `||` (guaranteed non-evaluation of right operand when short-circuited)
- **Bitwise & Shift**: `&`, `|`, `^`, `<<`, `>>`, `>>>`
- **Compound Assignment**: `+=`, `-=`, `*=`, `/=`, `%=`, `&=`, `|=`, `<<=`, `>>=`, `>>>=`
- **Ternary**: `condition ? thenExpr : elseExpr`
- **Explicit Casting**: Primitive casts such as `(int) doubleVal`

### C. Data Structures & Collections
- **Native Arrays**: 1D and 2D arrays (`int[]`, `int[][]`, `String[]`, `new int[size]`, initializer lists `{1, 2, 3}`)
- **ArrayList**: `add(item)`, `get(index)`, `set(index, item)`, `remove(index)`, `size()`, `isEmpty()`
- **HashMap**: `put(key, val)`, `get(key)`, `containsKey(key)`, `remove(key)`, `size()`, `isEmpty()`
- **HashSet**: `add(item)`, `contains(item)`, `remove(item)`, `size()`, `isEmpty()`
- **Stack**: `push(item)`, `pop()`, `peek()`, `isEmpty()`, `size()`
- **Queue / ArrayDeque**: `offer(item)`, `poll()`, `peek()`, `isEmpty()`, `size()`
- **PriorityQueue**: Min-heap by default, custom comparator lambdas (`(a, b) -> b - a` for max-heap), `offer()`, `poll()`, `peek()`
- **StringBuilder**: `append()`, `toString()`, `length()`, `reverse()`

### D. Object-Oriented & Structural Constructs
- **Classes**: `class Solution`, user-defined classes (`class ListNode`, `class TreeNode`)
- **Fields & Methods**: Instance variables, recursive methods, constructors
- **Field Mutation & Navigation**: `node.next = new ListNode(20)`, `root.left.val`
- **Packages & Imports**: `import java.util.*;` and `package ...;` are gracefully accepted

### E. Control Flow
- **Conditionals**: `if`, `else if`, `else`
- **Loops**: `while`, `for` (counting loops), `for` (enhanced for-each over arrays and collections), `do-while`
- **Jumps**: `return`, `break`, `continue`

---

## 2. Unsupported Constructs (Explicitly Guarded)

When code contains constructs outside the algorithmic subset, TRACE halts immediately with an actionable **`UnsupportedSyntaxError`** rather than silently degrading into `null` or corrupting state:

| Java Construct | Status | Diagnostic Message / Guidance |
| :--- | :--- | :--- |
| **`try / catch / finally`** | Unsupported | *Exception handling is outside the TRACE algorithmic execution subset.* |
| **`throw / throws`** | Unsupported | *Manual exception throwing is not supported in TRACE Java Subset v1.* |
| **`switch / case / default`** | Unsupported | *Use `if / else` conditional chains for multi-way branching in TRACE.* |
| **`synchronized / volatile`** | Unsupported | *Multi-threading primitives are outside the TRACE execution subset.* |
| **`interface / enum / record`**| Unsupported | *Type definitions outside standard classes are outside the execution subset.* |
| **Java Streams API** | Unsupported | *Use imperative loops (`for`, `while`) for transparent step-by-step trace visualization.* |
| **File / Network I/O** | Unsupported | *Input is supplied deterministically via the Input panel.* |

---

## 3. Defensive Execution Limits

To prevent browser lockups or runaway computations, the runtime enforces hard execution bounds:
- **Max Steps**: `8,000` steps maximum per execution.
- **Max Call Stack Depth**: `200` frames maximum (protects runaway recursion).
- **Max Array Visualizer Length**: `50` elements displayed concurrently in visualizer cards.
