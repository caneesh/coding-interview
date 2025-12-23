import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing scaffolded learning state.
 * Handles step progression, code input, hint visibility, and validation.
 *
 * @param {Object} problem - The problem data following the scaffolded learning data model
 * @returns {Object} State and handlers for the scaffolded learning component
 */
export function useScaffoldedLearning(problem) {
  // Current step index (0-based) - represents actual progress
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Viewing step index - which step is currently being viewed (can differ from currentStepIndex in review mode)
  const [viewingStepIndex, setViewingStepIndex] = useState(0);

  // User's code input for each step (keyed by stepId)
  const [userCodeByStep, setUserCodeByStep] = useState(() => {
    const initial = {};
    problem.steps.forEach(step => {
      initial[step.stepId] = step.placeholderCode || '';
    });
    return initial;
  });

  // Hint level state (progressive hints)
  // 0 = No hints shown, 1 = First hint shown, 2 = Second hint shown, etc.
  const [hintLevel, setHintLevel] = useState(0);

  // Track hints used per step (for victory stats)
  const [hintsUsedByStep, setHintsUsedByStep] = useState(() => {
    const initial = {};
    problem.steps.forEach(step => {
      initial[step.stepId] = 0;
    });
    return initial;
  });

  // Validation feedback
  const [validationMessage, setValidationMessage] = useState(null);
  const [isValidationError, setIsValidationError] = useState(false);

  // Completion state
  const [isCompleted, setIsCompleted] = useState(false);

  // Derived state
  const currentStep = useMemo(() =>
    problem.steps[currentStepIndex],
    [problem.steps, currentStepIndex]
  );

  // The step being viewed (may differ from currentStep in review mode)
  const viewingStep = useMemo(() =>
    problem.steps[viewingStepIndex],
    [problem.steps, viewingStepIndex]
  );

  // Review mode: viewing a completed step that isn't the current active step
  const isReviewMode = viewingStepIndex < currentStepIndex;

  // Code for the step being viewed
  const userCode = useMemo(() =>
    userCodeByStep[viewingStep?.stepId] || '',
    [userCodeByStep, viewingStep]
  );

  // Code for the current active step (used when returning from review)
  const activeStepCode = useMemo(() =>
    userCodeByStep[currentStep?.stepId] || '',
    [userCodeByStep, currentStep]
  );

  const totalSteps = problem.steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = ((currentStepIndex + (isCompleted ? 1 : 0)) / totalSteps) * 100;

  // Calculate total hints used across all steps
  const totalHintsUsed = useMemo(() =>
    Object.values(hintsUsedByStep).reduce((sum, count) => sum + count, 0),
    [hintsUsedByStep]
  );

  // Update code for current step (only when not in review mode)
  const updateCode = useCallback((newCode) => {
    if (!currentStep || isReviewMode) return;

    setUserCodeByStep(prev => ({
      ...prev,
      [currentStep.stepId]: newCode
    }));

    // Clear validation message when user types
    if (validationMessage) {
      setValidationMessage(null);
      setIsValidationError(false);
    }
  }, [currentStep, validationMessage, isReviewMode]);

  // Derived hint state (based on viewing step)
  const maxHints = viewingStep?.hints?.length || 0;
  const hasMoreHints = hintLevel < maxHints;

  // Reveal next hint (increments hint level and tracks usage)
  const revealNextHint = useCallback(() => {
    if (!currentStep) return;

    const maxHints = currentStep.hints?.length || 0;
    if (hintLevel < maxHints) {
      setHintLevel(prev => prev + 1);
      // Track hint usage for this step
      setHintsUsedByStep(prev => ({
        ...prev,
        [currentStep.stepId]: Math.max(prev[currentStep.stepId] || 0, hintLevel + 1)
      }));
    }
  }, [currentStep, hintLevel]);

  // Validate current step's code against the validation rule
  const validateStep = useCallback(() => {
    if (!currentStep) return false;

    const { validationType, validationRule } = currentStep;
    const code = userCode;

    if (validationType === 'regex') {
      try {
        // Create regex with multiline and case-insensitive flags
        const regex = new RegExp(validationRule, 'is');
        return regex.test(code);
      } catch (e) {
        console.error('Invalid regex pattern:', validationRule, e);
        return false;
      }
    }

    // Add more validation types here as needed
    return false;
  }, [currentStep, userCode]);

  // Submit current step
  const submitStep = useCallback(() => {
    const isValid = validateStep();

    if (isValid) {
      if (isLastStep) {
        // Problem completed!
        setIsCompleted(true);
        setValidationMessage('Congratulations! You have completed the problem!');
        setIsValidationError(false);
      } else {
        // Move to next step
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        setViewingStepIndex(nextIndex); // Also update viewing to the new step
        setValidationMessage('Correct! Moving to the next step...');
        setIsValidationError(false);
        setHintLevel(0); // Reset hint level for next step

        // Clear success message after a delay
        setTimeout(() => {
          setValidationMessage(null);
        }, 2000);
      }
    } else {
      setValidationMessage('Incorrect. Please check your code and try again. Use hints if you need help!');
      setIsValidationError(true);
    }

    return isValid;
  }, [validateStep, isLastStep]);

  // View a specific step (for review mode - doesn't change progress)
  const viewStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex <= currentStepIndex) {
      setViewingStepIndex(stepIndex);
      setHintLevel(0); // Reset hint level when viewing different step
      setValidationMessage(null);
      setIsValidationError(false);
    }
  }, [currentStepIndex]);

  // Return to current active step from review mode
  const returnToCurrentStep = useCallback(() => {
    setViewingStepIndex(currentStepIndex);
    setHintLevel(0);
    setValidationMessage(null);
    setIsValidationError(false);
  }, [currentStepIndex]);

  // Reset the entire problem
  const resetProblem = useCallback(() => {
    setCurrentStepIndex(0);
    setViewingStepIndex(0); // Also reset viewing step
    setUserCodeByStep(() => {
      const initial = {};
      problem.steps.forEach(step => {
        initial[step.stepId] = step.placeholderCode || '';
      });
      return initial;
    });
    setHintLevel(0); // Reset hint level
    setHintsUsedByStep(() => {
      const initial = {};
      problem.steps.forEach(step => {
        initial[step.stepId] = 0;
      });
      return initial;
    }); // Reset hints tracking
    setValidationMessage(null);
    setIsValidationError(false);
    setIsCompleted(false);
  }, [problem.steps]);

  return {
    // State
    currentStepIndex,
    viewingStepIndex,
    currentStep,
    viewingStep,
    userCode,
    isReviewMode,
    hintLevel,
    maxHints,
    hasMoreHints,
    totalHintsUsed,
    validationMessage,
    isValidationError,
    isCompleted,
    totalSteps,
    isLastStep,
    progress,

    // Actions
    updateCode,
    revealNextHint,
    submitStep,
    viewStep,
    returnToCurrentStep,
    resetProblem,
  };
}

export default useScaffoldedLearning;
