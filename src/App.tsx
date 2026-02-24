
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { useEffect } from "react";
import { getAllFilesFromDB } from "../src/lib";
import { useFileStore } from "../src/store";
import { DraftModification, Home, SourcesReview } from './pages'
import { Header } from './components'

function App() {
  const setFiles = useFileStore((state) => state.setFiles);

  useEffect(() => {
    const loadFiles = async () => {
      const storedFiles = await getAllFilesFromDB();
      setFiles(storedFiles);
    };

    loadFiles();
  }, []);

  return (
    <div className='min-h-screen w-full max-w-4/5 mx-auto flex flex-col'>
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/review' element={<SourcesReview />} />
          <Route path='/draft' element={<DraftModification />} />
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App     
