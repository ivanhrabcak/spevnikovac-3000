import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import Cross from './assets/x.svg?react';
import Dots from './assets/kebab-horizontal.svg?react';
import { TextNode } from "./components/ChordsPreview";
import { PhysicalButton } from "./components/PhysicalButton";

type LyricsWithChords = {artist: string, song_name: string, text: TextNode[]};

function App() {
  const [songs, setSongs] = useState<Record<string, TextNode[] | 'loading'>>({});
  const [url, setUrl] = useState("");
  const [isLoading, setLoading] = useState(false);

  const addSong = async () => {
    setLoading(true);
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const result = (await invoke("fetch", { url }) as LyricsWithChords);

    console.log(result);

    const newItem: Record<string, TextNode[]> = {};
    newItem[`${result.song_name} - ${result.artist}`] = result.text;

    setLoading(false);
    setSongs({
      ...songs,
      ...newItem  
    });
  }

  return (
    <div className="container">
      <h1>Pridaj pesničky:</h1>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          addSong();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setUrl(e.currentTarget.value)}
          placeholder="URL..."
        />
        <button type="submit">Pridať</button>
      </form>
      <div className="page-content">
        {isLoading && <Dots className="loading" />}
        {Object.keys(songs).length != 0 && 
          <div className="container center-items songs-list">
            Zoznam pridaných pesničiek:
            {Object.keys(songs).map(songName => (
              <div className="song-display">
                <b>{songName}</b>
                <Cross 
                  onClick={() => {
                    setSongs((songs) => {
                      delete songs[songName]
                      console.log('deleted ' + songName)
                      console.log(songs)
                      return {...songs}
                    })
                  }}
                  className="remove-icon" 
                />
              </div>
            ))}
          </div>
        }
      </div>
      <PhysicalButton className="launch-button offset" text="Generuj" />
    </div>
  );
}

export default App;
