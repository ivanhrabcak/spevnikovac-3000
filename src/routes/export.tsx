import { useContext, useEffect, useState } from "react";
import { SongsContext } from "../components/context/songs-context";
import { ProgressTrackBar } from "../components/ProgressTrackBar";
import { desktopDir, join } from "@tauri-apps/api/path";
import { open, save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import ConfettiExplosion from "react-confetti-explosion";
import { useNavigate } from "react-router-dom";

export const ExportRoute = () => {
  const { songs, setSongs } = useContext(SongsContext);
  const navigate = useNavigate();

  const [savePath, setSavePath] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const [chordproDir, setChordproDir] = useState<string | null>(null);
  const [isChordproLoading, setChordproLoading] = useState(false);
  const [isChordproDone, setChordproDone] = useState(false);

  useEffect(() => {
    const getSavePath = async () => {
      const desktopPath = await desktopDir();

      setSavePath(await join(desktopPath, "songs.docx"));
    };

    if (savePath == null) {
      getSavePath();
    }
  }, []);

  const startExport = async () => {
    setLoading(true);
    const mappedChords = Object.keys(songs).map((k) => {
      const [artist, song_name] = k.split(" - ");
      const text = songs[k];

      return { artist, song_name, text: text.nodes };
    });

    console.log(mappedChords);

    const result = await invoke("write_docx", {
      songs: mappedChords,
      path: savePath,
    });

    setLoading(false);
    setIsDone(true);

    console.log(result);
  };

  const startChordproExport = async () => {
    if (chordproDir == null) return;

    setChordproLoading(true);
    const mappedChords = Object.keys(songs).map((k) => {
      const [artist, song_name] = k.split(" - ");
      const text = songs[k];

      return { artist, song_name, text: text.nodes };
    });

    await invoke("write_chordpro", {
      songs: mappedChords,
      dir: chordproDir,
    });

    setChordproLoading(false);
    setChordproDone(true);
  };

  return (
    <div className="flex select-none flex-col gap-5 h-full items-center">
      {isDone && <ConfettiExplosion duration={5000} />}
      <div className="justify-self-start">
        <ProgressTrackBar currentStep={2} />
      </div>
      <form className="flex flex-col items-center h-full gap-5 w-full justify-center">
        <div className="flex items-center w-full justify-center gap-3">
          <div>Uložiť do:</div>
          <input
            onClick={(e) => {
              e.preventDefault();
              (e.target as any).blur();
              save({
                defaultPath: savePath ?? "",
                filters: [
                  {
                    name: "akordy",
                    extensions: ["docx"],
                  },
                ],
              }).then((v) => {
                if (v != null) {
                  setSavePath(v);
                }
              });
            }}
            value={savePath ?? ""}
            className="input input-bordered w-[50%]"
          />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            startExport();
          }}
          type="submit"
          className="btn btn-primary"
          disabled={isDone}
        >
          {isLoading && (
            <span className="loading relative loading-spinner loading-md" />
          )}
          {!isLoading && "Uložiť"}
        </button>
      </form>

      <div className="flex flex-col items-center w-full gap-3 mt-5">
        <button
          type="button"
          className="btn"
          onClick={async () => {
            const dir = await open({ directory: true });
            if (typeof dir === "string") setChordproDir(dir);
          }}
        >
          {chordproDir ?? "Vybrať priečinok pre ChordPro"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={chordproDir == null || isChordproDone}
          onClick={startChordproExport}
        >
          {isChordproLoading && (
            <span className="loading relative loading-spinner loading-md" />
          )}
          {!isChordproLoading && "Exportovať ako ChordPro"}
        </button>
      </div>

      {isDone && (
        <button
          className="btn btn-warning mb-5"
          onClick={() => {
            setSongs({});
            navigate("/");
          }}
        >
          Od začiatku
        </button>
      )}
    </div>
  );
};
