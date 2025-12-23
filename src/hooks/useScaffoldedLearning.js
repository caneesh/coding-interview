import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing scaffolded learning state.
 * Handles step progression, code input, hint visibility, and validation.
 *
 * @param {Object} problem - The problem data following the scaffolded learning data model
 * @returns {Object} State and handlers for the scaffolded learning component
 */
export function useScaffoldedLearning(problem) {
  // Current step index (0-based)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // User's code input for each step (keyed by stepId)
  const [userCodeByStep, setUserCodeByStep] = useState(() => {
    const initial = {};
    problem.steps.forEach(step => {
      initial[step.stepId] = step.placeholderCode || '';
    });
    return initial;
  });

  // Hint visibility state
  const [isHintVisible, setIsHintVisible] = useState(false);

  // Current hint index (for multi-hint steps)
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

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

  const userCode = useMemo(() =>
    userCodeByStep[currentStep?.stepId] || '',
    [userCodeByStep, currentStep]
  );

  const totalSteps = problem.steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = ((currentStepIndex + (isCompleted ? 1 : 0)) / totalSteps) * 100;

  // Update code for current step
  const updateCode = useCallback((newCode) => {
    if (!currentStep) return;

    setUserCodeByStep(prev => ({
      ...prev,
      [currentStep.stepId]: newCode
    }));

    // Clear validation message when user types
    if (validationMessage) {
      setValidationMessage(null);
      setIsValidationError(false);
    }
  }, [currentStep, validationMessage]);

  // Toggle hint visibility
  const toggleHint = useCallback(() => {
    setIsHintVisible(prev => !prev);
  }, []);

  // Show next hint
  const showNextHint = useCallback(() => {
    if (!currentStep) return;

    const maxHints = currentStep.hints?.length || 0;
    if (currentHintIndex < maxHints - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  }, [currentStep, currentHintIndex]);

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
        setCurrentStepIndex(prev => prev + 1);
        setValidationMessage('Correct! Moving to the next step...');
        setIsValidationError(false);
        setIsHintVisible(false);
        setCurrentHintIndex(0);

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

  // Reset to a specific step (for navigation if needed)
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex <= currentStepIndex) {
      setCurrentStepIndex(stepIndex);
      setIsHintVisible(false);
      setCurrentHintIndex(0);
      setValidationMessage(null);
      setIsValidationError(false);
    }
  }, [currentStepIndex]);

  // Reset the entire problem
  const resetProblem = useCallback(() => {
    setCurrentStepIndex(0);
    setUserCodeByStep(() => {
      const initial = {};
      problem.steps.forEach(step => {
        initial[step.stepId] = step.placeholderCode || '';
      });
      return initial;
    });
    setIsHintVisible(false);
    setCurrentHintIndex(0);
    setValidationMessage(null);
    setIsValidationError(false);
    setIsCompleted(false);
  }, [problem.steps]);

  return {
    // State
    currentStepIndex,
    currentStep,
    userCode,
    isHintVisible,
    currentHintIndex,
    validationMessage,
    isValidationError,
    isCompleted,
    totalSteps,
    isLastStep,
    progress,

    // Actions
    updateCode,
    toggleHint,
    showNextHint,
    submitStep,
    goToStep,
    resetProblem,
  };
}

export default useScaffoldedLearning;
