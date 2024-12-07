"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from '../components/ui/use-toast';
import { Toast } from '../components/ui/toast';import { Plus, Edit, Trash } from 'lucide-react';
import axios from "axios";
import { useTheme } from "next-themes";

export default function MenuManagement() {
  const { theme } = useTheme();
  const { toast, showToast } = useToast();
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const addForm = useForm();
  const editForm = useForm();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/staff/menu");
      setMenuItems(response.data);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    }
  };

  const addMenuItem = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/api/staff/menu", {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        quantity: parseInt(data.quantity),
        threshold: parseInt(data.threshold),
        available: true,
      });
      setMenuItems((prevItems) => [...prevItems, response.data]);
      showToast({
        title: "Success",
        description: "Menu item added successfully",
      });
      addForm.reset();
      setIsAddDialogOpen(false);
    }

    catch (error) {
      showToast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive",
      });
      console.error("Error adding menu item:", error);
    }
  };

  const updateMenuItem = async (data) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/staff/menu/${editingItem._id}`, {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category || editingItem.category,
        quantity: parseInt(data.quantity),
        threshold: parseInt(data.threshold),
        available: true,
      });
      setMenuItems((prevItems) => 
        prevItems.map((item) => item._id === editingItem._id ? response.data : item)
      );
      showToast({
        title: "Success",
        description: "Menu item updated successfully",
      });
      editForm.reset();
      setEditingItem(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      });
      console.error("Error updating menu item:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/staff/menu/${id}`);
      setMenuItems((prevItems) => prevItems.filter((item) => item._id !== id));
      showToast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
      console.error("Error deleting menu item:", error);
    }
  };


  return (
    <div className={`p-4 space-y-4 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded-lg`}>
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Menu Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-500 text-white hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              Add Menu Item
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(addMenuItem)} className="space-y-4">
          <div>
            <Label htmlFor="name" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Name</Label>
            <Input 
              id="name" 
              {...addForm.register("name", { required: "Name is required" })} 
              className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} 
            />
          </div>
          <div>
            <Label htmlFor="description" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Description</Label>
            <Textarea 
              id="description" 
              {...addForm.register("description", { required: "Description is required" })} 
              className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} 
            />
          </div>
          <div>
            <Label htmlFor="price" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Price</Label>
            <Input 
              id="price" 
              type="number" 
              step="0.01" 
              {...addForm.register("price", { required: "Price is required", min: 0 })} 
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
            <Label htmlFor="threshold" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Low Stock Threshold</Label>
            <Input 
              id="threshold" 
              type="number" 
              {...addForm.register("threshold", { required: "Threshold is required", min: 0 })} 
              className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} 
            />
          </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                {...addForm.register("category", { required: "Category is required" })}
                className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`}              >
                <option value="">Select category</option>
                <option value="beverages">Beverages</option>
                <option value="food">Food</option>
                <option value="desserts">Desserts</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>
            <Button type="submit" className={`w-full p-2 rounded ${theme === "dark" ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-500 text-white hover:bg-blue-400"}`} >
              Add Item
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              Edit Menu Item
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={editForm.handleSubmit(updateMenuItem)} className="space-y-4">
              <div>
                <Label className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`} htmlFor="edit-name">Name</Label>
                <Input className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} id="edit-name" defaultValue={editingItem.name} {...editForm.register("name", { required: true })} />
              </div>
              <div>
                <Label className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`} htmlFor="edit-description">Description</Label>
                <Textarea className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} id="edit-description" defaultValue={editingItem.description} {...editForm.register("description", { required: true })} />
              </div>
              <div>
                <Label className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`} htmlFor="edit-price">Price</Label>
                <Input className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} id="edit-price" type="number" step="0.01" defaultValue={editingItem.price} {...editForm.register("price", { required: true, min: 0 })} />
              </div>
              <div>
                <Label className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`} htmlFor="edit-quantity">Quantity</Label>
                <Input className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} id="edit-quantity" type="number" defaultValue={editingItem.quantity} {...editForm.register("quantity", { required: true, min: 0 })} />
              </div>
              <div>
                <Label className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}htmlFor="edit-threshold">Low Stock Threshold</Label>
                <Input className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`} id="edit-threshold" type="number" defaultValue={editingItem.threshold} {...editForm.register("threshold", { required: true, min: 0 })} />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  {...editForm.register("category", { required: "Category is required" })}
                  className={`w-full p-2 border rounded ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"}`}
                  defaultValue={editingItem.category}
                >
                  <option value="beverages">Beverages</option>
                  <option value="food">Food</option>
                  <option value="desserts">Desserts</option>
                  <option value="snacks">Snacks</option>
                </select>
              </div>
              <Button type="submit" className={`w-full p-2 rounded ${theme === "dark" ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-500 text-white hover:bg-blue-400"}`}>
                Update Item
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Card key={item._id} className="flex flex-col justify-between space-y-2 h-full">
            <div>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{item.description}</p>
                <p>Price: ${item.price.toFixed(2)}</p>
                <p>Category: {item.category}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Threshold: {item.threshold}</p>
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

