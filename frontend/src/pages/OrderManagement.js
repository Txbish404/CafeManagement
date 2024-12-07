import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from '../components/ui/use-toast';
import { Toast } from '../components/ui/toast';
function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    fetchOrders();
    const fetchInterval = setInterval(() => {
      fetchOrders();
    }, 5000);
    
    return () => {
      clearInterval(fetchInterval);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/staff/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/staff/orders/${orderId}`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:5000/api/staff/orders/${orderId}/cancel`);
      showToast({
        title: "Order Cancelled",
        description: `Order ${orderId} has been cancelled.`,
      });
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500';
      case 'Preparing': return 'bg-blue-500';
      case 'Ready for Pickup': return 'bg-green-500';
      case 'Completed': return 'bg-gray-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      <Table>
        <TableCaption>A list of all orders.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order._id}>
              <TableCell>{order._id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>${order.total}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                <span className="ml-2">{order.status}</span>
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedOrder(order)}>View Details</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Order Details</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                      <div>
                        <p>Order ID: {selectedOrder._id}</p>
                        <p>Customer: {selectedOrder.customerName}</p>
                        <p>Total Amount: ${selectedOrder.total}</p>
                        <h3 className="font-bold mt-2">Items:</h3>
                        <ul>
                          {selectedOrder.items.map(item => (
                            <li key={item._id}>
                              {item.items.name} x {item.quantity} - ${item.price}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex space-x-2">
                          <Button 
                            onClick={() => updateOrderStatus(selectedOrder._id, 'Preparing')} 
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
                          >
                            Mark as Preparing
                          </Button>
                          <Button 
                            onClick={() => updateOrderStatus(selectedOrder._id, 'Ready for Pickup')} 
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
                          >
                            Mark as Ready for Pickup
                          </Button>
                          <Button 
                            onClick={() => updateOrderStatus(selectedOrder._id, 'Completed')} 
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
                          >
                            Mark as Completed
                          </Button>
                          <Button 
                            onClick={() => cancelOrder(selectedOrder._id)} 
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
                          >
                            Cancel Order
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Toast toast={toast} />

    </div>
  );
}

export default OrderManagement;