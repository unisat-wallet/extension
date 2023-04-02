/* eslint-disable indent */
import React, { useCallback, useContext, useRef, useState } from 'react';

import { Loading } from './Loading';
import { Toast, ToastPresets, ToastProps } from './Toast';

type ToastFunction = (content: string) => void;
type LoadingFunction = (visible: boolean, content?: string) => void;
interface ContextType {
  toast: ToastFunction;
  toastSuccess: ToastFunction;
  toastError: ToastFunction;
  toastWarning: ToastFunction;
  showLoading: LoadingFunction;
}

const initContext = {
  toast: (content: string) => {
    // todo
  },
  toastSuccess: (content: string) => {
    // todo
  },
  toastError: (content: string) => {
    // todo
  },
  toastWarning: (content: string) => {
    // todo
  },
  showLoading: () => {
    // todo
  }
};

const ActionComponentContext = React.createContext<ContextType>(initContext);

function ToastContainer({ handler }: { handler: ContextType }) {
  const [toasts, setToasts] = useState<{ key: string; props: ToastProps }[]>([]);

  const selfRef = useRef<{ toasts: { key: string; props: ToastProps }[] }>({
    toasts: []
  });
  const self = selfRef.current;
  const basicToast = useCallback(
    (content: string, preset?: ToastPresets) => {
      const key = 'Toast_' + Math.random();
      self.toasts.push({
        key,
        props: {
          preset: preset || 'info',
          content,
          onClose: () => {
            self.toasts = self.toasts.filter((v) => v.key !== key);
            setToasts(self.toasts.map((v) => v));
          }
        }
      });
      setToasts(self.toasts.map((v) => v));
    },
    [toasts]
  );

  handler.toast = useCallback(
    (content: string) => {
      basicToast(content);
    },
    [basicToast]
  );

  handler.toastSuccess = useCallback(
    (content: string) => {
      basicToast(content, 'success');
    },
    [basicToast]
  );

  handler.toastError = useCallback(
    (content: string) => {
      basicToast(content, 'error');
    },
    [basicToast]
  );

  handler.toastWarning = useCallback(
    (content: string) => {
      basicToast(content, 'warning');
    },
    [basicToast]
  );

  return (
    <div>
      {toasts.map(({ key, props }) => (
        <Toast key={key} {...props} />
      ))}
    </div>
  );
}

function LoadingContainer({ handler }: { handler: ContextType }) {
  const [loadingInfo, setLoadingInfo] = useState<{ visible: boolean; content?: string }>({
    visible: false,
    content: ''
  });
  handler.showLoading = useCallback((visible: boolean, content?: string) => {
    setLoadingInfo({ visible, content });
  }, []);
  if (loadingInfo.visible) {
    return <Loading text={loadingInfo.content} />;
  } else {
    return <div />;
  }
}

export function ActionComponentProvider({ children }: { children: React.ReactNode }) {
  const selfRef = useRef<ContextType>(initContext);
  const self = selfRef.current;

  return (
    <ActionComponentContext.Provider value={self}>
      {children}
      <ToastContainer handler={self} />
      <LoadingContainer handler={self} />
    </ActionComponentContext.Provider>
  );
}

export function useTools() {
  const ctx = useContext(ActionComponentContext);
  return ctx;
}
