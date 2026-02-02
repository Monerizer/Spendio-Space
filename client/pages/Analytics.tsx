import React, { useRef, useEffect, useState } from "react";
import { useSpendio } from "@/context/SpendioContext";
import { Layout } from "@/components/Layout";
import { CustomSelect } from "@/components/CustomSelect";
import { formatCurrency, computeNet } from "@/utils/calculations";
import { calculateMonthHealth, calculateHealthTrend, generateAITips, MonthHealthBreakdown, HealthTrend, HealthTip } from "@/utils/healthScore";
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function Analytics() {
  const { user } = useSpendio();
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);
  const canvasRef4 = useRef<HTMLCanvasElement>(null);

  const [dateRange, setDateRange] = useState<"6" | "12">("6");
  const [currentMonthHealth, setCurrentMonthHealth] = useState<MonthHealthBreakdown | null>(null);
  const [healthTrend, setHealthTrend] = useState<HealthTrend | null>(null);
  const [aiTips, setAiTips] = useState<HealthTip[]>([]);

  // Get currency symbol from user settings
  const currencySymbol = user?.currency || "EUR";
  const CURRENCY_SYMBOLS: Record<string, string> = {
    "EUR": "€",
    "USD": "$",
    "GBP": "£",
    "JPY": "¥",
    "CNY": "¥",
    "INR": "₹",
    "AUD": "A$",
    "CAD": "C$",
    "CHF": "CHF",
    "SEK": "kr",
    "NZD": "NZ$",
    "MXN": "$",
    "SGD": "S$",
    "HKD": "HK$",
    "NOK": "kr",
    "KRW": "₩",
    "TRY": "₺",
    "RUB": "₽",
    "BRL": "R$",
    "ZAR": "R",
    "GEL": "₾",
    "DKK": "kr",
    "THB": "฿",
  };
  const symbol = CURRENCY_SYMBOLS[currencySymbol] || currencySymbol;

  if (!user) return null;

  // Calculate health scores
  useEffect(() => {
    const currentMonth = user.data.months[user.data.currentMonth];
    if (currentMonth) {
      const health = calculateMonthHealth(currentMonth);
      setCurrentMonthHealth(health);

      const tips = generateAITips(health);
      setAiTips(tips);
    }

    const trend = calculateHealthTrend(user);
    setHealthTrend(trend);
  }, [user.data.currentMonth, user.data.months]);

  const months = Object.keys(user.data.months).sort();
  const selectedMonths = dateRange === "6" ? months.slice(-6) : months.slice(-12);

  // Enhanced bar chart with better styling
  const drawBarChart = (
    canvas: HTMLCanvasElement | null,
    labels: string[],
    values: number[],
    title: string,
    color: string
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width,
      h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padL = 50,
      padR = 30,
      padT = 40,
      padB = 50;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const maxV = Math.max(1, ...values.map((v) => Math.abs(v)));

    // Calculate proper bar width - maximum 50px wide per bar
    const spacePerBar = plotW / Math.max(1, labels.length);
    const maxBarWidth = 50;
    const barW = Math.min(spacePerBar * 0.7, maxBarWidth);

    // Title
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 16px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(title, padL, 25);

    // Y-axis line
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.stroke();

    // X-axis line
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Grid lines and labels
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = padT + (plotH * i) / steps;
      const val = ((maxV * (steps - i)) / steps).toFixed(0);

      // Grid line
      ctx.strokeStyle = "#f3f4f6";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      // Y-axis label
      ctx.fillStyle = "#888888";
      ctx.font = "12px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(`${symbol}${val}`, padL - 10, y + 4);
    }

    // Draw bars with gradient - centered per month
    for (let i = 0; i < labels.length; i++) {
      const v = values[i];
      const bh = Math.round((plotH * Math.abs(v)) / maxV);

      // Center bar in its allocated space
      const monthCenterX = padL + (i + 0.5) * spacePerBar;
      const x = monthCenterX - barW / 2;
      const y = v >= 0 ? padT + plotH - bh : padT + plotH;

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, y, 0, padT + plotH);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + "80"); // Semi-transparent at bottom

      ctx.fillStyle = gradient;
      ctx.globalAlpha = v < 0 ? 0.5 : 1;
      ctx.fillRect(x, y, barW, Math.abs(bh));
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barW, Math.abs(bh));

      // Value label at top of bar
      ctx.fillStyle = color;
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      const valueLabel = Math.abs(v) >= 1000 ? `${symbol}${(Math.abs(v) / 1000).toFixed(1)}k` : `${symbol}${Math.round(Math.abs(v))}`;
      ctx.fillText(valueLabel, monthCenterX, y - 5);

      // Month label (MM format) at bottom
      ctx.fillStyle = "#666666";
      ctx.font = "12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(labels[i].slice(5), monthCenterX, padT + plotH + 20);
    }
  };

  // Enhanced pie chart with better styling
  const drawPieChart = (
    canvas: HTMLCanvasElement | null,
    labels: string[],
    values: number[],
    title: string
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width,
      h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Title
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 16px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(title, 20, 25);

    const cx = w / 2.2,
      cy = h / 2.5;
    const radius = Math.min(w, h) / 3.5;
    const total = values.reduce((a, b) => a + Math.abs(b), 0);

    const colors = [
      "#1db584",
      "#4dd4a4",
      "#86efac",
      "#a1e4cb",
      "#c1f0e1",
      "#22c55e",
      "#10b981",
      "#059669",
    ];

    let currentAngle = -Math.PI / 2;

    // Draw slices
    values.forEach((v, i) => {
      if (total === 0 || v === 0) return;

      const sliceAngle = (Math.abs(v) / total) * 2 * Math.PI;

      // Draw slice with shadow
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Slice border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = cx + Math.cos(labelAngle) * (radius * 0.65);
      const labelY = cy + Math.sin(labelAngle) * (radius * 0.65);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const percent = ((Math.abs(v) / total) * 100).toFixed(0);
      ctx.fillText(`${percent}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Legend below the pie chart - 2 columns for better use of space
    const legendStartY = cy + radius + 30;
    let legendX = 20;
    let legendY = legendStartY;
    const columnWidth = w / 2.2;

    ctx.font = "11px system-ui";
    ctx.textAlign = "left";

    labels.forEach((label, i) => {
      if (total === 0 || values[i] === 0) return;

      // Move to next column if needed
      if (legendY > h - 40) {
        legendY = legendStartY;
        legendX += columnWidth;
      }

      // Color box
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legendX, legendY, 12, 12);

      // Label
      ctx.fillStyle = "#666666";
      const shortLabel = label.length > 25 ? label.substring(0, 22) + "..." : label;
      ctx.fillText(`${shortLabel}: ${formatCurrency(values[i], currencySymbol)}`, legendX + 18, legendY + 9);

      legendY += 18;
    });
  };

  // Helper to scale canvas for high DPI displays
  const setupCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  };

  // Draw all charts
  useEffect(() => {
    if (selectedMonths.length === 0) return;

    setupCanvas(canvasRef1.current);
    setupCanvas(canvasRef2.current);
    setupCanvas(canvasRef3.current);
    setupCanvas(canvasRef4.current);

    // Chart 1: Net Cash Trend
    const netCashValues = selectedMonths.map((m) => computeNet(user.data.months[m].totals));
    drawBarChart(canvasRef1.current, selectedMonths, netCashValues, "Net Cash Flow Trend", "#8b5cf6");

    // Chart 2: Income vs Expenses
    const incomeValues = selectedMonths.map((m) => user.data.months[m].totals.income);
    const expenseValues = selectedMonths.map((m) => user.data.months[m].totals.expenses);

    if (canvasRef2.current) {
      const ctx = canvasRef2.current.getContext("2d");
      if (ctx) {
        const w = canvasRef2.current.width,
          h = canvasRef2.current.height;
        ctx.clearRect(0, 0, w, h);

        // Calculate totals for pie chart
        const totalIncome = incomeValues.reduce((a, b) => a + b, 0);
        const totalExpenses = expenseValues.reduce((a, b) => a + b, 0);

        // Title
        ctx.fillStyle = "#1a1a1a";
        ctx.font = "bold 16px system-ui";
        ctx.textAlign = "left";
        ctx.fillText("Income vs Expenses", 20, 25);

        // Draw pie chart
        const cx = w / 2.5;
        const cy = h / 2.2;
        const radius = Math.min(w, h) / 3.5;
        const total = totalIncome + totalExpenses;

        if (total > 0) {
          let currentAngle = -Math.PI / 2;

          // Income slice (green)
          const incomeSliceAngle = (totalIncome / total) * 2 * Math.PI;
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, currentAngle, currentAngle + incomeSliceAngle);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Expense slice (red)
          currentAngle += incomeSliceAngle;
          const expenseSliceAngle = (totalExpenses / total) * 2 * Math.PI;
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, currentAngle, currentAngle + expenseSliceAngle);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Percentage labels on slices
          currentAngle = -Math.PI / 2;
          const incomePercent = ((totalIncome / total) * 100).toFixed(0);
          const expensePercent = ((totalExpenses / total) * 100).toFixed(0);

          // Income label
          const incLabelAngle = currentAngle + incomeSliceAngle / 2;
          const incLabelX = cx + Math.cos(incLabelAngle) * (radius * 0.65);
          const incLabelY = cy + Math.sin(incLabelAngle) * (radius * 0.65);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${incomePercent}%`, incLabelX, incLabelY);

          // Expense label
          currentAngle += incomeSliceAngle;
          const expLabelAngle = currentAngle + expenseSliceAngle / 2;
          const expLabelX = cx + Math.cos(expLabelAngle) * (radius * 0.65);
          const expLabelY = cy + Math.sin(expLabelAngle) * (radius * 0.65);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(`${expensePercent}%`, expLabelX, expLabelY);

          // Legend below pie chart
          const legendStartY = cy + radius + 35;
          let legendX = 20;

          // Income legend
          ctx.fillStyle = "#22c55e";
          ctx.fillRect(legendX, legendStartY, 10, 10);
          ctx.fillStyle = "#666666";
          ctx.font = "11px system-ui";
          ctx.textAlign = "left";
          ctx.fillText(`Income: ${formatCurrency(totalIncome, currencySymbol)}`, legendX + 14, legendStartY + 8);

          // Expense legend
          legendX += 250;
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(legendX, legendStartY, 10, 10);
          ctx.fillStyle = "#666666";
          ctx.fillText(`Expenses: ${formatCurrency(totalExpenses, currencySymbol)}`, legendX + 14, legendStartY + 8);
        } else {
          // Show blank white circle when no data
          ctx.fillStyle = "#f5f5f5";
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Show placeholder text
          ctx.fillStyle = "#999999";
          ctx.font = "14px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Add income & expenses to see chart", cx, cy);
        }
      }
    }

    // Chart 3: Savings & Investing
    const savingsValues = selectedMonths.map((m) => user.data.months[m].totals.savings);
    const investingValues = selectedMonths.map((m) => user.data.months[m].totals.investing);

    if (canvasRef3.current) {
      const ctx = canvasRef3.current.getContext("2d");
      if (ctx) {
        const w = canvasRef3.current.width,
          h = canvasRef3.current.height;
        ctx.clearRect(0, 0, w, h);

        // Calculate totals for pie chart
        const totalSavings = savingsValues.reduce((a, b) => a + b, 0);
        const totalInvesting = investingValues.reduce((a, b) => a + b, 0);

        // Title
        ctx.fillStyle = "#1a1a1a";
        ctx.font = "bold 16px system-ui";
        ctx.textAlign = "left";
        ctx.fillText("Savings & Investing", 20, 25);

        // Draw pie chart
        const cx = w / 2.5;
        const cy = h / 2.2;
        const radius = Math.min(w, h) / 3.5;
        const total = totalSavings + totalInvesting;

        if (total > 0) {
          let currentAngle = -Math.PI / 2;

          // Savings slice (blue)
          const savingsSliceAngle = (totalSavings / total) * 2 * Math.PI;
          ctx.fillStyle = "#3b82f6";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, currentAngle, currentAngle + savingsSliceAngle);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Investing slice (purple)
          currentAngle += savingsSliceAngle;
          const investingSliceAngle = (totalInvesting / total) * 2 * Math.PI;
          ctx.fillStyle = "#8b5cf6";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, currentAngle, currentAngle + investingSliceAngle);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Percentage labels on slices
          currentAngle = -Math.PI / 2;
          const savingsPercent = ((totalSavings / total) * 100).toFixed(0);
          const investingPercent = ((totalInvesting / total) * 100).toFixed(0);

          // Savings label
          const savLabelAngle = currentAngle + savingsSliceAngle / 2;
          const savLabelX = cx + Math.cos(savLabelAngle) * (radius * 0.65);
          const savLabelY = cy + Math.sin(savLabelAngle) * (radius * 0.65);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${savingsPercent}%`, savLabelX, savLabelY);

          // Investing label
          currentAngle += savingsSliceAngle;
          const invLabelAngle = currentAngle + investingSliceAngle / 2;
          const invLabelX = cx + Math.cos(invLabelAngle) * (radius * 0.65);
          const invLabelY = cy + Math.sin(invLabelAngle) * (radius * 0.65);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(`${investingPercent}%`, invLabelX, invLabelY);

          // Legend below pie chart
          const legendStartY = cy + radius + 35;
          let legendX = 20;

          // Savings legend
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(legendX, legendStartY, 10, 10);
          ctx.fillStyle = "#666666";
          ctx.font = "11px system-ui";
          ctx.textAlign = "left";
          ctx.fillText(`Savings: ${formatCurrency(totalSavings, currencySymbol)}`, legendX + 14, legendStartY + 8);

          // Investing legend
          legendX += 250;
          ctx.fillStyle = "#8b5cf6";
          ctx.fillRect(legendX, legendStartY, 10, 10);
          ctx.fillStyle = "#666666";
          ctx.fillText(`Investing: ${formatCurrency(totalInvesting, currencySymbol)}`, legendX + 14, legendStartY + 8);
        } else {
          // Show blank white circle when no data
          ctx.fillStyle = "#f5f5f5";
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Show placeholder text
          ctx.fillStyle = "#999999";
          ctx.font = "14px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Add savings & investments to see chart", cx, cy);
        }
      }
    }

    // Chart 4: Expense breakdown
    const currentMonth = user.data.months[user.data.currentMonth];
    const expenseKeys = Object.keys(currentMonth.expenseBreakdown || {});

    const expenseDetails = expenseKeys.map((k) => {
      const parts = k.split(":");
      return {
        fullLabel: parts.length > 1 ? `${parts[0]} - ${parts[1]}` : parts[0],
        shortLabel: parts.length > 1 ? parts[1] : parts[0],
        category: parts[0],
        value: currentMonth.expenseBreakdown?.[k] || 0,
      };
    });

    expenseDetails.sort((a, b) => b.value - a.value);

    const expenseLabels = expenseDetails.map((e) => e.fullLabel);
    const expenseVals = expenseDetails.map((e) => e.value);

    drawPieChart(canvasRef4.current, expenseLabels, expenseVals, "Expense Breakdown (This Month)");
  }, [user, selectedMonths]);

  // Export data to CSV
  const handleExport = () => {
    const rows: string[] = [];
    rows.push("Month,Income,Expenses,Savings,Investing,Debt Payments,Net Cash");

    selectedMonths.forEach((month) => {
      const t = user.data.months[month].totals;
      const net = computeNet(t);
      rows.push(
        `${month},${t.income},${t.expenses},${t.savings},${t.investing},${t.debtPay},${net}`
      );
    });

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spendio-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Analytics exported to CSV!");
  };

  return (
    <Layout currentPage="analytics">
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-up { animation: slideInUp 0.5s ease-out; }
        .animate-slide-down { animation: slideInDown 0.5s ease-out; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-scale-in { animation: scaleIn 0.4s ease-out; }
        .chart-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .chart-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); }

        /* Mobile responsiveness fixes */
        @media (max-width: 640px) {
          .chart-card { padding: 12px; }
          canvas { max-width: 100% !important; height: auto !important; }
          .grid { gap: 12px; }
          h1, h2, h3 { word-break: break-word; }
          p { word-break: break-word; overflow-wrap: break-word; }
        }
      `}</style>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-hidden">
        {/* Header with Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-slide-down">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] truncate">Analytics</h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1">Track your financial progress over time</p>
          </div>
          <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Date Range Picker */}
            <div className="flex items-center gap-2 bg-white border border-[#e5e5e5] rounded-lg p-2 transition hover:border-[#1db584] flex-1 sm:flex-none min-w-0">
              <Calendar size={16} className="text-[#666666] flex-shrink-0" aria-hidden="true" />
              <CustomSelect
                value={dateRange}
                onChange={(value) => setDateRange(value as "6" | "12")}
                options={[
                  { value: "6", label: "Last 6 months" },
                  { value: "12", label: "Last 12 months" },
                ]}
                placeholder="Select range..."
                className="text-xs sm:text-sm font-medium"
              />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="px-3 sm:px-4 py-2 rounded-lg bg-[#1db584] text-white font-semibold text-xs sm:text-sm hover:bg-[#0f8a56] transition duration-200 flex items-center justify-center gap-2 hover:shadow-lg transform hover:scale-105 flex-1 sm:flex-none whitespace-nowrap"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-[#e5e5e5] rounded-lg p-2 sm:p-4 shadow-sm hover:shadow-md transition transform hover:scale-105 duration-300 animate-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {idx === 0 && (
                <>
                  <div className="text-xs text-[#666666] font-medium truncate">Avg Income</div>
                  <div className="text-lg sm:text-2xl font-bold text-[#1db584] mt-1 sm:mt-2 truncate">
                    {formatCurrency(
                      selectedMonths.reduce((sum, m) => sum + user.data.months[m].totals.income, 0) /
                        Math.max(1, selectedMonths.length),
                      currencySymbol
                    )}
                  </div>
                </>
              )}
              {idx === 1 && (
                <>
                  <div className="text-xs text-[#666666] font-medium truncate">Avg Expenses</div>
                  <div className="text-lg sm:text-2xl font-bold text-[#ef4444] mt-1 sm:mt-2 truncate">
                    {formatCurrency(
                      selectedMonths.reduce((sum, m) => sum + user.data.months[m].totals.expenses, 0) /
                        Math.max(1, selectedMonths.length),
                      currencySymbol
                    )}
                  </div>
                </>
              )}
              {idx === 2 && (
                <>
                  <div className="text-xs text-[#666666] font-medium truncate">Avg Savings</div>
                  <div className="text-lg sm:text-2xl font-bold text-[#3b82f6] mt-1 sm:mt-2 truncate">
                    {formatCurrency(
                      selectedMonths.reduce((sum, m) => sum + user.data.months[m].totals.savings, 0) /
                        Math.max(1, selectedMonths.length),
                      currencySymbol
                    )}
                  </div>
                </>
              )}
              {idx === 3 && (
                <>
                  <div className="text-xs text-[#666666] font-medium truncate">Avg Net Cash</div>
                  <div className="text-lg sm:text-2xl font-bold text-[#8b5cf6] mt-1 sm:mt-2 truncate">
                    {formatCurrency(
                      selectedMonths.reduce((sum, m) => sum + computeNet(user.data.months[m].totals), 0) /
                        Math.max(1, selectedMonths.length),
                      currencySymbol
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Financial Health Score Section */}
        {currentMonthHealth && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-6 shadow-sm chart-card animate-slide-up">
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-1 sm:mb-2 truncate">💰 Financial Health Score</h2>
                <p className="text-xs sm:text-sm text-[#666666]">Comprehensive analysis of your financial habits and trends</p>
              </div>

              {/* Main Score Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                {/* Current Month Score */}
                <div className="bg-white border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">This Month's Score</h3>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-5xl font-bold text-[#1db584]">{currentMonthHealth.total}</div>
                      <p className="text-xs text-[#666666] mt-1">out of 100</p>
                    </div>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{
                      background: `conic-gradient(#1db584 0deg ${(currentMonthHealth.total / 100) * 360}deg, #e5e5e5 ${(currentMonthHealth.total / 100) * 360}deg 360deg)`
                    }}>
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                        <span className="text-sm font-semibold text-[#1db584]">{currentMonthHealth.total}%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#666666] italic">{currentMonthHealth.explanation}</p>
                </div>

                {/* Trend Comparison */}
                {healthTrend && (
                  <div className="bg-white border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">3-Month Trend</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#666666]">Current Period</span>
                          <span className="text-2xl font-bold text-[#1db584]">{healthTrend.currentScore}</span>
                        </div>
                        <div className="w-full bg-[#e5e5e5] rounded-full h-2">
                          <div className="bg-[#1db584] h-2 rounded-full" style={{ width: `${healthTrend.currentScore}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#666666]">Previous Period</span>
                          <span className="text-lg font-bold text-[#666666]">{healthTrend.previousScore}</span>
                        </div>
                        <div className="w-full bg-[#e5e5e5] rounded-full h-2">
                          <div className="bg-[#8b5cf6] h-2 rounded-full" style={{ width: `${healthTrend.previousScore}%` }}></div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-[#e5e5e5]">
                        <div className="flex items-center gap-2">
                          {healthTrend.trend === "improving" ? (
                            <>
                              <TrendingUp size={18} className="text-green-600" />
                              <span className="text-sm font-semibold text-green-600">
                                Improving by {healthTrend.changePoints} points
                              </span>
                            </>
                          ) : healthTrend.trend === "declining" ? (
                            <>
                              <TrendingDown size={18} className="text-red-600" />
                              <span className="text-sm font-semibold text-red-600">
                                Declining by {Math.abs(healthTrend.changePoints)} points
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-[#666666]">Stable</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Metric Breakdown */}
              <div className="bg-white border border-blue-200 rounded-lg p-3 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-[#1a1a1a] mb-3 sm:mb-4">Score Breakdown (5 Metrics)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { label: "Income Stability", value: currentMonthHealth.incomeScore, color: "#f97316" },
                    { label: "Expense Control", value: currentMonthHealth.expenseScore, color: "#ef4444" },
                    { label: "Savings Rate", value: currentMonthHealth.savingsScore, color: "#3b82f6" },
                    { label: "Debt Management", value: currentMonthHealth.debtScore, color: "#f97316" },
                    { label: "Budget Adherence", value: currentMonthHealth.adherenceScore, color: "#8b5cf6" },
                  ].map((metric, idx) => (
                    <div key={idx} className="text-center">
                      <div className="mb-1 sm:mb-2 w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: `conic-gradient(${metric.color} 0deg ${(metric.value / 25) * 360}deg, #e5e5e5 ${(metric.value / 25) * 360}deg 360deg)`
                      }}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center">
                          <span className="text-xs sm:text-xs font-bold text-[#1a1a1a]">{metric.value}</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-[#1a1a1a] line-clamp-2">{metric.label}</p>
                      <p className="text-xs text-[#666666] mt-0.5">{Math.round((metric.value / 25) * 100)}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Tips */}
              {aiTips.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg p-3 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-[#1a1a1a] mb-3 sm:mb-4">🤖 AI-Generated Tips</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {aiTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-2 sm:p-3 rounded-lg border-l-4 text-sm"
                        style={{
                          borderColor: tip.priority === "high" ? "#ef4444" : tip.priority === "medium" ? "#f97316" : "#22c55e",
                          backgroundColor: tip.priority === "high" ? "#fee2e2" : tip.priority === "medium" ? "#fed7aa" : "#f0fdf4",
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-[#1a1a1a] text-xs sm:text-sm line-clamp-2">{tip.title}</h4>
                            <p className="text-xs text-[#666666] mt-0.5 sm:mt-1 line-clamp-3">{tip.description}</p>
                            <p className="text-xs font-medium text-[#1db584] mt-1 sm:mt-2">✓ {tip.actionable}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Charts Grid - Full Width First, Then 2-Column */}
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 sm:p-6 shadow-sm chart-card animate-slide-up overflow-x-auto">
          <canvas ref={canvasRef1} className="w-full" style={{ height: "280px", minHeight: "280px" }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 sm:p-6 shadow-sm chart-card animate-slide-up overflow-x-auto" style={{ animationDelay: "0.1s" }}>
            <canvas ref={canvasRef2} className="w-full" style={{ height: "280px", minHeight: "280px" }} />
          </div>
          <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 sm:p-6 shadow-sm chart-card animate-slide-up overflow-x-auto" style={{ animationDelay: "0.2s" }}>
            <canvas ref={canvasRef3} className="w-full" style={{ height: "280px", minHeight: "280px" }} />
          </div>
        </div>

        <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 sm:p-6 shadow-sm chart-card animate-slide-up overflow-x-auto" style={{ animationDelay: "0.3s" }}>
          <canvas ref={canvasRef4} className="w-full" style={{ height: "340px", minHeight: "340px" }} />
        </div>

        {/* Detailed Expense Breakdown Table */}
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 sm:p-6 shadow-sm chart-card animate-slide-up overflow-x-auto" style={{ animationDelay: "0.4s" }}>
          <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a] mb-3 sm:mb-4">Detailed Expense Breakdown (Current Month)</h3>

          {(() => {
            const currentMonth = user.data.months[user.data.currentMonth];
            const categoryTotals: Record<string, number> = {};
            const categoryDetails: Record<string, Array<{ label: string; value: number }>> = {};

            Object.entries(currentMonth.expenseBreakdown || {}).forEach(([key, value]) => {
              const parts = key.split(":");
              const category = parts[0];
              const subCategory = parts.length > 1 ? parts[1] : "General";

              categoryTotals[category] = (categoryTotals[category] || 0) + value;
              if (!categoryDetails[category]) {
                categoryDetails[category] = [];
              }
              categoryDetails[category].push({ label: subCategory, value });
            });

            const sortedCategories = Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([cat]) => cat);

            const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

            return (
              <div className="space-y-3">
                {sortedCategories.map((category) => {
                  const categoryTotal = categoryTotals[category];
                  const percentage = totalExpenses > 0 ? ((categoryTotal / totalExpenses) * 100).toFixed(1) : "0";
                  const details = categoryDetails[category] || [];

                  return (
                    <div key={category} className="border border-[#e5e5e5] rounded-lg overflow-hidden hover:shadow-sm transition transform hover:scale-102 duration-300 animate-fade-in" style={{ animationDelay: `${sortedCategories.indexOf(category) * 0.05}s` }}>
                      <div className="bg-gradient-to-r from-[#f9f9f9] to-[#ffffff] p-3 border-b border-[#e5e5e5] transition hover:from-[#f0f9f7]">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-[#1a1a1a]">{category}</h4>
                            <p className="text-xs text-[#666666]">{details.length} type{details.length !== 1 ? "s" : ""}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#1db584]">{formatCurrency(categoryTotal, currencySymbol)}</div>
                            <div className="text-xs text-[#666666]">{percentage}% of expenses</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        {details
                          .sort((a, b) => b.value - a.value)
                          .map((detail, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-sm p-2 hover:bg-[#f9f9f9] rounded transition"
                            >
                              <span className="text-[#666666]">→ {detail.label}</span>
                              <span className="font-medium text-[#1a1a1a]">{formatCurrency(detail.value, currencySymbol)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}

                {sortedCategories.length === 0 && (
                  <div className="text-center py-8 text-[#666666]">
                    <p>No expenses recorded this month yet. Add your first expense!</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Income Breakdown */}
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 sm:p-6 shadow-sm chart-card animate-slide-up overflow-x-auto" style={{ animationDelay: "0.5s" }}>
          <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a] mb-3 sm:mb-4">Income Breakdown (Current Month)</h3>

          {(() => {
            const currentMonth = user.data.months[user.data.currentMonth];
            const typeTotals: Record<string, number> = {};
            const typeDetails: Record<string, Array<{ label: string; value: number }>> = {};

            Object.entries(currentMonth.incomeBreakdown || {}).forEach(([key, value]) => {
              const parts = key.split(":");
              const type = parts[0];
              const source = parts.length > 1 ? parts[1] : "General";

              typeTotals[type] = (typeTotals[type] || 0) + value;
              if (!typeDetails[type]) {
                typeDetails[type] = [];
              }
              typeDetails[type].push({ label: source, value });
            });

            const sortedTypes = Object.entries(typeTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([type]) => type);

            const totalIncome = Object.values(typeTotals).reduce((a, b) => a + b, 0);

            return (
              <div className="space-y-3">
                {sortedTypes.map((type) => {
                  const typeTotal = typeTotals[type];
                  const percentage = totalIncome > 0 ? ((typeTotal / totalIncome) * 100).toFixed(1) : "0";
                  const details = typeDetails[type] || [];

                  return (
                    <div key={type} className="border border-green-200 rounded-lg overflow-hidden hover:shadow-sm transition transform hover:scale-102 duration-300 animate-fade-in" style={{ animationDelay: `${sortedTypes.indexOf(type) * 0.05}s` }}>
                      <div className="bg-gradient-to-r from-green-50 to-[#ffffff] p-3 border-b border-green-200 transition hover:from-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-[#1a1a1a]">{type}</h4>
                            <p className="text-xs text-[#666666]">{details.length} source{details.length !== 1 ? "s" : ""}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">{formatCurrency(typeTotal, currencySymbol)}</div>
                            <div className="text-xs text-[#666666]">{percentage}% of income</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        {details
                          .sort((a, b) => b.value - a.value)
                          .map((detail, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-sm p-2 hover:bg-[#f9f9f9] rounded transition"
                            >
                              <span className="text-[#666666]">→ {detail.label}</span>
                              <span className="font-medium text-[#1a1a1a]">{formatCurrency(detail.value, currencySymbol)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}

                {sortedTypes.length === 0 && (
                  <div className="text-center py-8 text-[#666666]">
                    <p>No income recorded this month yet. Add your first income entry!</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </Layout>
  );
}
