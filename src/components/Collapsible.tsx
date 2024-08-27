import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ReactNode, useState } from "react";

type Props = {
  title: ReactNode;
  children: ReactNode;
  isShown?: boolean;
};

export const Collapsible = ({ title, children, isShown: isShown_ }: Props) => {
  const [isShown, setShown] = useState(isShown_ ?? false);

  const [parent] = useAutoAnimate();

  return (
    <div
      className="collapse collapse-arrow flex flex-col items-center"
      onClick={!isShown ? () => setShown(!isShown) : undefined}
    >
      <input type="checkbox" checked={isShown} />
      <div
        className="text-xl font-bold collapse-title"
        onClick={isShown ? () => setShown(!isShown) : undefined}
      >
        {title}
      </div>
      <div ref={parent} className="collapse-content">
        {isShown && children}
      </div>
    </div>
  );
};
