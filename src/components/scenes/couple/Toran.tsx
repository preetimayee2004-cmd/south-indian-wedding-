/**
 * A hanging toran across the top edge of the couple scene, in the paper-cut
 * style of the couple picture: a full-width band of green mango leaves on a
 * thread, with marigold strings and jasmine strings (a red rose at the end)
 * hanging below it. About 70px tall, it casts a soft shadow onto the scene
 * and sways very slightly (CSS .toran).
 */
export function Toran() {
  // one 96px repeat: six overlapping mango leaves, a marigold string and a jasmine string
  const leaves = [0, 16, 32, 48, 64, 80];
  const marigold = Array.from({ length: 5 }, (_, i) => 30 + i * 8.4);
  const jasmine = Array.from({ length: 4 }, (_, i) => 31 + i * 6.4);
  return (
    <div aria-hidden className="toran">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <pattern id="toran-unit" width="96" height="70" patternUnits="userSpaceOnUse">
            {/* the strings, behind the leaves */}
            {marigold.map((y, i) => (
              <g key={`m${i}`} transform={`translate(30 ${y})`}>
                <circle r="4.6" fill={i % 2 ? "#f6a51e" : "#f08a12"} />
                <circle r="4.6" fill="none" stroke="#c4620c" strokeWidth="0.8" />
                <circle r="1.4" fill="#c4620c" fillOpacity="0.55" />
              </g>
            ))}
            <path d="M78 26V54" stroke="#6c8f3c" strokeWidth="0.8" />
            {jasmine.map((y, i) => (
              <g key={`j${i}`} transform={`translate(78 ${y}) rotate(${i % 2 ? 18 : -18})`}>
                <ellipse rx="2.4" ry="3.8" fill="#fffdf4" stroke="#d9cfb6" strokeWidth="0.6" />
              </g>
            ))}
            <circle cx="78" cy="58" r="3.6" fill="#c8323e" stroke="#8f1f29" strokeWidth="0.7" />
            {/* the thread and the mango leaves, light and dark green, pointing down */}
            <path d="M0 4.5H96" stroke="#7a4a1c" strokeWidth="2" />
            {leaves.map((x, i) => (
              <g key={`l${i}`} transform={`translate(${x + 8} 4) rotate(${i % 2 ? 6 : -6})`}>
                <path d="M0 0C9 6 9 20 0 30C-9 20-9 6 0 0Z" fill={i % 2 ? "#3f7d2e" : "#5f9e3a"} stroke="#2c5a20" strokeWidth="0.8" />
                <path d="M0 3V27" stroke="#2c5a20" strokeWidth="0.7" strokeOpacity="0.7" />
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#toran-unit)" />
      </svg>
    </div>
  );
}
