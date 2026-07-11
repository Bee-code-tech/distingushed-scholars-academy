export const calculateScore = (answers: (number | null)[], quizData: any[]) => {
  const correctCount = answers.filter(
    (a, i) => a === quizData[i]?.correct,
  ).length
  const percent = Math.round((correctCount / (quizData.length || 1)) * 100)
  return { correctCount, percent }
}

export const getSubjectStats = (
  quizData: any[],
  answers: (number | null)[],
) => {
  const subs = Array.from(new Set(quizData.map((q) => q.subject)))
  return subs.map((sub) => {
    const qInSub = quizData.filter((q) => q.subject === sub)
    const correctInSub = qInSub.filter((q) => {
      const idx = quizData.indexOf(q)
      return answers[idx] === q.correct
    }).length

    return {
      name: sub,
      correct: correctInSub,
      total: qInSub.length,
      percent: Math.round((correctInSub / qInSub.length) * 100),
    }
  })
}
