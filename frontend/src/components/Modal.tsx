import React from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
        <div>{children}</div>
        {footer && <div className="row" style={{ justifyContent: "flex-end" }}>{footer}</div>}
      </div>
    </div>
  );
}
