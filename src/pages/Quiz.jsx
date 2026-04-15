import { useMemo, useState } from 'react'
import { useAuth } from '../components/authContext.js'

const QUESTIONS = [
  {
    id: 'q1',
    question: 'What is classification in machine learning?',
    options: [
      'Predicting a continuous number',
      'Assigning an input to a category (label)',
      'Sorting data alphabetically',
      'Compressing data into fewer bits',
    ],
    answerIndex: 1,
  },
  {
    id: 'q2',
    question: 'In spam detection, the labels are usually…',
    options: ['spam vs ham (not spam)', 'large vs small', 'image vs text', 'fast vs slow'],
    answerIndex: 0,
  },
  {
    id: 'q3',
    question: 'Accuracy is best described as…',
    options: [
      'correct predictions / total predictions',
      'number of features in the dataset',
      'the model’s confidence score',
      'the number of training epochs',
    ],
    answerIndex: 0,
  },
  {
    id: 'q4',
    question: 'A “threshold” is commonly used to…',
    options: [
      'convert a score into a final class label',
      'shuffle the training data',
      'reduce overfitting automatically',
      'increase the dataset size',
    ],
    answerIndex: 0,
  },
  {
    id: 'q5',
    question: 'Overfitting means the model…',
    options: [
      'performs well on new data but poorly on training data',
      'performs well on training data but poorly on new data',
      'has too few parameters to learn anything',
      'cannot be evaluated with accuracy',
    ],
    answerIndex: 1,
  },
]

export function Quiz() {
  const { user, updateProgress } = useAuth()

  const [selected, setSelected] = useState(() => {
    const init = {}
    for (const q of QUESTIONS) init[q.id] = null
    return init
  })
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(() => {
    let s = 0
    for (const q of QUESTIONS) {
      if (selected[q.id] === q.answerIndex) s += 1
    }
    return s
  }, [selected])

  function canSubmit() {
    return QUESTIONS.every((q) => selected[q.id] !== null)
  }

  function submit() {
    if (!canSubmit()) return
    setSubmitted(true)

    const existing = user?.progress?.modulesCompleted ?? []
    const nextModules = existing.includes('quiz') ? existing : [...existing, 'quiz']
    updateProgress({ modulesCompleted: nextModules, quizScore: score })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Quiz: Classification</h1>
            <p className="mt-2 text-sm text-slate-300">
              5 questions. Your score is saved locally.
            </p>
          </div>
          <div className="rounded-xl bg-black/30 px-4 py-3 text-sm text-slate-200">
            Score: <span className="font-bold text-white">{score}</span> / {QUESTIONS.length}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {QUESTIONS.map((q, idx) => {
          const picked = selected[q.id]
          return (
            <div key={q.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold text-white">
                {idx + 1}. {q.question}
              </div>
              <div className="mt-4 grid gap-2">
                {q.options.map((opt, optIdx) => {
                  const isPicked = picked === optIdx
                  const isCorrect = submitted && optIdx === q.answerIndex
                  const isWrongPick = submitted && isPicked && optIdx !== q.answerIndex
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={submitted}
                      onClick={() => setSelected((prev) => ({ ...prev, [q.id]: optIdx }))}
                      className={[
                        'rounded-xl border px-4 py-3 text-left text-sm transition',
                        isPicked
                          ? 'border-violet-400/50 bg-violet-500/15 text-white'
                          : 'border-white/10 bg-black/20 text-slate-200 hover:bg-black/30',
                        isCorrect ? 'border-emerald-400/40 bg-emerald-500/10' : '',
                        isWrongPick ? 'border-rose-400/40 bg-rose-500/10' : '',
                      ].join(' ')}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              {submitted ? (
                <div className="mt-4 text-sm text-slate-300">
                  Your answer:{' '}
                  <span className="font-semibold text-white">
                    {picked === null ? '—' : q.options[picked]}
                  </span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-300">
          {submitted
            ? 'Done! Your score is saved.'
            : canSubmit()
              ? 'Ready to submit when you are.'
              : 'Answer all questions to submit.'}
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={submitted || !canSubmit()}
          className={[
            'rounded-xl px-4 py-3 text-sm font-semibold text-white',
            submitted || !canSubmit()
              ? 'bg-white/10 text-slate-400'
              : 'bg-violet-500 hover:bg-violet-400',
          ].join(' ')}
        >
          Submit quiz
        </button>
      </div>
    </div>
  )
}

