import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'

export default function MaintenanceDashboard() {
  const [health, setHealth] = useState<any>(null)
  const [flags, setFlags] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [kv, setKv] = useState<any>(null)
  const [parts, setParts] = useState<any>(null)
  const token = (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null) || undefined

  useEffect(() => {
    const run = async () => {
      try { setHealth(await api.checkHealth()) } catch {}
      try { setFlags(await api.getFlags(token)) } catch {}
      try { setSummary(await api.getDiagnosticsSummary(token)) } catch {}
      try { setKv(await api.getKVUsage(token)) } catch {}
      try { setParts(await api.getDBPartitions(token)) } catch {}
    }
    run()
  }, [])

  return (
    <div className="p-4 grid gap-4">
      <div className="p-4 border rounded">
        <div className="font-medium">Health</div>
        <pre className="text-xs overflow-auto">{JSON.stringify(health, null, 2)}</pre>
      </div>
      <div className="p-4 border rounded">
        <div className="font-medium">Flags</div>
        <pre className="text-xs overflow-auto">{JSON.stringify(flags, null, 2)}</pre>
      </div>
      <div className="p-4 border rounded">
        <div className="font-medium">Diagnostics Summary</div>
        <pre className="text-xs overflow-auto">{JSON.stringify(summary, null, 2)}</pre>
      </div>
      <div className="p-4 border rounded">
        <div className="font-medium">KV Usage</div>
        <pre className="text-xs overflow-auto">{JSON.stringify(kv, null, 2)}</pre>
      </div>
      <div className="p-4 border rounded">
        <div className="font-medium">DB Partitions</div>
        <pre className="text-xs overflow-auto">{JSON.stringify(parts, null, 2)}</pre>
      </div>
    </div>
  )
}

