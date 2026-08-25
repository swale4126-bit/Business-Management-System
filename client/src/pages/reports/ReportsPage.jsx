import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiDocumentText, HiArrowDownTray, HiChartPie, HiDocumentChartBar, HiPrinter } from 'react-icons/hi2';
import toast from 'react-hot-toast';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import reportService from '../../services/reportService';
import { useAuth } from '../../hooks/useAuth';

const REPORT_TYPES = [
  { value: 'sales',     label: 'Sales Performance Report' },
  { value: 'products',  label: 'Product Sales Report' },
  { value: 'customers', label: 'Customer Activity Report' },
  { value: 'employees', label: 'Employee Performance Report' },
  { value: 'inventory', label: 'Inventory Valuation Report' },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: rawData = [], refetch, isFetching, isError, error } = useQuery({
    queryKey: ['reports', reportType, startDate, endDate],
    queryFn: () => reportService.generateReport(reportType, { startDate, endDate }),
    enabled: false,
  });

  const reportData = Array.isArray(rawData) ? rawData : [];

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV successfully');
  };

  const handlePrintPDF = () => window.print();

  const columns = reportData.length > 0
    ? Object.keys(reportData[0]).map(key => ({
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        accessor: key
      }))
    : [];

  const currentReportLabel = REPORT_TYPES.find(r => r.value === reportType)?.label || 'System Report';
  const formattedUserName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'System Admin';

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* Screen-only header */}
      <div className="print:hidden">
        <PageHeader
          title="Reports"
          description="Generate, inspect, and export comprehensive database reports."
          actions={
            <div className="flex gap-2.5">
              <Button
                variant="secondary"
                onClick={handlePrintPDF}
                disabled={reportData.length === 0}
                leftIcon={<HiPrinter className="w-4 h-4" />}
              >
                Print / PDF
              </Button>
              <Button
                variant="secondary"
                onClick={handleExportCSV}
                disabled={reportData.length === 0}
                leftIcon={<HiArrowDownTray className="w-4 h-4" />}
              >
                Export CSV
              </Button>
            </div>
          }
        />
      </div>

      {/* Filter Criteria Card */}
      <div className="print:hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center ring-1 ring-primary-500/20">
            <HiChartPie className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Report Criteria</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Select a report type and optional date range, then generate</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select label="Report Type" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            {REPORT_TYPES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button onClick={() => refetch()} isLoading={isFetching} className="w-full">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="print:hidden p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-500/20 ring-1 ring-red-500/10">
          Failed to generate report: {error?.message || 'Server error occurred. Please try again.'}
        </div>
      )}

      {/* Print-only header */}
      <div className="hidden print:block mb-6 border-b pb-4 border-gray-300">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-black tracking-tight">Business Management System</h1>
            <h2 className="text-lg font-semibold text-gray-800 mt-1">{currentReportLabel}</h2>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p><strong>Generated By:</strong> {formattedUserName}</p>
            <p><strong>Date Generated:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            {startDate && endDate && (
              <p><strong>Date Range:</strong> {startDate} to {endDate}</p>
            )}
            <p><strong>Total Records:</strong> {reportData.length}</p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {reportData.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="print:hidden px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/20 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{currentReportLabel}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{reportData.length} records · Generated {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Live Data</span>
            </div>
          </div>
          <DataTable columns={columns} data={reportData} isLoading={isFetching} />
        </div>
      ) : (
        <div className="print:hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 border-dashed p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary-500/10 dark:bg-primary-500/15 rounded-2xl flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/20">
            <HiDocumentChartBar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">No Report Generated Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            Select a report type and optional date range above, then click <strong className="text-gray-700 dark:text-gray-300">Generate Report</strong> to view real-time data.
          </p>
        </div>
      )}

      {/* Print footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>End of Official Report — Business Management System &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
