import React, { useState, useEffect } from 'react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appId: string, apiKey: string) => void;
  initialAppId: string;
  initialApiKey: string;
}

const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAppId,
  initialApiKey,
}) => {
  const [appId, setAppId] = useState(initialAppId);
  const [apiKey, setApiKey] = useState(initialApiKey);

  useEffect(() => {
    if (isOpen) {
      setAppId(initialAppId);
      setApiKey(initialApiKey);
    }
  }, [isOpen, initialAppId, initialApiKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">API 设置</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block text-left">
              App ID
            </label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value.trim())}
              placeholder="例如: 2299946121"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block text-left">
              API Key (Token)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value.trim())}
              placeholder="例如: 581f28b7-xxxx..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <p className="text-xs text-left text-gray-400">
            您的凭证仅保存在本地浏览器中，绝不会上传。如果是V3接口报错 "app key not found"，请确保填写了正确的App ID。
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
          >
            取消
          </button>
          <button
            onClick={() => onSave(appId, apiKey)}
            disabled={!appId || !apiKey}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            保存并应用
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsModal;