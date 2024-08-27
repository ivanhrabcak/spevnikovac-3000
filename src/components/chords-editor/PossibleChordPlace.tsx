import { useDroppable } from "@dnd-kit/core";

type Props = {
  id: string;
};

export const PossibleChordPlace = ({ id }: Props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const style = {
    backgroundColor: isOver ? "lightblue" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-3 h-5 rounded-md border border-sky-500 border-dashed"
    />
  );
};
