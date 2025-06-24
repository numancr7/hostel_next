import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomAdded: () => void; // Callback to notify parent about successful addition
}

export const AddRoomDialog: React.FC<AddRoomDialogProps> = ({ open, onOpenChange, onRoomAdded }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [type, setType] = useState<'AC' | 'Non-AC'>('Non-AC');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!roomNumber.trim()) {
      toast({
        title: "Error",
        description: "Room number is required",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: roomNumber.trim(),
          capacity: parseInt(capacity),
          type,
        }),
      });

      if (res.ok) {
        toast({
          title: "Room added",
          description: "New room has been added successfully",
        });
        onRoomAdded(); // Notify parent
        onOpenChange(false); // Close dialog
        // Reset form
        setRoomNumber('');
        setCapacity('2');
        setType('Non-AC');
      } else {
        const errorData = await res.json();
        toast({
          title: "Error adding room",
          description: errorData.error || "Failed to add room",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to add room:", error);
      toast({
        title: "Error adding room",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>
            Create a new room in the hostel inventory
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g., 101, A-201"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Select value={capacity} onValueChange={setCapacity} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Person</SelectItem>
                <SelectItem value="2">2 Persons</SelectItem>
                <SelectItem value="3">3 Persons</SelectItem>
                <SelectItem value="4">4 Persons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Room Type</Label>
            <Select value={type} onValueChange={(value: 'AC' | 'Non-AC') => setType(value)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Non-AC">Non-AC</SelectItem>
                <SelectItem value="AC">AC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding Room..." : "Add Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
