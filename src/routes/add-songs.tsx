import { useAutoAnimate } from "@formkit/auto-animate/react";
import { invoke } from "@tauri-apps/api/core";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cross from "../assets/x.svg?react";
import { TextNode } from "../components/ChordsEditor";
import { Song, SongsContext } from "../components/context/songs-context";
import { ProgressTrackBar } from "../components/ProgressTrackBar";
import { SONGS_LIST } from "../songs-list";

type LyricsWithChords = { artist: string; song_name: string; text: TextNode[] };

const supportedSources = ["ultimate-guitar.com", "supermusic.cz"];

export const AddSongsRoute = () => {
  const { isLoaded, songs, setSongs } = useContext(SongsContext);

  const [url, setUrl] = useState("");
  const [isLoading, setLoading] = useState(!isLoaded);
  const [errorMessage, setErrorMessage] = useState("");

  const [parent] = useAutoAnimate();

  const navigate = useNavigate();

  const [queuedUrls] = useState<string[]>(SONGS_LIST);
  const [batchStatus, setBatchStatus] = useState<
    Record<string, "pending" | "success" | "error">
  >({});
  const [isBatchRunning, setBatchRunning] = useState(false);

  const fetchAll = async () => {
    setBatchRunning(true);
    const initialStatus: Record<string, "pending" | "success" | "error"> = {};
    queuedUrls.forEach((u) => (initialStatus[u] = "pending"));
    setBatchStatus(initialStatus);

    const collected: Record<string, Song> = {};

    for (const queuedUrl of queuedUrls) {
      try {
        const result = (await invoke("fetch", {
          url: queuedUrl,
        })) as LyricsWithChords;
        collected[`${result.song_name} - ${result.artist}`] = {
          nodes: result.text,
          transposedBy: 0,
        };
        setBatchStatus((prev) => ({ ...prev, [queuedUrl]: "success" }));
        setSongs((prevSongs) => ({ ...prevSongs, ...collected }));
      } catch (e) {
        setBatchStatus((prev) => ({ ...prev, [queuedUrl]: "error" }));
      }
    }

    setBatchRunning(false);
  };

  const addSong = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result = (await invoke("fetch", { url })) as LyricsWithChords;

      const newItem: Record<string, Song> = {};
      newItem[`${result.song_name} - ${result.artist}`] = {
        nodes: result.text,
        transposedBy: 0,
      };

      setSongs({
        ...songs,
        ...newItem,
      });
    } catch (e) {
      setErrorMessage(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col select-none h-full items-center gap-4">
      <ProgressTrackBar currentStep={0} />
      <div className="flex flex-col w-full items-center">
        {errorMessage != "" && (
          <div className="text-sm text-red-500">{errorMessage}</div>
        )}
        <form
          className="flex items-center w-[50%]"
          onSubmit={(e) => {
            e.preventDefault();
            addSong();
          }}
        >
          <input
            className="input input-bordered m-3 w-full"
            onChange={(e) => setUrl(e.currentTarget.value)}
            placeholder="URL..."
          />
          <button
            onClick={(e) => {
              if (supportedSources.filter((k) => url.includes(k)).length == 0) {
                e.preventDefault();
                setErrorMessage("Táto stránka zatiaľ nie je podporovaná!");
              } else {
                setErrorMessage("");
              }
            }}
            className="btn w-20"
            type="submit"
          >
            {isLoading && (
              <span className="loading relative loading-spinner loading-md" />
            )}
            {!isLoading && "Pridaj"}
          </button>
        </form>
        <div className="flex flex-col items-center w-[50%] gap-2 mt-4">
          <button
            className="btn"
            disabled={isBatchRunning}
            onClick={fetchAll}
          >
            {isBatchRunning
              ? "Načítavam..."
              : `Načítať všetky (${queuedUrls.length})`}
          </button>
          {Object.keys(batchStatus).length > 0 && (
            <div className="w-full max-h-48 overflow-y-auto text-sm">
              {queuedUrls.map((u) => (
                <div key={u} className="flex justify-between gap-2">
                  <span className="truncate">{u}</span>
                  <span>
                    {batchStatus[u] === "pending" && "..."}
                    {batchStatus[u] === "success" && "✓"}
                    {batchStatus[u] === "error" && "✗"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center w-full text-center flex-col">
        <div className="text-xl font-semibold mb-5">
          Zoznam pridaných pesničiek:
        </div>
        <div ref={parent} className="h-full w-full">
          {Object.keys(songs).length == 0 && (
            <div>Žiadne pridané pesničky!</div>
          )}
          {Object.keys(songs).length != 0 && (
            <div className="w-full flex flex-col items-center">
              {Object.keys(songs)
                .sort()
                .map((songName, i, arr) => (
                  <div className="flex flex-col w-full items-center">
                    <div
                      key={songName}
                      className="flex justify-between w-[60%]"
                    >
                      <div>{songName}</div>
                      <Cross
                        onClick={() => {
                          setSongs((songs) => {
                            delete songs[songName];
                            console.log("deleted " + songName);
                            console.log(songs);
                            return { ...songs };
                          });
                        }}
                        className="remove-icon"
                      />
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
      <button
        onClick={() => {
          if (Object.keys(songs).length != 0) {
            navigate("/edit");
          }
        }}
        className="btn btn-primary fixed bottom-5"
      >
        Ďalej
      </button>
    </div>
  );
};
