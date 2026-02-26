import { useState } from 'react'
import api from '../../services/api'

/**
 * Export & Reports tab.
 * Export logs/alerts as CSV with date range, and generate summary reports.
 */
const ExportReports = ({ showToast }) => {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [exporting, setExporting] = useState('')
    const [report, setReport] = useState(null)

    const buildDateParams = () => {
        const params = new URLSearchParams()
        if (startDate) params.append('start_date', startDate)
        if (endDate) params.append('end_date', endDate)
        return params.toString()
    }

    const handleExport = async (type) => {
        try {
            setExporting(type)
            const dateParams = buildDateParams()
            const url = `/settings/export/${type}/${dateParams ? '?' + dateParams : ''}`

            const response = await api.get(url, { responseType: 'blob' })

            // Trigger browser download
            const blob = new Blob([response.data], { type: 'text/csv' })
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = `${type === 'logs' ? 'network_logs' : 'alerts'}.csv`
            link.click()
            window.URL.revokeObjectURL(link.href)

            showToast(`${type === 'logs' ? 'Logs' : 'Alerts'} exported successfully`)
        } catch (error) {
            showToast(`Failed to export ${type}`, 'error')
        } finally {
            setExporting('')
        }
    }

    const handleGenerateReport = async () => {
        try {
            setExporting('report')
            const dateParams = buildDateParams()
            const url = `/settings/export/report/${dateParams ? '?' + dateParams : ''}`
            const response = await api.get(url)
            setReport(response.data)
            showToast('Summary report generated')
        } catch (error) {
            showToast('Failed to generate report', 'error')
        } finally {
            setExporting('')
        }
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Export & Reports</h2>

            {/* Date Range Filter */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Date Range Filter</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Leave empty to export all data</p>
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
                    <div className="mb-3">
                        <svg className="w-10 h-10 mx-auto text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">Export Logs (CSV)</h3>
                    <p className="text-xs text-gray-500 mb-3">Download all network traffic logs</p>
                    <button
                        onClick={() => handleExport('logs')}
                        disabled={exporting === 'logs'}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50 w-full"
                    >
                        {exporting === 'logs' ? 'Exporting...' : 'Export Logs'}
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
                    <div className="mb-3">
                        <svg className="w-10 h-10 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">Export Alerts (CSV)</h3>
                    <p className="text-xs text-gray-500 mb-3">Download all security alerts</p>
                    <button
                        onClick={() => handleExport('alerts')}
                        disabled={exporting === 'alerts'}
                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50 w-full"
                    >
                        {exporting === 'alerts' ? 'Exporting...' : 'Export Alerts'}
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
                    <div className="mb-3">
                        <svg className="w-10 h-10 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">Summary Report</h3>
                    <p className="text-xs text-gray-500 mb-3">Generate a system overview report</p>
                    <button
                        onClick={handleGenerateReport}
                        disabled={exporting === 'report'}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50 w-full"
                    >
                        {exporting === 'report' ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Summary Report Display */}
            {report && (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary Report</h3>
                    <p className="text-xs text-gray-400 mb-4">Generated at: {new Date(report.generated_at).toLocaleString()}</p>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-blue-700">{report.total_logs}</p>
                            <p className="text-xs text-blue-600">Total Logs</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-red-700">{report.total_alerts}</p>
                            <p className="text-xs text-red-600">Total Alerts</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-orange-700">{report.open_alerts}</p>
                            <p className="text-xs text-orange-600">Open Alerts</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-green-700">{report.resolved_alerts}</p>
                            <p className="text-xs text-green-600">Resolved Alerts</p>
                        </div>
                    </div>

                    {/* Breakdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Severity Breakdown</h4>
                            {Object.entries(report.severity_breakdown).map(([key, val]) => (
                                <div key={key} className="flex justify-between text-sm py-1 border-b border-gray-100">
                                    <span className="capitalize text-gray-600">{key}</span>
                                    <span className="font-medium">{val}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Protocol Breakdown</h4>
                            {Object.entries(report.protocol_breakdown).map(([key, val]) => (
                                <div key={key} className="flex justify-between text-sm py-1 border-b border-gray-100">
                                    <span className="text-gray-600">{key}</span>
                                    <span className="font-medium">{val}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Action Breakdown</h4>
                            {Object.entries(report.action_breakdown).map(([key, val]) => (
                                <div key={key} className="flex justify-between text-sm py-1 border-b border-gray-100">
                                    <span className="capitalize text-gray-600">{key}</span>
                                    <span className="font-medium">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ExportReports
