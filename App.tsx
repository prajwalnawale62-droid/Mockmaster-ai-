import React, { useState } from 'react';
import { Header } from './components/Header';
import { SetupQuiz } from './components/SetupQuiz';
import { ActiveQuiz } from './components/ActiveQuiz';
import { QuizResult } from './components/QuizResult';
import { generateQuiz } from './services/geminiService';
import { AppView, Difficulty, Quiz, QuizState } from './types';

function App() {
  const [view, setView] = useState<AppView>('home');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    isFinished: false,
    score: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartQuiz = async (topic: string, difficulty: Difficulty, numQuestions: number) => {
    setIsGenerating(true);
    try {
      const newQuiz = await generateQuiz(topic, difficulty, numQuestions);
      setQuiz(newQuiz);
      
      // Reset State
      setQuizState({
        currentQuestionIndex: 0,
        answers: {},
        isFinished: false,
        score: 0
      });
      
      setView('quiz');
    } catch (error) {
      console.error(error);
      alert("Failed to generate quiz. Please check your API key or try a different topic.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: optionIndex
      }
    }));
  };

  const handleNext = () => {
    if (!quiz) return;
    if (quizState.currentQuestionIndex < quiz.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const handleFinish = () => {
    if (!quiz) return;
    
    // Calculate Score
    let score = 0;
    quiz.questions.forEach(q => {
      if (quizState.answers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });

    setQuizState(prev => ({
      ...prev,
      isFinished: true,
      score
    }));
    setView('result');
  };

  const handleRetry = () => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      isFinished: false,
      score: 0
    });
    setView('quiz');
  };

  const handleReset = () => {
    setQuiz(null);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header onReset={handleReset} />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-start">
        {view === 'home' && (
          <SetupQuiz onStart={handleStartQuiz} isGenerating={isGenerating} />
        )}
        
        {view === 'quiz' && quiz && (
          <ActiveQuiz 
            quiz={quiz} 
            quizState={quizState}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onFinish={handleFinish}
          />
        )}

        {view === 'result' && quiz && (
          <QuizResult 
            quiz={quiz} 
            quizState={quizState}
            onRetry={handleRetry}
            onNew={handleReset}
          />
        )}
      </main>
      
      <footer className="w-full py-6 text-center text-slate-400 text-sm border-t border-slate-200">
        <p>© {new Date().getFullYear()} MockMaster AI. Powered by Gemini 3.</p>
      </footer>
    </div>
  );
}

export default App;