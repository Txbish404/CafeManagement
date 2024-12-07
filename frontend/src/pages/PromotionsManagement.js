import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from "react-hook-form";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from '../components/ui/use-toast';
import { Toast } from '../components/ui/toast';import { Switch } from "../components/ui/switch";
import { useTheme } from '../components/theme-provider';

function PromotionsManagement() {
  const { theme } = useTheme();
  const [promotions, setPromotions] = useState([]);
  const [editingPromotion, setEditingPromotion] = useState(null); // State for the promotion being edited
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { toast, showToast } = useToast();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/staff/promotions');
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      showToast({
        title: "Error",
        description: "Failed to fetch promotions",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      await axios.post('http://localhost:5000/api/staff/promotions', {
        code: data.code,
        description: data.description,
        discountPercentage: parseInt(data.discountPercentage),
        expirationDate: data.expirationDate
      });
      setPromotions([...promotions, data]);
      reset();
      fetchPromotions();
      showToast({
        title: "Success",
        description: "Promotion added successfully",
      });
    } catch (error) {
      console.error('Error adding promotion:', error);
      showToast({
        title: "Error",
        description: "Failed to add promotion",
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data) => {
    try {
      await axios.put(`http://localhost:5000/api/staff/promotions/${editingPromotion._id}`, {
        code: data.code,
        description: data.description,
        discountPercentage: parseInt(data.discountPercentage),
        expirationDate: data.expirationDate
      });
      setPromotions(prevPromotions => 
        prevPromotions.map(promotion => 
          promotion._id === editingPromotion._id ? { ...promotion, ...data } : promotion
        )
      );
      reset();
      setEditingPromotion(null); // Reset editing promotion
      fetchPromotions(); // Refetch promotions to update the expiration date sort order
      showToast({
        title: "Success",
        description: "Promotion updated successfully",
      });
    } catch (error) {
      console.error('Error updating promotion:', error);
      showToast({
        title: "Error",
        description: "Failed to update promotion",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (promotion) => {
    setEditingPromotion(promotion);
    setValue("code", promotion.code);
    setValue("description", promotion.description);
    setValue("discountPercentage", promotion.discountPercentage);
    setValue("expirationDate", promotion.expirationDate);
  };

  const toggleActive = async (id, currentActive) => {
    try {
      await axios.put(`http://localhost:5000/api/staff/promotions/${id}`, { active: !currentActive });
      setPromotions(prevPromotions => 
        prevPromotions.map(promotion => 
          promotion._id === id ? { ...promotion, active: !currentActive } : promotion
        )
      );
      
    } catch (error) {
      console.error('Error updating promotion:', error);
      showToast({
        title: "Error",
        description: "Failed to update promotion",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray- 50 text-gray-800'} rounded-lg shadow-md`}>
      <h2 className="text-3xl font-bold mb-6">Promotions Management</h2>
      
      {/* Add New Promotion Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className={`mb-4 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>Add New Promotion</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Promotion</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="code" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Promotion Code</Label>
              <Input
                id="code"
                {...register("code", { required: "Promotion code is required" })}
                className={`border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <Label htmlFor="description" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Description</Label>
              <Input
                id="description"
                {...register("description", { required: "Description is required" })}
                className={`border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="discountPercentage" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Discount Percentage</Label>
              <Input
                id="discountPercentage"
                type="number"
                {...register("discountPercentage", { 
                  required: "Discount percentage is required",
                  min: { value: 0, message: "Discount cannot be negative" },
                  max: { value: 100, message: "Discount cannot exceed 100%" }
                })}
                className={`border ${errors.discountPercentage ? 'border-red-500' : 'border-gray-300'} rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              {errors.discountPercentage && <p className="text-red-500 text-sm mt-1">{errors.discountPercentage.message}</p>}
            </div>
            <div>
              <Label htmlFor="expirationDate" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register("expirationDate", { required: "Expiration date is required" })}
                className={`border ${errors.expirationDate ? 'border-red-500' : 'border-gray-300'} rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              {errors.expirationDate && <p className="text-red-500 text-sm mt-1">{errors.expirationDate.message}</p>}
            </div>
            <Button type="submit" className={`bg-green-600 text-white hover:bg-green-700 ${theme === 'dark' ? 'hover:bg-green-800' : ''}`}>Add Promotion</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Promotion Dialog */}
      <Dialog open={!!editingPromotion} onOpenChange={() => setEditingPromotion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Promotion</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="code" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Promotion Code</Label>
              <Input
                id="code"
                {...register("code", { required: "Promotion code is required" })}
                className={` border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <Label htmlFor="description" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Description</Label>
              <Input
                id="description"
                {...register("description", { required: "Description is required" })}
                className={`border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="discountPercentage" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Discount Percentage</Label>
              <Input
                id="discountPercentage"
                type="number"
                {...register("discountPercentage", { 
                  required: "Discount percentage is required",
                  min: { value: 0, message: "Discount cannot be negative" },
                  max: { value: 100, message: "Discount cannot exceed 100%" }
                })}
                className={`border ${errors.discountPercentage ? 'border-red-500' : 'border-gray-300'} rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              {errors.discountPercentage && <p className="text-red-500 text-sm mt-1">{errors.discountPercentage.message}</p>}
            </div>
            <div>
              <Label htmlFor="expirationDate" className={`block mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register("expirationDate", { required: "Expiration date is required" })}
                className={`border ${errors.expirationDate ? 'border-red-500' : 'border-gray-300'} rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              {errors.expirationDate && <p className="text-red-500 text-sm mt-1">{errors.expirationDate.message}</p>}
            </div>
            <Button type="submit" className={`bg-blue-600 text-white hover:bg-blue-700 ${theme === 'dark' ? 'hover:bg-blue-800' : ''}`}>Update Promotion</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Table className="mt-6">
        <TableCaption>A list of all promotions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className={`bg-gray-200 ${theme === 'dark' ? 'bg-gray-700 text-white' : ''}`}>Code</TableHead>
            <TableHead className={`bg-gray-200 ${theme === 'dark' ? 'bg-gray-700 text-white' : ''}`}>Description</TableHead>
            <TableHead className={`bg-gray-200 ${theme === 'dark' ? 'bg-gray-700 text-white' : ''}`}>Discount</TableHead>
            <TableHead className={`bg-gray-200 ${theme === 'dark' ? 'bg-gray-700 text-white' : ''}`}>Expiration Date</TableHead>
            <TableHead className={`bg-gray-200 ${theme === 'dark' ? 'bg-gray-700 text-white' : ''}`}>Active</TableHead>
            <TableHead className={`bg-gray-200 ${theme === 'dark' ? 'bg-gray-700 text-white' : ''}`}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promotions.map(promotion => (
            <TableRow key={promotion._id} className={`hover:bg-gray-100 ${theme === 'dark' ? 'hover:bg-gray-600' : ''}`}>
              <TableCell>{promotion.code}</TableCell>
              <TableCell>{promotion.description}</TableCell>
              <TableCell>{promotion.discountPercentage}%</TableCell>
              <TableCell>{new Date(promotion.expirationDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Switch
                  checked={promotion.active}
                  onCheckedChange={() => toggleActive(promotion._id, promotion.active)}
                />
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  onClick={() => handleEditClick(promotion)} 
                  className={`text-blue-600 hover:bg-blue-100 ${theme === 'dark' ? 'hover:bg-blue-900 hover:text-white' : 'hover:bg-blue-700 hover:text-white'}`}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Toast toast={toast} />
    </div>
  );
}

export default PromotionsManagement;