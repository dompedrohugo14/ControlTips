import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Header from '../components/Header';
import MetricsGrid from '../components/MetricsGrid';
import ChartsSection from '../components/ChartsSection';
import BetsTable from '../components/BetsTable';
import Footer from '../components/Footer';
import SearchFilters from '../components/SearchFilters';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('30d');

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />

        <MetricsGrid timeFilter={timeFilter} />

        <ChartsSection timeFilter={timeFilter} />

        <BetsTable searchTerm={searchTerm} categoryFilter={categoryFilter} />
      </main>

      <button
        onClick={() => navigate('/new-bet')}
        className="fixed bottom-8 right-8 flex items-center space-x-3 px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full transition-all shadow-2xl shadow-yellow-500/40 hover:shadow-yellow-500/60 hover:scale-105 z-50"
      >
        <Plus className="w-6 h-6" />
        <span>Nova Aposta</span>
      </button>

      <Footer />
    </div>
  );
}
