# 🏆 Nithin's College Placement Portal

A smart, AI-powered platform built in 22 hours to connect students, HODs, and TPOs. This project was created for the **Mastersolis Infotech 22-Hour AI Hackathon**.

 🎯 Our Mission: Problem Statement 2

We chose Problem Statement 2: College Placement Management Portal**[cite: 98]. Our goal is to build a single, reliable system that replaces messy spreadsheets and emails, making the entire campus placement process smoother for everyone involved.

 ✨ Core Features

* **Role-Based Dashboards:** Separate, secure dashboards for Students, HODs, and the Placement Officer (TPO).
* **Student Portal:** Students can register (pending HOD approval), view all available placement drives, and apply with a single click.
* **HOD Portal:** HODs can view all students from their department and approve new registrations, ensuring data quality.
* **TPO Portal:** The "mission control" for the TPO. They can create new companies, post new placement drives, and get a high-level view of all applicants.

🤖 Our AI-Powered Integrations

To meet the "Innovation & Use of AI" criteria, we're not just building a simple website. We are integrating AI directly into the workflow:

1.  AI-Generated Emails:** When a TPO updates a student's status (e.g., "Selected"), our app uses AI to generate a professional, human-sounding congratulatory email[cite: 128].
2.  AI-Assisted Résumé Parsing:** When a student uploads their resume, we use AI to parse the document, extract key skills, and make them searchable for the TPO[cite: 129].

 🛠️ Tech Stack

* **Backend:** **Flask (Python)** — Lightweight, powerful, and fast for a hackathon.
* **Database:** **SQLite** — A robust, file-based SQL database. Perfect for a project that needs to be up and running quickly with zero setup.
* **Frontend:** **HTML, CSS, JavaScript** — The classic, reliable trio.
* **AI:**
    * **Gemini API:** For generating all email content and text summaries.
    * **PyPDF2 / PDFPlumber:** For extracting raw text from uploaded resumes before sending it to the AI.


### 🚀 How to Run This Project

These are the official setup instructions required by the hackathon.

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/Nithin-genAI/nithin-placement-.git](https://github.com/Nithin-genAI/nithin-placement-.git)
    ```

2.  **Navigate to the Project Folder**
    ```bash
    cd nithin-placement-
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Application**
    * This command will first initialize the database (`placement.db`) and then start the server.
    ```bash
    python run_app.py
    ```

5.  **Open in Your Browser**
    * The app will be running at: `http://localhost:8000`

