export interface MoveInquiry {
  fullName: string;
  email: string;
  phone: string;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  createdAt: number;
  status: 'new' | 'pending' | 'processed';
}