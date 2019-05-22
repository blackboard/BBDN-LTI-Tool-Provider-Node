import React from "react";
import CartesianGrid from "recharts/lib/cartesian/CartesianGrid";
import Line from "recharts/lib/cartesian/Line";
import XAxis from "recharts/lib/cartesian/XAxis";
import YAxis from "recharts/lib/cartesian/YAxis";
import LineChart from "recharts/lib/chart/LineChart";
import Legend from "recharts/lib/component/Legend";
import ResponsiveContainer from "recharts/lib/component/ResponsiveContainer";
import Tooltip from "recharts/lib/component/Tooltip";

const data = [
  { name: "Mon", Yes: 22, No: 34 },
  { name: "Tue", Yes: 12, No: 23 },
  { name: "Wed", Yes: 50, No: 43 },
  { name: "Thu", Yes: 47, No: 29 },
  { name: "Fri", Yes: 58, No: 48 },
  { name: "Sat", Yes: 43, No: 38 },
  { name: "Sun", Yes: 44, No: 43 }
];

function SimpleLineChart() {
  return (
    // 99% per https://github.com/recharts/recharts/issues/172
    <ResponsiveContainer width="99%" height={320}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Yes" stroke="#82ca9d" />
        <Line
          type="monotone"
          dataKey="No"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SimpleLineChart;
