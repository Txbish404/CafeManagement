"use client"

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useToast } from './ui/use-toast';
import { Plus, Edit, Trash } from 'lucide-react';
import axios from 'axios';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();
  const { showToast } = useToast();  // Destructure showToast here


  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/staff/menu');
      setMenuItems(response.data);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingItem) {
        await axios.put(`/api/staff/menu/${editingItem._id}`, data);
        showToast({
          title: "Success",
          description: "Menu item updated successfully",
        });
      } else {
        await axios.post('/api/staff/menu', data);
        showToast({
          title: "Success",
          description: "Menu item added successfully",
        });
      }
      fetchMenuItems();
      reset();
      setEditingItem(null);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    Object.keys(item).forEach(key => {
      setValue(key, item[key]);
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`/api/staff/menu/${id}`);
      fetchMenuItems();
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
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name', { required: true })} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { required: true, min: 0 })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) => setValue('category', value)}
                  defaultValue={editingItem?.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...register('quantity', { required: true, min: 0 })}
                />
              </div>
              <div>
                <Label htmlFor="threshold">Low Stock Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  {...register('threshold', { required: true, min: 0 })}
                />
              </div>
              <Button type="submit">
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Card key={item._id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
                <p className="font-medium">${item.price.toFixed(2)}</p>
                <p>
                  Stock: {item.quantity}{' '}
                  {item.quantity <= item.threshold && (
                    <span className="text-red-500">(Low Stock)</span>
                  )}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

