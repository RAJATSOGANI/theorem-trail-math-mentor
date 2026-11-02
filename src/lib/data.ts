export type Lesson = { id: string; title: string; summary: string; formula?: string };
export type Course = { id: string; title: string; level: string; exams: ("GATE" | "IIT JAM")[]; blurb: string; lessons: Lesson[] };

export const COURSES: Course[] = [
  {
    id: "calculus", title: "Calculus", level: "Core", exams: ["GATE", "IIT JAM"],
    blurb: "Limits, continuity, differentiation, integration and multivariable calculus.",
    lessons: [
      { id: "limits", title: "Limits & Continuity", summary: "ε–δ definition, L'Hôpital's rule and standard limits.", formula: "\\lim_{x\\to0}\\frac{\\sin x}{x}=1" },
      { id: "derivatives", title: "Differentiation", summary: "Chain rule, implicit differentiation, mean value theorems.", formula: "f'(c)=\\frac{f(b)-f(a)}{b-a}" },
      { id: "integration", title: "Definite Integrals", summary: "Riemann sums, properties, improper integrals.", formula: "\\int_0^\\infty e^{-x^2}dx=\\frac{\\sqrt\\pi}{2}" },
      { id: "multivar", title: "Multivariable Calculus", summary: "Partial derivatives, Jacobians, maxima & minima.", formula: "\\nabla f=(f_x,f_y,f_z)" },
    ],
  },
  {
    id: "linear-algebra", title: "Linear Algebra", level: "Core", exams: ["GATE", "IIT JAM"],
    blurb: "Vector spaces, linear maps, eigenvalues and diagonalisation.",
    lessons: [
      { id: "vector-spaces", title: "Vector Spaces", summary: "Subspaces, span, basis and dimension.", formula: "\\dim(U+W)=\\dim U+\\dim W-\\dim(U\\cap W)" },
      { id: "rank", title: "Rank & Nullity", summary: "Row reduction and the rank–nullity theorem.", formula: "\\text{rank}(T)+\\text{nullity}(T)=n" },
      { id: "eigen", title: "Eigenvalues", summary: "Characteristic polynomial, Cayley–Hamilton.", formula: "\\det(A-\\lambda I)=0" },
    ],
  },
  {
    id: "real-analysis", title: "Real Analysis", level: "Advanced", exams: ["IIT JAM"],
    blurb: "Sequences, series, uniform convergence and metric spaces.",
    lessons: [
      { id: "sequences", title: "Sequences", summary: "Monotone convergence, Cauchy sequences, Bolzano–Weierstrass.", formula: "\\left(1+\\frac1n\\right)^n\\to e" },
      { id: "series", title: "Series Tests", summary: "Ratio, root, comparison and alternating series tests.", formula: "\\sum\\frac1{n^p}\\text{ converges iff }p>1" },
      { id: "uniform", title: "Uniform Convergence", summary: "Weierstrass M-test and interchange of limits." },
    ],
  },
  {
    id: "differential-equations", title: "Differential Equations", level: "Core", exams: ["GATE", "IIT JAM"],
    blurb: "First-order ODEs, linear ODEs with constant coefficients, PDE basics.",
    lessons: [
      { id: "first-order", title: "First-order ODEs", summary: "Separable, exact and linear equations.", formula: "y'+P(x)y=Q(x)" },
      { id: "higher-order", title: "Higher-order Linear ODEs", summary: "Characteristic equation, undetermined coefficients.", formula: "ay''+by'+cy=0" },
      { id: "laplace", title: "Laplace Transform", summary: "Transforms, inverse transforms and IVPs.", formula: "\\mathcal{L}\\{f'\\}=sF(s)-f(0)" },
    ],
  },
  {
    id: "probability", title: "Probability & Statistics", level: "Core", exams: ["GATE"],
    blurb: "Random variables, distributions, expectation and hypothesis testing.",
    lessons: [
      { id: "basics", title: "Probability Basics", summary: "Bayes' theorem and conditional probability.", formula: "P(A|B)=\\frac{P(B|A)P(A)}{P(B)}" },
      { id: "distributions", title: "Distributions", summary: "Binomial, Poisson, Normal and Exponential.", formula: "P(X=k)=\\frac{e^{-\\lambda}\\lambda^k}{k!}" },
    ],
  },
  {
    id: "group-theory", title: "Abstract Algebra", level: "Advanced", exams: ["IIT JAM"],
    blurb: "Groups, subgroups, cyclic groups, homomorphisms and rings.",
    lessons: [
      { id: "groups", title: "Groups & Subgroups", summary: "Axioms, Lagrange's theorem, cosets.", formula: "|G|=[G:H]\\,|H|" },
      { id: "cyclic", title: "Cyclic Groups", summary: "Generators and Euler's totient.", formula: "\\#\\text{generators of }\\mathbb Z_n=\\varphi(n)" },
    ],
  },
];

export type Question = { q: string; options: string[]; answer: number; explain: string };
export type Quiz = { id: string; title: string; topic: string; exam: "GATE" | "IIT JAM" | "Practice"; minutes: number; questions: Question[] };

export const QUIZZES: Quiz[] = [
  {
    id: "calc-basics", title: "Limits & Derivatives", topic: "Calculus", exam: "Practice", minutes: 8,
    questions: [
      { q: "$\\lim_{x\\to0}\\frac{1-\\cos x}{x^2}$ equals", options: ["$0$", "$\\tfrac12$", "$1$", "$2$"], answer: 1, explain: "Using $1-\\cos x\\approx x^2/2$." },
      { q: "If $f(x)=x^x$, then $f'(1)$ is", options: ["$0$", "$1$", "$e$", "$2$"], answer: 1, explain: "$f'(x)=x^x(\\ln x+1)$, so $f'(1)=1$." },
      { q: "$\\int_0^1 x e^{x}\\,dx$ equals", options: ["$1$", "$e-1$", "$e$", "$2-e$"], answer: 0, explain: "By parts: $[xe^x-e^x]_0^1=1$." },
      { q: "The function $|x|$ at $x=0$ is", options: ["Differentiable", "Not continuous", "Continuous, not differentiable", "Neither"], answer: 2, explain: "Left and right derivatives are $-1$ and $1$." },
    ],
  },
  {
    id: "la-gate", title: "GATE: Linear Algebra Sprint", topic: "Linear Algebra", exam: "GATE", minutes: 10,
    questions: [
      { q: "Eigenvalues of $\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ are", options: ["$1,3$", "$2,2$", "$0,4$", "$-1,3$"], answer: 0, explain: "$\\lambda^2-4\\lambda+3=0$." },
      { q: "Rank of a $4\\times4$ matrix with determinant $5$ is", options: ["$1$", "$2$", "$3$", "$4$"], answer: 3, explain: "Non-zero determinant ⇒ full rank." },
      { q: "If $A^2=A$ and $A\\ne I$, then $\\det A$ is", options: ["$1$", "$0$", "$-1$", "$2$"], answer: 1, explain: "$\\det(A)^2=\\det A$, and $A\\ne I$ idempotent is singular." },
      { q: "Trace of a matrix equals", options: ["Product of eigenvalues", "Sum of eigenvalues", "Largest eigenvalue", "Rank"], answer: 1, explain: "Trace = sum of eigenvalues." },
    ],
  },
  {
    id: "jam-analysis", title: "IIT JAM: Real Analysis", topic: "Real Analysis", exam: "IIT JAM", minutes: 10,
    questions: [
      { q: "$\\sum_{n=1}^\\infty \\frac{1}{n\\ln^2 n}$ (from $n=2$)", options: ["Diverges", "Converges", "Oscillates", "Equals 1"], answer: 1, explain: "Integral test: $\\int \\frac{dx}{x\\ln^2x}$ is finite." },
      { q: "Every bounded monotone sequence of reals", options: ["Diverges", "Converges", "Is constant", "Is Cauchy only if increasing"], answer: 1, explain: "Monotone convergence theorem." },
      { q: "$f_n(x)=x^n$ on $[0,1]$ converges", options: ["Uniformly", "Pointwise, not uniformly", "Nowhere", "Uniformly to 0"], answer: 1, explain: "Limit is discontinuous, so not uniform." },
    ],
  },
  {
    id: "ode-gate", title: "GATE: Differential Equations", topic: "Differential Equations", exam: "GATE", minutes: 8,
    questions: [
      { q: "Solution of $y''+y=0$ is", options: ["$Ae^x+Be^{-x}$", "$A\\cos x+B\\sin x$", "$(A+Bx)e^x$", "$Ax+B$"], answer: 1, explain: "Roots $\\pm i$." },
      { q: "Integrating factor of $y'+\\frac{y}{x}=x$ is", options: ["$x$", "$e^x$", "$\\frac1x$", "$\\ln x$"], answer: 0, explain: "$e^{\\int dx/x}=x$." },
      { q: "$\\mathcal{L}\\{e^{at}\\}$ is", options: ["$\\frac1{s+a}$", "$\\frac1{s-a}$", "$\\frac{a}{s^2+a^2}$", "$\\frac{s}{s^2-a^2}$"], answer: 1, explain: "Standard transform, $s>a$." },
    ],
  },
  {
    id: "prob-basics", title: "Probability Essentials", topic: "Probability & Statistics", exam: "Practice", minutes: 6,
    questions: [
      { q: "Mean of Poisson($\\lambda$) is", options: ["$\\lambda^2$", "$\\sqrt\\lambda$", "$\\lambda$", "$1/\\lambda$"], answer: 2, explain: "Mean and variance both equal $\\lambda$." },
      { q: "Two fair dice: $P(\\text{sum}=7)$", options: ["$\\tfrac16$", "$\\tfrac1{12}$", "$\\tfrac7{36}$", "$\\tfrac5{36}$"], answer: 0, explain: "6 favourable of 36." },
      { q: "Variance of Uniform$(0,1)$ is", options: ["$\\tfrac12$", "$\\tfrac1{12}$", "$\\tfrac13$", "$\\tfrac14$"], answer: 1, explain: "$(b-a)^2/12$." },
    ],
  },
  {
    id: "jam-algebra", title: "IIT JAM: Group Theory", topic: "Abstract Algebra", exam: "IIT JAM", minutes: 8,
    questions: [
      { q: "Number of generators of $\\mathbb{Z}_{12}$", options: ["$2$", "$4$", "$6$", "$12$"], answer: 1, explain: "$\\varphi(12)=4$." },
      { q: "A group of prime order is", options: ["Abelian but not cyclic", "Cyclic", "Non-abelian", "Trivial"], answer: 1, explain: "By Lagrange, any non-identity element generates it." },
      { q: "Order of $S_4$", options: ["$12$", "$16$", "$24$", "$4$"], answer: 2, explain: "$4!=24$." },
    ],
  },
];

export const EXAMS = [
  {
    id: "GATE" as const, name: "GATE Mathematics (MA)", date: "February 2027",
    pattern: "65 questions · 100 marks · 3 hours · MCQ, MSQ & NAT",
    syllabus: ["Calculus", "Linear Algebra", "Real Analysis", "Complex Analysis", "Differential Equations", "Probability & Statistics", "Numerical Analysis", "Abstract Algebra"],
    tips: ["Master Linear Algebra & Calculus — they carry the most weight.", "Practise NAT questions with a virtual calculator.", "Negative marking applies only to MCQs (1/3 or 2/3)."],
  },
  {
    id: "IIT JAM" as const, name: "IIT JAM Mathematics (MA)", date: "February 2027",
    pattern: "60 questions · 100 marks · 3 hours · MCQ, MSQ & NAT",
    syllabus: ["Sequences & Series", "Real Analysis", "Linear Algebra", "Abstract Algebra", "Differential Equations", "Vector Calculus", "Multivariable Calculus"],
    tips: ["Real Analysis proofs-style intuition is key.", "Group theory questions are short — don't skip them.", "Revise standard series tests thoroughly."],
  },
];
