'use client'

import DashboardLayout from '@/components/dashboard-layout'
import ProgressDashboard from '@/components/progress-dashboard'

export default function ProgressPage() {
  return (
    <DashboardLayout title="Progress & Achievements">
      <ProgressDashboard />
    </DashboardLayout>
  )
}
