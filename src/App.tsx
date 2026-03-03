
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
    <div className='min-h-screen w-full flex flex-col bg-base'>
      <Header />
      <main className="flex-1 relative">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/review' element={<SourcesReview />} />
          <Route path='/draft' element={<DraftModification />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <span className="text-6xl mb-4">404</span>
              <p className="text-lg">Page not found</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App     
