import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { useSaveBar, useToast, useModal } from "@qumra/jisr";
import { authenticate } from "~/qumra.server";
import prisma from "../../prisma/lib/prisma";

// ─── GraphQL Mutations ───────────────────────────────────────────────

const CREATE_WEB_PIXEL = `
  mutation CreateWebPixel($input: CreateWebPixelInput!) {
    createWebPixel(input: $input) {
      success
      message
      data {
        _id
      }
    }
  }
`;

const UPDATE_WEB_PIXEL = `
  mutation UpdateWebPixel($pixelId: String!, $input: UpdateWebPixelInput!) {
    updateWebPixel(pixelId: $pixelId, input: $input) {
      success
      message
      data {
        _id
      }
    }
  }
`;

// ─── Loader ──────────────────────────────────────────────────────────

export async function loader({ request }: { request: Request }) {
  const { session, store } = await authenticate.admin(request);

  const webPixel = await prisma.webPixel.findUnique({
    where: { store },
  });

  return {
    pixel: webPixel
      ? {
        pixelId: webPixel.pixelId,
        name: webPixel.name,
        settings: JSON.parse(webPixel.settings) as Record<string, string>,
      }
      : null,
  };
}

// ─── Action ──────────────────────────────────────────────────────────

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const { admin, store } = await authenticate.admin(
    new Request(request.url, { headers: request.headers })
  );
  const intent = formData.get("intent") as string;

  const name = formData.get("name") as string;
  const facebook = (formData.get("facebook") as string) || "";
  const tiktok = (formData.get("tiktok") as string) || "";
  const snapchat = (formData.get("snapchat") as string) || "";
  const google = (formData.get("google") as string) || "";

  const settings: Record<string, string> = {};
  if (facebook) settings.facebook = facebook;
  if (tiktok) settings.tiktok = tiktok;
  if (snapchat) settings.snapchat = snapchat;
  if (google) settings.google = google;

  try {
    if (intent === "create") {
      const response = await admin.graphql<{
        data: {
          createWebPixel: {
            success: boolean;
            message: string;
            data: { _id: string } | null;
          };
        };
      }>(CREATE_WEB_PIXEL, {
        input: { name, settings },
      });

      if (!response.data.createWebPixel.success) {
        return { ok: false, error: response.data.createWebPixel.message };
      }

      const pixelId = response.data.createWebPixel.data!._id;

      await prisma.webPixel.create({
        data: {
          store,
          pixelId,
          name,
          settings: JSON.stringify(settings),
        },
      });

      return { ok: true, pixelId };
    }

    if (intent === "update") {
      const existingPixel = await prisma.webPixel.findUnique({
        where: { store },
      });

      if (!existingPixel) {
        return { ok: false, error: "لا يوجد بكسل لتحديثه" };
      }

      const response = await admin.graphql<{
        data: {
          updateWebPixel: {
            success: boolean;
            message: string;
            data: { _id: string } | null;
          };
        };
      }>(UPDATE_WEB_PIXEL, {
        pixelId: existingPixel.pixelId,
        input: { name, settings },
      });

      if (!response.data.updateWebPixel.success) {
        return { ok: false, error: response.data.updateWebPixel.message };
      }

      await prisma.webPixel.update({
        where: { store },
        data: {
          name,
          settings: JSON.stringify(settings),
        },
      });

      return { ok: true, pixelId: existingPixel.pixelId };
    }

    return { ok: false, error: "إجراء غير معروف" };
  } catch (err: unknown) {
    console.log("🚀 ~ action ~ err:", err)
    const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return { ok: false, error: message };
  }
}

// ─── Pixel Platforms Config ──────────────────────────────────────────

const platforms = [
  {
    key: "facebook",
    label: "Facebook Pixel",
    placeholder: "مثال: 123456789012345",
    color: "blue",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok Pixel",
    placeholder: "مثال: C4XXXXXXXXXXXXXXXXX",
    color: "gray",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.8.1v-3.5a6.37 6.37 0 0 0-.8-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 10.86 4.43c1.3-1.3 1.97-3.03 1.97-4.86V8.54a8.32 8.32 0 0 0 4.84 1.55V6.64a4.79 4.79 0 0 1-1.23.05z" />
      </svg>
    ),
  },
  {
    key: "snapchat",
    label: "Snapchat Pixel",
    placeholder: "مثال: abcd1234-5678-efgh",
    color: "yellow",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.032.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.095-.03.196-.063.283-.084.376-.095.695-.032.919.18.264.25.32.588.143.933a3.85 3.85 0 0 1-1.31 1.266c-.11.06-.226.133-.347.21-.372.24-.806.552-.94 1.01-.066.227-.023.435.132.655.263.377.663.688 1.028.97l.064.048a5.48 5.48 0 0 1 1.66 1.772c.24.462.17.997-.18 1.39-.343.382-.867.566-1.542.566-.22 0-.434-.02-.63-.056-.172-.03-.355-.068-.565-.118a3.1 3.1 0 0 0-.365-.068.84.84 0 0 0-.224.02c-.108.03-.235.11-.375.264a3.32 3.32 0 0 1-.634.515 5.652 5.652 0 0 1-1.761.776c-.378.105-.78.179-1.212.224a4.396 4.396 0 0 1-.458.024 5.398 5.398 0 0 1-1.2-.139 5.66 5.66 0 0 1-1.774-.78 3.36 3.36 0 0 1-.636-.516c-.14-.152-.267-.233-.375-.264a.84.84 0 0 0-.224-.02c-.115.006-.241.03-.365.068-.21.05-.393.088-.565.118a4.26 4.26 0 0 1-.63.056c-.678 0-1.202-.184-1.545-.567-.349-.393-.418-.928-.176-1.392a5.49 5.49 0 0 1 1.662-1.773l.065-.049c.364-.28.763-.592 1.025-.967.157-.222.2-.43.135-.657-.134-.458-.567-.769-.94-1.01a5.21 5.21 0 0 1-.347-.21 3.85 3.85 0 0 1-1.31-1.267c-.176-.344-.12-.682.143-.932.224-.213.543-.276.92-.181.085.021.185.053.281.084.264.094.622.23.926.215.197 0 .324-.045.398-.09a16.5 16.5 0 0 1-.035-.57c-.104-1.629-.23-3.655.3-4.848C7.447 1.069 10.803.793 11.794.793h.412z" />
      </svg>
    ),
  },
  {
    key: "google",
    label: "Google Tag",
    placeholder: "مثال: GT-XXXXXXX",
    color: "red",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
] as const;

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  gray: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
  red: { bg: "bg-red-50", text: "text-red-500", border: "border-red-200" },
};

