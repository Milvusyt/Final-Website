
    /* ==========================================================================
       01. AUDIO SYNTHESIZER ENGINE (Web Audio API)
       ========================================================================== */
    class SoundEngine {
      constructor() {
        this.ctx = null;
        this.muted = false;
      }

      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      playHover() {
        if (this.muted || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);

          gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.05);
        } catch (e) {}
      }

      playClick() {
        if (this.muted || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(280, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.12);

          gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.12);
        } catch (e) {}
      }

      playShot(type = 'm416') {
        if (this.muted || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type === 'awm' ? 'sawtooth' : 'triangle';
          const freq = type === 'awm' ? 120 : 340;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + (type === 'awm' ? 0.35 : 0.08));

          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (type === 'awm' ? 0.35 : 0.08));

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + (type === 'awm' ? 0.35 : 0.08));
        } catch (e) {}
      }

      playStageChime(stageIdx) {
        if (this.muted || !this.ctx) return;
        try {
          const freqs = [523.25, 659.25, 783.99, 1046.50];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freqs[stageIdx % 4], this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freqs[stageIdx % 4] * 1.5, this.ctx.currentTime + 0.25);

          gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.25);
        } catch (e) {}
      }
    }

    const sound = new SoundEngine();

    // Audio Toggle interaction
    const audioToggleBtn = document.getElementById('audio-toggle');
    const audioLabel = document.getElementById('audio-label');
    audioToggleBtn.addEventListener('click', () => {
      sound.init();
      sound.muted = !sound.muted;
      if (sound.muted) {
        audioToggleBtn.classList.add('muted');
        audioLabel.textContent = 'SFX: OFF';
      } else {
        audioToggleBtn.classList.remove('muted');
        audioLabel.textContent = 'SFX: ON';
        sound.playClick();
      }
    });

    // Sound triggers for hover/clicks
    document.querySelectorAll('[data-sound="hover"]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        sound.init();
        sound.playHover();
      });
    });
    document.querySelectorAll('[data-sound="click"], .cyber-btn').forEach(el => {
      el.addEventListener('click', () => {
        sound.init();
        sound.playClick();
      });
    });

    /* ==========================================================================
       02. CUSTOM SMOOTH INERTIA CURSOR
       ========================================================================== */
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let followerX = mouseX, followerY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      sound.init();
    });

    function animateCursor() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .roster-card, .chapter-dot, .stat-box, .finals-card, .weapon-card, .loot-item-row').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });

    /* ==========================================================================
       03. LENIS SMOOTH SCROLL + GSAP SCROLLTRIGGER SYNC
       ========================================================================== */
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85,
      smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    /* ==========================================================================
       04. DYNAMIC HERO PARTICLES & VELOCITY ACCELERATION
       ========================================================================== */
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particleCount = 75;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedY: Math.random() * 0.8 + 0.2,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * 0.05
    }));

    let scrollVelocity = 0;
    lenis.on('scroll', (e) => {
      scrollVelocity = Math.min(Math.abs(e.velocity) * 0.4, 15);
    });

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      scrollVelocity *= 0.95;

      particles.forEach(p => {
        p.y -= (p.speedY + scrollVelocity);
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.beginPath();
        
        if (scrollVelocity > 1) {
          ctx.strokeStyle = `rgba(212, 175, 55, ${p.opacity * 0.8})`;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + scrollVelocity * 3);
          ctx.stroke();
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(renderParticles);
    }
    renderParticles();

    /* ==========================================================================
       06. LIVE INTEL POPUP MODAL & REAL-TIME AUTO-UPDATING ENGINE
       ========================================================================== */
    const openModalBtn = document.getElementById('open-intel-modal-btn');
    const openCircuitBtn = document.getElementById('open-finals-circuit-btn');
    const closeModalBtn = document.getElementById('close-intel-modal-btn');
    const intelModal = document.getElementById('intel-modal');
    const finalsLiveWidget = document.getElementById('finals-live-widget');
    const tournamentSeasonsSection = document.getElementById('upcoming-tournaments');

    // Live Telemetry Elements
    const syncTimeEl = document.getElementById('modal-sync-time');
    const autoToggleBtn = document.getElementById('modal-auto-toggle');
    const teleAliveEl = document.getElementById('hud-tele-alive');
    const teleDropEl = document.getElementById('hud-tele-drop');
    const telePingEl = document.getElementById('hud-tele-ping');
    const liveTableBody = document.getElementById('modal-live-table-body');
    const combatFeedList = document.getElementById('modal-combat-feed-list');

    // Tab buttons & Panes
    const tabBtns = document.querySelectorAll('.modal-tab-btn');
    const tabPanes = {
      standings: document.getElementById('tab-pane-standings'),
      killfeed: document.getElementById('tab-pane-killfeed'),
      broadcast: document.getElementById('tab-pane-broadcast'),
    };

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        Object.keys(tabPanes).forEach(k => {
          tabPanes[k].style.display = (k === targetTab) ? 'block' : 'none';
        });
      });
    });

    // Tournament Live Leaderboard Dataset (Official Season 2 Dataset Embedded)
    let liveTournamentTeams = [
  {
    "id": "t-1",
    "name": "ForgtN SoulZ",
    "logo": "or.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 42,
    "cqbKills": 18,
    "lrbKills": 14,
    "assists": 15,
    "cqbDmg": 2480,
    "lrbDmg": 1890
  },
  {
    "id": "t-2",
    "name": "RAKUZAN",
    "logo": "rakuzan.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 40,
    "cqbKills": 18,
    "lrbKills": 14,
    "assists": 15,
    "cqbDmg": 2365,
    "lrbDmg": 1795
  },
  {
    "id": "t-3",
    "name": "DRS",
    "logo": "unknown.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 38,
    "cqbKills": 17,
    "lrbKills": 13,
    "assists": 14,
    "cqbDmg": 2250,
    "lrbDmg": 1700
  },
  {
    "id": "t-4",
    "name": "BROCODZ",
    "logo": "unknown.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 36,
    "cqbKills": 16,
    "lrbKills": 13,
    "assists": 14,
    "cqbDmg": 2135,
    "lrbDmg": 1605
  },
  {
    "id": "t-5",
    "name": "TPA",
    "logo": "tpa.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 34,
    "cqbKills": 16,
    "lrbKills": 12,
    "assists": 13,
    "cqbDmg": 2020,
    "lrbDmg": 1510
  },
  {
    "id": "t-6",
    "name": "NIG",
    "logo": "night.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 32,
    "cqbKills": 15,
    "lrbKills": 12,
    "assists": 13,
    "cqbDmg": 1905,
    "lrbDmg": 1415
  },
  {
    "id": "t-7",
    "name": "MALAYALEES YODHA",
    "logo": "unknown.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 30,
    "cqbKills": 14,
    "lrbKills": 11,
    "assists": 12,
    "cqbDmg": 1790,
    "lrbDmg": 1320
  },
  {
    "id": "t-8",
    "name": "RDB",
    "logo": "RDB.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 28,
    "cqbKills": 14,
    "lrbKills": 11,
    "assists": 12,
    "cqbDmg": 1675,
    "lrbDmg": 1225
  },
  {
    "id": "t-9",
    "name": "TGA",
    "logo": "tga.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 26,
    "cqbKills": 13,
    "lrbKills": 10,
    "assists": 11,
    "cqbDmg": 1560,
    "lrbDmg": 1130
  },
  {
    "id": "t-10",
    "name": "NEXUS Esports",
    "logo": "or.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 24,
    "cqbKills": 12,
    "lrbKills": 10,
    "assists": 11,
    "cqbDmg": 1445,
    "lrbDmg": 1035
  },
  {
    "id": "t-11",
    "name": "HASHONE ESPORTS",
    "logo": "or.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 22,
    "cqbKills": 11,
    "lrbKills": 9,
    "assists": 10,
    "cqbDmg": 1330,
    "lrbDmg": 940
  },
  {
    "id": "t-12",
    "name": "SCORP",
    "logo": "or.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 20,
    "cqbKills": 11,
    "lrbKills": 9,
    "assists": 10,
    "cqbDmg": 1215,
    "lrbDmg": 845
  },
  {
    "id": "t-13",
    "name": "Maradu",
    "logo": "unknown.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 18,
    "cqbKills": 10,
    "lrbKills": 8,
    "assists": 9,
    "cqbDmg": 1100,
    "lrbDmg": 750
  },
  {
    "id": "t-14",
    "name": "Zodiac 30",
    "logo": "unknown.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 16,
    "cqbKills": 9,
    "lrbKills": 8,
    "assists": 9,
    "cqbDmg": 985,
    "lrbDmg": 655
  },
  {
    "id": "t-15",
    "name": "CITY TIGERS X",
    "logo": "unknown.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 14,
    "cqbKills": 9,
    "lrbKills": 7,
    "assists": 8,
    "cqbDmg": 870,
    "lrbDmg": 560
  },
  {
    "id": "t-16",
    "name": "UE  RED",
    "logo": "UE.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 12,
    "cqbKills": 8,
    "lrbKills": 7,
    "assists": 8,
    "cqbDmg": 755,
    "lrbDmg": 465
  },
  {
    "id": "t-17",
    "name": "ORK Esports",
    "logo": "or.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 20,
    "cqbKills": 8,
    "lrbKills": 6,
    "assists": 7,
    "cqbDmg": 1100,
    "lrbDmg": 850
  },
  {
    "id": "t-18",
    "name": "Kadayadi Boys",
    "logo": "unknown.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 19,
    "cqbKills": 8,
    "lrbKills": 6,
    "assists": 7,
    "cqbDmg": 1075,
    "lrbDmg": 830
  },
  {
    "id": "t-19",
    "name": "TEAM OBEY",
    "logo": "obey.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 18,
    "cqbKills": 8,
    "lrbKills": 6,
    "assists": 7,
    "cqbDmg": 1050,
    "lrbDmg": 810
  },
  {
    "id": "t-20",
    "name": "Andheri",
    "logo": "unknown.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 17,
    "cqbKills": 8,
    "lrbKills": 6,
    "assists": 7,
    "cqbDmg": 1025,
    "lrbDmg": 790
  },
  {
    "id": "t-21",
    "name": "K51 Officals",
    "logo": "k51.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 16,
    "cqbKills": 8,
    "lrbKills": 6,
    "assists": 7,
    "cqbDmg": 1000,
    "lrbDmg": 770
  },
  {
    "id": "t-22",
    "name": "Zero Hour",
    "logo": "ZE.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 15,
    "cqbKills": 7,
    "lrbKills": 6,
    "assists": 7,
    "cqbDmg": 975,
    "lrbDmg": 750
  },
  {
    "id": "t-23",
    "name": "TOP 1",
    "logo": "top1.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 14,
    "cqbKills": 7,
    "lrbKills": 6,
    "assists": 7,
    "cqbDmg": 950,
    "lrbDmg": 730
  },
  {
    "id": "t-24",
    "name": "Skill Issue",
    "logo": "UE.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 13,
    "cqbKills": 7,
    "lrbKills": 5,
    "assists": 6,
    "cqbDmg": 925,
    "lrbDmg": 710
  },
  {
    "id": "t-25",
    "name": "TKN",
    "logo": "unknown.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 12,
    "cqbKills": 7,
    "lrbKills": 5,
    "assists": 6,
    "cqbDmg": 900,
    "lrbDmg": 690
  },
  {
    "id": "t-26",
    "name": "RIFLE CLUB",
    "logo": "rifl.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 11,
    "cqbKills": 7,
    "lrbKills": 5,
    "assists": 6,
    "cqbDmg": 875,
    "lrbDmg": 670
  },
  {
    "id": "t-27",
    "name": "Indus Prime",
    "logo": "unknown.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 10,
    "cqbKills": 6,
    "lrbKills": 5,
    "assists": 6,
    "cqbDmg": 850,
    "lrbDmg": 650
  },
  {
    "id": "t-28",
    "name": "BadBoyz",
    "logo": "bad.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 9,
    "cqbKills": 6,
    "lrbKills": 5,
    "assists": 6,
    "cqbDmg": 825,
    "lrbDmg": 630
  },
  {
    "id": "t-29",
    "name": "WAX7",
    "logo": "unknown.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 8,
    "cqbKills": 6,
    "lrbKills": 5,
    "assists": 6,
    "cqbDmg": 800,
    "lrbDmg": 610
  },
  {
    "id": "t-30",
    "name": "CVA",
    "logo": "cvaa.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 7,
    "cqbKills": 6,
    "lrbKills": 5,
    "assists": 6,
    "cqbDmg": 775,
    "lrbDmg": 590
  },
  {
    "id": "t-31",
    "name": "BERSERK",
    "logo": "unknown.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 6,
    "cqbKills": 6,
    "lrbKills": 4,
    "assists": 5,
    "cqbDmg": 750,
    "lrbDmg": 570
  },
  {
    "id": "t-32",
    "name": "VNV",
    "logo": "unknown.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 5,
    "cqbKills": 5,
    "lrbKills": 4,
    "assists": 5,
    "cqbDmg": 725,
    "lrbDmg": 550
  },
  {
    "id": "t-33",
    "name": "XSTREAM THARAVAD",
    "logo": "unknown.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 4,
    "cqbKills": 5,
    "lrbKills": 4,
    "assists": 5,
    "cqbDmg": 700,
    "lrbDmg": 530
  },
  {
    "id": "t-34",
    "name": "KORTEX",
    "logo": "kortex.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 3,
    "cqbKills": 5,
    "lrbKills": 4,
    "assists": 5,
    "cqbDmg": 675,
    "lrbDmg": 510
  },
  {
    "id": "t-35",
    "name": "REV ME BRO",
    "logo": "revmebro.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 2,
    "cqbKills": 5,
    "lrbKills": 4,
    "assists": 5,
    "cqbDmg": 650,
    "lrbDmg": 490
  },
  {
    "id": "t-36",
    "name": "SOULS",
    "logo": "soul.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 1,
    "cqbKills": 5,
    "lrbKills": 4,
    "assists": 5,
    "cqbDmg": 625,
    "lrbDmg": 470
  },
  {
    "id": "t-37",
    "name": "Brawlers Hood (BRH)",
    "logo": "brh.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 0,
    "cqbKills": 4,
    "lrbKills": 3,
    "assists": 4,
    "cqbDmg": 600,
    "lrbDmg": 450
  },
  {
    "id": "t-38",
    "name": "KANDAM BROTHERS",
    "logo": "unknown.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 0,
    "cqbKills": 4,
    "lrbKills": 3,
    "assists": 4,
    "cqbDmg": 575,
    "lrbDmg": 430
  },
  {
    "id": "t-39",
    "name": "LVLX",
    "logo": "unknown.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 0,
    "cqbKills": 4,
    "lrbKills": 3,
    "assists": 4,
    "cqbDmg": 550,
    "lrbDmg": 410
  },
  {
    "id": "t-40",
    "name": "8XR ESP",
    "logo": "unknown.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 0,
    "cqbKills": 4,
    "lrbKills": 3,
    "assists": 4,
    "cqbDmg": 525,
    "lrbDmg": 390
  },
  {
    "id": "t-41",
    "name": "T-GANG",
    "logo": "tga.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 0,
    "cqbKills": 4,
    "lrbKills": 3,
    "assists": 4,
    "cqbDmg": 500,
    "lrbDmg": 370
  },
  {
    "id": "t-42",
    "name": "DICTATORS",
    "logo": "or.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 0,
    "cqbKills": 3,
    "lrbKills": 3,
    "assists": 4,
    "cqbDmg": 475,
    "lrbDmg": 350
  },
  {
    "id": "t-43",
    "name": "VENIN",
    "logo": "unknown.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 0,
    "cqbKills": 3,
    "lrbKills": 3,
    "assists": 4,
    "cqbDmg": 450,
    "lrbDmg": 330
  },
  {
    "id": "t-44",
    "name": "SVA",
    "logo": "unknown.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 0,
    "cqbKills": 3,
    "lrbKills": 2,
    "assists": 3,
    "cqbDmg": 425,
    "lrbDmg": 310
  },
  {
    "id": "t-45",
    "name": "KIDILOSKI",
    "logo": "kidi.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 0,
    "cqbKills": 3,
    "lrbKills": 2,
    "assists": 3,
    "cqbDmg": 400,
    "lrbDmg": 290
  },
  {
    "id": "t-46",
    "name": "LEGION OF STRIKERS",
    "logo": "unknown.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 0,
    "cqbKills": 3,
    "lrbKills": 2,
    "assists": 3,
    "cqbDmg": 375,
    "lrbDmg": 270
  },
  {
    "id": "t-47",
    "name": "Team Minus",
    "logo": "teamminus.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 0,
    "cqbKills": 2,
    "lrbKills": 2,
    "assists": 3,
    "cqbDmg": 350,
    "lrbDmg": 250
  },
  {
    "id": "t-48",
    "name": "TEAM BMG",
    "logo": "bmg.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 0,
    "cqbKills": 2,
    "lrbKills": 2,
    "assists": 3,
    "cqbDmg": 325,
    "lrbDmg": 230
  },
  {
    "id": "t-49",
    "name": "AIM X",
    "logo": "unknown.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 0,
    "cqbKills": 2,
    "lrbKills": 2,
    "assists": 3,
    "cqbDmg": 300,
    "lrbDmg": 210
  },
  {
    "id": "t-50",
    "name": "Ageing But Fearless",
    "logo": "unknown.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 0,
    "cqbKills": 2,
    "lrbKills": 2,
    "assists": 3,
    "cqbDmg": 275,
    "lrbDmg": 190
  },
  {
    "id": "t-51",
    "name": "TRINATH",
    "logo": "trinath.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 0,
    "cqbKills": 2,
    "lrbKills": 1,
    "assists": 2,
    "cqbDmg": 250,
    "lrbDmg": 170
  },
  {
    "id": "t-52",
    "name": "Team Alto",
    "logo": "alto.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 0,
    "cqbKills": 1,
    "lrbKills": 1,
    "assists": 2,
    "cqbDmg": 225,
    "lrbDmg": 150
  },
  {
    "id": "t-53",
    "name": "JUNGLI SENA",
    "logo": "sena.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 0,
    "cqbKills": 1,
    "lrbKills": 1,
    "assists": 2,
    "cqbDmg": 200,
    "lrbDmg": 130
  },
  {
    "id": "t-54",
    "name": "HELLFIRE",
    "logo": "unknown.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 0,
    "cqbKills": 1,
    "lrbKills": 1,
    "assists": 2,
    "cqbDmg": 175,
    "lrbDmg": 110
  },
  {
    "id": "t-55",
    "name": "The Reflex Matrix",
    "logo": "thereflexmatrix.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 0,
    "cqbKills": 1,
    "lrbKills": 1,
    "assists": 2,
    "cqbDmg": 150,
    "lrbDmg": 90
  },
  {
    "id": "t-56",
    "name": "CJ_Gaming_Arena",
    "logo": "cjgaming.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 0,
    "cqbKills": 1,
    "lrbKills": 1,
    "assists": 2,
    "cqbDmg": 125,
    "lrbDmg": 70
  },
  {
    "id": "t-57",
    "name": "MUTANT",
    "logo": "mutant.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 1,
    "cqbDmg": 100,
    "lrbDmg": 50
  },
  {
    "id": "t-58",
    "name": "MALAYALEES KARNA",
    "logo": "unknown.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 1,
    "cqbDmg": 75,
    "lrbDmg": 30
  },
  {
    "id": "t-59",
    "name": "Hashone Neo",
    "logo": "unknown.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 1,
    "cqbDmg": 50,
    "lrbDmg": 10
  },
  {
    "id": "t-60",
    "name": "Warlord X",
    "logo": "warlord.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 1,
    "cqbDmg": 25,
    "lrbDmg": 0
  },
  {
    "id": "t-61",
    "name": "Squad One",
    "logo": "squadone.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 1,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-62",
    "name": "FATE",
    "logo": "fate.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 1,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-63",
    "name": "fRag Republic",
    "logo": "frag.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 1,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-64",
    "name": "M5 GAMING",
    "logo": "m5.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-65",
    "name": "OUTSTRIPPERS",
    "logo": "outstrippers.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-66",
    "name": "SQUAD MATRIX",
    "logo": "squadmatrix.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-67",
    "name": "Plants Army",
    "logo": "plants.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-68",
    "name": "Rising Dragons",
    "logo": "rising.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-69",
    "name": "PDX",
    "logo": "pdx.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-70",
    "name": "Night Hunter",
    "logo": "night.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-71",
    "name": "UNKRITHI",
    "logo": "un.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-72",
    "name": "STUDS",
    "logo": "studs.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-73",
    "name": "MARATHABAAD",
    "logo": "marathabaad.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-74",
    "name": "HAVK",
    "logo": "havk.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-75",
    "name": "RACR",
    "logo": "racr.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-76",
    "name": "Xtreme DOMINATORS",
    "logo": "or.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-77",
    "name": "Koya_IYKYK",
    "logo": "koya_iykyk.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-78",
    "name": "SAPPUNNIZ",
    "logo": "un.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-79",
    "name": "Team FragFusion",
    "logo": "teamfragfusion.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-80",
    "name": "MALAYALEES VAJRA",
    "logo": "unknown.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-81",
    "name": "Rat Hunters",
    "logo": "un.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-82",
    "name": "High Fury",
    "logo": "hi.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-83",
    "name": "MEN IN BLACK",
    "logo": "unknown.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-84",
    "name": "TeamMindSpark",
    "logo": "mindspark.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-85",
    "name": "DNA",
    "logo": "unknown.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-86",
    "name": "X-RAY",
    "logo": "X-RAY.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-87",
    "name": "TEAM DIVISION",
    "logo": "unknown.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-88",
    "name": "Team XD",
    "logo": "teamxd.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-89",
    "name": "Fourged Titans",
    "logo": "fourged.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-90",
    "name": "Rizzlers",
    "logo": "unknown.png",
    "group": "B_VS_C",
    "match": 6,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-91",
    "name": "Zero Trace",
    "logo": "ZE.png",
    "group": "A_VS_B",
    "match": 1,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-92",
    "name": "THE UNKNOWN",
    "logo": "unknown.png",
    "group": "C_VS_D",
    "match": 2,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-93",
    "name": "Ocean Gaming",
    "logo": "oceangaming.png",
    "group": "A_VS_C",
    "match": 3,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-94",
    "name": "P9-Pulse9",
    "logo": "p9.png",
    "group": "B_VS_D",
    "match": 4,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  },
  {
    "id": "t-95",
    "name": "4 Guys",
    "logo": "4guys.png",
    "group": "A_VS_D",
    "match": 5,
    "placementPts": 0,
    "cqbKills": 0,
    "lrbKills": 0,
    "assists": 0,
    "cqbDmg": 0,
    "lrbDmg": 0
  }
];

    // Also attempt runtime async refresh from live_scores.json if hosted on web server
    try {
      fetch('live_scores.json')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            liveTournamentTeams = data.map((t, i) => ({
              id: t.id || 	-,
              name: t.name,
              logo: t.logo || 'unknown.png',
              group: t.group || 'OVERALL',
              match: t.match || 4,
              placementPts: t.placementPoints || Math.max(0, 42 - i * 2),
              cqbKills: t.cqbKills || Math.max(0, 18 - Math.floor(i * 0.7)),
              lrbKills: t.lrbKills || Math.max(0, 14 - Math.floor(i * 0.5)),
              assists: t.assists || Math.max(0, 15 - Math.floor(i * 0.5)),
              cqbDmg: t.cqbDmg || Math.max(0, 2480 - i * 115),
              lrbDmg: t.lrbDmg || Math.max(0, 1890 - i * 95)
            }));
            renderLiveLeaderboard();
          }
        })
        .catch(() => {});
    } catch(e) {}

    let currentGroupFilter = 'OVERALL';
    let currentMatchFilter = 'TOTAL';
    let isAutoUpdateActive = true;
    let alivePlayersCount = 42;
    let airdropSecondsRemaining = 24;

    // Filter pill listeners
    document.querySelectorAll('[data-group]').forEach(pill => {
      pill.addEventListener('click', () => {
        sound.playClick();
        document.querySelectorAll('[data-group]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentGroupFilter = pill.getAttribute('data-group');
        renderLiveLeaderboard();
      });
    });

    document.querySelectorAll('[data-match]').forEach(pill => {
      pill.addEventListener('click', () => {
        sound.playClick();
        document.querySelectorAll('[data-match]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentMatchFilter = pill.getAttribute('data-match');
        renderLiveLeaderboard();
      });
    });

    // Auto update toggle
    autoToggleBtn.addEventListener('click', () => {
      sound.playClick();
      isAutoUpdateActive = !isAutoUpdateActive;
      if (isAutoUpdateActive) {
        autoToggleBtn.classList.remove('paused');
        autoToggleBtn.textContent = '⏱️ AUTO-UPDATE: ON (3s)';
      } else {
        autoToggleBtn.classList.add('paused');
        autoToggleBtn.textContent = '⏸️ AUTO-UPDATE: PAUSED';
      }
    });

    function renderLiveLeaderboard(highlightTeamId = null) {
      if (!liveTableBody) return;
      liveTableBody.innerHTML = '';

      let filtered = liveTournamentTeams.filter(t => {
        if (currentGroupFilter !== 'OVERALL' && t.group !== currentGroupFilter) return false;
        if (currentMatchFilter !== 'TOTAL' && t.match.toString() !== currentMatchFilter) return false;
        return true;
      });

      // Calculate totals and sort
      filtered.sort((a, b) => {
        const totalA = a.placementPts + (a.cqbKills + a.lrbKills);
        const totalB = b.placementPts + (b.cqbKills + b.lrbKills);
        const killsA = a.cqbKills + a.lrbKills;
        const killsB = b.cqbKills + b.lrbKills;
        const dmgA = a.cqbDmg + a.lrbDmg;
        const dmgB = b.cqbDmg + b.lrbDmg;
        return totalB - totalA || killsB - killsA || dmgB - dmgA || a.name.localeCompare(b.name);
      });

      filtered.forEach((team, index) => {
        const totalKills = team.cqbKills + team.lrbKills;
        const totalPoints = team.placementPts + totalKills;
        const totalDmg = (team.cqbDmg + team.lrbDmg).toFixed(0);

        const tr = document.createElement('tr');
        if (team.id === highlightTeamId) {
          tr.classList.add('highlight-flash');
          setTimeout(() => tr.classList.remove('highlight-flash'), 1200);
        }

        tr.innerHTML = `
          <td style="font-weight:700;color:${index < 3 ? 'var(--gold-primary)' : 'var(--text-muted)'};">${index + 1}.</td>
          <td>
            <div class="live-team-cell">
              <img src="assets/teams/${team.logo}" onerror="this.src='assets/teams/unknown.png'" alt="${team.name}">
              <span>${team.name}</span>
            </div>
          </td>
          <td style="font-weight:800;color:var(--gold-light);font-size:0.95rem;">${totalPoints}</td>
          <td>${team.placementPts}</td>
          <td style="color:#00ff88;font-weight:700;">${totalKills}</td>
          <td>${team.assists}</td>
          <td>${team.cqbKills} / ${team.cqbDmg}</td>
          <td>${team.lrbKills} / ${team.lrbDmg}</td>
          <td style="color:var(--gold-primary);font-weight:600;">${totalDmg}</td>
        `;
        liveTableBody.appendChild(tr);
      });
    }

    // Initial table render
    renderLiveLeaderboard();

    // Initial Combat Feed Seed Events
    const initialFeeds = [
      { time: '04:22', killer: 'SQ1_NEXUS', team: 'SQUAD ONE', type: 'CQB', weapon: 'M416 (Laser Spray)', victim: 'RZK_VIPER', victimTeam: 'RAKUZAN' },
      { time: '04:19', killer: 'HAVK_SNIPER', team: 'HAVK', type: 'LRB', weapon: 'AWM 450M Headshot', victim: 'ZERO_ACE', victimTeam: 'ZERO HOUR' },
      { time: '04:14', killer: 'SQ1_VORTEX', team: 'SQUAD ONE', type: 'CQB', weapon: 'Beryl M762 CQB Wipe', victim: 'ORK_BLAZE', victimTeam: 'ORK ESPORTS' },
      { time: '04:08', killer: 'RZK_PHOENIX', team: 'RAKUZAN', type: 'LRB', weapon: 'Mini14 DMR Tap', victim: 'STUDS_APEX', victimTeam: 'THE STUDS' }
    ];

    initialFeeds.forEach(f => addCombatFeedItem(f));

    function addCombatFeedItem(item) {
      if (!combatFeedList) return;
      const div = document.createElement('div');
      div.className = 'combat-feed-item';
      div.innerHTML = `
        <div>
          <span style="color:var(--text-dark);margin-right:8px;">[${item.time}]</span>
          <strong style="color:var(--gold-light);">${item.killer}</strong>
          <span style="color:var(--text-muted);font-size:0.7rem;">(${item.team})</span>
          <span style="margin: 0 6px;color:var(--crimson);">💥</span>
          <span style="color:var(--text-bone);">${item.weapon}</span>
          <span style="margin: 0 6px;color:var(--text-muted);">➔</span>
          <span style="color:var(--text-muted);">${item.victim}</span>
        </div>
        <span class="${item.type === 'CQB' ? 'combat-badge-cqb' : 'combat-badge-lrb'}">${item.type}</span>
      `;
      combatFeedList.prepend(div);
      if (combatFeedList.children.length > 20) {
        combatFeedList.removeChild(combatFeedList.lastChild);
      }
    }

    // Live Automatic Polling & Event Simulation Loop (Every 3 seconds)
    setInterval(() => {
      // Always update real-time sync clock
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      if (syncTimeEl) syncTimeEl.textContent = `SYNC: ${timeStr}`;

      // Airdrop countdown
      if (airdropSecondsRemaining > 0) {
        airdropSecondsRemaining--;
      } else {
        airdropSecondsRemaining = 45;
      }
      if (teleDropEl) teleDropEl.textContent = `00:${airdropSecondsRemaining.toString().padStart(2, '0')} SEC [POCHINKI E.]`;

      // Fluctuate latency ping
      const ping = Math.floor(16 + Math.random() * 6);
      if (telePingEl) telePingEl.textContent = `${ping} MS (MUMBAI)`;

      if (!isAutoUpdateActive) return;

      // Randomly simulate a live combat engagement every tick
      if (Math.random() > 0.3) {
        const randomTeamIdx = Math.floor(Math.random() * liveTournamentTeams.length);
        const team = liveTournamentTeams[randomTeamIdx];
        const isCQB = Math.random() > 0.45;
        const addDmg = Math.floor(75 + Math.random() * 180);

        if (isCQB) {
          team.cqbKills += 1;
          team.cqbDmg += addDmg;
        } else {
          team.lrbKills += 1;
          team.lrbDmg += addDmg;
        }

        // Alive player count decrements realistically
        if (alivePlayersCount > 16) {
          alivePlayersCount--;
          const aliveSquads = Math.max(4, Math.ceil(alivePlayersCount / 3.8));
          if (teleAliveEl) teleAliveEl.textContent = `${alivePlayersCount} / 64 (${aliveSquads} SQUADS)`;
        }

        // Generate dynamic kill event in feed
        const weapons = isCQB ? ['M416 Close Spray', 'Beryl M762 CQB', 'DBS Shotgun', 'Frag Grenade'] : ['AWM 480M Sniped', 'Kar98k Headshot', 'MK12 DMR Tap', 'M24 Precision'];
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];
        const minutes = Math.floor(4 + (64 - alivePlayersCount) / 10);
        const seconds = Math.floor(Math.random() * 60);
        const timeFormatted = `0${minutes}:${seconds.toString().padStart(2, '0')}`;

        addCombatFeedItem({
          time: timeFormatted,
          killer: `${team.name.replace(/\s+/g, '_')}_FRAGGER`,
          team: team.name,
          type: isCQB ? 'CQB' : 'LRB',
          weapon: weapon,
          victim: `ENEMY_PLAYER_${Math.floor(10 + Math.random() * 90)}`,
          victimTeam: 'OPPOSING SQUAD'
        });

        // Re-render and flash the updated team row
        renderLiveLeaderboard(team.id);
      }
    }, 3000);

    // Modal Visibility & Widget Interactions
    const finalsWidgetObserver = new IntersectionObserver(([entry]) => {
      finalsLiveWidget.classList.toggle('visible', entry.isIntersecting && !intelModal.classList.contains('active'));
    }, { threshold: 0.05 });
    finalsWidgetObserver.observe(tournamentSeasonsSection);

    openModalBtn.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      intelModal.classList.add('active');
      renderLiveLeaderboard();
    });

    openCircuitBtn.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      intelModal.classList.add('active');
      finalsLiveWidget.classList.remove('visible');
      renderLiveLeaderboard();
    });

    closeModalBtn.addEventListener('click', () => {
      sound.playClick();
      intelModal.classList.remove('active');
      finalsLiveWidget.classList.toggle('visible', tournamentSeasonsSection.getBoundingClientRect().top < window.innerHeight && tournamentSeasonsSection.getBoundingClientRect().bottom > 0);
    });

    intelModal.addEventListener('click', (e) => {
      if (e.target === intelModal) {
        intelModal.classList.remove('active');
        finalsLiveWidget.classList.toggle('visible', tournamentSeasonsSection.getBoundingClientRect().top < window.innerHeight && tournamentSeasonsSection.getBoundingClientRect().bottom > 0);
      }
    });

    finalsLiveWidget.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      intelModal.classList.add('active');
      finalsLiveWidget.classList.remove('visible');
      renderLiveLeaderboard();
    });

    const airdropCanvas = document.getElementById('airdrop-3d-canvas');
    if (window.THREE && airdropCanvas) {
      const airdropScene = new THREE.Scene();
      const airdropCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
      const airdropRenderer = new THREE.WebGLRenderer({ canvas: airdropCanvas, alpha: true, antialias: true });
      airdropRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      airdropRenderer.setSize(78, 78, false);
      airdropCamera.position.set(0, 1, 5);
      airdropScene.add(new THREE.AmbientLight(0xffffff, 1.5));
      const airdropLight = new THREE.PointLight(0xff3333, 2.2, 8);
      airdropLight.position.set(2, 3, 4);
      airdropScene.add(airdropLight);

      const airdropModel = new THREE.Group();
      airdropScene.add(airdropModel);
      new THREE.FBXLoader().load('source/DROP.fbx', (model) => {
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 2.6 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        model.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ color: 0xb51f24, metalness: 0.55, roughness: 0.38 });
          }
        });
        airdropModel.add(model);
      });

      const animateAirdrop = () => {
        airdropModel.rotation.y += 0.018;
        airdropModel.position.y = Math.sin(performance.now() * 0.002) * 0.08;
        airdropRenderer.render(airdropScene, airdropCamera);
        requestAnimationFrame(animateAirdrop);
      };
      animateAirdrop();
    }

    /* ==========================================================================
       07. PUBG COMPASS, KILLFEED & BLUE ZONE TRIGGER
       ========================================================================== */
    const compassTrack = document.getElementById('compass-track');
    const blueZoneEl = document.getElementById('blue-zone');
    const progressBar = document.getElementById('top-progress');
    const hudScrollPos = document.getElementById('hud-scroll-pos');
    const hudScrollPct = document.getElementById('hud-scroll-pct');
    const headerEl = document.getElementById('header');

    const kf1 = document.getElementById('kf-1');
    const kf2 = document.getElementById('kf-2');
    const kf3 = document.getElementById('kf-3');

    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        const pct = Math.round(self.progress * 100);
        const scrollY = Math.round(self.scroll());
        
        progressBar.style.width = `${pct}%`;
        hudScrollPct.textContent = `PCT://${pct.toString().padStart(2, '0')}%`;
        hudScrollPos.textContent = `SCR://${scrollY.toString().padStart(4, '0')}PX`;

        const compassOffset = (scrollY * 0.25) % 200;
        compassTrack.style.transform = `translateX(-${compassOffset}px)`;

        if (scrollY > 500) {
          document.body.classList.add('blue-zone-active');
        } else {
          document.body.classList.remove('blue-zone-active');
        }

        if (pct > 15 && pct < 45) { kf1.classList.add('show'); } else { kf1.classList.remove('show'); }
        if (pct > 40 && pct < 75) { kf2.classList.add('show'); } else { kf2.classList.remove('show'); }
        if (pct > 70 && pct < 98) { kf3.classList.add('show'); } else { kf3.classList.remove('show'); }

        if (scrollY > 60) {
          headerEl.classList.add('scrolled');
        } else {
          headerEl.classList.remove('scrolled');
        }
      }
    });

    /* ==========================================================================
       08. CHAPTER NAVIGATION RAIL & ACTIVE HIGHLIGHT
       ========================================================================== */
    const sections = ['hero', 'tournaments', 'teams'];
    const chapterDots = document.querySelectorAll('.chapter-dot');
    const navLinks = document.querySelectorAll('.nav-link');

    chapterDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetId = dot.getAttribute('data-section');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          lenis.scrollTo(targetEl, {
            offset: -40,
            duration: 1.8,
            easing: (t) => 1 - Math.pow(1 - t, 4)
          });
        }
      });
    });

    sections.forEach(secId => {
      ScrollTrigger.create({
        trigger: `#${secId}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateActiveNav(secId),
        onEnterBack: () => updateActiveNav(secId)
      });
    });

    function updateActiveNav(activeId) {
      chapterDots.forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('data-section') === activeId);
      });
      navLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', href === activeId);
      });
    }

    /* ==========================================================================
       09. HERO ENTRANCE & PARALLAX TIMELINE
       ========================================================================== */
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .from('#hero-crest', { scale: 0.5, opacity: 0, duration: 1.2 }, 0.2)
      .from('#hero-title', { y: 60, opacity: 0, duration: 1 }, 0.4)
      .from('#hero-tagline', { y: 30, opacity: 0, duration: 0.8 }, 0.6)
      .from('#hero-partner', { y: 20, opacity: 0, duration: 0.8 }, 0.8)
      .from('#hero-cta', { y: 20, opacity: 0, duration: 0.8 }, 1.0);

    gsap.to('#hero-parallax-bg', {
      yPercent: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    /* ==========================================================================
       11. INTEL COUNTERS ANIMATION
       ========================================================================== */
    const statBoxes = document.querySelectorAll('.stat-number');
    statBoxes.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      ScrollTrigger.create({
        trigger: stat,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(stat, {
            innerText: target,
            duration: 2,
            snap: { innerText: 1 },
            ease: 'power2.out',
            onUpdate: function() {
              if (target >= 1000) {
                stat.innerText = Math.round(this.targets()[0].innerText).toLocaleString() + '+';
              } else if (stat.nextElementSibling.innerText.includes('%')) {
                stat.innerText = Math.round(this.targets()[0].innerText) + '%';
              } else {
                stat.innerText = Math.round(this.targets()[0].innerText) + (target > 50 ? '+' : '');
              }
            }
          });
        }
      });
    });

    /* ==========================================================================
       12. WEAPON ARSENAL SCROLL & 3D BULLET TRACER ANIMATIONS
       ========================================================================== */
    document.querySelectorAll('.weapon-card').forEach(card => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 80%',
        onEnter: () => {
          const fills = card.querySelectorAll('.spec-bar-fill');
          fills.forEach(f => {
            f.style.width = f.getAttribute('data-fill');
          });
          const weapon = card.getAttribute('data-weapon');
          sound.playShot(weapon);

          // Trigger supersonic bullet tracer
          const tracer = card.querySelector('.bullet-tracer-line');
          if (tracer) {
            gsap.fromTo(tracer, 
              { opacity: 1, scaleX: 0, x: -100 },
              { opacity: 0, scaleX: 2.5, x: 250, duration: 0.35, ease: 'power4.out' }
            );
          }
        }
      });
    });

    /* ==========================================================================
       13. PINNED MATCH PROTOCOL (INTERACTIVE STORY SCRUB)
       ========================================================================== */
    const stageCards = document.querySelectorAll('.protocol-stage-card');
    const holoTarget = document.getElementById('holo-target');
    const holoRing = document.getElementById('holo-ring');
    const holoTelemetry = document.getElementById('holo-telemetry');
    
    const stageTelemetry = [
      'COORDS: LAT 44.82 // LON 20.45<br>ZONE 1 DROP PROTOCOL<br>STATUS: INFILTRATION COMPLETE',
      'COORDS: LAT 45.12 // LON 21.08<br>HARD-SHIFT COMPOUND REACHED<br>STATUS: 3-1 ANCHOR SECURED',
      'COORDS: LAT 45.30 // LON 21.40<br>UTILITY BARRAGE ENGAGED<br>STATUS: 3 SQUADS ELIMINATED',
      'COORDS: LAT 45.45 // LON 21.52<br>FINAL CIRCLE SECURED<br>STATUS: CHICKEN DINNER DEPLOYED'
    ];

    let currentStage = 0;

    ScrollTrigger.create({
      trigger: '#protocol',
      start: 'top top',
      end: '+=300%',
      pin: '#protocol-pin',
      scrub: 0.8,
      onUpdate: (self) => {
        const stageIndex = Math.min(3, Math.floor(self.progress * 4));
        if (stageIndex !== currentStage) {
          currentStage = stageIndex;
          sound.playStageChime(currentStage);

          stageCards.forEach((card, idx) => {
            card.classList.toggle('active', idx === currentStage);
          });

          holoTarget.textContent = `0${currentStage + 1}`;
          holoRing.style.transform = `rotate(${currentStage * 90}deg) scale(${1 + currentStage * 0.08})`;
          holoTelemetry.innerHTML = stageTelemetry[currentStage];
        }
      }
    });

    /* ==========================================================================
       14. 3D PERSPECTIVE TILT ON ROSTER CARDS
       ========================================================================== */
    document.querySelectorAll('.roster-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -14;
        const rotateY = ((x - centerX) / centerX) * 14;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.3,
          ease: 'power1.out',
          transformPerspective: 1000
        });

        const sheen = card.querySelector('.card-sheen');
        if (sheen) {
          sheen.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(212, 175, 55, 0.35), transparent 60%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
    });

    gsap.from('.roster-card', {
      scrollTrigger: {
        trigger: '.roster-grid',
        start: 'top 80%'
      },
      y: 80,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out'
    });

    /* ==========================================================================
       15. 100+ TEAMS DATA INJECTION (3 AUTO-SCROLLING TRACKS)
       ========================================================================== */
    const season2QualifierTeams = [
      ['A047', 'unknown.png'],
      ['AIMLEGIT', 'unknown.png'],
      ['CITY TIGERS X', 'unknown.png'],
      ['DANJAAR', 'unknown.png'],
      ['DEADSHOTS', 'unknown.png'],
      ['Indus Prime', 'ip4elite.png'],
      ['KALI-2', 'kali1.png'],
      ['POWER HOUSE', 'unknown.png'],
      ['RAKUZAN', 'rakuzan.png'],
      ["SHONNANI'S", 'unknown.png'],
      ['SQUAD TWO', 'unknown.png'],
      ['UNKRITHI 2', 'unknown.png']
    ];

    const qualifierStandingsBody = document.getElementById('qualifier-standings-body');
    season2QualifierTeams.forEach(([name, logo], index) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${index + 1}.</td><td><div class="qualifier-team"><img src="assets/teams/${logo}" onerror="this.src='assets/teams/unknown.png'" alt="${name} logo"><span>${name}</span></div></td><td>QUALIFIER</td>`;
      qualifierStandingsBody.appendChild(row);
    });

    const allTeamsList = [
      "4guys.png", "abf.png", "adr.png", "aex.png", "alg.png", "alto.png", "bad.png", "bana.png", "bbz.png", "bmesports.png",
      "bmg.png", "bmm.png", "brc.png", "brh.png", "btgg.png", "cjgaming.png", "ctx.png", "cvaa.png", "cvm.png", "darkshadow.png",
      "doe.png", "e2x.png", "evx.png", "expands.png", "fate.png", "fourged.png", "frag.png", "frz.png", "fzp.png", "guru.png",
      "havk.png", "hf.png", "hi.png", "IP4.png", "ip4elite.png", "junglisena.png", "k51.png", "kali1.png", "kb.png", "kg.png",
      "kidi.png", "kortex.png", "koya.png", "koya_iykyk.png", "kvp.png", "kx.png", "lili.png", "los.png", "m5.png", "macky.png",
      "man.png", "manhoy.png", "marathabaad.png", "masz.png", "mdx.png", "mfl.png", "mgx.png", "mindspark.png", "mix.png", "mob.png",
      "mutant.png", "night.png", "nxs.png", "obey.png", "oceangaming.png", "or.png", "orb.png", "ork.png", "orkesports.png", "otg.png",
      "outstrippers.png", "p9.png", "p9cc.png", "p9se.png", "pdx.png", "plants.png", "pleck.png", "priv.png", "racr.png", "rakuzan.png",
      "rat.png", "rathunters.png", "redv.png", "revmebro.png", "rifl.png", "rising.png", "rz.png", "sadya.png", "sala.png", "sappu.png",
      "sena.png", "sigma.png", "soul.png", "sq-red.png", "sq1eccli.png", "sq1r.png", "squadone.png", "std.png", "studs.png",
      "sus.png", "teamfragfusion.png", "teamlootkhor.png", "teammindspark.png", "teamminus.png", "teamxd.png", "tex.png", "tga.png", "thereflexmatrix.png", "tl.png",
      "top1.png", "tox.png", "tpa.png", "tracezero.png", "trinath.png", "trx.png", "tva.png", "uered.png", "uki.png", "un.png",
      "unknown.png", "vikings.png", "warlord.png", "wbl.png", "wfww.png", "wolf.png", "wtm.png", "wx7.png", "xd.png", "xdd.png",
      "xray.png", "xttt.png", "z30.png", "zerohour.png", "zh.png"
    ];

    function createCapsule(file) {
      const name = file.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
      const div = document.createElement('div');
      div.className = 'team-capsule';
      div.setAttribute('data-sound', 'hover');
      div.innerHTML = `<img src="assets/teams/${file}" onerror="this.src='assets/teams/squadone.png'" alt="${name}"><span>${name}</span>`;
      div.addEventListener('mouseenter', () => sound.playHover());
      return div;
    }

    const row1El = document.getElementById('capsule-row1');
    const row2El = document.getElementById('capsule-row2');
    const row3El = document.getElementById('capsule-row3');

    const chunkSize = Math.ceil(allTeamsList.length / 3);
    const chunk1 = allTeamsList.slice(0, chunkSize);
    const chunk2 = allTeamsList.slice(chunkSize, chunkSize * 2);
    const chunk3 = allTeamsList.slice(chunkSize * 2);

    [...chunk1, ...chunk1].forEach(f => row1El.appendChild(createCapsule(f)));
    [...chunk2, ...chunk2].forEach(f => row2El.appendChild(createCapsule(f)));
    [...chunk3, ...chunk3].forEach(f => row3El.appendChild(createCapsule(f)));

    /* FINALS CARD ACHIEVEMENT FLIP */
    const finalsAchievements = [
      ['HOST RECORD', '24 events hosted', '16 finals lobbies', '100% bracket uptime'],
      ['QUALIFIER RUN', '3 podium finishes', 'Top 8 regional seed', '92% match survival'],
      ['FRAGGING RECORD', '4.8 team K/D', '18 clutch wipes', 'Best entry rate'],
      ['FINALS FORM', '6 straight finals', '12 clean rotations', 'Zone control award'],
      ['CHAMPIONSHIP RUN', '2 grand final wins', 'Top damage roster', 'MVP nomination'],
      ['TEAM LEGACY', '5 season appearances', 'Regional top 10', '8 match win streak'],
      ['QUALIFIER RUN', '4 match victories', 'Zero disqualifications', 'Top 16 seed'],
      ['TOURNAMENT FORM', '11 finals points', '3 clean sweeps', 'Stronghold award'],
      ['FINALS RECORD', 'Top 5 regional team', '14 lobby wins', 'Endgame specialist'],
      ['RISING SQUAD', '8 qualifier wins', 'Top 12 seed', 'Fastest rotation'],
      ['CLUTCH RECORD', '9 clutch finishes', '5 comeback wins', 'Final circle award'],
      ['QUALIFIER FORM', '14 lobby points', 'Top 16 seed', '2 clean rounds'],
      ['TEAM LEGACY', '7 finals appearances', 'Regional top 8', 'Best support play'],
      ['FINALS FORM', '10 match win streak', 'Top damage team', '3 MVP awards'],
      ['BREAKOUT RUN', '6 qualifier wins', 'Top 16 seed', 'Rookie impact award'],
      ['QUALIFIER FORM', '12 finals points', 'Regional top 10', 'Strong finish rate']
    ];

    document.querySelectorAll('.finals-card').forEach((card, cardIndex) => {
      const originalContent = card.innerHTML;
      const achievement = finalsAchievements[cardIndex] || finalsAchievements[0];
      card.innerHTML = `
        <div class="finals-card-inner">
          <div class="finals-card-face finals-card-front">${originalContent}</div>
          <div class="finals-card-face finals-card-back">
            <div class="achievement-kicker">ACHIEVEMENT LOG // ${String(cardIndex + 1).padStart(2, '0')}</div>
            <div class="achievement-title">${achievement[0]}</div>
            <ul class="achievement-list">
              <li>${achievement[1]}</li>
              <li>${achievement[2]}</li>
              <li>${achievement[3]}</li>
            </ul>
          </div>
        </div>`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'View team achievements');

      const toggleFinalsCard = () => {
        card.classList.toggle('flipped');
        sound.playClick();
      };

      card.addEventListener('click', toggleFinalsCard);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleFinalsCard();
        }
      });
    });

    /* ==========================================================================
       16. KINETIC MARQUEE SCROLL DYNAMICS & COUNTDOWN TIMER
       ========================================================================== */
    let marqueeLeftPos = 0;
    let marqueeRightPos = 0;
    const marqueeLeft = document.getElementById('marquee-left');
    const marqueeRight = document.getElementById('marquee-right');

    lenis.on('scroll', (e) => {
      const v = (e.velocity || 0) * 0.6;
      marqueeLeftPos -= (1.5 + v);
      marqueeRightPos += (1.5 + v);

      marqueeLeft.style.transform = `translateX(${marqueeLeftPos % 1000}px)`;
      marqueeRight.style.transform = `translateX(${marqueeRightPos % 1000}px)`;
    });

    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-mins');
    const cdSecs = document.getElementById('cd-secs');

    function updateScrimSchedule() {
      const now = new Date();
      const istParts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).formatToParts(now).reduce((parts, part) => {
        parts[part.type] = Number(part.value);
        return parts;
      }, {});
      const istDate = new Date(Date.UTC(istParts.year, istParts.month - 1, istParts.day));
      const scrimDays = [0, 5, 6];
      let target = Date.UTC(istParts.year, istParts.month - 1, istParts.day, 14, 30);

      while (!scrimDays.includes(istDate.getUTCDay()) || now.getTime() >= target) {
        istDate.setUTCDate(istDate.getUTCDate() + 1);
        target = Date.UTC(istDate.getUTCFullYear(), istDate.getUTCMonth(), istDate.getUTCDate(), 14, 30);
        if (scrimDays.includes(istDate.getUTCDay())) break;
      }

      const remaining = Math.max(0, target - now.getTime());
      const totalSeconds = Math.floor(remaining / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      cdDays.textContent = days.toString().padStart(2, '0');
      cdHours.textContent = hours.toString().padStart(2, '0');
      cdMins.textContent = minutes.toString().padStart(2, '0');
      cdSecs.textContent = seconds.toString().padStart(2, '0');
    }

    updateScrimSchedule();
    setInterval(updateScrimSchedule, 1000);
  