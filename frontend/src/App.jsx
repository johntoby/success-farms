import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownWideNarrow, ArrowRight, Check, ChevronDown, CirclePlus, Clock3,
  Leaf, LoaderCircle, MapPin, Menu, Pencil, Search, ShoppingBasket, Sparkles,
  Sprout, Trash2, Truck, X,
} from 'lucide-react';

const emptyProduct = {
  name: '',
  category: 'Fresh produce',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

async function request(path, options) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail || body?.message || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

function BrandMark({ small = false }) {
  return (
    <span className={`brand-mark${small ? ' brand-mark-small' : ''}`}>
      <Sprout size={small ? 19 : 23} strokeWidth={1.8} />
    </span>
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="product-card">
      <div className={`product-image ${imageFailed || !product.imageUrl ? 'image-fallback' : ''}`}>
        {product.imageUrl && !imageFailed
          ? <img src={product.imageUrl} alt={product.name} loading="lazy" onError={() => setImageFailed(true)} />
          : <Sprout size={52} strokeWidth={1.15} />}
        <span className={`stock-badge${product.stock <= 5 ? ' stock-low' : ''}`}>
          <span />{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </span>
        <div className="card-actions">
          <button type="button" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`} title="Edit product">
            <Pencil size={15} />
          </button>
          <button type="button" className="delete-action" onClick={() => onDelete(product)} aria-label={`Delete ${product.name}`} title="Delete product">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <div className="product-heading">
          <h3>{product.name}</h3>
          <span className="product-price">{money.format(Number(product.price))}</span>
        </div>
        <p className="product-description">{product.description}</p>
        <span className="product-unit">Per item</span>
      </div>
    </article>
  );
}

function ProductDialog({ product, onClose, onSave, saving }) {
  const [form, setForm] = useState(product || emptyProduct);
  const [formError, setFormError] = useState('');
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    try {
      await onSave({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl.trim(),
      });
    } catch (error) {
      setFormError(error.message);
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">{product ? 'YOUR FARM STAND' : 'FRESHLY PICKED'}</span>
            <h2 id="dialog-title">{product ? 'Update your product' : 'Add to the stand'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </div>
        <form onSubmit={submit}>
          <label>Product name<input name="name" value={form.name} onChange={update} placeholder="e.g. Heirloom tomatoes" maxLength="255" required /></label>
          <label>Category
            <select name="category" value={form.category} onChange={update}>
              {['Fresh produce', 'Fruit', 'Bakery', 'Pantry', 'Dairy', 'Flowers', 'Other'].map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="field-full">Description<textarea name="description" value={form.description} onChange={update} placeholder="A little about what makes it special..." maxLength="1000" rows="3" required /></label>
          <label>Price (USD)<input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={update} placeholder="0.00" required /></label>
          <label>Units in stock<input name="stock" type="number" min="0" step="1" value={form.stock} onChange={update} placeholder="0" required /></label>
          <label className="field-full">Product photo URL <span className="optional-label">Optional</span>
            <input name="imageUrl" type="url" maxLength="1000" value={form.imageUrl || ''} onChange={update} placeholder="https://..." />
          </label>
          {formError && <p className="form-error field-full">{formError}</p>}
          <div className="dialog-footer field-full">
            <button type="button" className="button button-quiet" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}
              {saving ? 'Saving...' : product ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All produce');
  const [sortOrder, setSortOrder] = useState('featured');
  const [dialogProduct, setDialogProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function loadProducts() {
    setLoading(true);
    try {
      setProducts(await request('/api/products'));
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const categories = useMemo(() => ['All produce', ...new Set(products.map((product) => product.category))], [products]);
  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === 'All produce' || product.category === category;
      const matchesSearch = `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    if (sortOrder === 'price-low') return filtered.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortOrder === 'price-high') return filtered.sort((a, b) => Number(b.price) - Number(a.price));
    return filtered;
  }, [products, category, query, sortOrder]);

  async function saveProduct(data) {
    setSaving(true);
    try {
      const editing = Boolean(dialogProduct);
      const saved = await request(editing ? `/api/products/${dialogProduct.id}` : '/api/products', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      });
      setProducts((current) => editing
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved]);
      setDialogOpen(false);
      setNotice(editing ? 'Product details updated.' : 'Product added to your farm stand.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Remove ${product.name} from your farm stand?`)) return;
    try {
      await request(`/api/products/${product.id}`, { method: 'DELETE' });
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setNotice(`${product.name} has been removed.`);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function openDialog(product = null) {
    setDialogProduct(product);
    setDialogOpen(true);
  }

  const inventoryCount = products.reduce((sum, product) => sum + Number(product.stock), 0);

  return (
    <>
      <div className="announcement">
        <Sparkles size={14} /> Grown close to home. Good things, picked fresh. <ArrowRight size={13} />
      </div>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Success Farms home">
          <BrandMark />
          <span className="brand-name">success<span>farms</span><small>INC. · GROWN WITH CARE</small></span>
        </a>
        <button type="button" className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={menuOpen ? 'site-nav nav-open' : 'site-nav'}>
          <a href="#our-story" onClick={() => setMenuOpen(false)}>Our story</a>
          <a className="nav-active" href="#farm-stand" onClick={() => setMenuOpen(false)}>Farm stand</a>
          <a href="#our-values" onClick={() => setMenuOpen(false)}>Our values</a>
        </nav>
        <a className="header-note" href="#farm-stand"><ShoppingBasket size={17} /> Shop the harvest <ArrowRight size={15} /></a>
      </header>

      <main>
        <section className="hero" id="our-story">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> A LITTLE MORE LOCAL</span>
            <h1>Good food.<br />Grown <em>together.</em></h1>
            <p>We're a family-run farm with a simple belief: the best things grow when you take the time to care.</p>
            <a className="button button-dark" href="#farm-stand">Explore the farm stand <ArrowRight size={17} /></a>
            <div className="hero-note"><span className="avatar-stack"><i>🌱</i><i>☀️</i><i>🌾</i></span><span>Growing good things for our community<br /><strong>Since 1986</strong></span></div>
          </div>
          <div className="hero-visual">
            <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=90" alt="Golden evening light falling over the farm fields" />
            <div className="hero-photo-caption"><span className="caption-icon"><Leaf size={17} /></span><span>Rooted here, growing for you.<small>Our farm · Cedar Valley</small></span></div>
            <div className="hero-sticker"><span>FRESH FROM</span><strong>our<br />farm</strong><Sprout size={20} /></div>
          </div>
          <div className="hero-seal"><span>GOOD SOIL</span><Leaf size={15} /><span>GOOD SOUL</span></div>
        </section>

        <section className="benefit-strip" id="our-values">
          <div><Sprout size={19} /><span>Grown with intention<small>Care in every row</small></span></div>
          <div><MapPin size={19} /><span>Rooted in our community<small>Always close to home</small></span></div>
          <div><Clock3 size={19} /><span>Picked at its peak<small>Fresh from the field</small></span></div>
          <div><Truck size={20} /><span>Goodness, made easy<small>From our farm to your table</small></span></div>
        </section>

        <section className="market-section" id="farm-stand">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" /> STRAIGHT FROM OUR FIELDS</span>
              <h2>A good day <em>starts here.</em></h2>
              <p>Little harvests, big heart. See what's fresh at our farm stand this week.</p>
            </div>
            <button type="button" className="button button-outline" onClick={() => openDialog()}><CirclePlus size={18} /> Add a product</button>
          </div>
          <div className="market-toolbar">
            <div className="category-list">
              {categories.map((item) => (
                <button type="button" key={item} className={category === item ? 'category-pill category-selected' : 'category-pill'} onClick={() => setCategory(item)}>{item}</button>
              ))}
            </div>
            <div className="toolbar-right">
              <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find something lovely..." aria-label="Search products" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}</label>
              <label className="sort-box"><ArrowDownWideNarrow size={15} /><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={14} /></label>
            </div>
          </div>

          {error && <div className="error-banner" role="alert"><span>We couldn't reach the farm stand: {error}</span><button type="button" onClick={loadProducts}>Try again</button></div>}
          {loading ? (
            <div className="loading-state"><LoaderCircle className="spin" size={26} /><p>Gathering the good stuff...</p></div>
          ) : visibleProducts.length ? (
            <div className="product-grid">
              {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onEdit={openDialog} onDelete={deleteProduct} />)}
            </div>
          ) : (
            <div className="empty-state"><div><Search size={22} /></div><h3>Nothing in this patch just yet.</h3><p>Try a different search or add something fresh to the stand.</p><button className="button button-outline" type="button" onClick={() => openDialog()}><CirclePlus size={17} /> Add a product</button></div>
          )}

          {!loading && products.length > 0 && (
            <div className="market-footer"><span>Showing <strong>{visibleProducts.length}</strong> of <strong>{products.length}</strong> farm-fresh favorites</span><span><Leaf size={15} /> <strong>{inventoryCount}</strong> items ready for the picking</span></div>
          )}
        </section>

        <section className="bottom-note">
          <div className="bottom-note-icon"><Sprout size={26} /></div>
          <div><span className="eyebrow">A NOTE FROM THE FARM</span><p>Good food takes time. We're glad you're here for it.</p></div>
          <a href="#farm-stand">See what's growing <ArrowRight size={16} /></a>
        </section>
      </main>
      <footer className="site-footer">
        <a className="brand footer-brand" href="#" aria-label="Success Farms home"><BrandMark small /><span className="brand-name">success<span>farms</span><small>INC. · GROWN WITH CARE</small></span></a>
        <span>Good things grow here. © {new Date().getFullYear()} Success Farms Inc.</span>
        <span>Grown with <Leaf size={13} /> in Cedar Valley</span>
      </footer>

      {dialogOpen && <ProductDialog product={dialogProduct} onClose={() => setDialogOpen(false)} onSave={saveProduct} saving={saving} />}
      {notice && <div className="toast" role="status"><Check size={17} />{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
    </>
  );
}

export default App;
