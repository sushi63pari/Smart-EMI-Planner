import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { ScheduleItem } from '../types';
import { formatCurrency } from '../utils/calculations';
import { AppTranslations } from '../utils/translations';

interface AmortizationChartProps {
  data: ScheduleItem[];
  principal: number;
  totalInterest: number;
  currencySymbol: string;
  currencyCode: string;
  currencyLocale: string;
  translations?: AppTranslations;
}

const getZoomLabels = (appTitle?: string) => {
  const isHindi = appTitle === "स्मार्ट ईएमआई प्लानर";
  const isTamil = appTitle === "ஸ்மார்ட் இஎம்ஐ பிளானர்";
  const isTelugu = appTitle === "స్మార్ట్ ఈఎమ్‌ఐ ప్లానర్";
  const isMalayalam = appTitle === "സ്മാർട്ട് ഇഎംഐ പ്ലാനർ";

  if (isHindi) {
    return {
      all: "सभी",
      y5: "5 वर्ष",
      y10: "10 वर्ष",
      showingMonths: "महीने {start} - {end} ({total} में से)",
      zoomIn: "ज़ूम इन",
      zoomOut: "ज़ूम आउट",
      panLeft: "पीछे जाएं",
      panRight: "आगे जाएं",
      reset: "रीसेट"
    };
  }
  if (isTamil) {
    return {
      all: "அனைத்தும்",
      y5: "5 ஆண்டுகள்",
      y10: "10 ஆண்டுகள்",
      showingMonths: "மாதங்கள் {start} - {end} (மொத்தம் {total})",
      zoomIn: "பெரிதாக்கு",
      zoomOut: "சிறிதாக்கு",
      panLeft: "இடது நகர்த்து",
      panRight: "வலது நகர்த்து",
      reset: "மீட்டமை"
    };
  }
  if (isTelugu) {
    return {
      all: "అన్నీ",
      y5: "5 సంవత్సరాలు",
      y10: "10 సంవత్సరాలు",
      showingMonths: "నెలలు {start} - {end} ({total} లో)",
      zoomIn: "జూమ్ ఇన్",
      zoomOut: "జూమ్ అవుట్",
      panLeft: "ఎడమకు",
      panRight: "కుడికి",
      reset: "రీసెట్"
    };
  }
  if (isMalayalam) {
    return {
      all: "എല്ലാം",
      y5: "5 വർഷം",
      y10: "10 വർഷം",
      showingMonths: "മാസങ്ങൾ {start} - {end} ({total}-ൽ)",
      zoomIn: "സൂം ചെയ്യുക",
      zoomOut: "സൂം കുറയ്ക്കുക",
      panLeft: "ഇടത്തോട്ട്",
      panRight: "വലത്തോട്ട്",
      reset: "റീസെറ്റ്"
    };
  }
  return {
    all: "All",
    y5: "5 Years",
    y10: "10 Years",
    showingMonths: "Months {start} - {end} of {total}",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    panLeft: "Pan Left",
    panRight: "Pan Right",
    reset: "Reset"
  };
};

