import { ClsStore } from 'nestjs-cls';

export interface RequestClsStore extends ClsStore {
  userId?: string;
}
