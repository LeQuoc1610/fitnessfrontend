interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
};

export function Avatar({ src, alt, size = 'md' }: AvatarProps) {
  const sizeClasses = sizeMap[size];
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses} rounded-full object-cover border border-border/70`}
      />
    );
  }
  const initial = alt?.[0]?.toUpperCase() ?? 'G';
  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-gradient-to-br from-neon-green to-neon-blue text-background font-display font-semibold`}
    >
      {initial}
    </div>
  );
}
