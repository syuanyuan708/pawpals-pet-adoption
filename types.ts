
export enum PetType {
  DOG = '狗狗',
  CAT = '猫咪',
  BIRD = '鸟类',
  RABBIT = '兔子'
}

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  age: string;
  gender: '公' | '母';
  weight: string;
  color: string;
  distance: string;
  description: string;
  tags: string[];
  image: string;
  isLatest?: boolean;
  healthInfo: string[];
  location: string;
  shelter: {
    name: string;
    owner: string;
    avatar: string;
    isVerified: boolean;
  };
}

export interface User {
  name: string;
  avatar: string;
  joinDate: string;
  petsAdoptedCount: number;
}

export interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  isUnread: boolean;
  type: 'system' | 'user';
}
