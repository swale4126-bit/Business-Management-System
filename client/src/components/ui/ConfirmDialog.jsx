import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { HiExclamationTriangle } from 'react-icons/hi2';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="flex flex-col items-center text-center gap-5 py-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-red-50 dark:bg-red-500/10 ring-1 ring-red-500/20' : 'bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-500/20'}`}>
          <HiExclamationTriangle className={`w-7 h-7 ${isDanger ? 'text-red-500' : 'text-amber-500'}`} />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
