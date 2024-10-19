export interface DharmaTransaction {
  fromUserId: string;
  toUserId: string;
  amount: number;
  timestamp: string; // Assuming the backend provides a timestamp
}
