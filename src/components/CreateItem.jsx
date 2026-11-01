import { Link, useNavigate } from 'react-router-dom';
import Input from './Input';
import { useState } from 'react';
import { api } from '../api/api';
import { useItemStore } from '../store/useItemStore';

const CreateItem = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const getItems = useItemStore((state) => state.getItems);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const { title, description, price, imageUrl } = e.target.elements;
        const item = {
            title: title.value.trim(),
            description: description.value.trim(),
            price: Number(price.value),
        };
        if (imageUrl.value.trim()) {
            item.imageUrl = imageUrl.value.trim();
        }
        try {
            await api.sendItems(item);
            await getItems();
            navigate('/');
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.error || error.message || 'Ошибка создания товара');
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1>Создать новый товар</h1>
            </div>

            {error && <div className="alert alert-error active">{error}</div>}

            <div className="form-container">
                <form id="create-item-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            Название товара <span className="required">*</span>
                        </label>
                        <Input
                            type="text"
                            className="form-input"
                            name="title"
                            placeholder="Например: iPhone 14 Pro 256GB"
                            maxLength="100"
                            required
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateItem;