"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownLeft, ArrowUpLeft, Bell, Boxes, ChartNoAxesCombined,
  Check, ChevronDown, CircleHelp, CreditCard, Download, FileText, Filter,
  LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings2, ShieldCheck,
  ShoppingBag, ShoppingCart, SlidersHorizontal, Sparkles, Truck, Users, X,
  Image as ImageIcon, Megaphone, WalletCards, Clock3, CircleAlert, ExternalLink
} from "lucide-react";
import "./admin.css";

type Product = { id: number; name: string; sku: string; category: string; price: number; stock: number; image_url?: string | null; old_price?: number | null; description?: string | null; status: "فعال" | "کم‌موجود" | "ناموجود"; };
type Section = "داشبورد" | "محصولات" | "سفارش‌ها" | "مشتریان" | "پرداخت و اقساط" | "انبار و ارسال" | "بازاریابی" | "محتوای سایت" | "گزارش‌ها" | "تنظیمات";

const initialProducts: Product[] = [];

type AdminOrder = { id: number; order_code: string; customer_name: string; phone: string; province: string; city: string; address: string; postal_code: string; payment_method: string; payment_status: string; order_status: string; items: unknown[]; subtotal: number; shipping_cost: number; total: number; carrier: string | null; tracking_code: string | null; created_at: string; };

const nav: { title: Section; icon: typeof LayoutDashboard; group: string }[] = [
  { title: "داشبورد", icon: LayoutDashboard, group: "مدیریت فروشگاه" },
  { title: "محصولات", icon: Package, group: "مدیریت فروشگاه" },
  { title: "سفارش‌ها", icon: ShoppingCart, group: "مدیریت فروشگاه" },
  { title: "مشتریان", icon: Users, group: "مدیریت فروشگاه" },
  { title: "پرداخت و اقساط", icon: WalletCards, group: "مالی و عملیات" },
  { title: "انبار و ارسال", icon: Truck, group: "مالی و عملیات" },
  { title: "بازاریابی", icon: Megaphone, group: "رشد فروش" },
  { title: "محتوای سایت", icon: ImageIcon, group: "رشد فروش" },
  { title: "گزارش‌ها", icon: ChartNoAxesCombined, group: "تحلیل" },
  { title: "تنظیمات", icon: Settings2, group: "سیستم" },
];

const toman = (value: number) => value.toLocaleString("fa-IR") + " تومان";

