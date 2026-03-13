import React, { useState } from 'react';
import '../../assets/css/Test.css';

function Test() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const questions = [
    {
      question: "What does CPU stand for?",
      options: ["Computer Personal Unit", "Central Processor Unit", "Central Processing Unit", "Computer Processing Unit"],
      correct: 2
    },
    {
      question: "Which of the following is an input device?",
      options: ["Printer", "Monitor", "Keyboard", "Speaker"],
      correct: 2
    },
    {
      question: "What is the primary function of RAM?",
      options: ["Storage", "Processing", "Memory", "Display"],
      correct: 2
    },
    {
      question: "Which operating system is developed by Microsoft?",
      options: ["MacOS", "Linux", "Windows", "Android"],
      correct: 2
    },
    {
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlinks and Text Markup Language", "Home Tool Markup Language"],
      correct: 0
    },
    {
      question: "Which of the following is a web browser?",
      options: ["Microsoft Word", "Google Chrome", "Adobe Photoshop", "Windows Media Player"],
      correct: 1
    },
    {
      question: "What is the file extension for a Microsoft Word document?",
      options: [".pdf", ".docx", ".txt", ".xlsx"],
      correct: 1
    },
    {
      question: "Which component stores data permanently?",
      options: ["RAM", "CPU", "Hard Disk Drive", "Motherboard"],
      correct: 2
    },
    {
      question: "What does USB stand for?",
      options: ["Universal Serial Bus", "United System Bus", "Universal System Buffer", "United Serial Buffer"],
      correct: 0
    },
    {
      question: "Which of the following is an output device?",
      options: ["Mouse", "Keyboard", "Scanner", "Monitor"],
      correct: 3
    }
  ];

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === questions[currentQuestion].correct) {
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
        <h2 className="question">{questions[currentQuestion].question}</h2>
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