export const AmortizationChart: React.FC<AmortizationChartProps> = ({ 
  data, 
  principal, 
  totalInterest,
  currencySymbol,
  currencyCode,
  currencyLocale,
  translations
}) => {
  const [startIndex, setStartIndex] = React.useState<number>(0);
  const [endIndex, setEndIndex] = React.useState<number>(data.length > 0 ? data.length - 1 : 0);

  React.useEffect(() => {
    setStartIndex(0);
    setEndIndex(data.length > 0 ? data.length - 1 : 0);
  }, [data]);

  const labels = getZoomLabels(translations?.appTitle);

  const handleZoomIn = () => {
    const currentSpan = endIndex - startIndex;
    if (currentSpan <= 4) return;
    const delta = Math.max(1, Math.floor(currentSpan * 0.15));
    setStartIndex(prev => Math.min(endIndex - 4, prev + delta));
    setEndIndex(prev => Math.max(startIndex + 4, prev - delta));
  };

  const handleZoomOut = () => {
    const currentSpan = endIndex - startIndex;
    const delta = Math.max(1, Math.floor(currentSpan * 0.15));
    setStartIndex(prev => Math.max(0, prev - delta));
    setEndIndex(prev => Math.min(data.length - 1, prev + delta));
  };

  const handlePanLeft = () => {
    const currentSpan = endIndex - startIndex;
    const delta = Math.max(1, Math.floor(currentSpan * 0.2));
    const newStart = Math.max(0, startIndex - delta);
    const newEnd = Math.min(data.length - 1, newStart + currentSpan);
    setStartIndex(newStart);
    setEndIndex(newEnd);
  };

  const handlePanRight = () => {
    const currentSpan = endIndex - startIndex;
    const delta = Math.max(1, Math.floor(currentSpan * 0.2));
    const newEnd = Math.min(data.length - 1, endIndex + delta);
    const newStart = Math.max(0, newEnd - currentSpan);
    setStartIndex(newStart);
    setEndIndex(newEnd);
  };

  const showAll = () => {
    setStartIndex(0);
    setEndIndex(data.length - 1);
  };

  const show5Y = () => {
    setStartIndex(0);
    setEndIndex(Math.min(59, data.length - 1));
  };

  const show10Y = () => {
    setStartIndex(0);
    setEndIndex(Math.min(119, data.length - 1));
  };

  const pieData = [
    { name: translations?.principalLabel || 'Principal', value: principal },
    { name: translations?.interestLabel || 'Total Interest', value: totalInterest },
  ];
  const COLORS = ['#4F46E5', '#F59E0B'];

  const chartData = React.useMemo(() => {
    if (data.length === 0) return [];
    const start = Math.max(0, Math.min(startIndex, data.length - 1));
    const end = Math.max(start, Math.min(endIndex, data.length - 1));
    return data.slice(start, end + 1);
  }, [data, startIndex, endIndex]); 

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const totalPayable = principal + totalInterest;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Balance Over Time */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        layout
        className="bg-white dark:bg-silver-gray p-6 rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray lg:col-span-2 transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-davys-gray">
            {translations?.amortizationCurveHeader || "Amortization Curve"}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Presets */}
            {data.length > 60 && (
              <div className="flex items-center bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-lg mr-2 border border-gray-200/50 dark:border-zinc-700/50">
                <button
                  type="button"
                  onClick={showAll}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 outline-none ${
                    startIndex === 0 && endIndex === data.length - 1
                      ? 'bg-white dark:bg-zinc-700 text-primary dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {labels.all}
                </button>
                <button
                  type="button"
                  onClick={show5Y}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 outline-none ${
                    startIndex === 0 && endIndex === Math.min(59, data.length - 1)
                      ? 'bg-white dark:bg-zinc-700 text-primary dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {labels.y5}
                </button>
                {data.length > 120 && (
                  <button
                    type="button"
                    onClick={show10Y}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 outline-none ${
                      startIndex === 0 && endIndex === Math.min(119, data.length - 1)
                        ? 'bg-white dark:bg-zinc-700 text-primary dark:text-indigo-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {labels.y10}
                  </button>
                )}
              </div>
            )}

            {/* Navigation & Zoom controls */}
            <div className="flex items-center bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-gray-200/50 dark:border-zinc-700/50">
              {/* Pan Left */}
              <button
                type="button"
                onClick={handlePanLeft}
                disabled={startIndex === 0}
                className="p-1 px-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded transition-all"
                title={labels.panLeft}
              >
                <ChevronLeft size={15} />
              </button>
              
              {/* Zoom Out */}
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={startIndex === 0 && endIndex === data.length - 1}
                className="p-1 px-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded mx-0.5 transition-all"
                title={labels.zoomOut}
              >
                <ZoomOut size={15} />
              </button>

              {/* Range Status Label */}
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 px-2 min-w-[100px] text-center select-none border-x border-gray-200 dark:border-zinc-700 text-[11px]">
                {labels.showingMonths
                  .replace("{start}", (startIndex + 1).toString())
                  .replace("{end}", (endIndex + 1).toString())
                  .replace("{total}", data.length.toString())}
              </span>

              {/* Zoom In */}
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={endIndex - startIndex <= 4}
                className="p-1 px-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded mx-0.5 transition-all"
                title={labels.zoomIn}
              >
                <ZoomIn size={15} />
              </button>

              {/* Pan Right */}
              <button
                type="button"
                onClick={handlePanRight}
                disabled={endIndex === data.length - 1}
                className="p-1 px-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded transition-all"
                title={labels.panRight}
              >
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Reset */}
            {(startIndex !== 0 || endIndex !== data.length - 1) && (
              <button
                type="button"
                onClick={showAll}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded-lg transition-all border border-gray-200/50 dark:border-zinc-700/50"
                title={labels.reset}
              >
                <Maximize2 size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="h-56 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis 
                dataKey="month" 
                tick={{fill: 'var(--chart-text)', fontSize: 12}} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  const visibleCount = endIndex - startIndex + 1;
                  return visibleCount <= 24 ? `${translations?.monthText || "Month"} ${val}` : `${val}`;
                }}
              />
              <YAxis 
                tick={{fill: 'var(--chart-text)', fontSize: 12}} 
                tickFormatter={(val) => `${currencySymbol}${(val/1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'var(--chart-tooltip-bg)',
                  color: 'var(--chart-tooltip-text)'
                }}
                itemStyle={{ color: '#4F46E5' }}
                formatter={(value: number) => formatCurrency(value, currencyCode, currencyLocale)}
              />
              <Area 
                type="monotone" 
                dataKey="closingBalance" 
                stroke="#4F46E5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                name={translations?.outstandingBalanceLabel || "Outstanding Balance"}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Breakup Pie Chart */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        layout
        className="bg-white dark:bg-silver-gray p-6 rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray transition-colors duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-davys-gray mb-2">{translations?.totalBreakupHeader || "Total Breakup"}</h3>
        <div className="h-56 sm:h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'var(--chart-tooltip-bg)',
                  color: 'var(--chart-tooltip-text)'
                }}
                formatter={(val: number) => formatCurrency(val, currencyCode, currencyLocale)} 
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
            <div className="text-center">
              <span className="text-xs text-gray-500 dark:text-davys-gray block">{translations?.totalPayableLabel || "Total Payable"}</span>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={totalPayable}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-bold text-gray-800 dark:text-davys-gray block"
                >
                  {currencySymbol}{(totalPayable/1000).toFixed(1)}k
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

       {/* Components Bar Chart */}
       <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        layout
        className="bg-white dark:bg-silver-gray p-6 rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray lg:col-span-3 transition-colors duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-davys-gray mb-6">{translations?.principalAndInterestHeader || "Principal vs Interest Component"}</h3>
        <div className="h-56 sm:h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                tick={{fontSize: 12, fill: 'var(--chart-text)'}} 
                tickFormatter={(val) => {
                  const visibleCount = endIndex - startIndex + 1;
                  return visibleCount <= 24 ? `${translations?.monthText || "Month"} ${val}` : `${val}`;
                }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{fontSize: 12, fill: 'var(--chart-text)'}} />
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'var(--chart-tooltip-bg)',
                  color: 'var(--chart-tooltip-text)'
                }}
                formatter={(value: number) => formatCurrency(value, currencyCode, currencyLocale)}
              />
              <Legend />
              <Bar 
                dataKey="principalComponent" 
                stackId="a" 
                fill="#10B981" 
                name={translations?.principalLabel || "Principal"} 
                radius={[0, 0, 4, 4]} 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Bar 
                dataKey="interestComponent" 
                stackId="a" 
                fill="#F59E0B" 
                name={translations?.interestLabel || "Interest"} 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};
