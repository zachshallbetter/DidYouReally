"use client"

import * as React from "react"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const defaultOptions: ChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

interface ChartProps {
  data: ChartData
  options?: ChartOptions
  height?: number
}

export function LineChart({ data, options = {}, height }: ChartProps) {
  return (
    <Line 
      data={data} 
      options={{ ...defaultOptions, ...options }}
      height={height}
    />
  )
}

export function BarChart({ data, options = {}, height }: ChartProps) {
  return (
    <Bar 
      data={data} 
      options={{ ...defaultOptions, ...options }}
      height={height}
    />
  )
}

export function DoughnutChart({ data, options = {}, height }: ChartProps) {
  return (
    <Doughnut 
      data={data} 
      options={{ 
        ...defaultOptions, 
        ...options,
        scales: {} // Remove scales for doughnut
      }}
      height={height}
    />
  )
} 