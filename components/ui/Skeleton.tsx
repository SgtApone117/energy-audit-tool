interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200';

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : variant === 'rectangular' ? '100px' : undefined),
  };

  return <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} style={style} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <Skeleton variant="text" width="60%" height={24} />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="rectangular" height={120} />
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width="30%" height={16} />
          <Skeleton variant="rectangular" height={40} />
        </div>
      ))}
    </div>
  );
}
