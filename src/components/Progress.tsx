import { STEP_NAMES } from "../types";

interface ProgressProps {
  currentStep: number;
  completedSteps: boolean[];
  onSelectStep: (step: number) => void;
}

export function Progress({
  currentStep,
  completedSteps,
  onSelectStep,
}: ProgressProps) {
  return (
    <nav className="step-progress" aria-label="制作工序">
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${(currentStep / (STEP_NAMES.length - 1)) * 100}%` }} />
      </div>
      {STEP_NAMES.map((name, index) => (
        <button
          className={`progress-stop ${currentStep === index ? "is-current" : ""} ${completedSteps[index] ? "is-complete" : ""}`}
          key={name}
          onClick={() => onSelectStep(index)}
          type="button"
          aria-current={currentStep === index ? "step" : undefined}
          aria-label={`第 ${index + 1} 步：${name}${completedSteps[index] ? "，已完成" : ""}`}
        >
          <span className="progress-dot">{completedSteps[index] ? "✓" : `0${index + 1}`}</span>
          <span className="progress-name">{name}</span>
        </button>
      ))}
    </nav>
  );
}

