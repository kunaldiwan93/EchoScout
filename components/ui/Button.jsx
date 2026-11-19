'use client';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-sans font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-2 focus-visible:outline-buoy focus-visible:outline-offset-2';

  const variants = {
    primary:
      'bg-fathom text-sheet hover:opacity-90 rounded-[6px]',
    secondary:
      'border border-rule text-ink hover:bg-sheet rounded-[6px]',
    ghost:
      'text-ink-soft hover:text-ink hover:bg-sheet rounded-[6px]',
    quiet:
      'text-ink-soft hover:text-ink p-0 bg-transparent rounded-[2px]',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-7',
    md: 'text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
    icon: 'w-9 h-9 p-0',
    'icon-sm': 'w-7 h-7 p-0',
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