// ─── Component ───────────────────────────────────────────────────────

export default function PixelsPage({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>;
}) {
  const existingPixel = loaderData.pixel;

  const [name, setName] = useState(existingPixel?.name ?? "");
  const [settings, setSettings] = useState<Record<string, string>>({
    facebook: existingPixel?.settings?.facebook ?? "",
    tiktok: existingPixel?.settings?.tiktok ?? "",
    snapchat: existingPixel?.settings?.snapchat ?? "",
    google: existingPixel?.settings?.google ?? "",
  });

  const [savedName, setSavedName] = useState(name);
  const [savedSettings, setSavedSettings] = useState({ ...settings });

  const fetcher = useFetcher<typeof action>();
  const saveBar = useSaveBar();
  const toast = useToast();
  const modal = useModal();

  const isSubmitting = fetcher.state !== "idle";

  const isDirty =
    name !== savedName ||
    Object.keys(settings).some((k) => settings[k] !== savedSettings[k]);

  // Save bar
  useEffect(() => {
    if (isDirty) {
      saveBar.show({
        onSave: async ({ complete }) => {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const formData = new FormData();
          formData.set("intent", existingPixel ? "update" : "create");
          formData.set("name", name);
          for (const [key, value] of Object.entries(settings)) {
            formData.set(key, value);
          }
          await fetcher.submit(formData, { method: "POST" });
          complete();

        },
        onDiscard: () => {
          setName(savedName);
          setSettings({ ...savedSettings });
        },
      });
    } else {
      saveBar.hide();
    }
  }, [isDirty, saveBar]);

  // Handle action response
  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      if (fetcher.data.ok) {
        setSavedName(name);
        setSavedSettings({ ...settings });
        toast.show({ message: "تم حفظ إعدادات البكسل بنجاح", variant: "success" });
      } else {
        toast.show({
          message: fetcher.data.error || "حدث خطأ أثناء الحفظ",
          variant: "error",
        });
      }
    }
  }, [fetcher.data, fetcher.state]);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const hasAnyPixel = Object.values(settings).some((v) => v.trim() !== "");
  const activeCount = Object.values(settings).filter((v) => v.trim() !== "").length;

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f9fb]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                إدارة البكسل
              </h1>
              <p className="text-sm text-gray-500">
                اربط بكسلات التتبع لتحسين حملاتك الإعلانية
              </p>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {existingPixel && (
          <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-700">
              البكسل مفعّل
            </span>
            <span className="text-xs text-emerald-500 font-mono mr-auto" dir="ltr">
              {existingPixel.pixelId}
            </span>
          </div>
        )}

        {/* Pixel Name Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm mb-5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-800">معلومات البكسل</h2>
                <p className="text-xs text-gray-400">اسم مميز لتعريف البكسل</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              اسم البكسل
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 text-sm bg-white border border-gray-300 rounded-lg
                text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                transition-all duration-150"
              placeholder="مثال: بكسل المتجر الرئيسي"
            />
          </div>
        </div>

        {/* Platforms Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm mb-5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-gray-800">منصات التتبع</h2>
                  <p className="text-xs text-gray-400">أضف معرّفات البكسل لكل منصة</p>
                </div>
              </div>
              {activeCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {activeCount} مفعّل
                </span>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {platforms.map((platform) => {
              const colors = colorMap[platform.color];
              const isActive = settings[platform.key]?.trim() !== "";

              return (
                <div key={platform.key} className="px-6 py-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
                      {platform.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {platform.label}
                    </span>
                    {isActive && (
                      <span className="mr-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        متصل
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings[platform.key] || ""}
                    onChange={(e) => updateSetting(platform.key, e.target.value)}
                    className={`w-full h-10 px-3.5 text-sm bg-white border rounded-lg
                      text-gray-900 placeholder-gray-400 text-left font-mono
                      focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                      transition-all duration-150
                      ${isActive ? `border-emerald-300 bg-emerald-50/30` : "border-gray-300"}`}
                    placeholder={platform.placeholder}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Help Card */}
        <div className="bg-white rounded-xl border border-dashed border-gray-300 shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">كيف يعمل؟</h3>
                <ul className="text-xs text-gray-500 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                    أضف معرّف البكسل الخاص بكل منصة إعلانية
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                    سيتم تتبع الأحداث تلقائياً: مشاهدة المنتج، الإضافة للسلة، إتمام الشراء
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                    يمكنك تفعيل أو تعطيل أي منصة بإضافة أو إزالة المعرّف
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
