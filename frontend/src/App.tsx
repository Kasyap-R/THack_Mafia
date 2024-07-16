import React from "react";
import { usePageStore, Page } from "./stores/PageStore";
import Login from "./pages/Login";
import Meeting from "./pages/Meeting";

const pageComponents = {
  [Page.LOGIN]: Login,
  [Page.MEETING]: Meeting,
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
