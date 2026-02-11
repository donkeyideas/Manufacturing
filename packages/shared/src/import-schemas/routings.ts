import type { ImportSchema } from './types';

export const routingImportSchema: ImportSchema = {
  entityType: 'routing',
  entityLabel: 'Routings',
  module: 'manufacturing',
  migrationOrder: 10,
  apiEndpoint: '/api/manufacturing/routings/import',
  templateFilename: 'routings_import_template.csv',
  description: 'Import manufacturing routings defining production operations and sequences',
  dependencies: ['work-center'],
  fields: [
    {
      fieldName: 'routingNumber',
      label: 'Routing Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Routing Number', 'routing_number', 'Routing #', 'Routing ID', 'routing_id', 'RoutingNo'],
      helpText: 'Unique identifier for the routing'
    },
    {
      fieldName: 'routingName',
      label: 'Routing Name',
      type: 'string',
      required: true,
      maxLength: 200,
      aliases: ['Routing Name', 'routing_name', 'Name', 'Description', 'Routing Description'],
      helpText: 'Descriptive name of the routing'
    },
    {
      fieldName: 'finishedItemNumber',
      label: 'Finished Item Number',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Finished Item Number', 'finished_item_number', 'Item Number', 'item_number', 'Part Number', 'SKU'],
      helpText: 'Item number this routing produces'
    },
    {
      fieldName: 'operationSequence',
      label: 'Operation Sequence',
      type: 'number',
      required: true,
      min: 1,
      aliases: ['Operation Sequence', 'operation_sequence', 'Sequence', 'Seq', 'Step', 'Op Seq'],
      helpText: 'Sequential order of this operation in the routing'
    },
    {
      fieldName: 'operationName',
      label: 'Operation Name',
      type: 'string',
      required: true,
      maxLength: 200,
      aliases: ['Operation Name', 'operation_name', 'Operation', 'Step Name', 'step_name', 'Process'],
      helpText: 'Name or description of the operation'
    },
    {
      fieldName: 'workCenterCode',
      label: 'Work Center Code',
      type: 'string',
      required: true,
      maxLength: 50,
      aliases: ['Work Center Code', 'work_center_code', 'Work Center', 'work_center', 'WC Code', 'wc_code'],
      helpText: 'Code of the work center where operation is performed'
    },
    {
      fieldName: 'setupTime',
      label: 'Setup Time',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Setup Time', 'setup_time', 'Setup', 'Setup Minutes', 'setup_minutes', 'Changeover Time'],
      helpText: 'Setup time in minutes for this operation'
    },
    {
      fieldName: 'runTime',
      label: 'Run Time',
      type: 'number',
      required: false,
      min: 0,
      aliases: ['Run Time', 'run_time', 'Runtime', 'Cycle Time', 'cycle_time', 'Process Time'],
      helpText: 'Run time in minutes per unit for this operation'
    },
    {
      fieldName: 'description',
      label: 'Description',
      type: 'string',
      required: false,
      maxLength: 1000,
      aliases: ['Description', 'Notes', 'Instructions', 'Comments', 'Details'],
      helpText: 'Detailed instructions or notes for the operation'
    }
  ]
};
