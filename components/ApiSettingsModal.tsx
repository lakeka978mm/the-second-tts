import React, { useState, useEffect } from 'react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  initialApiKey: string;
}

const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialApiKey
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey);

  useEffect(() => {
    setApiKey(initialApiKey);
  }, [initialApiKey, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-gray-900 mb-1">豆包语音设置</h2>
        <p className="text-sm text-gray-500 mb-6">
          配置你的豆包语音 API Key，用于语音合成服务。
          <br/>
          <a href="https://console.volcengine.com/speech/service/8" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            前往火山引擎控制台获取 →
          </a>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="输入你的 API Key"
            />
            <p className="mt-1 text-xs text-gray-400">API Key 将保存在本地浏览器中，不会上传到任何服务器</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onSave(apiKey)}
            disabled={!apiKey.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-active transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsModal;