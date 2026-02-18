import { register } from "@qumra/web-pixels-extension";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    ttq: any;
    snaptr: any;
    gtag: any;
    dataLayer: any[];
  }
  var fbq: any;
  var ttq: any;
  var snaptr: any;
  var gtag: any;
  var dataLayer: any[];
}

register(async ({ settings, browser, api }) => {
  // ─── Facebook Pixel ──────────────────────────────────────────────
  if (settings.facebook) {
    (function (f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js",
      undefined,
      undefined,
      undefined
    );

    fbq("init", settings.facebook);
    fbq("track", "PageView");
  }

  // ─── TikTok Pixel ───────────────────────────────────────────────
  if (settings.tiktok) {
    (function (w: any, d: any, t: string) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      ttq.methods = [
        "page",
        "track",
        "identify",
        "instances",
        "debug",
        "on",
        "off",
        "once",
        "ready",
        "alias",
        "group",
        "enableCookie",
        "disableCookie",
      ];
      ttq.setAndDefer = function (t: any, e: string) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++)
        ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t: string) {
        var e = ttq._i[t] || [];
        for (var n = 0; n < ttq.methods.length; n++)
          ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      };
      ttq.load = function (e: string, n?: any) {
        var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = i;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        var o = document.createElement("script");
        o.type = "text/javascript";
        o.async = true;
        o.src = i + "?sdkid=" + e + "&lib=" + t;
        var a = document.getElementsByTagName("script")[0];
        a.parentNode!.insertBefore(o, a);
      };
      ttq.load(settings.tiktok);
      ttq.page();
    })(window, document, "ttq");
  }

  // ─── Snapchat Pixel ─────────────────────────────────────────────
  if (settings.snapchat) {
    (function (e: any, t: any, n: any) {
      if (e.snaptr) return;
      var a = (e.snaptr = function () {
        a.handleRequest
          ? a.handleRequest.apply(a, arguments)
          : a.queue.push(arguments);
      });
      a.queue = [];
      var s = t.createElement("script");
      s.async = true;
      s.src = n;
      var r = t.getElementsByTagName("script")[0];
      r.parentNode.insertBefore(s, r);
    })(window, document, "https://sc-static.net/scevent.min.js");

    snaptr("init", settings.snapchat);
    snaptr("track", "PAGE_VIEW");
  }

  // ─── Google Tag (gtag.js) ───────────────────────────────────────
  if (settings.google) {
    var script = document.createElement("script");
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" + settings.google;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      dataLayer.push(arguments);
    };
    gtag("js", new Date());
    gtag("config", settings.google);
  }

  // ─── Event Mapping ──────────────────────────────────────────────

  const FB_EVENTS: Record<string, string | null> = {
    page_viewed: "PageView",
    product_viewed: "ViewContent",
    product_added_to_cart: "AddToCart",
    product_removed_from_cart: null,
    checkout_started: "InitiateCheckout",
    checkout_completed: "Purchase",
    search_submitted: "Search",
    product_added_to_wishlist: "AddToWishlist",
    customer_registered: "CompleteRegistration",
    contact_submitted: "Contact",
    cart_updated: "AddToCart",
  };

  const TIKTOK_EVENTS: Record<string, string | null> = {
    page_viewed: "Pageview",
    product_viewed: "ViewContent",
    product_added_to_cart: "AddToCart",
    checkout_started: "InitiateCheckout",
    checkout_completed: "CompletePayment",
    search_submitted: "Search",
    product_added_to_wishlist: "AddToWishlist",
    customer_registered: "CompleteRegistration",
    contact_submitted: "Contact",
  };

  const SNAP_EVENTS: Record<string, string | null> = {
    page_viewed: "PAGE_VIEW",
    product_viewed: "VIEW_CONTENT",
    product_added_to_cart: "ADD_CART",
    checkout_started: "START_CHECKOUT",
    checkout_completed: "PURCHASE",
    search_submitted: "SEARCH",
    product_added_to_wishlist: "ADD_TO_WISHLIST",
    customer_registered: "SIGN_UP",
  };

  const GOOGLE_EVENTS: Record<string, string | null> = {
    page_viewed: "page_view",
    product_viewed: "view_item",
    product_added_to_cart: "add_to_cart",
    product_removed_from_cart: "remove_from_cart",
    checkout_started: "begin_checkout",
    checkout_completed: "purchase",
    search_submitted: "search",
    product_added_to_wishlist: "add_to_wishlist",
    customer_registered: "sign_up",
  };

  api.on("all_events", (event) => {
    const data: any = event.data;

    // ── Facebook ────────────────────────────────────────────────
    if (settings.facebook) {
      const fbEvent = FB_EVENTS[event.name];
      if (fbEvent) {
        fbq("track", fbEvent, mapFacebookData(event.name, data));
      }
    }

    // ── TikTok ──────────────────────────────────────────────────
    if (settings.tiktok) {
      const ttEvent = TIKTOK_EVENTS[event.name];
      if (ttEvent) {
        ttq.track(ttEvent, mapTiktokData(event.name, data));
      }
    }

    // ── Snapchat ────────────────────────────────────────────────
    if (settings.snapchat) {
      const snapEvent = SNAP_EVENTS[event.name];
      if (snapEvent) {
        snaptr("track", snapEvent, mapSnapchatData(event.name, data));
      }
    }

    // ── Google ──────────────────────────────────────────────────
    if (settings.google) {
      const gEvent = GOOGLE_EVENTS[event.name];
      if (gEvent) {
        gtag("event", gEvent, mapGoogleData(event.name, data));
      }
    }
  });

  // ─── Data Mappers ───────────────────────────────────────────────

  function mapFacebookData(name: string, data: any) {
    switch (name) {
      case "product_viewed":
        return {
          content_type: "product",
          content_ids: [data.product_id],
          content_name: data.product_name,
          value: data.product_price,
          currency: data.currency || "SAR",
        };
      case "product_added_to_cart":
      case "cart_updated":
        return {
          content_type: "product",
          content_ids: [data.response?.product_id],
          value: data.response?.price,
          currency: data.currency || "SAR",
        };
      case "checkout_completed":
        return {
          content_type: "product",
          value: data.response?.total,
          currency: data.currency || "SAR",
        };
      case "search_submitted":
        return { search_string: data.query };
      default:
        return {};
    }
  }

  function mapTiktokData(name: string, data: any) {
    switch (name) {
      case "product_viewed":
        return {
          content_type: "product",
          content_id: data.product_id,
          content_name: data.product_name,
          value: data.product_price,
          currency: data.currency || "SAR",
        };
      case "product_added_to_cart":
        return {
          content_type: "product",
          content_id: data.response?.product_id,
          value: data.response?.price,
          currency: data.currency || "SAR",
        };
      case "checkout_completed":
        return {
          value: data.response?.total,
          currency: data.currency || "SAR",
        };
      case "search_submitted":
        return { query: data.query };
      default:
        return {};
    }
  }

  function mapSnapchatData(name: string, data: any) {
    switch (name) {
      case "product_viewed":
        return {
          item_ids: [data.product_id],
          price: data.product_price,
          currency: data.currency || "SAR",
        };
      case "product_added_to_cart":
        return {
          item_ids: [data.response?.product_id],
          price: data.response?.price,
          currency: data.currency || "SAR",
        };
      case "checkout_completed":
        return {
          price: data.response?.total,
          currency: data.currency || "SAR",
          transaction_id: data.response?.order_id,
        };
      case "search_submitted":
        return { search_string: data.query };
      default:
        return {};
    }
  }

  function mapGoogleData(name: string, data: any) {
    switch (name) {
      case "product_viewed":
        return {
          items: [
            {
              item_id: data.product_id,
              item_name: data.product_name,
              price: data.product_price,
            },
          ],
          currency: data.currency || "SAR",
          value: data.product_price,
        };
      case "product_added_to_cart":
      case "product_removed_from_cart":
        return {
          items: [
            {
              item_id: data.response?.product_id,
              price: data.response?.price,
            },
          ],
          currency: data.currency || "SAR",
          value: data.response?.price,
        };
      case "checkout_completed":
        return {
          transaction_id: data.response?.order_id,
          value: data.response?.total,
          currency: data.currency || "SAR",
        };
      case "search_submitted":
        return { search_term: data.query };
      default:
        return {};
    }
  }
});
