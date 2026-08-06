import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div 
        className="w-[490px] max-w-full bg-[#0d1425] border border-white/5 rounded-xl shadow-glass p-5 flex flex-col gap-4 animate-[zoomIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="font-heading font-extrabold text-[15px] text-white flex items-center gap-2">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-emergencyRed transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="text-[13px] text-slate-300">
          {children}
        </div>

      </div>
    </div>
  );
}
