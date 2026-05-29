import { Dialog } from './Dialog';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

/**
 * Reusable Deletion / Action Confirmation Modal Dialog
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This operation cannot be undone.',
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} size="sm" closeOnOverlayClick={!loading}>
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`p-3 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500`}>
          <AlertTriangle size={32} />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full mt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className="flex-1 rounded-xl"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
