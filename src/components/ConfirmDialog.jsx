import { Dialog } from './Dialog';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen, onClose, onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This cannot be undone.',
  confirmText = 'Delete', cancelText = 'Cancel',
  variant = 'danger', loading = false,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} size="sm" closeOnOverlayClick={!loading}>
      <div className="flex flex-col gap-5 py-1">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-red-100">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pt-1.5">{message}</p>
        </div>
        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
