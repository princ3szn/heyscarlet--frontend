/**
 * TheLemniscate — Mark Four from the HeyScarlet Signature Marks.
 *
 * Asymmetric lemniscate of Bernoulli.
 * Small dark left loop (where you are) crossing to a large
 * brilliant right loop (where Scarlet is taking you).
 * Gradient: near-black #100101 through scarlet #C0392B to warm cream #F8D4A0.
 */

interface TheLemniscateProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function TheLemniscate({
  width = 160,
  height = 100,
  className,
  style,
}: TheLemniscateProps) {
  const id = `lem-${width}-${height}`.replace(/\./g, "-");

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient
          id={`${id}-g`}
          x1="18" y1="50"
          x2="142" y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#100101" />
          <stop offset="22%"  stopColor="#5A0808" />
          <stop offset="48%"  stopColor="#C0392B" />
          <stop offset="72%"  stopColor="#F5822A" />
          <stop offset="100%" stopColor="#F8D4A0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow layer */}
      <path
        d="M 58 50 C 48 32 20 28 16 50 C 20 72 48 68 58 50 Z"
        fill={`url(#${id}-g)`}
        opacity={0.3}
        filter={`url(#${id}-glow)`}
      />
      <path
        d="M 58 50 C 72 22 128 18 138 50 C 128 82 72 78 58 50 Z"
        fill={`url(#${id}-g)`}
        opacity={0.3}
        filter={`url(#${id}-glow)`}
      />

      {/* Small left loop */}
      <path
        d="M 58 50 C 48 32 20 28 16 50 C 20 72 48 68 58 50 Z"
        fill={`url(#${id}-g)`}
        opacity={0.9}
      />

      {/* Large right loop */}
      <path
        d="M 58 50 C 72 22 128 18 138 50 C 128 82 72 78 58 50 Z"
        fill={`url(#${id}-g)`}
        opacity={0.9}
      />

      {/* Waist crossing point */}
      <ellipse
        cx="58" cy="50"
        rx="5" ry="8"
        fill={`url(#${id}-g)`}
        opacity={0.5}
      />
    </svg>
  );
}