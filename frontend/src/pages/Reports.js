import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

function Reports() {
  const [salesData, setSalesData] = useState([]);
  const [popularItems, setPopularItems] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const salesResponse = await axios.get('http://localhost:5000/api/staff/reports/sales');
        setSalesData(salesResponse.data);
        const popularItemsResponse = await axios.get('http://localhost:5000/api/staff/reports/popular-items');
        setPopularItems(popularItemsResponse.data);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };
    fetchReportData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports and Analytics</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Daily Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {popularItems.map(item => (
              <li key={item._id} className="flex justify-between items-center">
                <span>{item.name}</span>
                <span className="font-semibold">Sold: {item.soldCount}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default Reports;

