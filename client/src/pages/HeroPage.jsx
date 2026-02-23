import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let W, H;
    const PCount = 70;
    let particles = [];

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 1.6 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.6 ? "#ff6b00" : "#94a3b8";
      }
      move() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const init = () => {
      resize();
      particles = Array.from({ length: PCount }, () => new Particle());
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,107,0,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.move();
        p.draw();
      });
      drawLines();
      raf = requestAnimationFrame(loop);
    };

    init();
    loop();
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

const features = [
  {
    icon: "⚙️",
    title: "Forging Simulation",
    desc: "Open die, closed die & upset forging analysis with real material science",
    color: "#ff6b00",
  },
  {
    icon: "🔩",
    title: "Lathe Operations",
    desc: "Turning, facing, taper & thread cutting with RPM & cycle time",
    color: "#3b82f6",
  },
  {
    icon: "🧱",
    title: "10+ Materials",
    desc: "Steel, Titanium, Copper, Brass, Cast Iron, Magnesium & more",
    color: "#10b981",
  },
  {
    icon: "🤖",
    title: "AI Insights",
    desc: "Real-time engineering explanations, cost breakdown & optimization",
    color: "#a855f7",
  },
];

const stats = [
  { value: "10+", label: "Materials" },
  { value: "6", label: "Operations" },
  { value: "AI", label: "Powered" },
  { value: "99%", label: "Accurate" },
];

export default function HeroPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #060c1a 0%, #0d1b2e 35%, #111827 65%, #060c1a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Particle Network ── */}
      <ParticleCanvas />

      {/* ── Aurora Blobs ── */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: 480,
          height: 320,
          background:
            "radial-gradient(ellipse, rgba(255,107,0,0.13) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "auroraMove 8s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: 360,
          height: 260,
          background:
            "radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "auroraMove 12s ease-in-out infinite alternate-reverse",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "20%",
          width: 280,
          height: 200,
          background:
            "radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Grid Overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,107,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 100% 100% at 50% 50%, black 20%, transparent 90%)",
        }}
      />

      {/* ── Floating Gear Rings ── */}
      {[
        { size: 140, top: "6%", right: "5%", op: 0.1, dir: 1 },
        { size: 80, bottom: "10%", left: "4%", op: 0.08, dir: -1 },
        { size: 55, top: "28%", left: "9%", op: 0.11, dir: 1 },
        { size: 40, bottom: "30%", right: "12%", op: 0.09, dir: -1 },
      ].map((g, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: g.size,
            height: g.size,
            top: g.top,
            bottom: g.bottom,
            left: g.left,
            right: g.right,
            border: `1.5px solid rgba(255,107,0,${g.op})`,
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0,
            animation: `spin-slow ${20 + i * 7}s linear infinite`,
            animationDirection: g.dir === -1 ? "reverse" : "normal",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "60%",
              height: "60%",
              border: `1px solid rgba(255,107,0,${g.op * 0.6})`,
              borderRadius: "50%",
            }}
          />
        </div>
      ))}

      {/* ── Main Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 780,
          width: "100%",
        }}
      >
        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 28 }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 18px",
              background: "rgba(255,107,0,0.12)",
              border: "1px solid rgba(255,107,0,0.3)",
              borderRadius: 99,
              color: "#ff8c38",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "Outfit, sans-serif",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                background: "#ff6b00",
                borderRadius: "50%",
                boxShadow: "0 0 8px #ff6b00, 0 0 16px rgba(255,107,0,0.5)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            AI-Powered Manufacturing Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: "clamp(44px, 8.5vw, 82px)",
            fontWeight: 800,
            lineHeight: 1.06,
            margin: "0 0 6px",
            color: "white",
            textShadow: "0 0 80px rgba(255,107,0,0.15)",
          }}
        >
          Mechanical
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: "clamp(44px, 8.5vw, 82px)",
            fontWeight: 800,
            lineHeight: 1.06,
            margin: "0 0 28px",
            background:
              "linear-gradient(135deg, #ff6b00 0%, #ff8c38 40%, #ffb347 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 30px rgba(255,107,0,0.4))",
          }}
        >
          GPT
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          style={{
            fontSize: 18,
            color: "#94a3b8",
            maxWidth: 540,
            margin: "0 auto 44px",
            lineHeight: 1.7,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Precision engineering simulation for Forging &amp; Lathe operations —
          powered by AI and real material science databases.
        </motion.p>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          style={{
            display: "flex",
            gap: 32,
            justifyContent: "center",
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 800,
                  fontSize: 28,
                  color: "#ff8c38",
                  textShadow: "0 0 20px rgba(255,107,0,0.4)",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            marginBottom: 60,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/chat")}
            style={{
              padding: "14px 40px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #ff6b00, #ff8c38)",
              color: "white",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              boxShadow:
                "0 0 32px rgba(255,107,0,0.45), 0 6px 20px rgba(255,107,0,0.3)",
              transition: "all 0.25s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 0 48px rgba(255,107,0,0.6), 0 12px 30px rgba(255,107,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 0 32px rgba(255,107,0,0.45), 0 6px 20px rgba(255,107,0,0.3)";
            }}
          >
            🚀 Start Analysis
          </button>
          <button
            onClick={() => navigate("/chat")}
            style={{
              padding: "14px 32px",
              borderRadius: 14,
              border: "1.5px solid rgba(255,107,0,0.35)",
              background: "rgba(255,107,0,0.07)",
              color: "#ff8c38",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,107,0,0.14)";
              e.currentTarget.style.borderColor = "rgba(255,107,0,0.6)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,107,0,0.07)";
              e.currentTarget.style.borderColor = "rgba(255,107,0,0.35)";
              e.currentTarget.style.transform = "none";
            }}
          >
            View Demo
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 16,
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.55 + i * 0.08 }}
              style={{
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 16,
                padding: "20px 18px",
                textAlign: "left",
                backdropFilter: "blur(12px)",
                transition:
                  "border-color 0.25s, transform 0.25s, box-shadow 0.25s",
                cursor: "default",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = `${f.color}55`;
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow = `0 12px 32px -8px ${f.color}25`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "rgba(255,255,255,0.09)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Top accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${f.color}, transparent)`,
                  borderRadius: "16px 16px 0 0",
                }}
              />
              <div
                style={{
                  fontSize: 26,
                  marginBottom: 12,
                  filter: "drop-shadow(0 0 8px rgba(0,0,0,0.3))",
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "Outfit, sans-serif",
                  marginBottom: 6,
                }}
              >
                {f.title}
              </div>
              <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.55 }}>
                {f.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          style={{
            marginTop: 48,
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {["Real Material Database", "Cost Estimation", "Safety Analysis"].map(
            (tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  color: "#475569",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{ color: "#22c55e", fontSize: 13 }}>✓</span> {tag}
              </span>
            ),
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes auroraMove {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
