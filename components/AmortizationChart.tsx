import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';
import { formatCurrency } from '../utils/calculations';

interface AmortizationChartProps {
  data: ScheduleItem[];
  principal: number;
  totalInterest: number;
}

export const AmortizationChart: React.FC<AmortizationChartProps> = ({ data, principal, totalInterest }) => {
  const pieData = [
    { name: 'Principal', value: principal },
    { name: 'Total Interest', value: totalInterest },
  ];
  const COLORS = ['#4F46E5', '#F59E0B'];

  // Sample data to improve performance if array is huge, though < 360 points is usually fine.
  const chartData = data; 

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Balance Over Time */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={`curve-${principal}-${totalInterest}`}
        className="bg-white dark:bg-silver-gray p-6 rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray lg:col-span-2 transition-colors duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-davys-gray mb-6">Amortization Curve</h3>
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
              />
              <YAxis 
                tick={{fill: 'var(--chart-text)', fontSize: 12}} 
                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
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
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area 
                type="monotone" 
                dataKey="closingBalance" 
                stroke="#4F46E5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                name="Outstanding Balance"
                isAnimationActive={true}
                animationDuration={1000}
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
        key={`pie-${principal}-${totalInterest}`}
        className="bg-white dark:bg-silver-gray p-6 rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray transition-colors duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-davys-gray mb-2">Total Breakup</h3>
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
                animationDuration={1000}
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
                formatter={(val: number) => formatCurrency(val)} 
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
            <div className="text-center">
              <span className="text-xs text-gray-500 dark:text-davys-gray block">Total Payable</span>
              <span className="text-sm font-bold text-gray-800 dark:text-davys-gray">
                ₹{((principal + totalInterest)/1000).toFixed(1)}k
              </span>
            </div>
          </div>
        </div>
      </motion.div>

       {/* Components Bar Chart */}
       <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={`bar-${principal}-${totalInterest}`}
        className="bg-white dark:bg-silver-gray p-6 rounded-xl shadow-sm border border-gray-100 dark:border-davys-gray lg:col-span-3 transition-colors duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-davys-gray mb-6">Principal vs Interest Component</h3>
        <div className="h-56 sm:h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize: 12, fill: 'var(--chart-text)'}} />
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
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar 
                dataKey="principalComponent" 
                stackId="a" 
                fill="#10B981" 
                name="Principal" 
                radius={[0, 0, 4, 4]} 
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
              <Bar 
                dataKey="interestComponent" 
                stackId="a" 
                fill="#F59E0B" 
                name="Interest" 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};
