/**
 * src/game/types.ts
 * Core type definitions for the "余生：暗影之下" text adventure game.
 */

export type Alignment = 'positive' | 'rational' | 'slack'

/**
 * GamePhase
 * A coarse-grained stage in a single week.
 */
export type GamePhase = 'story' | 'actions' | 'ended'

/**
 * WeeklyOption
 * Choice for a main weekly story node.
 */
export interface WeeklyOption {
  /** Option id, typically "A" | "B" | "C". */
  id: string
  /** Short label shown on the option button. */
  label: string
  /** Flavor description text shown under the label. */
  description: string
  /** Moral/attitude alignment of this option. */
  alignment: Alignment
}

/**
 * WeeklyStory
 * Main-line weekly story content with three options.
 */
export interface WeeklyStory {
  /** Week index, from 1 to 44. */
  week: number
  /** Title like "第1周：轰鸣之后". */
  title: string
  /** Full narrative text for this week. */
  body: string
  /** Available options for this week. */
  options: WeeklyOption[]
}

/**
 * EndingType
 * Category of game ending.
 */
export type EndingType = 'death' | 'easter' | 'extreme' | 'special' | 'normal'

/**
 * GameEnding
 * Single ending definition with condition hint and full narrative.
 */
export interface GameEnding {
  /** Unique id for internal reference. */
  id: string
  /** Display name of the ending. */
  name: string
  /** Category of the ending. */
  type: EndingType
  /** Human-readable condition description. */
  conditionText: string
  /** Full story text shown when the ending is reached. */
  body: string
}

/**
 * ItemRarity
 * Visual/semantic rarity tag for items.
 */
export type ItemRarity = 'basic' | 'advanced' | 'elite' | 'collectible'

/**
 * GameItem
 * Item definition for the inventory system.
 */
export interface GameItem {
  /** Unique id used in save data and lookups. */
  id: string
  /** Display name of the item. */
  name: string
  /** Category label, e.g. "食物/水", "药品". */
  category: string
  /** Rarity hint for styling. */
  rarity: ItemRarity
  /** Humorous description shown in item detail view. */
  description: string
}

/**
 * Achievement
 * Achievement definition with unlock hint and flavor text.
 */
export interface Achievement {
  /** Unique id used to track unlock state. */
  id: string
  /** Display name of the achievement. */
  name: string
  /** How to unlock this achievement, user-facing description. */
  howToGet: string
  /** Short flavor line shown on achievement card. */
  flavor: string
}

/**
 * DailyAction
 * All supported daily action keys for random events.
 */
export type DailyAction =
  | 'exercise'
  | 'cook'
  | 'drink'
  | 'playWithCat'
  | 'read'
  | 'rest'

/**
 * DailyEvent
 * Random event triggered by a daily action like exercise or rest.
 */
export interface DailyEvent {
  /** Unique id for this event. */
  id: string
  /** Which daily action can trigger this event. */
  action: DailyAction
  /** Short title for list / debug usage. */
  title: string
  /** Full descriptive text for the event (no pure mechanic lines). */
  description: string
  /**
   * Whether this event is a follow-up unlocked by a previous event.
   * Used purely for flavor / possible chaining.
   */
  isFollowUp?: boolean
  /**
   * Key pointing to the base event or condition that unlocks this one.
   * Not strictly required by current UI but useful for later logic.
   */
  triggerKey?: string
}

/**
 * ExploreDangerLevel
 * Danger tier for exploration random events.
 */
export type ExploreDangerLevel = 'suburb' | 'city' | 'mall'

/**
 * ExploreEvent
 * Random exploration event for map actions.
 */
export interface ExploreEvent {
  /** Unique id for the event. */
  id: string
  /** Danger tier: near suburb, city, or shopping mall. */
  level: ExploreDangerLevel
  /** One-line title for the event. */
  title: string
  /** Full descriptive text, including any inline choices text. */
  description: string
}

/**
 * NpcDoorEvent
 * NPC knocking-on-the-door social event.
 */
export interface NpcDoorEvent {
  /** Unique id of this NPC event. */
  id: string
  /** Short title like "受伤的陌生人". */
  title: string
  /** Narrative body text shown when the event triggers. */
  description: string
  /**
   * Text description of the "help" branch result.
   * Only descriptive text; numerical effects are handled elsewhere.
   */
  helpOutcome?: string
  /**
   * Text description of the "refuse / not help" branch result.
   * Only descriptive text; numerical effects are handled elsewhere.
   */
  refuseOutcome?: string
}