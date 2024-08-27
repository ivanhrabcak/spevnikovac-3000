import { invoke } from "@tauri-apps/api";
import { useContext, useState } from "react";
import { TextNode } from "../components/ChordsPreview";
import Cross from "../assets/x.svg?react";
import { PhysicalButton } from "../components/PhysicalButton";
import { SongsContext } from "../components/context/songs-context";
import { useNavigate } from "react-router-dom";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ProgressTrackBar } from "../components/ProgressTrackBar";

type LyricsWithChords = { artist: string; song_name: string; text: TextNode[] };

export const AddSongsRoute = () => {
  const { isLoaded, songs, setSongs } = useContext(SongsContext);

  const [url, setUrl] = useState("");
  const [isLoading, setLoading] = useState(!isLoaded);

  const [parent] = useAutoAnimate();

  const navigate = useNavigate();

  const addSong = async () => {
    setLoading(true);

    const result = (await invoke("fetch", { url })) as LyricsWithChords;

    console.log(result);

    const newItem: Record<string, TextNode[]> = {};
    newItem[`${result.song_name} - ${result.artist}`] = result.text;

    setLoading(false);
    setSongs({
      ...songs,
      ...newItem,
    });
  };

  return (
    <div className="flex flex-col select-none h-full items-center gap-4">
      <ProgressTrackBar currentStep={0} />
      {/* <div className="text-5xl font-bold text-center mt-5">
        Pridaj pesničky:
      </div> */}
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
        <button className="btn w-20" type="submit">
          {isLoading && (
            <span className="loading relative loading-spinner loading-md" />
          )}
          {!isLoading && "Pridaj"}
        </button>
      </form>

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
            navigate("/choose");
          }
        }}
        className="btn btn-primary fixed bottom-5"
      >
        Ďalej
      </button>
    </div>
  );
};
