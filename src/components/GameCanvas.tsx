import React, { useRef, useEffect } from 'react';
import { GameState, FighterState, SparkEffect } from '../types/game';
import { MAX_HEALTH } from '../lib/constants';

interface GameCanvasProps {
  gameState: GameState;
  crtFilter: boolean;
  onCanvasClick?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  crtFilter,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render resolution: 960 x 540 (16:9 matching the retro CRT frame)
    const W = 960;
    const H = 540;

    // Disable image smoothing for crisp pixel look
    ctx.imageSmoothingEnabled = false;

    // 1. SKY & DISTANT HORIZON
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 320);
    skyGrad.addColorStop(0, '#0c62c9'); // Classic retro cyan blue
    skyGrad.addColorStop(0.7, '#1b7ee8');
    skyGrad.addColorStop(1, '#3b9bfb');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, 320);

    // Subtle sky scanlines / dithering
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < 320; y += 4) {
      ctx.fillRect(0, y, W, 2);
    }

    // 2. MOUNT FUJI (Centered in background like screenshot)
    drawMountFuji(ctx, W / 2, 285);

    // 3. BACKGROUND FENCE & POSTS
    drawDojoFence(ctx, W, 285);

    // 4. COURTYARD / ARENA FLOOR
    ctx.fillStyle = '#1c1f24'; // Wall base
    ctx.fillRect(0, 285, W, 105);

    // Tatami / Dojo Stone Ground
    const floorGrad = ctx.createLinearGradient(0, 390, 0, 480);
    floorGrad.addColorStop(0, '#757b85');
    floorGrad.addColorStop(1, '#5a5f68');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 390, W, 90);

    // Ground boundary stripe
    ctx.fillStyle = '#40454d';
    ctx.fillRect(0, 390, W, 4);
    ctx.fillStyle = '#2d3036';
    ctx.fillRect(0, 478, W, 4);

    // 5. JAPANESE TORII GATE (Right side as in screenshot)
    drawToriiGate(ctx, 710, 110, 160, 340);

    // 6. FIGHTER SHADOWS
    const p1 = gameState.fighters.p1;
    const p2 = gameState.fighters.p2;

    const scaleX = W / 1000;
    const p1CanvasX = p1.x * scaleX;
    const p2CanvasX = p2.x * scaleX;
    const groundY = 415;

    drawShadow(ctx, p1CanvasX, groundY + 10, p1);
    drawShadow(ctx, p2CanvasX, groundY + 10, p2);

    // 7. FIGHTERS
    drawFighter(ctx, p1, p1CanvasX, groundY, '#e67e22', '#ffffff', '#222222');
    drawFighter(ctx, p2, p2CanvasX, groundY, '#2980b9', '#f8fafc', '#1e293b');

    // 8. SPARKS & IMPACT FLASHES (Exact visual starburst from screenshot)
    gameState.sparks.forEach((spark) => {
      drawImpactSpark(ctx, spark, scaleX);
    });

    // 9. BOTTOM RETRO HEALTH & MOMENTUM ARROW BAR (From screenshot!)
    drawMomentumArrowBar(ctx, W, H - 42, gameState);

    // 10. ROUND & FIGHT OVERLAYS (Countdown, Round announcements)
    if (gameState.status === 'countdown') {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 36px "Press Start 2P", monospace';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      const count = Math.ceil(gameState.countdown);
      const text = count > 0 ? `ROUND ${gameState.round} - ${count}` : 'FIGHT!';
      ctx.fillText(text, W / 2, 170);
      ctx.restore();
    } else if (gameState.status === 'round_over' || gameState.status === 'match_over') {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px "Press Start 2P", monospace';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      const winnerName =
        gameState.winner === 'p1'
          ? 'WHITE CRANE WINS!'
          : gameState.winner === 'p2'
          ? 'SHADOW TIGER WINS!'
          : 'DRAW!';
      ctx.fillText(winnerName, W / 2, 160);
      ctx.restore();
    }
  }, [gameState, crtFilter]);

  return (
    <div
      className="relative w-full max-w-[960px] mx-auto aspect-video select-none cursor-pointer rounded-2xl overflow-hidden shadow-2xl bg-neutral-950 border-4 border-stone-700"
      onClick={onCanvasClick}
    >
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-full block bg-black"
      />

      {/* CRT Scanline & Glass Curvature Effect */}
      {crtFilter && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_60%,rgba(0,0,0,0.45)_100%)]">
          <div
            className="w-full h-full opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
              backgroundSize: '100% 4px',
            }}
          />
        </div>
      )}
    </div>
  );
};

