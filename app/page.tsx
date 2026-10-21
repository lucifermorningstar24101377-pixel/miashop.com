"use client";

import { useMemo, useState } from "react";
import {
  Search, ShoppingBag, Heart, Sparkles, ShieldCheck, ArrowLeft,
  Plus, X, Minus, Instagram, Menu, ChevronLeft, Flower2, Gift,
  PackageCheck, SlidersHorizontal
} from "lucide-react";

const products = [
  { id: 1, name: "سرم آبرسان هیالورونیک", brand: "The Ordinary", price: 890000, old: 1120000, cat: "پوست", tone: "sand", tag: "پرفروش", mark: "✧", type: "serum" },
  { id: 2, name: "رژ لب مات مخملی", brand: "Flormar", price: 465000, cat: "آرایش", tone: "rose", tag: "تازه رسیده", mark: "◒", type: "lipstick" },
  { id: 3, name: "ادو پرفیوم زنانه", brand: "Lattafa", price: 2180000, old: 2650000, cat: "عطر", tone: "lilac", tag: "انتخاب ویژه", mark: "❋", type: "perfume" },
  { id: 4, name: "کرم مرطوب‌کننده روز", brand: "CeraVe", price: 1240000, cat: "پوست", tone: "mint", mark: "◌", type: "jar" },
  { id: 5, name: "ریمل حجم‌دهنده", brand: "Maybelline", price: 735000, old: 890000, cat: "آرایش", tone: "peach", tag: "محبوب", mark: "✦", type: "mascara" },
  { id: 6, name: "عطر جیبی یونیسکس", brand: "Zara", price: 980000, cat: "عطر", tone: "blue", mark: "❈", type: "perfume" },
  { id: 7, name: "ضدآفتاب بی‌رنگ SPF 50", brand: "La Roche-Posay", price: 1570000, cat: "پوست", tone: "yellow", tag: "روتین روزانه", mark: "☼", type: "tube" },
  { id: 8, name: "پالت سایه نچرال", brand: "Revolution", price: 1120000, cat: "آرایش", tone: "plum", mark: "✧", type: "palette" }
];

const toman = (n: number) => n.toLocaleString("fa-IR") + " تومان";

const categories = [
  { title: "مراقبت پوست", en: "SKINCARE", cat: "پوست", tone: "cat-skin", mark: "✧", note: "روتینِ پوستِ تو" },
  { title: "آرایش و زیبایی", en: "MAKEUP", cat: "آرایش", tone: "cat-makeup", mark: "◒", note: "رنگی برای حالِ خوب" },
  { title: "عطر و رایحه", en: "FRAGRANCE", cat: "عطر", tone: "cat-scent", mark: "❋", note: "امضای نامرئی تو" }
];

