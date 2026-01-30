
export interface BookingRequest {
  parkingSpotId: number;
  startTime: string; 
  endTime: string;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  carColor: string;
  userId: number;
}