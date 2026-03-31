import { useState, useEffect } from 'react'

const CATEGORIES = ['全部', '零食', '饮料', '日用品', '调味料', '其他']

const DEFAULT_ITEMS = [
  { id: 1, name: '薯片', category: '零食', quantity: 2, unit: '包' },
  { id: 2, name: '可乐', category: '饮料', quantity: 5, unit: '瓶' },
  { id: 3, name: '洗衣液', category: '日用品', quantity: 1, unit: '瓶' },
  { id: 4, name: '酱油', category: '调味料', quantity: 1, unit: '瓶' },
]

function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('homeInventory')
    return saved ? JSON.parse(saved) : DEFAULT_ITEMS
  })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', category: '零食', quantity: 1, unit: '个' })

  useEffect(() => {
    localStorage.setItem('homeInventory', JSON.stringify(items))
  }, [items])

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === '全部' || item.category === category
    return matchSearch && matchCategory
  })

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({ name: '', category: '零食', quantity: 1, unit: '个' })
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({ ...item })
    setShowModal(true)
  }

  const saveItem = () => {
    if (!formData.name.trim()) return

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id ? { ...formData, id: item.id } : item
      ))
    } else {
      setItems([...items, { ...formData, id: Date.now() }])
    }
    setShowModal(false)
  }

  const deleteItem = (id) => {
    if (confirm('确定要删除这个物品吗？')) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateQuantity = (id, delta) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ))
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🏠 家庭库存</h1>
        <p>共 {items.length} 种物品</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="搜索物品..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-tab ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="item-list">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>暂无物品</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="item-card">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>{item.category} · {item.quantity <= 1 && <span className="low-stock">存量不足! </span>}</p>
              </div>
              <div className="item-quantity">
                <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>-</button>
                <span className="qty-num">{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
              </div>
              <div className="item-actions">
                <button className="edit-btn" onClick={() => openEditModal(item)}>编辑</button>
                <button className="delete-btn" onClick={() => deleteItem(item.id)}>删除</button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="add-btn" onClick={openAddModal}>+</button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? '编辑物品' : '添加物品'}</h2>
            <input
              type="text"
              placeholder="物品名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.filter(c => c !== '全部').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="数量"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            />
            <input
              type="text"
              placeholder="单位（个/包/瓶等）"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn-save" onClick={saveItem}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