// DRAW MOUNT FUJI (Pixel retro aesthetic)
function drawMountFuji(ctx: CanvasRenderingContext2D, centerX: number, baseY: number) {
  ctx.save();

  // Mountain dark body
  ctx.beginPath();
  ctx.moveTo(centerX - 190, baseY);
  ctx.lineTo(centerX - 42, baseY - 120);
  ctx.lineTo(centerX + 42, baseY - 120);
  ctx.lineTo(centerX + 190, baseY);
  ctx.closePath();
  ctx.fillStyle = '#18243b';
  ctx.fill();

  // Snow peak
  ctx.beginPath();
  ctx.moveTo(centerX - 42, baseY - 120);
  ctx.lineTo(centerX + 42, baseY - 120);
  ctx.lineTo(centerX + 78, baseY - 70);
  ctx.lineTo(centerX + 52, baseY - 60);
  ctx.lineTo(centerX + 26, baseY - 82);
  ctx.lineTo(centerX, baseY - 58);
  ctx.lineTo(centerX - 24, baseY - 80);
  ctx.lineTo(centerX - 50, baseY - 62);
  ctx.lineTo(centerX - 78, baseY - 70);
  ctx.closePath();
  ctx.fillStyle = '#f8fafc';
  ctx.fill();

  // Crater rim detail
  ctx.fillStyle = '#d9e2ec';
  ctx.fillRect(centerX - 35, baseY - 120, 70, 8);

  ctx.restore();
}

// DRAW DOJO FENCE / HORIZONTAL BARRIER
function drawDojoFence(ctx: CanvasRenderingContext2D, W: number, baseY: number) {
  ctx.save();

  // Horizontal rails
  ctx.fillStyle = '#14171d';
  ctx.fillRect(0, baseY - 28, W, 8);
  ctx.fillRect(0, baseY - 8, W, 8);

  // Vertical posts every 110px
  ctx.fillStyle = '#222831';
  for (let x = 30; x < W; x += 110) {
    ctx.fillRect(x, baseY - 38, 12, 38);
    // Post cap
    ctx.fillStyle = '#393e46';
    ctx.fillRect(x - 2, baseY - 42, 16, 4);
    ctx.fillStyle = '#222831';
  }

  ctx.restore();
}

