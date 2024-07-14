import React from "react";
import "./App.css";
import { Page } from "./stores/PageStore.ts";
import usePageStore from "./stores/PageStore.ts";
import Home from "./pages/Home.tsx";

function App() {
  return (
    <main>{usePageStore.getState().currentPage == Page.HOME && <Home />}</main>
  );
}

export default App;
