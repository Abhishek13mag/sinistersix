import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  score: number;
}

export const PrivacyScoreChart: React.FC<Props> = ({ score }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remainder', value: 100 - score },
  ];

  let color = '#10b981'; // Emerald
  if (score < 50) color = '#f43f5e'; // Rose
  else if (score < 80) color = '#f59e0b'; // Amber

  return (
    <div className="relative w-32 h-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={55}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell key="score" fill={color} />
            <Cell key="remainder" fill="#1e293b" /> 
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Safe</span>
      </div>
    </div>
  );
};
