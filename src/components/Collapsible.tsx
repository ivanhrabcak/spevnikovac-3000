import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ReactNode, useState } from "react";

type Props = {
  title: ReactNode;
  children: ReactNode;
  isShown?: boolean;
  className?: string;
};

export const Collapsible = ({
  title,
  children,
  className,
  isShown: isShown_,
}: Props) => {
  const [isShown, setShown] = useState(isShown_ ?? false);

  const [parent] = useAutoAnimate();

  return (
    <div
      className={
        "collapse collapse-arrow flex flex-col items-center " +
        (className ?? "")
      }
      onClick={!isShown ? () => setShown(!isShown) : undefined}
    >
      <input type="checkbox" readOnly={false} checked={isShown} />
      <div
        className="text-xl font-bold collapse-title px-0"
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
