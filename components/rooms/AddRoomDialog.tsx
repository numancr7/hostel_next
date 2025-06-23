
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
  onAddRoom: (room: { roomNumber: string; capacity: number; type: 'AC' | 'Non-AC' }) => void;
}

export const AddRoomDialog: React.FC<AddRoomDialogProps> = ({ open, onOpenChange, onAddRoom }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [type, setType] = useState<'AC' | 'Non-AC'>('Non-AC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomNumber.trim()) {
      toast({
        title: "Error",
        description: "Room number is required",
        variant: "destructive",
      });
      return;
    }

    onAddRoom({
      roomNumber: roomNumber.trim(),
      capacity: parseInt(capacity),
      type
    });

    // Reset form
    setRoomNumber('');
    setCapacity('2');
    setType('Non-AC');

    toast({
      title: "Room added",
      description: "New room has been added successfully",
    });
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
            />
          </div>

          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Select value={capacity} onValueChange={setCapacity}>
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
            <Select value={type} onValueChange={(value: 'AC' | 'Non-AC') => setType(value)}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Room</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
