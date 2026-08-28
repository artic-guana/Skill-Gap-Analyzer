# 🎯 AI Skill-Gap Analyzer & Personalized Learning Platform

An **AI-powered career preparation and personalized learning platform**
designed to help students identify the gap between their current skills
and their desired career role.

The platform analyzes a student's **resume, GitHub profile, competitive
programming performance, technical skills, career goals, and college
placement data** to generate personalized skill assessments, career
insights, learning roadmaps, resources, and project recommendations.

Instead of learning random technologies without knowing their relevance,
students receive a structured path focused on the skills that matter for
their target career.

------------------------------------------------------------------------

## 🚀 Problem Statement

Students often struggle with questions such as:

-   What skills should I learn for my target role?
-   Are my current skills good enough?
-   Which technologies am I weak in?
-   What should I learn next?
-   Which projects should I build?
-   Which learning resources should I follow?
-   How relevant is a particular role for students from my branch?

Most learning platforms provide the **same roadmap to everyone**. This
platform first understands the student and then generates a
**personalized learning journey**.

------------------------------------------------------------------------

# ✨ Key Features

## 1. 👤 Student Profile & Onboarding

Students create their profile using information such as:

-   College branch
-   Target career role
-   GitHub profile
-   Codeforces handle
-   Resume
-   Existing technical background

## 2. 📄 AI Resume Analysis

-   PDF resume parsing
-   Technical skill extraction
-   Resume-based skill evidence
-   ATS-oriented analysis
-   Integration with skill assessment

## 3. 🐙 GitHub Profile Analysis

The platform analyzes GitHub repositories and README files to identify
practical evidence of technical skills.

It can analyze:

-   Repositories
-   README content
-   Technologies used
-   Projects built
-   Programming languages
-   Frameworks and libraries

## 4. 🧠 AI Skill Extraction

Resume and GitHub information is processed by an LLM to extract and
normalize technical skills.

Examples:

``` text
Python
JavaScript
React
FastAPI
MongoDB
SQL
Machine Learning
Git
Docker
```

## 5. 📊 AI Skill Assessment

Each identified skill can receive:

-   Skill name
-   Score
-   Proficiency level
-   Supporting evidence
-   AI-generated explanation

Example:

``` json
{
  "skill": "Python",
  "score": 65,
  "level": "Advanced",
  "evidence": [
    "Used Python for backend development",
    "Implemented data-processing projects"
  ],
  "ai_input": "The user demonstrates practical Python experience across multiple projects."
}
```

## 6. 🎯 AI-Generated Target Skills

The system dynamically determines important skills for target roles such
as:

-   Software Development Engineer
-   Data Analyst
-   Machine Learning Engineer
-   Backend Developer
-   Frontend Developer
-   Data Scientist

## 7. 🔍 Skill-Gap Analysis

Current skills are compared with target-role requirements and
categorized into:

-   **Matched Skills** --- sufficient proficiency
-   **Weak Skills** --- known but need improvement
-   **Missing Skills** --- required but not yet demonstrated

Skill aliases are normalized, for example:

``` text
JS → JavaScript
ReactJS → React
NodeJS → Node.js
Mongo → MongoDB
sklearn → scikit-learn
DSA → Data Structures and Algorithms
```

## 8. 🗺️ Personalized Learning Roadmap

Skill gaps are converted into a structured roadmap containing:

-   Skills
-   Topics
-   Subtopics
-   Learning order
-   Resources
-   Tutorials
-   Articles
-   Video lectures
-   Practice tasks

## 9. 📚 Automatic Learning Resource Discovery

The platform dynamically discovers:

-   Technical articles
-   Documentation
-   Tutorials
-   YouTube lectures

## 10. 💻 Personalized Project Recommendations

The project system can:

-   Recommend projects
-   Associate projects with required skills
-   Accept repository links
-   Analyze GitHub projects
-   Evaluate project completion/evidence
-   Connect project work with learning progress

## 11. 🏆 Competitive Programming Analysis

Codeforces integration provides additional signals for:

-   Problem-solving ability
-   Competitive programming activity
-   Algorithmic preparation
-   DSA proficiency

## 12. 🏫 College Placement Intelligence

Historical college placement data provides information such as:

-   Branch
-   Job role
-   Students selected
-   Average CTC
-   Highest CTC
-   Placement trends

## 13. 🤖 RAG-Based Placement Insights

Placement information is converted into documents and stored in a vector
database.

``` text
Student Query
      ↓
Embedding Generation
      ↓
Vector Search
      ↓
Relevant Placement Records
      ↓
LLM
      ↓
Personalized Placement Insight
```

## 14. 📈 Placement Statistics

The system can calculate:

-   Students selected
-   Average CTC
-   Highest CTC
-   Popular job roles
-   Branch-wise placement patterns
-   Placement percentage

## 15. 💡 AI Career Recommendations

Career insights combine student information, placement statistics,
historical placement data, target career information, and AI analysis.

## 16. 📊 Progress Dashboard

The dashboard includes:

-   Skill information
-   Learning progress
-   Roadmap completion
-   Activity tracking
-   Project progress
-   Contribution-style heatmap
-   Career information

## 17. ☑️ Roadmap Progress Tracking

Roadmap topics can be marked complete so the platform can track progress
and eventually adapt recommendations as the student improves.

------------------------------------------------------------------------

# 🔄 Complete Workflow

``` text
Resume ───────┐
GitHub ───────┤
Codeforces ───┤
              ▼
        Skill Extraction
              ↓
        Skill Assessment
              ↓
Target Role → Skill-Gap Analysis
              ↓
      Personalized Roadmap
              ↓
     Resources + Projects
              ↓
        Progress Tracking

College Placement Data
              ↓
          Embeddings
              ↓
           ChromaDB
              ↓
        RAG Retrieval
              ↓
       AI Career Insights
```

------------------------------------------------------------------------

# 🛠️ Technology Stack

## Frontend

-   **React** --- interactive UI and reusable components
-   **Vite** --- frontend development/build tool
-   **Tailwind CSS** --- responsive styling
-   **shadcn/ui** --- reusable UI components
-   **Lucide React** --- icons
-   **Axios** --- frontend/backend API communication

## Backend

-   **FastAPI** --- REST API backend
-   **Pydantic** --- request validation and structured models
-   **Uvicorn** --- ASGI server
-   **MongoDB** --- application data persistence

## Artificial Intelligence

-   **Mistral AI** --- LLM-powered skill extraction, assessment, roadmap
    generation, career analysis and related AI operations
-   **LangChain** --- LLM workflow orchestration and RAG integration

## Retrieval-Augmented Generation

-   **Sentence Transformers** --- semantic embeddings
-   **ChromaDB** --- vector database
-   **RAG** --- placement-data-grounded career insights

## External Services & APIs

-   **GitHub API / PyGithub** --- repository and README analysis
-   **Codeforces** --- competitive programming analysis
-   **YouTube Data API** --- video resource discovery
-   **DDGS** --- article/tutorial/resource discovery

## Document Processing

-   **pypdf** --- PDF resume text extraction

## Deployment

-   **Google Cloud Run** --- FastAPI backend deployment
-   **Cloud Build / Buildpacks** --- backend source build
-   **Vercel** --- suitable frontend deployment target

------------------------------------------------------------------------

# 🧠 RAG Pipeline

``` text
Placement CSV
     ↓
Document Conversion
     ↓
Sentence Transformer
     ↓
Embeddings
     ↓
ChromaDB
     ↓
Similarity Search
     ↓
Relevant Context
     ↓
Mistral AI
     ↓
Placement Insights
```

------------------------------------------------------------------------

# 🔐 Environment Variables

Create a `.env` file locally:

``` env
MISTRAL_API_KEY=your_mistral_api_key
YOUTUBE_API_KEY=your_youtube_api_key
GITHUB_TOKEN=your_github_token
MONGODB_URI=your_mongodb_connection_string
```

> Never commit `.env` files or API keys to GitHub.

------------------------------------------------------------------------

# ▶️ Running Locally

## 1. Clone the repository

``` bash
git clone <repository-url>
cd <repository>
```

## 2. Enter the backend

``` bash
cd Backend
```

## 3. Install dependencies

``` bash
uv sync
```

## 4. Activate the virtual environment

Windows:

``` bash
.venv\Scripts\activate
```

Linux/macOS:

``` bash
source .venv/bin/activate
```

## 5. Configure environment variables

Create `.env` and add the required API keys and database configuration.

## 6. Run FastAPI

``` bash
uvicorn app:app --reload
```

Backend:

``` text
http://localhost:8000
```

Swagger documentation:

``` text
http://localhost:8000/docs
```

------------------------------------------------------------------------

# ☁️ Google Cloud Deployment

The FastAPI backend can be deployed to Google Cloud Run directly from
source.

``` bash
gcloud run deploy skill-gap-backend --source . --region asia-south1 --allow-unauthenticated
```

The frontend communicates with the Cloud Run backend over HTTPS.

------------------------------------------------------------------------

# 🌟 What Makes the Project Different?

Traditional platforms:

``` text
Choose Career
     ↓
Generic Roadmap
```

Our approach:

``` text
Resume + GitHub + Codeforces
             ↓
       Understand Student
             ↓
      Assess Current Skills
             ↓
      Identify Skill Gaps
             ↓
     Personalized Roadmap
             ↓
    Learn + Build + Practice
             ↓
       Track Progress
```

The central question is:

> **What should this particular student learn next to move closer to
> their target career?**

rather than:

> **What should everyone learn for this career?**

------------------------------------------------------------------------

# 🎯 Target Users

-   College students
-   Placement aspirants
-   Students exploring technical careers
-   Students unsure about which skills to learn
-   Students preparing for software and data-related roles
-   Students seeking structured career preparation

------------------------------------------------------------------------

# 💡 Impact

The platform aims to help students avoid spending months learning
technologies without knowing whether those skills align with their
desired career.

It provides:

-   Personalized skill analysis
-   Identification of weak and missing skills
-   Structured learning priorities
-   Relevant learning resources
-   Practical project recommendations
-   Data-driven placement insights
-   Continuous progress tracking

**Learn the right skills, in the right order, for the right career.**

------------------------------------------------------------------------

# 🔮 Future Scope

-   Real-time job-market skill analysis
-   LinkedIn integration
-   LeetCode integration
-   AI mock interviews
-   Resume improvement recommendations
-   Job-description-based skill-gap analysis
-   Adaptive roadmap regeneration
-   AI mentor/chatbot
-   Internship recommendations
-   Peer benchmarking
-   Placement probability estimation
-   Personalized coding problem recommendations

------------------------------------------------------------------------

# 🏁 Conclusion

The **AI Skill-Gap Analyzer & Personalized Learning Platform** combines
artificial intelligence, student activity analysis, retrieval-augmented
generation, placement data, and personalized learning to create a
career-preparation system tailored to each student.

Rather than simply recommending courses, the platform attempts to
understand **where the student currently stands, where they want to go,
what they are missing, and what they should do next**.
