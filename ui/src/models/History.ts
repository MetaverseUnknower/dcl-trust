export interface DharmaTransaction {
  fromUserId: string;
  toUserId: string;
  amount: number;
  reason: string;
  timestamp: number;
}
