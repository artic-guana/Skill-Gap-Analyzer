import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CodeXml,
  FileText,
  GraduationCap,
  Map,
  SearchCheck,
  Target,
} from "lucide-react"
import { Link } from "react-router-dom"
import Navbar from "../common/Navbar"
import useUserStore from "../store/useUserStore"

const workflowSteps = [
  { number: "01", icon: FileText, title: "Build your profile", description: "Add your academic details, GitHub username, Codeforces handle, and optionally your resume once during registration." },
  { number: "02", icon: BrainCircuit, title: "Analyze your skills", description: "SkillPath evaluates project evidence and competitive programming activity, then stores the result in your profile." },
  { number: "03", icon: BriefcaseBusiness, title: "Explore career paths", description: "Career recommendations are generated from your academic profile and available placement context." },
  { number: "04", icon: Target, title: "Choose a target role", description: "Select the career you actually want to pursue before generating the next stages." },
  { number: "05", icon: SearchCheck, title: "Find your skill gap", description: "Your saved skill profile is compared with AI-generated requirements for the selected role." },
  { number: "06", icon: Map, title: "Follow your roadmap", description: "A personalized roadmap is generated from your stored weak and missing skills, with resources and projects." },
  { number: "07", icon: CodeXml, title: "Prove what you learned", description: "Submit project repositories so the backend can analyze the README and store project evidence." },
]

const Home = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const primaryRoute = isAuthenticated ? "/dashboard" : "/register"

  return (
    <>
      <Navbar />
      <main className="home-shell">
        <section className="home-hero">
          <div className="home-hero-copy">
            <div className="home-badge"><GraduationCap size={15} />AI-powered career learning</div>
            <h1>Stop learning randomly.<span> Learn what your career needs.</span></h1>
            <p className="home-hero-description">SkillPath turns your academic background, project evidence, and coding activity into saved skill insights, a target-role gap analysis, and a focused roadmap.</p>
            <div className="home-actions">
              <Link to={primaryRoute} className="home-primary-button">{isAuthenticated ? "Open dashboard" : "Create my profile"}<ArrowRight size={16} /></Link>
              <Link to={isAuthenticated ? "/careers" : "/login"} className="home-secondary-button">{isAuthenticated ? "Explore careers" : "Sign in"}</Link>
            </div>
          </div>

          <div className="home-hero-panel">
            <div className="hero-panel-header"><span /><span /><span /></div>
            <div className="hero-flow">
              <div className="hero-flow-card"><CodeXml size={18} /><div><small>Evidence</small><strong>GitHub Projects</strong></div></div>
              <div className="hero-flow-card"><CodeXml size={18} /><div><small>Problem solving</small><strong>Codeforces</strong></div></div>
              <div className="hero-flow-card"><FileText size={18} /><div><small>Background</small><strong>Resume</strong></div></div>
              <div className="hero-flow-line"><span /></div>
              <div className="hero-flow-main"><BrainCircuit size={22} /><div><small>Saved analysis</small><strong>Current Skill Profile</strong></div></div>
              <div className="hero-flow-line"><span /></div>
              <div className="hero-flow-result"><div><Target size={18} /><span>Skill Gap</span></div><div><Map size={18} /><span>Roadmap</span></div></div>
            </div>
          </div>
        </section>

        <section className="home-workflow">
          <div className="home-section-heading"><div><p className="eyebrow">How it works</p><h2>From one profile to a focused learning path</h2></div><p>The backend generates each stage once, stores it in MongoDB, and your pages read the saved results instead of repeatedly calling the LLM.</p></div>
          <div className="workflow-grid">{workflowSteps.map(({ number, icon: Icon, title, description }) => <article className="workflow-card cursor-pointer" key={number}><div className="workflow-card-top"><span className="workflow-number">{number}</span><span className="workflow-icon"><Icon size={19} /></span></div><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>

        <section className="home-pipeline">
          <div className="pipeline-copy"><p className="eyebrow">DB-first pipeline</p><h2>Generate once. Reuse everywhere.</h2><p>Your saved profile becomes the source of truth for later skill-gap, roadmap, and project-analysis requests.</p></div>
          <div className="pipeline-diagram">
            <div className="pipeline-node cursor-pointer"><span>01</span><strong>Your Evidence</strong><small>Resume · GitHub · Codeforces</small></div><ArrowRight size={18} />
            <div className="pipeline-node cursor-pointer"><span>02</span><strong>MongoDB Profile</strong><small>Skills · Careers · Academic context</small></div><ArrowRight size={18} />
            <div className="pipeline-node cursor-pointer"><span>03</span><strong>Target Gap</strong><small>Matched · Weak · Missing</small></div><ArrowRight size={18} />
            <div className="pipeline-node cursor-pointer"><span>04</span><strong>Roadmap</strong><small>Learn · Practice · Build</small></div>
          </div>
        </section>

        <section className="home-cta"><div><p className="eyebrow">Start with what you already know</p><h2>Find the shortest path to your target role.</h2></div><Link to={primaryRoute} className="home-primary-button">{isAuthenticated ? "Continue learning" : "Get started"}<ArrowRight size={16} /></Link></section>
      </main>
    </>
  )
}

export default Home
