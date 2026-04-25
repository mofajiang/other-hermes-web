import { useState } from 'react';
import { X, Copy, Link, Lock, Clock, Globe } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ShareSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle?: string;
}

export function ShareSettingsModal({ isOpen, onClose, sessionTitle }: ShareSettingsModalProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState('7d');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    const id = 'demo-id';
    const link = `${window.location.origin}/share/${id}`;
    setShareLink(link);
    setIsPublic(true);
  };

  const handleUnshare = () => {
    setShareLink('');
    setIsPublic(false);
    setPassword('');
  };

  const handleCopy = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl border border-dark-border-default bg-dark-bg-secondary shadow-modal animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border-subtle">
          <h2 className="text-sm font-medium text-dark-text-primary">分享会话</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-dark-bg-tertiary text-dark-text-tertiary transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {sessionTitle && (
            <p className="text-xs text-dark-text-tertiary">会话：{sessionTitle}</p>
          )}

          {!isPublic ? (
            <>
              {/* Password */}
              <div>
                <label className="flex items-center gap-1.5 text-xs text-dark-text-secondary mb-1">
                  <Lock size={12} />
                  访问密码（可选）
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="留空则无需密码"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md bg-dark-bg-tertiary border border-dark-border-default outline-none focus:border-accent-blue text-dark-text-primary placeholder:text-dark-text-tertiary"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="flex items-center gap-1.5 text-xs text-dark-text-secondary mb-1">
                  <Clock size={12} />
                  过期时间
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md bg-dark-bg-tertiary border border-dark-border-default outline-none focus:border-accent-blue text-dark-text-primary"
                >
                  <option value="1h">1 小时</option>
                  <option value="1d">1 天</option>
                  <option value="7d">7 天</option>
                  <option value="30d">30 天</option>
                  <option value="never">永不过期</option>
                </select>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 w-full justify-center px-3 py-2 rounded-md bg-accent-blue/15 text-accent-blue text-xs font-medium hover:bg-accent-blue/25 transition-colors"
              >
                <Globe size={14} />
                创建分享链接
              </button>
            </>
          ) : (
            <>
              {/* Share link */}
              <div>
                <label className="text-xs text-dark-text-secondary mb-1 block">分享链接</label>
                <div className="flex items-center gap-1.5">
                  <input
                    readOnly
                    value={shareLink}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-md bg-dark-bg-tertiary border border-dark-border-default text-dark-text-primary font-mono"
                  />
                  <button
                    onClick={handleCopy}
                    className={cn(
                      'px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                      copied
                        ? 'bg-accent-green/15 text-accent-green'
                        : 'bg-dark-bg-tertiary text-dark-text-secondary hover:text-dark-text-primary border border-dark-border-default'
                    )}
                  >
                    {copied ? '已复制' : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {password && (
                <p className="text-2xs text-dark-text-tertiary">需要密码访问</p>
              )}

              <button
                onClick={handleUnshare}
                className="flex items-center gap-1.5 w-full justify-center px-3 py-2 rounded-md bg-accent-red/15 text-accent-red text-xs font-medium hover:bg-accent-red/25 transition-colors"
              >
                <Link size={14} className="rotate-45" />
                取消分享
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
