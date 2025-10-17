import { Search } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  timeFilter: string;
  setTimeFilter: (value: string) => void;
}

export default function SearchFilters({
  searchTerm,
  setSearchTerm,
  timeFilter,
  setTimeFilter,
}: SearchFiltersProps) {

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 w-full lg:max-w-xl relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-6 h-6" />
          <input
            type="text"
            placeholder="Buscar apostas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-yellow-500 transition-colors cursor-pointer"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
          <option value="1y">Último ano</option>
          <option value="all">Todo período</option>
        </select>
      </div>

    </div>
  );
}
