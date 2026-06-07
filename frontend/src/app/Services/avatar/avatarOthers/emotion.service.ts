import { Injectable } from '@angular/core';
import { EmotionType } from '../../../Model/emotion.model';

// Facial expressions mapping
const FACIAL_EXPRESSIONS: { [key: string]: { [key: string]: number } } = {
  default: {},
  smile: {
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    cheekPuff: 0.5,
    browInnerUp: 0.3,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    browDownLeft: 0.7,
    browDownRight: 0.7,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
  },
  surprised: {
    eyeWideLeft: 1,
    eyeWideRight: 1,
    jawOpen: 0.6,
    browOuterUpLeft: 1,
    browOuterUpRight: 1,
    mouthFunnel: 0.5,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    mouthShrugLower: 0.8,
    noseSneerLeft: 0.7,
    noseSneerRight: 0.7,
  },
  thinking: {
    jawForward: 0.6,
    browInnerUp: 0.5,
    mouthPucker: 0.7,
    eyeLookUpLeft: 0.3,
    eyeLookUpRight: 0.3,
  },
};

@Injectable({
  providedIn: 'root',
})
export class EmotionService {
  private model: any = null;
  private morphTargetValues: { [key: string]: number } = {};
  private currentEmotion: EmotionType = 'NEUTRAL';

  constructor() {}

  /**
   * Set the model reference for applying emotions
   */
  setModel(model: any): void {
    this.model = model;
  }

  /**
   * Set current morph target values tracking
   */
  setMorphTargetValues(values: { [key: string]: number }): void {
    this.morphTargetValues = values;
  }

  /**
   * Apply emotion to avatar (changes facial expression)
   */
  applyEmotion(emotion: EmotionType): void {
    if (!this.model) {
      console.warn('⚠️ Model not loaded yet');
      return;
    }

    console.log('🎭 Applying emotion:', emotion);
    this.currentEmotion = emotion;

    // Reset all morphs to 0
    this.resetMorphs();

    // Map EmotionType to facial expression key
    const emotionMap: { [key in EmotionType]: string } = {
      HAPPY: 'smile',
      SAD: 'sad',
      CONFUSED: 'thinking',
      EXCITED: 'smile',
      THINKING: 'thinking',
      NEUTRAL: 'default',
    };

    const expressionKey = emotionMap[emotion] || 'default';
    const expression = FACIAL_EXPRESSIONS[expressionKey];

    if (expression) {
      console.log(`✅ Applying ${expressionKey} expression`);
      Object.entries(expression).forEach(([morphName, value]) => {
        this.setMorphInfluence(morphName, value);
      });
    }
  }

  /**
   * Set a specific morph target value
   */
  setMorphInfluence(morphName: string, value: number): void {
    this.morphTargetValues[morphName] = value;
    this.applyMorphToModel(morphName, value);
  }

  /**
   * Apply morph to model nodes
   */
  private applyMorphToModel(morphName: string, value: number): void {
    let found = false;

    this.model.traverse((node: any) => {
      if (node.morphTargetInfluences && node.morphTargetDictionary) {
        const morphIndex = node.morphTargetDictionary[morphName];

        if (morphIndex !== undefined) {
          node.morphTargetInfluences[morphIndex] = value;
          found = true;
        }
      }
    });

    if (!found) {
      console.warn(`⚠️ Morph target "${morphName}" not found in any node`);
    }
  }

  /**
   * Reset all morphs to 0
   */
  private resetMorphs(): void {
    this.model.traverse((node: any) => {
      if (node.morphTargetInfluences) {
        for (let i = 0; i < node.morphTargetInfluences.length; i++) {
          node.morphTargetInfluences[i] = 0;
        }
      }
    });

    // Reset tracking object
    Object.keys(this.morphTargetValues).forEach((key) => {
      this.morphTargetValues[key] = 0;
    });
  }

  /**
   * Get current emotion
   */
  getCurrentEmotion(): EmotionType {
    return this.currentEmotion;
  }

  /**
   * Get morph target values
   */
  getMorphTargetValues(): { [key: string]: number } {
    return this.morphTargetValues;
  }
}
