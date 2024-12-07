"use client"

import React, { useState, useEffect } from 'react';
// import { useWebSocket } from '../hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useToast } from './ui/use-toast';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();  // Destructure showToast here

  // const ws = useWebSocket();

  useEffect(() => {
    fetchOrders();
    
    // Listen for new orders
    ws.addListener('NEW_ORDER', handleNewOrder);
    
    return () => {
      ws.removeListener('NEW_ORDER', handleNewOrder);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/staff/orders');
      setOrders(response.data);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = (order) => {
    setOrders(prev => [order, ...prev]);
    showToast({
      title: "New Order",
      description: `Order #${order._id} received`,
    });
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/staff/orders/${orderId}`, { status });
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status } : order
        )
      );
      showToast({
        title: "Success",
        description: "Order status updated",
      });
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      preparing: "primary",
      ready: "success",
      completed: "secondary",
      cancelled: "destructive"
    };

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Order Management</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map(order => (
          <Card key={order._id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Order #{order._id.slice(-6)}</span>
                {getStatusBadge(order.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Items:</h4>
                  <ul className="list-disc list-inside">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Total: ${order.total.toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Start Preparing
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order._id, 'ready')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order._id, 'completed')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
