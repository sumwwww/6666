/**
 * src/game/data/randomEvents.ts
 * Full random event pools for daily actions, exploration, and NPC knock events.
 * All descriptive texts are taken from the design document, with pure numeric
 * mechanic hints in parentheses removed.
 */

import type {
  DailyEvent,
  ExploreEvent,
  ExploreDangerLevel,
  NpcDoorEvent,
} from '../types'

/**
 * dailyRandomEvents
 * Random events triggered by daily actions (exercise, cook, drink, playWithCat,
 * read, rest) including follow-up narrative events.
 */
export const dailyRandomEvents: DailyEvent[] = [
  // 锻炼事件 exercise 1–10
  {
    id: 'exercise-1',
    action: 'exercise',
    title: '橙子变成负重教练',
    description: '你尝试做俯卧撑，橙子跳到你背上增加负重。效果拔群！',
  },
  {
    id: 'exercise-2',
    action: 'exercise',
    title: '军体拳回忆',
    description: '想起爷爷教的军体拳，打得有模有样。',
  },
  {
    id: 'exercise-3',
    action: 'exercise',
    title: '旧伤复发',
    description: '脚下一滑扭到腰，旧伤复发。',
  },
  {
    id: 'exercise-4',
    action: 'exercise',
    title: '铁头功失败',
    description: '找到一本《少林七十二绝技》，试图练习“铁头功”，失败。',
  },
  {
    id: 'exercise-5',
    action: 'exercise',
    title: '阿斯达克吼',
    description: '模仿李小龙的叫声，感觉战力提升了！',
  },
  {
    id: 'exercise-5-follow',
    action: 'exercise',
    title: '水壶惨案',
    description:
      '几天后，你在锻炼时突然想起那天的叫声，忍不住又试了一次。结果橙子以为你在召唤它，飞奔过来撞翻了你的水壶。你看着湿透的地板和一脸无辜的橙子，哭笑不得。',
    isFollowUp: true,
    triggerKey: 'exercise-5',
  },
  {
    id: 'exercise-6',
    action: 'exercise',
    title: '废旧轮胎杠铃',
    description: '用废旧轮胎制作简易杠铃。',
  },
  {
    id: 'exercise-7',
    action: 'exercise',
    title: '倒立三秒',
    description: '尝试倒立行走，坚持了3秒。',
  },
  {
    id: 'exercise-8',
    action: 'exercise',
    title: '自恋属性解锁',
    description: '看到镜子里的自己，被肌肉线条吓到。',
  },
  {
    id: 'exercise-8-follow',
    action: 'exercise',
    title: '镜子前的舞台',
    description:
      '从那以后，你每次经过镜子都会不自觉多看两眼。甚至开始研究不同的姿势，展示自己的“力量”。橙子学会了你的姿势，它现在会对着镜子摆造型了。',
    isFollowUp: true,
    triggerKey: 'exercise-8',
  },
  {
    id: 'exercise-9',
    action: 'exercise',
    title: '猫式俯卧撑',
    description: '橙子模仿你的动作，它在做猫式俯卧撑。',
  },
  {
    id: 'exercise-9-follow',
    action: 'exercise',
    title: '再次水壶惨案',
    description:
      '几天后，你在锻炼时突然想起那天的叫声，忍不住又试了一次。结果橙子以为你在召唤它，飞奔过来撞翻了你的水壶。你看着湿透的地板和一脸无辜的橙子，哭笑不得。',
    isFollowUp: true,
    triggerKey: 'exercise-9',
  },
  {
    id: 'exercise-10',
    action: 'exercise',
    title: '老鼠引路',
    description: '锻炼时听到隔壁有声音，原来是老鼠。',
  },
  {
    id: 'exercise-10-follow',
    action: 'exercise',
    title: '银元藏匿点',
    description:
      '你顺着老鼠的踪迹，在墙角的破洞后发现了一个小空间。里面有一个生锈的铁盒，打开后发现是祖辈藏的几枚银元。虽然现在货币没用，但银元本身或许有价值。',
    isFollowUp: true,
    triggerKey: 'exercise-10',
  },

  // 做饭事件 cook 1–10
  {
    id: 'cook-1',
    action: 'cook',
    title: '过期咖喱的奇迹',
    description: '尝试用过期三年的咖喱块，味道居然不错！',
  },
  {
    id: 'cook-2',
    action: 'cook',
    title: '一个人的火锅',
    description: '找到一包火锅底料，一个人吃出了寂寞。',
  },
  {
    id: 'cook-3',
    action: 'cook',
    title: '妈妈的味道',
    description: '烹饪时想起妈妈的味道，眼眶湿润。',
  },
  {
    id: 'cook-4',
    action: 'cook',
    title: '烧焦套餐',
    description: '食物烧焦了，只能硬着头皮吃。',
  },
  {
    id: 'cook-5',
    action: 'cook',
    title: '罐头炖野菜',
    description: '发明新菜式：“罐头炖野菜”，橙子闻了就跑。',
  },
  {
    id: 'cook-6',
    action: 'cook',
    title: '老干妈拯救世界',
    description: '找到一瓶老干妈，瞬间感觉到达人生巅峰！',
  },
  {
    id: 'cook-7',
    action: 'cook',
    title: '未知生日蛋糕',
    description: '尝试做蛋糕庆祝“不知道哪一天”的生日。',
  },
  {
    id: 'cook-8',
    action: 'cook',
    title: '被老鼠先下手',
    description: '食物被老鼠偷吃，只能吃剩下的。',
  },
  {
    id: 'cook-9',
    action: 'cook',
    title: '甜蜜回忆',
    description: '用最后一点巧克力做了热可可，温暖人心。',
  },
  {
    id: 'cook-9-follow',
    action: 'cook',
    title: '妈妈的温暖',
    description:
      '热可可的味道让你想起小时候，妈妈在冬天总是给你泡一杯。你闭上眼睛，仿佛能听到她的声音：“慢点喝，烫。”当你睁开眼睛，橙子正舔着洒在桌子上的可可，一脸幸福。',
    isFollowUp: true,
    triggerKey: 'cook-9',
  },
  {
    id: 'cook-10',
    action: 'cook',
    title: '烤鱼共享',
    description: '橙子叼来一条小鱼，你们一起分享了烤鱼。',
  },

  // 喝水事件 drink 1–10
  {
    id: 'drink-1',
    action: 'drink',
    title: '意外半瓶可乐',
    description: '发现半瓶遗忘在角落的可乐，如获至宝！',
  },
  {
    id: 'drink-2',
    action: 'drink',
    title: '铁锈味的水',
    description: '水里有奇怪的味道，可能是水管锈了。',
  },
  {
    id: 'drink-3',
    action: 'drink',
    title: '大自然的味道',
    description: '收集雨水，喝出了大自然的味道。',
  },
  {
    id: 'drink-4',
    action: 'drink',
    title: '最后一杯茶',
    description: '用茶包泡了最后一杯茶，仪式感十足。',
  },
  {
    id: 'drink-5',
    action: 'drink',
    title: '打翻的渴望',
    description: '不小心打翻水壶，损失惨重。',
  },
  {
    id: 'drink-6',
    action: 'drink',
    title: '爷爷的白酒',
    description: '找到爷爷藏的陈年白酒，喝了一口呛出眼泪。',
  },
  {
    id: 'drink-7',
    action: 'drink',
    title: '蒸馏实验成功',
    description: '尝试用蒸馏法净化水，成功获得半杯。',
  },
  {
    id: 'drink-7-follow',
    action: 'drink',
    title: '太阳能蒸馏器',
    description:
      '你改进了蒸馏装置，现在效率更高了。你甚至设计了一个利用太阳能的大型蒸馏器，每天都能获得稳定的干净水。李爷爷看到后大加赞赏，称你为“生存科学家”。',
    isFollowUp: true,
    triggerKey: 'drink-7',
  },
  {
    id: 'drink-8',
    action: 'drink',
    title: '爪子味的水',
    description: '橙子把爪子伸进你的水杯，你假装没看见。',
  },
  {
    id: 'drink-9',
    action: 'drink',
    title: '梦里的酸梅汤',
    description: '梦见喝到冰镇酸梅汤，醒来更渴了。',
  },
  {
    id: 'drink-10',
    action: 'drink',
    title: '吸管的童年感',
    description: '用捡到的吸管喝水，感觉自己像个孩子。',
  },

  // 逗猫事件 playWithCat 1–10
  {
    id: 'cat-1',
    action: 'playWithCat',
    title: '毛线球狂欢',
    description: '用毛线球和橙子玩，它玩得不亦乐乎。',
  },
  {
    id: 'cat-2',
    action: 'playWithCat',
    title: '猫毛大衣',
    description: '给橙子梳毛，收获“猫毛大衣”一件。',
  },
  {
    id: 'cat-2-follow',
    action: 'playWithCat',
    title: '猫毛帽',
    description:
      '你收集的猫毛团越来越多，决定做点什么。你用猫毛和旧毛衣线混纺，织了一顶帽子。虽然有点扎，但很暖和，而且有橙子的味道。',
    isFollowUp: true,
    triggerKey: 'cat-2',
  },
  {
    id: 'cat-3',
    action: 'playWithCat',
    title: '握手失败',
    description: '尝试教橙子握手，它用看智障的眼神看你。',
  },
  {
    id: 'cat-4',
    action: 'playWithCat',
    title: '看不见的角落',
    description: '橙子突然对着空无一人的角落哈气，毛骨悚然。',
  },
  {
    id: 'cat-4-follow',
    action: 'playWithCat',
    title: '祖宅的脚步声',
    description:
      '从那天起，你偶尔会感觉有人在注视你。晚上睡觉时，听到细微的脚步声，但起来查看却什么都没有。橙子总是盯着同一个角落，你开始怀疑这个祖宅是不是不干净。',
    isFollowUp: true,
    triggerKey: 'cat-4',
  },
  {
    id: 'cat-5',
    action: 'playWithCat',
    title: '阳光与呼噜',
    description: '抱着橙子晒太阳，它发出呼噜声。',
  },
  {
    id: 'cat-6',
    action: 'playWithCat',
    title: '蟑螂礼物',
    description: '橙子抓了一只蟑螂送给你，不知道该哭还是笑。',
  },
  {
    id: 'cat-7',
    action: 'playWithCat',
    title: '智能猫',
    description: '发现橙子会开关收音机，它成精了？',
  },
  {
    id: 'cat-7-follow',
    action: 'playWithCat',
    title: '按键小天才',
    description:
      '你开始测试橙子的智力。你教它用爪子按按钮来获取食物。经过一周的训练，它学会了按特定的按钮来播放音乐。现在，它会在想听音乐时自己去按收音机。',
    isFollowUp: true,
    triggerKey: 'cat-7',
  },
  {
    id: 'cat-8',
    action: 'playWithCat',
    title: '橙董事',
    description: '给橙子起外号“橙董事”，你是它的打工人。',
  },
  {
    id: 'cat-9',
    action: 'playWithCat',
    title: '神秘代码',
    description: '橙子突然跳到你键盘上（如果有的话），打出一串乱码。',
  },
  {
    id: 'cat-9-follow',
    action: 'playWithCat',
    title: '爷爷的秘密地图',
    description:
      '你研究这串乱码，发现它竟然是一个坐标。按照坐标，你在祖宅后院挖出了一个铁盒，里面有一张地图。地图上标记了几个地点，似乎是爷爷留下的秘密储备点。',
    isFollowUp: true,
    triggerKey: 'cat-9',
  },
  {
    id: 'cat-10',
    action: 'playWithCat',
    title: '永远的窗帘后面',
    description: '和橙子玩捉迷藏，它永远藏在窗帘后面。',
  },

  // 看书事件 read 1–10
  {
    id: 'read-1',
    action: 'read',
    title: '野外生存手册',
    description: '读《野外生存手册》，学到有用知识。',
  },
  {
    id: 'read-1-follow',
    action: 'read',
    title: '捕鸟与识菜',
    description:
      '你学会了制作简易的捕鸟陷阱和识别可食用植物。你开始在周边设置陷阱，每天都能抓到一两只鸟。橙子对你的新技能很满意，因为它也能分到一点肉。',
    isFollowUp: true,
    triggerKey: 'read-1',
  },
  {
    id: 'read-2',
    action: 'read',
    title: '言情小说的眼泪',
    description: '找到一本言情小说，为虚构的爱情流泪。',
  },
  {
    id: 'read-3',
    action: 'read',
    title: '资本论时间',
    description: '读《资本论》，思考末日中的经济体系。',
  },
  {
    id: 'read-4',
    action: 'read',
    title: '刃牙热血',
    description: '漫画书！《刃牙》让你热血沸腾！',
  },
  {
    id: 'read-5',
    action: 'read',
    title: '周易入门失败',
    description: '《周易》读不懂，但觉得很高深。',
  },
  {
    id: 'read-5-follow',
    action: 'read',
    title: '占卜的雨',
    description:
      '你开始对神秘学产生兴趣，收集了一些相关的书籍。一天晚上，你尝试用《周易》中的方法占卜明天的天气。结果第二天真的如占卜所示下雨了，你不知道是巧合还是什么。',
    isFollowUp: true,
    triggerKey: 'read-5',
  },
  {
    id: 'read-6',
    action: 'read',
    title: '烹饪书看图解馋',
    description: '烹饪书，看着图片解馋。',
  },
  {
    id: 'read-7',
    action: 'read',
    title: '小学日记',
    description: '找到自己小学日记，尴尬到脚趾抠地。',
  },
  {
    id: 'read-8',
    action: 'read',
    title: '如何与猫对话',
    description: '《如何与猫对话》，你认真地学习了第一章。',
  },
  {
    id: 'read-8-follow',
    action: 'read',
    title: '给猫读书',
    description:
      '你尝试用书中的方法与橙子交流。虽然它不一定听懂，但它似乎很享受你的关注。现在，它会在你读书时趴在书上，让你读给它听。',
    isFollowUp: true,
    triggerKey: 'read-8',
  },
  {
    id: 'read-9',
    action: 'read',
    title: '民兵军事训练手册',
    description: '《民兵军事训练手册》，实用！',
  },
  {
    id: 'read-10',
    action: 'read',
    title: '末日日记本',
    description: '空白笔记本，你开始写自己的末日日记。',
  },
  {
    id: 'read-10-follow',
    action: 'read',
    title: '日记与爪印',
    description:
      '写日记成了你每天的习惯。你记录生存的点滴，也记录心情。偶尔翻看之前的日记，你会发现自己的成长和变化。橙子有时会在日记本上留下爪印，你把它也记录进去。',
    isFollowUp: true,
    triggerKey: 'read-10',
  },

  // 休息事件 rest 1–10
  {
    id: 'rest-1',
    action: 'rest',
    title: '难得好觉',
    description: '难得的好觉，没有做噩梦。',
  },
  {
    id: 'rest-2',
    action: 'rest',
    title: '旧生活的梦',
    description: '梦见以前的生活，醒来时枕头湿了。',
  },
  {
    id: 'rest-3',
    action: 'rest',
    title: '猫压床',
    description: '橙子压在你胸口，鬼压床体验。',
  },
  {
    id: 'rest-4',
    action: 'rest',
    title: '半睡半醒的耳语',
    description: '半睡半醒间听到有人说话，可能是幻觉。',
  },
  {
    id: 'rest-4-follow',
    action: 'rest',
    title: '爷爷种的树',
    description:
      '你开始频繁地做梦，梦到祖宅的过去。你看到爷爷年轻时的样子，他在院子里种下一棵树。醒来后，你发现那棵树确实存在，已经枯死了。',
    isFollowUp: true,
    triggerKey: 'rest-4',
  },
  {
    id: 'rest-5',
    action: 'rest',
    title: '失眠之夜',
    description: '想到明天还要生存，失眠了。',
  },
  {
    id: 'rest-6',
    action: 'rest',
    title: '数羊到一千',
    description: '数羊数到第1000只，终于睡着。',
  },
  {
    id: 'rest-7',
    action: 'rest',
    title: '末日生日',
    description: '突然想起今天是末日前的生日。',
  },
  {
    id: 'rest-7-follow',
    action: 'rest',
    title: '自我庆祝',
    description:
      '你决定给自己过个生日。你用最后的糖做了个小蛋糕。橙子和阿黄围在你身边，你许了个愿：希望明年还能过生日。虽然孤独，但这个生日让你感到温暖。',
    isFollowUp: true,
    triggerKey: 'rest-7',
  },
  {
    id: 'rest-8',
    action: 'rest',
    title: '枪声惊醒',
    description: '睡得正香被远处枪声惊醒。',
  },
  {
    id: 'rest-9',
    action: 'rest',
    title: '梦里的火锅',
    description: '在梦中吃到火锅，幸福。',
  },
  {
    id: 'rest-10',
    action: 'rest',
    title: '还能多活一周',
    description: '休息得很好，感觉能多活一周。',
  },
]

