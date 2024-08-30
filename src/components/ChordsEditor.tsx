import { DndContext } from "@dnd-kit/core";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { Chord } from "./chords-editor/Chord";
import { PossibleChordPlace } from "./chords-editor/PossibleChordPlace";

type Chord = { Chord: string };
type Label = { Label: string };
type Text = { Text: string };
export type TextNode = "Newline" | Chord | Label | Text;
export type Node = { Node: TextNode };
export type EditingHint = "PossibleChordPlace" | Node;

type Props = {
  chords: TextNode[];
  setChords: (chords: TextNode[]) => void;
  transposedBy: number;
  setTransposedBy: (n: number) => void;
};

export const ChordsEditor = ({
  chords,
  setChords,
  transposedBy,
  setTransposedBy,
}: Props) => {
  const [editingHits, setEditingHints] = useState<null | EditingHint[]>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [lines, setLines] = useState<(TextNode | "PossibleChordPlace")[][]>([]);

  const getEditingHints = async (chords: TextNode[]) => {
    const result = (await invoke("get_editing_hints", {
      nodes: chords,
    })) as EditingHint[];
    setEditingHints(result);
  };

  const convertToRustFormat = (
    lines: (TextNode | "PossibleChordPlace")[][]
  ) => {
    return lines
      .map((l) => l.filter((n) => n != "PossibleChordPlace"))
      .flatMap((l) => [...l, "Newline"]) as TextNode[];
  };

  const transpose = async (modifier: number) => {
    const nodes = convertToRustFormat(lines);
    const result = (await invoke("transpose", {
      nodes,
      modifier,
    })) as TextNode[];

    const lineByLine: TextNode[][] = [[]];
    result.forEach((node) => {
      if (node != "Newline") {
        lineByLine[lineByLine.length - 1].push(node);
      } else {
        lineByLine.push([]);
      }
    });

    setLines(lineByLine);
  };

  useEffect(() => {
    if (lines.length == 0 && editingHits != null) {
      const l = editingHits.reduce(
        (acc, node) => {
          if (node == "PossibleChordPlace") {
            acc[acc.length - 1].push(node);
            return acc;
          }

          const value = (node as Node).Node;
          if (value != "Newline") {
            acc[acc.length - 1].push((node as Node).Node);
          } else {
            acc.push([]);
          }

          return acc;
        },
        [[]] as (TextNode | "PossibleChordPlace")[][]
      );

      setLines(l);
    }

    if (editingHits != null) {
      return;
    }

    getEditingHints(chords);
  }, [editingHits, setEditingHints, lines]);

  useEffect(() => {
    if (lines.length == 0) {
      return;
    }

    const nodes = convertToRustFormat(lines);

    setChords(nodes);
    getEditingHints(nodes);
  }, [lines]);

  return (
    <DndContext
      onDragEnd={(ev) => {
        const { over, active } = ev;

        if (over == null || active == null) {
          setIsDragging(false);
          return;
        }

        const partsOver = over?.id.toString().split("-");
        const partsDragged = active?.id.toString().split("-");

        const overI = +(partsOver ?? [0])[0];
        let overJ = +(partsOver ?? [1])[1];

        const draggedI = +(partsDragged ?? [0])[0];
        const draggedJ = +(partsDragged ?? [1])[1];

        const node = lines[draggedI][draggedJ];

        lines[draggedI] = lines[draggedI].filter((_, j) => j != draggedJ);

        // the entry was dragged further in this line
        // the length of this line has changed
        if (draggedI == overI && overJ > draggedJ) {
          overJ--;
        }

        lines[overI] = lines[overI].flatMap((n, j) => {
          if (j == overJ) {
            return [n, node];
          } else {
            return [n];
          }
        });

        lines[overI] = lines[overI].flatMap((n, i, arr) => {
          if (i == 0) {
            return [n];
          }

          // check if there are two chords withou ta space between them
          let firstPrevious = null;
          let k = i - 1;

          // skip all hints
          while (k >= 0 && arr[k] == "PossibleChordPlace") {
            k--;
          }

          // there is a node that is not a hint in before of this one
          if (k != -1) {
            firstPrevious = arr[k];
          } else {
            return [n];
          }

          // it is a chord! we insert a space
          if (
            (firstPrevious as Chord).Chord != undefined &&
            (n as Chord).Chord != undefined
          ) {
            return [{ Text: " " }, n];
          } else if (
            (firstPrevious as Text).Text != undefined &&
            (n as Text).Text != undefined &&
            (n as Text).Text == " " &&
            (firstPrevious as Text).Text == " "
          ) {
            // 2 consecutive spaces!
            return [];
          } else {
            return [n];
          }
        });

        setIsDragging(false);
        setLines([...lines]);
      }}
      onDragStart={() => setIsDragging(true)}
    >
      <div className="w-[80vw] flex flex-col">
        <div className="mr-16 flex flex-col items-center mb-2 justify-center gap-1 text-center">
          <div className="text-sm">Transpozícia: {transposedBy}</div>
          <div className="flex items-center justify-around gap-2">
            <button
              className="btn btn-xs w-3"
              onClick={() => {
                transpose(1);
                setTransposedBy(transposedBy + 1);
              }}
            >
              +
            </button>
            <button
              onClick={() => {
                transpose(-1);
                setTransposedBy(transposedBy - 1);
              }}
              className="btn btn-xs w-3"
            >
              -
            </button>
          </div>
        </div>
        {lines.map((line, i) => (
          <div className="flex items-center touch-none">
            {line.map((node, j) => {
              const key = `${i}-${j}`;
              if ((node as Chord).Chord != undefined) {
                return (
                  <Chord chord={(node as Chord).Chord} id={key} key={key} />
                );
              } else if ((node as Label).Label != undefined) {
                return <b key={i + j}>{(node as Label).Label}</b>;
              } else if ((node as Text).Text != undefined) {
                return (
                  <span className="whitespace-pre" key={i + j}>
                    {(node as Text).Text}
                  </span>
                );
              } else if (node == "PossibleChordPlace") {
                return <>{isDragging && <PossibleChordPlace id={key} />}</>;
              }
            })}
          </div>
        ))}
      </div>
    </DndContext>
  );
};
