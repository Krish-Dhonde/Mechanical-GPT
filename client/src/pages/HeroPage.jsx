import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

function MechanicalCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let W, H;

    // Geometric shapes state
    const gears = [];
    const lines = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initShapes();
    };

    class Gear {
      constructor(x, y, radius, teeth, speed, opacity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.teeth = teeth;
        this.speed = speed;
        this.angle = Math.random() * Math.PI * 2;
        this.opacity = opacity;
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(255, 107, 0, ${this.opacity})`;

        for (let i = 0; i < this.teeth; i++) {
          const theta = (i / this.teeth) * Math.PI * 2;
          const nextTheta = ((i + 0.5) / this.teeth) * Math.PI * 2;
          const endTheta = ((i + 1) / this.teeth) * Math.PI * 2;

          ctx.lineTo(
            Math.cos(theta) * this.radius,
            Math.sin(theta) * this.radius,
          );
          ctx.lineTo(
            Math.cos(theta) * (this.radius + 10),
            Math.sin(theta) * (this.radius + 10),
          );
          ctx.lineTo(
            Math.cos(nextTheta) * (this.radius + 10),
            Math.sin(nextTheta) * (this.radius + 10),
          );
          ctx.lineTo(
            Math.cos(nextTheta) * this.radius,
            Math.sin(nextTheta) * this.radius,
          );
        }
        ctx.closePath();
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        this.angle += this.speed;
      }
    }

    class TechLine {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.length = Math.random() * 150 + 50;
        this.angle = Math.floor(Math.random() * 4) * 45 * (Math.PI / 180);
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.15 + 0.05;
      }
      move() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        if (
          this.x < -100 ||
          this.x > W + 100 ||
          this.y < -100 ||
          this.y > H + 100
        ) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x + Math.cos(this.angle) * this.length,
          this.y + Math.sin(this.angle) * this.length,
        );
        ctx.strokeStyle = `rgba(255, 107, 0, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    const initShapes = () => {
      gears.length = 0;
      lines.length = 0;

      // Add a few large "background" gears
      gears.push(new Gear(W * 0.1, H * 0.2, 80, 12, 0.005, 0.1));
      gears.push(new Gear(W * 0.85, H * 0.15, 60, 10, -0.007, 0.08));
      gears.push(new Gear(W * 0.9, H * 0.8, 120, 16, 0.003, 0.06));
      gears.push(new Gear(W * 0.15, H * 0.85, 40, 8, -0.01, 0.12));

      for (let i = 0; i < 15; i++) {
        lines.push(new TechLine());
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw static grid (checks)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x <= W; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let y = 0; y <= H; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();

      gears.forEach((g) => g.draw());
      lines.forEach((l) => {
        l.move();
        l.draw();
      });

      raf = requestAnimationFrame(loop);
    };

    resize();
    loop();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
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
        backgroundColor: "#f8fafc",
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
        background: "#f1f5f9",
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
      {/* ── Mechanical Background ── */}
      <MechanicalCanvas />

      {/* ── Soft Aurora Blobs (Light Theme) ── */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: 580,
          height: 420,
          background:
            "radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "auroraMove 15s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: 460,
          height: 360,
          background:
            "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "auroraMove 20s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* ── Main Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 840,
          width: "100%",
        }}
      >
        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 32 }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              background: "rgba(255, 107, 0, 0.08)",
              border: "1px solid rgba(255, 107, 0, 0.2)",
              borderRadius: 99,
              color: "#e65100",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "Outfit, sans-serif",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              backdropFilter: "blur(4px)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                background: "#ff6b00",
                borderRadius: "50%",
                boxShadow: "0 0 10px rgba(255,107,0,0.4)",
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
            fontSize: "clamp(48px, 9vw, 88px)",
            fontWeight: 800,
            lineHeight: 1.02,
            margin: "0 0 4px",
            color: "#0f172a",
            letterSpacing: "-0.02em",
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
            fontSize: "clamp(48px, 9vw, 88px)",
            fontWeight: 800,
            lineHeight: 1.02,
            margin: "0 0 32px",
            background: "linear-gradient(135deg, #ff6b00 0%, #ff8c38 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 12px rgba(255,107,0,0.15))",
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
            fontSize: 19,
            color: "#475569",
            maxWidth: 580,
            margin: "0 auto 48px",
            lineHeight: 1.6,
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
          }}
        >
          Precision engineering simulation for Forging &amp; Lathe operations —
          optimized by advanced material science and AI algorithms.
        </motion.p>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
            marginBottom: 48,
            flexWrap: "wrap",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center", minWidth: 100 }}>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 800,
                  fontSize: 32,
                  color: "#ff6b00",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 2,
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
            gap: 16,
            justifyContent: "center",
            marginBottom: 64,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/chat")}
            style={{
              padding: "16px 48px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #ff6b00, #ff8c38)",
              color: "white",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 10px 30px -5px rgba(255,107,0,0.4)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 15px 40px -5px rgba(255,107,0,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 10px 30px -5px rgba(255,107,0,0.4)";
            }}
          >
            🚀 Start Simulation
          </button>
          <button
            onClick={() => navigate("/chat")}
            style={{
              padding: "16px 36px",
              borderRadius: 16,
              border: "1.5px solid #e2e8f0",
              background: "white",
              color: "#1e293b",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.transform = "none";
            }}
          >
            How it works
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.55 + i * 0.08 }}
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: "24px 20px",
                textAlign: "left",
                boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                cursor: "default",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = f.color;
                el.style.transform = "translateY(-6px)";
                el.style.boxShadow = `0 20px 30px -10px ${f.color}15`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#e2e8f0";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "0 4px 20px -5px rgba(0,0,0,0.05)";
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  marginBottom: 16,
                  display: "inline-block",
                  padding: "10px",
                  background: `${f.color}10`,
                  borderRadius: "12px",
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: 16,
                  fontFamily: "Outfit, sans-serif",
                  marginBottom: 8,
                }}
              >
                {f.title}
              </div>
              <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
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
            marginTop: 56,
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {["Real Material Data", "Cost Breakdown", "Safety First"].map(
            (tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  letterSpacing: "0.02em",
                }}
              >
                <span style={{ color: "#22c55e", fontSize: 14 }}>●</span> {tag}
              </span>
            ),
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes auroraMove {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(60px, -40px) rotate(5deg) scale(1.1); }
          100% { transform: translate(-20px, 20px) rotate(-5deg) scale(0.95); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
    </div>
  );
}
