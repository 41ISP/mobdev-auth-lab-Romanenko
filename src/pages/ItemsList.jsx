import ItemCard from '../components/ItemCard'
import { api } from '../api/api'
import { useEffect } from 'react'

const ItemsList = () => {
const [items, setItems] = setItems([])
const [error, setError] = useState([])
useEffect(() => {
const fetchItems = async () =>{

try {
setLoading(true)
setError(null)
const responce = await api.getItems()
setItems(responce.data)

} catch (err) {
setError(err.message || 'Не удалось загрузить товары')
} finally {
setLoading(false)
}



}
fetchItems()

}, [])

    return (
        <div className="container">
            <div class="page-header">
                <h1>Все товары</h1>
            </div>
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-value">0</span>
                    <span class="stat-label">Товаров</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">0</span>
                    <span class="stat-label">Ставок</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">0</span>
                    <span class="stat-label">Активных</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">0₽</span>
                    <span class="stat-label">Средняя цена</span>
                </div>
            </div>

            <div class="items-grid">
                {items.map((item, i) => (
                    <ItemCard key={i} {...item} />
                ))}
            </div>
        </div>
    )
}

export default ItemsList
