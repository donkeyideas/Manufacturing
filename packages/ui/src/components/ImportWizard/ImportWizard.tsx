import { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { StepIndicator } from './StepIndicator';
import { UploadStep } from './UploadStep';
import { MappingStep } from './MappingStep';
import { PreviewStep } from './PreviewStep';
import { ResultsStep } from './ResultsStep';

interface ImportFieldDefinition {
  fieldName: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
  required: boolean;
  enumValues?: string[];
  enumLabels?: Record<string, string>;
  min?: number;
  max?: number;
  maxLength?: number;
  defaultValue?: unknown;
  aliases: string[];
  helpText?: string;
}

interface ImportSchema {
  entityType: string;
  entityLabel: string;
  module: string;
  fields: ImportFieldDefinition[];
  apiEndpoint: string;
  templateFilename: string;
  description: string;
  migrationOrder: number;
}

interface ImportValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
  code: 'REQUIRED' | 'INVALID_TYPE' | 'INVALID_ENUM' | 'OUT_OF_RANGE' | 'TOO_LONG' | 'DUPLICATE';
}

interface ColumnMapping {
  sourceColumn: string;
  targetField: string | null;
  confidence: 'auto' | 'manual' | 'none';
}

interface ImportWizardProps {
  open: boolean;
  onClose: () => void;
  schema: ImportSchema;
  onImport: (data: Record<string, unknown>[]) => Promise<{ success: number; errors: ImportValidationError[] }>;
  onDownloadTemplate?: () => void;
  onParseFile: (file: File) => Promise<{ headers: string[]; rows: Record<string, string>[]; totalRows: number; fileName: string }>;
  onAutoMap: (headers: string[], schema: ImportSchema) => ColumnMapping[];
  onValidateRows: (rows: Record<string, string>[], mappings: ColumnMapping[], schema: ImportSchema) => { validData: Record<string, unknown>[]; errors: ImportValidationError[] };
}

const STEPS = ['Upload', 'Map Columns', 'Preview', 'Results'];

export function ImportWizard({
  open,
  onClose,
  schema,
  onImport,
  onDownloadTemplate,
  onParseFile,
  onAutoMap,
  onValidateRows,
}: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParseError] = useState<string>();

  // Step 0: Upload
  const [fileName, setFileName] = useState<string>();
  const [totalRows, setTotalRows] = useState<number>();
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);

  // Step 1: Mapping
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);

  // Step 2: Preview
  const [validData, setValidData] = useState<Record<string, unknown>[]>([]);
  const [validationErrors, setValidationErrors] = useState<ImportValidationError[]>([]);

  // Step 3: Results
  const [importResults, setImportResults] = useState<{ success: number; errors: ImportValidationError[] }>();

  useEffect(() => {
    if (!open) {
      // Reset wizard when closed
      setTimeout(() => {
        setCurrentStep(0);
        setIsLoading(false);
        setParseError(undefined);
        setFileName(undefined);
        setTotalRows(undefined);
        setParsedRows([]);
        setMappings([]);
        setValidData([]);
        setValidationErrors([]);
        setImportResults(undefined);
      }, 300);
    }
  }, [open]);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setParseError(undefined);
    try {
      const result = await onParseFile(file);
      setFileName(result.fileName);
      setTotalRows(result.totalRows);
      setParsedRows(result.rows);

      // Auto-map columns
      const autoMappings = onAutoMap(result.headers, schema);
      setMappings(autoMappings);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMapping = (index: number, targetField: string | null) => {
    const newMappings = [...mappings];
    newMappings[index] = {
      ...newMappings[index],
      targetField,
      confidence: targetField ? 'manual' : 'none',
    };
    setMappings(newMappings);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate before moving to preview
      const validation = onValidateRows(parsedRows, mappings, schema);
      setValidData(validation.validData);
      setValidationErrors(validation.errors);
    }

    if (currentStep === 2) {
      // Execute import
      setIsLoading(true);
      try {
        const results = await onImport(validData);
        setImportResults(results);
      } catch (error) {
        // Handle import error
        setImportResults({ success: 0, errors: [] });
      } finally {
        setIsLoading(false);
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const canProceed = (): boolean => {
    if (currentStep === 0) return !!fileName && !isLoading && !parseError;
    if (currentStep === 1) {
      const requiredFields = schema.fields.filter((f) => f.required);
      const mappedRequiredCount = requiredFields.filter((f) =>
        mappings.some((m) => m.targetField === f.fieldName)
      ).length;
      return mappedRequiredCount === requiredFields.length;
    }
    if (currentStep === 2) return validData.length > 0;
    return false;
  };

  const getNextButtonLabel = (): string => {
    if (currentStep === 2) return isLoading ? 'Importing...' : 'Import Data';
    return 'Next';
  };

  return (
    <Modal open={open} onClose={onClose} size="full">
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-xl font-semibold text-text-primary">
            Import {schema.entityLabel}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {currentStep < 3 && <div className="shrink-0"><StepIndicator currentStep={currentStep} steps={STEPS} /></div>}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {currentStep === 0 && (
            <UploadStep
              onFileSelect={handleFileSelect}
              fileName={fileName}
              totalRows={totalRows}
              isLoading={isLoading}
              error={parseError}
              onDownloadTemplate={onDownloadTemplate}
              entityLabel={schema.entityLabel}
            />
          )}

          {currentStep === 1 && (
            <MappingStep
              mappings={mappings}
              onUpdateMapping={handleUpdateMapping}
              schema={schema}
              sampleData={parsedRows.slice(0, 5)}
            />
          )}

          {currentStep === 2 && (
            <PreviewStep
              validData={validData}
              errors={validationErrors}
              schema={schema}
              totalRows={totalRows || 0}
            />
          )}

          {currentStep === 3 && importResults && (
            <ResultsStep
              successCount={importResults.success}
              errorCount={importResults.errors.length}
              errors={importResults.errors}
              entityLabel={schema.entityLabel}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-1 shrink-0">
          <div>
            {currentStep > 0 && currentStep < 3 && (
              <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {currentStep === 3 ? (
              <Button onClick={onClose}>Close</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                >
                  {getNextButtonLabel()}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
