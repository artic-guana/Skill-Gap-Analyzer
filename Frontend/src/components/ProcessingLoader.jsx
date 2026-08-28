import { BrainCircuit, LoaderCircle } from "lucide-react";

import useProcessingStore from "@/store/useProcessingStore";

const ProcessingLoader = () => {
  const { isProcessing, title, message, progress } = useProcessingStore();

  if (!isProcessing) {
    return null;
  }

  const percentage = Math.min(Math.max(Number(progress) || 0, 0), 100);

  return (
    <div
      className="processing-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="processing-card">
        <div className="processing-icon">
          <BrainCircuit size={24} aria-hidden="true" />
        </div>

        <div className="processing-heading">
          <LoaderCircle
            size={18}
            className="processing-spinner"
            aria-hidden="true"
          />
          <h2>{title}</h2>
        </div>

        <p>{message}</p>

        <div
          className="processing-progress"
          role="progressbar"
          aria-label="Processing progress"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={percentage}
        >
          <span
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <small>{percentage}% complete</small>
      </div>
    </div>
  );
};

export default ProcessingLoader;