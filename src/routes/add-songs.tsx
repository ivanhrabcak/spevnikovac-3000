import { useAutoAnimate } from "@formkit/auto-animate/react";
import { invoke } from "@tauri-apps/api/core";
import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cross from "../assets/x.svg?react";
import { TextNode } from "../components/ChordsEditor";
import { Song, SongsContext, makeSongKey } from "../components/context/songs-context";
import { ProgressTrackBar } from "../components/ProgressTrackBar";

type LyricsWithChords = { artist: string; song_name: string; text: TextNode[] };

const supportedSources = ["ultimate-guitar.com", "supermusic.cz"];

type Row =
  | { kind: "song"; key: string; label: string }
  | { kind: "pending" | "error"; key: string; label: string };

export const AddSongsRoute = () => {
  const { isLoaded, songs, addSongs, deleteSong, deleteAllSongs } =
    useContext(SongsContext);

  const [urlsText, setUrlsText] = useState("");
  const [batchStatus, setBatchStatus] = useState<
    Record<string, "pending" | "error">
  >({});
  const [isBatchRunning, setBatchRunning] = useState(false);

  const [parent] = useAutoAnimate();

  const navigate = useNavigate();
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const submitUrls = async () => {
    const urls = urlsText
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u != "");

    if (urls.length == 0) return;

    setBatchRunning(true);
    setUrlsText("");
    setBatchStatus((prev) => {
      const next = { ...prev };
      urls.forEach((u) => (next[u] = "pending"));
      return next;
    });

    for (const url of urls) {
      if (supportedSources.filter((k) => url.includes(k)).length == 0) {
        setBatchStatus((prev) => ({ ...prev, [url]: "error" }));
        continue;
      }

      try {
        const result = (await invoke("fetch", { url })) as LyricsWithChords;

        const newItem: Record<string, Song> = {};
        newItem[makeSongKey(result.artist, result.song_name)] = {
          nodes: result.text,
          transposedBy: 0,
        };

        addSongs(newItem);
        setBatchStatus((prev) => {
          const next = { ...prev };
          delete next[url];
          return next;
        });
      } catch (e) {
        setBatchStatus((prev) => ({ ...prev, [url]: "error" }));
      }
    }

    setBatchRunning(false);
  };

  const dismissBatchEntry = (url: string) => {
    setBatchStatus((prev) => {
      const next = { ...prev };
      delete next[url];
      return next;
    });
  };

  const confirmDeleteAll = () => {
    deleteAllSongs();
    setBatchStatus({});
    deleteDialogRef.current?.close();
  };

  const rows: Row[] = [
    ...Object.keys(songs)
      .sort()
      .map((name): Row => ({ kind: "song", key: name, label: name })),
    ...Object.keys(batchStatus).map(
      (url): Row => ({ kind: batchStatus[url], key: url, label: url })
    ),
  ];

  return (
    <div className="flex flex-col select-none h-full items-center gap-4">
      <ProgressTrackBar currentStep={0} />
      {!isLoaded && <h1>Načítavam...</h1>}
      {isLoaded && (
        <>
          <div className="flex flex-col w-full items-center">
            <div className="flex items-center w-[50%] gap-2">
              <textarea
                className="textarea textarea-bordered m-3 w-full"
                rows={5}
                placeholder={"URL adresa pesničky (jedna na riadok)..."}
                value={urlsText}
                onChange={(e) => setUrlsText(e.currentTarget.value)}
              />
              <button
                className="btn w-32"
                disabled={isBatchRunning || urlsText.trim() == ""}
                onClick={submitUrls}
              >
                {isBatchRunning && (
                  <span className="loading relative loading-spinner loading-md" />
                )}
                {!isBatchRunning && "Pridaj"}
              </button>
            </div>
          </div>

          <div className="flex items-center w-full text-center flex-col">
            <div className="text-xl font-semibold mb-5">
              Zoznam pridaných pesničiek:
            </div>
            <div ref={parent} className="h-full w-full">
              {rows.length == 0 && <div>Žiadne pridané pesničky!</div>}
              {rows.length != 0 && (
                <div className="w-full flex flex-col items-center">
                  {rows.map((row, i, arr) => (
                    <div
                      key={row.key}
                      className="flex flex-col w-full items-center"
                    >
                      <div className="flex justify-between items-center gap-2 w-[60%]">
                        <div className="truncate">{row.label}</div>
                        {row.kind === "song" && (
                          <Cross
                            onClick={() => deleteSong(row.key)}
                            className="remove-icon shrink-0"
                          />
                        )}
                        {row.kind === "pending" && (
                          <span className="loading loading-spinner loading-sm shrink-0" />
                        )}
                        {row.kind === "error" && (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-red-500">✗</span>
                            <Cross
                              onClick={() => dismissBatchEntry(row.key)}
                              className="remove-icon"
                            />
                          </div>
                        )}
                      </div>
                      {i != arr.length - 1 && (
                        <div className="divider self-center w-[80%]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {rows.length != 0 && (
            <button
              className="btn btn-outline btn-error fixed bottom-5 left-5"
              onClick={() => deleteDialogRef.current?.showModal()}
            >
              Zmazať všetky
            </button>
          )}
          <button
            onClick={() => {
              if (Object.keys(songs).length != 0) {
                navigate("/edit");
              }
            }}
            className="btn btn-primary fixed bottom-5 right-5"
          >
            Ďalej
          </button>

          <dialog ref={deleteDialogRef} className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Zmazať všetky pesničky?</h3>
              <p className="py-4">
                Naozaj chceš zmazať všetkých {Object.keys(songs).length}{" "}
                pesničiek? Táto akcia sa nedá vrátiť späť.
              </p>
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Zrušiť</button>
                </form>
                <button className="btn btn-error" onClick={confirmDeleteAll}>
                  Zmazať všetky
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>zavrieť</button>
            </form>
          </dialog>
        </>
      )}
    </div>
  );
};
