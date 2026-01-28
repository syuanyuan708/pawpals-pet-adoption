
import { Pet, PetType, Message } from './types';

export const MOCK_PETS: Pet[] = [
  {
    id: '1',
    name: '巴迪',
    type: PetType.DOG,
    breed: '金毛寻回犬',
    age: '2岁',
    gender: '公',
    weight: '25 公斤',
    color: '金色',
    distance: '2.5 公里',
    description: '巴迪是一只非常友好且精力充沛的金毛寻回犬，喜欢在公园里玩捡球游戏。它与孩子和其他狗狗相处得很好。它已经受过室内训练，懂简单的指令，比如坐下、定住和握手。',
    tags: ['活泼', '忠诚', '已接种疫苗'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOYmOoQvuSE2PPxMj23P_p3kb-FRaaka0422ts0X8w_P3KanqSggDK4c_E-ao-Q0IB2RIhqjgDwnE6Mo3NXP9oue2AidoiceLSJ3hHEuKcmGHkSaBFofBEXdYdtN4Zp1Qt_2PEi59M9vSnOYqcjDj5HX7p8aVfOoVcjZGuTW13J2zCjbcqRWYy1rnBfhMoAzKsV5FlZl6Mtb_BgRSPd_8NSL-F4EUujM_Xmvy4ZVw9xMMoKKZc2NbeyzzKWb1MKxRIrkjohAISLnkf',
    isLatest: false,
    healthInfo: ['疫苗接种齐全', '已植入芯片', '需要带围栏的院子'],
    location: '旧金山',
    shelter: {
      name: '快乐爪爪庇护所',
      owner: '莎拉·詹金斯',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB18O16LCiRbAg6uXnPqJ84Y97ktvrAYPOB5xhU-DwKmQteFa9XnbOThbhZLNrVsEUo83mCvGR6jw6Y19BDkXhJrZEUqucdBDDxhbmpA5-EjAlw_eBVr7FbygiCgYPh0QbA_hUVWhKSRHCgM3YmyDqohxtl06iKFpCQ7GXlgppKTePatoAdMDmzu-gfLPgkhAlNz6Ex6BKQNz_gQ93clovD0WvEyVFbQfz8N01Sl6cAn16z8we60ppz82gyU9mLiIK58EO8_zyH5MHF',
      isVerified: true
    }
  },
  {
    id: '2',
    name: '露娜',
    type: PetType.CAT,
    breed: '暹罗猫',
    age: '4个月',
    gender: '母',
    weight: '2 公斤',
    color: '奶油色',
    distance: '1.8 公里',
    description: '露娜是一只优雅且粘人的暹罗猫。她喜欢在阳光充足的窗台上打盹，也喜欢和它的主人互动。',
    tags: ['温顺', '爱干净'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCI-9T3A497TDKQbxSIib1ZF1tMMjFigAW6v_JGv4Z6vcZhfo7-nSMEaK2vrRVeD_-M87Tj8NN4fpc5veCT5w2WQNBaiDp31Tz6D0x1ONdEqhJfWMl4BmLxd4iRg0EmNzdbqRclNP1gR-59qXR8vbdRjKmphyURg1iF9gkl2X_oezWNrViXQvJGjmRGoE860jiPyqu6bMMXoeySPmimiSsNlgeLRtq7AKrL2HIpdaGuQhwKUbxgAFwtsSuKMqyz6fUR2c71rpfH_Vds',
    isLatest: true,
    healthInfo: ['已接种疫苗', '已体内外驱虫'],
    location: '上海市',
    shelter: {
      name: '猫咪乐园',
      owner: '王先生',
      avatar: 'https://picsum.photos/100/100',
      isVerified: true
    }
  },
  {
    id: '3',
    name: '奶酪',
    type: PetType.DOG,
    breed: '柯基犬',
    age: '1岁半',
    gender: '公',
    weight: '11 公斤',
    color: '黄白色',
    distance: '3.2 公里',
    description: '奶酪是一只活泼可爱的柯基犬，拥有标志性的短腿和迷人的笑容。他性格开朗，喜欢和人玩耍，尤其是小朋友。奶酪已经完成了基础服从训练，会坐、卧、握手等指令，性格温和不咬人。他每天都需要适量的运动，喜欢散步和玩飞盘。由于柯基犬容易发胖，需要控制饮食和定期锻炼。',
    tags: ['可爱', '聪明', '亲人', '已绝育'],
    image: 'https://images.unsplash.com/photo-1612536699107-2f5e4d6b4f7c?w=800&auto=format&fit=crop',
    isLatest: false,
    healthInfo: ['疫苗接种齐全', '已绝育', '已植入芯片', '定期体检健康', '需要控制体重'],
    location: '北京市',
    shelter: {
      name: '爱心宠物之家',
      owner: '李女士',
      avatar: 'https://i.pravatar.cc/150?img=5',
      isVerified: true
    }
  },
  {
    id: '4',
    name: '咪咪',
    type: PetType.CAT,
    breed: '英国短毛猫',
    age: '2岁',
    gender: '母',
    weight: '4.5 公斤',
    color: '蓝灰色',
    distance: '1.5 公里',
    description: '咪咪是一只优雅的英国短毛猫，拥有浓密的蓝灰色被毛和迷人的金铜色眼睛。她性格温顺安静，适合公寓饲养，不会乱叫或破坏家具。咪咪非常独立，但也喜欢和主人互动，尤其是在傍晚时分会变得特别粘人。她喜欢晒太阳和玩逗猫棒，对猫薄荷特别感兴趣。咪咪已经完全适应了猫砂盆，非常爱干净，会定期自己梳理毛发。她适合有经验的养猫家庭或者安静的单身人士。',
    tags: ['温顺', '独立', '安静', '已绝育', '爱干净'],
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop',
    isLatest: true,
    healthInfo: ['疫苗接种齐全', '已绝育', '已体内外驱虫', '定期健康检查', '无遗传病史'],
    location: '深圳市',
    shelter: {
      name: '温馨猫舍',
      owner: '张小姐',
      avatar: 'https://i.pravatar.cc/150?img=9',
      isVerified: true
    }
  }
];

export const MOCK_USER = {
  name: '林晨',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD98djoVhyUHheVwSuycITa5bwnrQGHBKt7pTKeBsi7lz31kqLERhdNRuzvSVdO2ZgvZ8sT3O5t16zXsbfhjrLPlEEHRtDYmTUgTcHK71QadG1Dft1m9HF-1w-X2dhJ_8Xd-ITQHy7ZojY1NuNBN72XQGoZMQDztREyin63vZ3FsSY2yIaxtXPl-lFee66RHz5AJkKzknKBKG5HJm2ePGTIqNE9QSGlNotxw2sz7oc4mLx84TM9kFrXJv8sULps6HBoTV64iD9njTOT',
  joinDate: '2023年加入',
  petsAdoptedCount: 2
};

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderName: '系统通知',
    senderAvatar: 'https://img.icons8.com/fluency/96/appointment-reminders.png',
    content: '欢迎来到 PawPals！完善您的资料可以提高领养成功率。',
    time: '昨天',
    isUnread: false,
    type: 'system'
  },
  {
    id: 'm2',
    senderName: '莎拉·詹金斯',
    senderAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB18O16LCiRbAg6uXnPqJ84Y97ktvrAYPOB5xhU-DwKmQteFa9XnbOThbhZLNrVsEUo83mCvGR6jw6Y19BDkXhJrZEUqucdBDDxhbmpA5-EjAlw_eBVr7FbygiCgYPh0QbA_hUVWhKSRHCgM3YmyDqohxtl06iKFpCQ7GXlgppKTePatoAdMDmzu-gfLPgkhAlNz6Ex6BKQNz_gQ93clovD0WvEyVFbQfz8N01Sl6cAn16z8we60ppz82gyU9mLiIK58EO8_zyH5MHF',
    content: '你好，关于巴迪的领养申请我们已经收到，稍后会安排电话回访。',
    time: '2小时前',
    isUnread: true,
    type: 'user'
  }
];
