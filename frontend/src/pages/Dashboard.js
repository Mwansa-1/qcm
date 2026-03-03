import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const statsCards = [
  { label: 'Total Employees', value: 248, icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#1976d2' },
  { label: 'Monthly Payroll', value: '$1.2M', icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />, color: '#2e7d32' },
  { label: 'Active Vehicles', value: 34, icon: <DirectionsCarIcon sx={{ fontSize: 40 }} />, color: '#ed6c02' },
  { label: 'Avg Performance', value: '87%', icon: <TrendingUpIcon sx={{ fontSize: 40 }} />, color: '#9c27b0' },
];

const monthlyData = [
  { month: 'Jan', employees: 230, revenue: 950 },
  { month: 'Feb', employees: 235, revenue: 1020 },
  { month: 'Mar', employees: 238, revenue: 1100 },
  { month: 'Apr', employees: 240, revenue: 1050 },
  { month: 'May', employees: 244, revenue: 1150 },
  { month: 'Jun', employees: 248, revenue: 1200 },
];

const deptData = [
  { dept: 'Engineering', count: 72 },
  { dept: 'Sales', count: 55 },
  { dept: 'HR', count: 20 },
  { dept: 'Finance', count: 30 },
  { dept: 'Operations', count: 48 },
  { dept: 'Legal', count: 23 },
];

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map(({ label, value, icon, color }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>{value}</Typography>
                  </Box>
                  <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Headcount & Revenue Trend</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="employees" stroke="#1976d2" name="Employees" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#2e7d32" name="Revenue ($K)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Employees by Department</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="dept" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976d2" name="Employees" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
