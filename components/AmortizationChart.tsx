import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Balance Over Time */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Amortization Curve</h3>
        <div className="h-72 w-full">
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="month" 
                tick={{fill: '#94A3B8', fontSize: 12}} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{fill: '#94A3B8', fontSize: 12}} 
                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakup Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Breakup</h3>
        <div className="h-64 w-full relative">
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
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
            <div className="text-center">
              <span className="text-xs text-gray-500 block">Total Payable</span>
              <span className="text-sm font-bold text-gray-800">
                ₹{((principal + totalInterest)/1000).toFixed(1)}k
              </span>
            </div>
          </div>
        </div>
      </div>

       {/* Components Bar Chart */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Principal vs Interest Component</h3>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize: 12}} />
              <YAxis tickLine={false} axisLine={false} tick={{fontSize: 12}} />
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="principalComponent" stackId="a" fill="#10B981" name="Principal" radius={[0, 0, 4, 4]} />
              <Bar dataKey="interestComponent" stackId="a" fill="#F59E0B" name="Interest" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};