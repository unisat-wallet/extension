/* eslint-disable indent */
import React, { useCallback, useRef, useState } from 'react';

import { ToolsContext, ToolsContextType, useI18n } from '@unisat/wallet-state';
import { Loading } from '../components/ActionComponent/Loading';
import { Tip } from '../components/ActionComponent/Tip';
import { Toast, ToastPresets, ToastProps } from '../components/ActionComponent/Toast';
import { copyToClipboard } from '../utils';

type ToastFunction = (content: string) => void;
type LoadingFunction = (visible: boolean, content?: string) => void;

function ToastContainer({ handler }: { handler: ToolsContextType }) {
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

function LoadingContainer({ handler }: { handler: ToolsContextType }) {
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

function TipContainer({ handler }: { handler: ToolsContextType }) {
  const [tipData, setTipData] = useState<{ visible: boolean; content: string }>({
    visible: false,
    content: ''
  });
  handler.showTip = useCallback((content: string) => {
    setTipData({ content, visible: true });
  }, []);
  if (tipData.visible) {
    return (
      <Tip
        text={tipData.content}
        onClose={() => {
          setTipData({ visible: false, content: '' });
        }}
      />
    );
  } else {
    return <div />;
  }
}

function CopyContainer({ handler }: { handler: ToolsContextType }) {
  const { t } = useI18n();
  handler.copyToClipboard = useCallback((text: string) => {
    copyToClipboard(text).then(() => {
      handler.toastSuccess(t('copied'));
    });
  }, []);
  return <div />;
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
  },
  showTip: (content: string) => {
    // todo
  },
  copyToClipboard: (text: string) => {
    // todo
  },
  openUrl: (url: string) => {
    window.open(url);
  }
};

export function ToolsProvider({ children }: { children: React.ReactNode }) {
  const selfRef = useRef<ToolsContextType>(initContext);
  const self = selfRef.current;

  return (
    <ToolsContext.Provider value={self}>
      {children}
      <ToastContainer handler={self} />
      <LoadingContainer handler={self} />
      <TipContainer handler={self} />
      <CopyContainer handler={self} />
    </ToolsContext.Provider>
  );
}
