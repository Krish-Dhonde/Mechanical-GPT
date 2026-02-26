import { useChatStore } from "../store/useChatStore";
import { generateReport } from "../utils/generateReport";

const safeNum = (val, fn) => {
  if (val === undefined || val === null || isNaN(val)) return "—";
  try {
    return fn(val);
  } catch {
    return "—";
  }
};

function MetricCard({ icon, label, value, accent = false }) {
  return (
    <div
      className="metric-card"
      style={{ opacity: value && value !== "—" ? 1 : 0.5 }}
    >
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <p
        style={{
          fontSize: 11,
          color: "var(--steel-gray)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          margin: "0 0 4px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 20,
          fontWeight: 700,
          margin: 0,
          fontFamily: "Outfit, sans-serif",
          color: accent ? "var(--spark-orange)" : "var(--text-primary)",
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="result-section-title">{children}</h2>;
}

export default function ResultPanel() {
  const { inputs, operationType, subOperation, result } = useChatStore();

  if (!result) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--steel-gray)",
          textAlign: "center",
          gap: 12,
          opacity: 0.6,
        }}
      >
        <svg
          width="42"
          height="42"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
        <p style={{ fontSize: 14, maxWidth: 200, lineHeight: 1.5, margin: 0 }}>
          Results will appear here after your first analysis.
        </p>
      </div>
    );
  }

  const {
    selectedMaterialAnalysis,
    machineRecommendation,
    materialComparison,
    selectedMaterialData,
    bestFitMaterial,
    aiInsights, // We'll pass the insights in the new structure
  } = result;

  // If there's no simulation data, handle gracefully
  const numericalResults = selectedMaterialAnalysis?.numericalResults || {};
  const costAnalysis = selectedMaterialAnalysis?.costAnalysis || {};
  const safetyWarnings = selectedMaterialAnalysis?.safetyWarnings || [];

  const hasSimulation = Object.keys(numericalResults).length > 0;

  const isLathe = operationType === "Lathe";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Export Button ── */}
      <button
        onClick={() =>
          generateReport(result, inputs, operationType, subOperation)
        }
        className="glow-btn"
        style={{ width: "100%", fontSize: 13 }}
      >
        📄 Export Engineering Report (PDF)
      </button>

      {/* ── AI Insights & Clarifications ── */}
      {aiInsights && (
        <div
          className="result-section"
          style={{
            background:
              "linear-gradient(135deg, rgba(30,41,59,0.05), rgba(51,65,85,0.02))",
            border: "1px solid rgba(51,65,85,0.15)",
          }}
        >
          <SectionTitle>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 18 }}>🧠</span> AI Insights
            </span>
          </SectionTitle>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--text-primary)",
              lineHeight: 1.6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {aiInsights}
          </p>
        </div>
      )}

      {/* ── Numerical Results ── */}
      {hasSimulation && (
        <>
          <div className="result-section">
            <SectionTitle>Numerical Results</SectionTitle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
              }}
            >
              <MetricCard
                icon="⚡"
                label="Force (N)"
                value={safeNum(
                  numericalResults.force ?? numericalResults.cuttingForce,
                  (v) => Math.round(v).toLocaleString(),
                )}
              />
              {!isLathe && (
                <MetricCard
                  icon="⚖️"
                  label="Weight (kg)"
                  value={safeNum(numericalResults.weight, (v) => v.toFixed(4))}
                />
              )}
              {!isLathe && (
                <MetricCard
                  icon="🧊"
                  label="Volume (m³)"
                  value={safeNum(numericalResults.volume, (v) =>
                    v.toExponential(2),
                  )}
                />
              )}
              {isLathe ? (
                <MetricCard
                  icon="⏱"
                  label="Machining Time (min)"
                  value={safeNum(numericalResults.machiningTime, (v) =>
                    v.toFixed(2),
                  )}
                  accent
                />
              ) : (
                <MetricCard
                  icon="⏱"
                  label="Cycle Time (min)"
                  value={safeNum(numericalResults.forgingCycleTime, (v) =>
                    v.toFixed(2),
                  )}
                  accent
                />
              )}
              <MetricCard
                icon="🔋"
                label="Energy (J)"
                value={safeNum(numericalResults.energy, (v) =>
                  Math.round(v).toLocaleString(),
                )}
              />
              {numericalResults.rpm != null && (
                <MetricCard
                  icon="🔄"
                  label="Speed (RPM)"
                  value={safeNum(numericalResults.rpm, (v) =>
                    Math.round(v).toLocaleString(),
                  )}
                />
              )}
              {numericalResults.power != null && (
                <MetricCard
                  icon="💡"
                  label="Power (W)"
                  value={safeNum(numericalResults.power, (v) => v.toFixed(1))}
                />
              )}
            </div>
          </div>

          {/* ── Material Insights ── */}
          {selectedMaterialData && (
            <div className="result-section">
              <SectionTitle>Selected Material Insights</SectionTitle>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {/* Material name header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background:
                      "linear-gradient(135deg, rgba(255,107,0,0.08), rgba(255,140,56,0.04))",
                    borderRadius: 10,
                    border: "1px solid rgba(255,107,0,0.18)",
                  }}
                >
                  <span style={{ fontSize: 22 }}>🧱</span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: 15,
                        fontFamily: "Outfit, sans-serif",
                        color: "var(--text-primary)",
                      }}
                    >
                      {selectedMaterialData.name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "var(--steel-gray)",
                      }}
                    >
                      Density: {selectedMaterialData.density?.toLocaleString()}{" "}
                      kg/m³
                    </p>
                  </div>
                </div>

                {/* Property grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 8,
                  }}
                >
                  {[
                    {
                      icon: "💪",
                      label: "Yield Strength",
                      value: selectedMaterialData.yieldStrength
                        ? `${selectedMaterialData.yieldStrength} MPa`
                        : "—",
                      highlight: selectedMaterialData.yieldStrength > 400,
                    },
                    {
                      icon: "🔩",
                      label: "Ultimate Strength",
                      value: selectedMaterialData.ultimateStrength
                        ? `${selectedMaterialData.ultimateStrength} MPa`
                        : "—",
                    },
                    {
                      icon: "🌡️",
                      label: "Thermal Conductivity",
                      value: selectedMaterialData.thermalConductivity
                        ? `${selectedMaterialData.thermalConductivity} W/m·K`
                        : "—",
                    },
                    {
                      icon: "💰",
                      label: "Cost per kg",
                      value: selectedMaterialData.costPerKg
                        ? `₹${selectedMaterialData.costPerKg.toLocaleString()}`
                        : "—",
                    },
                    {
                      icon: "🔥",
                      label: isLathe ? "Max Safe Temp" : "Forging Temp Range",
                      value: isLathe
                        ? selectedMaterialData.maxSafeTemperature
                          ? `${selectedMaterialData.maxSafeTemperature}°C`
                          : "—"
                        : selectedMaterialData.recommendedForgingTemp?.min
                          ? `${selectedMaterialData.recommendedForgingTemp.min}–${selectedMaterialData.recommendedForgingTemp.max}°C`
                          : "—",
                    },
                    {
                      icon: "⚖️",
                      label: "Machinability",
                      value:
                        selectedMaterialData.yieldStrength > 600
                          ? "High Strength"
                          : selectedMaterialData.yieldStrength > 300
                            ? "Medium"
                            : "Easy",
                      color:
                        selectedMaterialData.yieldStrength > 600
                          ? "#dc2626"
                          : selectedMaterialData.yieldStrength > 300
                            ? "#d97706"
                            : "#16a34a",
                    },
                  ].map(({ icon, label, value, highlight, color }) => (
                    <div
                      key={label}
                      style={{
                        padding: "9px 12px",
                        background: highlight
                          ? "rgba(22,163,74,0.05)"
                          : "#f8fafc",
                        borderRadius: 9,
                        border: `1px solid ${highlight ? "#bbf7d0" : "var(--border-gray)"}`,
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 3px",
                          fontSize: 10,
                          color: "var(--steel-gray)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {icon} {label}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "Outfit, sans-serif",
                          color:
                            color ||
                            (highlight ? "#16a34a" : "var(--text-primary)"),
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Best Fit Material Recommendation ── */}
          {bestFitMaterial && (
            <div className="result-section">
              <SectionTitle>Best Fit Material</SectionTitle>
              {bestFitMaterial.isAlreadyChosen ? (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(22,163,74,0.08), rgba(16,185,129,0.05))",
                    border: "1.5px solid #bbf7d0",
                    borderRadius: 12,
                    padding: "16px 14px",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ fontSize: 28, flexShrink: 0 }}>🏆</div>
                  <div>
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#15803d",
                        fontFamily: "Outfit, sans-serif",
                      }}
                    >
                      Excellent Choice! {bestFitMaterial.material} is the Best
                      Fit
                    </p>
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontSize: 12,
                        color: "#166534",
                        lineHeight: 1.5,
                      }}
                    >
                      You've selected the most cost-efficient material for this
                      process — best balance of performance and economy among
                      all available options.
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        {
                          label: "Force",
                          value: `${safeNum(bestFitMaterial.force, (v) => Math.round(v).toLocaleString())} N`,
                        },
                        {
                          label: "Est. Cost",
                          value: `₹${safeNum(bestFitMaterial.cost, (v) => v.toLocaleString())}`,
                        },
                        {
                          label: "Yield Str.",
                          value: bestFitMaterial.yieldStrength
                            ? `${bestFitMaterial.yieldStrength} MPa`
                            : "—",
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          style={{
                            padding: "4px 10px",
                            background: "rgba(22,163,74,0.1)",
                            border: "1px solid #bbf7d0",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#15803d",
                          }}
                        >
                          {label}: {value}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,107,0,0.06), rgba(255,140,56,0.03))",
                      border: "1.5px solid rgba(255,107,0,0.2)",
                      borderRadius: 12,
                      padding: "14px",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ fontSize: 26, flexShrink: 0 }}>💡</div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 3px",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "var(--spark-orange)",
                          fontFamily: "Outfit, sans-serif",
                        }}
                      >
                        Recommended: {bestFitMaterial.material}
                      </p>
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 12,
                          color: "var(--steel-gray)",
                          lineHeight: 1.5,
                        }}
                      >
                        Based on cost-efficiency analysis,{" "}
                        <strong>{bestFitMaterial.material}</strong> offers the
                        best performance-to-cost ratio for this operation.
                      </p>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {[
                          {
                            label: "Force",
                            value: `${safeNum(bestFitMaterial.force, (v) => Math.round(v).toLocaleString())} N`,
                          },
                          {
                            label: "Est. Cost",
                            value: `₹${safeNum(bestFitMaterial.cost, (v) => v.toLocaleString())}`,
                          },
                          {
                            label: "Yield Str.",
                            value: bestFitMaterial.yieldStrength
                              ? `${bestFitMaterial.yieldStrength} MPa`
                              : "—",
                          },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            style={{
                              padding: "4px 10px",
                              background: "rgba(255,107,0,0.08)",
                              border: "1px solid rgba(255,107,0,0.2)",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--spark-orange)",
                            }}
                          >
                            {label}: {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "#94a3b8",
                      textAlign: "center",
                    }}
                  >
                    Currently using:{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {inputs.material}
                    </strong>{" "}
                    — see comparison table below for full details
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Cost Analysis ── */}
          <div className="result-section">
            <SectionTitle>Cost Analysis</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  label: "Material Cost",
                  value: costAnalysis.materialCost,
                  icon: "🧱",
                },
                {
                  label: "Machine Cost",
                  value: costAnalysis.machineCost,
                  icon: "🏭",
                },
                {
                  label: "Total Cost",
                  value: costAnalysis.totalCost,
                  icon: "💰",
                  bold: true,
                },
              ].map(({ label, value, icon, bold }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: bold ? "rgba(255,107,0,0.06)" : "#f8fafc",
                    borderRadius: 9,
                    border: bold
                      ? "1px solid rgba(255,107,0,0.15)"
                      : "1px solid var(--border-gray)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--steel-gray)",
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    {icon} {label}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: bold ? 700 : 600,
                      fontFamily: "Outfit, sans-serif",
                      color: bold
                        ? "var(--spark-orange)"
                        : "var(--text-primary)",
                    }}
                  >
                    ₹ {safeNum(value, (v) => v.toLocaleString())}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Machine Recommendation ── */}
          <div className="result-section">
            <SectionTitle>Machine Recommendation</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Category", value: machineRecommendation.category },
                {
                  label: "Required Force",
                  value: `${safeNum(machineRecommendation.requiredForce, (v) => v.toLocaleString())} N`,
                },
                {
                  label: "Recommended Capacity",
                  value: `${safeNum(machineRecommendation.recommendedCapacity, (v) => v.toLocaleString())} N`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "6px 0",
                    borderBottom: "1px solid var(--border-gray)",
                  }}
                >
                  <span style={{ color: "var(--steel-gray)" }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              {machineRecommendation && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 13,
                    paddingTop: 4,
                  }}
                >
                  <span style={{ color: "var(--steel-gray)" }}>
                    Safety Factor
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 99,
                      fontSize: 13,
                      background:
                        machineRecommendation.safetyFactor < 1.2
                          ? "#fef2f2"
                          : "#f0fdf4",
                      color:
                        machineRecommendation.safetyFactor < 1.2
                          ? "#ef4444"
                          : "#16a34a",
                      border: `1px solid ${machineRecommendation.safetyFactor < 1.2 ? "#fecaca" : "#bbf7d0"}`,
                    }}
                  >
                    {safeNum(machineRecommendation.safetyFactor, (v) =>
                      v.toFixed(2),
                    )}
                    {machineRecommendation.safetyFactor >= 1.2 ? " ✓" : " ⚠"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Material Comparison (Forging only) ── */}
      {materialComparison && materialComparison.length > 0 && (
        <div className="result-section">
          <SectionTitle>Material Comparison</SectionTitle>
          <p
            style={{
              fontSize: 11,
              color: "var(--steel-gray)",
              margin: "-6px 0 8px",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ★ = your selected material &nbsp;|&nbsp; Sorted by cost efficiency
          </p>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                fontSize: 12,
                borderCollapse: "collapse",
                minWidth: 520,
              }}
            >
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  {[
                    { label: "Material", align: "left" },
                    { label: "Force (N)", align: "right" },
                    { label: "Weight (kg)", align: "right" },
                    { label: "Energy (J)", align: "right" },
                    { label: "Yield Str. (MPa)", align: "right" },
                    { label: "Cost (₹)", align: "right" },
                  ].map(({ label, align }) => (
                    <th
                      key={label}
                      style={{
                        padding: "8px 10px",
                        textAlign: align,
                        fontWeight: 600,
                        fontSize: 11,
                        color: "var(--steel-gray)",
                        borderBottom: "2px solid var(--border-gray)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materialComparison.map((mat, i) => {
                  const isSelected = mat.material === inputs.material;
                  const cellStyle = {
                    padding: "7px 10px",
                    borderBottom: "1px solid var(--border-gray)",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  };
                  // Rank badge colors: best = green, worst = red
                  const isLowest = i === 0;
                  const isHighest = i === materialComparison.length - 1;
                  return (
                    <tr
                      key={mat.material}
                      style={{
                        background: isSelected
                          ? "rgba(255,107,0,0.06)"
                          : i % 2 === 0
                            ? "white"
                            : "#f8fafc",
                        transition: "background 0.15s",
                      }}
                    >
                      {/* Material name + rank badge */}
                      <td
                        style={{
                          padding: "7px 10px",
                          borderBottom: "1px solid var(--border-gray)",
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? "var(--spark-orange)" : "inherit",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {isSelected && (
                            <span
                              style={{
                                color: "var(--spark-orange)",
                                fontSize: 13,
                              }}
                            >
                              ★
                            </span>
                          )}
                          {mat.material}
                          {isLowest && !isSelected && (
                            <span
                              style={{
                                fontSize: 10,
                                background: "#dcfce7",
                                color: "#16a34a",
                                border: "1px solid #bbf7d0",
                                borderRadius: 99,
                                padding: "1px 6px",
                                fontWeight: 700,
                              }}
                            >
                              Best Value
                            </span>
                          )}
                          {isHighest && !isSelected && (
                            <span
                              style={{
                                fontSize: 10,
                                background: "#fef2f2",
                                color: "#dc2626",
                                border: "1px solid #fecaca",
                                borderRadius: 99,
                                padding: "1px 6px",
                                fontWeight: 700,
                              }}
                            >
                              Highest Cost
                            </span>
                          )}
                        </span>
                      </td>
                      {/* Force */}
                      <td style={cellStyle}>
                        {safeNum(mat.force, (v) =>
                          Math.round(v).toLocaleString(),
                        )}
                      </td>
                      {/* Weight */}
                      <td style={cellStyle}>
                        {safeNum(mat.weight, (v) => v.toFixed(3))}
                      </td>
                      {/* Energy: force × workpiece length assumed from weight/density approx */}
                      <td style={cellStyle}>
                        {safeNum(mat.energy ?? mat.force, (v) =>
                          mat.energy
                            ? Math.round(mat.energy).toLocaleString()
                            : "—",
                        )}
                      </td>
                      {/* Yield Strength */}
                      <td
                        style={{
                          ...cellStyle,
                          fontWeight: mat.yieldStrength ? 600 : 400,
                          color:
                            mat.yieldStrength > 500
                              ? "#16a34a"
                              : mat.yieldStrength > 250
                                ? "inherit"
                                : "#b45309",
                        }}
                      >
                        {safeNum(mat.yieldStrength, (v) => v.toLocaleString())}
                      </td>
                      {/* Cost */}
                      <td
                        style={{
                          ...cellStyle,
                          fontWeight: 600,
                          color: isLowest
                            ? "#16a34a"
                            : isHighest
                              ? "#dc2626"
                              : "inherit",
                        }}
                      >
                        ₹{safeNum(mat.cost, (v) => v.toLocaleString())}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Safety Warnings ── */}
      {safetyWarnings?.length > 0 && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px",
              fontSize: 13,
              fontWeight: 700,
              color: "#dc2626",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            ⚠ Safety Warnings
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {safetyWarnings.map((warn, i) => (
              <li
                key={i}
                style={{ fontSize: 12, color: "#dc2626", lineHeight: 1.5 }}
              >
                {warn}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
