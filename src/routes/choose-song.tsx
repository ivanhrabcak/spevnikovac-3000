import { useContext, useState } from "react";
import { SongsContext } from "../components/context/songs-context";
import { ChordsPreview } from "../components/ChordsPreview";
import { ProgressTrackBar } from "../components/ProgressTrackBar";
import { Collapsible } from "../components/Collapsible";

export const ChooseSongRoute = () => {
  const { isLoaded, songs, setSongs } = useContext(SongsContext);

  return (
    <div className="flex flex-col items-center gap-4">
      <ProgressTrackBar currentStep={1} />
      {!isLoaded && <h1>Loading...</h1>}
      {Object.keys(songs).map((name) => {
        return (
          <Collapsible title={<div className="select-none">{name}</div>}>
            <div className="max-h-[500px] w-full overflow-auto">
              <ChordsPreview chords={songs[name]} />
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
};
