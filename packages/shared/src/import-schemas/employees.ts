import type { ImportSchema } from './types';

export const employeeImportSchema: ImportSchema = {
  entityType: 'employee',
  entityLabel: 'Employees',
  module: 'hr',
  migrationOrder: 4,
  apiEndpoint: '/api/hr/employees/import',
  templateFilename: 'employees_import_template.csv',
  description: 'Import employee master data including compensation and employment details',
  fields: [
    {
      fieldName: 'employeeNumber',
      label: 'Employee Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Employee Number', 'employee_number', 'Employee #', 'Employee ID', 'employee_id', 'EmpNo'],
      helpText: 'Unique identifier for the employee'
    },
    {
      fieldName: 'firstName',
      label: 'First Name',
      type: 'string',
      required: true,
      maxLength: 100,
      aliases: ['First Name', 'first_name', 'FirstName', 'Given Name', 'given_name'],
      helpText: 'Employee first or given name'
    },
    {
      fieldName: 'lastName',
      label: 'Last Name',
      type: 'string',
      required: true,
      maxLength: 100,
      aliases: ['Last Name', 'last_name', 'LastName', 'Surname', 'Family Name', 'family_name'],
      helpText: 'Employee last or family name'
    },
    {
      fieldName: 'email',
      label: 'Email',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Email', 'Email Address', 'email_address', 'Work Email', 'work_email'],
      helpText: 'Work email address'
    },
    {
      fieldName: 'phone',
      label: 'Phone',
      type: 'string',
      required: false,
      maxLength: 50,
      aliases: ['Phone', 'Phone Number', 'phone_number', 'Work Phone', 'work_phone', 'Tel'],
      helpText: 'Primary phone number'
    },
    {
      fieldName: 'hireDate',
      label: 'Hire Date',
      type: 'date',
      required: true,
      aliases: ['Hire Date', 'hire_date', 'Start Date', 'start_date', 'Employment Start Date'],
      helpText: 'Date the employee started employment'
    },
    {
      fieldName: 'department',
      label: 'Department',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Department', 'Dept', 'Division', 'Cost Center', 'cost_center'],
      helpText: 'Department or division the employee works in'
    },
    {
      fieldName: 'jobTitle',
      label: 'Job Title',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Job Title', 'job_title', 'Title', 'Position', 'Role'],
      helpText: 'Employee job title or position'
    },
    {
      fieldName: 'employmentType',
      label: 'Employment Type',
      type: 'enum',
      required: false,
      enumValues: ['full_time', 'part_time', 'contractor', 'temporary'],
      enumLabels: {
        full_time: 'Full Time',
        part_time: 'Part Time',
        contractor: 'Contractor',
        temporary: 'Temporary'
      },
      aliases: ['Employment Type', 'employment_type', 'Type', 'Status', 'Employment Status'],
      helpText: 'Type of employment relationship'
    },
    {
      fieldName: 'salary',
      label: 'Salary',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Salary', 'Annual Salary', 'annual_salary', 'Compensation'],
      helpText: 'Annual salary for salaried employees'
    },
    {
      fieldName: 'hourlyRate',
      label: 'Hourly Rate',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Hourly Rate', 'hourly_rate', 'Hourly Pay', 'hourly_pay', 'Rate'],
      helpText: 'Hourly wage for hourly employees'
    },
    {
      fieldName: 'payFrequency',
      label: 'Pay Frequency',
      type: 'enum',
      required: false,
      enumValues: ['weekly', 'biweekly', 'semimonthly', 'monthly'],
      enumLabels: {
        weekly: 'Weekly',
        biweekly: 'Bi-Weekly',
        semimonthly: 'Semi-Monthly',
        monthly: 'Monthly'
      },
      aliases: ['Pay Frequency', 'pay_frequency', 'Payroll Frequency', 'payroll_frequency', 'Pay Period'],
      helpText: 'How often the employee is paid'
    }
  ]
};
