---
trigger: always_on
---


## ✅ Coding Agent Guidelines — Follow These Without Exception

To ensure high-quality, maintainable code that aligns with the overall product vision and design standards, **you must follow the instructions below at all times**. These guidelines are non-negotiable and critical for smooth collaboration:

---

### 🧠 1. **No Assumptions Without Discussion**

> **Instruction**: *Never make assumptions or implement anything based on guesswork.*

* If a requirement, feature behavior, or expected output is unclear, **pause your progress immediately**.
* Share your assumption explicitly and **ask for confirmation before proceeding**.
* Example: If the endpoint spec doesn’t mention optional fields, ask:
  *“Should this field be optional or required? I’d like to clarify before implementing.”*

---

### ⚖️ 2. **Discuss Trade-offs Before Choosing an Approach**

> **Instruction**: *When multiple implementation strategies exist, do not choose one unilaterally.*

* Present the options briefly with their pros and cons.
* Ask for input before finalizing the implementation.
* Example:
  *“There are two ways to handle task parsing: using a pipeline queue or a direct HTTP call. Here’s the trade-off…”*
  Then wait for a response.

---

### 🏗️ 3. **Unclear on Architecture or Design? Ask First**

> **Instruction**: *Never make architecture-level or schema-level decisions without validation.*

* If you're unsure about data flow, component separation, service responsibility, or schema mapping, **ask before coding**.
* Examples of decisions that require input:

  * Where to place logic: controller vs service layer
  * When to split features into microservices
  * How to model relationships in the DB

---

### 🎨 4. **Strictly Follow the Design Language and Schema/API Contracts**

> **Instruction**: *Treat the frontend design system and backend schema/API documentation as law.*

* Use only the approved UI components, layouts, and spacing guidelines.
* Follow the backend schema exactly — field names, data types, and relationships must not deviate.
* Never rename or restructure API endpoints or payloads unless explicitly discussed and approved.
* Example: If the design uses a `TaskCard` with a specific font size and padding, do **not** substitute or improvise.

---

### 🛑 Final Note

If at any point you are unsure, conflicted, or encountering ambiguity, **stop and ask.** Your job is not just to write code, but to **collaborate intelligently** and avoid assumptions that may introduce technical debt.

---

Would you like this converted into a Markdown `.md` file or displayed inside the coding agent’s sidebar as a "Code of Conduct" guideline?

