import { useContext, useEffect, useState } from "react";
import { SongsContext } from "../components/context/songs-context";
import { ChordsEditor, TextNode } from "../components/ChordsEditor";
import { ProgressTrackBar } from "../components/ProgressTrackBar";
import { useNavigate } from "react-router-dom";

export const EditSongsRoute = () => {
  const { isLoaded, songs, setSongChords, setSongTransposition, markSongVisited } =
    useContext(SongsContext);
  const navigate = useNavigate();

  const [selectedSong, setSelectedSong] = useState<string | null>(null);

  const sortedNames = Object.keys(songs).sort();

  const selectSong = (name: string) => {
    setSelectedSong(name);
    markSongVisited(name);
  };

  useEffect(() => {
    if (selectedSong != null && sortedNames.includes(selectedSong)) return;
    if (sortedNames.length != 0) {
      selectSong(sortedNames[0]);
    } else {
      setSelectedSong(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedNames.join(" ")]);

  const selectedIndex = selectedSong != null ? sortedNames.indexOf(selectedSong) : -1;

  const goPrev = () => {
    if (selectedIndex > 0) selectSong(sortedNames[selectedIndex - 1]);
  };

  const goNext = () => {
    if (selectedIndex != -1 && selectedIndex < sortedNames.length - 1) {
      selectSong(sortedNames[selectedIndex + 1]);
    }
  };

  return (
    <div className="flex flex-col h-full items-center gap-4">
      <ProgressTrackBar currentStep={1} />
      {!isLoaded && <h1>Loading...</h1>}
      {isLoaded && (
        <>
          <button onClick={() => navigate("/export")} className="btn">
            Hotovo!
          </button>
          <div className="flex w-full flex-1 min-h-0 items-start">
            <div className="w-48 shrink-0 m-2 py-1 rounded-lg bg-base-200 shadow-md overflow-y-auto max-h-full">
              {sortedNames.map((name) => (
                <div
                  key={name}
                  onClick={() => selectSong(name)}
                  className={
                    "flex items-center gap-2 px-3 py-2 cursor-pointer text-sm " +
                    (name === selectedSong
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200")
                  }
                >
                  <span
                    className={
                      "w-2 h-2 rounded-full shrink-0 " +
                      (songs[name].visited ? "bg-success" : "bg-transparent")
                    }
                  />
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {selectedSong == null && <div>Žiadne pesničky na úpravu.</div>}
              {selectedSong != null && (
                <>
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <button
                      className="btn btn-sm"
                      disabled={selectedIndex <= 0}
                      onClick={goPrev}
                    >
                      ← Predošlá
                    </button>
                    <div className="font-semibold text-lg truncate text-center">
                      {selectedSong}
                    </div>
                    <button
                      className="btn btn-sm"
                      disabled={selectedIndex >= sortedNames.length - 1}
                      onClick={goNext}
                    >
                      Ďalšia →
                    </button>
                  </div>
                  <div className="touch-none overflow-x-hidden overflow-y-auto">
                    <ChordsEditor
                      setChords={(ch: TextNode[]) =>
                        setSongChords(selectedSong, ch)
                      }
                      setTransposedBy={(n: number) =>
                        setSongTransposition(selectedSong, n)
                      }
                      transposedBy={songs[selectedSong].transposedBy}
                      chords={songs[selectedSong].nodes}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
