import { useEffect, useState } from "react"
import { api } from "../api/api"
import { Link } from "react-router-dom"

const MyBids = () => {
    const [bids, setBids] = useState([])
    const [timerId, setTimerId] = useState(undefined)
    const [error, setError] = useState(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.getMyBids()
                const data = res?.data ?? res
                const bidsList = Array.isArray(data) ? data : data?.bids

                setBids(Array.isArray(bidsList) ? bidsList : [])
            } catch (error) {
                console.error(error)
                setError(error.message || "Что-то пошло не так")
                setBids([])
            }
        }
        load()
        setTimerId(setInterval(async () => {
            try {
                api.getMyBids()
            } catch (error) { }
        }, 10000))
        return () => {
            clearInterval(timerId)
        }
    }, [])

    const winningCount = bids.filter((bid) => bid.isWinning).length
    const totalAmount = bids.reduce((sum, bid) => sum + (bid.amount ?? 0), 0)

    return (
        <div className="container">
            <div class="page-header">
                <h1>Мои ставки</h1>
                <p class="page-subtitle">История ваших ставок на товары</p>
            </div>

            <div class="bids-summary">
                <div class="summary-card">
                    <span class="summary-value">{bids.length}</span>
                    <span class="summary-label">Всего ставок</span>
                </div>
                <div class="summary-card winning">
                    <span class="summary-value">{winningCount}</span>
                    <span class="summary-label">Лидирующих ставок</span>
                </div>
                <div class="summary-card">
                    <span class="summary-value">{totalAmount} ₽</span>
                    <span class="summary-label">Общая сумма</span>
                </div>
            </div>

            {bids.length === 0 ? (
                <div className="no-bids">
                    <div className="no-bids-icon">📭</div>
                    <h2>{error ? "Не удалось загрузить ставки" : "У вас пока нет ставок"}</h2>
                </div>
            ) : (
                <div className="bids-list">
                    {bids.map((bid) => {
                        const isWinning = Boolean(bid.isWinning)
                        return (
                            <div key={bid.id} className={`bid-item${isWinning ? " winning" : ""}`}>
                                <div className="bid-item-content">
                                    <div className="bid-item-header">
                                        <Link to={`/item/${bid.itemId}`} className="bid-item-title">{bid.itemTitle}</Link>
                                        {isWinning ?
                                            (<span className="winning-badge">🏆 Лидирую</span>
                                            ) : (
                                                <span className="outbid-badge">Перебита</span>
                                            )
                                        }
                                    </div>
                                    <div className="bid-item-meta">
                                        <span>⏰ {new Date(bid.createdAt).toLocaleString("ru-RU")}</span>
                                    </div>
                                </div>
                                <div className="bid-item-amount">
                                    <span className="bid-amount">{Number(bid.amount)} ₽</span>
                                    <span className="bid-status">Моя ставка</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default MyBids