export default function Home() {
  const [cat, setCat] = useState("همه");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [open, setOpen] = useState(false);
  const [likes, setLikes] = useState<number[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sort, setSort] = useState("featured");

  const list = useMemo(() => {
    const filtered = products.filter((p) =>
      (cat === "همه" || p.cat === cat) &&
      (p.name + p.brand).toLowerCase().includes(q.toLowerCase())
    );
    if (sort === "low") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [cat, q, sort]);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = products.reduce((s, p) => s + p.price * (cart[p.id] || 0), 0);
  const add = (id: number, n: number) => setCart((old) => ({ ...old, [id]: Math.max(0, (old[id] || 0) + n) }));
  const chooseCategory = (value: string) => {
    setCat(value);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
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
          <label className="search">
            <Search size={17} />
            <input value={q} onChange={(e) => { setQ(e.target.value); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }} placeholder="دنبال چی می‌گردی؟" aria-label="جست‌وجوی محصولات" />
            {q && <button type="button" className="clear-search" onClick={() => setQ("")} aria-label="پاک کردن جست‌وجو"><X size={13} /></button>}
          </label>
          <button className="bag" onClick={() => setOpen(true)} aria-label="باز کردن سبد خرید">
            <ShoppingBag size={21} />{count > 0 && <i>{count.toLocaleString("fa-IR")}</i>}
          </button>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenu((v) => !v)} aria-label="باز و بسته کردن منو"><Menu size={21} /></button>
        </div>
      </header>

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
            <button className={"category-card " + item.tone} key={item.cat} onClick={() => chooseCategory(item.cat)}>
              <span className="category-number">{"۰" + (index + 1).toLocaleString("fa-IR")}</span>
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
                <span className="visual-grain" />
                <div className={"shape shape-" + p.type}><b>{p.mark}</b><small>{p.brand.toUpperCase()}</small></div>
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
        {list.length === 0 && <p className="empty">محصولی پیدا نشد؛ عبارت دیگری را جست‌وجو کن.</p>}
        <div className="catalog-foot"><span>در حال حاضر مجموعه‌ای منتخب از محصولات نمایشی را می‌بینی.</span><a className="text-link" href="#home">بازگشت به بالا <ArrowLeft size={15} /></a></div>
      </section>

      <section className="newsletter wrap">
        <div className="newsletter-mark"><Gift size={25} /></div>
        <div className="newsletter-copy"><small>THE MIA LETTER</small><h2>نامه‌هایی برای <em>حالِ بهتر</em></h2><p>تازه‌های زیبایی و ایده‌های روتین را در یک جای خلوت دنبال کن.</p></div>
        <form onSubmit={(e) => { e.preventDefault(); alert("خبرنامه در این نسخهٔ نمایشی هنوز به سرویس ارسال ایمیل متصل نیست."); }}>
          <input type="email" required placeholder="آدرس ایمیل تو" aria-label="آدرس ایمیل" /><button>به خبرنامه بپیوند <ArrowLeft size={16} /></button>
        </form>
        <b className="flower">✳</b>
      </section>

      <footer>
        <div className="wrap foot">
          <div className="foot-brand"><a className="brandlogo" href="#home"><b>m.</b><span>میاشاپ<small>BEAUTY, YOUR WAY</small></span></a><p>زیبایی از انتخاب‌های کوچک شروع می‌شود. انتخاب‌های روزمره‌ات را کمی خاص‌تر کن.</p><a className="social-link" href="#home" aria-label="اینستاگرام میاشاپ"><Instagram size={17} /> <span>همراه میاشاپ باش</span></a></div>
          <div><b>خرید و کشف</b><a href="#products">همه محصولات</a><a href="#categories">مراقبت پوست</a><a href="#categories">آرایش و زیبایی</a><a href="#categories">عطر و رایحه</a></div>
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

      {open && <div className="shade" onClick={() => setOpen(false)}><aside className="drawer" onClick={(e) => e.stopPropagation()}><div className="drawhead"><h2>سبد خرید ({count.toLocaleString("fa-IR")})</h2><button onClick={() => setOpen(false)} aria-label="بستن"><X /></button></div>
        {count === 0 ? <div className="emptycart"><ShoppingBag /><h3>سبد خریدت خالیه</h3><p>چند محصول دوست‌داشتنی بهش اضافه کن.</p><button className="btn" onClick={() => setOpen(false)}>دیدن محصولات</button></div> : <>
          <div className="cartlist">{products.filter((p) => cart[p.id] > 0).map((p) => <div className="cartitem" key={p.id}><span className={"thumb " + p.tone}>{p.mark}</span><div><b>{p.name}</b><small>{toman(p.price)}</small><div className="qty"><button onClick={() => add(p.id, -1)} aria-label="کم کردن"><Minus size={13} /></button>{cart[p.id].toLocaleString("fa-IR")}<button onClick={() => add(p.id, 1)} aria-label="زیاد کردن"><Plus size={13} /></button></div></div></div>)}</div>
          <div className="cartfoot"><span>مجموع <b>{toman(total)}</b></span><button className="btn" onClick={() => alert("درگاه پرداخت در این نسخهٔ نمایشی متصل نیست.")}>ادامه و پرداخت <ArrowLeft size={16} /></button><small>این سبد نمایشی است؛ پرداخت واقعی فعال نیست.</small></div>
        </>}
      </aside></div>}
    </main>
  );
}
