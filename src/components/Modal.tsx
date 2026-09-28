import type { MouseEvent, ReactNode } from 'react'

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-dialog" role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  )
}

export default Modal
