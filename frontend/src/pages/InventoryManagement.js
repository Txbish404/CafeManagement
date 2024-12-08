"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useToast } from '../components/ui/use-toast';
import { Toast } from '../components/ui/toast';import { Plus, Edit, Trash } from 'lucide-react';
import axios from "axios";
import { useTheme } from "next-themes";

export default function InventoryManagement() {
  const { theme } = useTheme();
  const [inventory, setInventoryItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast, showToast } = useToast();

  const addForm = useForm();
  const editForm = useForm();

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/staff/inventory");
      setInventoryItems(response.data);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      });
    }
  };

  const addInventoryItem = async (data) => {
    try {
      // Convert quantity and lowStockThreshold to numbers
      const response = await axios.post("http://localhost:5000/api/staff/inventory", {
        item: data.item,
        quantity: parseInt(data.quantity), 
        unit: data.unit,
        lowStockThreshold: parseInt(data.lowStockThreshold),
        supplier: data.supplier,
      });
      console.log("Response from adding item:", response.data);
      setInventoryItems((prevItems) => [...prevItems, response.data]);
      showToast({
        title: "Success",
        description: "Inventory item added successfully",
      });
      addForm.reset();
      setIsAddDialogOpen(false);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
      console.error("Error adding inventory item:", error.response.data); 
    }
  };

  const updateInventoryItem = async (data) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/staff/inventory/${editingItem._id}`, {
        item: data.item,
        quantity: parseInt(data.quantity),
        unit: data.unit,
        lowStockThreshold: parseInt(data.lowStockThreshold),
        supplier: data.supplier,
      });
      setInventoryItems((prevItems) => 
        prevItems.map((item) => item._id === editingItem._id ? response.data : item)
      );
      showToast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
      editForm.reset();
      setEditingItem(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
      console.error("Error updating inventory item:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/staff/inventory/${id}`);
      setInventoryItems((prevItems) => prevItems.filter((item) => item._id !== id));
      showToast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
      console.error("Error deleting inventory item:", error);
    }
  };

  return (
    <div className={`p-4 space-y-4 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded-lg`}>
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Inventory Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-500 text-white hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              Add Inventory Item
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(addInventoryItem)} className="space-y-4">
            <div>
              <Label htmlFor="item" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Item Name</Label>
              <Input 
                id="item" 
                {...addForm.register("item", { required: "Item name is required" })} 
                className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} 
              />
            </div>
            <div>
              <Label htmlFor="quantity" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                {...addForm.register("quantity", { required: "Quantity is required", min: 0 })} 
                className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} 
              />
            </div>
            <div>
              <Label htmlFor="unit" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Unit</Label>
              <Input 
                id="unit" 
                {...addForm.register("unit", { required: "Unit is required" })} 
                className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} 
              />
            </div>
            <div>
              <Label htmlFor="lowStockThreshold" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Low Stock Threshold</Label>
              <Input 
                id="lowStockThreshold" 
                type="number" 
                {...addForm.register("lowStockThreshold", { required: "Low stock threshold is required", min: 0 })} 
                className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} 
              />
            </div>
            <div>
              <Label htmlFor="supplier" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Supplier</Label>
              <Input 
                id="supplier" 
                {...addForm.register("supplier")} 
                className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} 
              />
            </div>
            <Button type="submit" className
           ={`w-full p-2 rounded ${theme === "dark" ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-500 text-white hover:bg-blue-400"}`}>
              Add Item
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              Edit Inventory Item
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={editForm.handleSubmit(updateInventoryItem)} className="space-y-4">
              <div>
                <Label className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`} htmlFor="edit-item">Item Name</Label>
                <Input className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} id="edit-item" defaultValue={editingItem.item} {...editForm.register("item", { required: true })} />
              </div>
              <div>
                <Label className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`} htmlFor="edit-quantity">Quantity</Label>
                <Input className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} id="edit-quantity" type="number" defaultValue={editingItem.quantity} {...editForm.register("quantity", { required: true, min: 0 })} />
              </div>
              <div>
                <Label className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`} htmlFor="edit-unit">Unit</Label>
                <Input className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} id="edit-unit" defaultValue={editingItem.unit} {...editForm.register("unit", { required: true })} />
              </div>
              <div>
                <Label className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`} htmlFor="edit-lowStockThreshold">Low Stock Threshold</Label>
                <Input className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} id="edit-lowStockThreshold" type="number" defaultValue={editingItem.lowStockThreshold} {...editForm.register("lowStockThreshold", { required: true, min: 0 })} />
              </div>
              <div>
                <Label className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`} htmlFor="edit-supplier">Supplier</Label>
                <Input className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} id="edit-supplier" defaultValue={editingItem.supplier} {...editForm.register("supplier")} />
              </div>
              <Button type="submit" className={`w-full p-2 rounded ${theme === "dark" ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-500 text-white hover:bg-blue-400"}`}>
                Update Item
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inventory.map((item) => (
          <Card key={item._id} className="flex flex-col justify-between space-y-2 h-full">
            <div>
              <CardHeader>
                <CardTitle>{item.item}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Quantity: {item.quantity} {item.unit}</p>
                <p>Low Stock Threshold: {item.lowStockThreshold}</p>
                <p>Supplier: {item.supplier || 'N/A'}</p>
                <p>Last Restocked: {
                new Date(item.lastRestocked).toLocaleDateString()}</p>
                {item.quantity <= item.lowStockThreshold && (
                  <p className="text-red-500 font-bold">Low Stock Alert!</p>
                )}
              </CardContent>
            </div>
            <div className="flex justify-between items-center mt-auto p-2 space-x-2 border-t pt-2">
              <Button 
                onClick={() => {
                  setEditingItem(item);
                  setIsEditDialogOpen(true);
                }} 
                className="bg-yellow-500 text-white hover:bg-yellow-600 flex items-center"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white hover:bg-red-600 flex items-center">
                <Trash className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Toast toast={toast} />

    </div>
  );
}