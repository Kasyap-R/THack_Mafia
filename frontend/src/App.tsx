import React from "react";
import { usePageStore, Page } from "./stores/PageStore";
import Login from "./pages/LoginPage";
import MeetingPage from "./pages/MeetingPage";
import Home from "./pages/HomePage";

const pageComponents = {
  [Page.LOGIN]: Login,
  [Page.MEETING]: MeetingPage,
  [Page.HOME]: Home,
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
