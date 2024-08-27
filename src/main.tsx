import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AddSongsRoute } from "./routes/add-songs";
import { SongsContextProvider } from "./components/context/songs-context";
import { EditSongsRoute } from "./routes/edit-songs";
import { ExportRoute } from "./routes/export";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AddSongsRoute />,
  },
  {
    path: "/choose",
    element: <EditSongsRoute />,
  },
  {
    path: "/export",
    element: <ExportRoute />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SongsContextProvider>
      <RouterProvider router={router} />
    </SongsContextProvider>
  </React.StrictMode>
);
