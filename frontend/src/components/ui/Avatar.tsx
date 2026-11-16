import { cn } from '../../utils/cn';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={cn('rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center shrink-0', sizes[size], className)}>
      {initials}
    </div>
  );
}
