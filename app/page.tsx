"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeFa } from "@/lib/text";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import {
  Search, ShoppingBag, Heart, Sparkles, ShieldCheck, ArrowLeft,
  Plus, X, Minus, Instagram, Menu, ChevronLeft, Flower2, Gift,
  PackageCheck, SlidersHorizontal
} from "lucide-react";

type StoreProduct = { id: number; name: string; brand: string; price: number; old?: number; cat: string; tone: string; tag?: string; mark: string; type: string; imageUrl?: string | null; stock?: number; description?: string | null };

const toman = (n: number) => n.toLocaleString("fa-IR") + " تومان";

const categories = [
  { title: "مراقبت پوست", en: "SKINCARE", cat: "پوست", tone: "cat-skin", mark: "✧", note: "روتینِ پوستِ تو" },
  { title: "آرایش و زیبایی", en: "MAKEUP", cat: "آرایش", tone: "cat-makeup", mark: "◒", note: "رنگی برای حالِ خوب" },
  { title: "عطر و رایحه", en: "FRAGRANCE", cat: "عطر", tone: "cat-scent", mark: "❋", note: "امضای نامرئی تو" },
];

export default function Home() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [cat, setCat] = useState("همه");
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [likes, setLikes] = useState<number[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [notice, setNotice] = useState("");
  const cartTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const [sort, setSort] = useState("featured");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutProvince, setCheckoutProvince] = useState("");
  const [checkoutCity, setCheckoutCity] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutPostal, setCheckoutPostal] = useState("");
  const [checkoutCarrier, setCheckoutCarrier] = useState("پست ایران");
  const [checkoutPayment, setCheckoutPayment] = useState("درگاه بانکی (پرداخت در مرحله بعد)");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [orderResult, setOrderResult] = useState<{orderCode:string;message:string}|null>(null);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".category-card"));
    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -35px 0px" });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/products", { cache: "no-store" }).then(response => response.ok ? response.json() : Promise.reject(new Error("catalog unavailable"))).then(result => { if (active) setProducts(Array.isArray(result.products) ? result.products : []); }).catch(() => { if (active) setProducts([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(searchInput), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem("miashop:cart:v1");
      const savedLikes = window.localStorage.getItem("miashop:favorites:v1");
      if (savedCart) setCart(JSON.parse(savedCart) as Record<number, number>);
      if (savedLikes) setLikes(JSON.parse(savedLikes) as number[]);
    } catch {
      // Private browsing or disabled storage: keep the in-memory state usable.
    }
    setHydrated(true);
    const syncStorage = (event: StorageEvent) => {
      try {
        if (event.key === "miashop:cart:v1") setCart(event.newValue ? JSON.parse(event.newValue) as Record<number, number> : {});
        if (event.key === "miashop:favorites:v1") setLikes(event.newValue ? JSON.parse(event.newValue) as number[] : []);
      } catch {
        // Ignore malformed data written by another tab.
      }
    };
    window.addEventListener("storage", syncStorage);
    return () => window.removeEventListener("storage", syncStorage);
  }, []);

  useEffect(() => {
    if (!open && !mobileMenu) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = open ? drawerRef.current : mobileMenuRef.current;
    const getControls = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
    getControls()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setMobileMenu(false);
      }
      if (event.key !== "Tab") return;
      const controls = getControls();
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (open) cartTriggerRef.current?.focus();
    };
  }, [open, mobileMenu]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("miashop:cart:v1", JSON.stringify(cart));
      window.localStorage.setItem("miashop:favorites:v1", JSON.stringify(likes));
    } catch {
      // Storage quota or browser privacy settings may prevent persistence.
    }
  }, [cart, likes, hydrated]);

  const list = useMemo(() => {
    const filtered = products.filter((p) =>
      (cat === "همه" || p.cat === cat) &&
      normalizeFa(`${p.name} ${p.brand}`).includes(normalizeFa(q))
    );
    if (sort === "low") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [cat, q, sort]);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = products.reduce((s, p) => s + p.price * (cart[p.id] || 0), 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const shippingProgress = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const add = (id: number, n: number) => setCart((old) => ({ ...old, [id]: Math.max(0, (old[id] || 0) + n) }));
  const chooseCategory = (value: string) => {
    setCat(value);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };
  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkoutBusy) return;
    setCheckoutBusy(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: checkoutName, phone: checkoutPhone, province: checkoutProvince, city: checkoutCity,
          address: checkoutAddress, postalCode: checkoutPostal, carrier: checkoutCarrier, paymentMethod: checkoutPayment,
          items: products.filter(p => cart[p.id] > 0).map(p => ({ id: p.id, quantity: cart[p.id] })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ثبت سفارش انجام نشد.");
      setOrderResult({ orderCode: result.order.orderCode, message: result.message });
      setCart({});
      setCheckoutOpen(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ثبت سفارش انجام نشد.");
    } finally { setCheckoutBusy(false); }
  };

  return (
    <main id="home">
      <div className="topline">
        <span className="topline-mark">✳</span>
        <span>دنیای زیبایی، با انتخاب‌های خودت</span>
        <span className="topline-divider">/</span>
        <span className="topline-en">YOUR BEAUTY, YOUR RULES</span>
      </div>

      <header className="wrap header">
        <a className="brandlogo" href="#home" aria-label="میاشاپ، صفحه اصلی">
          <b>m.</b><span>میاشاپ<small>BEAUTY, YOUR WAY</small></span>
        </a>
        <nav className={mobileMenu ? "nav-open" : ""} aria-label="ناوبری اصلی">
          <a href="#home" onClick={() => setMobileMenu(false)}>صفحه اصلی</a>
          <a href="#categories" onClick={() => setMobileMenu(false)}>دسته‌بندی‌ها</a>
          <a href="#products" onClick={() => setMobileMenu(false)}>محصولات</a>
          <a href="#ritual" onClick={() => setMobileMenu(false)}>مجله زیبایی</a>
        </nav>
        <div className="headtools">
          <div className={"search " + (mobileSearchOpen ? "mobile-search-open" : "")}>
            <button type="button" className="mobile-search-toggle" onClick={() => setMobileSearchOpen((value) => !value)} aria-label={mobileSearchOpen ? "بستن جست‌وجو" : "باز کردن جست‌وجو"} aria-expanded={mobileSearchOpen}>{mobileSearchOpen ? <X size={17} /> : <Search size={17} />}</button>
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }} placeholder="دنبال چی می‌گردی؟" aria-label="جست‌وجوی محصولات" />
            {searchInput && <button type="button" className="clear-search" onClick={() => setSearchInput("")} aria-label="پاک کردن جست‌وجو"><X size={13} /></button>}
            <button type="button" className="search-submit" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} aria-label="جست‌وجو"><Search size={16} /></button>
          </div>
          <button className="bag" ref={cartTriggerRef} onClick={() => setOpen(true)} aria-label="باز کردن سبد خرید">
            <ShoppingBag size={21} />{count > 0 && <i>{count.toLocaleString("fa-IR")}</i>}
          </button>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenu((v) => !v)} aria-label="باز و بسته کردن منو" aria-expanded={mobileMenu} aria-controls="mobile-navigation"><Menu size={21} /></button>
        </div>
      </header>
      {mobileMenu && <div className="mobile-menu-backdrop" onClick={() => setMobileMenu(false)}><nav id="mobile-navigation" ref={mobileMenuRef} className="mobile-menu-dialog" role="dialog" aria-modal="true" aria-label="منوی اصلی" onClick={(event) => event.stopPropagation()}><div className="mobile-menu-heading"><strong>منوی میاشاپ</strong><button type="button" onClick={() => setMobileMenu(false)} aria-label="بستن منو"><X /></button></div><a href="#home" onClick={() => setMobileMenu(false)}>صفحه اصلی</a><a href="#products" onClick={() => { chooseCategory("آرایش"); setMobileMenu(false); }}>آرایشی</a><a href="#products" onClick={() => { chooseCategory("پوست"); setMobileMenu(false); }}>مراقبت پوست</a><a href="#products" onClick={() => { chooseCategory("عطر"); setMobileMenu(false); }}>عطر و ادکلن</a></nav></div>}

      <section className="hero wrap" id="home">
        <div className="herotext">
          <span className="eyebrow"><Sparkles size={15} /> THE MIA BEAUTY EDIT · ۰۱</span>
          <h1>زیبایی تو،<br /><em>قانون خودته.</em></h1>
          <p>از اولین قدم روتین مراقبت پوست تا رایحه‌ای که امضای تو می‌شود؛ چیزهایی را انتخاب کن که حسِ خودت را بهتر می‌کنند.</p>
          <div className="hero-actions">
            <a className="btn" href="#products">کشف محصولات <ArrowLeft size={17} /></a>
            <a className="text-link" href="#categories">پیدا کردن روتین <ChevronLeft size={16} /></a>
          </div>
          <div className="stats">
            <div><b>پوست</b><small>مراقبت روزانه</small></div><i />
            <div><b>آرایش</b><small>رنگ و خلاقیت</small></div><i />
            <div><b>رایحه</b><small>امضای شخصی</small></div>
          </div>
        </div>
        <div className="heroart neon-stage" aria-label="بنر اصلی میاشاپ با دسترسی سریع به محصولات">
          <div className="hero-overlay-content" dir="rtl">
            <span className="hero-overlay-kicker"><Sparkles size={15} /> THE MIA BEAUTY EDIT</span>
            <h1>زیبایی، یک انتخاب نیست؛<br /><em>یک سبک زندگی است.</em></h1>
            <p>از مراقبت پوست تا آرایش و رایحه‌های خاص؛ انتخاب‌هایی برای درخشش به سبک خودت.</p>
            <div className="hero-overlay-actions">
              <a className="hero-overlay-primary" href="#products">مشاهده محصولات <ArrowLeft size={17} /></a>
              <a className="hero-overlay-secondary" href="#categories">کشف دسته‌بندی‌ها <ChevronLeft size={16} /></a>
            </div>
            <div className="hero-overlay-trust"><span><ShieldCheck size={15} /> انتخاب آگاهانه</span><i /><span><Heart size={15} /> زیبایی به سبک تو</span></div>
          </div>
          <span className="hero-overlay-frame" aria-hidden="true" />
        </div>
      </section>

      <section className="benefits wrap" aria-label="ویژگی‌های فروشگاه">
        <div><ShieldCheck /><span><b>انتخاب آگاهانه</b><small>جزئیات روشن برای هر محصول</small></span></div>
        <div><PackageCheck /><span><b>خرید قابل پیگیری</b><small>اطلاعات سفارش در یک مسیر مشخص</small></span></div>
        <div><Heart /><span><b>زیبایی به سبک تو</b><small>پیدا کردن انتخاب‌های شخصی</small></span></div>
      </section>

      <section className="wrap categories-section" id="categories">
        <div className="sectionhead">
          <div><small className="eyebrow">FIND YOUR FEEL</small><h2>از کجا شروع <em>می‌کنی؟</em></h2><p>مسیرت را انتخاب کن؛ بقیه‌اش با خودت.</p></div>
          <span>سه دنیای متفاوت <Sparkles size={16} /></span>
        </div>
        <div className="category-grid">
          {categories.map((item, index) => (
            <button className={"category-card " + item.tone} key={item.en} onClick={() => chooseCategory(item.cat)} aria-label={item.title + "؛ مشاهده محصولات"}>
              <span className="category-art" aria-hidden="true"><b>{item.mark}</b><small>{item.en}</small></span>
              <span className="category-copy"><small>{item.note}</small><strong>{item.title}</strong><span className="category-link">مشاهده محصولات <ArrowLeft size={15} /></span></span>
            </button>
          ))}
        </div>
      </section>

      <section className="editorial wrap" id="ritual">
        <div className="editorial-art"><span className="editorial-ring" /><span className="editorial-flower">✳</span><span className="editorial-note">SLOW DOWN.<br />GLOW UP.</span></div>
        <div className="editorial-copy">
          <small className="eyebrow">A NOTE TO YOURSELF</small>
          <h2>روتین زیبایی،<br /><em>وقتِ خودت است.</em></h2>
          <p>قرار نیست شبیه کسی دیگر باشی. چند انتخاب کوچک و آگاهانه می‌توانند بخشی از روزت را به لحظه‌ای برای خودت تبدیل کنند.</p>
          <a className="text-link" href="#products">انتخاب‌های امروزت <ArrowLeft size={16} /></a>
        </div>
      </section>

      <section className="wrap products" id="products">
        <div className="sectionhead">
          <div><small className="eyebrow">THE BEAUTY SHELF</small><h2>انتخاب‌های <em>میاشاپ</em></h2><p>برای روتین روزانه‌ات، با سلیقه خودت انتخاب کن.</p></div>
          <span>جزئیات کوچک، حس متفاوت <Sparkles size={16} /></span>
        </div>
        <div className="filters">
          {["همه", "پوست", "آرایش", "عطر"].map((c) => <button key={c} className={cat === c ? "active" : ""} onClick={() => setCat(c)}>{c === "همه" ? "همه محصولات" : c}</button>)}
          <label className="sort-label"><SlidersHorizontal size={14} /><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="مرتب‌سازی محصولات"><option value="featured">پیشنهاد میاشاپ</option><option value="low">ارزان‌ترین</option><option value="high">گران‌ترین</option></select></label>
          <small className="product-count">{list.length.toLocaleString("fa-IR")} محصول</small>
        </div>
        <div className="grid">
          {list.map((p) => (
            <article className="card" key={p.id}>
              <div className={"visual " + p.tone}>
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} loading="lazy" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} /> : <><span className="visual-grain" /><div className={"shape shape-" + p.type}><b>{p.mark}</b><small>{p.brand.toUpperCase()}</small></div></>}
                {p.tag && <span className="tag">{p.tag}</span>}
                <button className={"like " + (likes.includes(p.id) ? "liked" : "")} onClick={() => setLikes((a) => a.includes(p.id) ? a.filter((x) => x !== p.id) : [...a, p.id])} aria-label={likes.includes(p.id) ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"} aria-pressed={likes.includes(p.id)}><Heart size={17} fill={likes.includes(p.id) ? "currentColor" : "none"} /></button>
                {p.old && <span className="off">{Math.round((1 - p.price / p.old) * 100).toLocaleString("fa-IR")}٪ تخفیف</span>}
              </div>
              <div className="details">
                <small>{p.brand}</small><h3>{p.name}</h3>
                <div className="price"><span><b>{toman(p.price)}</b>{p.old && <del>{toman(p.old)}</del>}</span><button onClick={() => add(p.id, 1)} aria-label={"افزودن " + p.name + " به سبد خرید"}><Plus size={19} /><span className="add-label">افزودن</span></button></div>
              </div>
            </article>
          ))}
        </div>
        {list.length === 0 && <div className="empty catalog-empty"><PackageCheck size={25}/><strong>{q ? "محصولی با این جست‌وجو پیدا نشد." : "هنوز محصولی برای فروش ثبت نشده است."}</strong><span>{q ? "نام محصول یا برند دیگری را جست‌وجو کن." : "پس از ثبت محصولات واقعی در پنل مدیریت، کالاها در این بخش نمایش داده می‌شوند."}</span></div>}
        <div className="catalog-foot"><span>محصولات این بخش از موجودی ثبت‌شده در پنل مدیریت بارگذاری می‌شوند.</span><a className="text-link" href="#home">بازگشت به بالا <ArrowLeft size={15} /></a></div>
      </section>

      <section className="newsletter wrap">
        <div className="newsletter-mark"><Gift size={25} /></div>
        <div className="newsletter-copy"><small>THE MIA LETTER</small><h2>نامه‌هایی برای <em>حالِ بهتر</em></h2><p>تازه‌های زیبایی و ایده‌های روتین را در یک جای خلوت دنبال کن.</p></div>
        <form onSubmit={(e) => { e.preventDefault(); setNewsletterMessage("خبرنامه هنوز به سرویس ارسال ایمیل متصل نیست؛ اطلاعات ارسال نشد."); }}>
          <input type="email" required placeholder="آدرس ایمیل تو" aria-label="آدرس ایمیل" /><button>به خبرنامه بپیوند <ArrowLeft size={16} /></button>
        </form>
        {newsletterMessage && <p className="newsletter-message" role="status" aria-live="polite">{newsletterMessage}</p>}
        <b className="flower">✳</b>
      </section>

      <footer>
        <div className="wrap foot">
          <div className="foot-brand"><a className="brandlogo" href="#home"><b>m.</b><span>میاشاپ<small>BEAUTY, YOUR WAY</small></span></a><p>زیبایی از انتخاب‌های کوچک شروع می‌شود. انتخاب‌های روزمره‌ات را کمی خاص‌تر کن.</p><a className="social-link" href="#home" aria-label="اینستاگرام میاشاپ"><Instagram size={17} /> <span>همراه میاشاپ باش</span></a></div>
          <div><b>خرید و کشف</b><a href="#products">همه محصولات</a><a href="#products" onClick={() => chooseCategory("پوست")}>مراقبت پوست</a><a href="#products" onClick={() => chooseCategory("آرایش")}>آرایش و زیبایی</a><a href="#products" onClick={() => chooseCategory("عطر")}>عطر و رایحه</a></div>
          <div><b>میاشاپ</b><a href="#ritual">یادداشت زیبایی</a><a href="#home">درباره میاشاپ</a><a href="mailto:hello@miashop.com">ارتباط با ما</a><span>شنبه تا پنجشنبه · ۹ تا ۱۸</span></div>
        </div>
        <div className="wrap footer-note"><ShieldCheck size={15} /><span>اطلاعات سفارش و پرداخت پس از راه‌اندازی سرویس‌های واقعی فعال خواهد شد.</span></div>
        <div className="wrap copyright">© ۱۴۰۵ میاشاپ — تمامی حقوق محفوظ است. <span>ساخته‌شده برای روتین زیبایی تو ✦</span></div>
      </footer>

      <nav className="mobile-bottom-nav" aria-label="دسترسی سریع موبایل">
        <a href="#home"><Sparkles size={19} /><span>خانه</span></a>
        <a href="#categories"><Flower2 size={19} /><span>دسته‌ها</span></a>
        <a href="#products"><Search size={19} /><span>محصولات</span></a>
        <button onClick={() => setOpen(true)}><ShoppingBag size={19} /><span>سبد {count > 0 ? "· " + count.toLocaleString("fa-IR") : ""}</span></button>
      </nav>

      {notice && <div className="toast-message" role="status" aria-live="polite"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="بستن پیام"><X size={16} /></button></div>}
      {open && <div className="shade" onClick={() => setOpen(false)}><aside ref={drawerRef} className="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" onClick={(e) => e.stopPropagation()}><div className="drawhead"><h2 id="cart-drawer-title">سبد خرید ({count.toLocaleString("fa-IR")})</h2><button onClick={() => setOpen(false)} aria-label="بستن"><X /></button></div>
        {orderResult ? <div className="emptycart" role="status"><PackageCheck /><h3>سفارش ثبت شد</h3><p>کد سفارش: <strong dir="ltr">{orderResult.orderCode}</strong></p><p>{orderResult.message}</p><button className="btn" onClick={() => { setOrderResult(null); setOpen(false); }}>متوجه شدم</button></div> : count === 0 ? <div className="emptycart"><ShoppingBag /><h3>سبد خریدت خالیه</h3><p>چند محصول دوست‌داشتنی بهش اضافه کن.</p><button className="btn" onClick={() => setOpen(false)}>دیدن محصولات</button></div> : <>
          <div className="cartlist">{products.filter((p) => cart[p.id] > 0).map((p) => <div className="cartitem" key={p.id}><span className={"thumb " + p.tone}>{p.mark}</span><div><b>{p.name}</b><small>{toman(p.price)}</small><div className="qty"><button onClick={() => add(p.id, -1)} aria-label="کم کردن"><Minus size={13} /></button>{cart[p.id].toLocaleString("fa-IR")}<button onClick={() => add(p.id, 1)} aria-label="زیاد کردن"><Plus size={13} /></button></div></div></div>)}</div>
          {checkoutOpen ? <form className="cartfoot" onSubmit={submitOrder} style={{display:"grid",gap:12,textAlign:"right"}}><h3 style={{margin:0}}>اطلاعات ارسال و ثبت سفارش</h3><label>نام و نام خانوادگی<input required minLength={3} value={checkoutName} onChange={e=>setCheckoutName(e.target.value)} autoComplete="name" /></label><label>شماره موبایل<input required inputMode="tel" pattern="09[0-9]{9}" maxLength={11} value={checkoutPhone} onChange={e=>setCheckoutPhone(e.target.value)} placeholder="09123456789" autoComplete="tel" /></label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><label>استان<input required value={checkoutProvince} onChange={e=>setCheckoutProvince(e.target.value)} /></label><label>شهر<input required value={checkoutCity} onChange={e=>setCheckoutCity(e.target.value)} autoComplete="address-level2" /></label></div><label>نشانی کامل<input required minLength={8} value={checkoutAddress} onChange={e=>setCheckoutAddress(e.target.value)} autoComplete="street-address" /></label><label>کد پستی ۱۰ رقمی<input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={checkoutPostal} onChange={e=>setCheckoutPostal(e.target.value)} autoComplete="postal-code" /></label><label>روش ارسال<select value={checkoutCarrier} onChange={e=>setCheckoutCarrier(e.target.value)}><option>پست ایران</option><option>تی‌باکس</option></select></label><label>روش پرداخت<select value={checkoutPayment} onChange={e=>setCheckoutPayment(e.target.value)}><option>درگاه بانکی (پرداخت در مرحله بعد)</option><option>پرداخت اقساطی (نیازمند فعال‌سازی)</option></select></label><div><span>مبلغ کالاها <b>{toman(total)}</b></span><small style={{display:"block",lineHeight:1.8}}>هزینه ارسال هنوز از سرویس حمل‌ونقل دریافت نمی‌شود. پرداخت آنلاین و اقساطی هنوز متصل نیستند؛ این مرحله فقط سفارش را با وضعیت «در انتظار پرداخت» ثبت می‌کند.</small></div><button className="btn" type="submit" disabled={checkoutBusy}>{checkoutBusy ? "در حال ثبت سفارش…" : "ثبت سفارش و دریافت کد پیگیری"} <ArrowLeft size={16}/></button><button type="button" className="text-link" onClick={()=>setCheckoutOpen(false)}>بازگشت به سبد خرید</button></form> : <><div className="shipping-progress"><p>{remainingForFreeShipping > 0 ? <>{toman(remainingForFreeShipping)} تا ارسال رایگان باقی مانده</> : "سفارش به حد ارسال رایگان رسیده است."}</p><div className="shipping-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={shippingProgress}><span style={{ width: shippingProgress + "%" }} /></div></div><div className="cartfoot"><span>جمع کالاها <b>{toman(total)}</b></span><span>هزینه ارسال <b>پس از تأیید روش ارسال مشخص می‌شود</b></span><span>مجموع کالاها <b>{toman(total)}</b></span><button className="btn" onClick={() => setCheckoutOpen(true)}>ادامه و ثبت سفارش <ArrowLeft size={16} /></button><small>ثبت سفارش، پرداخت واقعی نیست. کد سفارش پس از ذخیره موفق صادر می‌شود.</small></div></>}
        </>}
      </aside></div>}
    </main>
  );
}
