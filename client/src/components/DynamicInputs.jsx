import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

const MATERIALS = [
  "Steel",
  "Aluminum",
  "Titanium",
  "Copper",
  "Brass",
  "Cast Iron",
  "Stainless Steel",
  "Magnesium",
  "Nickel Alloy",
  "Tool Steel",
  "Carbon Fiber Composite",
  "Bronze",
];

const materialField = {
  name: "material",
  label: "Material",
  type: "select",
  options: MATERIALS,
};

const inputConfig = {
  // ── FORGING ─────────────────────────────────────────────
  "Open Die Forging": [
    materialField,
    {
      name: "diameter",
      label: "Diameter (mm)",
      type: "number",
      placeholder: "e.g. 80",
    },
    {
      name: "length",
      label: "Length (mm)",
      type: "number",
      placeholder: "e.g. 150",
    },
    {
      name: "temperature",
      label: "Temperature (°C)",
      type: "number",
      placeholder: "e.g. 1100",
    },
  ],
  "Closed Die Forging": [
    materialField,
    {
      name: "diameter",
      label: "Diameter (mm)",
      type: "number",
      placeholder: "e.g. 60",
    },
    {
      name: "length",
      label: "Length (mm)",
      type: "number",
      placeholder: "e.g. 120",
    },
    {
      name: "temperature",
      label: "Temperature (°C)",
      type: "number",
      placeholder: "e.g. 950",
    },
  ],
  "Upset Forging": [
    materialField,
    {
      name: "diameter",
      label: "Billet Diameter (mm)",
      type: "number",
      placeholder: "e.g. 50",
    },
    {
      name: "length",
      label: "Billet Height (mm)",
      type: "number",
      placeholder: "e.g. 100",
    },
    {
      name: "temperature",
      label: "Temperature (°C)",
      type: "number",
      placeholder: "e.g. 1000",
    },
  ],

  // ── LATHE ────────────────────────────────────────────────
  Turning: [
    materialField,
    {
      name: "workpieceDiameter",
      label: "Workpiece Ø (mm)",
      type: "number",
      placeholder: "e.g. 50",
    },
    {
      name: "length",
      label: "Length (mm)",
      type: "number",
      placeholder: "e.g. 200",
    },
    {
      name: "cuttingSpeed",
      label: "Cutting Speed (m/min)",
      type: "number",
      placeholder: "e.g. 120",
    },
    {
      name: "feed",
      label: "Feed (mm/rev)",
      type: "number",
      placeholder: "e.g. 0.25",
    },
    {
      name: "depthOfCut",
      label: "Depth of Cut (mm)",
      type: "number",
      placeholder: "e.g. 2",
    },
    {
      name: "passCount",
      label: "No. of Passes",
      type: "number",
      placeholder: "e.g. 3",
    },
  ],
  Facing: [
    materialField,
    {
      name: "workpieceDiameter",
      label: "Workpiece Ø (mm)",
      type: "number",
      placeholder: "e.g. 100",
    },
    {
      name: "length",
      label: "Face Width (mm)",
      type: "number",
      placeholder: "e.g. 10",
    },
    {
      name: "cuttingSpeed",
      label: "Cutting Speed (m/min)",
      type: "number",
      placeholder: "e.g. 100",
    },
    {
      name: "feed",
      label: "Feed (mm/rev)",
      type: "number",
      placeholder: "e.g. 0.2",
    },
    {
      name: "depthOfCut",
      label: "Depth of Cut (mm)",
      type: "number",
      placeholder: "e.g. 1",
    },
    {
      name: "passCount",
      label: "No. of Passes",
      type: "number",
      placeholder: "e.g. 1",
    },
  ],
  "Taper Turning": [
    materialField,
    {
      name: "workpieceDiameter",
      label: "Workpiece Ø (mm)",
      type: "number",
      placeholder: "e.g. 60",
    },
    {
      name: "length",
      label: "Taper Length (mm)",
      type: "number",
      placeholder: "e.g. 80",
    },
    {
      name: "taperAngle",
      label: "Taper Angle (°)",
      type: "number",
      placeholder: "e.g. 15",
    },
    {
      name: "cuttingSpeed",
      label: "Cutting Speed (m/min)",
      type: "number",
      placeholder: "e.g. 90",
    },
    {
      name: "feed",
      label: "Feed (mm/rev)",
      type: "number",
      placeholder: "e.g. 0.2",
    },
    {
      name: "depthOfCut",
      label: "Depth of Cut (mm)",
      type: "number",
      placeholder: "e.g. 1.5",
    },
    {
      name: "passCount",
      label: "No. of Passes",
      type: "number",
      placeholder: "e.g. 2",
    },
  ],
  "Thread Cutting": [
    materialField,
    {
      name: "workpieceDiameter",
      label: "Workpiece Ø (mm)",
      type: "number",
      placeholder: "e.g. 40",
    },
    {
      name: "length",
      label: "Thread Length (mm)",
      type: "number",
      placeholder: "e.g. 60",
    },
    {
      name: "threadPitch",
      label: "Thread Pitch (mm)",
      type: "number",
      placeholder: "e.g. 1.5",
    },
    {
      name: "cuttingSpeed",
      label: "Cutting Speed (m/min)",
      type: "number",
      placeholder: "e.g. 40",
    },
    {
      name: "depthOfCut",
      label: "Depth of Cut (mm)",
      type: "number",
      placeholder: "e.g. 0.5",
    },
    {
      name: "passCount",
      label: "No. of Passes",
      type: "number",
      placeholder: "e.g. 5",
    },
  ],
  Drilling: [
    materialField,
    {
      name: "drillDiameter",
      label: "Drill Ø (mm)",
      type: "number",
      placeholder: "e.g. 10",
    },
    {
      name: "holeDepth",
      label: "Hole Depth (mm)",
      type: "number",
      placeholder: "e.g. 50",
    },
    {
      name: "cuttingSpeed",
      label: "Cutting Speed (m/min)",
      type: "number",
      placeholder: "e.g. 25",
    },
    {
      name: "feed",
      label: "Feed (mm/rev)",
      type: "number",
      placeholder: "e.g. 0.1",
    },
  ],
};

export default function DynamicInputs() {
  const { subOperation, inputs, setInputs } = useChatStore();

  // Reset inputs whenever subOperation changes
  useEffect(() => {
    setInputs({});
  }, [subOperation]);

  if (!subOperation) {
    return (
      <div className="input-placeholder">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
        Select a sub-operation to configure inputs
      </div>
    );
  }

  const fields = inputConfig[subOperation] || [];

  if (fields.length === 0) {
    return (
      <div className="input-placeholder">
        No input configuration found for <strong>{subOperation}</strong>.
      </div>
    );
  }

  const handleChange = (name, value) => {
    setInputs({ ...inputs, [name]: value });
  };

  return (
    <div className="dynamic-inputs-grid">
      {fields.map((field) => (
        <div key={field.name} className="input-field-wrapper">
          <label className="input-label">{field.label}</label>
          {field.type === "select" ? (
            <select
              className="styled-select"
              value={inputs[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              <option value="">Select</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              className="styled-input"
              placeholder={field.placeholder || ""}
              value={inputs[field.name] || ""}
              onChange={(e) => handleChange(field.name, Number(e.target.value))}
            />
          )}
        </div>
      ))}
    </div>
  );
}
