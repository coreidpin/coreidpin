import React from 'react'
import { toast } from 'sonner'
import { recordClientError } from '../utils/monitoring'

type State = { hasError: boolean; err?: any }

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(err: any) { return { hasError: true, err } }
  componentDidCatch(error: any, info: any) { try { recordClientError('render', String(error?.message || error), info?.componentStack || '') } catch {} }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="text-lg">Something went wrong</div>
            <button className="mt-3 px-3 py-2 border rounded" onClick={() => { try { toast.info('Reloading'); } catch {}; window.location.reload() }}>Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children as React.ReactElement
  }
}

