import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import employeeService from '../../services/employeeService';
import { HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlineBriefcase, HiOutlineIdentification, HiOutlineCurrencyDollar, HiOutlineCalendar } from 'react-icons/hi';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: employeeData, isLoading, isError } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getById(id)
  });

  const employee = employeeData?.data?.data || employeeData?.data || employeeData;

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (isError || !employee || !employee.id) return <div className="p-8 text-center text-red-500">Employee not found or failed to load.</div>;

  const user = employee.user || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Employee Details"
        subtitle={`Detailed view for ${user?.firstName} ${user?.lastName}`}
        actions={
          <Button variant="secondary" onClick={() => navigate('/employees')}>Back to List</Button>
        }
      />
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header Section */}
        <div className="px-8 py-8 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-bold uppercase shrink-0">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user?.firstName} {user?.lastName}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Badge variant={user?.role === 'ADMIN' ? 'indigo' : user?.role === 'MANAGER' ? 'purple' : 'gray'}>
                {user?.role}
              </Badge>
              <Badge variant={
                employee.status === 'ACTIVE' ? 'green' : 
                employee.status === 'ON_LEAVE' ? 'amber' : 
                'red'
              }>
                {employee.status}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                ID: {employee.employeeId}
              </span>
            </div>
          </div>
        </div>
        
        {/* Details Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <HiOutlineMail className="w-5 h-5 mr-3 text-gray-400" />
                <a href={`mailto:${user?.email}`} className="hover:text-primary-600 transition-colors">{user?.email}</a>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <HiOutlinePhone className="w-5 h-5 mr-3 text-gray-400" />
                <span>{user?.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Employment Details</h3>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <HiOutlineOfficeBuilding className="w-5 h-5 mr-3 text-gray-400" />
                <span><span className="font-medium">Department:</span> {employee.department || 'Unassigned'}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <HiOutlineBriefcase className="w-5 h-5 mr-3 text-gray-400" />
                <span><span className="font-medium">Position:</span> {employee.position || 'Unassigned'}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <HiOutlineCurrencyDollar className="w-5 h-5 mr-3 text-gray-400" />
                <span><span className="font-medium">Salary:</span> {employee.salary ? `$${Number(employee.salary).toLocaleString()}` : 'Not disclosed'}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <HiOutlineCalendar className="w-5 h-5 mr-3 text-gray-400" />
                <span><span className="font-medium">Hire Date:</span> {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</p>
                <p className="text-gray-900 dark:text-white">{employee.address || 'No address on file'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                <p className="text-gray-900 dark:text-white">{employee.notes || 'No notes'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Login</p>
                <p className="text-gray-900 dark:text-white">{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never logged in'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Profile Created</p>
                <p className="text-gray-900 dark:text-white">{new Date(employee.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
