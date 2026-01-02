import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import styles from "./DSAExam.module.css";

const DSAExam = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState("instructions");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [userAnswers, setUserAnswers] = useState({});
  const [examStarted, setExamStarted] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state
  const [error, setError] = useState(null); // New error state

  // Sample MCQ questions
  const mcqQuestions = [
    {
      id: 1,
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "Which data structure uses LIFO principle?",
      options: ["Queue", "Stack", "Linked List", "Tree"],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: "What is the worst-case time complexity of quicksort?",
      options: ["O(n log n)", "O(n²)", "O(log n)", "O(n)"],
      correctAnswer: 1,
    },
  ];

  // Sample coding problems
  const codingProblems = [
    {
      id: 1,
      title: "Reverse a Linked List",
      description: "Write a function to reverse a singly linked list.",
      difficulty: "Medium",
      template: "function reverseLinkedList(head) {\n  // Your code here\n}",
    },
    {
      id: 2,
      title: "Two Sum",
      description:
        "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
      difficulty: "Easy",
      template: "function twoSum(nums, target) {\n  // Your code here\n}",
    },
  ];

  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examStarted) {
      handleSubmitExam();
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft, navigate]);

  // Handle initial data load or a check
  useEffect(() => {
    // Simulate an async operation like fetching data from Firebase
    const initializeExam = async () => {
      try {
        // You can fetch questions from your database here
        // For now, we'll just set loading to false after a short delay
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (e) {
        setError("Failed to load exam. Please try again.");
        setLoading(false);
      }
    };
    initializeExam();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startExam = () => {
    setExamStarted(true);
    setCurrentSection("mcq");
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentSection === "mcq" && currentQuestion < mcqQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else if (currentSection === "mcq") {
      setCurrentSection("coding");
      setCurrentQuestion(0);
    } else if (
      currentSection === "coding" &&
      currentQuestion < codingProblems.length - 1
    ) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentSection === "mcq" && currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else if (currentSection === "coding" && currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else if (currentSection === "coding" && currentQuestion === 0) {
      setCurrentSection("mcq");
      setCurrentQuestion(mcqQuestions.length - 1);
    } else if (currentSection === "mcq" && currentQuestion === 0) {
      setCurrentSection("instructions");
    }
  };

  const handleSubmitExam = () => {
    // Calculate score and save results
    const score = calculateScore();
    // Save to database here
    navigate("/dsa-report", { state: { score } });
    console.log("Exam submitted. Score:", score);
  };

  const calculateScore = () => {
    let correctCount = 0;
    mcqQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    // This score calculation is just for MCQs; you'd need a more complex
    // system for grading coding problems.
    return correctCount;
  };

  const handleBack = () => {
    if (currentSection === "instructions") {
      navigate(-1);
    } else if (currentSection === "mcq") {
      setCurrentSection("instructions");
    } else {
      setCurrentSection("mcq");
      setCurrentQuestion(mcqQuestions.length - 1);
    }
  };

  if (loading) {
    return (
      <div className={styles.examContainer}>
        <div className={styles.loadingContainer}>
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.examContainer}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.examContainer}>
      <div className={styles.examContent}>
        <button className={styles.backButton} onClick={handleBack}>
          <FiArrowLeft size={20} />
        </button>

        {examStarted && (
          <div className={styles.examHeader}>
            <div className={styles.timer}>
              <FiClock /> {formatTime(timeLeft)}
            </div>
            <div className={styles.progress}>
              {currentSection === "mcq" ? "MCQ Section" : "Coding Section"}
            </div>
          </div>
        )}

        {currentSection === "instructions" && (
          <div className={styles.instructionsSection}>
            <h1>DSA Exam Instructions</h1>
            <div className={styles.instructionsCard}>
              <h2>Before You Begin</h2>
              <ul>
                <li>This exam consists of two sections: MCQ and Coding</li>
                <li>Total time: 60 minutes</li>
                <li>MCQ Section: {mcqQuestions.length} questions</li>
                <li>Coding Section: {codingProblems.length} problems</li>
                <li>Do not refresh the page during the exam</li>
                <li>Ensure you have a stable internet connection</li>
              </ul>

              <h2>Grading</h2>
              <ul>
                <li>MCQ questions: 3 points each</li>
                <li>Coding problems: graded on correctness and efficiency</li>
                <li>Total possible score: 100 points</li>
              </ul>

              <button className={styles.startExamButton} onClick={startExam}>
                Start Exam
              </button>
            </div>
          </div>
        )}

        {currentSection === "mcq" && (
          <div className={styles.mcqSection}>
            <h2>Multiple Choice Questions</h2>
            <div className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span>
                  Question {currentQuestion + 1} of {mcqQuestions.length}
                </span>
                <span>
                  {Math.ceil(
                    ((currentQuestion + 1) / mcqQuestions.length) * 100
                  )}
                  % Complete
                </span>
              </div>

              <div className={styles.question}>
                <h3>{mcqQuestions[currentQuestion].question}</h3>
                <div className={styles.options}>
                  {mcqQuestions[currentQuestion].options.map(
                    (option, index) => (
                      <label key={index} className={styles.option}>
                        <input
                          type="radio"
                          name={`question-${mcqQuestions[currentQuestion].id}`}
                          checked={
                            userAnswers[mcqQuestions[currentQuestion].id] ===
                            index
                          }
                          onChange={() =>
                            handleAnswerSelect(
                              mcqQuestions[currentQuestion].id,
                              index
                            )
                          }
                        />
                        <span>{option}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className={styles.navigation}>
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextQuestion}
                  className={styles.primaryButton}
                >
                  {currentQuestion === mcqQuestions.length - 1
                    ? "Next Section"
                    : "Next Question"}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentSection === "coding" && (
          <div className={styles.codingSection}>
            <h2>Coding Problems</h2>
            <div className={styles.codingLayout}>
              <div className={styles.problemStatement}>
                <h3>{codingProblems[currentQuestion].title}</h3>
                <p className={styles.difficulty}>
                  Difficulty: {codingProblems[currentQuestion].difficulty}
                </p>
                <p>{codingProblems[currentQuestion].description}</p>

                <h4>Example:</h4>
                <pre className={styles.codeExample}>
                  Input: [2, 7, 11, 15], target = 9\nOutput: [0, 1]
                </pre>
              </div>

              <div className={styles.codeEditor}>
                <textarea
                  defaultValue={codingProblems[currentQuestion].template}
                  className={styles.editor}
                  spellCheck="false"
                />
                <div className={styles.editorActions}>
                  <button>Run Code</button>
                  <button>Submit</button>
                </div>
              </div>
            </div>

            <div className={styles.codingNavigation}>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              <span>
                Problem {currentQuestion + 1} of {codingProblems.length}
              </span>
              {currentQuestion === codingProblems.length - 1 ? (
                <button
                  onClick={handleSubmitExam}
                  className={styles.primaryButton}
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className={styles.primaryButton}
                >
                  Next Problem
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DSAExam;
