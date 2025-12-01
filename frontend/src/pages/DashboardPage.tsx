export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <h3 className="text-text-secondary text-sm mb-2">Total Runs</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="card">
            <h3 className="text-text-secondary text-sm mb-2">Failed Runs</h3>
            <p className="text-3xl font-bold text-error">0</p>
          </div>
          <div className="card">
            <h3 className="text-text-secondary text-sm mb-2">Avg Latency</h3>
            <p className="text-3xl font-bold">0ms</p>
          </div>
          <div className="card">
            <h3 className="text-text-secondary text-sm mb-2">Test Pass Rate</h3>
            <p className="text-3xl font-bold text-success">100%</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Recent Runs</h2>
          <div className="card">
            <p className="text-text-secondary text-center py-8">No runs yet</p>
          </div>
        </div>
      </div>
    </div>
  )
}
