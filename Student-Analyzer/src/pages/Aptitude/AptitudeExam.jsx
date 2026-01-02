import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import styles from "./AptitudeExam.module.css";

const AptitudeExam = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState("instructions");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes in seconds
  const [userAnswers, setUserAnswers] = useState({});
  const [examStarted, setExamStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample Quantitative Aptitude questions
  const quantitativeQuestions = [
    {
      id: 1,
      question: "If a train travels 300 km in 5 hours, what is its speed?",
      options: ["50 km/h", "60 km/h", "65 km/h", "70 km/h"],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "What is 25% of 200?",
      options: ["25", "50", "75", "100"],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: "If x + 5 = 12, what is the value of x?",
      options: ["5", "6", "7", "8"],
      correctAnswer: 2,
    },
  ];

  // Sample Logical Reasoning questions
  const reasoningQuestions = [
    {
      id: 1,
      question: "Complete the series: 2, 4, 8, 16, ?",
      options: ["24", "32", "64", "128"],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "If all roses are flowers and some flowers fade quickly, which statement must be true?",
      options: [
        "All roses fade quickly",
        "Some roses fade quickly",
        "No roses fade quickly",
        "Some flowers that fade quickly are roses"
      ],
      correctAnswer: 3,
    },
    {
      id: 3,
      question: "A is B's sister. C is B's mother. D is C's father. How is A related to D?",
      options: ["Granddaughter", "Grandson", "Daughter", "Sister"],
      correctAnswer: 0,
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

  useEffect(() => {
    const initializeExam = async () => {
      try {
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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startExam = () => {
    setExamStarted(true);
    setCurrentSection("quantitative");
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentSection === "quantitative" && currentQuestion < quantitativeQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else if (currentSection === "quantitative") {
      setCurrentSection("reasoning");
      setCurrentQuestion(0);
    } else if (currentSection === "reasoning" && currentQuestion < reasoningQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentSection === "quantitative" && currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else if (currentSection === "reasoning" && currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else if (currentSection === "reasoning" && currentQuestion === 0) {
      setCurrentSection("quantitative");
      setCurrentQuestion(quantitativeQuestions.length - 1);
    } else if (currentSection === "quantitative" && currentQuestion === 0) {
      setCurrentSection("instructions");
    }
  };

  const handleSubmitExam = () => {
    const score = calculateScore();
    navigate("/aptitude-report", { state: { score } });
    console.log("Aptitude exam submitted. Score:", score);
  };

  const calculateScore = () => {
    let correctCount = 0;
    
    quantitativeQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    
    reasoningQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    
    return Math.round((correctCount / (quantitativeQuestions.length + reasoningQuestions.length)) * 100);
  };

  const handleBack = () => {
    if (currentSection === "instructions") {
      navigate(-1);
    } else if (currentSection === "quantitative") {
      setCurrentSection("instructions");
    } else {
      setCurrentSection("quantitative");
      setCurrentQuestion(quantitativeQuestions.length - 1);
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
              {currentSection === "quantitative" ? "Quantitative Aptitude" : "Logical Reasoning"}
            </div>
          </div>
        )}

        {currentSection === "instructions" && (
          <div className={styles.instructionsSection}>
            <h1>Aptitude & Reasoning Exam Instructions</h1>
            <div className={styles.instructionsCard}>
              <h2>Before You Begin</h2>
              <ul>
                <li>This exam consists of two sections: Quantitative Aptitude and Logical Reasoning</li>
                <li>Total time: 45 minutes</li>
                <li>Quantitative Section: {quantitativeQuestions.length} questions</li>
                <li>Reasoning Section: {reasoningQuestions.length} questions</li>
                <li>Do not refresh the page during the exam</li>
                <li>Ensure you have a stable internet connection</li>
              </ul>

              <h2>Grading</h2>
              <ul>
                <li>Each correct answer: +4 points</li>
                <li>No negative marking</li>
                <li>Total possible score: 100 points</li>
              </ul>

              <button className={styles.startExamButton} onClick={startExam}>
                Start Exam
              </button>
            </div>
          </div>
        )}

        {currentSection === "quantitative" && (
          <div className={styles.mcqSection}>
            <h2>Quantitative Aptitude</h2>
            <div className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span>
                  Question {currentQuestion + 1} of {quantitativeQuestions.length}
                </span>
                <span>
                  {Math.ceil(((currentQuestion + 1) / quantitativeQuestions.length) * 100)}% Complete
                </span>
              </div>

              <div className={styles.question}>
                <h3>{quantitativeQuestions[currentQuestion].question}</h3>
                <div className={styles.options}>
                  {quantitativeQuestions[currentQuestion].options.map((option, index) => (
                    <label key={index} className={styles.option}>
                      <input
                        type="radio"
                        name={`question-${quantitativeQuestions[currentQuestion].id}`}
                        checked={userAnswers[quantitativeQuestions[currentQuestion].id] === index}
                        onChange={() => handleAnswerSelect(quantitativeQuestions[currentQuestion].id, index)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.navigation}>
                <button onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>
                  Previous
                </button>
                <button onClick={handleNextQuestion} className={styles.primaryButton}>
                  {currentQuestion === quantitativeQuestions.length - 1 ? "Next Section" : "Next Question"}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentSection === "reasoning" && (
          <div className={styles.mcqSection}>
            <h2>Logical Reasoning</h2>
            <div className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span>
                  Question {currentQuestion + 1} of {reasoningQuestions.length}
                </span>
                <span>
                  {Math.ceil(((currentQuestion + 1) / reasoningQuestions.length) * 100)}% Complete
                </span>
              </div>

              <div className={styles.question}>
                <h3>{reasoningQuestions[currentQuestion].question}</h3>
                <div className={styles.options}>
                  {reasoningQuestions[currentQuestion].options.map((option, index) => (
                    <label key={index} className={styles.option}>
                      <input
                        type="radio"
                        name={`question-${reasoningQuestions[currentQuestion].id}`}
                        checked={userAnswers[reasoningQuestions[currentQuestion].id] === index}
                        onChange={() => handleAnswerSelect(reasoningQuestions[currentQuestion].id, index)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.navigation}>
                <button onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>
                  Previous
                </button>
                {currentQuestion === reasoningQuestions.length - 1 ? (
                  <button onClick={handleSubmitExam} className={styles.primaryButton}>
                    Submit Exam
                  </button>
                ) : (
                  <button onClick={handleNextQuestion} className={styles.primaryButton}>
                    Next Question
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AptitudeExam;