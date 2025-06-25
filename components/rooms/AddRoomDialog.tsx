import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Room } from '@/types';

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomAdded: () => void; // Callback to notify parent about successful addition or edit
  editingRoom?: Room | null; // Optional prop for editing existing room
}

export const AddRoomDialog: React.FC<AddRoomDialogProps> = ({ open, onOpenChange, onRoomAdded, editingRoom }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [type, setType] = useState<'AC' | 'Non-AC'>('Non-AC');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingRoom) {
      setRoomNumber(editingRoom.roomNumber);
      setCapacity(editingRoom.capacity.toString());
      setType(editingRoom.type);
    } else {
      // Reset form when dialog opens for adding a new room
      setRoomNumber('');
      setCapacity('2');
      setType('Non-AC');
    }
  }, [editingRoom, open]); // React to changes in editingRoom or dialog open state

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
      const method = editingRoom ? 'PUT' : 'POST';
      // Ensure id is present for updates
      if (editingRoom && !editingRoom.id) {
        toast({
          title: 'Error',
          description: 'Room ID is missing for update.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: roomNumber.trim(),
          capacity: parseInt(capacity),
          type,
        }),
      });

      if (res.ok) {
        toast({
          title: editingRoom ? "Room updated" : "Room added",
          description: editingRoom ? "Room details updated successfully" : "New room has been added successfully",
        });
        onRoomAdded(); // Notify parent
        onOpenChange(false); // Close dialog
        // Reset form for next use (if not editing)
        if (!editingRoom) {
        setRoomNumber('');
        setCapacity('2');
        setType('Non-AC');
        }
      } else {
        const errorData = await res.json();
        toast({
          title: editingRoom ? "Error updating room" : "Error adding room",
          description: errorData.error || (editingRoom ? "Failed to update room" : "Failed to add room"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(editingRoom ? "Failed to update room:" : "Failed to add room:", error);
      toast({
        title: "Error",
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
          <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          <DialogDescription>
            {editingRoom ? 'Edit the details of this room' : 'Create a new room in the hostel inventory'}
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
              {isLoading ? (editingRoom ? "Saving Changes..." : "Adding Room...") : (editingRoom ? "Save Changes" : "Add Room")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