// DRAW TORII GATE (Classic wooden Japanese gate on right side)
function drawToriiGate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();

  const woodLight = '#e5d3b3';
  const woodDark = '#a48356';
  const woodShadow = '#6e502c';

  const pillarW = 20;
  const leftPillarX = x + 18;
  const rightPillarX = x + w - 18 - pillarW;

  // Kasagi (Top curved lintel)
  ctx.fillStyle = woodLight;
  ctx.fillRect(x - 22, y, w + 44, 20);
  ctx.fillStyle = woodDark;
  ctx.fillRect(x - 20, y + 20, w + 40, 10);
  // Kasagi roof tip corners
  ctx.fillStyle = woodShadow;
  ctx.fillRect(x - 24, y - 4, 10, 8);
  ctx.fillRect(x + w + 14, y - 4, 10, 8);

  // Shimaki (Secondary lintel underneath)
  ctx.fillStyle = woodLight;
  ctx.fillRect(x - 10, y + 36, w + 20, 14);

  // Nuki (Tie beam connecting pillars)
  ctx.fillStyle = woodLight;
  ctx.fillRect(x + 2, y + 80, w - 4, 14);
  ctx.fillStyle = woodDark;
  ctx.fillRect(x + 4, y + 94, w - 8, 4);

  // Vertical Pillars (Hashira)
  // Left pillar
  ctx.fillStyle = woodLight;
  ctx.fillRect(leftPillarX, y + 30, pillarW, h);
  ctx.fillStyle = woodDark;
  ctx.fillRect(leftPillarX + pillarW - 4, y + 30, 4, h);
  // Right pillar
  ctx.fillStyle = woodLight;
  ctx.fillRect(rightPillarX, y + 30, pillarW, h);
  ctx.fillStyle = woodDark;
  ctx.fillRect(rightPillarX + pillarW - 4, y + 30, 4, h);

  // Horizontal wood grain details
  ctx.fillStyle = woodShadow;
  for (let py = y + 50; py < y + h + 20; py += 18) {
    ctx.fillRect(leftPillarX + 2, py, pillarW - 6, 2);
    ctx.fillRect(rightPillarX + 2, py, pillarW - 6, 2);
  }

  // Pillar Stone Bases (Kamebara)
  ctx.fillStyle = '#393e46';
  ctx.fillRect(leftPillarX - 4, y + h + 16, pillarW + 8, 14);
  ctx.fillRect(rightPillarX - 4, y + h + 16, pillarW + 8, 14);

  ctx.restore();
}

// DRAW FIGHTER SHADOW
function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fighter: FighterState
) {
  ctx.save();
  ctx.beginPath();
  const width = fighter.action === 'knockdown' ? 50 : 34;
  ctx.ellipse(x, y, width, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.fill();
  ctx.restore();
}

// DRAW FIGHTER (Retro rotoscoped martial artist matching Karateka style)
function drawFighter(
  ctx: CanvasRenderingContext2D,
  fighter: FighterState,
  x: number,
  groundY: number,
  beltColor: string,
  giColor: string,
  giShade: string
) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(fighter.facing, 1);

  const skin = '#fcd34d'; // retro skin tone
  const hair = '#1e293b';

  // State-specific rendering
  if (fighter.action === 'knockdown') {
    // Fallen on ground
    ctx.fillStyle = giColor;
    ctx.fillRect(-35, -12, 70, 12);
    ctx.fillStyle = skin;
    ctx.fillRect(28, -16, 12, 10);
    ctx.fillStyle = beltColor;
    ctx.fillRect(-2, -13, 8, 14);
    ctx.restore();
    return;
  }

  if (fighter.action === 'bow') {
    // Bowing respectfully
    // Legs
    ctx.fillStyle = giColor;
    ctx.fillRect(-8, -42, 14, 42);
    // Torso leaned forward
    ctx.fillStyle = giColor;
    ctx.fillRect(4, -68, 22, 28);
    // Belt
    ctx.fillStyle = beltColor;
    ctx.fillRect(2, -45, 10, 6);
    // Head down
    ctx.fillStyle = hair;
    ctx.fillRect(24, -76, 14, 14);
    ctx.fillStyle = skin;
    ctx.fillRect(26, -72, 8, 10);
    ctx.restore();
    return;
  }

  // Active attack or defensive pose
  const isMidKick = fighter.action === 'mid_kick';
  const isLowKick = fighter.action === 'low_kick';
  const isHighPunch = fighter.action === 'high_punch';
  const isBlockHigh = fighter.action === 'block_high';
  const isBlockLow = fighter.action === 'block_low';
  const isRunning = fighter.action === 'run';
  const isStaggered = fighter.action === 'hit_stagger';
  const isVictory = fighter.action === 'victory';

  // Head bobbing offset
  const bob = isRunning ? Math.sin(Date.now() / 60) * 3 : 0;
  const torsoY = -68 + bob;

  // Legs / Stance
  ctx.fillStyle = giColor;
  if (isMidKick) {
    // Standing leg
    ctx.fillRect(-10, -45, 12, 45);
    // Kicking leg extending straight right! (Look at screenshot!)
    ctx.fillRect(2, -56, 44, 12);
    // Kicking foot
    ctx.fillStyle = skin;
    ctx.fillRect(44, -58, 10, 14);
  } else if (isLowKick) {
    // Deep crouch + low sweeping leg
    ctx.fillRect(-18, -32, 14, 32);
    ctx.fillRect(-4, -16, 40, 10);
    ctx.fillStyle = skin;
    ctx.fillRect(34, -18, 10, 12);
  } else if (isRunning) {
    // Running stride legs
    const runCycle = Math.sin(Date.now() / 70);
    ctx.fillRect(-14 + runCycle * 8, -42, 10, 42);
    ctx.fillRect(4 - runCycle * 8, -42, 10, 42);
  } else if (isBlockLow) {
    // Wide crouch stance
    ctx.fillRect(-18, -36, 12, 36);
    ctx.fillRect(6, -36, 12, 36);
  } else {
    // Classic martial arts combat stance (angled feet)
    ctx.fillRect(-14, -45, 11, 45);
    ctx.fillRect(4, -45, 11, 45);
  }

  // Feet / Gi cuffs
  ctx.fillStyle = giShade;
  ctx.fillRect(-16, -4, 14, 4);
  ctx.fillRect(2, -4, 14, 4);

  // Torso / Gi
  ctx.fillStyle = giColor;
  if (isStaggered) {
    // Snapped backward
    ctx.fillRect(-22, torsoY - 4, 24, 34);
  } else if (isRunning) {
    // Leaning forward
    ctx.fillRect(-6, torsoY, 26, 32);
  } else {
    ctx.fillRect(-12, torsoY, 24, 32);
  }

  // Gi wrap V-neckline
  ctx.fillStyle = skin;
  ctx.fillRect(-2, torsoY + 2, 8, 12);

  // Obi (Belt)
  ctx.fillStyle = beltColor;
  ctx.fillRect(-14, torsoY + 22, 28, 7);
  // Belt knot tassels
  ctx.fillRect(4, torsoY + 28, 4, 10);
  ctx.fillRect(8, torsoY + 28, 4, 8);

  // Arms & Strikes
  if (isHighPunch) {
    // High punch extending forward at head level!
    ctx.fillStyle = giColor;
    ctx.fillRect(0, torsoY + 4, 38, 10);
    // Fist
    ctx.fillStyle = skin;
    ctx.fillRect(36, torsoY + 2, 10, 12);
    // Rear guard arm
    ctx.fillStyle = giColor;
    ctx.fillRect(-16, torsoY + 6, 10, 16);
  } else if (isBlockHigh) {
    // High cross guard arms
    ctx.fillStyle = giColor;
    ctx.fillRect(6, torsoY - 6, 12, 26);
    ctx.fillStyle = skin;
    ctx.fillRect(8, torsoY - 14, 10, 10);
  } else if (isBlockLow) {
    // Low sweeping guard arm
    ctx.fillStyle = giColor;
    ctx.fillRect(8, torsoY + 12, 22, 10);
    ctx.fillStyle = skin;
    ctx.fillRect(28, torsoY + 14, 10, 10);
  } else if (isVictory) {
    // Victory salute / arms raised in triumph
    ctx.fillStyle = giColor;
    ctx.fillRect(-20, torsoY - 18, 10, 24);
    ctx.fillRect(10, torsoY - 18, 10, 24);
    ctx.fillStyle = skin;
    ctx.fillRect(-20, torsoY - 26, 10, 10);
    ctx.fillRect(10, torsoY - 26, 10, 10);
  } else {
    // Standard combat guard
    ctx.fillStyle = giColor;
    ctx.fillRect(-4, torsoY + 6, 16, 12);
    ctx.fillRect(10, torsoY + 4, 10, 14);
    ctx.fillStyle = skin;
    ctx.fillRect(16, torsoY + 2, 8, 8);
  }

  // Head & Headband
  const headX = isStaggered ? -16 : isRunning ? 2 : -2;
  const headY = torsoY - 18;

  // Face / skin
  ctx.fillStyle = skin;
  ctx.fillRect(headX, headY, 14, 16);

  // Hair
  ctx.fillStyle = hair;
  ctx.fillRect(headX - 2, headY - 4, 18, 6);
  ctx.fillRect(headX - 4, headY, 6, 10);

  // Headband (matching belt)
  ctx.fillStyle = beltColor;
  ctx.fillRect(headX - 3, headY + 1, 18, 4);
  // Headband tail
  ctx.fillRect(headX - 8, headY + 4, 6, 3);
  ctx.fillRect(headX - 12, headY + 6, 5, 3);

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(headX + 9, headY + 7, 3, 3);

  ctx.restore();
}

