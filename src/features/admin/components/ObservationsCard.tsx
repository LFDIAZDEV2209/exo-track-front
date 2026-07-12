'use client';

import { Card, CardContent, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { MessageSquare } from 'lucide-react';

interface ObservationsCardProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export function ObservationsCard({ value, onChange, onSave }: ObservationsCardProps) {
  return (
    <Card className="overflow-hidden border-t-4 border-t-emerald-600 pt-0 gap-0">
      <div className="bg-emerald-600 px-6 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-white" />
          <CardTitle className="font-bold text-white">Observaciones del Contador</CardTitle>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Notas y comentarios"
          rows={4}
        />
        <Button onClick={onSave} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          Guardar Observaciones
        </Button>
      </CardContent>
    </Card>
  );
}
