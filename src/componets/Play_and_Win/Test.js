import React, { useState, useEffect } from 'react';
import '../../assets/css/Test.css';

// Define the base URL for your API
const API_BASE_URL = 'https://brainrock.in/brainrock/backend';

function Test() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/khelo-jito/questions/`);
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const result = await response.json();
        const questionsData = result.data || result;
        setQuestions(questionsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === questions[currentQuestion].correct_answer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedOption(null);
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
    return (
      <div className="test-container">
        <div className="test-card">
          <h1>Test Results</h1>
          <div className="score-display">
            <p>Your Score: <strong>{score} / {questions.length}</strong></p>
            <p>Percentage: <strong>{Math.round((score / questions.length) * 100)}%</strong></p>
          </div>
          <div className="result-message">
            {score >= 8 ? "Excellent!" : score >= 6 ? "Good Job!" : score >= 4 ? "Fair" : "Need Improvement"}
          </div>
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
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="question-number">
          Question {currentQuestion + 1} of {questions.length}
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
