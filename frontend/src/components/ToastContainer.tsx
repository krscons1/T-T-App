import React from 'react';

type Toast = {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
};

type Props = {
  toasts: Toast[];
  removeToast: (id: number) => void;
};

const toastTypeStyles: Record<string, string> = {
  info: 'bg-tamil-yellow text-white border-tamil-orange',
  success: 'bg-success text-white border-tamil-orange',
  error: 'bg-error text-white border-tamil-orange',
};

const ToastContainer: React.FC<Props> = ({ toasts, removeToast }) => (
  <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 items-end" id="toastContainer">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`min-w-[220px] max-w-xs px-4 py-3 rounded-lg shadow-glass border-l-4 cursor-pointer transition-all duration-300 animate-slide-up ${toastTypeStyles[toast.type]}`}
        onClick={() => removeToast(toast.id)}
      >
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    ))}
  </div>
);

export default ToastContainer; 