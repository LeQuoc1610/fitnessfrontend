import { useEffect, useMemo, useState } from 'react';

export type LogLiftPreset = {
  exercise?: string;
  weightKg?: number;
  reps?: number;
  rpe?: number;
};

export function LogLiftModal({
  open,
  onClose,
  preset,
}: {
  open: boolean;
  onClose: () => void;
  preset?: LogLiftPreset;
}) {
  const [exercise, setExercise] = useState('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [reps, setReps] = useState<number | ''>('');
  const [rpe, setRpe] = useState<number | ''>('');

  const defaultExercise = useMemo(() => preset?.exercise ?? '', [preset]);

  useEffect(() => {
    if (!open) return;
    setExercise(defaultExercise);
    setWeightKg(preset?.weightKg ?? '');
    setReps(preset?.reps ?? '');
    setRpe(preset?.rpe ?? '');
  }, [defaultExercise, open, preset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg card-neon p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted">Workout log</div>
            <h3 className="mt-1 font-display text-xl text-neon-green">Log this lift</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/70 bg-background/30 px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs text-muted">Exercise</div>
            <input
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              placeholder="Squat"
              className="w-full rounded-xl border border-border/70 bg-background/30 px-3 py-2 text-sm outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/10"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted">Weight (kg)</div>
            <input
              inputMode="decimal"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="120"
              className="w-full rounded-xl border border-border/70 bg-background/30 px-3 py-2 text-sm outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/10"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted">Reps</div>
            <input
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="5"
              className="w-full rounded-xl border border-border/70 bg-background/30 px-3 py-2 text-sm outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/10"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted">RPE</div>
            <input
              inputMode="decimal"
              value={rpe}
              onChange={(e) => setRpe(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="8"
              className="w-full rounded-xl border border-border/70 bg-background/30 px-3 py-2 text-sm outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/10"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/70 bg-background/30 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button type="button" className="rounded-full btn-accent px-5 py-2 text-xs font-bold text-background hover:opacity-90">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
