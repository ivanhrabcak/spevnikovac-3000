import { useContext, useEffect, useState } from "react";
import { SongsContext } from "../components/context/songs-context";
import { ProgressTrackBar } from "../components/ProgressTrackBar";
import { desktopDir } from "@tauri-apps/api/path";
import { save } from "@tauri-apps/api/dialog";

export const ExportRoute = () => {
  const { songs } = useContext(SongsContext);
  const [savePath, setSavePath] = useState<string | null>(null);

  useEffect(() => {
    const getSavePath = async () => {
      setSavePath(await desktopDir());
    };

    if (savePath == null) {
      getSavePath();
    }
  }, []);
  return (
    <div className="flex flex-col gap-5 h-full items-center">
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
            console.log("works!");
          }}
          type="submit"
          className="btn btn-primary"
        >
          Uložiť
        </button>
      </form>
    </div>
  );
};
