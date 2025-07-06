import { cn } from '@/lib/utils';

interface ContactAvatarProps {
  name: string;
  size?: 'small' | 'default' | 'large' | 'xl';
  className?: string;
}

const avatarColors = [
  'hsl(220, 95%, 55%)', // Blue
  'hsl(280, 65%, 60%)', // Purple  
  'hsl(340, 85%, 65%)', // Pink
  'hsl(25, 95%, 65%)',  // Orange
  'hsl(150, 85%, 45%)', // Green
  'hsl(190, 85%, 55%)', // Cyan
];

const getColorForName = (name: string): string => {
  if (!name) return avatarColors[0];
  const index = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
};

const sizeClasses = {
  small: 'w-8 h-8 text-sm',
  default: 'w-10 h-10 text-base', 
  large: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl'
};

export const ContactAvatar = ({ name, size = 'default', className }: ContactAvatarProps) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const backgroundColor = getColorForName(name);
  
  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center text-white font-medium flex-shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor }}
    >
      {initial}
    </div>
  );
};