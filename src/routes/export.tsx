import { useContext, useEffect, useState } from "react";
import { SongsContext, parseSongKey } from "../components/context/songs-context";
import { ProgressTrackBar } from "../components/ProgressTrackBar";
import { desktopDir, join } from "@tauri-apps/api/path";
import { open, save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import ConfettiExplosion from "react-confetti-explosion";
import { useNavigate } from "react-router-dom";

type Format = "docx" | "chordpro";

export const ExportRoute = () => {
  const { songs } = useContext(SongsContext);
  const navigate = useNavigate();

  const [format, setFormat] = useState<Format>("docx");

  const [docxPath, setDocxPath] = useState<string | null>(null);
  const [chordproDir, setChordproDir] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    const setDefaults = async () => {
      const desktopPath = await desktopDir();

      setDocxPath(await join(desktopPath, "songs.docx"));
      setChordproDir(desktopPath);
    };

    setDefaults();
  }, []);

  const path = format == "docx" ? docxPath : chordproDir;

  const pickPath = async () => {
    if (format == "docx") {
      const v = await save({
        defaultPath: docxPath ?? "",
        filters: [{ name: "akordy", extensions: ["docx"] }],
      });
      if (v != null) setDocxPath(v);
    } else {
      const v = await open({ directory: true, defaultPath: chordproDir ?? undefined });
      if (typeof v === "string") setChordproDir(v);
    }
  };

  const startExport = async () => {
    if (path == null) return;

    setIsExporting(true);

    const mappedChords = Object.keys(songs).map((k) => {
      const { artist, songName } = parseSongKey(k);
      const text = songs[k];

      return { artist, song_name: songName, text: text.nodes };
    });

    if (format == "docx") {
      await invoke("write_docx", { songs: mappedChords, path });
    } else {
      await invoke("write_chordpro", { songs: mappedChords, dir: path });
    }

    setIsExporting(false);
    setHasExported(true);
    setConfettiKey((k) => k + 1);
  };

  return (
    <div className="flex select-none flex-col gap-5 h-full items-center">
      {hasExported && <ConfettiExplosion key={confettiKey} duration={5000} />}
      <div className="justify-self-start">
        <ProgressTrackBar currentStep={2} />
      </div>
      <div className="flex flex-col items-center h-full gap-5 w-full justify-center">
        <div role="tablist" className="tabs tabs-boxed">
          <div
            role="tab"
            className={format == "docx" ? "tab tab-active" : "tab"}
            onClick={() => setFormat("docx")}
          >
            Word (.docx)
          </div>
          <div
            role="tab"
            className={format == "chordpro" ? "tab tab-active" : "tab"}
            onClick={() => setFormat("chordpro")}
          >
            ChordPro
          </div>
        </div>

        <div className="flex items-center w-full justify-center gap-3">
          <div>Uložiť do:</div>
          <input
            readOnly
            onClick={pickPath}
            value={path ?? ""}
            className="input input-bordered w-[50%] cursor-pointer"
          />
        </div>

        <button
          onClick={startExport}
          type="button"
          className="btn btn-primary"
          disabled={isExporting || path == null}
        >
          {isExporting && (
            <span className="loading relative loading-spinner loading-md" />
          )}
          {!isExporting && "Exportovať"}
        </button>
      </div>

      {hasExported && (
        <button
          className="btn btn-warning mb-5"
          onClick={() => navigate("/")}
        >
          Od začiatku
        </button>
      )}
    </div>
  );
};
