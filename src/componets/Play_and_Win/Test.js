import React, { useState, useEffect } from 'react';
import '../../assets/css/Test.css';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Define the base URL for your API
const API_BASE_URL = 'https://brainrock.in/brainrock/backend';

function Test() {
  // Get user_id from localStorage
  const userId = localStorage.getItem('test_user_id');
  const navigate = useNavigate();
  console.log('Test component - User ID from localStorage:', userId);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [testResult, setTestResult] = useState(null);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false); // New state for tab switch warning
  const [tabSwitchCount, setTabSwitchCount] = useState(0); // New state for tab switch count
  
  
  // Start test and fetch questions from API
  useEffect(() => {
    const startTest = async () => {
      try {
        if (!userId) {
          throw new Error('User ID not found. Please register first.');
        }
        
        const response = await axios.post(
          'https://brainrock.in/brainrock/backend/api/start-test/',
          { user_id: userId },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.status) {
          setQuestions(response.data.questions);
          setAttemptId(response.data.attempt_id);
        } else {
          throw new Error(response.data.message || 'Failed to start test');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    startTest();
  }, [userId]);

  // Timer effect
  useEffect(() => {
    if (loading || showResults || !questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          // Time's up, move to next question
          handleNextQuestion();
          return 10; // Reset timer for next question
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, loading, showResults, questions.length]);

  // Reset timer when current question or selected option changes
  useEffect(() => {
    setTimeLeft(10);
  }, [currentQuestion, selectedOption]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !loading && !showResults) {
        // User switched tabs
        setTabSwitchCount(prevCount => {
          const newCount = prevCount + 1;
          
          if (newCount === 1) {
            // First warning
            setTabSwitchWarning(true);
            console.log('Test warning: First tab switch');
          } else if (newCount === 2) {
            // Second time, fail the test
            setShowResults(true);
            setScore(0);
            console.log('Test failed: Second tab switch');
          }
          
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, showResults]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    // Save user's answer for current question (even if no answer selected)
    const newAnswers = [...userAnswers, {
      question_id: questions[currentQuestion].id,
      selected_option: selectedOption
    }];
    setUserAnswers(newAnswers);

    // Check if answer is correct and update score
    if (selectedOption === questions[currentQuestion].correct_answer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
    } else {
      // All questions completed, submit test
      submitTest(newAnswers);
    }
  };

  // Submit test to API
  const submitTest = async (answers) => {
    try {
      const response = await axios.post(
        'https://brainrock.in/brainrock/backend/api/submit-test/',
        {
          user_id: userId,
          answers: answers
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Test submission successful:', response.data);
      // Save API response data for display
      setTestResult(response.data);
      setShowResults(true);
    } catch (err) {
      console.error('Error submitting test:', err);
      setError(err.message);
    }
  };

  const handleRestart = () => {
    // Clear localStorage and redirect to KheloJito for re-registration
    localStorage.removeItem('test_user_id');
    navigate('/KheloJito');
  };

  if (loading) {
    return (
      <div className="test-container">
        <div className="test-card">
          <div className="loading">Loading questions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-container">
        <div className="test-card">
          <div className="error">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="test-container">
        <div className="test-card">
          <div className="no-questions">No questions available. Please check back later.</div>
        </div>
      </div>
    );
  }

  if (showResults) {
    // Check if test was failed due to tab switch
    const isTabSwitchFailed = score === 0 && userAnswers.length < questions.length;
    
    return (
      <div className="test-container">
        <div className="test-card">
          <h1>Test Results</h1>
          {isTabSwitchFailed ? (
            <>
              <div className="score-display">
                <p>Your Score: <strong>0 / {questions.length}</strong></p>
                <p>Percentage: <strong>0%</strong></p>
              </div>
              <div className="result-message failed">
                Test Failed: You switched tabs during the test
              </div>
            </>
          ) : testResult ? (
            <>
              <div className="score-display">
                <p>Your Score: <strong>{testResult.score} / {questions.length}</strong></p>
                <p>Pass Marks: <strong>{testResult.pass_marks}</strong></p>
                <p>Percentage: <strong>{Math.round((testResult.score / questions.length) * 100)}%</strong></p>
              </div>
              <div className={`result-message ${testResult.status === 'failed' ? 'failed' : 'passed'}`}>
                {testResult.status === 'failed' ? 
                  `Test Failed: You need ${testResult.pass_marks} marks to pass` : 
                  "Test Passed: Congratulations!"}
              </div>
            </>
          ) : (
            <>
              <div className="score-display">
                <p>Your Score: <strong>{score} / {questions.length}</strong></p>
                <p>Percentage: <strong>{Math.round((score / questions.length) * 100)}%</strong></p>
              </div>
              <div className="result-message">
                {score >= 8 ? "Excellent!" : score >= 6 ? "Good Job!" : score >= 4 ? "Fair" : "Need Improvement"}
              </div>
            </>
          )}
          <button className="restart-button" onClick={handleRestart}>
            Retake Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-container">
      <div className="test-card">
        {/* Tab switch warning */}
        {tabSwitchWarning && (
          <div className="warning-message">
            ⚠️ Warning: You have switched tabs once. Switching again will end your test.
          </div>
        )}
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="question-number">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="timer">
          Time Left: {timeLeft} seconds
        </div>
        <h2 className="question">{questions[currentQuestion].question_text}</h2>
        <div className="options">
          {questions[currentQuestion].options.map((option, index) => (
            <div 
              key={index} 
              className={`option ${selectedOption === index ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(index)}
            >
              {option}
            </div>
          ))}
        </div>
        <button 
          className="next-button" 
          onClick={handleNextQuestion}
          disabled={selectedOption === null}
        >
          {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Test;
