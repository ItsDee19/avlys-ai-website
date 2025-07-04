import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  colorClass?: string;
  tooltip?: string;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
}

// Animated number component
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (start === end) return;
    let increment = (end - start) / 30;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
};

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  subtext,
  colorClass = "from-blue-500 to-green-400",
  tooltip,
  trend
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isNumber = typeof value === "number" && !isNaN(value);
  return (
    <motion.div
      className={`relative flex flex-col items-start justify-between rounded-2xl bg-white/60 backdrop-blur-md border border-blue-100 shadow-xl p-6 min-h-[140px] transition-transform cursor-pointer overflow-hidden metric-card-animated`}
      initial={{ opacity: 0, scale: 0.96, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.045 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.22 }}
      role="region"
      aria-label={label}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      tabIndex={0}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      style={{
        boxShadow: "0 6px 32px 0 rgba(37,99,235,0.10)",
        border: "1.5px solid #e0e7ff",
        background: "linear-gradient(135deg, #f8fafc 80%, #e0e7ff 100%)",
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      }}
    >
      {/* Animated border shine */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.18 }}
        whileHover={{ opacity: 0.32 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "linear-gradient(120deg, #2563eb33 0%, #10b98122 100%)",
          zIndex: 1,
        }}
      />
      <div className="text-3xl mb-2 z-10" style={{ color: '#2563eb', filter: 'drop-shadow(0 2px 8px #2563eb11)' }}>{icon}</div>
      <div className="flex items-center gap-2 text-2xl font-extrabold z-10" style={{ color: '#1e293b' }}>
        {isNumber ? <AnimatedNumber value={value as number} /> : value}
        {trend && (
          <span className={`ml-1 text-sm font-semibold ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`} title={trend.direction === "up" ? "Upward trend" : "Downward trend"}>
            {trend.direction === "up" ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
      <div className="text-base font-semibold z-10" style={{ color: '#334155' }}>{label}</div>
      {subtext && <div className="text-xs mt-1 z-10" style={{ color: '#64748b' }}>{subtext}</div>}
      <AnimatePresence>
        {tooltip && showTooltip && (
          <motion.div
            className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 px-4 py-2 rounded-xl bg-black/90 text-white text-xs shadow-2xl pointer-events-none whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22 }}
            style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 500 }}
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MetricCard;