// server/prisma/seed.js
// Seed file — configures initial ADMIN account and base sample data

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Hash Admin Password securely
  const adminPass = await bcrypt.hash('wale@123', 12);

  // ── Admin User (Single Admin Account configuration)
  const existingOldAdmin = await prisma.user.findUnique({ where: { email: 'admin@bms.com' } });
  let adminUser;

  if (existingOldAdmin) {
    adminUser = await prisma.user.update({
      where: { id: existingOldAdmin.id },
      data: {
        email: 'swale4126@gmail.com',
        password: adminPass,
        role: 'ADMIN',
        firstName: 'System',
        lastName: 'Admin',
      },
    });
  } else {
    adminUser = await prisma.user.upsert({
      where: { email: 'swale4126@gmail.com' },
      update: {
        password: adminPass,
        role: 'ADMIN',
        firstName: 'System',
        lastName: 'Admin',
      },
      create: {
        email: 'swale4126@gmail.com',
        password: adminPass,
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
        phone: '+1-555-0100',
      },
    });
  }

  console.log('✅ Admin user configured: swale4126@gmail.com');

  // ── Admin Employee Record
  await prisma.employee.upsert({
    where: { userId: adminUser.id },
    update: {
      department: 'Management',
      position: 'System Administrator',
    },
    create: {
      userId: adminUser.id,
      employeeId: 'EMP001',
      department: 'Management',
      position: 'System Administrator',
      hireDate: new Date('2022-01-01'),
      status: 'ACTIVE',
    },
  });

  console.log('✅ Admin employee profile configured');

  // ── Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Electronics' }, update: {}, create: { name: 'Electronics', description: 'Electronic devices and accessories' } }),
    prisma.category.upsert({ where: { name: 'Office Supplies' }, update: {}, create: { name: 'Office Supplies', description: 'Stationery and office materials' } }),
    prisma.category.upsert({ where: { name: 'Furniture' }, update: {}, create: { name: 'Furniture', description: 'Office and home furniture' } }),
    prisma.category.upsert({ where: { name: 'Food & Beverages' }, update: {}, create: { name: 'Food & Beverages', description: 'Consumable food and drinks' } }),
    prisma.category.upsert({ where: { name: 'Clothing' }, update: {}, create: { name: 'Clothing', description: 'Apparel and accessories' } }),
  ]);

  console.log('✅ Categories created');

  // ── Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { email: 'tech@supplierco.com' },
      update: {},
      create: { name: 'TechSupply Co.', email: 'tech@supplierco.com', phone: '+1-555-0200', contactPerson: 'Alice Brown', city: 'New York', country: 'USA' },
    }),
    prisma.supplier.upsert({
      where: { email: 'office@globalmart.com' },
      update: {},
      create: { name: 'GlobalMart Supplies', email: 'office@globalmart.com', phone: '+1-555-0201', contactPerson: 'Bob Wilson', city: 'Los Angeles', country: 'USA' },
    }),
    prisma.supplier.upsert({
      where: { email: 'furniture@homepro.com' },
      update: {},
      create: { name: 'HomePro Furniture', email: 'furniture@homepro.com', phone: '+1-555-0202', contactPerson: 'Carol Davis', city: 'Chicago', country: 'USA' },
    }),
  ]);

  console.log('✅ Suppliers created');

  // ── Products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'ELEC-001' },
      update: {},
      create: {
        name: 'Laptop ProMax 15"', sku: 'ELEC-001', barcode: '100000001',
        categoryId: categories[0].id, supplierId: suppliers[0].id,
        description: 'High-performance laptop for professionals',
        buyingPrice: 850.00, sellingPrice: 1199.99, quantity: 45, minStock: 5,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC-002' },
      update: {},
      create: {
        name: 'Wireless Mouse X200', sku: 'ELEC-002', barcode: '100000002',
        categoryId: categories[0].id, supplierId: suppliers[0].id,
        description: 'Ergonomic wireless mouse',
        buyingPrice: 18.00, sellingPrice: 34.99, quantity: 150, minStock: 20,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC-003' },
      update: {},
      create: {
        name: 'USB-C Hub 7-in-1', sku: 'ELEC-003', barcode: '100000003',
        categoryId: categories[0].id, supplierId: suppliers[0].id,
        description: '7-port USB-C hub with HDMI and charging',
        buyingPrice: 22.00, sellingPrice: 49.99, quantity: 80, minStock: 10,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'OFF-001' },
      update: {},
      create: {
        name: 'A4 Copy Paper (500 sheets)', sku: 'OFF-001', barcode: '100000004',
        categoryId: categories[1].id, supplierId: suppliers[1].id,
        description: '80gsm premium copy paper',
        buyingPrice: 4.50, sellingPrice: 8.99, quantity: 500, minStock: 50,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'OFF-002' },
      update: {},
      create: {
        name: 'Ballpoint Pens (Box of 12)', sku: 'OFF-002', barcode: '100000005',
        categoryId: categories[1].id, supplierId: suppliers[1].id,
        description: 'Smooth writing black ballpoint pens',
        buyingPrice: 2.00, sellingPrice: 4.99, quantity: 3, minStock: 10,
        status: 'ACTIVE',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'FURN-001' },
      update: {},
      create: {
        name: 'Ergonomic Office Chair', sku: 'FURN-001', barcode: '100000006',
        categoryId: categories[2].id, supplierId: suppliers[2].id,
        description: 'Lumbar support, adjustable height office chair',
        buyingPrice: 120.00, sellingPrice: 249.99, quantity: 20, minStock: 3,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'FURN-002' },
      update: {},
      create: {
        name: 'Standing Desk 160cm', sku: 'FURN-002', barcode: '100000007',
        categoryId: categories[2].id, supplierId: suppliers[2].id,
        description: 'Electric height-adjustable standing desk',
        buyingPrice: 280.00, sellingPrice: 499.99, quantity: 8, minStock: 2,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC-004' },
      update: {},
      create: {
        name: 'Mechanical Keyboard RGB', sku: 'ELEC-004', barcode: '100000008',
        categoryId: categories[0].id, supplierId: suppliers[0].id,
        description: 'TKL mechanical keyboard with RGB backlight',
        buyingPrice: 45.00, sellingPrice: 89.99, quantity: 60, minStock: 10,
      },
    }),
  ]);

  console.log('✅ Products created');

  // ── Customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'alice@acmecorp.com' },
      update: {},
      create: { name: 'Alice Johnson', email: 'alice@acmecorp.com', phone: '+1-555-0300', city: 'New York', country: 'USA' },
    }),
    prisma.customer.upsert({
      where: { email: 'bob@techfirm.com' },
      update: {},
      create: { name: 'Bob Martinez', email: 'bob@techfirm.com', phone: '+1-555-0301', city: 'San Francisco', country: 'USA' },
    }),
    prisma.customer.upsert({
      where: { email: 'carol@startup.io' },
      update: {},
      create: { name: 'Carol Williams', email: 'carol@startup.io', phone: '+1-555-0302', city: 'Austin', country: 'USA' },
    }),
    prisma.customer.upsert({
      where: { email: 'david@enterprise.com' },
      update: {},
      create: { name: 'David Lee', email: 'david@enterprise.com', phone: '+1-555-0303', city: 'Chicago', country: 'USA' },
    }),
  ]);

  console.log('✅ Customers created');

  // ── Sample Sales
  const existingSalesCount = await prisma.sale.count();
  if (existingSalesCount === 0) {
    const sale1 = await prisma.sale.create({
      data: {
        invoiceNumber: 'INV-2024-0001',
        customerId: customers[0].id,
        createdById: adminUser.id,
        subtotal: 1284.97,
        taxRate: 10,
        taxAmount: 128.50,
        discountAmount: 0,
        totalAmount: 1413.47,
        status: 'COMPLETED',
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        saleItems: {
          create: [
            { productId: products[0].id, productName: products[0].name, quantity: 1, unitPrice: 1199.99, total: 1199.99 },
            { productId: products[1].id, productName: products[1].name, quantity: 2, unitPrice: 34.99, total: 69.98 },
            { productId: products[2].id, productName: products[2].name, quantity: 1, unitPrice: 49.99, total: 49.99 },
          ],
        },
        payments: {
          create: { amount: 1413.47, method: 'CARD' },
        },
      },
    });

    const sale2 = await prisma.sale.create({
      data: {
        invoiceNumber: 'INV-2024-0002',
        customerId: customers[1].id,
        createdById: adminUser.id,
        subtotal: 339.97,
        taxRate: 10,
        taxAmount: 34.00,
        discountAmount: 20,
        totalAmount: 353.97,
        status: 'COMPLETED',
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        saleItems: {
          create: [
            { productId: products[5].id, productName: products[5].name, quantity: 1, unitPrice: 249.99, total: 249.99 },
            { productId: products[7].id, productName: products[7].name, quantity: 1, unitPrice: 89.99, total: 89.99 },
          ],
        },
        payments: {
          create: { amount: 353.97, method: 'CASH' },
        },
      },
    });

    const sale3 = await prisma.sale.create({
      data: {
        invoiceNumber: 'INV-2024-0003',
        customerId: customers[2].id,
        createdById: adminUser.id,
        subtotal: 499.99,
        taxRate: 10,
        taxAmount: 50.00,
        discountAmount: 0,
        totalAmount: 549.99,
        status: 'COMPLETED',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PAID',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        saleItems: {
          create: [
            { productId: products[6].id, productName: products[6].name, quantity: 1, unitPrice: 499.99, total: 499.99 },
          ],
        },
        payments: {
          create: { amount: 549.99, method: 'BANK_TRANSFER' },
        },
      },
    });

    console.log('✅ Sales created');

    // ── Stock movement records for sales
    await prisma.stockMovement.createMany({
      data: [
        { productId: products[0].id, type: 'SALE', quantity: 1, previousQty: 46, newQty: 45, reference: sale1.id, reason: 'Sale completed' },
        { productId: products[1].id, type: 'SALE', quantity: 2, previousQty: 152, newQty: 150, reference: sale1.id, reason: 'Sale completed' },
        { productId: products[2].id, type: 'SALE', quantity: 1, previousQty: 81, newQty: 80, reference: sale1.id, reason: 'Sale completed' },
        { productId: products[5].id, type: 'SALE', quantity: 1, previousQty: 21, newQty: 20, reference: sale2.id, reason: 'Sale completed' },
        { productId: products[7].id, type: 'SALE', quantity: 1, previousQty: 61, newQty: 60, reference: sale2.id, reason: 'Sale completed' },
        { productId: products[6].id, type: 'SALE', quantity: 1, previousQty: 9, newQty: 8, reference: sale3.id, reason: 'Sale completed' },
      ],
    });
  }

  // ── Notifications (Low stock)
  await prisma.notification.createMany({
    data: [
      { userId: adminUser.id, type: 'LOW_STOCK', title: 'Low Stock Alert', message: 'Ballpoint Pens are running low (3 remaining, min: 10)', data: { productId: products[4].id } },
    ],
  });

  console.log('✅ Notifications created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Admin Login Credentials:');
  console.log('  Admin:   swale4126@gmail.com / wale@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
