import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import anime from 'animejs';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
}) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      anime({
        targets: overlayRef.current,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutExpo',
      });
      anime({
        targets: contentRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        translateY: [20, 0],
        duration: 400,
        easing: 'easeOutExpo',
      });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    anime({
      targets: overlayRef.current,
      opacity: 0,
      duration: 200,
      easing: 'easeInExpo',
    });
    anime({
      targets: contentRef.current,
      opacity: 0,
      scale: 0.95,
      duration: 200,
      easing: 'easeInExpo',
      complete: onClose,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeOnOverlay ? handleClose : undefined}
        style={{ opacity: 0 }}
      />
      <div
        ref={contentRef}
        className={`
          relative ${sizes[size]} w-full
          bg-midnight-light border border-steel-20
          rounded-2xl shadow-2xl
          max-h-[90vh] overflow-y-auto
        `}
        style={{ opacity: 0 }}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between p-6 pb-0">
            {title && (
              <h2 className="text-xl font-bold font-display text-white">{title}</h2>
            )}
            {showClose && (
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-steel-10 transition-colors text-steel hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
export { Modal };
