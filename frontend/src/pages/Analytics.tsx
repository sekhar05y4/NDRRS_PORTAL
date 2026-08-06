import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsProps {
  beacons: any[];
  hubs: any[];
}

export default function Analytics({ beacons, hubs }: AnalyticsProps) {
  
  // 1. Incident Categories (Pie Data)
  const categories: Record<string, number> = {
    'Medical Emergency': 0,
    'Flood Trap': 0,
    'Fire Outbreak': 0,
    'Collapsed Building': 0,
    'Shortages': 0
  };

  beacons.forEach(b => {
    if (b.type in categories) categories[b.type]++;
    else categories['Shortages']++;
  });

  const pieData = Object.keys(categories).map(key => ({
    name: key,
    value: categories[key] || 1 // Fallback to 1 to show graphic slice
  }));

  const PIE_COLORS = ['#00c0ff', '#ff0844', '#ff9f43', '#a18cd1', '#ffb199'];

  // 2. Response Time (Bar Data)
  const responseData = [
    { name: 'Team Alpha', time: 14 },
    { name: 'Team Bravo', time: 18 },
    { name: 'Team Charlie', time: 26 },
    { name: 'Team Delta', time: 11 }
  ];

  // 3. Stock Level per Hub (Line Data)
  const stockData = hubs.map(h => ({
    name: h.name.substring(0, 12),
    food: h.food,
    meds: h.medicine,
    water: h.water
  }));

  return (
    <div className="grid grid-cols-2 gap-4 h-full tab-transition select-none overflow-y-auto pr-1">
      
      {/* 1. Incident Categories Distribution (Pie) */}
      <div className="bg-[#0d1425] border border-white/5 p-4 rounded-xl flex flex-col h-[270px] shadow-glass">
        <h3 className="font-heading font-extrabold text-[13.5px] text-white border-b border-white/5 pb-2 mb-3">
          Distress Incidents Categories
        </h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0d1425', borderColor: 'rgba(255,255,255,0.05)', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Response Time (Bar) */}
      <div className="bg-[#0d1425] border border-white/5 p-4 rounded-xl flex flex-col h-[270px] shadow-glass">
        <h3 className="font-heading font-extrabold text-[13.5px] text-white border-b border-white/5 pb-2 mb-3">
          Average Response Times (Minutes)
        </h3>
        <div className="flex-1 text-[11px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={responseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0d1425', borderColor: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              <Bar dataKey="time" fill="#00f2fe" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. MSME Stock Levels (Line) */}
      <div className="col-span-2 bg-[#0d1425] border border-white/5 p-4 rounded-xl flex flex-col h-[270px] shadow-glass">
        <h3 className="font-heading font-extrabold text-[13.5px] text-white border-b border-white/5 pb-2 mb-3">
          MSME Stock Levels Allocation Comparison
        </h3>
        <div className="flex-1 text-[11px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0d1425', borderColor: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              <Line type="monotone" dataKey="food" stroke="#00f2fe" strokeWidth={2.5} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="meds" stroke="#00ff87" strokeWidth={2} />
              <Line type="monotone" dataKey="water" stroke="#ff9f43" strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