/**
 * exploreRandomEvents
 * Random events for three danger tiers of exploration:
 * - "suburb": 近郊 / 低危险
 * - "city": 城区 / 中危险
 * - "mall": 购物中心 / 高危险
 */
export const exploreRandomEvents: ExploreEvent[] = [
  // 近郊 / 低等级事件 suburb
  {
    id: 'suburb-1',
    level: 'suburb',
    title: '废弃露营帐篷',
    description: '发现一个废弃的露营帐篷，里面有几包过期饼干。',
  },
  {
    id: 'suburb-2',
    level: 'suburb',
    title: '迷路的老人',
    description: '遇到一个迷路的老人，你分了他一点水。',
  },
  {
    id: 'suburb-3',
    level: 'suburb',
    title: '抢劫松鼠',
    description: '在树洞里找到松鼠藏的坚果，你抢劫了松鼠。',
  },
  {
    id: 'suburb-4',
    level: 'suburb',
    title: '清澈小溪',
    description: '发现一条清澈的小溪，你装满了水壶。',
  },
  {
    id: 'suburb-5',
    level: 'suburb',
    title: '坏掉的捕兽夹',
    description: '踩到捕兽夹，还好是坏的。',
  },
  {
    id: 'suburb-6',
    level: 'suburb',
    title: '被遗弃的相册',
    description: '找到一本被遗弃的相册，里面是一家三口的照片。',
  },
  {
    id: 'suburb-7',
    level: 'suburb',
    title: '汽车里的老歌',
    description: '废弃的汽车里，收音机还在播放老歌。',
  },
  {
    id: 'suburb-8',
    level: 'suburb',
    title: '狗带路',
    description: '遇到一只友好的狗，它带你找到一箱罐头。',
  },
  {
    id: 'suburb-9',
    level: 'suburb',
    title: '幸存的菜园',
    description: '发现一个菜园，西红柿居然还活着！',
  },
  {
    id: 'suburb-10',
    level: 'suburb',
    title: '摔进浅坑',
    description: '掉进一个浅坑，摔得满身泥。',
  },
  {
    id: 'suburb-11',
    level: 'suburb',
    title: '池塘钓鱼',
    description: '找到钓鱼竿，在池塘边钓到一条鱼。',
  },
  {
    id: 'suburb-12',
    level: 'suburb',
    title: '孩子的树屋',
    description: '发现一个孩子的树屋，里面有玩具和漫画。',
  },
  {
    id: 'suburb-13',
    level: 'suburb',
    title: '拾荒者交易',
    description: '遇到拾荒者，他用一瓶水换你的打火机。',
  },
  {
    id: 'suburb-14',
    level: 'suburb',
    title: '只有蚊子包',
    description: '什么也没找到，除了蚊子包。',
  },
  {
    id: 'suburb-15',
    level: 'suburb',
    title: '上锁的地下室',
    description: '发现地下室的入口，锁着，需要工具打开。',
  },

  // 城区 / 中等级事件 city
  {
    id: 'city-1',
    level: 'city',
    title: '废弃超市的酒',
    description: '废弃超市里，货架基本空了，但在角落找到几瓶酒。',
  },
  {
    id: 'city-2',
    level: 'city',
    title: '警惕的幸存者小队',
    description:
      '遇到其他幸存者小队，他们警惕地看着你，快速离开了。',
  },
  {
    id: 'city-3',
    level: 'city',
    title: '药店残骸',
    description: '发现药店，大部分药被抢空，但你还是找到了一些抗生素。',
  },
  {
    id: 'city-4',
    level: 'city',
    title: '图书馆里的百科全书',
    description: '图书馆里，你找到了《末日生存百科全书》。',
  },
  {
    id: 'city-5',
    level: 'city',
    title: '衣柜里的孩子',
    description:
      '听到哭声，是一个躲在衣柜里的孩子。你需要决定是带他回安全处，还是留下食物离开。',
  },
  {
    id: 'city-6',
    level: 'city',
    title: '健身房重启',
    description: '健身房，器材还在，你锻炼了一会儿。',
  },
  {
    id: 'city-7',
    level: 'city',
    title: '会说“你好”的鹦鹉',
    description: '宠物店，笼子都打开了，一只鹦鹉对你说：“你好”。',
  },
  {
    id: 'city-8',
    level: 'city',
    title: '五金店的宝藏',
    description: '五金店，找到有用的工具。',
  },
  {
    id: 'city-9',
    level: 'city',
    title: '一个人的电影院',
    description: '电影院，你一个人看了半场没放完的电影。',
  },
  {
    id: 'city-10',
    level: 'city',
    title: '医院手术室',
    description: '医院，在手术室找到医疗用品。',
  },
  {
    id: 'city-11',
    level: 'city',
    title: '警局的手铐',
    description: '警察局，枪械库空了，但在办公室找到手铐。',
  },
  {
    id: 'city-12',
    level: 'city',
    title: '末日先知',
    description:
      '遇到一个自称“先知”的人，他说灾难是净化。你一边听一边分不清他到底是疯了还是看得更清楚。',
  },
  {
    id: 'city-13',
    level: 'city',
    title: '自动售货机奇遇',
    description: '发现一个还在运作的自动售货机，用硬币买了可乐。',
  },
  {
    id: 'city-14',
    level: 'city',
    title: '被洗劫干净',
    description: '什么也没找到，这里被搜刮得太干净了。',
  },
  {
    id: 'city-15',
    level: 'city',
    title: '上锁的保险箱',
    description: '发现一个上锁的保险箱，需要密码。',
  },

  // 购物中心 / 高等级事件 mall
  {
    id: 'mall-1',
    level: 'mall',
    title: '奢侈品店的钻石',
    description: '奢侈品店，钻石珠宝散落一地，你抓了一把。',
  },
  {
    id: 'mall-2',
    level: 'mall',
    title: '子弹雨的边缘',
    description: '遇到武装团伙，你躲得快，捡到他们掉落的弹药。',
  },
  {
    id: 'mall-3',
    level: 'mall',
    title: '冰箱里的牛排',
    description: '高档餐厅厨房，冰箱还在运作！里面有牛排！',
  },
  {
    id: 'mall-4',
    level: 'mall',
    title: '精装书集',
    description: '书店里，你找到限量版精装书，很重但你想带走。',
  },
  {
    id: 'mall-5',
    level: 'mall',
    title: '放映室的梦',
    description: '电影院后台，找到完整的放映设备和胶片。',
  },
  {
    id: 'mall-6',
    level: 'mall',
    title: '熊玩偶的拥抱',
    description: '玩具店，你抱着等身熊玩偶睡了一觉。',
  },
  {
    id: 'mall-7',
    level: 'mall',
    title: '守金老人',
    description: '遇到一个老人守着金店，他说“钱没用了，但金子永恒”。',
  },
  {
    id: 'mall-8',
    level: 'mall',
    title: '复合弓',
    description: '体育用品店，找到复合弓和箭。',
  },
  {
    id: 'mall-9',
    level: 'mall',
    title: '手工首饰',
    description: '珠宝店工作台，你尝试自己做首饰，成果出奇地不错。',
  },
  {
    id: 'mall-10',
    level: 'mall',
    title: '避难所样板间',
    description: '发现一个完整的末日避难所展示厅，很有参考价值。',
  },
  {
    id: 'mall-11',
    level: 'mall',
    title: '末日派对',
    description:
      '遇到一群人在举行“末日派对”，灯光昏暗，音乐嘈杂，他们邀请你加入这个荒诞的狂欢。',
  },
  {
    id: 'mall-12',
    level: 'mall',
    title: '刚被洗劫过',
    description: '什么也没找到，这里刚被洗劫过，地上还留着新鲜的脚印和血迹。',
  },
  {
    id: 'mall-13',
    level: 'mall',
    title: '加密储物柜',
    description: '发现一个加密的储物柜，旁边留着一个谜题，似乎是密码的线索。',
  },
  {
    id: 'mall-14',
    level: 'mall',
    title: '禁书《如何统治末日世界》',
    description: '书店密室，找到禁书《如何统治末日世界》。',
  },
  {
    id: 'mall-15',
    level: 'mall',
    title: '观景台的哲思',
    description: '最高层的观景台，你看着破败的城市，感慨万千。',
  },
]

