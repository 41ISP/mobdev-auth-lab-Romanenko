import { Link, useNavigate, useParams } from "react-router-dom"
import Input from "../components/Input"
import Button from "../components/Button"
import { useItemStore } from "../store/useItemStore"
import { useEffect, useState } from "react"
import { api } from "../api/api"
import { useUserStore } from "../store/useUserStore"

const ItemDetail = () => {
    const { id } = useParams()
    // const items = useItemStore((state) => state.items)
    // const item = items?.find((item) => String(item.id) === id)
    // const getItems = useItemStore((state) => state.getItems)
    const [item, setItem] = useState(undefined)
    const [error, setError] = useState("")
    const [timerId, setTimerId] = useState(undefined)
    const [bids, setBids] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const { session } = useUserStore()
    const navigate = useNavigate()

    useEffect(() => {
        const load = async () => {
            setIsLoading(true)
            try {
                
                await getItems()
                await loadBids()
            } catch (error) {
                console.error(error)
                setError(error.message || "Что-то пошло не так")
            } finally {
                setIsLoading(false)
            }
        }
        load()
        setTimerId(setInterval(async () => {
            try {
                await getItems()
                await loadBids()
            } catch (error) { }
        }, 10000))
        return () => {
            clearInterval(timerId)
        }
    }, [])

    const handleBid = async (e) => {
        e.preventDefault()
        setError("")

        const form = e.target
        const amount = Number(form.bidInput.value)

        try {
            await api.createBid({ id, amount })
            form.reset()
            await getItems()
            await loadBids()
        } catch (error) {
            console.error(error)
            setError(error.response.data.error)
        }
    }

    const loadBids = async () => {
        try {
            const res = await api.getItemBids(id)
            const data = res?.data ?? res
            const bidsList = Array.isArray(data) ? data : data?.bids

            setBids(Array.isArray(bidsList) ? bidsList : [])
        } catch (error) {
            console.error(error)
            setBids([])
        }
    }

    if (!item) return <div className="container">Загрузка...</div>

    const minBid = item.highestBid ?? item.price

    const handleDelete = async () => {
        try {
            await api.deleteItems(id)
            await getItems()
            navigate("/")
        } catch (error) {
            setError(error.message || "На товар уже есть ставки")
        }
    }

    return (
        <div className="container">
            {error && <div className="alert alert-error active">{error}</div>}
            {isLoading && <div class="item-header">Загрузка</div>}
            {!isLoading && !error && (
                <div class="item-detail">
                    <div class="item-header">
                        <div>
                            <img src={item.imageUrl} class="item-image-large" />
                        </div>

                        <div class="item-info">
                            <Link to={"/"}>← Вернуться к списку товаров</Link>
                            <span class="item-status">{item.status}</span>

                            <h1 class="item-title-large">{item.title}</h1>

                            <div class="item-seller-info">
                                <div class="seller-avatar">{item.username.slice(0, 2).toUpperCase()}</div>
                                <div class="seller-details">
                                    <div class="seller-name">{item.username}</div>
                                    <div class="seller-date">{new Date(item.createdAt).toLocaleString("ru-RU")}</div>
                                </div>
                            </div>

                            <div class="item-description-full">
                                {item.description}
                            </div>

                            <div class="price-section">
                                <div class="starting-price">Начальная цена:</div>
                                <div class="current-price">{item.price}</div>
                                <div class="highest-bid">Текущая ставка: {item.highestBid ?? "ставок нет"}</div>
                                {item.userId === session?.user?.id ? bids.length === 0 && (
                                    <button class="btn-delete" onClick={handleDelete}>
                                        <span>❌</span>
                                        <span>Удалить</span>
                                    </button>
                                ) : (
                                        <form class="bid-form" onSubmit={handleBid}>
                                            <Input
                                                type="number"
                                                name="bidInput"
                                                class="bid-input"
                                                placeholder="Введите вашу ставку (мин. 70 001 ₽)"
                                                min={minBid}
                                                step="100"
                                            />
                                            <Button type="submit" class="btn-bid">Сделать ставку</Button>
                                        </form>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div class="bids-section">
                        <div class="bids-header">
                            <h2 class="bids-title">История ставок</h2>
                            <span class="bids-count">{bids.length}</span>
                        </div>

                        <div class="bids-list">
                            {bids.map((bid, index) => (
                                <div className={`bid-item ${index === 0 ? "highest-bid-item" : ""}`} key={bid.id ?? index}>
                                    <div className="bid-user">
                                        <div className="bid-avatar">{bid.username.slice(0, 2).toUpperCase()}</div>
                                        <div className="bid-details">
                                            <span className="bid-username">{bid.username}</span>
                                            <span className="bid-time">{new Date(bid.createdAt).toLocaleString("ru-RU")}</span>
                                        </div>
                                        {index === 0 && (
                                            <span className="highest-badge">
                                                🏆 Лидирует
                                            </span>
                                        )}
                                    </div>
                                    <div className="bid-amount">{bid.amount} ₽</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ItemDetail