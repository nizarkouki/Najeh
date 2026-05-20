export function calculatePomodoroTimes(coefficient, totalMinutes) {
  const normalizedCoeff = Math.min(10, Math.max(1, coefficient))
  
  
  const studyMultiplier = 0.8 + (normalizedCoeff / 10) * 0.6 
  const restMultiplier = 1 + (normalizedCoeff / 10) * 1.5 
  
  const baseStudyTime = 30
  const baseRestTime = 5
  
  let studyTime = Math.round(baseStudyTime * studyMultiplier)
  let restTime = Math.round(baseRestTime * restMultiplier)
  
  
  const cycleTime = studyTime + restTime
  const cycles = Math.floor(totalMinutes / cycleTime)
  const remainingTime = totalMinutes - (cycles * cycleTime)
  
  return {
    studyTime,
    restTime,
    cycles,
    remainingTime,
    totalMinutes,
    description: `${cycles}x (${studyTime}min study + ${restTime}min rest)${remainingTime > 0 ? ` + ${remainingTime}min` : ''}`,
  }
}

export function getCoefficientLevel(coefficient) {
  if (coefficient >= 8) return { level: 'critical', label: 'High Priority', color: 'red' }
  if (coefficient >= 6) return { level: 'high', label: 'Important', color: 'amber' }
  if (coefficient >= 4) return { level: 'medium', label: 'Moderate', color: 'blue' }
  return { level: 'low', label: 'General', color: 'green' }
}
