import React from "react";
import { usePageStore, Page } from "./stores/PageStore";
import Home from "./pages/Home";
import Login from "./pages/Login";

const pageComponents = {
  [Page.HOME]: Home,
  [Page.LOGIN]: Login,
};

function App() {
  const currentPage = usePageStore((state) => state.currentPage);

  const CurrentPage =
    pageComponents[currentPage] || (() => <div>Page not found</div>);

  return (
    <main>
      <CurrentPage />
    </main>
  );
}

export default App;
