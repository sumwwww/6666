/**
 * src/game/data/achievements.ts
 * Achievement definitions with how-to-get descriptions.
 */

import type { Achievement } from '../types'

/**
 * achievements
 * Achievements reflected in the design document.
 */
export const achievements: Achievement[] = [
  {
    id: 'funny-shout',
    name: '搞笑成就·阿斯达克吼',
    howToGet:
      '在锻炼事件中多次模仿李小龙的叫声，成功惊动橙子和你的水壶。',
    flavor: '有的人靠武器提升战力，你靠声带。',
  },
  {
    id: 'self-love',
    name: '自恋属性解锁',
    howToGet:
      '在镜子前反复欣赏自己的肌肉线条，并且由衷觉得“还行”。',
    flavor: '末日里，爱自己是最低成本的奢侈品。',
  },
  {
    id: 'science-survivor',
    name: '生存科学家',
    howToGet:
      '通过蒸馏和太阳能装置解决长期饮水问题，让李爷爷都佩服不已。',
    flavor: '当别人相信奇迹时，你选择相信物理和化学。',
  },
  {
    id: 'sweet-memory',
    name: '甜蜜回忆',
    howToGet: '用最后一点巧克力做一杯热可可，想起妈妈的声音。',
    flavor: '糖分会消失，记忆不会。',
  },
  {
    id: 'doom-birthday',
    name: '末日生日',
    howToGet:
      '在末日依然给自己过生日，哪怕蛋糕只有一口甜，蜡烛只有一根火光。',
    flavor: '世界未必记得这一天，你记得就够了。',
  },
  {
    id: 'future-hope',
    name: '未来希望',
    howToGet:
      '在老师 NPC 敲门时提供书本，让知识在废墟中继续流传下去。',
    flavor: '文明的备份，不在云端，在人心里。',
  },
  {
    id: 'cat-servant',
    name: '猫的仆人',
    howToGet:
      '疯狂逗猫 30 次以上，成功把人生主线改写成《橙子的打工人》。',
    flavor: '不是你在末日养猫，是猫在末日收留了你。',
  },
]