import { useContext } from "react";
import { SongsContext } from "../components/context/songs-context";
import { ChordsEditor, TextNode } from "../components/ChordsEditor";
import { ProgressTrackBar } from "../components/ProgressTrackBar";
import { Collapsible } from "../components/Collapsible";
import { useNavigate } from "react-router-dom";

export const EditSongsRoute = () => {
  const { isLoaded, songs, setSongs } = useContext(SongsContext);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-4">
      <ProgressTrackBar currentStep={1} />
      {!isLoaded && <h1>Loading...</h1>}
      <div>Akordy môžes presunúť potiahnutím</div>
      <button onClick={() => navigate("/export")} className="btn">
        Hotovo!
      </button>
      {Object.keys(songs).map((name) => {
        return (
          <Collapsible
            className="w-[90%]"
            title={
              <div className="select-none flex items-center justify-between">
                {name}
              </div>
            }
          >
            <div className="touch-none overflow-x-hidden overflow-y-auto">
              <ChordsEditor
                setChords={(ch: TextNode[]) => {
                  songs[name] = ch;
                  setSongs({ ...songs });
                }}
                chords={songs[name]}
              />
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
};