export default function AdminPage() {
  const [section, setSection] = useState<Section>("داشبورد");
  const [products, setProducts] = useState<Product[]>(initialProducts);\n  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newCategory, setNewCategory] = useState("مراقبت پوست");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newDescription, setNewDescription] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [providerEnabled, setProviderEnabled] = useState<Record<string, boolean>>({ "درگاه بانکی": true, "اسنپ‌پی": false, "ترب‌پی": false, "باسلام": false });

  useEffect(() => { void loadProducts(); void loadOrders(); }, []);
  async function loadProducts() {
    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "دریافت محصولات ناموفق بود.");
      setProducts((result.products || []).map((p: any) => ({ ...p, id: Number(p.id), price: Number(p.price), stock: Number(p.stock), status: Number(p.stock) === 0 ? "ناموجود" : Number(p.stock) <= 8 ? "کم‌موجود" : "فعال" })));
    } catch (error) { notify(error instanceof Error ? error.message : "اتصال محصولات برقرار نشد."); }
  }
  const filteredProducts = useMemo(() => products.filter(p => (p.name + p.sku + p.category).toLowerCase().includes(query.toLowerCase())), [products, query]);
  async function loadOrders() {
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "دریافت سفارش‌ها ناموفق بود.");
      setOrders(result.orders || []);
    } catch (error) { notify(error instanceof Error ? error.message : "اتصال سفارش‌ها برقرار نشد."); }
  }
  async function manageOrder(order: AdminOrder) {
    const status = window.prompt("وضعیت سفارش را وارد کنید: awaiting_payment / paid / processing / shipped / delivered / cancelled / returned", order.order_status);
    if (status === null) return;
    const tracking = window.prompt("کد رهگیری مرسوله (برای shipped الزامی است):", order.tracking_code || "");
    if (tracking === null) return;
    const carrier = window.prompt("شرکت ارسال (مثلاً پست ایران یا تی‌باکس):", order.carrier || "");
    if (carrier === null) return;
    try {
      const response = await fetch("/api/admin/orders/" + order.id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order_status: status.trim(), tracking_code: tracking.trim(), carrier: carrier.trim() }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "به‌روزرسانی سفارش ناموفق بود.");
      await loadOrders();
      notify("سفارش به‌روزرسانی شد.");
    } catch (error) { notify(error instanceof Error ? error.message : "به‌روزرسانی سفارش ناموفق بود."); }
  }
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const openNewProduct = (product?: Product) => {
    setEditingId(product?.id ?? null);
    setNewName(product?.name ?? "");
    setNewSku(product?.sku ?? "");
    setNewCategory(product?.category ?? "مراقبت پوست");
    setNewPrice(product ? String(product.price) : "");
    setNewStock(product ? String(product.stock) : "");
    setNewImage(null);
    setNewDescription(product?.description ?? "");
    setShowProductForm(true);
  };
  const saveProduct = async () => {
    if (!newName.trim() || !newSku.trim() || newPrice === "" || newStock === "") { notify("لطفاً فیلدهای ضروری را کامل کنید."); return; }
    if (!editingId && !newImage) { notify("برای محصول جدید تصویر انتخاب کنید."); return; }
    setSavingProduct(true);
    try {
      const form = new FormData();
      if (editingId) form.set("id", String(editingId));
      form.set("name", newName.trim()); form.set("sku", newSku.trim()); form.set("category", newCategory);
      form.set("price", newPrice); form.set("stock", newStock); form.set("description", newDescription);
      if (newImage) form.set("image", newImage);
      const response = await fetch("/api/admin/products", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ذخیره محصول ناموفق بود.");
      await loadProducts();
      setShowProductForm(false);
      notify(editingId ? "تغییرات محصول ذخیره شد." : "محصول در سایت ثبت شد.");
    } catch (error) { notify(error instanceof Error ? error.message : "ذخیره محصول ناموفق بود."); }
    finally { setSavingProduct(false); }
  };
  const deleteProduct = async (product: Product) => {
    if (!window.confirm("محصول «" + product.name + "» حذف شود؟ این عملیات قابل بازگشت نیست.")) return;
    try {
      const response = await fetch("/api/admin/products/" + product.id, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "حذف محصول ناموفق بود.");
      setProducts(old => old.filter(p => p.id !== product.id));
      notify("محصول حذف شد.");
    } catch (error) { notify(error instanceof Error ? error.message : "حذف محصول ناموفق بود."); }
  };
  const groups = Array.from(new Set(nav.map(n => n.group)));

  return (
    <main className="mia-admin" dir="rtl">
      {mobileNav && <button className="admin-scrim" aria-label="بستن منو" onClick={() => setMobileNav(false)} />}
      <aside className={"admin-sidebar " + (mobileNav ? "is-open" : "")}>
        <div className="admin-brand">
          <span className="admin-brand-mark">M</span>
          <span><b>MiaShop</b><small>BEAUTY COMMERCE</small></span>
          <button className="admin-close-mobile" onClick={() => setMobileNav(false)} aria-label="بستن"><X size={18}/></button>
        </div>
        <div className="admin-store-switch"><span className="store-avatar">M</span><span><b>فروشگاه میاشاپ</b><small>محیط مدیریت</small></span><ChevronDown size={15}/></div>
        <nav className="admin-nav">
          {groups.map(group => <div className="admin-nav-group" key={group}>
            <p>{group}</p>
            {nav.filter(item => item.group === group).map(item => {
              const Icon = item.icon;
              return <button key={item.title} className={section === item.title ? "active" : ""} onClick={() => { setSection(item.title); setMobileNav(false); }}>
                <Icon size={18} strokeWidth={1.8}/><span>{item.title}</span>
                
              </button>;
            })}
          </div>)}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-support"><span className="support-icon"><CircleHelp size={18}/></span><div><b>به راهنمایی نیاز دارید؟</b><small>راهنمای پنل مدیریت</small></div><ArrowUpLeft size={15}/></div>
          <a className="admin-profile" href="/api/admin/logout"><span className="profile-avatar">م</span><span><b>مدیر فروشگاه</b><small>خروج امن از پنل</small></span><LogOut size={16}/></a>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title"><button className="admin-menu-toggle" aria-label="باز کردن منو" onClick={() => setMobileNav(true)}><Menu size={21}/></button><div><div className="admin-breadcrumb">میاشاپ <span>/</span> مدیریت</div><h1>{section}</h1></div></div>
          <div className="admin-top-actions">
            <span className="admin-live"><i/> پیش‌نمایش پنل</span>
            <button className="admin-icon-btn" aria-label="اعلان‌ها" onClick={() => notify("فعلاً اعلان جدیدی وجود ندارد.")}><Bell size={18}/><i/></button>
            <a className="admin-view-site" href="/" target="_blank" rel="noreferrer"><ExternalLink size={15}/> مشاهده سایت</a>
          </div>
        </header>

        <div className="admin-content">
          {section === "داشبورد" && <>
            <div className="admin-welcome"><div><span className="admin-eyebrow"><Sparkles size={14}/> نمای کلی فروشگاه</span><h2>سلام، روز بخیر <span>✦</span></h2><p>وضعیت فروشگاهت را در یک نگاه بررسی کن.</p></div><div className="admin-date"><Clock3 size={15}/> آمار پس از اتصال پایگاه داده نمایش داده می‌شود</div></div>
            <div className="admin-stats-grid">
              <StatCard title="فروش کل" value="—" icon={<WalletCards size={19}/>} foot="در انتظار اتصال داده‌های واقعی فروش"/>
              <StatCard title="سفارش‌ها" value="—" icon={<ShoppingBag size={19}/>} foot="در انتظار اتصال سفارش‌های واقعی"/>
              <StatCard title="میانگین سبد خرید" value="—" icon={<ChartNoAxesCombined size={19}/>} foot="پس از ثبت سفارش واقعی محاسبه می‌شود"/>
              <StatCard title="محصولات کم‌موجود" value={products.length ? products.filter(p => p.status !== "فعال").length.toLocaleString("fa-IR") : "—"} icon={<Boxes size={19}/>} foot={products.length ? "فهرست محلی؛ هنوز متصل به انبار نیست" : "در انتظار اتصال انبار واقعی"}/>
            </div>
            <div className="admin-main-grid">
              <section className="admin-panel sales-panel"><div className="admin-panel-head"><div><h3>نمای کلی فروش</h3><p>عملکرد فروش در ۷ روز گذشته</p></div><button className="admin-select" onClick={() => notify("بازه‌های زمانی بیشتر در نسخه کامل گزارش‌ها فعال می‌شوند.")}>۷ روز گذشته <ChevronDown size={14}/></button></div>
                <div className="sales-summary"><b>— <small>تومان</small></b><span>داده فروش هنوز متصل نشده است</span></div>
                <div className="admin-empty">نمودار پس از اتصال به سفارش‌ها و پرداخت‌های واقعی نمایش داده می‌شود.</div>
              </section>
              <section className="admin-panel"><div className="admin-panel-head"><div><h3>میان‌برهای مدیریتی</h3><p>کارهای پرتکرار</p></div><SlidersHorizontal size={17}/></div><div className="admin-shortcuts">
                <button onClick={() => { setSection("محصولات"); openNewProduct(); }}><span className="shortcut-icon blush"><Plus size={19}/></span><span><b>افزودن محصول</b><small>ثبت کالای جدید</small></span><ArrowDownLeft size={16}/></button>
                <button onClick={() => setSection("سفارش‌ها")}><span className="shortcut-icon sage"><ShoppingCart size={19}/></span><span><b>مدیریت سفارش‌ها</b><small>بررسی سفارش‌های جدید</small></span><ArrowDownLeft size={16}/></button>
                <button onClick={() => setSection("پرداخت و اقساط")}><span className="shortcut-icon lilac"><CreditCard size={19}/></span><span><b>تنظیم پرداخت‌ها</b><small>درگاه‌های آنلاین و اقساط</small></span><ArrowDownLeft size={16}/></button>
                <button onClick={() => setSection("گزارش‌ها")}><span className="shortcut-icon sand"><FileText size={19}/></span><span><b>گزارش فروش</b><small>تحلیل عملکرد فروشگاه</small></span><ArrowDownLeft size={16}/></button>
              </div></section>
            </div>
            <section className="admin-panel orders-panel"><div className="admin-panel-head"><div><h3>آخرین سفارش‌ها</h3><p>آخرین فعالیت‌های ثبت‌شده در فروشگاه</p></div><button className="admin-text-btn" onClick={() => setSection("سفارش‌ها")}>مشاهده همه <ArrowDownLeft size={15}/></button></div><OrdersTable orders={orders} onManage={manageOrder}/></section>
            <section className="admin-panel integrations-panel"><div className="admin-panel-head"><div><h3>وضعیت اتصال‌ها</h3><p>نمای کلی سرویس‌های قابل اتصال</p></div><button className="admin-text-btn" onClick={() => setSection("پرداخت و اقساط")}>مدیریت اتصال‌ها <ArrowDownLeft size={15}/></button></div><div className="integration-cards">{["درگاه بانکی","اسنپ‌پی","ترب‌پی","باسلام"].map((name,i)=><div className="integration-mini" key={name}><span className={"provider-mark p"+i}>{["بانک","S","T","ب"][i]}</span><div><b>{name}</b><small>{providerEnabled[name] ? "فعال در پیش‌نمایش" : "نیازمند راه‌اندازی"}</small></div><i className={providerEnabled[name] ? "connected" : ""}/></div>)}</div></section>
          </>}

          {section === "محصولات" && <><div className="admin-page-intro"><div><h2>مدیریت محصولات</h2><p>کالاها، قیمت‌ها و موجودی انبار را مدیریت کن.</p></div><button className="admin-primary" onClick={() => openNewProduct()}><Plus size={17}/> افزودن محصول</button></div><div className="admin-stats-grid compact-stats"><StatCard title="کل محصولات" value={products.length.toLocaleString("fa-IR")} icon={<Package size={18}/>} foot="در فهرست فعلی"/><StatCard title="محصولات فعال" value={products.filter(p=>p.status==="فعال").length.toLocaleString("fa-IR")} icon={<Check size={18}/>} foot="آماده فروش"/><StatCard title="کم‌موجود / ناموجود" value={products.filter(p=>p.status!=="فعال").length.toLocaleString("fa-IR")} icon={<CircleAlert size={18}/>} foot="نیازمند رسیدگی"/></div><section className="admin-panel product-panel"><div className="product-toolbar"><label className="admin-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جست‌وجوی نام، کد یا دسته‌بندی محصول..."/></label><button className="admin-secondary" onClick={() => notify("فیلترهای پیشرفته در نسخه کامل فعال می‌شوند.")}><Filter size={16}/> فیلترها</button><button className="admin-secondary" onClick={() => notify("خروجی اکسل پس از اتصال داده‌های واقعی فعال می‌شود.")}><Download size={16}/> خروجی</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>محصول</th><th>کد کالا</th><th>دسته‌بندی</th><th>قیمت فروش</th><th>موجودی</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{filteredProducts.map(p=><tr key={p.id}><td><div className="product-name-cell"><span className="product-thumb">{p.image_url ? <img src={p.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:9}}/> : <Package size={19}/>}</span><b>{p.name}</b></div></td><td className="sku-cell">{p.sku}</td><td>{p.category}</td><td className="price-cell">{toman(p.price)}</td><td>{p.stock.toLocaleString("fa-IR")} عدد</td><td><span className={"status-pill "+(p.status==="فعال"?"success":p.status==="کم‌موجود"?"warning":"muted")}>{p.status}</span></td><td><button className="table-action" onClick={() => openNewProduct(p)}>ویرایش</button><button className="table-action" style={{color:"#b45f5c",marginRight:8}} onClick={() => void deleteProduct(p)}>حذف</button></td></tr>)}</tbody></table>{filteredProducts.length===0&&<div className="admin-empty">{query ? "محصولی با این مشخصات پیدا نشد." : "هنوز محصولی ثبت نشده است؛ برای شروع، «افزودن محصول» را انتخاب کنید."}</div>}</div><div className="admin-table-foot">نمایش {filteredProducts.length.toLocaleString("fa-IR")} محصول · ذخیره‌سازی متصل به پایگاه داده</div></section></>}

          {section === "سفارش‌ها" && <><div className="admin-page-intro"><div><h2>سفارش‌های فروشگاه</h2><p>وضعیت پرداخت، پردازش و ارسال سفارش‌ها را پیگیری کن.</p></div><button className="admin-secondary" onClick={() => notify("خروجی سفارش‌ها پس از اتصال پایگاه داده فعال می‌شود.")}><Download size={16}/> خروجی سفارش‌ها</button></div><div className="admin-stats-grid compact-stats"><StatCard title="همه سفارش‌ها" value="—" icon={<ShoppingBag size={18}/>} foot="در انتظار اتصال پایگاه داده"/><StatCard title="در انتظار پردازش" value="—" icon={<Clock3 size={18}/>} foot="پس از اتصال سفارش‌ها محاسبه می‌شود"/><StatCard title="در حال ارسال" value="—" icon={<Truck size={18}/>} foot="پس از اتصال ارسال محاسبه می‌شود"/></div><section className="admin-panel orders-panel"><OrdersTable/></section></>}

          {section === "پرداخت و اقساط" && <><div className="admin-page-intro"><div><h2>درگاه‌ها و پرداخت اقساطی</h2><p>اتصال‌ها را مدیریت کن؛ اتصال واقعی پس از پیاده‌سازی و دریافت اطلاعات پذیرندگی فعال می‌شود.</p></div><button className="admin-primary" onClick={() => notify("فرم اتصال اختصاصی پس از بررسی مستندات هر ارائه‌دهنده تکمیل می‌شود.")}><Plus size={17}/> افزودن اتصال</button></div><div className="admin-notice"><ShieldCheck size={19}/><span><b>امنیت پرداخت</b><small>کلیدهای محرمانه باید فقط در سمت سرور نگهداری شوند. وضعیت این صفحه نمایشی است و هیچ تراکنش واقعی انجام نمی‌دهد.</small></span></div><div className="payment-provider-list">{[{name:"درگاه بانکی",desc:"پرداخت آنلاین مستقیم با کارت‌های بانکی",mark:"بانک",key:"درگاه بانکی"},{name:"اسنپ‌پی",desc:"خرید اعتباری و پرداخت اقساطی",mark:"S",key:"اسنپ‌پی"},{name:"ترب‌پی",desc:"ارائه‌دهنده پرداخت اعتباری؛ نیازمند تأیید سرویس",mark:"T",key:"ترب‌پی"},{name:"باسلام",desc:"بررسی امکان همکاری و اتصال مستقیم به فروشگاه",mark:"ب",key:"باسلام"}].map((p,i)=><div className="provider-row" key={p.name}><span className={"provider-mark p"+i}>{p.mark}</span><div className="provider-info"><b>{p.name}</b><small>{p.desc}</small></div><span className={"provider-status "+(providerEnabled[p.key]?"on":"off")}>{providerEnabled[p.key]?"فعال در پیش‌نمایش":"راه‌اندازی نشده"}</span><button className={"toggle-switch "+(providerEnabled[p.key]?"on":"")} aria-label={"تغییر وضعیت "+p.name} onClick={()=>{setProviderEnabled(old=>({...old,[p.key]:!old[p.key]}));notify("وضعیت نمایشی تغییر کرد؛ اتصال واقعی هنوز برقرار نیست.");}}><i/></button><button className="provider-config" onClick={()=>notify("برای اتصال واقعی، مستندات فنی و اطلاعات پذیرندگی لازم است.")}>تنظیمات <ArrowDownLeft size={14}/></button></div>)}</div><div className="admin-panel"><div className="admin-panel-head"><div><h3>تراکنش‌ها</h3><p>فقط تراکنش‌های واقعی پس از اتصال درگاه نمایش داده می‌شوند.</p></div></div><div className="admin-empty">هنوز تراکنش واقعی متصل نیست؛ هیچ تراکنش نمونه‌ای نمایش داده نمی‌شود.</div></div></>}

          {section !== "داشبورد" && section !== "محصولات" && section !== "سفارش‌ها" && section !== "پرداخت و اقساط" && <ComingSoon section={section} onNotify={notify}/>}
          <footer className="admin-footer"><span>© MiaShop · پنل مدیریت فروشگاه</span><span><ShieldCheck size={14}/> کاتالوگ و سفارش‌ها به پایگاه داده متصل‌اند</span></footer>
        </div>
      </section>

      {showProductForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowProductForm(false);}}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title"><div className="admin-modal-head"><div><span className="admin-eyebrow">کاتالوگ محصولات</span><h2 id="product-form-title">{editingId?"ویرایش محصول":"افزودن محصول جدید"}</h2><p>اطلاعات پایه محصول را وارد کن.</p></div><button className="admin-icon-btn" onClick={()=>setShowProductForm(false)} aria-label="بستن فرم"><X size={18}/></button></div><div className="admin-form-grid"><label className="admin-field full"><span>نام محصول *</span><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="مثلاً سرم آبرسان هیالورونیک"/></label><label className="admin-field"><span>کد کالا / SKU *</span><input value={newSku} onChange={e=>setNewSku(e.target.value)} placeholder="MIA-1006"/></label><label className="admin-field"><span>دسته‌بندی</span><select value={newCategory} onChange={e=>setNewCategory(e.target.value)}><option>مراقبت پوست</option><option>آرایش</option><option>عطر و رایحه</option><option>بهداشت شخصی</option><option>مراقبت مو</option></select></label><label className="admin-field"><span>قیمت فروش (تومان) *</span><input type="number" min="0" value={newPrice} onChange={e=>setNewPrice(e.target.value)} placeholder="890000"/></label><label className="admin-field"><span>موجودی انبار *</span><input type="number" min="0" value={newStock} onChange={e=>setNewStock(e.target.value)} placeholder="20"/></label><label className="admin-field full"><span>تصویر محصول {editingId ? "(در صورت نیاز تصویر جدید انتخاب کنید)" : "*"}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>setNewImage(e.target.files?.[0] ?? null)}/>{newImage && <small>{newImage.name} · {(newImage.size / 1024 / 1024).toFixed(2)} MB</small>}{editingId && products.find(p=>p.id===editingId)?.image_url && <img src={products.find(p=>p.id===editingId)?.image_url ?? ""} alt="تصویر فعلی محصول" style={{width:96,height:96,objectFit:"cover",borderRadius:10}}/>}</label><label className="admin-field full"><span>توضیحات محصول</span><textarea value={newDescription} onChange={e=>setNewDescription(e.target.value)} rows={3} placeholder="توضیحات کوتاه محصول"/></label></div><div className="admin-modal-note"><ImageIcon size={17}/><span>تصویر در Supabase Storage ذخیره می‌شود و محصول پس از ثبت موفق در فروشگاه نمایش داده می‌شود.</span></div><div className="admin-modal-actions"><button className="admin-secondary" onClick={()=>setShowProductForm(false)}>انصراف</button><button className="admin-primary" disabled={savingProduct} onClick={() => void saveProduct()}><Check size={16}/> {savingProduct ? "در حال ذخیره…" : editingId?"ذخیره تغییرات":"افزودن محصول به سایت"}</button></div></section></div>}
      {toast && <div className="admin-toast"><Check size={17}/>{toast}</div>}
    </main>
  );
}

