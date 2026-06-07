import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class BoneService {
  private rootBone: THREE.Bone | null = null;
  private rootBoneInitialPosition = new THREE.Vector3();

  constructor() {}

  findAndLockBones(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.skeleton) {
        const bones = child.skeleton.bones;
        if (!this.rootBone) {
          const hips = bones.find(
            (b) =>
              b.name.toLowerCase().includes('hips') ||
              b.name.toLowerCase().includes('root'),
          );
          if (hips) {
            this.rootBone = hips;
            this.rootBoneInitialPosition.copy(hips.position);
            console.log(`🦴 Root bone locked: "${hips.name}"`);
          }
        }
      }
    });
  }

  restoreBones(): void {
    if (this.rootBone) {
      this.rootBone.position.y = this.rootBoneInitialPosition.y;
    }
  }

  hasRootBone(): boolean {
    return this.rootBone !== null;
  }
}
