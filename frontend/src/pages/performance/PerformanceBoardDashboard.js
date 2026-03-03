import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DataTable from '../../components/DataTable';
import NotificationSnackbar from '../../components/NotificationSnackbar';

const kpiData = [
  { subject: 'Productivity', A: 88 },
  { subject: 'Quality', A: 92 },
  { subject: 'Attendance', A: 95 },
  { subject: 'Innovation', A: 74 },
  { subject: 'Teamwork', A: 85 },
  { subject: 'Leadership', A: 70 },
];

const teamPerformance = [
  { team: 'Engineering', q1: 85, q2: 88, q3: 90, q4: 87 },
  { team: 'Sales', q1: 78, q2: 82, q3: 85, q4: 92 },
  { team: 'HR', q1: 90, q2: 88, q3: 91, q4: 89 },
  { team: 'Finance', q1: 82, q2: 84, q3: 86, q4: 88 },
];

const reviews = [
  { id: 1, employee: 'Alice Johnson', department: 'Engineering', period: 'Q4 2023', score: 92, rating: 'Excellent', status: 'Completed' },
  { id: 2, employee: 'Bob Smith', department: 'Sales', period: 'Q4 2023', score: 85, rating: 'Good', status: 'Completed' },
  { id: 3, employee: 'Carol White', department: 'HR', period: 'Q4 2023', score: 78, rating: 'Satisfactory', status: 'Pending' },
  { id: 4, employee: 'David Brown', department: 'Finance', period: 'Q4 2023', score: 0, rating: '-', status: 'Not Started' },
];

const ratingColor = { Excellent: 'success', Good: 'primary', Satisfactory: 'warning', 'Needs Improvement': 'error' };
const statusColor = { Completed: 'success', Pending: 'warning', 'Not Started': 'default' };

export default function PerformanceBoardDashboard() {
  const [snack, setSnack] = useState({ open: false, message: '' });

  const stats = [
    { label: 'Avg Score', value: '87%', color: '#1976d2' },
    { label: 'Reviews Complete', value: '68%', color: '#2e7d32' },
    { label: 'Top Performers', value: 24, color: '#9c27b0' },
    { label: 'Reviews Pending', value: 32, color: '#ed6c02' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Performance Board</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSnack({ open: true, message: 'Review cycle started' })}>
          Start Review Cycle
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(({ label, value, color }) => (
          <Grid item xs={6} md={3} key={label}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>KPI Radar</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={kpiData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Score" dataKey="A" stroke="#1976d2" fill="#1976d2" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Team Performance by Quarter</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="q1" name="Q1" fill="#1976d2" />
                  <Bar dataKey="q2" name="Q2" fill="#2e7d32" />
                  <Bar dataKey="q3" name="Q3" fill="#ed6c02" />
                  <Bar dataKey="q4" name="Q4" fill="#9c27b0" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Performance Reviews</Typography>
          <DataTable
            columns={[
              { field: 'employee', header: 'Employee' },
              { field: 'department', header: 'Department' },
              { field: 'period', header: 'Period' },
              {
                field: 'score', header: 'Score',
                render: (v) => v ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress variant="determinate" value={v} sx={{ width: 60, height: 6, borderRadius: 3 }} />
                    <Typography variant="body2">{v}</Typography>
                  </Box>
                ) : '-',
              },
              { field: 'rating', header: 'Rating', render: (v) => v !== '-' ? <Chip label={v} size="small" color={ratingColor[v] || 'default'} /> : '-' },
              { field: 'status', header: 'Status', render: (v) => <Chip label={v} size="small" color={statusColor[v] || 'default'} /> },
              {
                field: 'id', header: 'Actions',
                render: (_, row) => (
                  <Button size="small" disabled={row.status === 'Completed'}>
                    {row.status === 'Not Started' ? 'Start' : 'Continue'}
                  </Button>
                ),
              },
            ]}
            rows={reviews}
          />
        </CardContent>
      </Card>

      <NotificationSnackbar open={snack.open} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
