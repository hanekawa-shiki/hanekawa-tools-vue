<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/components/theme-provider.vue';

const router = useRouter();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const touchState = ref<Record<string, boolean>>({});
const { theme } = useTheme();
const isDark = computed(() => {
  if (theme.value === 'dark') {
    return true;
  }
  if (theme.value === 'light') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
});

function handleTouchStart(action: string) {
  touchState.value[action] = true;
}

function handleTouchEnd(action: string) {
  touchState.value[action] = false;
}

interface GameSize {
  width: number;
  height: number;
}

interface Coordinates {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Velocity {
  x: number;
  y: number;
}

class Projectile {
  active = true;
  coordinates: Coordinates;
  size: Size;
  velocity: Velocity;

  constructor(coordinates: Coordinates, velocity: Velocity) {
    this.coordinates = coordinates;
    this.size = { width: 3, height: 3 };
    this.velocity = velocity;
  }

  update(gameSize: GameSize) {
    this.coordinates.x += this.velocity.x;
    this.coordinates.y += this.velocity.y;
    if (this.coordinates.y > gameSize.height || this.coordinates.y < 0) {
      this.active = false;
    }
  }

  draw(screen: CanvasRenderingContext2D) {
    if (this.active) {
      screen.rect(this.coordinates.x, this.coordinates.y, this.size.width, this.size.height);
    }
  }
}

class KeyController {
  KEYS = { LEFT: 37, RIGHT: 39 };
  private keyState: Record<number, boolean> = {};
  private touchState: Record<string, boolean> = {};

  constructor() {
    const keyCode = [37, 39, 65, 68];
    window.addEventListener('keydown', (e) => {
      for (const code of keyCode) {
        if (code === e.keyCode) {
          this.keyState[e.keyCode] = true;
          e.preventDefault();
        }
      }
    });
    window.addEventListener('keyup', (e) => {
      for (const code of keyCode) {
        if (code === e.keyCode) {
          this.keyState[e.keyCode] = false;
          e.preventDefault();
        }
      }
    });
  }

  updateTouchState(state: Record<string, boolean>) {
    this.touchState = state;
  }

  isDown(keyCode: number) {
    if (keyCode === this.KEYS.LEFT) {
      return (
        this.keyState[37] === true || this.keyState[65] === true || this.touchState.left === true
      );
    }
    if (keyCode === this.KEYS.RIGHT) {
      return (
        this.keyState[39] === true || this.keyState[68] === true || this.touchState.right === true
      );
    }
    return this.keyState[keyCode] === true;
  }
}

class Player {
  active = true;
  size: Size = { width: 16, height: 8 };
  shootCooldown = 0;
  coordinates: Coordinates;
  projectile: Projectile[] = [];
  keyboarder: KeyController;

  constructor(gameSize: GameSize, keyboarder: KeyController) {
    this.coordinates = {
      x: (gameSize.width / 2 - this.size.width / 2) | 0,
      y: gameSize.height - this.size.height * 2,
    };
    this.keyboarder = keyboarder;
  }

  update(gameSize: GameSize) {
    for (const p of this.projectile) {
      p.update(gameSize);
    }
    this.projectile = this.projectile.filter((p) => p.active);

    if (!this.active) {
      return;
    }

    if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.coordinates.x > 0) {
      this.coordinates.x -= 2;
    } else if (
      this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) &&
      this.coordinates.x < gameSize.width - this.size.width
    ) {
      this.coordinates.x += 2;
    }

    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    } else {
      this.projectile.push(
        new Projectile(
          { x: this.coordinates.x + this.size.width / 2 - 1, y: this.coordinates.y - 1 },
          { x: 0, y: -7 }
        )
      );
      this.shootCooldown = 15;
    }
  }

  draw(screen: CanvasRenderingContext2D) {
    if (this.active) {
      screen.rect(this.coordinates.x, this.coordinates.y, this.size.width, this.size.height);
      screen.rect(this.coordinates.x - 2, this.coordinates.y + 2, 20, 6);
      screen.rect(this.coordinates.x + 6, this.coordinates.y - 4, 4, 4);
    }
    for (const p of this.projectile) {
      p.draw(screen);
    }
  }

  destroy() {
    this.active = false;
  }
}

class Invader {
  active = true;
  coordinates: Coordinates;
  size: Size;
  patrolX = 0;
  speedX: number;

  constructor(coordinates: Coordinates, invaderSize: number, invaderSpeed: number) {
    this.coordinates = coordinates;
    this.size = { width: invaderSize, height: invaderSize };
    this.speedX = invaderSpeed;
  }

  update(
    game: { invadersBelow: (invader: Invader) => boolean; invaderShots: Projectile[] },
    invaderAttackRate: number
  ) {
    if (Math.random() > invaderAttackRate && !game.invadersBelow(this)) {
      game.invaderShots.push(
        new Projectile(
          {
            x: this.coordinates.x + this.size.width / 2,
            y: this.coordinates.y + this.size.height - 5,
          },
          { x: 0, y: 2 }
        )
      );
    }
  }

  draw(screen: CanvasRenderingContext2D, invaderCanvas: HTMLCanvasElement) {
    if (this.active) {
      screen.drawImage(invaderCanvas, this.coordinates.x, this.coordinates.y);
    }
  }

  move(gameSize: GameSize, game: { lost: boolean }) {
    if (this.patrolX < 0 || this.patrolX > 100) {
      this.speedX = -this.speedX;
      this.patrolX += this.speedX;
      this.coordinates.y += this.size.height;
      if (this.coordinates.y + this.size.height * 2 > gameSize.height) {
        game.lost = true;
      }
    } else {
      this.coordinates.x += this.speedX;
      this.patrolX += this.speedX;
    }
  }

  destroy() {
    this.active = false;
  }
}

function collides(
  a: { coordinates: Coordinates; size: Size },
  b: { coordinates: Coordinates; size: Size }
) {
  return (
    a.coordinates.x < b.coordinates.x + b.size.width &&
    a.coordinates.x + a.size.width > b.coordinates.x &&
    a.coordinates.y < b.coordinates.y + b.size.height &&
    a.coordinates.y + a.size.height > b.coordinates.y
  );
}

const blocks = [
  [3, 4, 8, 9, 10, 15, 16],
  [2, 4, 7, 11, 14, 16],
  [1, 4, 7, 11, 13, 16],
  [1, 2, 3, 4, 5, 7, 11, 13, 14, 15, 16, 17],
  [4, 7, 11, 16],
  [4, 8, 9, 10, 16],
];

function getPixelRow(rowRaw: number, invaderMultiplier: number) {
  const textRow: number[] = [];
  let placer = 0;
  const row = Math.floor(rowRaw / invaderMultiplier);
  if (row >= blocks.length) {
    return [];
  }
  for (const block of blocks[row]) {
    const tmpContent = block * invaderMultiplier;
    for (let j = 0; j < invaderMultiplier; j++) {
      textRow[placer + j] = tmpContent + j;
    }
    placer += invaderMultiplier;
  }
  return textRow;
}

function createInvaders(invaderSize: number, invaderMultiplier: number, invaderSpeed: number) {
  const invaders: Invader[] = [];
  let i = blocks.length * invaderMultiplier;
  while (i--) {
    const j = getPixelRow(i, invaderMultiplier);
    for (const k of j) {
      invaders.push(
        new Invader({ x: k * invaderSize, y: i * invaderSize }, invaderSize, invaderSpeed)
      );
    }
  }
  return invaders;
}

interface GameColors {
  fill: string;
  overlay: string;
  lostText: string;
}

class Game {
  level = -1;
  lost = false;
  player: Player;
  invaders: Invader[];
  invaderShots: Projectile[] = [];
  restartBtnRect = { x: 0, y: 0, w: 0, h: 0 };
  private invaderSize: number;
  private invaderMultiplier: number;
  private invaderSpeed: number;
  private invaderAttackRate: number;
  private invaderSpawnDelay = 250;
  private spawnDelayCounter: number;
  private invaderCanvas: HTMLCanvasElement;
  private gameSize: GameSize;
  private colors: GameColors;
  private keyboarder: KeyController;

  constructor(
    gameSize: GameSize,
    invaderCanvas: HTMLCanvasElement,
    colors: GameColors,
    keyboarder: KeyController
  ) {
    this.gameSize = gameSize;
    this.invaderCanvas = invaderCanvas;
    this.colors = colors;
    this.keyboarder = keyboarder;
    this.invaderSize = 20;
    this.invaderMultiplier = gameSize.width > 1200 ? 3 : gameSize.width > 800 ? 2 : 1;
    this.invaderSpeed = 20;
    this.invaderAttackRate = 0.999;
    this.spawnDelayCounter = this.invaderSpawnDelay;
    this.player = new Player(gameSize, keyboarder);
    this.invaders = [];
  }

  init(kills: { value: number }, invaderDownTimer: ReturnType<typeof setInterval> | undefined) {
    this.level = -1;
    this.lost = false;
    this.player = new Player(this.gameSize, this.keyboarder);
    this.invaders = [];
    this.invaderShots = [];
    this.invaderAttackRate = 0.999;
    this.invaderSpeed = 20;
    this.spawnDelayCounter = this.invaderSpawnDelay;
    kills.value = 0;

    if (invaderDownTimer === undefined) {
      return setInterval(() => {
        for (const invader of this.invaders) {
          invader.move(this.gameSize, this);
        }
      }, 1000);
    }
    return invaderDownTimer;
  }

