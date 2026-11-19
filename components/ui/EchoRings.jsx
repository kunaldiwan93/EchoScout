'use client';

export default function EchoRings({
  variant = 'marker',
  className = '',
  size = 24,
  active = false,
  isNew = false,
  label,
  ...props
}) {
  if (variant === 'mark') {
    // Wordmark & favicon: two concentric rings
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block align-middle shrink-0 ${className}`}
        aria-hidden="true"
        {...props}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    );
  }

  if (variant === 'pulse') {
    // Searching & loading state: central dot with outward pulsing ring
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block align-middle shrink-0 ${className}`}
        aria-hidden="true"
        {...props}
      >
        <circle
          cx="12"
          cy="12"
          r="6"
          stroke="var(--buoy)"
          strokeWidth="1.5"
          className="animate-echo-pulse"
        />
        <circle cx="12" cy="12" r="3" fill="var(--buoy)" />
      </svg>
    );
  }

  if (variant === 'cover-marker') {
    // Hero timeline marker on the cover page
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block align-middle shrink-0 ${className}`}
        aria-hidden="true"
        {...props}
      >
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="var(--rule)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        <circle
          cx="16"
          cy="16"
          r="9"
          stroke="var(--buoy)"
          strokeWidth="1.5"
          className={active ? 'animate-echo-pulse' : ''}
        />
        <circle cx="16" cy="16" r="4.5" fill="var(--buoy)" />
      </svg>
    );
  }

  // Default 'marker' on workspace timeline
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block align-middle shrink-0 transition-transform ${
        active ? 'scale-110' : ''
      } ${className}`}
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="var(--buoy)"
        strokeWidth="1"
        strokeOpacity={active ? '0.8' : '0.4'}
        className={isNew ? 'animate-echo-pulse-once' : ''}
      />
      <circle
        cx="12"
        cy="12"
        r="6"
        stroke="var(--buoy)"
        strokeWidth="1.5"
        strokeOpacity={active ? '1' : '0.75'}
      />
      <circle cx="12" cy="12" r="2.5" fill="var(--buoy)" />
    </svg>
  );
}
