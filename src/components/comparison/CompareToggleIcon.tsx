import { Plus, Check } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';
import { cn } from '@/lib/utils';
import { getCardKey } from '@/utils/cardAlias';

interface CompareToggleIconProps {
  card: any;
  className?: string;
}

export function CompareToggleIcon({ card, className }: CompareToggleIconProps) {
  const { toggleCard, isSelected } = useComparison();
  const cardId = getCardKey(card);
  const selected = isSelected(cardId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCard(card);
      }}
      className={cn(
        "group inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur",
        selected
          ? "bg-[#FF1E7E] text-white"
          : "bg-white/90 text-slate-700 hover:bg-white hover:text-[#FF1E7E] border border-slate-200",
        className
      )}
      aria-label={selected ? "Remove from comparison" : "Add to comparison"}
      title={selected ? "Added to comparison" : "Compare card"}
    >
      {selected ? (
        <Check className="w-4 h-4" strokeWidth={2.5} />
      ) : (
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" strokeWidth={2.5} />
      )}
    </button>
  );
}
