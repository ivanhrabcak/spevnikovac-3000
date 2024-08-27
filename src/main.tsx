import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AddSongsRoute } from "./routes/add-songs";
import { SongsContextProvider } from "./components/context/songs-context";
import { ChooseSongRoute } from "./routes/choose-song";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AddSongsRoute />,
  },
  {
    path: "/choose",
    element: <ChooseSongRoute />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SongsContextProvider>
      <RouterProvider router={router} />
    </SongsContextProvider>
  </React.StrictMode>
);
