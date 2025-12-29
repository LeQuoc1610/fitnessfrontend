interface StatsCardProps {
  uid: string;
}

// Temporary static stats placeholder; later we can compute from Firestore posts.
export function StatsCard({ uid }: StatsCardProps) {
  void uid; // placeholder to avoid unused param warning
  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="card-neon px-4 py-3">
        <p className="text-xs text-muted">Total Posts</p>
        <p className="mt-1 font-display text-xl text-neon-blue">—</p>
      </div>
      <div className="card-neon px-4 py-3">
        <p className="text-xs text-muted">Total Likes Received</p>
        <p className="mt-1 font-display text-xl text-neon-green">—</p>
      </div>
      <div className="card-neon px-4 py-3">
        <p className="text-xs text-muted">Days Training Logged</p>
        <p className="mt-1 font-display text-xl text-neon-orange">—</p>
      </div>
    </section>
  );
}
