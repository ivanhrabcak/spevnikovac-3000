import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { TextNode } from "../ChordsEditor";
import { load, Store } from "@tauri-apps/plugin-store";

export type Song = { nodes: TextNode[]; transposedBy: number; visited?: boolean };
export type Songs = Record<string, Song>;

// Song keys are formatted as "<song name> - <artist>".
export const makeSongKey = (artist: string, songName: string) =>
  `${songName} - ${artist}`;
export const parseSongKey = (key: string) => {
  const [songName, artist] = key.split(" - ");
  return { artist, songName };
};

type SongsContextValue = {
  isLoaded: boolean;
  songs: Songs;
  addSongs: (newSongs: Songs) => void;
  deleteSong: (key: string) => void;
  deleteAllSongs: () => void;
  setSongChords: (key: string, nodes: TextNode[]) => void;
  setSongTransposition: (key: string, transposedBy: number) => void;
  markSongVisited: (key: string) => void;
};

export const SongsContext = createContext<SongsContextValue>({
  isLoaded: false,
  songs: {},
  addSongs: () => {},
  deleteSong: () => {},
  deleteAllSongs: () => {},
  setSongChords: () => {},
  setSongTransposition: () => {},
  markSongVisited: () => {},
});

const STORE_FILE = "progress.json";
const SONGS_KEY = "songs";

export const SongsContextProvider = ({ children }: { children: ReactNode }) => {
  const [songs, setSongs] = useState<Songs>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const storeRef = useRef<Store | null>(null);

  useEffect(() => {
    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false });
      storeRef.current = store;

      const saved = await store.get<Songs>(SONGS_KEY);
      if (saved != null) {
        setSongs(saved);
      }

      setIsLoaded(true);
    };

    init();
  }, []);

  useEffect(() => {
    if (!isLoaded || storeRef.current == null) return;

    storeRef.current.set(SONGS_KEY, songs);
    storeRef.current.save();
  }, [songs, isLoaded]);

  const addSongs = (newSongs: Songs) => {
    setSongs((prev) => ({ ...prev, ...newSongs }));
  };

  const deleteSong = (key: string) => {
    setSongs((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const deleteAllSongs = () => {
    setSongs({});
  };

  const setSongChords = (key: string, nodes: TextNode[]) => {
    setSongs((prev) => ({ ...prev, [key]: { ...prev[key], nodes } }));
  };

  const setSongTransposition = (key: string, transposedBy: number) => {
    setSongs((prev) => ({ ...prev, [key]: { ...prev[key], transposedBy } }));
  };

  const markSongVisited = (key: string) => {
    setSongs((prev) => {
      if (prev[key]?.visited) return prev;
      return { ...prev, [key]: { ...prev[key], visited: true } };
    });
  };

  return (
    <SongsContext.Provider
      value={{
        isLoaded,
        songs,
        addSongs,
        deleteSong,
        deleteAllSongs,
        setSongChords,
        setSongTransposition,
        markSongVisited,
      }}
    >
      {children}
    </SongsContext.Provider>
  );
};
