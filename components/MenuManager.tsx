
import React, { useState, useEffect } from 'react';
import type { FoodItem } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, TagIcon, ClockIcon } from './Icons';

interface MenuManagerProps {
    menu: FoodItem[];
    onAddItem: (item: Omit<FoodItem, 'id' | 'reviews'>) => void;
    onUpdateItem: (item: FoodItem) => void;
    onDeleteItem: (id: number) => void;
}

const initialFormState = {
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    preparationTime: '',
};

const MenuManager: React.FC<MenuManagerProps> = ({ menu, onAddItem, onUpdateItem, onDeleteItem }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    
    const categories = [...new Set(menu.map(item => item.category))];

    useEffect(() => {
        if (editingItem) {
            setFormData({
                name: editingItem.name,
                description: editingItem.description,
                price: String(editingItem.price),
                category: editingItem.category,
                image: editingItem.image,
                preparationTime: String(editingItem.preparationTime || ''),
            });
        } else {
            setFormData(initialFormState);
        }
    }, [editingItem]);

    const handleOpenForm = (item: FoodItem | null) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
        setFormData(initialFormState);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const prepTime = parseInt(formData.preparationTime, 10);
        const itemData = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            image: formData.image,
            preparationTime: !isNaN(prepTime) ? Math.max(0, prepTime) : 0,
        };

        if (editingItem) {
            onUpdateItem({ ...editingItem, ...itemData });
        } else {
            onAddItem(itemData);
        }
        handleCloseForm();
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            onDeleteItem(id);
        }
    };

    return (
        <div className="bg-white border border-stone-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-stone-800">Menu Items ({menu.length})</h3>
                <button
                    onClick={() => handleOpenForm(null)}
                    className="flex items-center bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors duration-200 font-semibold"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Item
                </button>
            </div>
            
            {isFormOpen && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                     <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative border border-stone-200">
                        <h4 className="text-2xl font-bold mb-6 text-center text-stone-900 font-cinzel">{editingItem ? 'Edit Menu Item' : 'Add New Item'}</h4>
                         <button type="button" onClick={handleCloseForm} className="absolute top-4 right-4 p-1 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                         <div className="space-y-4">
                            <InputField name="name" value={formData.name} onChange={handleChange} placeholder="Item Name (e.g., Galaxy Burger)" required />
                            <div>
                               <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" rows={3}></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <InputField name="price" value={formData.price} onChange={handleChange} placeholder="Price" type="number" step="0.01" required />
                               <InputField name="preparationTime" value={formData.preparationTime} onChange={handleChange} placeholder="Prep Time (mins)" type="number" min="0" />
                            </div>
                             <div>
                                <input
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="Category (e.g., Main Courses)"
                                    required
                                    list="category-list"
                                    className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <datalist id="category-list">
                                    {categories.map(category => (
                                        <option key={category} value={category} />
                                    ))}
                                </datalist>
                           </div>
                            <InputField name="image" value={formData.image} onChange={handleChange} placeholder="Image URL (e.g., https://picsum.photos/...)" required />
                        </div>
                         <div className="mt-8 flex justify-end space-x-4">
                            <button type="button" onClick={handleCloseForm} className="px-6 py-2 rounded-lg text-stone-800 bg-stone-200 hover:bg-stone-300 font-semibold transition-colors">Cancel</button>
                             <button type="submit" className="px-6 py-2 rounded-lg text-white bg-amber-700 hover:bg-amber-800 font-semibold transition-colors">{editingItem ? 'Save Changes' : 'Add Item'}</button>
                         </div>
                     </form>
                 </div>
            )}
            
            <div className="space-y-4">
                {menu.map(item => (
                    <div key={item.id} className={`bg-stone-50 p-4 rounded-lg flex items-center space-x-4 transition-opacity border border-stone-200 ${item.isAvailable === false ? 'opacity-60' : ''}`}>
                        <img src={item.image} alt={item.name} className="h-20 w-20 rounded-md object-cover flex-shrink-0" />
                        <div className="flex-grow">
                            <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-lg text-stone-800">{item.name}</h4>
                                {item.isAvailable === false && (
                                    <span className="text-xs font-semibold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">Unavailable</span>
                                )}
                            </div>
                            <p className="text-sm text-stone-600 line-clamp-2 mt-1">{item.description}</p>
                            <div className="flex items-center space-x-4 mt-1 text-sm">
                                <span className="font-semibold text-amber-700">₹{item.price.toFixed(2)}</span>
                                <div className="flex items-center text-stone-500">
                                    <TagIcon className="h-4 w-4 mr-1.5" />
                                    <span>{item.category}</span>
                                </div>
                                {item.preparationTime && item.preparationTime > 0 && (
                                    <div className="flex items-center text-stone-500">
                                        <ClockIcon className="h-4 w-4 mr-1.5" />
                                        <span>{item.preparationTime} min</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                             <div className="flex items-center space-x-2">
                                <label htmlFor={`toggle-${item.id}`} className="text-sm font-medium text-stone-700 cursor-pointer">Available</label>
                                <ToggleSwitch
                                    id={`toggle-${item.id}`}
                                    enabled={item.isAvailable !== false}
                                    onChange={() => onUpdateItem({ ...item, isAvailable: !(item.isAvailable !== false) })}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleOpenForm(item)} className="p-2 rounded-full bg-stone-200 hover:bg-amber-600 text-stone-600 hover:text-white transition-colors" aria-label="Edit Item">
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full bg-stone-200 hover:bg-red-500 text-stone-600 hover:text-white transition-colors" aria-label="Delete Item">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
);

interface ToggleSwitchProps {
    id: string;
    enabled: boolean;
    onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, enabled, onChange }) => (
    <button
        type="button"
        id={id}
        className={`${
            enabled ? 'bg-amber-600' : 'bg-stone-300'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white`}
        role="switch"
        aria-checked={enabled}
        onClick={onChange}
    >
        <span className="sr-only">Toggle availability</span>
        <span
            aria-hidden="true"
            className={`${
                enabled ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

export default MenuManager;