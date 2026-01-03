import { useState } from "react";
import style from "./Dashboard.module.css";
import { FiX, FiUserPlus, FiSearch, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase_Config/firebaseConfig";
import { getAuth } from "firebase/auth";

const AddStudentModal = ({ isOpen, onClose, onAddStudent }) => {
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState("idle"); // idle, checking, success, error
  const [message, setMessage] = useState("");
  
  const auth = getAuth();
  const user = auth.currentUser ? auth.currentUser.uid : null;

  if (!isOpen) return null;

  const resetState = () => {
    setStudentId("");
    setStatus("idle");
    setMessage("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setStatus("checking");
    setMessage("Searching for student...");

    try {
      // 1. Check if student exists
      const querySnapshot = await getDocs(collection(db, "students"));
      const students = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const targetStudent = students.find(s => s.studentId === studentId);

      if (!targetStudent) {
        setStatus("error");
        setMessage("Student ID not found. Ask the student to register first.");
        return;
      }

      // 2. Link to Teacher
      const docRef = doc(db, "teachers", user);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentSids = docSnap.data().sids || [];
        
        if (currentSids.includes(studentId)) {
          setStatus("error");
          setMessage("This student is already in your class.");
          return;
        }

        await updateDoc(docRef, {
          sids: [...currentSids, studentId],
        });

        setStatus("success");
        setMessage("Student added successfully!");
        
        // Delay closing to show success message
        setTimeout(() => {
          onAddStudent(studentId);
          handleClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className={style.modalBackdrop} onClick={handleClose}>
      <div className={style.addStudentCard} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={style.addStudentHeader}>
          <div className={style.headerIcon}>
            <FiUserPlus size={24} />
          </div>
          <div>
            <h2>Add New Student</h2>
            <p>Link a registered student to your dashboard</p>
          </div>
          <button onClick={handleClose} className={style.iconCloseBtn}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className={style.addStudentBody}>
          <div className={style.inputWrapper}>
            <FiSearch className={style.inputIcon} />
            <input
              type="text"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                if(status === 'error') setStatus('idle');
              }}
              placeholder="Enter Student ID (e.g., STU123)"
              className={`${style.modernInput} ${status === 'error' ? style.inputError : ''}`}
              autoFocus
              disabled={status === "checking" || status === "success"}
            />
          </div>

          {/* Status Messages */}
          {status === "error" && (
            <div className={style.statusMessageError}>
              <FiAlertCircle /> {message}
            </div>
          )}
          {status === "success" && (
            <div className={style.statusMessageSuccess}>
              <FiCheckCircle /> {message}
            </div>
          )}

          {/* Footer Actions */}
          <div className={style.addStudentFooter}>
            <button
              type="button"
              className={style.cancelBtn}
              onClick={handleClose}
              disabled={status === "checking" || status === "success"}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${style.confirmBtn} ${status === "success" ? style.btnSuccess : ""}`}
              disabled={status === "checking" || status === "success" || !studentId}
            >
              {status === "checking" ? "Verifying..." : status === "success" ? "Added!" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;