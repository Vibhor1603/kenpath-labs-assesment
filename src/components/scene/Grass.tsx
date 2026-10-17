/**
 * Grass: three depth bands of grass blades.
 * Back band is paler/cooler for distance effect.
 * Front blades overlap the object base to ground it in the scene.
 * CSS-only.
 */
export function Grass() {
  return (
    <div className="absolute inset-x-0 bottom-0" aria-hidden="true">
      {/* Far band — cool, pale */}
      <svg
        viewBox="0 0 360 60"
        className="absolute bottom-[56px] w-full"
        preserveAspectRatio="none"
        style={{ height: 64 }}
      >
        <path
          d="M0,60 C20,40 35,20 50,30 C65,40 80,10 95,25 C110,38 125,15 140,28 C155,40 170,8 185,22 C200,35 215,12 230,26 C245,38 260,14 275,28 C290,40 305,18 320,30 C335,42 350,20 360,32 L360,60Z"
          fill="#C9DDB8"
          opacity="0.7"
        />
      </svg>

      {/* Mid band — medium green */}
      <svg
        viewBox="0 0 360 70"
        className="absolute bottom-[36px] w-full"
        preserveAspectRatio="none"
        style={{ height: 72 }}
      >
        <path
          d="M0,70 C15,45 30,18 45,32 C60,46 75,12 90,26 C105,40 120,8 135,22 C150,36 165,4 180,20 C195,34 210,10 225,24 C240,38 255,6 270,22 C285,36 300,14 315,28 C330,42 345,16 360,30 L360,70Z"
          fill="#3E7D4A"
          opacity="0.55"
        />
        {/* Clover and daisy accents */}
        <circle cx="80" cy="40" r="4" fill="#2F6A3B" opacity="0.5" />
        <circle cx="82" cy="36" r="4" fill="#2F6A3B" opacity="0.5" />
        <circle cx="76" cy="36" r="4" fill="#2F6A3B" opacity="0.5" />
        <circle cx="79" cy="38" r="3" fill="#FBF5EC" opacity="0.7" />
        {/* Daisy */}
        <circle cx="270" cy="38" r="5" fill="#FBF5EC" opacity="0.8" />
        <circle cx="270" cy="38" r="2.5" fill="#F7E3A1" />
      </svg>

      {/* Front band — darkest green, overlaps object base */}
      <svg
        viewBox="0 0 360 48"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
        style={{ height: 48 }}
      >
        <path
          d="M0,48 C12,30 24,10 36,20 C48,30 60,6 72,16 C84,26 96,2 108,14 C120,26 132,4 144,16 C156,28 168,0 180,12 C192,24 204,2 216,14 C228,26 240,4 252,18 C264,30 276,8 288,20 C300,32 312,6 324,18 C336,30 348,8 360,22 L360,48Z"
          fill="#2F6A3B"
          opacity="0.65"
        />
      </svg>
    </div>
  );
}
