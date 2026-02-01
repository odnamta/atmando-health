import { notFound } from 'next/navigation'
import { getHealthMetric } from '../actions'
import { EditMetricForm } from './EditMetricForm'

interface EditMetricPageProps {
  params: Promise<{ id: string }>
}

/**
 * Edit health metric page
 */
export default async function EditMetricPage({ params }: EditMetricPageProps) {
  const { id } = await params
  const { data: metric, error } = await getHealthMetric(id)

  if (error || !metric) {
    notFound()
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Data Kesehatan</h1>
        <p className="text-muted-foreground">
          {metric.family_members?.name}
        </p>
      </div>

      <EditMetricForm metric={metric} />
    </div>
  )
}
