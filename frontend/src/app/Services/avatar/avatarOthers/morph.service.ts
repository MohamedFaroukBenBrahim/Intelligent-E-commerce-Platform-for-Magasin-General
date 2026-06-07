import { Injectable } from '@angular/core';

// Standard ARKit blend shape names
const STANDARD_SHAPE_KEYS = [
  'Basis',
  'eyeBlinkLeft',
  'eyeLookDownLeft',
  'eyeLookInLeft',
  'eyeLookOutLeft',
  'eyeLookUpLeft',
  'eyeSquintLeft',
  'eyeWideLeft',
  'eyeBlinkRight',
  'eyeLookDownRight',
  'eyeLookInRight',
  'eyeLookOutRight',
  'eyeLookUpRight',
  'eyeSquintRight',
  'eyeWideRight',
  'jawForward',
  'jawLeft',
  'jawRight',
  'jawOpen',
  'mouthClose',
  'mouthFunnel',
  'mouthPucker',
  'mouthRight',
  'mouthLeft',
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthFrownRight',
  'mouthFrownLeft',
  'mouthDimpleLeft',
  'mouthDimpleRight',
  'mouthStretchLeft',
  'mouthStretchRight',
  'mouthRollLower',
  'mouthRollUpper',
  'mouthPressLeft',
  'mouthPressRight',
  'mouthLowerDownLeft',
  'mouthLowerDownRight',
  'mouthUpperUpLeft',
  'mouthUpperUpRight',
  'browDownLeft',
  'browDownRight',
  'browInnerUp',
  'browOuterUpLeft',
  'browOuterUpRight',
  'cheekPuff',
  'cheekSquintLeft',
  'cheekSquintRight',
  'noseSneerLeft',
  'noseSneerRight',
  'tongueOut',
  'mouthShrugLower',
  'mouthShrugUpper',
];

@Injectable({
  providedIn: 'root',
})
export class MorphTargetService {
  private model: any = null;
  private availableMorphTargets: string[] = [];
  private morphTargetValues: { [key: string]: number } = {};

  constructor() {}

  /**
   * Set the model reference
   */
  setModel(model: any): void {
    this.model = model;
  }

  /**
   * Inspect and extract morph targets from model
   */
  inspectMorphTargets(): {
    available: string[];
    values: { [key: string]: number };
  } {
    console.log('🔍 Starting morphTarget inspection...');
    let bestMatch: any = null;
    let bestMatchCount = 0;

    this.model.traverse((node: any) => {
      if (node.morphTargetInfluences) {
        const dict = node.morphTargetDictionary || {};
        const morphCount = Object.keys(dict).length;


        // Keep the node with the most facial morphs
        if (morphCount >= 52 && morphCount > bestMatchCount) {
          bestMatchCount = morphCount;
          bestMatch = { node, dict };
        }
      }
    });

    if (bestMatch) {
      console.log('✅ Using main facial mesh:', bestMatch.node.name);

      // Filter standard shape keys against available morphs
      this.availableMorphTargets = STANDARD_SHAPE_KEYS.filter(
        (key) => key in bestMatch.dict || key === 'Basis',
      );

      this.availableMorphTargets.forEach((morphName) => {
        this.morphTargetValues[morphName] = 0;
      });

      console.log(
        '✅ Setup complete. Total morph targets:',
        this.availableMorphTargets.length,
      );

      return {
        available: this.availableMorphTargets,
        values: this.morphTargetValues,
      };
    } else {
      console.error('❌ NO FACIAL MORPH TARGETS FOUND IN MODEL!');
      return {
        available: [],
        values: {},
      };
    }
  }

  /**
   * Get available morph target names
   */
  getAvailableMorphTargets(): string[] {
    return this.availableMorphTargets;
  }

  /**
   * Get morph target values
   */
  getMorphTargetValues(): { [key: string]: number } {
    return this.morphTargetValues;
  }

  /**
   * Update morph target value
   */
  setMorphValue(morphName: string, value: number): void {
    this.morphTargetValues[morphName] = value;
    this.applyMorphToModel(morphName, value);
  }

  /**
   * Apply morph to model
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
  resetAllMorphs(): void {
    this.model.traverse((node: any) => {
      if (node.morphTargetInfluences) {
        for (let i = 0; i < node.morphTargetInfluences.length; i++) {
          node.morphTargetInfluences[i] = 0;
        }
      }
    });

    Object.keys(this.morphTargetValues).forEach((key) => {
      this.morphTargetValues[key] = 0;
    });
  }
}
