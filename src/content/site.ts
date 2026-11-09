/**
 * All of the site's text and links live here.
 * Anything marked TODO is a placeholder to replace with your real details.
 */
export const site = {
  name: "Gaurav O. Patil",
  // Name in the logo wordmark.
  logoName: "Gaurav Patil",
  initials: "GP",
  role: "AI / ML Engineer",
  headline: {
    lines: ["Building practical", "AI systems that create"],
    emphasis: "real business impact.",
  },
  description:
    "I design, build and deploy production ML systems, GenAI/RAG applications and customer intelligence solutions at scale.",

  links: {
    github: "https://github.com/SirusnakJR1872000",
    linkedin: "https://www.linkedin.com/in/gaurav-patil-yog/",
    email: "gmsd187@gmail.com",
    resume: "/resume.pdf",
  },

  stats: {
    years: { value: "3+", label: "Years in AI/ML" },
    systems: { value: "10+", label: "Production Systems" },
    expertise: { value: "GenAI · RAG · MLOps", label: "Core Expertise" },
    impact: {
      value: "Business Impact",
      label: "Uplift · Retention · Efficiency",
    },
  },

  projectsIntro: {
    eyebrow: "Projects",
    heading: { lead: "Selected works in", emphasis: "AI & ML" },
    summary:
      "A showcase of end-to-end AI/ML systems — from GenAI and RAG to customer intelligence and predictive modeling.",
  },

  /*
   * The first project starts as the big green card. Clicking any other card
   * expands it into that spot. Projects without stats skip that row.
   * Stat `icon`: "target", "zap", "shield", "layers" or "search".
   * `art` picks the animated illustration: "doc", "bars", "chat" or "flag".
   */
  projects: {
    badge: "Featured Project",
    items: [
      {
        id: "clinical",
        title: "Clinical AI – Patient Summary Engine",
        titleLines: ["Clinical AI –", "Patient Summary Engine"],
        description:
          "LLM-powered system for generating structured clinical summaries with domain guardrails, safety checks, and RAG.",
        stats: [
          {
            value: "90%",
            label: "Valid output rate",
            note: "",
            icon: "target",
          },
          { value: "6×", label: "Faster", note: "summarization", icon: "zap" },
          {
            value: "100%",
            label: "Rule coverage",
            note: "(R1 – R22)",
            icon: "shield",
          },
        ],
        tags: ["LLM", "RAG", "Claude", "Python"],
        href: "#", // TODO: case study URL
        art: "doc",
      },
      {
        id: "customer",
        title: "Customer Intelligence Pipeline",
        description:
          "End-to-end ML pipeline for customer analytics (buy propensity, next-best product, churn) with feature engineering and rule-based logic.",
        stats: [
          {
            value: "30%",
            label: "Targeting efficiency",
            note: "(~20–30% uplift)",
            icon: "target",
          },
          {
            value: "20+",
            label: "Behavioral",
            note: "signals",
            icon: "layers",
          },
          {
            value: "3",
            label: "Predictions",
            note: "(propensity, product, timing)",
            icon: "zap",
          },
        ],
        tags: ["XGBoost", "scikit-learn", "Pandas", "AWS"],
        href: "#", // TODO: case study, demo or repo URL
        art: "bars",
      },
      {
        id: "rag",
        title: "RAG – Intelligent Knowledge Assistant",
        description:
          "Hybrid RAG pipeline with deterministic lookup and contextual query rewriting for high-accuracy, low-hallucination responses.",
        stats: [
          {
            value: "30%",
            label: "Technical accuracy",
            note: "",
            icon: "target",
          },
          {
            value: "35%",
            label: "Retrieval",
            note: "precision",
            icon: "search",
          },
          {
            value: "40%",
            label: "Fewer tokens",
            note: "(state manager)",
            icon: "zap",
          },
        ],
        tags: ["LangChain", "FAISS", "Gemini", "Python"],
        href: "#", // TODO: case study, demo or repo URL
        art: "chat",
      },
      {
        id: "f1",
        title: "F1 Prediction Engine",
        description:
          "Learning-to-Rank model to predict race finish order using race features, historical performance, and circuit context.",
        stats: [], // TODO: add results, e.g. ranking accuracy
        tags: ["XGBoost", "Flask", "Jolpica API", "OpenF1"],
        href: "#", // TODO: case study, demo or repo URL
        art: "flag",
      },
    ] as Project[],
  },

  about: {
    eyebrow: "About me",
    heading: { lead: "Two Sides of", emphasis: "Me" },
    summary:
      "I’m an AI engineer who loves building real-world systems with data and GenAI — and an equally curious person who finds balance in travel, music, motorsports, and the little things that keep me creative and grounded.",
    portrait: {
      src: "/images/gaurav-portrait.webp",
      alt: "Gaurav Patil smiling, arms crossed",
    },
    // Item `icon`: layers, bars, gear, shield, plane, music, flag, camera.
    professional: {
      eyebrow: "The Professional",
      title: "AI Engineer & Builder",
      summary:
        "I design, build, and ship production-grade AI systems that turn data into real business impact.",
      items: [
        {
          title: "GenAI & RAG Systems",
          detail: "LLMs, agentic workflows and knowledge systems",
          icon: "layers",
        },
        {
          title: "Applied Machine Learning",
          detail: "Churn, next-best-product, uplift & customer intelligence",
          icon: "bars",
        },
        {
          title: "MLOps & Production",
          detail: "Scalable, reliable and cost-efficient AI deployments",
          icon: "gear",
        },
        {
          title: "Domain AI Solutions",
          detail: "Marketing, retail and clinical AI with guardrails",
          icon: "shield",
        },
      ],
    },
    personal: {
      eyebrow: "The Personal",
      title: "A Curious Explorer",
      summary:
        "Beyond code and models, I’m a traveler, a music lover, and a motorsport fanatic who finds inspiration in experiences, not just datasets.",
      items: [
        {
          title: "Travel",
          detail: "Exploring new places, cultures and food",
          icon: "plane",
        },
        {
          title: "Music",
          detail: "Curating playlists for every mood and moment",
          icon: "music",
        },
        {
          title: "Motorsports",
          detail: "A big F1 fan — strategy, speed and engineering",
          icon: "flag",
        },
        {
          title: "Photography",
          detail: "Capturing journeys, streets and scenery",
          icon: "camera",
        },
      ],
    },
    // Stat `icon`: calendar, layers, users, rocket.
    glance: {
      label: "At a Glance",
      stats: [
        { value: "3+ Years", label: "Building AI solutions", icon: "calendar" },
        { value: "10+", label: "Production systems", icon: "layers" },
        { value: "2+", label: "Domains (Retail, Clinical)", icon: "users" },
        {
          value: "Always Learning",
          label: "New models, tools and ideas",
          icon: "rocket",
        },
      ],
    },
  },

  experienceIntro: {
    eyebrow: "Experience",
    heading: {
      lead: "A journey of building",
      emphasis: "production-grade AI systems",
    },
    summary:
      "Across product companies, startups, and research, I’ve designed and shipped ML and GenAI solutions that drive real business impact.",
  },

  /*
   * Shown in this order. The first three also appear in the About diagram.
   * `work` holds the Key Work points. Give a role several groups (each with a
   * short `label` and a `title`) and the card shows a tab per group.
   * Wrap words in **double asterisks** to make them bold.
   * Empty `metrics`, `work` or `stack` lists are hidden.
   * Metric `trend` draws an up or down arrow before the label.
   */
  experience: [
    {
      company: "Comsense Technologies",
      role: "ML Engineer – GenAI Specialist",
      period: "Dec 2025 – Present",
      location: "Pune, India",
      current: true,
      icon: "layers",
      summary:
        "Building end-to-end GenAI and ML systems for customer intelligence, identity resolution, and marketing use cases at scale.",
      metrics: [
        {
          value: "80%",
          trend: "down",
          label: "Manual verification effort",
          note: "multi-agent audit",
          icon: "trend",
        },
        {
          value: "30%",
          trend: "up",
          label: "Targeting efficiency",
          note: "customer uplift",
          icon: "layers",
        },
        {
          value: "40%",
          trend: "down",
          label: "Token usage",
          note: "with state manager",
          icon: "zap",
        },
      ],
      work: [
        {
          label: "Client ML Models",
          title: "ML Engineering – ML Models for Client",
          items: [
            "Built **MLOps inference pipelines** for Next Best Product (XGBoost multiclass, Top-3) and Omnichannel Churn (CatBoost, threshold 0.43) over PySpark-distributed Parquet ingestion with schema drift guards, OHE parity enforcement, and leakage-proof feature generation across 20+ behavioral signals.",
            "Architected **dual-layer identity resolution** using PySpark Window-based rule matching and NetworkX graph healing to consolidate fragmented retail and e-commerce identities into a single auditable Golden ID, with B2B exclusion via daily basket heuristics before scoring.",
            "Engineered a **Multi-Arm Causal Uplift engine** with dual XGBoost Treatment and Control models simulating per-customer spend across discount tiers (10–30%+), computing incremental uplift scores, and classifying customers as Incentivize, Low Impact, or Sleeping Dog using elasticity, velocity, and discount-dependency features.",
          ],
        },
        {
          label: "Internal Product",
          title: "Internal – Product for Comsense",
          items: [
            "**Architected a Distributed AI Service via MCP:** developed a FastMCP server to decouple document logic from the client, implementing a standardized Resource/Tool API for model-agnostic orchestration across an LLM-diverse stack.",
            "**Engineered an Adversarial Multi-Agent Audit Framework:** built a 2-phase asyncio pipeline to parallelize requirement extraction and automate architectural auditing; reduced manual verification effort by 80% while ensuring 100% traceability.",
            "**Optimized System Reliability with Self-Healing Pipelines:** designed a resilient extraction engine using Regex and JSON-repair to sanitize non-deterministic LLM outputs, achieving a 90% success rate for valid schema injection into core logic.",
          ],
        },
        {
          label: "RAG Pipeline",
          title: "RAG – Pipeline",
          items: [
            "Developed a **hybrid RAG pipeline** that combines LangChain and FAISS with a deterministic lookup layer, enhancing technical accuracy by 30% by eliminating hallucinations for specific project IDs.",
            "**Implemented Contextual Query Rewriting:** created a query-refinement engine with Gemini-3.0-pro to resolve ambiguous pronouns, increasing retrieval precision by 35% in multi-turn conversational sessions.",
            "**Optimized Token Efficiency:** created a Technical State Manager to summarize conversation history and monitor discussed entities, resulting in a 40% reduction in token use while retaining long-term context within a 6,000-token limit.",
          ],
        },
        {
          label: "Clinical AI",
          title: "Clinical AI – Intelligent AI System for Medical",
          items: [
            "Implemented **LLM guardrails for clinical summarization** by constraining Claude Sonnet (temperature 0) to generate only over a deterministic patient profile card, with a claim-level grounding check scoring each output line using RAG and automatically overwriting ungrounded claims with the deterministic fallback.",
            "Enforced **output-level guardrails** on Claude Sonnet's severity classifications through a post-response validation layer that strips any finding absent from the patient's chart — fabricated medications, invented dates, and unsupported lab trends are rejected pre-response, with a keyword rule classifier as fallback.",
            "Constrained **LLM prescription scoring** within a deterministic safety envelope — Claude Sonnet 4.6 returns per-drug evidence scores which a downstream rule engine overrides on allergy, duplicate, and age-based contraindication logic for the final GREEN, AMBER, or RED verdict, with unresolved drugs hard-blocked RED before any model call.",
          ],
        },
        {
          label: "Customer Intelligence",
          title:
            "Applied Machine Learning – Customer Intelligence Systems for Client",
          items: [
            "Built an **end-to-end customer intelligence pipeline** using Python, Pandas, XGBoost, and scikit-learn to predict buy propensity, next-best product, and purchase timing, improving targeting efficiency by ~20–30%.",
            "Engineered **leakage-safe behavioral features** (CLV, recency, visits, category affinity) and combined ML + rule-based logic to deliver interpretable, production-ready predictions for luxury retail.",
            "Delivered **business-driven insights** via Matplotlib/Seaborn trends, uncovering seasonality, occasion-driven demand, and demographic contribution to support inventory planning and campaign optimization.",
          ],
        },
      ],
      stack: [
        "Python",
        "PySpark",
        "XGBoost",
        "CatBoost",
        "scikit-learn",
        "NetworkX",
        "LangChain",
        "FAISS",
        "FastMCP",
        "Claude",
        "Gemini",
        "AWS",
      ],
    },
    {
      company: "Breathing.ai",
      role: "Machine Learning Engineer",
      period: "Feb 2024 – Dec 2024",
      location: "New York, NY",
      current: false,
      icon: "leaf",
      summary:
        "Trained, optimized, and deployed production ML and computer vision models, from GPU-accelerated training to automated releases on AWS.",
      metrics: [
        {
          value: "30%",
          trend: "down",
          label: "False positive rate",
          note: "XGBoost",
          icon: "target",
        },
        {
          value: "40%",
          trend: "down",
          label: "Deployment time",
          note: "CI/CD on AWS",
          icon: "clock",
        },
        {
          value: "45%",
          trend: "up",
          label: "Posture accuracy",
          note: "SWIN + EfficientNet",
          icon: "trend",
        },
      ],
      work: [
        {
          items: [
            "Optimized training and performance through **CUDA GPU acceleration**, enabling 20% more efficient batch size adjustments.",
            "Enhanced model performance with **XGBoost**, reducing false positive rates by 30% and elevating Net Promoter Score (NPS) by 10% for a dataset of over 100k entries, impacting over 500k user interactions annually.",
            "Decreased deployment time by 40% through **CI/CD pipelines for ML models on AWS** Lambda and SageMaker, reducing weekly deployment durations from 10 to 6 hours and facilitating over 12 model updates monthly.",
            "Boosted accuracy by 45% with a **posture correction platform** using OpenCV, SWIN Transformer, and EfficientNetB0 models.",
          ],
        },
      ],
      stack: [
        "Python",
        "CUDA",
        "XGBoost",
        "OpenCV",
        "Swin Transformer",
        "EfficientNet",
        "AWS Lambda",
        "SageMaker",
      ],
    },
    {
      company: "University of Illinois",
      role: "Associate Data Analyst",
      period: "Apr 2023 – Dec 2023",
      location: "Springfield, Illinois",
      current: false,
      icon: "graduation",
      summary:
        "Turned a 100k-entry dataset into automated dashboards that sped up reporting and sharpened decision-making.",
      metrics: [
        {
          value: "40%",
          trend: "down",
          label: "Reporting time",
          note: "automated dashboards",
          icon: "clock",
        },
        {
          value: "15%",
          trend: "up",
          label: "Data-driven decisions",
          note: "100k-entry dataset",
          icon: "trend",
        },
      ],
      work: [
        {
          items: [
            "Achieved a 15% improvement in data-driven decision-making and a 40% reduction in reporting time by designing **automated dashboards** using Power BI, Matplotlib, and Seaborn with a 100k-entry dataset.",
          ],
        },
      ],
      stack: ["Power BI", "Python", "Matplotlib", "Seaborn"],
    },
    {
      company: "University of Illinois",
      role: "Machine Learning Research Assistant",
      period: "Sep 2022 – Apr 2023",
      location: "", // TODO: add the location
      current: false,
      icon: "scan",
      summary:
        "Researched and deployed real-time computer vision models for object detection and classification.",
      metrics: [
        {
          value: "35%",
          trend: "up",
          label: "Recognition accuracy",
          note: "YOLOv5 + Mask R-CNN",
          icon: "target",
        },
        {
          value: "40%",
          trend: "up",
          label: "Inference speed",
          note: "ONNX + TensorRT",
          icon: "zap",
        },
      ],
      work: [
        {
          items: [
            "Developed a **computer vision model for detection and classification** using YOLOv5 and Mask R-CNN, improving recognition accuracy by 35%.",
            "Optimized **real-time inference** by deploying the model with ONNX and TensorRT, accelerating inference speed by 40% for seamless integration into an interactive application.",
          ],
        },
      ],
      stack: ["Python", "YOLOv5", "Mask R-CNN", "ONNX", "TensorRT"],
    },
    {
      company: "Reality AI Labs",
      role: "Generative AI Engineer",
      period: "Dec 2024 – Mar 2025",
      location: "New York, NY",
      current: false,
      icon: "sparkles",
      summary:
        "Built generative AI tools with LangChain, RAG, and multimodal models to grow user engagement and retention.",
      metrics: [
        {
          value: "15%",
          trend: "up",
          label: "Engagement & retention",
          note: "GenAI tools",
          icon: "users",
        },
      ],
      work: [
        {
          items: [
            "Increased user engagement and customer retention by 15% by developing **AI tools via LangChain, RAG, and Multimodal AI**.",
          ],
        },
      ],
      stack: ["LangChain", "RAG", "Multimodal AI", "Python"],
    },
    {
      company: "University of Illinois",
      role: "AI Intern",
      period: "Aug 2023 – Sep 2023",
      location: "Springfield, Illinois",
      current: false,
      icon: "bot",
      summary:
        "Built an HR chatbot that answers questions straight from internal documents.",
      metrics: [
        {
          value: "60%",
          trend: "down",
          label: "Manual query resolution time",
          note: "HR chatbot",
          icon: "clock",
        },
      ],
      work: [
        {
          items: [
            "Developed a **state-of-the-art chatbot** leveraging OpenAI's GPT-3, Pinecone for vector storage and retrieval, and Python-based web crawling to process HR documents, reducing manual query resolution time by 60%.",
          ],
        },
      ],
      stack: ["GPT-3", "Pinecone", "Python", "Web crawling"],
    },
  ] as Experience[],

  // TODO: add articles as { title, summary, href }. The section shows a
  // "coming soon" line while this is empty.
  writing: [] as { title: string; summary: string; href: string }[],
};

type Metric = {
  value: string;
  trend: "up" | "down";
  label: string;
  note: string;
  icon: "trend" | "layers" | "zap" | "target" | "clock" | "users";
};

/** A group of Key Work points. Roles with several projects get one group per project. */
type WorkGroup = { label?: string; title?: string; items: string[] };

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  current: boolean;
  icon: "layers" | "leaf" | "graduation" | "sparkles" | "scan" | "bot";
  summary: string;
  metrics: Metric[];
  work: WorkGroup[];
  stack: string[];
};

export type Project = {
  id: string;
  title: string;
  /** Optional line breaks for the title on the big card. */
  titleLines?: string[];
  description: string;
  stats: {
    value: string;
    label: string;
    note: string;
    icon: "target" | "zap" | "shield" | "layers" | "search";
  }[];
  tags: string[];
  href: string;
  art: "doc" | "bars" | "chat" | "flag";
};
