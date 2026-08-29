

import React, { useState, useRef, useMemo } from 'react';
import type { Order, FoodItem, Notification, StaffMember, Shift, AttendanceRecord, MonthlyReport, TableStatus } from '../types';
import { OrderStatus } from '../types';
import OrderCard from './OrderCard';
import MenuManager from './MenuManager';
import { ClipboardDocumentListIcon, Squares2X2Icon, ChatBubbleBottomCenterTextIcon, Cog8ToothIcon, PhotoIcon, LockClosedIcon, UsersIcon, ClockIcon, TableCellsIcon, CalendarDaysIcon } from './Icons';
import AdminNotification from './AdminNotification';
import ReviewManager from './ReviewManager';
import StaffManager from './StaffManager';
import TableManager from './TableManager';
import ReservationsManager from './ReservationsManager';

interface AdminPanelProps {
    orders: Order[];
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    menu: FoodItem[];
    onAddItem: (item: Omit<FoodItem, 'id' | 'reviews'>) => void;
    onUpdateItem: (item: FoodItem) => void;
    onDeleteItem: (id: number) => void;
    adminNotifications: Notification[];
    onDismissNotification: (id: number) => void;
    qrCodeUrl: string;
    onUpdateQrCode: (url: string) => void;
    staff: StaffMember[];
    shifts: Shift[];
    attendance: AttendanceRecord[];
    reports: MonthlyReport[];
    onAddStaff: (staff: Omit<StaffMember, 'id'>) => void;
    onUpdateStaff: (staff: StaffMember) => void;
    onDeleteStaff: (id: string) => void;
    onAddShift: (shift: Omit<Shift, 'id'>) => void;
    onDeleteShift: (id: string) => void;
    onClockIn: (staffId: string) => void;
    onClockOut: (staffId: string) => void;
    onSaveReport: (report: Omit<MonthlyReport, 'id'>) => void;
    onDeleteReport: (id: string) => void;
    tableStatuses: TableStatus[];
    onUpdateTableStatus: (tableNumber: number, newStatus: 'available' | 'unavailable') => void;
    recipientName: string;
    upiId: string;
    onUpdatePaymentDetails: (details: { recipientName: string; upiId: string }) => void;
}

type AdminView = 'orders' | 'reservations' | 'menu' | 'reviews' | 'staff' | 'settings';

const SECRET_CODE = 'Pavan123';

const VerificationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    secretCode: string;
    setSecretCode: (code: string) => void;
    error: string;
}> = ({ isOpen, onClose, onSubmit, secretCode, setSecretCode, error }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm relative border border-stone-200" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <LockClosedIcon className="mx-auto h-10 w-auto text-amber-600" />
                    <h4 className="mt-4 text-xl font-bold text-stone-800">Verification Required</h4>
                    <p className="mt-1 text-sm text-stone-500">Please enter the secret code to proceed.</p>
                </div>
                <div className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="secret-code" className="sr-only">Secret Code</label>
                        <input
                            id="secret-code"
                            name="secret-code"
                            type="password"
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            required
                            className="appearance-none relative block w-full px-3 py-3 border border-stone-300 bg-stone-50 placeholder-stone-400 text-stone-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                            placeholder="Secret Code"
                            autoComplete="off"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-stone-800 bg-stone-200 hover:bg-stone-300 font-semibold transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 rounded-lg text-white bg-amber-700 hover:bg-amber-800 font-semibold transition-colors">
                        Verify
                    </button>
                </div>
            </form>
        </div>
    );
};


