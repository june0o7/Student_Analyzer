import { useNavigate } from "react-router-dom";
import {
  FiUser, FiMail, FiCalendar, FiEdit2, FiArrowLeft,
  FiPlus, FiGithub, FiExternalLink, FiTrash2, FiMapPin, FiPhone, FiX
} from "react-icons/fi";
import { FaCrown, FaLaptopCode, FaBrain, FaPalette, FaTools } from "react-icons/fa"; // Added FaTools
import styles from "./StudentProfile.module.css";
import { useState, useEffect } from "react";
import { auth, db } from "../../Firebase_Config/firebaseConfig";
import {
  doc, getDoc, collection, addDoc, query, where, getDocs,
  deleteDoc, updateDoc, arrayUnion
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const StudentProfile = () => {
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState({
    name: "",
    email: "",
    class: "",
    studentId: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    subjects: [],
    bio: "",
    dsaPoints: null,
    dsaExamCompleted: false,
    aptitudeScores: null,
    daaScores: null,
    uiPoints: null, // General UI
    uiToolScores: null // New UI Tool Score
  });
  
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  
  // --- Project State ---
  const [projects, setProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [projectFormData, setProjectFormData] = useState({ name: "", description: "", githubUrl: "" });

  // --- Exam Modal States ---
  const [showDSAModal, setShowDSAModal] = useState(false);
  const [currentDSAQuestion, setCurrentDSAQuestion] = useState(0);
  const [dsaAnswers, setDsaAnswers] = useState({});
  const [isSubmittingDSA, setIsSubmittingDSA] = useState(false);

  const [showDAAModal, setShowDAAModal] = useState(false);
  const [currentDAAQuestion, setCurrentDAAQuestion] = useState(0);
  const [daaAnswers, setDaaAnswers] = useState({});
  const [isSubmittingDAA, setIsSubmittingDAA] = useState(false);

  const [showAptitudeModal, setShowAptitudeModal] = useState(false);
  const [currentAptitudeQuestion, setCurrentAptitudeQuestion] = useState(0);
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});
  const [isSubmittingAptitude, setIsSubmittingAptitude] = useState(false);

  const [showUIModal, setShowUIModal] = useState(false);
  const [currentUIQuestion, setCurrentUIQuestion] = useState(0);
  const [uiAnswers, setUiAnswers] = useState({});
  const [isSubmittingUI, setIsSubmittingUI] = useState(false);

  // --- UI TOOL EXAM STATES (NEW) ---
  const [showUIToolModal, setShowUIToolModal] = useState(false);
  const [uiToolStep, setUiToolStep] = useState('selection'); // 'selection' or 'exam'
  const [selectedTool, setSelectedTool] = useState(null);
  const [currentToolQuestion, setCurrentToolQuestion] = useState(0);
  const [uiToolAnswers, setUiToolAnswers] = useState({});
  const [isSubmittingTool, setIsSubmittingTool] = useState(false);

  // --- Questions Data ---
  const dsaQuestions = [
    { id: 1, question: "Which data structure follows the LIFO principle?", options: ["Queue", "Stack", "Linked List", "Tree"], correct: 1 },
    { id: 2, question: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], correct: 2 },
    { id: 3, question: "Which sorting algorithm has the best average-case time complexity?", options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"], correct: 2 },
    { id: 4, question: "In a binary search tree (BST), the left child is always?", options: ["Smaller than parent", "Larger than parent", "Same as parent", "Null"], correct: 0 },
    { id: 5, question: "Which data structure is used to implement recursion?", options: ["Queue", "Stack", "Array", "Graph"], correct: 1 }
  ];

  const daaQuestions = [
    { id: 1, question: "What is the worst-case time complexity of Merge Sort?", options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], correct: 0 },
    { id: 2, question: "Which algorithm is used to find the Shortest Path in a graph with positive edge weights?", options: ["Prim's Algorithm", "Kruskal's Algorithm", "Dijkstra's Algorithm", "Bellman-Ford"], correct: 2 },
    { id: 3, question: "Dynamic Programming is best suited for problems with which property?", options: ["Greedy Choice Property", "Overlapping Subproblems", "Disjoint Subproblems", "Linear Linearity"], correct: 1 },
    { id: 4, question: "What approach does the Knapsack Problem (Fractional) use?", options: ["Dynamic Programming", "Divide and Conquer", "Greedy Approach", "Backtracking"], correct: 2 },
    { id: 5, question: "Master Theorem is used for?", options: ["Solving recurrences", "Sorting arrays", "Searching graphs", "Memory allocation"], correct: 0 }
  ];

  const aptitudeQuestions = [
    { id: 1, question: "If a train travels 300 km in 5 hours, what is its speed?", options: ["50 km/h", "60 km/h", "65 km/h", "70 km/h"], correct: 1 },
    { id: 2, question: "What is 25% of 200?", options: ["25", "50", "75", "100"], correct: 1 },
    { id: 3, question: "If x + 5 = 12, what is the value of x?", options: ["5", "6", "7", "8"], correct: 2 },
    { id: 4, question: "Complete the series: 2, 4, 8, 16, ?", options: ["24", "32", "64", "128"], correct: 1 },
    { id: 5, question: "If all roses are flowers and some flowers fade quickly, which statement must be true?", options: ["All roses fade quickly", "Some roses fade quickly", "No roses fade quickly", "Some flowers that fade quickly are roses"], correct: 3 },
    { id: 6, question: "A is B's sister. C is B's mother. D is C's father. How is A related to D?", options: ["Granddaughter", "Grandson", "Daughter", "Sister"], correct: 0 }
  ];

  const uiQuestions = [
    { id: 1, question: "Which CSS property is used to change the text color?", options: ["font-color", "text-color", "color", "fg-color"], correct: 2 },
    { id: 2, question: "In Mobile UI design, what does 'Responsive Design' primarily aim to achieve?", options: ["Faster loading", "Adaptability to screen sizes", "Higher SEO", "Better contrast"], correct: 1 },
    { id: 3, question: "Which unit is relative to the font-size of the root element?", options: ["em", "rem", "px", "vh"], correct: 1 },
    { id: 4, question: "What does 'z-index' control?", options: ["Opacity", "Horizontal alignment", "Vertical stacking order", "Zoom"], correct: 2 },
    { id: 5, question: "Which UI framework is utility-first?", options: ["Bootstrap", "Material UI", "Tailwind CSS", "Foundation"], correct: 2 }
  ];

  // --- NEW: UI TOOL QUESTIONS ---
  const uiToolsData = {
    "Figma": [
      { id: 1, question: "Which feature allows elements to automatically resize based on their content?", options: ["Auto Layout", "Constraints", "Smart Selection", "Vector Networks"], correct: 0 },
      { id: 2, question: "What is the primary file format for saving a local copy of a Figma design?", options: [".fig", ".sketch", ".psd", ".xd"], correct: 0 },
      { id: 3, question: "Figma is primarily known for being:", options: ["Offline-only", "Web-based & Real-time collaborative", "Windows-only", "Raster-based"], correct: 1 }
    ],
    "Adobe XD": [
      { id: 1, question: "Which feature allows you to replicate a group of elements vertically or horizontally?", options: ["Content Aware Layout", "Repeat Grid", "Smart Animate", "Stacks"], correct: 1 },
      { id: 2, question: "Adobe XD integrates most seamlessly with:", options: ["Sketch", "Figma", "Photoshop & Illustrator", "CorelDraw"], correct: 2 },
      { id: 3, question: "Can you preview mobile prototypes directly on a device using the XD app?", options: ["Yes, via USB or Cloud", "No, only on desktop", "Yes, but only offline", "No, requires third-party tools"], correct: 0 }
    ],
    "Sketch": [
      { id: 1, question: "Sketch is essentially native to which operating system?", options: ["Windows", "macOS", "Linux", "Android"], correct: 1 },
      { id: 2, question: "What are reusable UI components called in Sketch?", options: ["Components", "Symbols", "Assets", "Prefabs"], correct: 1 },
      { id: 3, question: "Sketch is primarily a ___ based design tool.", options: ["Raster", "Vector", "3D", "Code"], correct: 1 }
    ],
    "InVision": [
      { id: 1, question: "What is InVision's digital whiteboard tool called?", options: ["Freehand", "Whiteboard", "Draw", "Sketchpad"], correct: 0 },
      { id: 2, question: "InVision is best known for enhancing:", options: ["Photo Editing", "Prototyping & Collaboration", "3D Modeling", "Video Editing"], correct: 1 },
      { id: 3, question: "Which tool allows you to create a design system in InVision?", options: ["DSM (Design System Manager)", "Library", "Style Guide", "Assets Panel"], correct: 0 }
    ],
    "Framer": [
      { id: 1, question: "Framer is highly regarded for its ability to:", options: ["Edit Photos", "Create Production-ready Code (React)", "Print Design", "Vector Illustration"], correct: 1 },
      { id: 2, question: "What is the feature called that creates complex animations between screens automatically?", options: ["Auto Animate", "Magic Motion", "Smart Transition", "Liquid Flow"], correct: 1 },
      { id: 3, question: "Framer started as a tool that required knowledge of:", options: ["Python", "CoffeeScript / JavaScript", "C++", "Swift"], correct: 1 }
    ]
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const studentDoc = await getDoc(doc(db, "students", user.uid));
          if (studentDoc.exists()) {
            const data = studentDoc.data();
            const getLastScore = (scoresArray) => (scoresArray && Array.isArray(scoresArray) && scoresArray.length > 0) ? scoresArray[scoresArray.length - 1].score : null;

            setStudentProfile({
              name: data.name || "",
              email: data.email || "",
              class: data.class || "",
              studentId: data.studentId || "",
              dateOfBirth: data.dateOfBirth || "",
              address: data.address || "",
              phone: data.phone || "",
              parentName: data.parentName || "",
              parentEmail: data.parentEmail || "",
              parentPhone: data.parentPhone || "",
              subjects: data.subjects || [],
              bio: data.bio || "",
              dsaPoints: getLastScore(data.dsaScores),
              dsaExamCompleted: data.dsaExamCompleted || false,
              aptitudeScores: getLastScore(data.aptitudeScores),
              daaScores: getLastScore(data.daaScores),
              uiPoints: getLastScore(data.uiScores), 
              uiToolScores: getLastScore(data.uiToolScores), // NEW FIELD
            });
            const requiredFields = ["name", "email", "studentId"];
            setProfileComplete(requiredFields.every((field) => data[field]));
            await fetchProjects(user.uid);
          } else {
            setProfileComplete(false);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/student-login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchProjects = async (userId) => {
    try {
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("studentId", "==", userId));
      const querySnapshot = await getDocs(q);
      const projectsList = [];
      querySnapshot.forEach((doc) => projectsList.push({ id: doc.id, ...doc.data() }));
      projectsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProjects(projectsList);
    } catch (error) { console.error("Error fetching projects:", error); }
  };

  // --- Project Handlers ---
  const handleAddProject = () => {
    setSelectedProject(null);
    setProjectFormData({ name: "", description: "", githubUrl: "" });
    setModalMode("add");
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setProjectFormData({ name: project.name, description: project.description, githubUrl: project.githubUrl });
    setModalMode("edit");
    setShowProjectModal(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    
    const meta = { ...projectFormData, studentId: user.uid, studentName: studentProfile.name, createdAt: new Date().toISOString() };
    
    try {
      if (modalMode === "add") await addDoc(collection(db, "projects"), meta);
      else await updateDoc(doc(db, "projects", selectedProject.id), projectFormData);
      
      await fetchProjects(user.uid);
      setShowProjectModal(false);
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Delete this project?")) {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  // --- General Exam Submit Logic ---
  const submitExam = async (examType, questions, answers, setSubmitting, setShowModal, setScoreState, setAnswersState, setCurrentQState) => {
    setSubmitting(true);
    let correctCount = 0;
    questions.forEach(q => { if (answers[q.id] === q.correct) correctCount++; });
    const finalScore = Math.round((correctCount / questions.length) * 100);

    try {
      const user = auth.currentUser;
      const studentRef = doc(db, "students", user.uid);
      const fieldName = examType === 'dsa' ? 'dsaScores' : 
                        examType === 'daa' ? 'daaScores' : 
                        examType === 'aptitude' ? 'aptitudeScores' : 'uiScores';
      
      await updateDoc(studentRef, {
        [fieldName]: arrayUnion({ score: finalScore, date: new Date().toISOString() })
      });

      const stateKey = examType === 'dsa' ? 'dsaPoints' : 
                       examType === 'daa' ? 'daaScores' : 
                       examType === 'aptitude' ? 'aptitudeScores' : 'uiPoints';
                       
      setScoreState(prev => ({ ...prev, [stateKey]: finalScore }));
      
      setShowModal(false);
      setCurrentQState(0);
      setAnswersState({});
      alert(`${examType.toUpperCase()} Exam Submitted! Score: ${finalScore}/100`);
    } catch (error) {
      console.error(`Error saving ${examType} score:`, error);
      alert("Failed to save result.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- NEW: UI TOOL EXAM HANDLERS ---
  const handleUIToolSelect = (toolName) => {
    setSelectedTool(toolName);
    setUiToolStep('exam');
    setCurrentToolQuestion(0);
    setUiToolAnswers({});
  };

  const submitUIToolExam = async () => {
    setIsSubmittingTool(true);
    const questions = uiToolsData[selectedTool];
    let correctCount = 0;
    questions.forEach(q => { if (uiToolAnswers[q.id] === q.correct) correctCount++; });
    const finalScore = Math.round((correctCount / questions.length) * 100);

    try {
      const user = auth.currentUser;
      const studentRef = doc(db, "students", user.uid);
      
      // Saving as 'uiToolScores'
      await updateDoc(studentRef, {
        uiToolScores: arrayUnion({ 
          score: finalScore, 
          tool: selectedTool,
          date: new Date().toISOString() 
        })
      });

      setStudentProfile(prev => ({ ...prev, uiToolScores: finalScore }));
      setShowUIToolModal(false);
      setUiToolStep('selection');
      setSelectedTool(null);
      setUiToolAnswers({});
      alert(`${selectedTool} Exam Submitted! Score: ${finalScore}/100`);
    } catch (error) {
      console.error("Error saving UI Tool score:", error);
      alert("Failed to save result.");
    } finally {
      setIsSubmittingTool(false);
    }
  };


  if (loading) return <div className={styles.loadingContainer}><p>Loading profile...</p></div>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileContentWrapper}>
        <div className={styles.profileBanner}></div>
        <button className={styles.backButton} onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>

        {!profileComplete ? (
          <div className={styles.incompleteProfile}>
            <h1>Complete Your Profile</h1>
            <p>Your profile is incomplete. Please add details to continue.</p>
            <button className={styles.completeProfileButton} onClick={() => navigate("/student-form")}><FiEdit2 /> Fill Details</button>
          </div>
        ) : (
          <>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>{studentProfile.name.charAt(0)}</div>
              <div className={styles.headerInfo}>
                <h1>{studentProfile.name}</h1>
                <p>{studentProfile.class} • {studentProfile.studentId}</p>
                <div className={styles.miniStats}><span><FiMapPin /> {studentProfile.address || "Location N/A"}</span></div>
              </div>
              <button className={styles.editProfileButton} onClick={() => navigate("/student-form")}><FiEdit2 /> Edit Profile</button>
            </div>

            <div className={styles.mainContentGrid}>
              <div className={styles.leftColumn}>
                <div className={styles.infoCard}>
                  <h3>Personal Info</h3>
                  <div className={styles.infoRow}><FiMail className={styles.icon}/> <span>{studentProfile.email}</span></div>
                  <div className={styles.infoRow}><FiPhone className={styles.icon}/> <span>{studentProfile.phone || "N/A"}</span></div>
                  <div className={styles.infoRow}><FiCalendar className={styles.icon}/> <span>{studentProfile.dateOfBirth || "N/A"}</span></div>
                  <h3 className={styles.subHeader}>Guardian</h3>
                  <div className={styles.infoRow}><FiUser className={styles.icon}/> <span>{studentProfile.parentName || "N/A"}</span></div>
                  <div className={styles.infoRow}><FiPhone className={styles.icon}/> <span>{studentProfile.parentPhone || "N/A"}</span></div>
                </div>
                <div className={styles.infoCard}>
                  <h3>Subjects</h3>
                  <div className={styles.subjectsContainer}>
                    {studentProfile.subjects.length > 0 ? studentProfile.subjects.map((sub, i) => <span key={i} className={styles.subjectBadge}>{sub}</span>) : <p className={styles.textMuted}>No subjects added</p>}
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <h3>About Me</h3>
                  <p className={styles.bioText}>{studentProfile.bio || "No bio available."}</p>
                </div>
              </div>

              <div className={styles.rightColumn}>
                <h2 className={styles.sectionTitle}>Skill Assessments</h2>
                <div className={styles.examGrid}>
                  {/* DSA Card */}
                  <div className={`${styles.examCard} ${styles.dsaCard}`}>
                    <div className={styles.examIcon}><FaLaptopCode /></div>
                    <div className={styles.examInfo}><h4>DSA</h4><span className={styles.examScore}>{studentProfile.dsaPoints ?? 0}<small>/100</small></span></div>
                    <button className={styles.examBtn} onClick={() => setShowDSAModal(true)}>{studentProfile.dsaPoints !== null ? "Retake Exam" : "Start Exam"}</button>
                  </div>
                  {/* DAA Card */}
                  <div className={`${styles.examCard} ${styles.daaCard}`}>
                    <div className={styles.examIcon}><FaCrown /></div>
                    <div className={styles.examInfo}><h4>DAA</h4><span className={styles.examScore}>{studentProfile.daaScores ?? 0}<small>/100</small></span></div>
                    <button className={styles.examBtn} onClick={() => setShowDAAModal(true)}>{studentProfile.daaScores !== null ? "Retake Exam" : "Start Exam"}</button>
                  </div>
                  {/* Aptitude Card */}
                  <div className={`${styles.examCard} ${styles.aptitudeCard}`}>
                    <div className={styles.examIcon}><FaBrain /></div>
                    <div className={styles.examInfo}><h4>Aptitude</h4><span className={styles.examScore}>{studentProfile.aptitudeScores ?? 0}<small>/100</small></span></div>
                    <button className={styles.examBtn} onClick={() => setShowAptitudeModal(true)}>{studentProfile.aptitudeScores !== null ? "Retake Exam" : "Start Exam"}</button>
                  </div>
                  {/* UI Points Card */}
                  <div className={`${styles.examCard} ${styles.uiCard}`}>
                    <div className={styles.examIcon}><FaPalette /></div>
                    <div className={styles.examInfo}><h4>UI Points</h4><span className={styles.examScore}>{studentProfile.uiPoints ?? 0}<small>/100</small></span></div>
                    <button className={styles.examBtn} onClick={() => setShowUIModal(true)}>{studentProfile.uiPoints !== null ? "Retake Exam" : "Start Exam"}</button>
                  </div>
                  {/* NEW UI TOOL CARD */}
                  <div className={`${styles.examCard} ${styles.uiToolCard}`}>
                    <div className={styles.examIcon}><FaTools /></div>
                    <div className={styles.examInfo}><h4>UI Tools</h4><span className={styles.examScore}>{studentProfile.uiToolScores ?? 0}<small>/100</small></span></div>
                    <button className={styles.examBtn} onClick={() => { setShowUIToolModal(true); setUiToolStep('selection'); }}>{studentProfile.uiToolScores !== null ? "Retake Exam" : "Select Tool"}</button>
                  </div>
                </div>

                <div className={styles.projectsHeader}>
                  <h2 className={styles.sectionTitle}>Projects</h2>
                  <button className={styles.addProjectBtn} onClick={handleAddProject}><FiPlus /> Add New</button>
                </div>

                <div className={styles.projectsContainer}>
                  {projects.length > 0 ? projects.map(project => (
                    <div key={project.id} className={styles.projectCard}>
                      <div className={styles.projectMain}>
                        <div className={styles.projectIconBox}><FiGithub /></div>
                        <div><h4>{project.name}</h4><p>{project.description}</p></div>
                      </div>
                      <div className={styles.projectActions}>
                        <button onClick={() => window.open(project.githubUrl, '_blank')}><FiExternalLink /></button>
                        <button onClick={() => handleEditProject(project)}><FiEdit2 /></button>
                        <button className={styles.deleteBtn} onClick={() => handleDeleteProject(project.id)}><FiTrash2 /></button>
                      </div>
                    </div>
                  )) : <div className={styles.emptyState}><p>No projects yet. Add your first one!</p></div>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- DSA MODAL --- */}
      {showDSAModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.dsaModalContent}>
            <div className={styles.modalHeader}><h2>DSA Exam</h2><button className={styles.closeBtn} onClick={() => setShowDSAModal(false)}><FiX /></button></div>
            <div className={styles.questionContainer}>
              <div className={styles.questionTracker}>Q {currentDSAQuestion + 1} of {dsaQuestions.length}</div>
              <h3 className={styles.questionText}>{dsaQuestions[currentDSAQuestion].question}</h3>
              <div className={styles.optionsList}>
                {dsaQuestions[currentDSAQuestion].options.map((opt, idx) => (
                  <label key={idx} className={`${styles.optionLabel} ${dsaAnswers[dsaQuestions[currentDSAQuestion].id] === idx ? styles.selectedDSA : ''}`}>
                    <input type="radio" checked={dsaAnswers[dsaQuestions[currentDSAQuestion].id] === idx} onChange={() => setDsaAnswers({...dsaAnswers, [dsaQuestions[currentDSAQuestion].id]: idx})} /> {opt}
                  </label>
                ))}
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.prevBtn} disabled={currentDSAQuestion === 0} onClick={() => setCurrentDSAQuestion(c => c - 1)}>Previous</button>
                {currentDSAQuestion < dsaQuestions.length - 1 ? <button className={styles.nextDSABtn} onClick={() => setCurrentDSAQuestion(c => c + 1)}>Next</button> : <button className={styles.submitDSABtn} onClick={() => submitExam('dsa', dsaQuestions, dsaAnswers, setIsSubmittingDSA, setShowDSAModal, setStudentProfile, setDsaAnswers, setCurrentDSAQuestion)} disabled={isSubmittingDSA}>Submit</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DAA MODAL --- */}
      {showDAAModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.daaModalContent}>
            <div className={styles.modalHeader}><h2>DAA Exam</h2><button className={styles.closeBtn} onClick={() => setShowDAAModal(false)}><FiX /></button></div>
            <div className={styles.questionContainer}>
              <div className={styles.questionTracker}>Q {currentDAAQuestion + 1} of {daaQuestions.length}</div>
              <h3 className={styles.questionText}>{daaQuestions[currentDAAQuestion].question}</h3>
              <div className={styles.optionsList}>
                {daaQuestions[currentDAAQuestion].options.map((opt, idx) => (
                  <label key={idx} className={`${styles.optionLabel} ${daaAnswers[daaQuestions[currentDAAQuestion].id] === idx ? styles.selectedDAA : ''}`}>
                    <input type="radio" checked={daaAnswers[daaQuestions[currentDAAQuestion].id] === idx} onChange={() => setDaaAnswers({...daaAnswers, [daaQuestions[currentDAAQuestion].id]: idx})} /> {opt}
                  </label>
                ))}
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.prevBtn} disabled={currentDAAQuestion === 0} onClick={() => setCurrentDAAQuestion(c => c - 1)}>Previous</button>
                {currentDAAQuestion < daaQuestions.length - 1 ? <button className={styles.nextBtn} onClick={() => setCurrentDAAQuestion(c => c + 1)}>Next</button> : <button className={styles.submitBtn} onClick={() => submitExam('daa', daaQuestions, daaAnswers, setIsSubmittingDAA, setShowDAAModal, setStudentProfile, setDaaAnswers, setCurrentDAAQuestion)} disabled={isSubmittingDAA}>Submit</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- APTITUDE MODAL --- */}
      {showAptitudeModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.aptitudeModalContent}>
            <div className={styles.modalHeader}><h2>Aptitude Exam</h2><button className={styles.closeBtn} onClick={() => setShowAptitudeModal(false)}><FiX /></button></div>
            <div className={styles.questionContainer}>
              <div className={styles.questionTracker}>Q {currentAptitudeQuestion + 1} of {aptitudeQuestions.length}</div>
              <h3 className={styles.questionText}>{aptitudeQuestions[currentAptitudeQuestion].question}</h3>
              <div className={styles.optionsList}>
                {aptitudeQuestions[currentAptitudeQuestion].options.map((opt, idx) => (
                  <label key={idx} className={`${styles.optionLabel} ${aptitudeAnswers[aptitudeQuestions[currentAptitudeQuestion].id] === idx ? styles.selectedAptitude : ''}`}>
                    <input type="radio" checked={aptitudeAnswers[aptitudeQuestions[currentAptitudeQuestion].id] === idx} onChange={() => setAptitudeAnswers({...aptitudeAnswers, [aptitudeQuestions[currentAptitudeQuestion].id]: idx})} /> {opt}
                  </label>
                ))}
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.prevBtn} disabled={currentAptitudeQuestion === 0} onClick={() => setCurrentAptitudeQuestion(c => c - 1)}>Previous</button>
                {currentAptitudeQuestion < aptitudeQuestions.length - 1 ? <button className={styles.nextAptitudeBtn} onClick={() => setCurrentAptitudeQuestion(c => c + 1)}>Next</button> : <button className={styles.submitAptitudeBtn} onClick={() => submitExam('aptitude', aptitudeQuestions, aptitudeAnswers, setIsSubmittingAptitude, setShowAptitudeModal, setStudentProfile, setAptitudeAnswers, setCurrentAptitudeQuestion)} disabled={isSubmittingAptitude}>Submit</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- UI POINTS MODAL --- */}
      {showUIModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.uiModalContent}>
            <div className={styles.modalHeader}><h2>UI/UX Points Exam</h2><button className={styles.closeBtn} onClick={() => setShowUIModal(false)}><FiX /></button></div>
            <div className={styles.questionContainer}>
              <div className={styles.questionTracker}>Q {currentUIQuestion + 1} of {uiQuestions.length}</div>
              <h3 className={styles.questionText}>{uiQuestions[currentUIQuestion].question}</h3>
              <div className={styles.optionsList}>
                {uiQuestions[currentUIQuestion].options.map((opt, idx) => (
                  <label key={idx} className={`${styles.optionLabel} ${uiAnswers[uiQuestions[currentUIQuestion].id] === idx ? styles.selectedUI : ''}`}>
                    <input type="radio" checked={uiAnswers[uiQuestions[currentUIQuestion].id] === idx} onChange={() => setUiAnswers({...uiAnswers, [uiQuestions[currentUIQuestion].id]: idx})} /> {opt}
                  </label>
                ))}
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.prevBtn} disabled={currentUIQuestion === 0} onClick={() => setCurrentUIQuestion(c => c - 1)}>Previous</button>
                {currentUIQuestion < uiQuestions.length - 1 ? <button className={styles.nextUIBtn} onClick={() => setCurrentUIQuestion(c => c + 1)}>Next</button> : <button className={styles.submitUIBtn} onClick={() => submitExam('ui', uiQuestions, uiAnswers, setIsSubmittingUI, setShowUIModal, setStudentProfile, setUiAnswers, setCurrentUIQuestion)} disabled={isSubmittingUI}>Submit</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW UI TOOLS MODAL --- */}
      {showUIToolModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.uiToolModalContent}>
            
            {/* STEP 1: TOOL SELECTION */}
            {uiToolStep === 'selection' && (
              <>
                <div className={styles.modalHeader}><h2>Select UI Tool</h2><button className={styles.closeBtn} onClick={() => setShowUIToolModal(false)}><FiX /></button></div>
                <p className={styles.toolSelectSub}>Choose a tool to test your knowledge.</p>
                <div className={styles.toolGrid}>
                  {Object.keys(uiToolsData).map((tool) => (
                    <button key={tool} className={styles.toolBtn} onClick={() => handleUIToolSelect(tool)}>
                      {tool}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* STEP 2: EXAM */}
            {uiToolStep === 'exam' && (
              <>
                <div className={styles.modalHeader}><h2>{selectedTool} Exam</h2><button className={styles.closeBtn} onClick={() => setShowUIToolModal(false)}><FiX /></button></div>
                <div className={styles.questionContainer}>
                  <div className={styles.questionTracker}>Q {currentToolQuestion + 1} of {uiToolsData[selectedTool].length}</div>
                  <h3 className={styles.questionText}>{uiToolsData[selectedTool][currentToolQuestion].question}</h3>
                  <div className={styles.optionsList}>
                    {uiToolsData[selectedTool][currentToolQuestion].options.map((opt, idx) => (
                      <label key={idx} className={`${styles.optionLabel} ${uiToolAnswers[uiToolsData[selectedTool][currentToolQuestion].id] === idx ? styles.selectedUITool : ''}`}>
                        <input 
                          type="radio" 
                          checked={uiToolAnswers[uiToolsData[selectedTool][currentToolQuestion].id] === idx} 
                          onChange={() => setUiToolAnswers({...uiToolAnswers, [uiToolsData[selectedTool][currentToolQuestion].id]: idx})} 
                        /> 
                        {opt}
                      </label>
                    ))}
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.prevBtn} disabled={currentToolQuestion === 0} onClick={() => setCurrentToolQuestion(c => c - 1)}>Previous</button>
                    {currentToolQuestion < uiToolsData[selectedTool].length - 1 ? (
                      <button className={styles.nextUIToolBtn} onClick={() => setCurrentToolQuestion(c => c + 1)}>Next</button>
                    ) : (
                      <button className={styles.submitUIToolBtn} onClick={submitUIToolExam} disabled={isSubmittingTool}>Submit</button>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* --- PROJECT MODAL --- */}
      {showProjectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.projectModalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.projectModalTitle}>
                {modalMode === 'add' ? '✨ Add New Project' : '✏️ Edit Project'}
              </h2>
              <button className={styles.closeBtn} onClick={() => setShowProjectModal(false)}><FiX /></button>
            </div>
            
            <form onSubmit={handleSaveProject} className={styles.projectForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project Name</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({...projectFormData, name: e.target.value})}
                  required
                  placeholder="e.g. AI Chatbot"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea 
                  className={styles.formTextarea} 
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                  required
                  placeholder="What does this project do?"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>GitHub URL</label>
                <div className={styles.inputWrapper}>
                  <FiGithub className={styles.inputIcon} />
                  <input 
                    type="url" 
                    className={`${styles.formInput} ${styles.hasIcon}`} 
                    value={projectFormData.githubUrl}
                    onChange={(e) => setProjectFormData({...projectFormData, githubUrl: e.target.value})}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.prevBtn} onClick={() => setShowProjectModal(false)}>Cancel</button>
                <button type="submit" className={styles.saveProjectBtn}>{modalMode === 'add' ? 'Create Project' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;