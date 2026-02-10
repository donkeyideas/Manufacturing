import type { ImportSchema } from './types';

export const workCenterImportSchema: ImportSchema = {
  entityType: 'work-center',
  entityLabel: 'Work Centers',
  module: 'manufacturing',
  migrationOrder: 8,
  apiEndpoint: '/api/manufacturing/work-centers/import',
  templateFilename: 'work_centers_import_template.csv',
  description: 'Import manufacturing work centers with capacity and costing information',
  fields: [
    {
      fieldName: 'workCenterCode',
      label: 'Work Center Code',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Work Center Code', 'work_center_code', 'Code', 'WC Code', 'wc_code', 'Center Code'],
      helpText: 'Unique code identifying the work center'
    },
    {
      fieldName: 'workCenterName',
      label: 'Work Center Name',
      type: 'string',
      required: true,
      maxLength: 200,
      aliases: ['Work Center Name', 'work_center_name', 'Name', 'Description', 'Center Name'],
      helpText: 'Descriptive name of the work center'
    },
    {
      fieldName: 'description',
      label: 'Description',
      type: 'string',
      required: false,
      maxLength: 1000,
      aliases: ['Description', 'Notes', 'Comments', 'Details'],
      helpText: 'Additional details about the work center'
    },
    {
      fieldName: 'location',
      label: 'Location',
      type: 'string',
      required: false,
      maxLength: 100,
      aliases: ['Location', 'Site', 'Plant', 'Facility', 'Area'],
      helpText: 'Physical location of the work center'
    },
    {
      fieldName: 'hourlyRate',
      label: 'Hourly Rate',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Hourly Rate', 'hourly_rate', 'Rate', 'Cost Rate', 'cost_rate', 'Labor Rate'],
      helpText: 'Standard hourly cost rate for the work center'
    },
    {
      fieldName: 'efficiencyPercent',
      label: 'Efficiency Percent',
      type: 'number',
      required: false,
      min: 0,
      max: 200,
      defaultValue: 100,
      aliases: ['Efficiency Percent', 'efficiency_percent', 'Efficiency', 'Efficiency %', 'Utilization'],
      helpText: 'Expected efficiency percentage (100 = standard)'
    },
    {
      fieldName: 'capacityHoursPerDay',
      label: 'Capacity Hours Per Day',
      type: 'number',
      required: false,
      min: 0,
      defaultValue: 8,
      aliases: ['Capacity Hours Per Day', 'capacity_hours_per_day', 'Capacity', 'Daily Capacity', 'Hours Per Day'],
      helpText: 'Available production hours per day'
    },
    {
      fieldName: 'setupTimeMinutes',
      label: 'Setup Time Minutes',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Setup Time Minutes', 'setup_time_minutes', 'Setup Time', 'setup_time', 'Changeover Time'],
      helpText: 'Standard setup or changeover time in minutes'
    },
    {
      fieldName: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      required: false,
      defaultValue: true,
      aliases: ['Is Active', 'is_active', 'Active', 'Status', 'Enabled'],
      helpText: 'Whether the work center is currently operational'
    }
  ]
};
