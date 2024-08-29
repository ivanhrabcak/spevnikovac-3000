import { useNavigate } from "react-router-dom";

const steps = [
  { name: "Pridaj pesničky", path: "/" },
  { name: "Uprav", path: "/choose" },
  { name: "Exportuj", path: "/" },
];

type Props = {
  currentStep: number;
};

export const ProgressTrackBar = ({ currentStep }: Props) => {
  const navigate = useNavigate();

  return (
    <div role="tablist" className="transition-all mt-2 tabs tabs-boxed">
      {steps.map((step, i) => (
        <div
          onClick={() => {
            if (i <= currentStep) {
              navigate(step.path);
            }
          }}
          role="tab"
          className={
            currentStep == i
              ? "tab tab-active cursor-pointer"
              : i <= currentStep
              ? "tab"
              : "tab text-gray-400 cursor-default"
          }
        >
          {step.name}
        </div>
      ))}
    </div>
  );
};
