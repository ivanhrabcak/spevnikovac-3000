import { useDraggable, useDroppable } from "@dnd-kit/core";

type Props = {
  chord: string;
  id: string;
};

export const Chord = ({ chord, id }: Props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${id}`,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : { transform: "translate(0, -4px)" };

  return (
    <span
      key={id}
      ref={setNodeRef}
      className="text-sm"
      style={style}
      {...listeners}
      {...attributes}
    >
      <b>{chord}</b>
    </span>
  );
};
