import { useState, useEffect, useRef } from "react";
import { useSaveBar, useAppBridge, useToast, useModal, useFullscreen } from "@qumra/jisr";

const defaultSettings = {
  storeName: "My Qumra Store",
  email: "admin@example.com",
  language: "ar",
  notifications: true,
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [savedSettings, setSavedSettings] = useState(defaultSettings);

  const saveBar = useSaveBar();
  const bridge = useAppBridge();
  const toast = useToast();
  const modal = useModal();
  const fullscreen = useFullscreen();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const isDirty =
    settings.storeName !== savedSettings.storeName ||
    settings.email !== savedSettings.email ||
    settings.language !== savedSettings.language ||
    settings.notifications !== savedSettings.notifications;

  useEffect(() => {
    if (isDirty) {
      saveBar.show({
        onSave: async ({ error, complete }) => {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setSavedSettings(settings);
          toast.show({
            message: "Settings saved successfully",
            variant: "success",
          });
          complete();
        },
        onDiscard: () => setSettings(savedSettings),
      });
    } else {
      saveBar.hide();
    }
  }, [isDirty, saveBar]);

  const settingsRef = useRef(settings);
  const savedSettingsRef = useRef(savedSettings);
  settingsRef.current = settings;
  savedSettingsRef.current = savedSettings;

  const update = (field: keyof typeof settings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const [user, setUser] = useState<{ name: string; email: string; id: number } | null>(null);

  const handleShowModal = () => {
    modal.show({
      title: 'حذف المنتج؟',
      message: 'هذا الإجراء لا يمكن التراجع عنه',
      primaryAction: { label: 'حذف', variant: 'destructive' },
      secondaryAction: { label: 'إلغاء' },
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        modal.hide();
      },
      onCancel: () => {},
    });
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      fullscreen.exit();
    } else {
      fullscreen.enter();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f9fb]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              الإعدادات
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              إدارة إعدادات المتجر والتفضيلات العامة
            </p>
          </div>
          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`group relative inline-flex items-center gap-2.5 px-4 h-10 text-sm font-medium rounded-xl
              border transition-all duration-300 ease-out cursor-pointer
              ${isFullscreen
                ? "bg-gradient-to-b from-violet-500 to-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-400 hover:to-violet-500"
                : "bg-white text-gray-600 border-gray-200 shadow-sm hover:border-violet-300 hover:text-violet-600 hover:shadow-md hover:shadow-violet-500/10"
              }`}
          >
            <span className={`transition-transform duration-300 ease-out ${isFullscreen ? "rotate-180" : "group-hover:scale-110"}`}>
              {isFullscreen ? (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </span>
            <span>{isFullscreen ? "تصغير" : "ملء الشاشة"}</span>
            {!isFullscreen && (
              <span className="absolute -top-1 -left-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
              </span>
            )}
          </button>
        </div>

        {/* Store Info Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm mb-5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
              </div>
              <h2 className="text-[15px] font-semibold text-gray-800">معلومات المتجر</h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                اسم المتجر
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => update("storeName", e.target.value)}
                className="w-full h-10 px-3.5 text-sm bg-white border border-gray-300 rounded-lg
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                  transition-all duration-150"
                placeholder="أدخل اسم المتجر"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                dir="ltr"
                value={settings.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full h-10 px-3.5 text-sm bg-white border border-gray-300 rounded-lg
                  text-gray-900 placeholder-gray-400 text-left
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                  transition-all duration-150"
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm mb-5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <h2 className="text-[15px] font-semibold text-gray-800">التفضيلات</h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                لغة الواجهة
              </label>
              <div className="relative">
                <select
                  value={settings.language}
                  onChange={(e) => update("language", e.target.value)}
                  className="w-full h-10 px-3.5 text-sm bg-white border border-gray-300 rounded-lg
                    text-gray-900 appearance-none cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                    transition-all duration-150"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                  <option value="fr">Fran&ccedil;ais</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">الإشعارات</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    استقبال تنبيهات بالطلبات الجديدة والتحديثات
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.notifications}
                  onClick={() => update("notifications", !settings.notifications)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2
                    ${settings.notifications ? "bg-emerald-500" : "bg-gray-200"}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0
                      transition-transform duration-200 ease-in-out
                      ${settings.notifications ? "-translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dev Tools Card */}
        <div className="bg-white rounded-xl border border-dashed border-gray-300 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-800">أدوات التطوير</h2>
                <p className="text-xs text-gray-400">للاختبار فقط</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 space-y-3">
            {/* Login/Logout */}
            <div className="flex items-center gap-3">
              {!user ? (
                <button
                  onClick={() => setUser({ name: "John Doe", email: "john.doe@example.com", id: 1 })}
                  className="inline-flex items-center gap-2 px-4 h-9 text-sm font-medium
                    bg-emerald-500 text-white rounded-lg
                    hover:bg-emerald-600 active:bg-emerald-700
                    transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  تسجيل الدخول
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 px-3 h-9 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-700">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{user.name}</span>
                  </div>
                  <button
                    onClick={() => setUser(null)}
                    className="inline-flex items-center gap-2 px-4 h-9 text-sm font-medium
                      text-red-600 bg-red-50 rounded-lg border border-red-200
                      hover:bg-red-100 active:bg-red-200
                      transition-colors duration-150"
                  >
                    تسجيل الخروج
                  </button>
                </>
              )}
            </div>

            {/* Modal Test */}
            <button
              type="button"
              onClick={handleShowModal}
              className="inline-flex items-center gap-2 px-4 h-9 text-sm font-medium
                text-amber-700 bg-amber-50 rounded-lg border border-amber-200
                hover:bg-amber-100 active:bg-amber-200
                transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              اختبار المودال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