  update(kills: { value: number }) {
    if (this.invaders.length === 0) {
      this.spawnDelayCounter += 1;
      if (this.spawnDelayCounter < this.invaderSpawnDelay) {
        return;
      }
      this.level += 1;
      this.invaderAttackRate -= 0.002;
      this.invaderSpeed += 10;
      this.invaders = createInvaders(this.invaderSize, this.invaderMultiplier, this.invaderSpeed);
      this.spawnDelayCounter = 0;
    }

    if (!this.lost) {
      for (const projectile of this.player.projectile) {
        for (const invader of this.invaders) {
          if (collides(projectile, invader)) {
            invader.destroy();
            projectile.active = false;
            kills.value += 1;
          }
        }
      }

      for (const shot of this.invaderShots) {
        if (collides(shot, this.player)) {
          this.player.destroy();
          this.lost = true;
        }
      }

      for (const invader of this.invaders) {
        invader.update(this, this.invaderAttackRate);
      }
    }

    this.player.update(this.gameSize);
    for (const shot of this.invaderShots) {
      shot.update(this.gameSize);
    }
    this.invaders = this.invaders.filter((invader) => invader.active);
  }

  draw(screen: CanvasRenderingContext2D, kills: number) {
    if (this.lost) {
      screen.fillStyle = this.colors.overlay;
      screen.fillRect(0, 0, this.gameSize.width, this.gameSize.height);
      screen.font = '55px Lucida Console';
      screen.textAlign = 'center';
      screen.fillStyle = this.colors.lostText;
      screen.fillText('You lost', this.gameSize.width / 2, this.gameSize.height / 2);
      screen.font = '20px Lucida Console';
      screen.fillText(`Points: ${kills}`, this.gameSize.width / 2, this.gameSize.height / 2 + 30);

      const btnW = 140;
      const btnH = 36;
      const btnX = (this.gameSize.width - btnW) / 2;
      const btnY = this.gameSize.height / 2 + 50;
      this.restartBtnRect = { x: btnX, y: btnY, w: btnW, h: btnH };

      screen.beginPath();
      screen.roundRect(btnX, btnY, btnW, btnH, 18);
      screen.fillStyle = 'rgba(255, 255, 255, 0.1)';
      screen.fill();
      screen.strokeStyle = this.colors.fill;
      screen.lineWidth = 1;
      screen.stroke();

      screen.font = '14px Lucida Console';
      screen.fillStyle = this.colors.fill;
      screen.textAlign = 'center';
      screen.fillText('重新开始', this.gameSize.width / 2, btnY + 23);
    } else {
      this.restartBtnRect = { x: 0, y: 0, w: 0, h: 0 };
      screen.clearRect(0, 0, this.gameSize.width, this.gameSize.height);
      screen.font = '10px Lucida Console';
      screen.textAlign = 'right';
      screen.fillStyle = this.colors.fill;
      screen.fillText(`Points: ${kills}`, this.gameSize.width, this.gameSize.height - 12);
    }

    screen.beginPath();
    screen.fillStyle = this.colors.fill;
    this.player.draw(screen);
    if (!this.lost) {
      for (const invader of this.invaders) {
        invader.draw(screen, this.invaderCanvas);
      }
    }
    for (const shot of this.invaderShots) {
      shot.draw(screen);
    }
    screen.fill();
  }

  invadersBelow(invader: Invader) {
    return this.invaders.some(
      (b) =>
        Math.abs(invader.coordinates.x - b.coordinates.x) === 0 &&
        b.coordinates.y > invader.coordinates.y
    );
  }
}

const gameLost = ref(false);

onMounted(() => {
  const maybeCanvas = canvasRef.value;
  if (!maybeCanvas) {
    return;
  }
  const canvas: HTMLCanvasElement = maybeCanvas;

  let gameSize: GameSize;
  const kills = { value: 0 };
  let invaderDownTimer: ReturnType<typeof setInterval> | undefined;
  let game: Game;
  let animFrameId: number;
  const keyboarder = new KeyController();

  function getColors(): GameColors {
    if (isDark.value) {
      return {
        fill: '#d1d5db',
        overlay: 'rgba(255, 255, 255, 0.05)',
        lostText: '#e5e7eb',
      };
    }
    return {
      fill: '#374151',
      overlay: 'rgba(0, 0, 0, 0.03)',
      lostText: '#1f2937',
    };
  }

  function getInvaderColor(): string {
    return isDark.value ? '#d1d5db' : '#374151';
  }

  function createInvaderCanvas() {
    const c = document.createElement('canvas');
    c.width = 20;
    c.height = 20;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = getInvaderColor();
    const pixelSize = 2;
    const invaderPattern = [
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
      [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    ];
    for (let y = 0; y < invaderPattern.length; y++) {
      for (let x = 0; x < invaderPattern[y].length; x++) {
        if (invaderPattern[y][x]) {
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    return c;
  }

  let invaderCanvas = createInvaderCanvas();

  const screen = canvas.getContext('2d')!;
  initGameStart();
  loop();

  function handleCanvasClick(e: MouseEvent) {
    if (!game.lost) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const btn = game.restartBtnRect;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      gameLost.value = false;
      invaderCanvas = createInvaderCanvas();
      game = new Game(gameSize, invaderCanvas, getColors(), keyboarder);
      if (invaderDownTimer) {
        clearInterval(invaderDownTimer);
      }
      invaderDownTimer = game.init(kills, invaderDownTimer);
    }
  }

  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    if (!game.lost) {
      canvas.style.cursor = 'default';
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const btn = game.restartBtnRect;
    canvas.style.cursor =
      x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h ? 'pointer' : 'default';
  });
  canvas.addEventListener('touchend', (e: TouchEvent) => {
    if (!game.lost || !e.changedTouches.length) {
      return;
    }
    const touch = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    const btn = game.restartBtnRect;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      e.preventDefault();
      gameLost.value = false;
      invaderCanvas = createInvaderCanvas();
      game = new Game(gameSize, invaderCanvas, getColors(), keyboarder);
      if (invaderDownTimer) {
        clearInterval(invaderDownTimer);
      }
      invaderDownTimer = game.init(kills, invaderDownTimer);
    }
  });

  function loop() {
    game.player.keyboarder.updateTouchState(touchState.value);
    game.update(kills);
    game.draw(screen, kills.value);
    gameLost.value = game.lost;
    animFrameId = requestAnimationFrame(loop);
  }

  function initGameStart() {
    if (window.innerWidth > 1200) {
      canvas.width = 1200;
      canvas.height = 500;
      gameSize = { width: 1200, height: 500 };
    } else if (window.innerWidth > 800) {
      canvas.width = 900;
      canvas.height = 600;
      gameSize = { width: 900, height: 600 };
    } else {
      canvas.width = 600;
      canvas.height = 300;
      gameSize = { width: 600, height: 300 };
    }

    game = new Game(gameSize, invaderCanvas, getColors(), keyboarder);
    if (invaderDownTimer) {
      clearInterval(invaderDownTimer);
    }
    invaderDownTimer = game.init(kills, invaderDownTimer);
  }

  watch(isDark, () => {
    invaderCanvas = createInvaderCanvas();
    game = new Game(gameSize, invaderCanvas, getColors(), keyboarder);
    if (invaderDownTimer) {
      clearInterval(invaderDownTimer);
    }
    invaderDownTimer = game.init(kills, invaderDownTimer);
  });

  window.addEventListener('resize', initGameStart);

  onUnmounted(() => {
    canvas.removeEventListener('click', handleCanvasClick);
    if (invaderDownTimer) {
      clearInterval(invaderDownTimer);
    }
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
    }
  });
});
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4">
    <p class="text-sm text-muted-foreground">
      太空侵略者摧毁了这个页面！向它们复仇吧！
      <br />
      使用 <span class="font-bold text-foreground">A</span>
      <span class="font-bold text-foreground">D</span> 或
      <span class="font-bold text-foreground">←</span>
      <span class="font-bold text-foreground">→</span> 移动，子弹自动发射！
    </p>
    <canvas ref="canvasRef" class="block rounded-lg border border-border bg-background"></canvas>
    <div class="flex items-center gap-4 md:hidden">
      <button
        class="flex size-12 items-center justify-center rounded-full border border-border bg-input/30 text-lg font-bold transition-all active:scale-95 active:bg-input/50"
        @touchstart="handleTouchStart('left')"
        @touchend="handleTouchEnd('left')"
      >
        ←
      </button>
      <button
        class="flex size-12 items-center justify-center rounded-full border border-border bg-input/30 text-lg font-bold transition-all active:scale-95 active:bg-input/50"
        @touchstart="handleTouchStart('right')"
        @touchend="handleTouchEnd('right')"
      >
        →
      </button>
    </div>
    <button
      class="inline-flex h-9 items-center justify-center gap-2 rounded-4xl border border-border bg-input/30 px-3 text-sm font-medium transition-all hover:scale-105 hover:bg-input/50 hover:text-foreground"
      @click="router.push('/')"
    >
      <Icon name="HomeIcon" class="size-4" />
      返回首页
    </button>
  </div>
</template>