/**
 * npcDoorEvents
 * Social “NPC knocks on the door” events, each with a description and
 * optional help/refuse outcome texts for flavor.
 */
export const npcDoorEvents: NpcDoorEvent[] = [
  {
    id: 'npc-1-stranger',
    title: '受伤的陌生人',
    description:
      '敲门声响起。透过猫眼，你看到一个手臂受伤的年轻人。他虚弱地说：“拜托...我被抢劫了...有水吗？”',
    helpOutcome: '你把他请进屋里，简单包扎了伤口，分给他一点水。他连声道谢，离开前含糊地说了声：“以后...我会回报你的。”',
    refuseOutcome: '你假装没听见。整晚，你都能听到门外断断续续的呻吟声，直到再也没有动静。',
  },
  {
    id: 'npc-2-mother-baby',
    title: '母亲与孩子',
    description:
      '一个抱着婴儿的女人站在门口，婴儿在哭泣。“求您...一点点食物...为了孩子...”她的声音发抖。',
    helpOutcome: '你把仅有的一点食物分给她们。婴儿吃饱后不再哭闹，女人含泪向你鞠躬，离开时一再道谢。',
    refuseOutcome: '你关掉灯，假装家里没人。女人在门口站了很久，婴儿的哭声在走廊里回荡，渐渐远去。',
  },
  {
    id: 'npc-3-old-neighbor',
    title: '曾经的邻居',
    description:
      '“嘿！是我，楼下老王！还记得吗？”门外的人笑着说。他看起来状态不错，背着个大背包，眼神却有些游移不定。',
    helpOutcome: '你打开门，和他寒暄了一会儿。他告诉你附近几个资源点的位置，又神神秘秘地说：“小心一点，这一带最近不太平。”',
    refuseOutcome: '你没开门，只从猫眼看着他。他沉默片刻，摇摇头走了。你总觉得，可能错过了什么。',
  },
  {
    id: 'npc-4-preacher',
    title: '传教士',
    description:
      '“兄弟，灾难是上帝的审判！加入我们，得永生！”一个面容憔悴的男人举着一本小册子，眼神炽热。',
    helpOutcome:
      '你让他进来，听他说教一个小时。他滔滔不绝地讲述末日预言，走前留下了一本印着奇怪标志的小册子。',
    refuseOutcome: '你拒绝了他。他在门外大声念叨了半小时诅咒和祷告，最终愤愤离开。',
  },
  {
    id: 'npc-5-merchant',
    title: '商人',
    description:
      '“以物易物！我有好东西！”一个背着大包的人敲门，兴奋地展示背包里各种物品。',
    helpOutcome: '你把他请进屋，简单谈判后，用一些你暂时不用的东西换来了看起来很有用的货物。',
    refuseOutcome: '你选择不交易。他耸耸肩，转身去敲别人的门。',
  },
  {
    id: 'npc-6-soldier',
    title: '士兵',
    description:
      '一个穿着破旧军装的人站在门口，神情疲惫。“我在寻找幸存者...你有见到其他人吗？”',
    helpOutcome: '你告诉了他附近你遇到过的几拨人。他点点头，掏出一张皱巴巴的简易地图：“小心，这里最近不太安全。”',
    refuseOutcome: '你保持沉默。他看了门一眼，敬了个不太标准的军礼，转身离开在雨中的街道。',
  },
  {
    id: 'npc-7-madman',
    title: '精神失常者',
    description:
      '“它们在看着我们！墙上！天花板上！”一个眼神涣散的人在门外手舞足蹈，嘴里嘟囔着听不懂的话。',
    helpOutcome:
      '你勉强让他进来，给了点水和食物。整个过程你都被他的胡言乱语搞得头皮发麻。他离开前，塞给你一张画满奇怪符号的纸。',
    refuseOutcome: '你不敢开门。他在门外尖叫、咒骂、哭泣，持续了很久，最终声音沙哑地消失在远处。',
  },
  {
    id: 'npc-8-child-ball',
    title: '孩子与球',
    description:
      '一个脏兮兮的小男孩站在门外，怯生生地说：“我的球掉进你家院子了...”',
    helpOutcome: '你帮他找回了球，他高兴得在院子里转圈。离开时，他对你挥手，大声说：“谢谢叔叔！”。',
    refuseOutcome: '你装作没听见。男孩的眼睛慢慢失去光彩，低着头离开，抽泣声在楼道回响。',
  },
  {
    id: 'npc-9-old-man',
    title: '孤独的老人',
    description:
      '白发苍苍的老人敲响了你的门。“年轻人...能陪我说话吗？很久没人说话了。”',
    helpOutcome:
      '你让他坐下，他给你讲起年轻时候的故事：战乱、饥荒、爱情和遗憾。分别时，他轻轻拍了拍你的肩膀：“你会挺过去的。”',
    refuseOutcome: '你拒绝了他。他在门口站了一会儿，转身离开，背影比来时更佝偻。',
  },
  {
    id: 'npc-10-thief',
    title: '小偷',
    description:
      '半夜撬锁声！你惊醒，看到一个人影正试图翻窗进来。',
    helpOutcome:
      '你冲出去将他制住，经过一番混乱之后，他丢下几样东西狼狈逃走。你既庆幸又后怕。',
    refuseOutcome: '你选择躲在暗处，任由他进屋翻找。天亮后，你发现一些东西不见了，心里说不出的难过。',
  },
  {
    id: 'npc-11-pet-lover',
    title: '动物保护者',
    description:
      '“我找不到我的狗了...它叫幸运，棕色的...”一个焦急的人拿着一张印着狗照片的纸在门口徘徊。',
    helpOutcome: '你决定帮他一起找狗。几个小时后，你们终于在一辆翻倒的车旁找到瑟瑟发抖的幸运。重逢的一刻，比任何语言都更温暖。',
    refuseOutcome: '你摇摇头。他失望地离开，时不时还回头看你的窗户。',
  },
  {
    id: 'npc-12-sick-man',
    title: '病人',
    description:
      '门外传来剧烈的咳嗽声。“我病了...不是那种病...只是普通感冒...有药吗？”',
    helpOutcome:
      '你翻出珍贵的药品给他。他接过药时手都在抖，一边咳一边说着“谢谢”。临走前，他很认真地向你鞠了一躬。',
    refuseOutcome: '你担心被传染，只能隔着门让他离开。他的咳嗽声渐行渐远，你胸口却越发沉重。',
  },
  {
    id: 'npc-13-artist',
    title: '艺术家',
    description:
      '“我想为末日作画，能让我看看你的视角吗？”一个背着画板的人站在门口，眼神认真。',
    helpOutcome:
      '你带他上了屋顶，他画下了废墟、天空，还有你和橙子的背影。离开前，他把一幅素描递给你：“证明我们来过。”',
    refuseOutcome: '你不想分心，他遗憾地离开。之后很多天，每当你看向窗外，都会想起那个背着画板的身影。',
  },
  {
    id: 'npc-14-sibling-search',
    title: '寻找亲人者',
    description:
      '“我的妹妹...她叫小雨...16岁...见过吗？”一个瘦削的青年拿出一张已经褪色的照片，眼神里全是期待。',
    helpOutcome:
      '你告诉他你认识的小雨，并尽可能给出线索和方向。他紧紧握着你的手：“谢谢你，至少让我知道她可能还活着。”',
    refuseOutcome: '你摇头说没见过，即使你心里隐约有些印象。他沉默地收起照片，背影被绝望压得更低。',
  },
  {
    id: 'npc-15-ex-raider',
    title: '投降的掠夺者',
    description:
      '“我...我不干了...他们太残忍了...能收留我吗？”一个衣衫褴褛的人跪在门口，身上还有旧帮派的标记。',
    helpOutcome:
      '你决定给他一个机会。屋里的人都很紧张，但他表现得小心翼翼，甚至主动做最累的活儿来证明自己。',
    refuseOutcome: '你拒绝了他。他抬头看了你很久，最终什么也没说，转身离开在风中的街道。',
  },
  {
    id: 'npc-16-scientist',
    title: '科学家',
    description:
      '“我在研究灾难原因，需要一些样本...”一个戴着眼镜、精神略显恍惚的人站在门口，手里拿着试剂盒。',
    helpOutcome:
      '你让他采集了一些水样和土壤样本。他做完记录后，留给你一份简短的研究报告：“如果还能见面，也许会有更多答案。”',
    refuseOutcome: '你不打算卷入这些麻烦，他有些失落地离开，嘴里还念叨着什么数据和变量。',
  },
  {
    id: 'npc-17-farmer',
    title: '农民',
    description:
      '“我有种子，但没地方种...你有空地吗？”一个满手老茧的中年人腼腆地问。',
    helpOutcome:
      '你带他看了院子和后院。他兴奋地蹲下摸土，喃喃道：“还行，还能种。”不久之后，地里多出了整齐的小苗。',
    refuseOutcome: '你摇摇头。他叹了口气，背着沉甸甸的种子离开，背影有些孤单。',
  },
  {
    id: 'npc-18-teacher',
    title: '老师',
    description:
      '“知识不能失传...我在教孩子们...有书吗？”一个戴着旧眼镜的中年人小心翼翼地敲门。',
    helpOutcome:
      '你把能用的书都整理出来交给他。他像拿着珍宝一样抱在怀里：“谢谢，你救的不是我，是以后所有的孩子。”',
    refuseOutcome: '你说自己也需要这些书，他点点头表示理解，却在转身时明显有些失落。',
  },
  {
    id: 'npc-19-musician',
    title: '音乐家',
    description:
      '“音乐是最后的救赎...能听我演奏吗？”一个抱着吉他的人站在门口，衣衫破旧，却小心地护着乐器。',
    helpOutcome:
      '你让他进来。他在昏黄灯光下弹了一曲，又一曲。那一小时里，你几乎忘了外面是末日。分别时，你们谁都没有多说什么。',
    refuseOutcome: '你说现在不合适。他点点头，转身在楼道里轻轻弹起了几下，音符像是留给你的告别。',
  },
  {
    id: 'npc-20-mysterious',
    title: '谜一样的人',
    description:
      '一个全身黑衣、看不清脸的人站在门口，只说了一句话：“45周后，一切将见分晓。”然后在门口放下一个包裹，转身离开。',
    helpOutcome:
      '你打开包裹，里面是杂乱却实用的物资，还有一张没有署名的小纸条： “记得活到那一天。”',
  },
]