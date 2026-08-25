import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiDocumentText, HiArrowDownTray, HiChartPie, HiDocumentChartBar } from 'react-icons/hi2';
import toast from 'react-hot-toast';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import reportService from '../../services/reportService';
import { useAuth } from '../../hooks/useAuth';

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

  const handlePrintPDF = () => {
    window.print();
  };

  const columns = reportData.length > 0 
    ? Object.keys(reportData[0]).map(key => ({
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        accessor: key
      }))
    : [];

  const reportTitles = {
    sales: 'Sales Performance Report',
    products: 'Product Sales Report',
    customers: 'Customer Activity Report',
    employees: 'Employee Performance Report',
    inventory: 'Inventory Valuation Report',
  };

  const formattedUserName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'System Admin';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Screen Only Page Header */}
      <div className="print:hidden">
        <PageHeader 
          title="Reports & Analytics" 
          subtitle="Generate, inspect, and export comprehensive system database reports."
          action={
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={handlePrintPDF} 
                disabled={reportData.length === 0} 
                leftIcon={<HiDocumentText className="w-4 h-4" />}
              >
                Export PDF / Print
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleExportCSV} 
                disabled={reportData.length === 0} 
                leftIcon={<HiArrowDownTray className="w-4 h-4" />}
              >
                Export CSV / Excel
              </Button>
            </div>
          }
        />
      </div>

      {/* Screen Only Criteria Selection Card */}
      <div className="print:hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <HiChartPie className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Report Filter Criteria</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select label="Report Type" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="sales">Sales Performance Report</option>
            <option value="products">Product Sales Report</option>
            <option value="customers">Customer Activity Report</option>
            <option value="employees">Employee Sales Report</option>
            <option value="inventory">Inventory Valuation Report</option>
          </Select>
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button onClick={() => refetch()} isLoading={isFetching} className="w-full font-semibold shadow-md shadow-primary-600/20">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="print:hidden p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-800">
          Failed to generate report: {error?.message || 'Server error occurred'}
        </div>
      )}

      {/* Official Print Header (Visible ONLY when printing / exporting PDF) */}
      <div className="hidden print:block mb-6 border-b pb-4 border-gray-300">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-black tracking-tight">Business Management System</h1>
            <h2 className="text-lg font-semibold text-gray-800 mt-1">{reportTitles[reportType] || 'System Report'}</h2>
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

      {/* Report Data Results Table */}
      {reportData.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="print:hidden p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white capitalize">
              {reportTitles[reportType]} ({reportData.length} Records)
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Generated at: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <DataTable columns={columns} data={reportData} isLoading={isFetching} />
        </div>
      ) : (
        <div className="print:hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4 text-primary-600">
            <HiDocumentChartBar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Report Generated Yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            Select your report type and date criteria above, then click <strong>Generate Report</strong> to inspect real-time database analytics.
          </p>
        </div>
      )}

      {/* Official Print Footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>End of Official Report — Business Management System &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
