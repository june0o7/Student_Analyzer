import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Auth.module.css';
import teacherData from '../icons_logos/teacher.json';
import Lottie from 'lottie-react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {auth ,db} from '../../Firebase_Config/firebaseConfig';

const TeacherSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    teacherId: '',
    subject: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  function generateTeacherVerificationCode(name) {
  if (!name) return null;

  // Step 1: Convert each character to ASCII and apply position-based modification
  let transformed = name
    .toUpperCase() // Normalize the name
    .split('')
    .map((char, i) => char.charCodeAt(0) * (i + 1) ** 2) // Position-weighted ASCII
    .reduce((acc, val) => acc + val, 0); // Sum of transformed values

  // Step 2: Apply further complex transformation
  transformed = Math.floor(Math.sqrt(transformed * 1234567)) + transformed % 997;

  // Step 3: Convert to 6-digit number (always)
  const code = (transformed % 900000) + 100000; // ensures it's between 100000–999999
  return code;
}


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (formData.password !== formData.confirmPassword) {
  //     setError('Passwords do not match');
  //     return;
  //   }
    
  //   setIsLoading(true);
  //   setError('');
    
  //   try {
  //     // In a real app, you would send this data to your backend
  //     console.log('Teacher signup data:', formData);
  //      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password.trim());
      
      
  //         // 2. Get the user UID
  //         const userId = userCredential.user.uid;

  //         await setDoc(doc(db, "teachers", userId), {
  //               name: formData.name,
  //               email: formData.email,
  //               teacherId: formData.teacherId,
  //               createdAt: new Date(),
  //               role: "teachers",
  //             });
      
  //             // await new Promise(resolve => setTimeout(resolve, 1000));
  //     // Simulate API call
  //     // navigate("/student-login");
  //     // For demo purposes, we'll just check if fields are filled
  //     if (formData.name && formData.email && formData.password && formData.teacherId) {
  //       navigate('/student-login');
  //     } else {
  //       setError('Please fill in all required fields');
  //     }
  //   } catch (err) {
  //     setError('Registration failed. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    // ✅ Validate teacher ID
    const expectedTeacherId = generateTeacherVerificationCode(formData.name);
    if (formData.teacherId !== expectedTeacherId.toString()) {
      setError('Invalid Teacher ID. Please contact admin.');
      setIsLoading(false);
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email.trim(),
      formData.password.trim()
    );

    const userId = userCredential.user.uid;

    await setDoc(doc(db, "teachers", userId), {
      name: formData.name,
      email: formData.email,
      teacherId: formData.teacherId,
      createdAt: new Date(),
      role: "teachers",
      sids: [],
    });

    navigate('/teacher-login');
  } catch (err) {
    setError('Registration failed. Please try again.');
    console.error('Error during teacher signup:', err);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authLeft}>
          <Lottie animationData={teacherData} loop={true} className={styles.authAnimation} />
          <h2>Join Our Educator Network</h2>
          <p>Start managing your classroom effectively</p>
        </div>
        
        <div className={styles.authRight}>
          <h1>Teacher Sign Up</h1>
          
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && <div className={styles.authError}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="teacherId">Teacher ID</label>
              <input
                type="text"
                id="teacherId"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                required
                placeholder="Enter your teacher ID"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter your subject (optional)"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.authButton}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
            
            <div className={styles.authFooter}>
              Already have an account? <Link to="/teacher-login">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherSignup;