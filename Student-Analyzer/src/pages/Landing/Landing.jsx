import { useState, useEffect } from 'react';
import { FiArrowRight, FiUser, FiBook } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';
import student from '../icons_logos/lstudent.json';
import teacher from '../icons_logos/teacher.json';
import Lottie from 'lottie-react';
import sa_black from '../icons_logos/sa_black.png';
import sa_white from '../icons_logos/sa_white.png';
const Landing = () => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingIndex, setTypingIndex] = useState(0);
  const navigate = useNavigate();

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseDuration = 1500;

  const phrases = [
    "Welcome to EduTrack",
    "Student Analytics",
    "Teacher Portal",
    "Data-Driven Education",
    "Explore the Universe"
  ];

  useEffect(() => {
    const currentPhrase = phrases[loopNum % phrases.length];
    let timer;

    if (isDeleting) {
      if (typingIndex > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, typingIndex - 1));
          setTypingIndex(typingIndex - 1);
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    } else {
      if (typingIndex < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, typingIndex + 1));
          setTypingIndex(typingIndex + 1);
        }, typingSpeed);
      } else {
        timer = setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    }

    return () => clearTimeout(timer);
  }, [typingIndex, isDeleting, loopNum]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          
<div className={styles.logo}>
 <img src={sa_white} alt="Student Analyzer Logo" />
</div>
          <h1 className={styles.typewriter}>
            <span className={styles.typewriterText}>{displayText}</span>
            <span className={styles.cursor}>|</span>
          </h1>
          <p className={styles.subtitle}>
            Transform your educational experience with our comprehensive analytics platform.
            Track performance, manage classes, and gain valuable insights.
          </p>
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FiBook />
              </div>
              <span>Real-time Analytics</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FiUser />
              </div>
              <span>Personalized Dashboards</span>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className={styles.loginSection}>
          <h2 className={styles.loginTitle}>Access Your Account</h2>

          {/* Student Card */}
          <div className={styles.loginCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardLeft}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon} style={{ backgroundColor: 'rgba(67, 97, 238, 0.1)' }}>
                    <FiUser color="#4361ee" />
                  </div>
                  <h3>Student Portal</h3>
                </div>
                <p>Track your performance, view grades, and monitor your progress</p>
                <div className={styles.buttonGroup}>
                  <button 
                    className={styles.cardButton} 
                    onClick={() => handleNavigation('/student-login')}
                  >
                    Login  
                    <FiArrowRight className={styles.buttonIcon} />
                  </button>
                  <button 
                    className={styles.cardButtonOutline} 
                    onClick={() => handleNavigation('/student-signup')}
                  >
                    Signup
                  </button>
                </div>
              </div>
              <div className={styles.cardRight}>
                <Lottie 
                  animationData={student} 
                  loop={true} 
                  className={styles.lottieAnimation}
                />
              </div>
            </div>
          </div>

          {/* Teacher Card */}
          <div className={styles.loginCard}>
            <div className={styles.cardContent}>
              <div className={styles.cardLeft}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon} style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                    <FiBook color="#4CAF50" />
                  </div>
                  <h3>Teacher Portal</h3>
                </div>
                <p>Manage your classes, analyze student data, and create reports</p>
                <div className={styles.buttonGroup}>
                  <button 
                    className={styles.cardButton} 
                    onClick={() => handleNavigation('/teacher-login')}
                    style={{ backgroundColor: '#4CAF50' }}
                  >
                    Login
                    <FiArrowRight className={styles.buttonIcon} />
                  </button>
                  <button 
                    className={styles.cardButtonOutline} 
                    onClick={() => handleNavigation('/teacher-signup')}
                    style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                  >
                    Signup
                  </button>
                </div>
              </div>
              <div className={styles.cardRight}>
                <Lottie 
                  animationData={teacher} 
                  loop={true} 
                  className={styles.lottieAnimation}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;