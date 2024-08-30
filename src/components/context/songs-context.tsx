import { createContext, Dispatch, ReactNode, useState } from "react";
import { TextNode } from "../ChordsEditor";
import React from "react";

export type Song = { nodes: TextNode[]; transposedBy: number };
export type Songs = Record<string, Song>;
export const SongsContext = createContext<{
  isLoaded: boolean;
  setSongs: Dispatch<React.SetStateAction<Songs>>;
  songs: Songs;
}>({
  isLoaded: false,
  setSongs: () => {},
  songs: {},
});

export const SongsContextProvider = ({ children }: { children: ReactNode }) => {
  const [songs, setSongs] = useState({});

  return (
    <SongsContext.Provider
      value={{
        isLoaded: true,
        setSongs,
        songs,
      }}
    >
      {children}
    </SongsContext.Provider>
  );
};
