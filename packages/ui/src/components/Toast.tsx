import toast, { Toaster as HotToaster } from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export { toast };

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className:
          '!bg-surface-1 !text-text-primary !border !border-border !shadow-lg !rounded-lg !text-sm',
        success: {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        },
        error: {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          duration: 6000,
        },
      }}
    />
  );
}

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) =>
    toast(message, {
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    }),
  info: (message: string) =>
    toast(message, {
      icon: <Info className="h-4 w-4 text-sky-500" />,
    }),
};
