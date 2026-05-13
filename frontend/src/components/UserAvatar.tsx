import { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export default function UserAvatar({ src, name, size = 'md', className = '' }: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = (name || '?').charAt(0).toUpperCase();
  const sizeClass = sizeMap[size];

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={name || ''}
        onError={() => setImgFailed(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 ring-2 ring-primary/20 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${className}`}
    >
      {initial}
    </div>
  );
}
