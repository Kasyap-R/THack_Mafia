import React from 'react';
import './App.css';
import {Page} from './stores/PageStore.ts';
import usePageStore from './stores/PageStore.ts';
import Home from './pages/Home.tsx';

function App() {
  const {currentPage} = usePageStore();
  return (
    <main>
      {currentPage == Page.HOME && <Home/>}
    </main>
  );
}

export default App;
