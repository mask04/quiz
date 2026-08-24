import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';

export default function Quiz() {
  const [step, setStep] = useState('setup');
  const [config, setConfig] = useState({ count: 5, category: '', timed: false });
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const answersRef = useRef([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [start, setStart] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef(null);

  const startQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const params = { limit: config.count };
      if (config.category) params.category = config.category;
      const data = await api.getQuiz(params);
      if (!data.questions.length) {
        setError('No questions available. Ask an admin to add some.');
        return;
      }
      setQuestions(data.questions);
      answersRef.current = [];
      setIndex(0);
      setResult(null);
      setStep('playing');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Start the timer whenever a new question is shown.
  useEffect(() => {
    if (step !== 'playing' || !questions[index]) return;
    setSelected(null);
    setStart(Date.now());
    if (config.timed && questions[index].timeLimit) {
      setRemaining(questions[index].timeLimit);
      timerRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(timerRef.current);
            handleNext(true); // time's up, move on with no answer
            return 0;
          }
          return r - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [index, step]); // eslint-disable-line

  const choose = (optId) => {
    if (selected) return;
    setSelected(optId);
  };

  const handleNext = (noAnswer = false) => {
    clearInterval(timerRef.current);
    const q = questions[index];
    if (!q) return;
    const timeTaken = noAnswer ? 0 : Date.now() - start;
    answersRef.current[index] = {
      questionId: q._id,
      selectedOption: noAnswer ? null : selected,
      timeTakenMs: timeTaken
    };

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      submit(answersRef.current);
    }
  };

  const submit = async (finalAnswers) => {
    setBusy(true);
    try {
      const data = await api.submitQuiz({ timed: config.timed, answers: finalAnswers });
      setResult(data);
      setStep('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    setStep('setup');
    setQuestions([]);
    setResult(null);
  };

  if (step === 'setup') {
    return (
      <div className="card center">
        <h2>Start a quiz</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={startQuiz} className="setup">
          <label>
            Number of questions
            <input
              type="number"
              min="1"
              max="50"
              value={config.count}
              onChange={(e) => setConfig({ ...config, count: e.target.value })}
            />
          </label>
          <label>
            Category (optional)
            <input
              type="text"
              placeholder="e.g. science"
              value={config.category}
              onChange={(e) => setConfig({ ...config, category: e.target.value })}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={config.timed}
              onChange={(e) => setConfig({ ...config, timed: e.target.checked })}
            />
            Timed mode (per-question countdown)
          </label>
          <button type="submit" disabled={busy}>
            {busy ? 'Loading…' : 'Start'}
          </button>
        </form>
      </div>
    );
  }

  if (step === 'result' && result) {
    const { score, correctAnswers, totalQuestions, averageTimeMs } = result.score;
    return (
      <div className="card center">
        <h2>Results</h2>
        <div className="score-big">{score}%</div>
        <p>
          {correctAnswers} / {totalQuestions} correct
        </p>
        <p>Avg time per question: {(averageTimeMs / 1000).toFixed(1)}s</p>
        <details>
          <summary>Review answers</summary>
          <ul className="review">
            {result.results.map((r, i) => (
              <li key={i} className={r.correct ? 'ok' : 'no'}>
                Question {i + 1}: {r.correct ? '✓ correct' : '✗ wrong'}
              </li>
            ))}
          </ul>
        </details>
        <button onClick={restart}>Play again</button>
      </div>
    );
  }

  const q = questions[index];
  if (!q) return <div className="center">Loading…</div>;

  return (
    <div className="card">
      <div className="progress">
        Question {index + 1} / {questions.length}
        {config.timed && q.timeLimit && (
          <span className={remaining <= 5 ? 'timer danger' : 'timer'}>{remaining}s</span>
        )}
      </div>
      <h3>{q.text}</h3>
      <div className="options">
        {q.options.map((opt) => (
          <button
            key={opt._id}
            className={`option ${selected === opt._id ? 'selected' : ''}`}
            onClick={() => choose(opt._id)}
            disabled={!!selected}
          >
            {opt.text}
          </button>
        ))}
      </div>
      <div className="actions">
        <button onClick={() => handleNext(false)} disabled={!selected || busy}>
          {index + 1 === questions.length ? 'Submit' : 'Next'}
        </button>
        {config.timed && (
          <button className="ghost" onClick={() => handleNext(true)} disabled={busy}>
            Skip
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
