
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { PanelType, OrderStatus, StaffRole } from './types';
import type { CartItem, Order, FoodItem, Review, Notification, StaffMember, Shift, AttendanceRecord, MonthlyReport, TableStatus } from './types';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from './constants';
import * as dbService from './services/dbService';
import AdminLogin from './components/AdminLogin';
import CustomerPanel from './components/CustomerPanel';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import NotificationToast from './components/NotificationToast';
import { ShoppingBagIcon } from './components/Icons';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentPanel, setCurrentPanel] = useState<PanelType>(PanelType.CUSTOMER);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [menu, setMenu] = useState<FoodItem[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [adminNotifications, setAdminNotifications] = useState<Notification[]>([]);
    const [customerTable, setCustomerTable] = useState<number | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [preorderDateTime, setPreorderDateTime] = useState<Date | null>(null);
    const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
    const [recipientName, setRecipientName] = useState<string>('');
    const [upiId, setUpiId] = useState<string>('');

    // Staff Management State
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);

    const addNotification = useCallback((message: string, type: Notification['type'] = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
    }, []);

    // Effect to load all data from IndexedDB on component mount
    useEffect(() => {
        const loadDataFromDb = async () => {
            try {
                await dbService.initDB();
                await dbService.populateInitialData();

                const [
                    menuData, ordersData, staffData, shiftsData, attendanceData, reportsData, 
                    qrCodeData, recipientNameData, upiIdData, tableStatusData
                ] = await Promise.all([
                    dbService.getAll<FoodItem>('menu'),
                    dbService.getAll<Order>('orders'),
                    dbService.getAll<StaffMember>('staff'),
                    dbService.getAll<Shift>('shifts'),
                    dbService.getAll<AttendanceRecord>('attendance'),
                    dbService.getAll<MonthlyReport>('reports'),
                    dbService.getSetting('qrCodeUrl'),
                    dbService.getSetting('recipientName'),
                    dbService.getSetting('upiId'),
                    dbService.getAll<TableStatus>('tableStatus'),
                ]);

                // Rehydrate dates from string format in DB
                const rehydratedOrders = ordersData.map(o => ({
                    ...o,
                    timestamp: new Date(o.timestamp),
                    scheduledTime: o.scheduledTime ? new Date(o.scheduledTime) : undefined,
                })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

                const rehydratedShifts = shiftsData.map(s => ({
                    ...s,
                    startTime: new Date(s.startTime),
                    endTime: new Date(s.endTime),
                }));

                const rehydratedAttendance = attendanceData.map(a => ({
                    ...a,
                    clockIn: new Date(a.clockIn),
                    clockOut: a.clockOut ? new Date(a.clockOut) : undefined,
                }));

                setMenu(menuData);
                setOrders(rehydratedOrders);
                setStaffMembers(staffData);
                setShifts(rehydratedShifts);
                setAttendanceRecords(rehydratedAttendance);
                setMonthlyReports(reportsData);
                setTableStatuses(tableStatusData);
                setQrCodeUrl(qrCodeData || 'https://i.imgur.com/g1fJ17A.png');
                setRecipientName(recipientNameData || 'Randi Mava Restaurent');
                setUpiId(upiIdData || 'restaurant@exampleupi');


            } catch (error) {
                console.error("Failed to load data from database:", error);
                addNotification("Error loading app data. Some features might not work.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        loadDataFromDb();
    }, [addNotification]);


    const unavailableTables = useMemo(() => {
        const now = new Date();
        // 20 minute buffer before and after the scheduled time, as requested.
        const PRE_ORDER_BUFFER_MS = 20 * 60 * 1000;

        // 1. Tables manually marked unavailable by admin
        const tablesFromAdmin = tableStatuses
            .filter(s => s.status === 'unavailable')
            .map(s => s.tableNumber);

        // 2. Tables with active dine-in or scheduled orders
        const activeOrders = orders.filter(order => order.status !== OrderStatus.CLEARED);
        
        const unavailableFromOrders = activeOrders.filter(order => {
            // Check based on whether we are in pre-order mode or dine-in mode
            if (preorderDateTime) {
                // If we are checking for a future pre-order time
                const newSlotStart = new Date(preorderDateTime.getTime() - PRE_ORDER_BUFFER_MS);
                const newSlotEnd = new Date(preorderDateTime.getTime() + PRE_ORDER_BUFFER_MS);

                if (order.scheduledTime) {
                    // This is an existing scheduled order, check for overlap
                    const existingSlotStart = new Date(order.scheduledTime.getTime() - PRE_ORDER_BUFFER_MS);
                    const existingSlotEnd = new Date(order.scheduledTime.getTime() + PRE_ORDER_BUFFER_MS);
                    return newSlotStart < existingSlotEnd && newSlotEnd > existingSlotStart;
                } else {
                    // This is an active dine-in order, check if it will still be active
                    // Assume a dine-in lasts 90 minutes for this check
                    const dineInEndTime = new Date(order.timestamp.getTime() + 90 * 60 * 1000);
                    return newSlotStart < dineInEndTime;
                }
            } else {
                 // If we are checking for dine-in NOW
                if (order.scheduledTime) {
                    // This is a scheduled order, check if "now" falls within its buffer
                    const existingSlotStart = new Date(order.scheduledTime.getTime() - PRE_ORDER_BUFFER_MS);
                    const existingSlotEnd = new Date(order.scheduledTime.getTime() + PRE_ORDER_BUFFER_MS);
                    return now >= existingSlotStart && now <= existingSlotEnd;
                } else {
                    // This is an active dine-in order, so it's unavailable
                    return true;
                }
            }
        }).map(order => order.tableNumber);
        
        // Combine all sources of unavailable tables and remove duplicates
        return [...new Set([...tablesFromAdmin, ...unavailableFromOrders])];

    }, [orders, preorderDateTime, tableStatuses]);


    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const removeAdminNotification = useCallback((id: number) => {
        setAdminNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const addAdminNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
        const id = Date.now();
        setAdminNotifications(prev => [...prev, { id, message, type }]);
    }, []);
    
    // Effect for pre-order reminders
    useEffect(() => {
        const checkPreorderReminders = async () => {
            const now = new Date();
            const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
            
            let remindersSent = false;
            const updatedOrders = [...orders]; // Create a mutable copy
            
            for (let i = 0; i < updatedOrders.length; i++) {
                const order = updatedOrders[i];
                if (
                    order.status === OrderStatus.SCHEDULED &&
                    order.scheduledTime &&
                    !order.reminderSent
                ) {
                    const scheduledTime = new Date(order.scheduledTime);
                    if (scheduledTime <= tenMinutesFromNow && scheduledTime > now) {
                        const minutesUntil = Math.round((scheduledTime.getTime() - now.getTime()) / 60000);
                        addAdminNotification(
                            `Reminder: Pre-order for Table ${order.tableNumber} is due in ~${minutesUntil} min.`,
                            'error'
                        );
                        remindersSent = true;
                        const updatedOrder = { ...order, reminderSent: true };
                        updatedOrders[i] = updatedOrder;
                        await dbService.update('orders', updatedOrder); // Update DB
                    }
                }
            }

            if (remindersSent) {
                setOrders(updatedOrders);
            }
        };

        const intervalId = setInterval(checkPreorderReminders, 30 * 1000);

        return () => clearInterval(intervalId);
    }, [orders, addAdminNotification]);


    const handleLogin = (user: string, pass: string): boolean => {
        if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
            setIsAdminLoggedIn(true);
            setCurrentPanel(PanelType.ADMIN);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setIsAdminLoggedIn(false);
        setCurrentPanel(PanelType.CUSTOMER);
    };

    const handlePanelSwitch = (panel: PanelType) => {
        if (panel === PanelType.ADMIN && !isAdminLoggedIn) {
            setCurrentPanel(PanelType.ADMIN);
        } else if (panel === PanelType.ADMIN && isAdminLoggedIn) {
            setCurrentPanel(PanelType.ADMIN);
        } else {
            setCurrentPanel(PanelType.CUSTOMER);
        }
    };

    const addToCart = useCallback((itemToAdd: FoodItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === itemToAdd.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...itemToAdd, quantity: 1 }];
        });
        addNotification(`'${itemToAdd.name}' added to cart.`);
    }, [addNotification]);
    
    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const removeFromCart = useCallback((itemId: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(item =>
                    item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
                );
            }
            return prevCart.filter(item => item.id !== itemId);
        });
    }, []);

    const placeOrder = useCallback(async () => {
        if (cart.length === 0 || customerTable === null) return;
        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            items: [...cart],
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            status: preorderDateTime ? OrderStatus.SCHEDULED : OrderStatus.PENDING,
            timestamp: new Date(),
            tableNumber: customerTable,
            isNew: true,
            scheduledTime: preorderDateTime || undefined,
            reminderSent: false,
        };
        await dbService.add('orders', newOrder);
        setOrders(prevOrders => [newOrder, ...prevOrders]);
        setCart([]);
        
        const message = preorderDateTime
            ? 'Pre-order placed successfully! Track its status below.'
            : 'Order placed successfully! Track its progress below.';
        addNotification(message);
        addAdminNotification(`New ${preorderDateTime ? 'Pre-order' : 'Order'} for Table ${customerTable}: ${newOrder.id}`);

        setTimeout(() => {
            setOrders(prev => prev.map(o => o.id === newOrder.id ? {...o, isNew: false} : o))
        }, 5000);

    }, [cart, addNotification, addAdminNotification, customerTable, preorderDateTime]);

    const placeReservationOnlyOrder = useCallback(async (table: number, dateTime: Date) => {
        if (!table || !dateTime) return;
        const newReservation: Order = {
            id: `RES-${Date.now()}`,
            items: [],
            total: 0,
            status: OrderStatus.SCHEDULED,
            timestamp: new Date(),
            tableNumber: table,
            isNew: true,
            scheduledTime: dateTime,
            reminderSent: false,
        };
        await dbService.add('orders', newReservation);
        setOrders(prevOrders => [newReservation, ...prevOrders]);
        
        addNotification('Table reserved successfully! We look forward to seeing you.');
        addAdminNotification(`New Reservation for Table ${table} at ${dateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}.`);

        setTimeout(() => {
            setOrders(prev => prev.map(o => o.id === newReservation.id ? {...o, isNew: false} : o));
        }, 5000);
    }, [addNotification, addAdminNotification]);

    const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
        let orderToUpdate: Order | undefined;
        
        setOrders(prevOrders =>
            prevOrders.map(order => {
                if (order.id !== orderId) return order;

                const isMovingFromScheduled = order.status === OrderStatus.SCHEDULED && status === OrderStatus.PENDING;
                orderToUpdate = { 
                    ...order, 
                    status, 
                    justUpdated: true,
                    timestamp: isMovingFromScheduled ? new Date() : order.timestamp
                };
                return orderToUpdate;
            })
        );
        
        if (orderToUpdate) {
            await dbService.update('orders', { ...orderToUpdate, justUpdated: false, isNew: false });
        }

        if (status === OrderStatus.CLEARED) {
             addAdminNotification(`Table for order ${orderId} has been cleared.`, 'success');
        } else if (status === OrderStatus.PENDING) {
             addAdminNotification(`Order ${orderId} confirmed and moved to pending.`, 'info');
        }

        setTimeout(() => {
            setOrders(prev => prev.map(o => o.id === orderId ? {...o, justUpdated: false} : o))
        }, 2100);
    }, [addAdminNotification]);
    
    const handleSelectTable = useCallback((table: number) => {
        setCustomerTable(table);
    }, []);

    const handleLeaveTable = useCallback(() => {
        setCustomerTable(null);
        setPreorderDateTime(null);
    }, []);

    const handleAddItem = useCallback(async (itemToAdd: Omit<FoodItem, 'id' | 'reviews'>) => {
        const newId = menu.length > 0 ? Math.max(...menu.map(i => i.id)) + 1 : 1;
        const newItem: FoodItem = { ...itemToAdd, id: newId, reviews: [] };
        await dbService.add('menu', newItem);
        setMenu(prevMenu => [...prevMenu, newItem]);
    }, [menu]);

    const handleUpdateItem = useCallback(async (updatedItem: FoodItem) => {
        await dbService.update('menu', updatedItem);
        setMenu(prevMenu => prevMenu.map(item => item.id === updatedItem.id ? updatedItem : item));
    }, []);

    const handleDeleteItem = useCallback(async (itemId: number) => {
        await dbService.deleteById('menu', itemId);
        setMenu(prevMenu => prevMenu.filter(item => item.id !== itemId));
    }, []);

    const handleAddReview = useCallback(async (itemId: number, review: Omit<Review, 'timestamp'>) => {
        const newReview: Review = { ...review, timestamp: new Date() };
        const targetItem = menu.find(item => item.id === itemId);
        if (!targetItem) return;
        
        const updatedItem = { ...targetItem, reviews: [newReview, ...targetItem.reviews] };
        
        await dbService.update('menu', updatedItem);
        setMenu(prevMenu => prevMenu.map(item => item.id === itemId ? updatedItem : item));
    }, [menu]);
    
    const handleUpdateQrCode = useCallback(async (newUrl: string) => {
        if (newUrl) {
            await dbService.setSetting('qrCodeUrl', newUrl);
            setQrCodeUrl(newUrl);
            addAdminNotification('Custom QR Code updated successfully.', 'success');
        }
    }, [addAdminNotification]);

    const handleUpdatePaymentDetails = useCallback(async (details: { recipientName: string; upiId: string }) => {
        await Promise.all([
            dbService.setSetting('recipientName', details.recipientName),
            dbService.setSetting('upiId', details.upiId)
        ]);
        setRecipientName(details.recipientName);
        setUpiId(details.upiId);
        addAdminNotification('Payment details updated successfully.', 'success');
    }, [addAdminNotification]);

    const handleUpdateTableStatus = useCallback(async (tableNumber: number, newStatus: 'available' | 'unavailable') => {
        const updatedStatus: TableStatus = { tableNumber, status: newStatus };
        await dbService.update('tableStatus', updatedStatus);
        setTableStatuses(prev => prev.map(s => s.tableNumber === tableNumber ? updatedStatus : s));
        addAdminNotification(`Table ${tableNumber} has been marked as ${newStatus}.`, 'success');
    }, [addAdminNotification]);
    
    // Staff Handlers
    const handleAddStaff = async (staff: Omit<StaffMember, 'id'>) => {
        const newStaff = { ...staff, id: `staff-${Date.now()}`};
        await dbService.add('staff', newStaff);
        setStaffMembers(prev => [...prev, newStaff]);
        addAdminNotification(`Added new staff member: ${staff.name}`, 'success');
    };
    
    const handleUpdateStaff = async (updatedStaff: StaffMember) => {
        await dbService.update('staff', updatedStaff);
        setStaffMembers(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
        addAdminNotification(`Updated details for ${updatedStaff.name}`, 'success');
    };

    const handleDeleteStaff = async (staffId: string) => {
        await dbService.deleteById('staff', staffId);
        // Also remove their shifts and attendance from DB
        const staffShifts = shifts.filter(s => s.staffId === staffId);
        const staffAttendance = attendanceRecords.filter(a => a.staffId === staffId);
        await Promise.all([
            ...staffShifts.map(s => dbService.deleteById('shifts', s.id)),
            ...staffAttendance.map(a => dbService.deleteById('attendance', a.id))
        ]);

        setStaffMembers(prev => prev.filter(s => s.id !== staffId));
        setShifts(prev => prev.filter(s => s.staffId !== staffId));
        setAttendanceRecords(prev => prev.filter(a => a.staffId !== staffId));
        addAdminNotification(`Removed staff member.`, 'error');
    };
    
    const handleAddShift = async (shift: Omit<Shift, 'id'>) => {
        const newShift = { ...shift, id: `shift-${Date.now()}`};
        await dbService.add('shifts', newShift);
        setShifts(prev => [...prev, newShift]);
    };

    const handleDeleteShift = async (shiftId: string) => {
        await dbService.deleteById('shifts', shiftId);
        setShifts(prev => prev.filter(s => s.id !== shiftId));
    };
    
    const handleClockIn = async (staffId: string) => {
        const newRecord: AttendanceRecord = { id: `att-${Date.now()}`, staffId, clockIn: new Date() };
        await dbService.add('attendance', newRecord);
        setAttendanceRecords(prev => [...prev, newRecord]);
    };
    
    const handleClockOut = async (staffId: string) => {
        let recordToUpdate: AttendanceRecord | undefined;
        setAttendanceRecords(prev => prev.map(rec => {
            if (rec.staffId === staffId && !rec.clockOut) {
                recordToUpdate = { ...rec, clockOut: new Date() };
                return recordToUpdate;
            }
            return rec;
        }));
        if (recordToUpdate) {
            await dbService.update('attendance', recordToUpdate);
        }
    };
    
    const handleSaveReport = async (report: Omit<MonthlyReport, 'id'>) => {
        const newReport = { ...report, id: `report-${Date.now()}` };
        await dbService.add('reports', newReport);
        setMonthlyReports(prev => [newReport, ...prev.filter(r => !(r.staffId === newReport.staffId && r.month === newReport.month && r.year === newReport.year))]);
        addAdminNotification(`Report for ${report.staffName} saved.`, 'success');
    };
    
    const handleDeleteReport = async (reportId: string) => {
        await dbService.deleteById('reports', reportId);
        setMonthlyReports(prev => prev.filter(r => r.id !== reportId));
        addAdminNotification(`Report deleted.`, 'error');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 text-stone-700">
                <ShoppingBagIcon className="h-16 w-16 text-amber-500 animate-pulse-fast" />
                <h1 className="text-3xl font-bold text-stone-900 font-cinzel mt-6">
                    Randi mava <span className="text-amber-600">restaurent</span>
                </h1>
                <p className="mt-2 text-lg">Loading restaurant data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div
              aria-live="assertive"
              className="fixed inset-x-0 top-0 flex flex-col items-center space-y-4 p-4 pointer-events-none z-[60]"
            >
              {notifications.map((notification) => (
                <NotificationToast
                  key={notification.id}
                  notification={notification}
                  onExited={removeNotification}
                />
              ))}
            </div>

            <Header currentPanel={currentPanel} onPanelSwitch={handlePanelSwitch} isLoggedIn={isAdminLoggedIn} onLogout={handleLogout} />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                {currentPanel === PanelType.CUSTOMER && (
                    <CustomerPanel 
                        menu={menu} 
                        cart={cart} 
                        addToCart={addToCart} 
                        removeFromCart={removeFromCart} 
                        placeOrder={placeOrder} 
                        onAddReview={handleAddReview} 
                        unavailableTables={unavailableTables}
                        orders={orders}
                        customerTable={customerTable}
                        onSelectTable={handleSelectTable}
                        onLeaveTable={handleLeaveTable}
                        clearCart={clearCart}
                        qrCodeUrl={qrCodeUrl}
                        preorderDateTime={preorderDateTime}
                        onSetPreorderDateTime={setPreorderDateTime}
                        addNotification={addNotification}
                        placeReservationOnlyOrder={placeReservationOnlyOrder}
                        recipientName={recipientName}
                        upiId={upiId}
                    />
                )}
                {currentPanel === PanelType.ADMIN && !isAdminLoggedIn && <AdminLogin onLogin={handleLogin} />}
                {currentPanel === PanelType.ADMIN && isAdminLoggedIn && 
                    <AdminPanel 
                        orders={orders} 
                        updateOrderStatus={updateOrderStatus}
                        menu={menu}
                        onAddItem={handleAddItem}
                        onUpdateItem={handleUpdateItem}
                        onDeleteItem={handleDeleteItem}
                        adminNotifications={adminNotifications}
                        onDismissNotification={removeAdminNotification}
                        qrCodeUrl={qrCodeUrl}
                        onUpdateQrCode={handleUpdateQrCode}
                        staff={staffMembers}
                        shifts={shifts}
                        attendance={attendanceRecords}
                        reports={monthlyReports}
                        onAddStaff={handleAddStaff}
                        onUpdateStaff={handleUpdateStaff}
                        onDeleteStaff={handleDeleteStaff}
                        onAddShift={handleAddShift}
                        onDeleteShift={handleDeleteShift}
                        onClockIn={handleClockIn}
                        onClockOut={handleClockOut}
                        onSaveReport={handleSaveReport}
                        onDeleteReport={handleDeleteReport}
                        tableStatuses={tableStatuses}
                        onUpdateTableStatus={handleUpdateTableStatus}
                        recipientName={recipientName}
                        upiId={upiId}
                        onUpdatePaymentDetails={handleUpdatePaymentDetails}
                    />}
            </main>
            {currentPanel === PanelType.CUSTOMER && <Chatbot menu={menu} />}
        </div>
    );
};

export default App;