import { useChatStore } from "../store/useChatStore";

const operationsConfig = {
  Forging: ["Open Die Forging", "Closed Die Forging", "Upset Forging"],
  Lathe: ["Turning", "Facing", "Taper Turning", "Thread Cutting"],
};

const opIcons = {
  Forging: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22V12" />
      <path d="m15 9-3-7-3 7" />
      <path d="M5 12h14" />
      <path d="M5 20h14" />
    </svg>
  ),
  Lathe: (
    <svg
      width="16"
      height="16"
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
  ),
};

export default function OperationSelector() {
  const { operationType, subOperation, setOperationType, setSubOperation } =
    useChatStore();

  const handleMainChange = (e) => {
    setOperationType(e.target.value);
    setSubOperation(""); // reset sub operation
  };

  const handleSubChange = (e) => {
    setSubOperation(e.target.value);
  };

  return (
    <div className="op-selector-bar">
      {/* Main Operation */}
      <div className="op-selector-group">
        <label className="op-label">Operation Type</label>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          {operationType && (
            <span
              style={{
                position: "absolute",
                left: 12,
                color: "var(--spark-orange)",
                display: "flex",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {opIcons[operationType]}
            </span>
          )}
          <select
            value={operationType}
            onChange={handleMainChange}
            className="op-select"
            style={{ paddingLeft: operationType ? 36 : 14 }}
          >
            <option value="">Select Operation</option>
            <option value="Forging">Forging</option>
            <option value="Lathe">Lathe</option>
          </select>
        </div>
      </div>

      {/* Arrow Separator */}
      {operationType && (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--border-gray)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginBottom: 2 }}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}

      {/* Sub Operation */}
      <div className="op-selector-group">
        <label className="op-label">Sub Operation</label>
        <select
          value={subOperation}
          onChange={handleSubChange}
          disabled={!operationType}
          className="op-select"
        >
          <option value="">
            {operationType
              ? `Select ${operationType} Sub-Op`
              : "Select Sub Operation"}
          </option>
          {operationType &&
            operationsConfig[operationType].map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
        </select>
      </div>

      {/* Status Badge */}
      {subOperation && (
        <div className="status-badge" style={{ marginBottom: 1 }}>
          <span
            style={{
              width: 6,
              height: 6,
              background: "var(--spark-orange)",
              borderRadius: "50%",
            }}
          />
          {subOperation}
        </div>
      )}
    </div>
  );
}
