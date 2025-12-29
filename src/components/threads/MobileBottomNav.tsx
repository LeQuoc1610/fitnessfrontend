export function MobileBottomNav() {
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-xs">
          <button type="button" className="text-muted hover:text-foreground">Home</button>
          <button type="button" className="text-muted hover:text-foreground">Explore</button>
          <button type="button" className="text-muted hover:text-foreground">Messages</button>
          <button type="button" className="text-muted hover:text-foreground">Profile</button>
        </div>
      </nav>
    </>
  );
}
