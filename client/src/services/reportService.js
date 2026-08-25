import api from './api';

const reportService = {
  getSalesReport: async (params) => {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  },
  getProductReport: async (params) => {
    const response = await api.get('/reports/products', { params });
    return response.data;
  },
  getCustomerReport: async (params) => {
    const response = await api.get('/reports/customers', { params });
    return response.data;
  },
  getEmployeeReport: async (params) => {
    const response = await api.get('/reports/employees', { params });
    return response.data;
  },
  getInventoryReport: async (params) => {
    const response = await api.get('/reports/inventory', { params });
    return response.data;
  },
  generateReport: async (type, params) => {
    const map = {
      sales: reportService.getSalesReport,
      products: reportService.getProductReport,
      customers: reportService.getCustomerReport,
      employees: reportService.getEmployeeReport,
      inventory: reportService.getInventoryReport,
    };
    const fn = map[type] || reportService.getSalesReport;
    const res = await fn(params);
    return res.data?.items || res.data?.data || res.data || [];
  }
};

export default reportService;
