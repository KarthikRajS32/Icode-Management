import { cn } from '../utils/cn';

/**
 * Premium Avatar bubble utilizing initials and harmonious gradients
 */
export const Avatar = ({
  name = 'User',
  role = '',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  showStatus = false,
  status = 'online', // 'online' | 'offline' | 'busy'
}) => {
  // Extract initials (e.g., "Sarah Connor" -> "SC")
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const names = fullName.trim().split(/\s+/);
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Generate a deterministic solid color based on the name string length/charcode
  const getGradientColors = (str) => {
    const colors = [
      'bg-blue-600 text-white',
      'bg-emerald-600 text-white',
      'bg-blue-500 text-white',
      'bg-slate-600 text-white',
      'bg-rose-600 text-white',
      'bg-teal-600 text-white',
    ];
    
    if (!str) return colors[0];
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-lg font-bold',
    xl: 'w-20 h-20 text-2xl font-extrabold',
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-white dark:ring-slate-900',
    offline: 'bg-slate-400 ring-white dark:ring-slate-900',
    busy: 'bg-rose-500 ring-white dark:ring-slate-900',
  };

  const initials = getInitials(name);
  const colorGradient = getGradientColors(name);

  return (
    <div className={cn('relative inline-flex items-center justify-center select-none flex-shrink-0', className)}>
      <div className={cn(
        'rounded-full flex items-center justify-center shadow-sm tracking-wider',
        sizes[size],
        colorGradient
      )}>
        {initials}
      </div>
      
      {showStatus && (
        <span className={cn(
          'absolute bottom-0 right-0 block rounded-full ring-2',
          size === 'sm' || size === 'md' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5',
          statusColors[status]
        )} />
      )}
    </div>
  );
};
