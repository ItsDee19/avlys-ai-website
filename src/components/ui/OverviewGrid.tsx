import React from "react";
import MetricCard from "./MetricCard";
import { motion } from "framer-motion";

interface OverviewGridProps {
  metrics: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    subtext?: string;
    colorClass?: string;
    tooltip?: string;
    trend?: {
      direction: "up" | "down";
      value: string;
    };
  }[];
  title?: string;
  subtitle?: string;
}

const OverviewGrid: React.FC<OverviewGridProps> = ({ metrics, title, subtitle }) => (
  <motion.section
    className="w-full mb-10"
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
    style={{
      background: "linear-gradient(135deg, #f8fafc 80%, #e0e7ff 100%)",
      borderRadius: 28,
      boxShadow: "0 4px 32px rgba(37,99,235,0.07)",
      padding: "3rem 2rem 2.5rem 2rem",
      marginBottom: 40,
      border: '1.5px solid #e0e7ff',
    }}
  >
    {title && (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight" style={{ color: '#1e293b', marginBottom: 0 }}>{title}</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent mt-2 sm:mt-0 sm:ml-4" />
      </div>
    )}
    {subtitle && (
      <div className="mb-8 text-lg text-slate-500 font-medium" style={{ color: '#334155' }}>{subtitle}</div>
    )}
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 bg-white/80 rounded-2xl p-6 shadow-md"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.12,
          },
        },
      }}
      style={{
        marginTop: 8,
        marginBottom: 8,
      }}
    >
      {metrics.map((metric, idx) => (
        <motion.div
          key={idx}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <MetricCard {...metric} />
        </motion.div>
      ))}
    </motion.div>
  </motion.section>
);

export default OverviewGrid; 