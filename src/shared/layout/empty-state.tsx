import { FileX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-full bg-muted p-4 mb-4 transition-transform duration-200 hover:scale-110">
        {icon || <FileX className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-1 animate-in fade-in slide-in-from-top-2 duration-300" style={{ animationDelay: '100ms' }}>{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm animate-in fade-in slide-in-from-top-2 duration-300" style={{ animationDelay: '200ms' }}>{description}</p>
      )}
    </div>
  );
}
