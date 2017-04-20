import { isDateExpired, getNumberOfDays, calculatePercentage } from './globalFunctions';

export const getCurrentPhaseIdentifier = (timeline) => {
    const currentDate = new Date();
    let identifier = null;
    timeline.map((phase) => {
      const startDate = new Date(phase.start);
      const endDate = new Date(phase.end);
      if (isDateExpired(currentDate, startDate) && isDateExpired(endDate, currentDate)) {
        identifier = phase.identifier;
      }
      return identifier;
    });
    return identifier || 'thread';
};

export const isPhaseStarted = (timeline, identifier) => {
  const currentDate = new Date();
  let isStarted = false;
  timeline.map((phase) => {
    if (phase.identifier === identifier) {
      const startDate = new Date(phase.start);
      isStarted = isDateExpired(currentDate, startDate);
    }
  });
  return isStarted;
};

export const getStartDatePhase = (timeline, identifier) => {
  let startDatePhase = '';
  timeline.map((phase) => {
    if (phase.identifier === identifier) {
      startDatePhase = phase.start;
    }
  });
  return startDatePhase;
};

export const isCurrentPhase = (phase) => {
  const currentDate = new Date();
  const startDate = new Date(phase.start);
  const endDate = new Date(phase.end);
  const currentPhase = isDateExpired(currentDate, startDate) && isDateExpired(endDate, currentDate);
  return currentPhase;
};

export const isStepCompleted = (phase) => {
  const currentDate = new Date();
  const endDate = new Date(phase.end);
  return isDateExpired(currentDate, endDate);
};

export const getBarWidth = (phase) => {
  const currentDate = new Date();
  const endDate = new Date(phase.end);
  const stepCompleted = isDateExpired(currentDate, endDate);
  let barWidth = 0;
  if (stepCompleted) {
    barWidth = 100;
  } else {
    const startDate = new Date(phase.start);
    const isStepStarted = isDateExpired(currentDate, startDate);
    if (isStepStarted) {
      const remainingDays = getNumberOfDays(endDate, currentDate);
      const totalDays = getNumberOfDays(endDate, startDate);
      const percentage = calculatePercentage(remainingDays, totalDays);
      barWidth = 100 - percentage;
    }
  }
  return barWidth;
};