import { Link, useNavigate, useParams } from "react-router-dom"
import Input from "../components/Input"
import Button from "../components/Button"
import { useEffect, useState } from "react"
import { api } from "../api/api"
import { useUserStore } from "../store/useUserStore"

const ItemDetail = () => {
    const { id } = useParams()
    const [item, setItem] = useState(undefined)
    const [error, setError] = useState("")
    const [bids, setBids] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    
    const { session } = useUserStore()
    const navigate = useNavigate()

    const loadItem = async () => {
        try {
            const data = await api.getItem(id)
            setItem(data)
        } catch (err) {
            setError(err.response?.data?.error || "Ошибка загрузки товара")
        } finally {
            setIsLoading(false)
        }
    }

    const loadBids = async () => {
        try {
            const data = await api.getItemBids(id)
            setBids(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error(error)
            setBids([])
        }
    }

    useEffect(() => {
        loadItem()
        loadBids()
        const timer = setInterval(() => {
            loadItem()
            loadBids()
        }, 10000)
        
        return () => clearInterval(timer)
    }, [id])

    const handleBid = async (e) => {
        e.preventDefault()
        setError("")
        const form = e.target
        const amount = Number(form.bidInput.value)

        try {
            await api.createBid({ id, amount })
            form.reset()
            await loadItem()
            await loadBids()
        } catch (error) {
            console.error(error)
            setError(error.response?.data?.error || "Ошибка при создании ставки")
        }
    }

    const handleDelete = async () => {
        try {
            await api.deleteItems(id)
            navigate("/")
        } catch (error) {
            setError(error.response?.data?.error || "Не удалось удалить товар (возможно, уже есть ставки)")
        }
    }

    if (isLoading) return <div className="container"><h2>Загрузка...</h2></div>
    if (!item) return <div className="container"><h2>Товар не найден</h2></div>

    const minBid = item.highestBid ?? item.price
    const isOwner = session?.user?.id === item.userId

    return (
        <div className="container">
            {error && <div className="alert alert-error active">{error}</div>}
            
            <div className="item-detail">
                <div className="item-header">
                    <div>
                       <img 
                            src={item.imageUrl} 
                            className="item-image-large" 
                            alt={item.title} 
                            onError={(e) => { e.target.style.display = 'none' }}
                            />
                    </div>

                    <div className="item-info">
                        <Link to={"/"} className="back-link">← Вернуться к списку товаров</Link>
                        <span className="item-status">{item.status}</span>

                        <h1 className="item-title-large">{item.title}</h1>

                        <div className="item-seller-info">
                            <div className="seller-avatar">{item.username.slice(0, 2).toUpperCase()}</div>
                            <div className="seller-details">
                                <div className="seller-name">{item.username}</div>
                                <div className="seller-date">{new Date(item.createdAt).toLocaleString("ru-RU")}</div>
                            </div>
                        </div>

                        <div className="item-description-full">
                            {item.description}
                        </div>

                        <div className="price-section">
                            <div className="starting-price">Начальная цена:</div>
                            <div className="current-price">{item.price} ₽</div>
                            <div className="highest-bid">Текущая ставка: {item.highestBid ? `${item.highestBid} ₽` : "ставок нет"}</div>
                            
                            {isOwner ? (
                                bids.length === 0 && (
                                    <button className="btn-delete" onClick={handleDelete}>
                                        <span>❌</span> Удалить товар
                                    </button>
                                )
                            ) : (
                                <form className="bid-form" onSubmit={handleBid}>
                                    <Input
                                        type="number"
                                        name="bidInput"
                                        className="bid-input"
                                        placeholder={`Введите вашу ставку (мин. ${minBid} ₽)`}
                                        min={minBid + 1}
                                        step="100"
                                        required
                                    />
                                    <Button type="submit" className="btn-bid">Сделать ставку</Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bids-section">
                    <div className="bids-header">
                        <h2 className="bids-title">История ставок</h2>
                        <span className="bids-count">{bids.length}</span>
                    </div>

                    <div className="bids-list">
                        {bids.length === 0 ? (
                            <p style={{ color: '#7f8c8d' }}>Пока никто не сделал ставку.</p>
                        ) : (
                            bids.map((bid, index) => (
                                <div className={`bid-item ${index === 0 ? "highest-bid-item" : ""}`} key={bid.id ?? index}>
                                    <div className="bid-user">
                                        <div className="bid-avatar">{bid.username.slice(0, 2).toUpperCase()}</div>
                                        <div className="bid-details">
                                            <span className="bid-username">{bid.username}</span>
                                            <span className="bid-time">{new Date(bid.createdAt).toLocaleString("ru-RU")}</span>
                                        </div>
                                        {index === 0 && (
                                            <span className="highest-badge">🏆 Лидирует</span>
                                        )}
                                    </div>
                                    <div className="bid-amount">{bid.amount} ₽</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemDetail