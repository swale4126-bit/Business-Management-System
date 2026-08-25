import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmployeeForm from './EmployeeForm';
import employeeService from '../../services/employeeService';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash, HiEye, HiMagnifyingGlass } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const res = await employeeService.getAll();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
      setEmployees(list);
    } catch {
      toast.error('Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleEdit = (employee) => { setSelectedEmployee(employee); setIsFormOpen(true); };
  const handleDeleteClick = (employee) => { setEmployeeToDelete(employee); setIsDeleteOpen(true); };
  const handleConfirmDelete = async () => {
    try {
      const res = await employeeService.delete(employeeToDelete.id);
      toast.success(res.message || 'Employee terminated successfully');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to terminate employee');
    }
  };

  const roleVariant = (role) => role === 'ADMIN' ? 'indigo' : role === 'MANAGER' ? 'blue' : 'gray';

  const filteredEmployees = employees.filter((emp) => {
    const fn = emp.user?.firstName || '';
    const ln = emp.user?.lastName || '';
    const full = `${fn} ${ln}`.toLowerCase();
    const email = (emp.user?.email || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    const pos = (emp.position || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = full.includes(term) || email.includes(term) || dept.includes(term) || pos.includes(term);
    const matchesRole = roleFilter === 'ALL' || emp.user?.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const columns = [
    { header: 'Employee', render: (row) => {
      const firstName = row.user?.firstName ?? '';
      const lastName  = row.user?.lastName  ?? '';
      const fullName  = `${firstName} ${lastName}`.trim() || 'Unknown';
      const email     = row.user?.email ?? '';
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {fullName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{fullName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>
          </div>
        </div>
      );
    }},
    { header: 'Employee ID', accessor: (row) => <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{row.employeeId || '—'}</span> },
    { header: 'Role',   render: (row) => <Badge variant={roleVariant(row.user?.role)}>{row.user?.role}</Badge> },
    { header: 'Department', accessor: (row) => row.department || 'Unassigned' },
    { header: 'Position', accessor: (row) => row.position || 'Unassigned' },
    { header: 'Status', render: (row) => {
      const v = row.status === 'ACTIVE' ? 'green' : row.status === 'ON_LEAVE' ? 'amber' : row.status === 'TERMINATED' ? 'red' : 'gray';
      return <Badge variant={v} dot>{row.status?.replace('_', ' ')}</Badge>;
    }},
    { header: 'Actions', render: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => navigate(`/employees/${row.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="View Details">
          <HiEye className="w-4 h-4" />
        </button>
        <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Edit">
          <HiPencil className="w-4 h-4" />
        </button>
        <button onClick={() => handleDeleteClick(row)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
          <HiTrash className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Employees"
        description="Manage your staff members, positions, and operational roles."
        actions={
          <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={() => { setSelectedEmployee(null); setIsFormOpen(true); }}>
            Add Employee
          </Button>
        }
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, department or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="STAFF">Staff</option>
          </select>
        </div>

        <DataTable columns={columns} data={filteredEmployees} isLoading={isLoading} />
      </div>

      <EmployeeForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} employee={selectedEmployee} onSuccess={() => { setIsFormOpen(false); fetchEmployees(); }} />
      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} title="Terminate Employee" message={`Are you sure you want to terminate ${employeeToDelete?.user?.firstName ?? ''} ${employeeToDelete?.user?.lastName ?? ''}? Their account will be deactivated and they won't be able to log in.`} confirmText="Terminate" isDanger={true} />
    </div>
  );
};

export default EmployeesPage;
