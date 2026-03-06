import { AIIndexFilter, AI_CATEGORIES } from "../../types/ai-index";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, RotateCw, X } from "lucide-react";

interface FilterPanelProps {
  filter: AIIndexFilter;
  setFilter: (filter: AIIndexFilter) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  progressMessage?: string;
  uniqueLanguages: string[];
  uniqueCountries: string[];
}

export function FilterPanel({
  filter,
  setFilter,
  onRefresh,
  isRefreshing,
  progressMessage,
  uniqueLanguages,
  uniqueCountries,
}: FilterPanelProps) {
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...filter, search: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    setFilter({ ...filter, category: value === "all" ? "" : value });
  };

  const handleLanguageChange = (value: string) => {
    setFilter({ ...filter, language: value === "all" ? "" : value });
  };

  const handleCountryChange = (value: string) => {
    setFilter({ ...filter, country: value === "all" ? "" : value });
  };

  const clearFilters = () => {
    setFilter({
      search: "",
      category: "",
      language: "",
      minStars: 0,
      country: "",
    });
  };

  return (
    <div className="bg-white dark:bg-card p-4 rounded-xl border border-border shadow-sm space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          Filter Repositories
        </h2>
        <div className="flex gap-2 w-full md:w-auto items-center">
          {progressMessage && (
            <span className="text-xs text-muted-foreground hidden md:inline-block animate-pulse mr-2">
              {progressMessage}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="flex-1 md:flex-none"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onRefresh} 
            disabled={isRefreshing}
            className="flex-1 md:flex-none"
          >
            <RotateCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Updating..." : "Refresh Data"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Search</label>
          <Input
            placeholder="Search name or description..."
            value={filter.search}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Category</label>
          <Select value={filter.category || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {AI_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Language</label>
          <Select value={filter.language || "all"} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {uniqueLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Country</label>
          <Select value={filter.country || "all"} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {uniqueCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Min Stars Slider */}
      <div className="pt-2">
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-muted-foreground">Minimum Stars</label>
          <span className="text-sm font-mono">{filter.minStars.toLocaleString()}</span>
        </div>
        <Slider
          value={[filter.minStars]}
          min={0}
          max={50000}
          step={100}
          onValueChange={(vals) => setFilter({ ...filter, minStars: vals[0] })}
        />
      </div>
    </div>
  );
}