// DRAW IMPACT SPARK (Iconic starburst from screenshot!)
function drawImpactSpark(
  ctx: CanvasRenderingContext2D,
  spark: SparkEffect,
  scaleX: number
) {
  ctx.save();
  const x = spark.x * scaleX;
  const y = spark.y;
  const r = spark.size;

  if (spark.type === 'hit') {
    // Golden multi-pointed star burst with orange core (Just like Karateka screenshot!)
    ctx.translate(x, y);

    // Star rays
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    const points = 8;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? r : r * 0.38;
      const angle = (i * Math.PI) / points;
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();

    // Inner bright yellow star
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? r * 0.65 : r * 0.22;
      const angle = (i * Math.PI) / points;
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();

    // Pure white center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, -3, 6, 6);
  } else {
    // Parry / Block blue-white electric spark
    ctx.translate(x, y);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-r * 0.6, -2, r * 1.2, 4);
    ctx.fillRect(-2, -r * 0.6, 4, r * 1.2);
  }

  ctx.restore();
}

// DRAW BOTTOM RETRO MOMENTUM & HEALTH ARROW BAR
// Screenshot feature: Orange right-facing arrows ▶▶▶ vs Blue left-facing arrows ◀◀◀
function drawMomentumArrowBar(
  ctx: CanvasRenderingContext2D,
  W: number,
  y: number,
  gameState: GameState
) {
  ctx.save();

  // Dark background band
  ctx.fillStyle = '#090a0d';
  ctx.fillRect(0, y - 4, W, 32);

  const arrowW = 14;
  const arrowH = 14;
  const spacing = 18;
  const count = MAX_HEALTH; // 12 arrows

  const p1Health = gameState.fighters.p1.health;
  const p2Health = gameState.fighters.p2.health;

  // Left Side: Player 1 Orange Arrows pointing right ▶
  const p1StartX = 50;
  for (let i = 0; i < count; i++) {
    const ax = p1StartX + i * spacing;
    const isActive = i < p1Health;
    ctx.fillStyle = isActive ? '#ea580c' : '#451a03'; // Bright Amber or Dim Amber
    drawRightTriangle(ctx, ax, y + 4, arrowW, arrowH);
  }

  // Right Side: Player 2 Blue Arrows pointing left ◀
  const p2StartX = W - 50;
  for (let i = 0; i < count; i++) {
    const ax = p2StartX - i * spacing;
    const isActive = i < p2Health;
    ctx.fillStyle = isActive ? '#0284c7' : '#082f49'; // Bright Blue or Dim Blue
    drawLeftTriangle(ctx, ax, y + 4, arrowW, arrowH);
  }

  // Center Momentum Indicator
  const centerX = W / 2;
  const momentum = gameState.momentum; // -10 to +10
  const momentumOffset = (momentum / 10) * 40;

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(centerX - 1, y, 2, 20);

  ctx.fillStyle = momentum > 0 ? '#f97316' : momentum < 0 ? '#38bdf8' : '#94a3b8';
  ctx.beginPath();
  ctx.arc(centerX + momentumOffset, y + 10, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRightTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y + h / 2);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
}

function drawLeftTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - w, y + h / 2);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
}