const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { 
        orders, updateOrderStatus, menu, onAddItem, onUpdateItem, onDeleteItem, 
        adminNotifications, onDismissNotification, qrCodeUrl, onUpdateQrCode,
        tableStatuses, onUpdateTableStatus, recipientName, upiId, onUpdatePaymentDetails
    } = props;
    const [activeView, setActiveView] = useState<AdminView>('orders');
    const [newQrCodeUrl, setNewQrCodeUrl] = useState(qrCodeUrl);
    const [newRecipientName, setNewRecipientName] = useState(recipientName);
    const [newUpiId, setNewUpiId] = useState(upiId);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [secretCodeInput, setSecretCodeInput] = useState('');
    const [verificationError, setVerificationError] = useState('');
    
    const generatedQrCode = useMemo(() => {
        if (newUpiId && newRecipientName) {
            const upiUrl = `upi://pay?pa=${newUpiId}&pn=${encodeURIComponent(newRecipientName)}`;
            return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(upiUrl)}`;
        }
        return null;
    }, [newUpiId, newRecipientName]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === 'string') {
                    setNewQrCodeUrl(e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        setIsVerificationModalOpen(true);
    };
    
    const handleCloseVerificationModal = () => {
        setIsVerificationModalOpen(false);
        setSecretCodeInput('');
        setVerificationError('');
    };

    const handleVerificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretCodeInput === SECRET_CODE) {
            handleCloseVerificationModal();
            fileInputRef.current?.click();
        } else {
            setVerificationError('Incorrect secret code. Please try again.');
        }
    };
    
    const handleSettingsSave = () => {
        if (qrCodeUrl !== newQrCodeUrl) {
            onUpdateQrCode(newQrCodeUrl);
        }
        if (recipientName !== newRecipientName || upiId !== newUpiId) {
            onUpdatePaymentDetails({
                recipientName: newRecipientName,
                upiId: newUpiId,
            });
        }
    };

    const isSettingsChanged = qrCodeUrl !== newQrCodeUrl || recipientName !== newRecipientName || upiId !== newUpiId;


    const filterOrders = (status: OrderStatus) => orders.filter(o => o.status === status);
    const scheduledOrders = filterOrders(OrderStatus.SCHEDULED);
    const pendingOrders = filterOrders(OrderStatus.PENDING);
    const preparingOrders = filterOrders(OrderStatus.PREPARING);
    const readyOrders = filterOrders(OrderStatus.READY);
    const completedOrders = filterOrders(OrderStatus.COMPLETED);

    return (
        <div className="relative animate-fadeIn">
             <div
                aria-live="assertive"
                className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg z-[60] px-4 space-y-3"
            >
                {adminNotifications.map(notification => (
                    <div key={notification.id} onClick={() => setActiveView('orders')}>
                        <AdminNotification
                            notification={notification}
                            onDismiss={onDismissNotification}
                        />
                    </div>
                ))}
            </div>
            
            <VerificationModal
                isOpen={isVerificationModalOpen}
                onClose={handleCloseVerificationModal}
                onSubmit={handleVerificationSubmit}
                secretCode={secretCodeInput}
                setSecretCode={setSecretCodeInput}
                error={verificationError}
            />
            
            <div className="mb-6 pb-2 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-3xl font-bold text-stone-900 font-cinzel">Admin Dashboard</h2>
                <div className="flex items-center space-x-2 rounded-lg bg-stone-100 p-1 flex-wrap">
                     <TabButton 
                        label="Orders" 
                        Icon={ClipboardDocumentListIcon} 
                        isActive={activeView === 'orders'} 
                        onClick={() => setActiveView('orders')} 
                     />
                     <TabButton 
                        label="Reservations" 
                        Icon={CalendarDaysIcon} 
                        isActive={activeView === 'reservations'} 
                        onClick={() => setActiveView('reservations')} 
                     />
                     <TabButton 
                        label="Menu" 
                        Icon={Squares2X2Icon} 
                        isActive={activeView === 'menu'} 
                        onClick={() => setActiveView('menu')} 
                    />
                     <TabButton 
                        label="Staff" 
                        Icon={UsersIcon} 
                        isActive={activeView === 'staff'} 
                        onClick={() => setActiveView('staff')} 
                    />
                    <TabButton 
                        label="Reviews" 
                        Icon={ChatBubbleBottomCenterTextIcon} 
                        isActive={activeView === 'reviews'} 
                        onClick={() => setActiveView('reviews')} 
                    />
                    <TabButton 
                        label="Settings" 
                        Icon={Cog8ToothIcon}
                        isActive={activeView === 'settings'} 
                        onClick={() => setActiveView('settings')} 
                    />
                </div>
            </div>

            {activeView === 'orders' && (
                 <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <OrderColumn title="Scheduled" orders={scheduledOrders} updateStatus={updateOrderStatus} />
                        <OrderColumn title="Pending" orders={pendingOrders} updateStatus={updateOrderStatus} />
                        <OrderColumn title="Preparing" orders={preparingOrders} updateStatus={updateOrderStatus} />
                        <OrderColumn title="Ready for Pickup" orders={readyOrders} updateStatus={updateOrderStatus} />
                        <OrderColumn title="Completed" orders={completedOrders} updateStatus={updateOrderStatus} />
                    </div>
                </>
            )}

            {activeView === 'reservations' && (
                <ReservationsManager
                    orders={orders}
                    updateOrderStatus={updateOrderStatus}
                />
            )}

            {activeView === 'menu' && (
                <MenuManager 
                    menu={menu}
                    onAddItem={onAddItem}
                    onUpdateItem={onUpdateItem}
                    onDeleteItem={onDeleteItem}
                />
            )}
            
            {activeView === 'staff' && (
                <StaffManager
                    staff={props.staff}
                    shifts={props.shifts}
                    attendance={props.attendance}
                    reports={props.reports}
                    onAddStaff={props.onAddStaff}
                    onUpdateStaff={props.onUpdateStaff}
                    onDeleteStaff={props.onDeleteStaff}
                    onAddShift={props.onAddShift}
                    onDeleteShift={props.onDeleteShift}
                    onClockIn={props.onClockIn}
                    onClockOut={props.onClockOut}
                    onSaveReport={props.onSaveReport}
                    onDeleteReport={props.onDeleteReport}
                />
            )}

            {activeView === 'reviews' && (
                <ReviewManager menu={menu} />
            )}

            {activeView === 'settings' && (
                <div className="bg-white border border-stone-200 rounded-lg p-6 max-w-4xl mx-auto space-y-8">
                    <div>
                        <h3 className="text-2xl font-bold text-stone-900 mb-6">Payment Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="recipientName" className="block text-sm font-medium text-stone-700 mb-2">Recipient Name</label>
                                    <input id="recipientName" type="text" value={newRecipientName} onChange={e => setNewRecipientName(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                    <p className="text-xs text-stone-500 mt-1">This name will be shown to customers in their UPI app.</p>
                                </div>
                                <div>
                                    <label htmlFor="upiId" className="block text-sm font-medium text-stone-700 mb-2">UPI ID (VPA)</label>
                                    <input id="upiId" type="text" value={newUpiId} onChange={e => setNewUpiId(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded-md px-3 py-2 text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                    <p className="text-xs text-stone-500 mt-1">e.g., your-restaurant@okaxis</p>
                                </div>
                                <div className="border-t border-stone-200 pt-6">
                                    <label htmlFor="qr-upload" className="block text-sm font-medium text-stone-700 mb-2">
                                        Upload Custom QR Code (Optional)
                                    </label>
                                    <input id="qr-upload" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    <button
                                        type="button"
                                        onClick={handleUploadClick}
                                        className="w-full flex justify-center items-center px-4 py-3 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-amber-500 hover:text-amber-500 transition-colors"
                                    >
                                        <PhotoIcon className="h-6 w-6 mr-2" />
                                        <span>Upload an image</span>
                                    </button>
                                     <p className="text-xs text-stone-500 mt-1">This will override the auto-generated QR code.</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">QR Code Preview</label>
                                <div className="p-4 bg-stone-100 rounded-lg flex justify-center">
                                    <img src={generatedQrCode || newQrCodeUrl || 'https://via.placeholder.com/256'} alt="QR Code Preview" className="h-64 w-64 rounded-md object-contain bg-white" />
                                </div>
                            </div>
                        </div>
                         <div className="flex justify-end mt-8">
                            <button
                                onClick={handleSettingsSave}
                                disabled={!isSettingsChanged}
                                className="px-6 py-2 rounded-lg text-white bg-amber-700 hover:bg-amber-800 font-semibold transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                    <div className="border-t border-stone-200 my-8"></div>
                    <div>
                         <h3 className="text-2xl font-bold text-stone-900 mb-6">Table Availability</h3>
                         <TableManager statuses={tableStatuses} onUpdateStatus={onUpdateTableStatus} />
                    </div>
                </div>
            )}
        </div>
    );
};

interface TabButtonProps {
    label: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
            isActive ? 'bg-amber-700 text-white' : 'text-stone-600 hover:bg-stone-200'
        }`}
    >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
    </button>
)

interface OrderColumnProps {
    title: string;
    orders: Order[];
    updateStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderColumn: React.FC<OrderColumnProps> = ({ title, orders, updateStatus }) => {
    return (
        <div className="bg-stone-100 rounded-lg p-4 h-full min-h-[500px]">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-stone-200 text-stone-800 flex items-center">
                {title}
                <span className="ml-2 bg-amber-700 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {orders.length}
                </span>
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[80vh] pr-1">
                 {orders.length > 0 ? (
                    orders.map(order => (
                        <OrderCard key={order.id} order={order} updateOrderStatus={updateStatus} />
                    ))
                ) : (
                    <p className="text-stone-500 text-center pt-10">No orders here.</p>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;