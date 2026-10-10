import { useEffect, useState } from 'react'
import ItemCard from '../components/ItemCard'
import { api } from "../api/api"

const ItemsList = () => {
    const [items, setItems] = useState([])

    useEffect (() => {
        async function loadItems() {
        try {
            const data = await api.getItems()
            setItems(data.data) 
        } catch (error) {
            console.error(error)
        }
        }
        loadItems()
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