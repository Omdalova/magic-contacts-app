import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Search" }: SearchBarProps) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-muted border-none rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
    />
  );
};