function StatCard({title,value,unit,change,positive,icon,foot}:{title:string;value:string;unit?:string;change?:string;positive?:boolean;icon:React.ReactNode;foot:string}) {
  return <div className="admin-stat-card"><div className="stat-card-top"><span>{title}</span><i>{icon}</i></div><div className="stat-value">{value}{unit&&<small> {unit}</small>}</div><div className="stat-card-bottom"><span className={change?(positive?"stat-positive":"stat-neutral"):"stat-neutral"}>{change}</span><small>{foot}</small></div></div>;
}

function OrdersTable({orders,onManage}:{orders:AdminOrder[];onManage:(order:AdminOrder)=>void}) {
  if (orders.length === 0) return <div className="admin-empty">هنوز سفارشی در پایگاه داده ثبت نشده است.</div>;
  const labels: Record<string,string> = { awaiting_payment:"در انتظار پرداخت", paid:"پرداخت‌شده", processing:"در حال آماده‌سازی", shipped:"ارسال‌شده", delivered:"تحویل‌شده", cancelled:"لغوشده", returned:"مرجوعی" };
  const tones: Record<string,string> = { awaiting_payment:"pending", paid:"success", processing:"info", shipped:"info", delivered:"success", cancelled:"danger", returned:"warning" };
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>شماره سفارش</th><th>مشتری / تماس</th><th>تاریخ ثبت</th><th>مبلغ کالاها</th><th>وضعیت</th><th>رهگیری</th><th>عملیات</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td className="order-id">{order.order_code}</td><td>{order.customer_name}<small style={{display:"block",color:"#999"}}>{order.phone}</small></td><td className="date-cell">{new Date(order.created_at).toLocaleDateString("fa-IR")}</td><td className="price-cell">{toman(Number(order.total))}</td><td><span className={"status-pill "+(tones[order.order_status]||"muted")}>{labels[order.order_status]||order.order_status}</span></td><td>{order.tracking_code||"—"}</td><td><button className="table-action" onClick={()=>onManage(order)}>وضعیت / رهگیری</button></td></tr>)}</tbody></table></div>;
}

function ComingSoon({section,onNotify}:{section:Section;onNotify:(message:string)=>void}) {
  const info:Record<string,{icon:typeof Users;title:string;desc:string;features:string[]}> = {
    "مشتریان":{icon:Users,title:"مدیریت مشتریان",desc:"پروفایل مشتری، تاریخچه خرید و ارتباطات در یک محل.",features:["جست‌وجو و فیلتر مشتریان","سوابق سفارش و مبلغ خرید","گروه‌بندی مشتریان وفادار"]},
    "انبار و ارسال":{icon:Truck,title:"انبار و ارسال",desc:"کنترل موجودی و پیگیری ارسال سفارش‌ها.",features:["هشدار کمبود موجودی","مدیریت روش‌های ارسال","ثبت کد رهگیری و مرجوعی"]},
    "بازاریابی":{icon:Megaphone,title:"بازاریابی و وفادارسازی",desc:"ابزارهای جذب مشتری و افزایش خرید مجدد.",features:["کد تخفیف و کمپین زمان‌دار","پیامک و ایمیل تبلیغاتی","سبد خرید رهاشده"]},
    "محتوای سایت":{icon:ImageIcon,title:"مدیریت محتوای سایت",desc:"مدیریت صفحه اصلی و محتوای تبلیغاتی بدون تغییر کد.",features:["بنرها و اسلایدرها","صفحات و محتوای سئو","چیدمان بخش‌های صفحه اصلی"]},
    "گزارش‌ها":{icon:ChartNoAxesCombined,title:"گزارش‌ها و تحلیل فروش",desc:"تصمیم‌گیری بر اساس شاخص‌های قابل اندازه‌گیری.",features:["فروش به تفکیک محصول و برند","نرخ تبدیل و میانگین سبد خرید","خروجی CSV و اکسل"]},
    "تنظیمات":{icon:Settings2,title:"تنظیمات فروشگاه",desc:"تنظیمات عملیاتی، امنیتی و دسترسی مدیران.",features:["نقش‌ها و سطح دسترسی","اطلاعات فروشگاه و سئو","گزارش فعالیت مدیران و امنیت"]},
  };
  const item=info[section]??info["تنظیمات"]; const Icon=item.icon;
  return <><div className="admin-page-intro"><div><h2>{item.title}</h2><p>{item.desc}</p></div><button className="admin-secondary" onClick={()=>onNotify("این بخش در طراحی پنل ثبت شده و در مراحل بعدی تکمیل می‌شود.")}><CircleHelp size={16}/> جزئیات قابلیت‌ها</button></div><section className="admin-panel module-preview"><span className="module-preview-icon"><Icon size={26}/></span><span className="admin-eyebrow">بخش پنل مدیریت</span><h2>{item.title}</h2><p>{item.desc}</p><div className="module-feature-grid">{item.features.map(f=><div key={f}><Check size={17}/>{f}</div>)}</div><button className="admin-primary" onClick={()=>onNotify("بخش "+section+" برای مرحله پیاده‌سازی بعدی آماده ثبت است.")}>ثبت در برنامه پیاده‌سازی <ArrowDownLeft size={16}/></button></section></>;
}
