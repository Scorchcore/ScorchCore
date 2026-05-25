export default function AlchemicalLoader() {
  const runes = [
    [320, 46, "ᚨ"],
    [370, 56, "ᚱ"],
    [416, 78, "ᚲ"],
    [454, 112, "ᚷ"],
    [482, 156, "ᛟ"],
    [494, 206, "ᛇ"],
    [488, 258, "ᛞ"],
    [464, 306, "ᛉ"],
    [426, 344, "ᛗ"],
    [378, 366, "ᚾ"],
    [320, 374, "ᛁ"],
    [262, 366, "ᛏ"],
    [214, 344, "ᛒ"],
    [176, 306, "ᚠ"],
    [152, 258, "ᚦ"],
    [146, 206, "ᛚ"],
    [158, 156, "ᛃ"],
    [186, 112, "ᛋ"],
    [224, 78, "ᛖ"],
    [270, 56, "ᛜ"],
  ] as const;

  return (
    <div className="alchemical-loader fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-[#020607] text-cyan-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.18),rgba(0,40,44,0.08)_34%,rgba(0,0,0,0.96)_72%)]" />
      <div className="absolute h-[620px] w-[620px] rounded-full border border-cyan-300/10 blur-[1px] animate-orb-1" />
      <div className="absolute h-[450px] w-[450px] rounded-full border border-cyan-300/15 blur-[1px] animate-orb-2" />
      <div className="absolute h-[310px] w-[310px] rounded-full border border-cyan-300/20 blur-[1px]" />

      <div className="relative flex flex-col items-center">
        <svg
          viewBox="0 0 640 520"
          className="h-[355px] w-[440px] overflow-visible drop-shadow-[0_0_24px_rgba(0,240,255,0.65)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Alchemical loading emblem"
        >
          <defs>
            <filter id="cyanGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4.2" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0.95 0 0 0 0 1 0 0 0 0.9 0"
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter
              id="deepCyanGlow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="fireGlow" x="-90%" y="-90%" width="280%" height="280%">
              <feGaussianBlur stdDeviation="5.5" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 1 0 0.45 0 0 0.34 0 0 0.04 0 0 0 0 0 1 0"
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="cyanStroke" x1="120" y1="70" x2="520" y2="430">
              <stop offset="0%" stopColor="#baffff" />
              <stop offset="34%" stopColor="#32f6ff" />
              <stop offset="68%" stopColor="#00b8ff" />
              <stop offset="100%" stopColor="#006aff" />
            </linearGradient>

            <linearGradient id="softCyan" x1="80" y1="120" x2="560" y2="330">
              <stop offset="0%" stopColor="#d7ffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#38f8ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0398ff" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="fireStroke" x1="120" y1="100" x2="520" y2="330">
              <stop offset="0%" stopColor="#ffe7a0" />
              <stop offset="34%" stopColor="#ff9b1a" />
              <stop offset="68%" stopColor="#ff4a00" />
              <stop offset="100%" stopColor="#c91400" />
            </linearGradient>

            <radialGradient id="eggFill" cx="48%" cy="35%" r="68%">
              <stop offset="0%" stopColor="#d9ffff" stopOpacity="0.52" />
              <stop offset="38%" stopColor="#00f0ff" stopOpacity="0.2" />
              <stop offset="72%" stopColor="#013642" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#00090d" stopOpacity="0.92" />
            </radialGradient>

            <radialGradient id="sealFill" cx="50%" cy="46%" r="56%">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.08" />
              <stop offset="72%" stopColor="#00171b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="seal-core">
            <circle
              cx="320"
              cy="218"
              r="190"
              fill="url(#sealFill)"
              opacity="0.75"
            />
            <circle
              cx="320"
              cy="218"
              r="188"
              className="draw draw-seal"
              stroke="url(#cyanStroke)"
              strokeWidth="8"
              opacity="0.72"
              filter="url(#deepCyanGlow)"
            />
            <circle
              cx="320"
              cy="218"
              r="158"
              className="draw draw-seal delay-1"
              stroke="url(#cyanStroke)"
              strokeWidth="2.5"
              opacity="0.42"
            />
            <circle
              cx="320"
              cy="218"
              r="121"
              className="draw draw-seal delay-2"
              stroke="#69ffff"
              strokeWidth="1.5"
              opacity="0.25"
            />

            <path
              d="M320 56 L474 330 H166 Z"
              className="draw draw-sigil delay-2"
              stroke="url(#softCyan)"
              strokeWidth="3"
              opacity="0.72"
              filter="url(#cyanGlow)"
            />
            <path
              d="M192 298 C244 274 280 242 320 172 C360 242 396 274 448 298"
              className="draw draw-sigil delay-3"
              stroke="url(#softCyan)"
              strokeWidth="2"
              opacity="0.48"
            />
          </g>

          <g className="runes" fill="#9effff" filter="url(#cyanGlow)">
            {runes.map(([x, y, rune]) => (
              <text
                key={rune}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="17"
                fontFamily="serif"
                opacity="0.82"
                className="rune"
              >
                {rune}
              </text>
            ))}
          </g>

          <g filter="url(#fireGlow)" className="fire-layer">
            <path
              className="draw draw-fire delay-3"
              d="M142 214 C105 174 104 125 146 88 C135 130 167 149 198 158 C162 160 146 150 126 128 C143 182 196 187 232 199 C188 202 158 191 134 170 C154 228 211 229 259 243 C205 246 171 238 140 214Z"
              stroke="url(#fireStroke)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.86"
            />
            <path
              className="draw draw-fire delay-3"
              d="M498 214 C535 174 536 125 494 88 C505 130 473 149 442 158 C478 160 494 150 514 128 C497 182 444 187 408 199 C452 202 482 191 506 170 C486 228 429 229 381 243 C435 246 469 238 498 214Z"
              stroke="url(#fireStroke)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.86"
            />
            <path
              className="draw draw-fire delay-4"
              d="M176 120 C164 152 186 169 214 178 M464 120 C476 152 454 169 426 178"
              stroke="#ffd27a"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.75"
            />
          </g>

          <g filter="url(#cyanGlow)" className="wings">
            <g className="left-wing">
              <path
                className="draw wing-fill delay-4"
                d="M302 282 C264 273 225 252 184 219 C143 186 103 144 74 77 C106 104 134 119 173 127 C141 130 112 119 92 98 C114 151 153 172 211 183 C173 189 138 182 109 158 C133 215 184 231 251 231 C205 249 166 247 126 225 C170 278 239 286 302 282Z"
                fill="#00f5ff"
                fillOpacity="0.08"
                stroke="url(#softCyan)"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <path
                className="draw feather delay-5"
                d="M290 270 C238 244 188 195 133 112"
                stroke="url(#softCyan)"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.86"
              />
              <path
                className="draw feather delay-5"
                d="M270 251 C222 232 174 222 120 220"
                stroke="url(#softCyan)"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.72"
              />
              <path
                className="draw feather delay-5"
                d="M248 225 C203 211 157 186 98 135"
                stroke="url(#softCyan)"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.62"
              />
              <path
                className="draw feather delay-5"
                d="M225 199 C181 189 140 171 88 100"
                stroke="url(#softCyan)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.52"
              />
            </g>

            <g className="right-wing">
              <path
                className="draw wing-fill delay-4"
                d="M338 282 C376 273 415 252 456 219 C497 186 537 144 566 77 C534 104 506 119 467 127 C499 130 528 119 548 98 C526 151 487 172 429 183 C467 189 502 182 531 158 C507 215 456 231 389 231 C435 249 474 247 514 225 C470 278 401 286 338 282Z"
                fill="#00f5ff"
                fillOpacity="0.08"
                stroke="url(#softCyan)"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <path
                className="draw feather delay-5"
                d="M350 270 C402 244 452 195 507 112"
                stroke="url(#softCyan)"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.86"
              />
              <path
                className="draw feather delay-5"
                d="M370 251 C418 232 466 222 520 220"
                stroke="url(#softCyan)"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.72"
              />
              <path
                className="draw feather delay-5"
                d="M392 225 C437 211 483 186 542 135"
                stroke="url(#softCyan)"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.62"
              />
              <path
                className="draw feather delay-5"
                d="M415 199 C459 189 500 171 552 100"
                stroke="url(#softCyan)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.52"
              />
            </g>
          </g>

          <g filter="url(#cyanGlow)" className="egg-group">
            <path
              className="draw egg delay-6"
              d="M320 64 C370 105 397 167 393 225 C389 287 358 330 320 334 C282 330 251 287 247 225 C243 167 270 105 320 64Z"
              fill="url(#eggFill)"
              stroke="url(#cyanStroke)"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              className="draw crystal delay-7"
              d="M320 68 L320 332"
              stroke="#c8ffff"
              strokeWidth="2.5"
              opacity="0.8"
            />
            <path
              className="draw crystal delay-7"
              d="M282 128 L358 128 L383 198 L356 284 L320 332 L284 284 L257 198 Z"
              stroke="#aaffff"
              strokeWidth="2.4"
              opacity="0.72"
            />
            <path
              className="draw crystal delay-7"
              d="M282 128 L320 198 L358 128 M257 198 L320 198 L383 198 M284 284 L320 198 L356 284"
              stroke="#8effff"
              strokeWidth="2"
              opacity="0.62"
            />
            <path
              className="draw crystal delay-7"
              d="M282 128 L257 198 M358 128 L383 198 M257 198 L284 284 M383 198 L356 284"
              stroke="#e3ffff"
              strokeWidth="1.8"
              opacity="0.52"
            />
            <ellipse
              cx="320"
              cy="176"
              rx="42"
              ry="88"
              fill="#7dffff"
              opacity="0.08"
              className="egg-bloom"
            />
          </g>

          <path
            className="draw bottom-flourish delay-7"
            d="M162 298 C216 330 276 338 320 392 C364 338 424 330 478 298"
            stroke="url(#cyanStroke)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.78"
            filter="url(#cyanGlow)"
          />

          <g className="sparks" filter="url(#cyanGlow)">
            <circle cx="140" cy="300" r="2" fill="#baffff" />
            <circle cx="502" cy="294" r="2" fill="#baffff" />
            <circle cx="211" cy="78" r="1.7" fill="#baffff" />
            <circle cx="429" cy="78" r="1.7" fill="#baffff" />
            <circle cx="320" cy="392" r="2.2" fill="#baffff" />
          </g>
        </svg>

        <div className="mt-[-20px] flex max-w-[92vw] items-center gap-1 overflow-hidden font-mono text-sm uppercase tracking-[0.34em] text-cyan-200 drop-shadow-[0_0_12px_rgba(0,245,255,0.95)] md:text-base">
          <span className="typing-text">INITIALIZING ALCHEMICAL PROTOCOL</span>
          <span className="animate-caret">_</span>
        </div>
      </div>
    </div>
  );
}
